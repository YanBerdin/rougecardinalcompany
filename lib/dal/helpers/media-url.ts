/**
 * Centralized helper to build public media URLs from storage paths.
 * Uses T3 Env (NEXT_PUBLIC_SUPABASE_URL) — never process.env directly.
 */

import { env } from "@/lib/env";

/**
 * Build the public URL for a media file stored in Supabase Storage.
 *
 * @param storagePath - Relative path within the `medias` bucket (e.g. "gallery/photo.jpg")
 * @returns Full public URL, or null if storagePath is null/empty
 *
 * @example
 * buildMediaPublicUrl("gallery/photo.jpg")
 * // → "https://xxx.supabase.co/storage/v1/object/public/medias/gallery/photo.jpg"
 */
export function buildMediaPublicUrl(storagePath: string | null): string | null {
    if (!storagePath) return null;

    // Remove leading slashes to avoid double slashes in URL
    const cleanPath = storagePath.replace(/^\/+/, "");
    return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medias/${cleanPath}`;
}
