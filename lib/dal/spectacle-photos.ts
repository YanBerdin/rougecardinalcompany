"use server";

import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
    SpectaclePhotoDTOSchema,
    AddPhotoInputSchema,
    GalleryPhotoDTOSchema,
    type SpectaclePhotoDTO,
    type AddPhotoInput,
    type GalleryPhotoDTO,
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
// GALLERY: READ Operations (wrapped with cache, return direct)
// ============================================================================

/**
 * Fetches gallery photos for a spectacle (public view)
 *
 * Wrapped with React cache() for intra-request deduplication.
 * Returns empty array on error for graceful degradation.
 *
 * @param spectacleId - Spectacle ID (bigint)
 * @returns Array of gallery photos, ordered by `ordre`
 */
export const fetchSpectacleGalleryPhotos = cache(
    async (spectacleId: bigint): Promise<GalleryPhotoDTO[]> => {
        try {
            const supabase = await createClient();

            const { data, error } = await supabase
                .from("spectacles_gallery_photos_public")
                .select("*")
                .eq("spectacle_id", spectacleId)
                .order("ordre", { ascending: true });

            if (error) {
                console.error(
                    "[DAL] fetchSpectacleGalleryPhotos error:",
                    error.message,
                );
                return [];
            }

            const validPhotos = (data ?? [])
                .map((row) => {
                    const result = GalleryPhotoDTOSchema.safeParse(row);
                    if (!result.success) {
                        console.warn(
                            "[DAL] Invalid gallery photo row:",
                            row,
                            result.error,
                        );
                        return null;
                    }
                    return result.data;
                })
                .filter(
                    (photo): photo is GalleryPhotoDTO => photo !== null,
                );

            return validPhotos;
        } catch (error) {
            console.error(
                "[DAL] fetchSpectacleGalleryPhotos exception:",
                error,
            );
            return [];
        }
    },
);

/**
 * Fetches gallery photos for a spectacle (admin view)
 *
 * Requires admin. Wrapped with React cache().
 *
 * @param spectacleId - Spectacle ID (bigint)
 * @returns Array of gallery photos with admin metadata
 */
export const fetchSpectacleGalleryPhotosAdmin = cache(
    async (spectacleId: bigint): Promise<GalleryPhotoDTO[]> => {
        try {
            await requireAdmin();
            const supabase = await createClient();

            const { data, error } = await supabase
                .from("spectacles_gallery_photos_admin")
                .select("*")
                .eq("spectacle_id", spectacleId)
                .order("ordre", { ascending: true });

            if (error) {
                console.error(
                    "[DAL] fetchSpectacleGalleryPhotosAdmin error:",
                    error.message,
                );
                return [];
            }

            const validPhotos = (data ?? [])
                .map((row) => {
                    const result = GalleryPhotoDTOSchema.safeParse(row);
                    if (!result.success) {
                        console.warn(
                            "[DAL] Invalid gallery photo admin row:",
                            row,
                            result.error,
                        );
                        return null;
                    }
                    return result.data;
                })
                .filter(
                    (photo): photo is GalleryPhotoDTO => photo !== null,
                );

            return validPhotos;
        } catch (error) {
            console.error(
                "[DAL] fetchSpectacleGalleryPhotosAdmin exception:",
                error,
            );
            return [];
        }
    },
);

// ============================================================================
// GALLERY: MUTATIONS (return DALResult<T>)
// ============================================================================

/**
 * Adds a gallery photo to a spectacle (no max limit)
 *
 * @param spectacleId - Spectacle ID (number)
 * @param mediaId - Media ID (number)
 * @param ordre - Display order (0-based)
 * @returns DALResult with null data or error
 */
export async function addSpectacleGalleryPhoto(
    spectacleId: number,
    mediaId: number,
    ordre: number,
): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const supabase = await createClient();

        // Check if this media is already associated with this spectacle (any type).
        // PK is (spectacle_id, media_id) — one media can only appear once per spectacle.
        const { data: existing, error: checkError } = await supabase
            .from("spectacles_medias")
            .select("type")
            .eq("spectacle_id", spectacleId)
            .eq("media_id", mediaId)
            .maybeSingle();

        if (checkError) {
            return {
                success: false,
                error: `[ERR_GALLERY_001] Failed to check existing photo: ${checkError.message}`,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }

        if (existing !== null) {
            const typeLabel =
                existing.type === "poster"
                    ? "affiche"
                    : existing.type === "landscape"
                      ? "photo paysage"
                      : "photo galerie";
            return {
                success: false,
                error: `[ERR_GALLERY_001] Cette image est déjà utilisée comme ${typeLabel} pour ce spectacle.`,
                status: HttpStatus.CONFLICT,
            };
        }

        const { error } = await supabase
            .from("spectacles_medias")
            .insert({
                spectacle_id: spectacleId,
                media_id: mediaId,
                ordre,
                type: "gallery",
            });

        if (error) {
            return {
                success: false,
                error: `[ERR_GALLERY_001] Failed to add gallery photo: ${error.message}`,
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
 * Deletes a gallery photo from a spectacle
 *
 * @param spectacleId - Spectacle ID (string)
 * @param mediaId - Media ID (string)
 * @returns DALResult with null data or error
 */
export async function deleteSpectacleGalleryPhoto(
    spectacleId: string,
    mediaId: string,
): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const spectacleIdNum = Number(spectacleId);
        const mediaIdNum = Number(mediaId);

        const supabase = await createClient();

        const { error } = await supabase
            .from("spectacles_medias")
            .delete()
            .eq("spectacle_id", spectacleIdNum)
            .eq("media_id", mediaIdNum)
            .eq("type", "gallery");

        if (error) {
            return {
                success: false,
                error: `[ERR_GALLERY_002] Failed to delete gallery photo: ${error.message}`,
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
 * Reorders gallery photos for a spectacle
 *
 * Updates `ordre` for each media_id in the given order.
 *
 * @param spectacleId - Spectacle ID (bigint)
 * @param orderedMediaIds - Media IDs in desired order
 * @returns DALResult with null data or error
 */
export async function reorderSpectacleGalleryPhotos(
    spectacleId: bigint,
    orderedMediaIds: bigint[],
): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const supabase = await createClient();
        const spectacleIdNum = Number(spectacleId);

        // Two-pass update to avoid UNIQUE constraint violation on
        // (spectacle_id, type, ordre). Pass 1 sets temporary negative
        // values so no two rows share the same ordre at any point.
        for (let index = 0; index < orderedMediaIds.length; index++) {
            const mediaIdNum = Number(orderedMediaIds[index]);
            const tempOrdre = -(index + 1);

            const { error } = await supabase
                .from("spectacles_medias")
                .update({ ordre: tempOrdre })
                .eq("spectacle_id", spectacleIdNum)
                .eq("media_id", mediaIdNum)
                .eq("type", "gallery");

            if (error) {
                console.error(`[DAL] reorderSpectacleGalleryPhotos pass1 — index ${index}:`, error);
                return {
                    success: false,
                    error: `[ERR_GALLERY_003] Failed to reorder (pass1) at index ${index}: ${error.message}`,
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                };
            }
        }

        // Pass 2: set the final positive ordre values
        for (let index = 0; index < orderedMediaIds.length; index++) {
            const mediaIdNum = Number(orderedMediaIds[index]);

            const { error } = await supabase
                .from("spectacles_medias")
                .update({ ordre: index })
                .eq("spectacle_id", spectacleIdNum)
                .eq("media_id", mediaIdNum)
                .eq("type", "gallery");

            if (error) {
                console.error(`[DAL] reorderSpectacleGalleryPhotos pass2 — index ${index}:`, error);
                return {
                    success: false,
                    error: `[ERR_GALLERY_003] Failed to reorder (pass2) at index ${index}: ${error.message}`,
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                };
            }
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
