"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
    createSpectacle,
    updateSpectacle,
    deleteSpectacle,
} from "@/lib/dal/spectacles";
import {
    addSpectaclePhoto,
    deleteSpectaclePhoto,
    swapPhotoOrder,
} from "@/lib/dal/spectacle-photos";
import { validateImageUrl } from "@/lib/utils/validate-image-url";
import { AddPhotoInputSchema } from "@/lib/schemas/spectacles";
import type {
    CreateSpectacleInput,
    UpdateSpectacleInput,
    SpectacleDb,
    SpectaclePhotoDTO,
} from "@/lib/schemas/spectacles";

// ============================================================================
// Types
// ============================================================================

export type ActionResult<T = unknown> =
    | { success: true; data?: T }
    | { success: false; error: string };

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Create a new spectacle
 *
 * @param input - Spectacle data (title required)
 * @returns ActionResult with the created spectacle or error
 *
 * @example
 * const result = await createSpectacleAction({
 *   title: 'Hamlet',
 *   genre: 'Tragédie',
 *   public: true
 * });
 */
export async function createSpectacleAction(
    input: CreateSpectacleInput
): Promise<ActionResult<SpectacleDb>> {
    try {
        // Validate external image URL if provided
        if (input.image_url) {
            const urlValidation = await validateImageUrl(input.image_url);
            if (!urlValidation.valid) {
                return {
                    success: false,
                    error: urlValidation.error || "URL d'image invalide ou non autorisée",
                };
            }
        }

        const result = await createSpectacle(input);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        revalidatePath("/admin/spectacles");
        revalidatePath("/spectacles");

        return { success: true, data: result.data };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

/**
 * Update an existing spectacle
 *
 * @param input - Partial spectacle data with required id
 * @returns ActionResult with the updated spectacle or error
 *
 * @example
 * const result = await updateSpectacleAction({
 *   id: 123,
 *   title: 'Hamlet (Nouvelle Version)'
 * });
 */
export async function updateSpectacleAction(
    input: UpdateSpectacleInput
): Promise<ActionResult<SpectacleDb>> {
    try {
        // Validate external image URL if provided
        if (input.image_url) {
            const urlValidation = await validateImageUrl(input.image_url);
            if (!urlValidation.valid) {
                return {
                    success: false,
                    error: urlValidation.error || "URL d'image invalide ou non autorisée",
                };
            }
        }

        const result = await updateSpectacle(input);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        revalidatePath("/admin/spectacles");
        revalidatePath(`/admin/spectacles/${input.id}`);
        revalidatePath("/spectacles");
        revalidatePath(`/spectacles/${result.data?.slug}`);

        return { success: true, data: result.data };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

/**
 * Delete a spectacle
 *
 * @param id - Spectacle ID to delete
 * @returns ActionResult indicating success or failure
 *
 * @example
 * const result = await deleteSpectacleAction(123);
 */
export async function deleteSpectacleAction(
    id: number
): Promise<ActionResult<null>> {
    try {
        const result = await deleteSpectacle(id);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        revalidatePath("/admin/spectacles");
        revalidatePath("/spectacles");

        return { success: true, data: null };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        };
    }
}

// ============================================================================
// Spectacle Photo Actions
// ============================================================================

/**
 * Add a landscape photo to a spectacle
 *
 * @param input - Photo data (spectacle_id, media_id, ordre)
 * @returns ActionResult with the created photo or error
 *
 * @example
 * const result = await addPhotoAction({
 *   spectacle_id: BigInt(123),
 *   media_id: BigInt(456),
 *   ordre: 0,
 *   type: 'landscape'
 * });
 */
export async function addPhotoAction(
    input: unknown
): Promise<ActionResult<SpectaclePhotoDTO>> {
    try {
        const validated = AddPhotoInputSchema.parse(input);
        const result = await addSpectaclePhoto(
            validated.spectacle_id,
            validated.media_id,
            validated.ordre
        );

        if (!result.success) {
            return {
                success: false,
                error: result.error ?? "Failed to add photo",
            };
        }

        revalidatePath("/admin/spectacles");
        revalidatePath("/spectacles/[slug]", "page");

        return { success: true, data: result.data };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation failed: " + error.issues[0]?.message,
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Delete a landscape photo from a spectacle
 *
 * @param spectacleId - Spectacle ID (string for form compatibility)
 * @param mediaId - Media ID (string for form compatibility)
 * @returns ActionResult with null data or error
 *
 * @example
 * const result = await deletePhotoAction("123", "456");
 */
export async function deletePhotoAction(
    spectacleId: string,
    mediaId: string
): Promise<ActionResult<null>> {
    try {
        const result = await deleteSpectaclePhoto(
            BigInt(spectacleId),
            BigInt(mediaId)
        );

        if (!result.success) {
            return {
                success: false,
                error: result.error ?? "Failed to delete photo",
            };
        }

        revalidatePath("/admin/spectacles");
        revalidatePath("/spectacles/[slug]", "page");

        return { success: true, data: null };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Swap the order of landscape photos (0 ↔ 1)
 *
 * @param spectacleId - Spectacle ID (string for form compatibility)
 * @returns ActionResult with updated photos or error
 *
 * @example
 * const result = await swapPhotosAction("123");
 */
export async function swapPhotosAction(
    spectacleId: string
): Promise<ActionResult<SpectaclePhotoDTO[]>> {
    try {
        const result = await swapPhotoOrder(BigInt(spectacleId));

        if (!result.success) {
            return {
                success: false,
                error: result.error ?? "Failed to swap photos",
            };
        }

        revalidatePath("/admin/spectacles");
        revalidatePath("/spectacles/[slug]", "page");

        return { success: true, data: result.data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
