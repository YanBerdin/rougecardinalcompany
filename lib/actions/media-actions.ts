"use server";

import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { MediaUploadResult } from "./types";

/**
 * @file Generic Media Upload Actions
 * @description Reusable server actions for media uploads to Supabase Storage
 * @module lib/actions/media-actions
 * 
 * ARCHITECTURE:
 * - Generic upload function for all media types
 * - Configurable folder structure
 * - Standardized error handling
 * - Admin authentication required
 * 
 * STORAGE STRUCTURE:
 * - Bucket: medias
 * - Default folder: "team" (for backward compatibility)
 * - Custom folders: "spectacles", "press", etc.
 * - Path format: {folder}/{timestamp}-{filename}
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const BUCKET_NAME = "medias";
const DEFAULT_FOLDER = "team";

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

/**
 * Validates file from FormData
 * 
 * @throws Error if validation fails
 */
function validateFile(formData: FormData): File {
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    throw new Error("Aucun fichier fourni");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Fichier trop volumineux (max 5MB)");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    throw new Error(
      `Format non supporté. Acceptés: ${ALLOWED_MIME_TYPES.join(", ")}`
    );
  }

  return file;
}

/**
 * Generates unique storage path for file
 * 
 * Format: {folder}/{timestamp}-{filename}
 * 
 * @example
 * generateStoragePath("spectacles", "hamlet.jpg")
 * // => "spectacles/1704123456789-hamlet.jpg"
 */
function generateStoragePath(folder: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${folder}/${timestamp}-${sanitizedFilename}`;
}

// =============================================================================
// UPLOAD FUNCTION
// =============================================================================

/**
 * Uploads image to Supabase Storage and creates media record
 * 
 * WORKFLOW:
 * 1. Validate authentication (admin required)
 * 2. Validate file (size, type)
 * 3. Upload to Storage bucket
 * 4. Create database record in medias table
 * 5. Return public URL and metadata
 * 
 * @param formData - FormData containing file field
 * @param folder - Optional subfolder in bucket (default: "team")
 * @returns ActionResult with media ID and public URL
 * 
 * @example
 * ```typescript
 * // TeamMemberForm
 * const result = await uploadMediaImage(formData, "team");
 * 
 * // SpectacleForm
 * const result = await uploadMediaImage(formData, "spectacles");
 * 
 * // Press releases
 * const result = await uploadMediaImage(formData, "press");
 * ```
 */
export async function uploadMediaImage(
  formData: FormData,
  folder: string = DEFAULT_FOLDER
): Promise<MediaUploadResult> {
  try {
    // Step 1: Require admin authentication
    await requireAdmin();

    // Step 2: Validate file
    const file = validateFile(formData);

    // Step 3: Upload to Storage
    const supabase = await createClient();
    const storagePath = generateStoragePath(folder, file.name);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadMediaImage] Storage upload error:", uploadError);
      throw new Error(`Échec du téléversement: ${uploadError.message}`);
    }

    // Step 4: Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

    // Step 5: Create database record
    const { data: mediaRecord, error: dbError } = await supabase
      .from("medias")
      .insert({
        storage_path: storagePath,
        filename: file.name,
        mime: file.type,
        size_bytes: file.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select("id")
      .single();

    if (dbError || !mediaRecord) {
      console.error("[uploadMediaImage] Database insert error:", dbError);
      
      // Cleanup: delete uploaded file if DB insert fails
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      
      throw new Error("Échec de l'enregistrement en base de données");
    }

    // Step 6: Return success
    return {
      success: true,
      data: {
        mediaId: mediaRecord.id,
        publicUrl,
        storagePath,
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
 * Deletes media from Storage and database
 * 
 * WORKFLOW:
 * 1. Validate authentication (admin required)
 * 2. Fetch media record from database
 * 3. Delete file from Storage
 * 4. Delete database record
 * 
 * @param mediaId - ID from medias table
 * @returns ActionResult with null data on success
 * 
 * @example
 * ```typescript
 * const result = await deleteMediaImage(123);
 * if (result.success) {
 *   console.log("Media deleted successfully");
 * }
 * ```
 */
export async function deleteMediaImage(
  mediaId: number
): Promise<MediaUploadResult> {
  try {
    await requireAdmin();

    const supabase = await createClient();

    // Fetch media record
    const { data: media, error: fetchError } = await supabase
      .from("medias")
      .select("storage_path")
      .eq("id", mediaId)
      .single();

    if (fetchError || !media) {
      throw new Error("Média introuvable");
    }

    // Delete from Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([media.storage_path]);

    if (storageError) {
      console.error("[deleteMediaImage] Storage delete error:", storageError);
      // Continue with DB deletion even if Storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("medias")
      .delete()
      .eq("id", mediaId);

    if (dbError) {
      console.error("[deleteMediaImage] Database delete error:", dbError);
      throw new Error("Échec de la suppression");
    }

    return {
      success: true,
      data: {
        mediaId,
        publicUrl: "",
        storagePath: media.storage_path,
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
