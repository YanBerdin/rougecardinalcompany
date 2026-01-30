"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { env } from "@/lib/env";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { uploadMedia, deleteMedia, findMediaByHash, getMediaPublicUrl } from "@/lib/dal/media";
import { recordRequest } from "@/lib/utils/rate-limit";
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

    // 3. Rate limiting: 10 uploads per minute per user
    const rateLimitKey = `upload:${uploadedBy}`;
    const rateLimitResult = recordRequest(
      rateLimitKey,
      10, // max 10 uploads
      60 * 1000 // per 1 minute
    );

    if (!rateLimitResult.success) {
      const resetTime = rateLimitResult.resetAt.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        success: false,
        error: `Limite d'uploads atteinte (10/min). Réessayez après ${resetTime}.`,
      };
    }

    // 4. Check for duplicate (if hash provided)
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

    // 5. Call DAL (no duplicate found)
    const result = await uploadMedia({
      file: validation.file,
      folder,
      uploadedBy,
      fileHash: typeof fileHash === "string" ? fileHash : undefined,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // 6. ⚠️ PATTERN WARNING: Non-blocking thumbnail generation
    // Upload succeeds even if thumbnail generation fails
    let thumbnailWarning: string | undefined;

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_SITE_URL}/api/admin/media/thumbnail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaId: parseInt(result.data.mediaId, 10), // ✅ Convert string to number
            storagePath: result.data.storagePath,
          }),
        }
      );

      // ✅ CRITICAL: Verify HTTP status
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log("[uploadMediaImage] Thumbnail generated:", responseData.thumbPath);
    } catch (thumbnailError) {
      console.warn(
        "[uploadMediaImage] Thumbnail generation failed (non-critical):",
        thumbnailError
      );
      thumbnailWarning =
        "Image uploaded but thumbnail generation failed. Thumbnail will be created on next upload.";
    }

    // 7. ✅ Revalidation (UNIQUEMENT dans Server Action)
    revalidatePath("/admin/medias");
    revalidatePath("/admin/team");
    revalidatePath("/admin/spectacles");

    return {
      success: true,
      data: {
        ...result.data,
        warning: thumbnailWarning,
      },
    };
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

// =============================================================================
// MEDIA LIBRARY ACTIONS
// =============================================================================

import { listMediaItems } from "@/lib/dal/media";
import { toMediaItemExtendedDTO } from "@/lib/dal/helpers/serialize";
import type { MediaItemExtendedDTO } from "@/lib/schemas/media";

export type MediaItemsListResult =
  | { success: true; data: MediaItemExtendedDTO[] }
  | { success: false; error: string };

/**
 * List all media items with tags and folders
 * @returns Array of MediaItemExtendedDTO
 */
export async function listMediaItemsAction(): Promise<MediaItemsListResult> {
  try {
    const result = await listMediaItems();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Normalize dates before mapping to DTOs
    const normalizedData = result.data.map((item) => ({
      ...item, // Includes thumbnail_path (Phase 3)
      created_at: item.created_at instanceof Date ? item.created_at : new Date(item.created_at),
      updated_at: item.updated_at instanceof Date ? item.updated_at : new Date(item.updated_at),
      tags: item.tags.map((tag) => ({
        ...tag,
        created_at: tag.created_at instanceof Date ? tag.created_at : new Date(tag.created_at),
        updated_at: tag.updated_at instanceof Date ? tag.updated_at : new Date(tag.updated_at),
      })),
      folder: item.folder
        ? {
          ...item.folder,
          created_at: item.folder.created_at instanceof Date ? item.folder.created_at : new Date(item.folder.created_at),
          updated_at: item.folder.updated_at instanceof Date ? item.folder.updated_at : new Date(item.folder.updated_at),
        }
        : null,
    }));

    // Convert to DTOs (bigint -> number, Date -> string)
    const dtos = normalizedData.map((item) => toMediaItemExtendedDTO(item as any)); // TS workaround for complex nested types

    return { success: true, data: dtos };
  } catch (error) {
    console.error("[listMediaItemsAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// METADATA UPDATE
// =============================================================================

export type MediaMetadataUpdateInput = {
  alt_text?: string | null;
  folder_id?: number | null;
  tag_ids?: number[];
};

export type MediaMetadataUpdateResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Update media metadata (alt_text, folder, tags)
 */
export async function updateMediaMetadataAction(
  mediaId: number,
  input: MediaMetadataUpdateInput
): Promise<MediaMetadataUpdateResult> {
  try {
    await requireAdmin();

    const supabase = await createClient();

    // Update media table
    // Note: Supabase client handles number → bigint conversion automatically
    const { error: updateError } = await supabase
      .from("medias")
      .update({
        alt_text: input.alt_text,
        folder_id: input.folder_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mediaId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Update tags if provided
    if (input.tag_ids !== undefined) {
      // Delete existing tags
      await supabase
        .from("media_item_tags")
        .delete()
        .eq("media_id", mediaId);

      // Insert new tags
      if (input.tag_ids.length > 0) {
        const tagInserts = input.tag_ids.map((tagId) => ({
          media_id: mediaId,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from("media_item_tags")
          .insert(tagInserts);

        if (tagsError) {
          throw new Error(tagsError.message);
        }
      }
    }

    revalidatePath("/admin/media");
    revalidatePath("/admin/media/library");

    return { success: true };
  } catch (error) {
    console.error("[updateMediaMetadataAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur mise à jour",
    };
  }
}
