"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import {
    createSpectacle,
    updateSpectacle,
    deleteSpectacle,
} from "@/lib/dal/spectacles";
import type {
    CreateSpectacleInput,
    UpdateSpectacleInput,
    SpectacleDb,
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
