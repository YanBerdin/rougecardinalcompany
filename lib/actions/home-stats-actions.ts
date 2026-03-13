"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/actions/types";
import {
    HomeStatInputSchema,
    ReorderHomeStatsSchema,
} from "@/lib/schemas/home-content";
import {
    createHomeStat,
    updateHomeStat,
    deleteHomeStat,
    reorderHomeStats,
} from "@/lib/dal/admin-home-stats";
import { requireMinRole } from "@/lib/auth/roles";

// =============================================================================
// HOME STATS ACTIONS
// =============================================================================

/**
 * CREATE home stat
 */
export async function createHomeStatAction(
    input: unknown
): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const validated = await HomeStatInputSchema.parseAsync(input);
        const result = await createHomeStat(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Création échouée" };
        }

        revalidatePath("/admin/home/about");
        revalidatePath("/");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UPDATE home stat
 */
export async function updateHomeStatAction(
    id: string,
    input: unknown
): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const validated = await HomeStatInputSchema.partial().parseAsync(input);
        const result = await updateHomeStat(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Mise à jour échouée" };
        }

        revalidatePath("/admin/home/about");
        revalidatePath("/");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * DELETE home stat
 */
export async function deleteHomeStatAction(
    id: string
): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const result = await deleteHomeStat(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Suppression échouée" };
        }

        revalidatePath("/admin/home/about");
        revalidatePath("/");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * REORDER home stats
 */
export async function reorderHomeStatsAction(
    input: unknown
): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const validated = await ReorderHomeStatsSchema.parseAsync(input);
        const result = await reorderHomeStats(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Réorganisation échouée" };
        }

        revalidatePath("/admin/home/about");
        revalidatePath("/");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
