"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { DALResult } from "@/lib/dal/helpers";

/**
 * @file Media Data Access Layer
 * @description Database and Storage operations for media files
 */

// =============================================================================
// TYPES
// =============================================================================

export interface MediaUploadInput {
    file: File;
    folder: string;
    uploadedBy: string | undefined;
}

export interface MediaUploadData {
    mediaId: number;
    publicUrl: string;
    storagePath: string;
}

export interface MediaRecord {
    id: number;
    storage_path: string;
    filename: string;
    mime: string;
    size_bytes: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const BUCKET_NAME = "medias";

// =============================================================================
// HELPER FUNCTIONS (< 30 lines each)
// =============================================================================

function generateStoragePath(folder: string, filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    return `${folder}/${timestamp}-${sanitizedFilename}`;
}

async function uploadToStorage(
    supabase: Awaited<ReturnType<typeof createClient>>,
    storagePath: string,
    file: File
): Promise<DALResult<null>> {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("[DAL] Storage upload error:", error);
        return {
            success: false,
            error: `Storage upload failed: ${error.message}`,
        };
    }

    return { success: true, data: null };
}

async function getPublicUrl(
    supabase: Awaited<ReturnType<typeof createClient>>,
    storagePath: string
): Promise<string> {
    const {
        data: { publicUrl },
    } = await supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    return publicUrl;
}

async function createMediaRecord(
    supabase: Awaited<ReturnType<typeof createClient>>,
    input: MediaUploadInput,
    storagePath: string
): Promise<DALResult<number>> {
    const { data, error } = await supabase
        .from("medias")
        .insert({
            storage_path: storagePath,
            filename: input.file.name,
            mime: input.file.type,
            size_bytes: input.file.size,
            uploaded_by: input.uploadedBy,
        })
        .select("id")
        .single();

    if (error || !data) {
        console.error("[DAL] Database insert error:", error);
        return {
            success: false,
            error: "Database record creation failed",
        };
    }

    return { success: true, data: data.id };
}

async function cleanupStorage(
    supabase: Awaited<ReturnType<typeof createClient>>,
    storagePath: string
): Promise<void> {
    try {
        await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    } catch (error) {
        console.error("[DAL] Cleanup failed:", error);
    }
}

// =============================================================================
// PUBLIC DAL FUNCTIONS
// =============================================================================

/**
 * Upload media file to Storage and create database record
 * 
 * @param input - File, folder, and uploader information
 * @returns DALResult with media ID, public URL, and storage path
 */
export async function uploadMedia(
    input: MediaUploadInput
): Promise<DALResult<MediaUploadData>> {
    await requireAdmin();

    const supabase = await createClient();
    const storagePath = generateStoragePath(input.folder, input.file.name);

    // 1. Upload to Storage
    const uploadResult = await uploadToStorage(supabase, storagePath, input.file);
    if (!uploadResult.success) {
        return uploadResult;
    }

    // 2. Get public URL
    const publicUrl = await getPublicUrl(supabase, storagePath);

    // 3. Create database record
    const dbResult = await createMediaRecord(supabase, input, storagePath);
    if (!dbResult.success) {
        await cleanupStorage(supabase, storagePath);
        return dbResult;
    }

    return {
        success: true,
        data: {
            mediaId: dbResult.data,
            publicUrl,
            storagePath,
        },
    };
}

/**
 * Delete media from Storage and database
 * 
 * @param mediaId - Media record ID
 * @returns DALResult with null data on success
 */
export async function deleteMedia(
    mediaId: number
): Promise<DALResult<null>> {
    await requireAdmin();

    const supabase = await createClient();

    // 1. Fetch media record
    const { data: media, error: fetchError } = await supabase
        .from("medias")
        .select("storage_path")
        .eq("id", mediaId)
        .single();

    if (fetchError || !media) {
        return {
            success: false,
            error: "Media not found",
        };
    }

    // 2. Delete from Storage (best effort)
    await cleanupStorage(supabase, media.storage_path);

    // 3. Delete from database
    const { error: dbError } = await supabase
        .from("medias")
        .delete()
        .eq("id", mediaId);

    if (dbError) {
        console.error("[DAL] Database delete error:", dbError);
        return {
            success: false,
            error: "Database deletion failed",
        };
    }

    return { success: true, data: null };
}

/**
 * Fetch media record by ID
 * 
 * @param mediaId - Media record ID
 * @returns DALResult with media record
 */
export async function getMediaById(
    mediaId: number
): Promise<DALResult<MediaRecord>> {
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("medias")
        .select("id, storage_path, filename, mime, size_bytes")
        .eq("id", mediaId)
        .single();

    if (error || !data) {
        return {
            success: false,
            error: "Media not found",
        };
    }

    return { success: true, data };
}
