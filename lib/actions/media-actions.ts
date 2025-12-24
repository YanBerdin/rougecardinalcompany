"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { uploadMedia, deleteMedia, findMediaByHash, getMediaPublicUrl } from "@/lib/dal/media";
import type { MediaUploadResult } from "./types";

/**
 * @file Media Upload Server Actions
 * @description Server Actions for media uploads following CRUD pattern
 * @module lib/actions/media-actions
 * 
 * ARCHITECTURE:
 * - Server Actions call DAL functions (separation of concerns)
 * - revalidatePath() only in Server Actions (not in DAL)
 * - Validation before DAL call
 * - Generic upload function for all media types
 * 
 * USAGE:
 * - TeamMemberForm: uploadMediaImage(formData, "team")
 * - SpectacleForm: uploadMediaImage(formData, "spectacles")
 * - Press: uploadMediaImage(formData, "press")
 */

// =============================================================================
// CONSTANTS
// team=============================================================================

const BUCKET_NAME = "medias";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

type ValidationResult =
  | { success: true; file: File }
  | { success: false; error: string };

function validateFile(formData: FormData): ValidationResult {
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return { success: false, error: "Aucun fichier fourni" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "Fichier trop volumineux (max 5MB)" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      success: false,
      error: `Format non supporté. Acceptés: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  return { success: true, file };
}

async function getCurrentUserId(): Promise<string | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); //TODO: getClaims() ?
  return user?.id;
}

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * Upload media image to Storage and database
 * 
 * @param formData - FormData containing file field and optional fileHash
 * @param folder - Optional subfolder in bucket (default: "medias")
 * @returns MediaUploadResult with media ID, public URL, and isDuplicate flag
 */
export async function uploadMediaImage(
  formData: FormData,
  folder: string = BUCKET_NAME
): Promise<MediaUploadResult> {
  try {
    // 0. Auth check
    await requireAdmin();
    
    // 1. Validation
    const validation = validateFile(formData);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    // 2. Get current user
    const uploadedBy = await getCurrentUserId();

    // 3. Check for duplicate (if hash provided)
    const fileHash = formData.get("fileHash");

    if (fileHash && typeof fileHash === "string") {
      const existingMedia = await findMediaByHash(fileHash);

      if (existingMedia.success && existingMedia.data) {
        const publicUrl = await getMediaPublicUrl(existingMedia.data.storage_path);

        return {
          success: true,
          data: {
            mediaId: existingMedia.data.id,
            publicUrl,
            storagePath: existingMedia.data.storage_path,
            isDuplicate: true,
          },
        };
      }
    }

    // 4. Call DAL (no duplicate found)
    const result = await uploadMedia({
      file: validation.file,
      folder,
      uploadedBy,
      fileHash: typeof fileHash === "string" ? fileHash : undefined,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // 5. ✅ Revalidation (UNIQUEMENT dans Server Action)
    revalidatePath("/admin/medias");
    revalidatePath("/admin/team");
    revalidatePath("/admin/spectacles");

    return { success: true, data: result.data };
  } catch (error) {
    console.error("[uploadMediaImage] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Delete media from Storage and database
 * 
 * @param mediaId - ID from medias table
 * @returns MediaUploadResult
 */
export async function deleteMediaImage(
  mediaId: number
): Promise<MediaUploadResult> {
  try {
    // 1. Call DAL
    const result = await deleteMedia(mediaId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // 2. ✅ Revalidation (UNIQUEMENT dans Server Action)
    revalidatePath("/admin/medias");
    revalidatePath("/admin/team");
    revalidatePath("/admin/spectacles");

    return {
      success: true,
      data: {
        mediaId,
        publicUrl: "",
        storagePath: "",
      },
    };
  } catch (error) {
    console.error("[deleteMediaImage] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
