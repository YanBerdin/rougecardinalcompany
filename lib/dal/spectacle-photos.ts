"use server";

import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
    SpectaclePhotoDTOSchema,
    AddPhotoInputSchema,
    type SpectaclePhotoDTO,
    type AddPhotoInput,
} from "@/lib/schemas/spectacles";
import { type DALResult, getErrorMessage } from "@/lib/dal/helpers";
import { HttpStatus } from "@/lib/api/helpers";

// ============================================================================
// READ Operations (wrapped with cache, return direct)
// ============================================================================

/**
 * Fetches landscape photos for a spectacle (public view)
 *
 * Wrapped with React cache() for intra-request deduplication.
 * Returns empty array on error for graceful degradation.
 *
 * @param spectacleId - Spectacle ID (bigint)
 * @returns Array of landscape photos (max 2, ordered)
 *
 * @example
 * const photos = await fetchSpectacleLandscapePhotos(BigInt(123));
 */
export const fetchSpectacleLandscapePhotos = cache(
    async (spectacleId: bigint): Promise<SpectaclePhotoDTO[]> => {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from("spectacles_landscape_photos_public")
                .select("*")
                .eq("spectacle_id", spectacleId)
                .order("ordre", { ascending: true });

            if (error) {
                console.error(
                    "[DAL] fetchSpectacleLandscapePhotos error:",
                    error.message,
                );
                return [];
            }

            // Validate and filter invalid rows
            const validPhotos = (data ?? [])
                .map((row) => {
                    const result = SpectaclePhotoDTOSchema.safeParse(row);
                    if (!result.success) {
                        console.warn(
                            "[DAL] Invalid landscape photo row:",
                            row,
                            result.error,
                        );
                        return null;
                    }
                    return result.data;
                })
                .filter((photo): photo is SpectaclePhotoDTO => photo !== null);

            return validPhotos;
        } catch (error) {
            console.error("[DAL] fetchSpectacleLandscapePhotos exception:", error);
            return [];
        }
    },
);

/**
 * Fetches landscape photos for admin view (includes metadata)
 *
 * Wrapped with React cache() for intra-request deduplication.
 * Requires admin authentication. Returns empty array on error.
 *
 * @param spectacleId - Spectacle ID (bigint)
 * @returns Array of landscape photos with metadata
 *
 * @example
 * const photos = await fetchSpectacleLandscapePhotosAdmin(BigInt(123));
 */
export const fetchSpectacleLandscapePhotosAdmin = cache(
    async (spectacleId: bigint): Promise<SpectaclePhotoDTO[]> => {
        try {
            await requireAdmin();

            const supabase = await createClient();

            const { data, error } = await supabase
                .from("spectacles_landscape_photos_admin")
                .select("*")
                .eq("spectacle_id", spectacleId)
                .order("ordre", { ascending: true });

            if (error) {
                console.error(
                    "[DAL] fetchSpectacleLandscapePhotosAdmin error:",
                    error.message,
                );
                return [];
            }

            // Validate and filter invalid rows
            const validPhotos = (data ?? [])
                .map((row) => {
                    const result = SpectaclePhotoDTOSchema.safeParse(row);
                    if (!result.success) {
                        console.warn(
                            "[DAL] Invalid landscape photo admin row:",
                            row,
                            result.error,
                        );
                        return null;
                    }
                    return result.data;
                })
                .filter((photo): photo is SpectaclePhotoDTO => photo !== null);

            return validPhotos;
        } catch (error) {
            console.error(
                "[DAL] fetchSpectacleLandscapePhotosAdmin exception:",
                error,
            );
            return [];
        }
    },
);

// ============================================================================
// MUTATIONS (return DALResult<T>)
// ============================================================================

/**
 * Adds a landscape photo to a spectacle
 *
 * @param spectacleId - Spectacle ID (number, converted internally to bigint)
 * @param mediaId - Media ID (number, converted internally to bigint)
 * @param ordre - Display order (0 or 1)
 * @returns DALResult with null data or error (UI fetches via API after success)
 *
 * @example
 * const result = await addSpectaclePhoto(123, 456, 0);
 * if (result.success) {
 *   // UI will fetch fresh data via API route
 * }
 */
export async function addSpectaclePhoto(
    spectacleId: number,
    mediaId: number,
    ordre: number,
): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        // ✅ No BigInt needed - spectacleId and mediaId are already numbers
        const supabase = await createClient();

        // Check constraint: max 2 landscape photos
        // countLandscapePhotos expects bigint for .eq() - pass BigInt here in isolated scope
        const existingCount = await countLandscapePhotos(
            supabase,
            BigInt(spectacleId),
        );
        if (existingCount >= 2) {
            return {
                success: false,
                error: "[ERR_PHOTO_001] Maximum 2 landscape photos per spectacle",
                status: HttpStatus.BAD_REQUEST,
            };
        }

        // Insert photo (no .select() needed - we don't return data)
        const { error } = await supabase
            .from("spectacles_medias")
            .insert({
                spectacle_id: spectacleId,  // number - Supabase handles it
                media_id: mediaId,          // number - Supabase handles it
                ordre,
                type: "landscape",
            });

        if (error) {
            return {
                success: false,
                error: `[ERR_PHOTO_002] Failed to add photo: ${error.message}`,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }

        // ✅ NO data return (prevents BigInt serialization)
        // UI will fetch fresh data via API route after success
        return { success: true, data: null };
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
            status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
    }
}

/**
 * Deletes a landscape photo from a spectacle
 *
 * @param spectacleId - Spectacle ID (string, converted internally to bigint)
 * @param mediaId - Media ID (string, converted internally to bigint)
 * @returns DALResult with null data or error
 *
 * @example
 * const result = await deleteSpectaclePhoto("123", "456");
 */
export async function deleteSpectaclePhoto(
    spectacleId: string,
    mediaId: string,
): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        // ✅ Parse as number (Supabase queries expect number, not BigInt)
        const spectacleIdNum = Number(spectacleId);
        const mediaIdNum = Number(mediaId);

        const supabase = await createClient();

        const { error } = await supabase
            .from("spectacles_medias")
            .delete()
            .eq("spectacle_id", spectacleIdNum)
            .eq("media_id", mediaIdNum)
            .eq("type", "landscape");

        if (error) {
            return {
                success: false,
                error: `[ERR_PHOTO_003] Failed to delete photo: ${error.message}`,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }

        return { success: true, data: null };
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
            status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
    }
}

// ============================================================================
// @internal Helpers
// ============================================================================

/**
 * Counts landscape photos for a spectacle
 * @internal
 */
async function countLandscapePhotos(
    supabase: SupabaseClient,
    spectacleId: bigint,
): Promise<number> {
    const { count, error } = await supabase
        .from("spectacles_medias")
        .select("*", { count: "exact", head: true })
        .eq("spectacle_id", spectacleId)
        .eq("type", "landscape");

    if (error) {
        console.error("[DAL] countLandscapePhotos error:", error.message);
        return 0;
    }

    return count ?? 0;
}
