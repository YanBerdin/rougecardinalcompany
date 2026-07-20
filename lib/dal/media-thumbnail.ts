"use server";
import "server-only";
import sharp from "sharp";
import { createClient } from "@/supabase/server";
import { requireMinRole } from "@/lib/auth/roles";
import { dalSuccess, dalError, getErrorMessage } from "@/lib/dal/helpers";
import type { DALResult } from "@/lib/dal/helpers";

/**
 * @file Media Thumbnail Data Access Layer
 * @description Thumbnail generation logic shared between the admin API route
 * and Server Actions. Extracted so callers can invoke it as a direct function
 * call instead of an internal HTTP fetch (avoids NEXT_PUBLIC_SITE_URL /
 * cookie-forwarding failures across environments).
 * @module lib/dal/media-thumbnail
 */

const BUCKET_NAME = "medias";
const THUMBNAIL_SIZE = 300;
const THUMBNAIL_QUALITY = 80;
const THUMBNAIL_SUFFIX = "_thumb.jpg";

export interface GenerateThumbnailInput {
    mediaId: number;
    storagePath: string;
}

export interface GenerateThumbnailData {
    thumbPath: string;
}

/**
 * Generate (or regenerate) a 300x300 JPEG thumbnail for a media item.
 *
 * Downloads the original from Storage, resizes it with Sharp, uploads the
 * thumbnail back to Storage, and updates `medias.thumbnail_path`.
 *
 * @param input - mediaId and storagePath of the original file
 * @returns DALResult with the generated thumbnail storage path
 */
export async function generateMediaThumbnail(
    input: GenerateThumbnailInput
): Promise<DALResult<GenerateThumbnailData>> {
    await requireMinRole("editor");

    const { mediaId, storagePath } = input;
    const supabase = await createClient();

    const { data: fileData, error: downloadError } = await supabase.storage
        .from(BUCKET_NAME)
        .download(storagePath);

    if (downloadError) {
        console.error("[generateMediaThumbnail] Download failed:", downloadError);
        return dalError("Failed to download original file");
    }

    let thumbnailBuffer: Buffer;
    try {
        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        thumbnailBuffer = await sharp(buffer)
            .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "cover" })
            .jpeg({ quality: THUMBNAIL_QUALITY })
            .toBuffer();
    } catch (error: unknown) {
        console.error("[generateMediaThumbnail] Sharp processing failed:", error);
        return dalError(`Failed to process image: ${getErrorMessage(error)}`);
    }

    const thumbPath = storagePath.replace(/\.(jpg|jpeg|png|webp)$/i, THUMBNAIL_SUFFIX);

    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(thumbPath, thumbnailBuffer, {
            contentType: "image/jpeg",
            cacheControl: "31536000", // 1 year
            upsert: true, // Allow regeneration
        });

    if (uploadError) {
        console.error("[generateMediaThumbnail] Upload failed:", uploadError);
        return dalError("Failed to upload thumbnail");
    }

    const { error: updateError } = await supabase
        .from("medias")
        .update({ thumbnail_path: thumbPath })
        .eq("id", mediaId);

    if (updateError) {
        console.error("[generateMediaThumbnail] DB update failed:", updateError);
        return dalError("Failed to update database");
    }

    return dalSuccess({ thumbPath });
}
