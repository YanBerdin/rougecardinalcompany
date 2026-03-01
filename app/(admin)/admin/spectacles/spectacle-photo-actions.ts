"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/is-admin";
import {
    addSpectaclePhoto,
    deleteSpectaclePhoto,
    addSpectacleGalleryPhoto,
    deleteSpectacleGalleryPhoto,
    reorderSpectacleGalleryPhotos,
} from "@/lib/dal/spectacle-photos";
import {
    AddPhotoInputSchema,
    AddGalleryPhotoInputSchema,
} from "@/lib/schemas/spectacles";

// Re-export ActionResult for consumers that import from this file
export type { ActionResult } from "./actions";

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
): Promise<import("./actions").ActionResult> {
    try {
        await requireAdmin();
        // ✅ TASK055 Pattern: Validate with number schema (not bigint)
        const validated = AddPhotoInputSchema.parse(input);

        // ✅ Pass validated data directly to DAL (no BigInt conversion here)
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

        return { success: true }; // ✅ NO data (prevents BigInt serialization)
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
): Promise<import("./actions").ActionResult> {
    try {
        await requireAdmin();
        // ✅ TASK055 Pattern: Pass strings directly, DAL converts to BigInt
        const result = await deleteSpectaclePhoto(
            spectacleId,
            mediaId
        );

        if (!result.success) {
            return {
                success: false,
                error: result.error ?? "Failed to delete photo",
            };
        }

        revalidatePath("/admin/spectacles");
        revalidatePath("/spectacles/[slug]", "page");

        return { success: true }; // ✅ NO data (prevents BigInt serialization)
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// ============================================================================
// Gallery Photo Actions
// ============================================================================

/**
 * Add a gallery photo to a spectacle
 *
 * @param input - Gallery photo data (spectacle_id, media_id, ordre, type)
 * @returns ActionResult indicating success or failure
 */
export async function addGalleryPhotoAction(
    input: unknown
): Promise<import("./actions").ActionResult> {
    try {
        await requireAdmin();
        const validated = AddGalleryPhotoInputSchema.parse(input);

        const result = await addSpectacleGalleryPhoto(
            validated.spectacle_id,
            validated.media_id,
            validated.ordre
        );

        if (!result.success) {
            return {
                success: false,
                error: result.error ?? "Failed to add gallery photo",
            };
        }

        revalidatePath("/admin/spectacles");
        revalidatePath("/spectacles/[slug]", "page");

        return { success: true };
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
 * Delete a gallery photo from a spectacle
 *
 * @param spectacleId - Spectacle ID (string for form compatibility)
 * @param mediaId - Media ID (string for form compatibility)
 * @returns ActionResult indicating success or failure
 */
export async function deleteGalleryPhotoAction(
    spectacleId: string,
    mediaId: string
): Promise<import("./actions").ActionResult> {
    try {
        await requireAdmin(); // defense-in-depth: vérifier auth au niveau action ET DAL
        const result = await deleteSpectacleGalleryPhoto(
            spectacleId,
            mediaId
        );

        if (!result.success) {
            return {
                success: false,
                error: result.error ?? "Failed to delete gallery photo",
            };
        }

        revalidatePath("/admin/spectacles");
        revalidatePath("/spectacles/[slug]", "page");

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Reorder gallery photos for a spectacle
 *
 * @param spectacleId - Spectacle ID (string)
 * @param orderedMediaIds - Media IDs in desired display order (string[])
 * @returns ActionResult indicating success or failure
 */
export async function reorderGalleryPhotosAction(
    spectacleId: string,
    orderedMediaIds: string[]
): Promise<import("./actions").ActionResult> {
    try {
        await requireAdmin(); // defense-in-depth: vérifier auth au niveau action ET DAL
        const result = await reorderSpectacleGalleryPhotos(
            BigInt(spectacleId),
            orderedMediaIds.map((id) => BigInt(id))
        );

        if (!result.success) {
            return {
                success: false,
                error: result.error ?? "Failed to reorder gallery photos",
            };
        }

        revalidatePath("/admin/spectacles");
        revalidatePath("/spectacles/[slug]", "page");

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
