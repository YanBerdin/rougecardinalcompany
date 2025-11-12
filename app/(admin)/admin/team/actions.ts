"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  CreateTeamMemberInputSchema,
  UpdateTeamMemberInputSchema,
  ReorderTeamMembersInputSchema,
  type TeamMemberDb,
  type CreateTeamMemberInput,
  type UpdateTeamMemberInput,
} from "@/lib/schemas/team";
import {
  upsertTeamMember,
  reorderTeamMembers,
  fetchTeamMemberById,
  setTeamMemberActive,
} from "@/lib/dal/team";
import { requireAdmin } from "@/lib/auth/is-admin";

// ============================================================================
// Constants
// ============================================================================

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const CACHE_CONTROL_SECONDS = "3600";
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

// ============================================================================
// Types
// ============================================================================

type SuccessResponse<T> = {
  readonly success: true;
  readonly data: T;
};

type ErrorResponse = {
  readonly success: false;
  readonly error: string;
  readonly status?: number;
  readonly details?: unknown;
};

type ActionResponse<T> = SuccessResponse<T> | ErrorResponse;

type AllowedMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

// ============================================================================
// Exported Actions
// ============================================================================

export async function createTeamMember(
  input: unknown
): Promise<ActionResponse<TeamMemberDb>> {
  try {
    const validated: CreateTeamMemberInput =
      CreateTeamMemberInputSchema.parse(input);
    const result = await upsertTeamMember(validated);

    revalidatePath("/admin/team");

    if (!result?.success) {
      return {
        success: false,
        error: result?.error ?? "Failed to create team member",
        status: 500,
      };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    return handleActionError(error, "createTeamMember");
  }
}

export async function updateTeamMember(
  teamMemberId: number,
  updateInput: unknown
): Promise<ActionResponse<TeamMemberDb>> {
  try {
    if (!isValidTeamMemberId(teamMemberId)) {
      return { success: false, error: "Invalid id", status: 400 };
    }

    const validated: UpdateTeamMemberInput =
      UpdateTeamMemberInputSchema.parse(updateInput);
    const existing = await fetchTeamMemberById(teamMemberId);

    if (!existing) {
      return { success: false, error: "Team member not found", status: 404 };
    }

    const result = await upsertTeamMember({
      ...validated,
      id: teamMemberId,
    });

    revalidatePath("/admin/team");

    if (!result?.success) {
      return {
        success: false,
        error: result?.error ?? "Failed to update team member",
        status: 500,
      };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    return handleActionError(error, "updateTeamMember");
  }
}

export async function reorderTeamMembersAction(
  reorderInput: unknown
): Promise<ActionResponse<null>> {
  try {
    const validated = ReorderTeamMembersInputSchema.parse(reorderInput);
    const result = await reorderTeamMembers(validated);

    revalidatePath("/admin/team");

    if (!result?.success) {
      return {
        success: false,
        error: result?.error ?? "Failed to reorder team members",
        status: 500,
      };
    }

    return { success: true, data: null };
  } catch (error: unknown) {
    return handleActionError(error, "reorderTeamMembersAction");
  }
}

export async function setTeamMemberActiveAction(
  teamMemberId: number,
  isActiveStatus: boolean
): Promise<ActionResponse<null>> {
  try {
    if (!isValidTeamMemberId(teamMemberId)) {
      return { success: false, error: "Invalid team member id", status: 400 };
    }

    const result = await setTeamMemberActive(teamMemberId, isActiveStatus);
    revalidatePath("/admin/team");

    if (!result?.success) {
      return {
        success: false,
        error: result?.error ?? "Failed to set team member active flag",
        status: 500,
      };
    }

    return { success: true, data: null };
  } catch (error: unknown) {
    return handleActionError(error, "setTeamMemberActiveAction");
  }
}

export async function uploadTeamMemberPhoto(
  photoFormData: FormData
): Promise<ActionResponse<{ mediaId: number; publicUrl: string }>> {
  try {
    await requireAdmin();

    const uploadedFile = extractFileFromFormData(photoFormData);
    if (!uploadedFile.success) {
      return { success: false, error: uploadedFile.error, status: uploadedFile.status };
    }

    const validatedFile = validateImageFile(uploadedFile.data);
    if (!validatedFile.success) {
      return { success: false, error: validatedFile.error, status: validatedFile.status };
    }

    const uploadResult = await uploadFileToStorage(validatedFile.data);
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error, status: uploadResult.status };
    }

    const mediaResult = await createMediaRecord(
      uploadResult.data,
      validatedFile.data
    );
    if (!mediaResult.success) {
      await cleanupStorageFile(uploadResult.data.storagePath);
    }

    return mediaResult;
  } catch (error: unknown) {
    return handleActionError(error, "uploadTeamMemberPhoto");
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function isValidTeamMemberId(teamMemberId: number): boolean {
  return Number.isFinite(teamMemberId) && teamMemberId > 0;
}

function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as AllowedMimeType);
}

function extractFileFromFormData(formData: FormData): ActionResponse<File> {
  const uploadedFile = formData.get("file");

  if (!uploadedFile || !(uploadedFile instanceof File)) {
    return { success: false, error: "No file provided", status: 400 };
  }

  return { success: true, data: uploadedFile };
}

function validateImageFile(uploadedFile: File): ActionResponse<File> {
  if (uploadedFile.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: "File too large (max 5MB)",
      status: 400,
    };
  }

  if (!isAllowedMimeType(uploadedFile.type)) {
    return {
      success: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`,
      status: 400,
    };
  }

  return { success: true, data: uploadedFile };
}

async function uploadFileToStorage(
  uploadedFile: File
): Promise<ActionResponse<{ storagePath: string; publicUrl: string }>> {
  const uniqueFileName = generateUniqueFileName(
    uploadedFile.name,
    uploadedFile.type
  );
  const storageFilePath = `team-photos/${uniqueFileName}`;

  const { createClient } = await import("@/supabase/server");
  const supabaseClient = await createClient();

  const { error: storageUploadError } = await supabaseClient.storage
    .from("medias")
    .upload(storageFilePath, uploadedFile, {
      cacheControl: CACHE_CONTROL_SECONDS,
      upsert: false,
    });

  if (storageUploadError) {
    console.error("Storage upload error:", storageUploadError);
    return {
      success: false,
      error: `Upload failed: ${storageUploadError.message}`,
      status: 500,
    };
  }

  const { data: publicUrlData } = supabaseClient.storage
    .from("medias")
    .getPublicUrl(storageFilePath);

  return {
    success: true,
    data: {
      storagePath: storageFilePath,
      publicUrl: publicUrlData.publicUrl,
    },
  };
}

async function createMediaRecord(
  uploadData: { storagePath: string; publicUrl: string },
  originalFile: File
): Promise<ActionResponse<{ mediaId: number; publicUrl: string }>> {
  const { createClient } = await import("@/supabase/server");
  const supabaseClient = await createClient();

  const { data: createdMediaRecord, error: mediaInsertError } =
    await supabaseClient
      .from("medias")
      .insert({
        storage_path: uploadData.storagePath,
        filename: originalFile.name,
        mime: originalFile.type,
        size_bytes: originalFile.size,
        metadata: { bucket: "medias", type: "team_photo" },
      })
      .select()
      .single();

  if (mediaInsertError || !createdMediaRecord) {
    console.error("Media record insertion error:", mediaInsertError);
    return {
      success: false,
      error: "Failed to create media record",
      status: 500,
    };
  }

  return {
    success: true,
    data: {
      mediaId: createdMediaRecord.id,
      publicUrl: uploadData.publicUrl,
    },
  };
}

function generateUniqueFileName(
  originalFileName: string,
  mimeType: string
): string {
  const currentTimestamp = Date.now();
  const randomIdentifier = Math.random().toString(36).substring(2, 9);

  const extractedExtension = originalFileName.split(".").pop()?.toLowerCase();
  const extensionFromMime = mimeType.split("/")[1];
  const fileExtension = extractedExtension || extensionFromMime || "jpg";

  return `team-${currentTimestamp}-${randomIdentifier}.${fileExtension}`;
}

async function cleanupStorageFile(storagePath: string): Promise<void> {
  try {
    const { createClient } = await import("@/supabase/server");
    const supabaseClient = await createClient();

    await supabaseClient.storage.from("medias").remove([storagePath]);
  } catch (error: unknown) {
    console.error("Failed to cleanup storage file:", error);
    // Don't throw - cleanup is best effort
  }
}

function handleActionError(
  error: unknown,
  functionName: string
): ErrorResponse {
  console.error(`${functionName} error:`, error);

  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: "Validation failed",
      status: 422,
      details: error.issues,
    };
  }

  return {
    success: false,
    error:
      error instanceof Error ? error.message : String(error ?? "Unknown error"),
    status: 500,
  };
}
