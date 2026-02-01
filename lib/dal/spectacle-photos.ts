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
 * @param spectacleId - Spectacle ID (bigint)
 * @param mediaId - Media ID (bigint)
 * @param ordre - Display order (0 or 1)
 * @returns DALResult with created photo or error
 *
 * @example
 * const result = await addSpectaclePhoto(BigInt(123), BigInt(456), 0);
 * if (result.success) {
 *   console.log("Photo added:", result.data);
 * }
 */
export async function addSpectaclePhoto(
    spectacleId: bigint,
    mediaId: bigint,
    ordre: number,
): Promise<DALResult<SpectaclePhotoDTO>> {
    try {
        await requireAdmin();

        // Validate input
        const validated = AddPhotoInputSchema.parse({
            spectacle_id: spectacleId,
            media_id: mediaId,
            ordre,
            type: "landscape",
        });

        const supabase = await createClient();

        // Check constraint: max 2 landscape photos
        const existingCount = await countLandscapePhotos(
            supabase,
            validated.spectacle_id,
        );
        if (existingCount >= 2) {
            return {
                success: false,
                error: "[ERR_PHOTO_001] Maximum 2 landscape photos per spectacle",
                status: HttpStatus.BAD_REQUEST,
            };
        }

        // Insert photo
        const { data, error } = await supabase
            .from("spectacles_medias")
            .insert({
                spectacle_id: validated.spectacle_id,
                media_id: validated.media_id,
                ordre: validated.ordre,
                type: validated.type,
            })
            .select(
                "spectacle_id, media_id, ordre, medias(storage_path, alt_text)",
            )
            .single();

        if (error) {
            return {
                success: false,
                error: `[ERR_PHOTO_002] Failed to add photo: ${error.message}`,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }

        // Transform response to DTO
        const photoDTO: SpectaclePhotoDTO = {
            spectacle_id: data.spectacle_id,
            media_id: data.media_id,
            ordre: data.ordre,
            storage_path: (data.medias as any)?.storage_path ?? "",
            alt_text: (data.medias as any)?.alt_text ?? null,
        };

        return { success: true, data: photoDTO };
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
 * @param spectacleId - Spectacle ID (bigint)
 * @param mediaId - Media ID (bigint)
 * @returns DALResult with null data or error
 *
 * @example
 * const result = await deleteSpectaclePhoto(BigInt(123), BigInt(456));
 */
export async function deleteSpectaclePhoto(
    spectacleId: bigint,
    mediaId: bigint,
): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const supabase = await createClient();

        const { error } = await supabase
            .from("spectacles_medias")
            .delete()
            .eq("spectacle_id", spectacleId)
            .eq("media_id", mediaId)
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

/**
 * Swaps the order of two landscape photos (0 ↔ 1)
 *
 * @param spectacleId - Spectacle ID (bigint)
 * @returns DALResult with updated photos or error
 *
 * @example
 * const result = await swapPhotoOrder(BigInt(123));
 */
export async function swapPhotoOrder(
    spectacleId: bigint,
): Promise<DALResult<SpectaclePhotoDTO[]>> {
    try {
        await requireAdmin();

        const supabase = await createClient();

        // Verify we have exactly 2 photos
        const existingCount = await countLandscapePhotos(supabase, spectacleId);
        if (existingCount !== 2) {
            return {
                success: false,
                error: "[ERR_PHOTO_004] Need exactly 2 photos to swap",
                status: HttpStatus.BAD_REQUEST,
            };
        }

        // Swap using UPDATE with CASE (atomic operation)
        const { error } = await supabase.rpc("swap_spectacle_photo_order", {
            p_spectacle_id: spectacleId,
        });

        if (error) {
            return {
                success: false,
                error: `[ERR_PHOTO_005] Failed to swap photos: ${error.message}`,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }

        // Fetch updated photos
        const photos = await fetchSpectacleLandscapePhotosAdmin(spectacleId);

        return { success: true, data: photos };
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
