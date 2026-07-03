"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/actions/types";
import {
    ArticleInputSchema,
    ReorderArticlesSchema,
    type ArticleInput,
    type ReorderArticlesInput,
} from "@/lib/schemas/press-article";
import {
    createArticle,
    updateArticle,
    deleteArticle,
    reorderArticles,
} from "@/lib/dal/admin-press-articles";
import { requireMinRole } from "@/lib/auth/roles";

// =============================================================================
// PRESS ARTICLES ACTIONS
// =============================================================================

/**
 * CREATE article action
 */
export async function createArticleAction(
    input: unknown
): Promise<ActionResult<{ id: string }>> {
    try {
        await requireMinRole("editor");

        const validated: ArticleInput = await ArticleInputSchema.parseAsync(input);
        const result = await createArticle(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Create failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true, data: { id: String(result.data.id) } };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UPDATE article action
 */
export async function updateArticleAction(
    id: string,
    input: unknown
): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const validated = await ArticleInputSchema.partial().parseAsync(input);
        const result = await updateArticle(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * DELETE article action
 */
export async function deleteArticleAction(id: string): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const result = await deleteArticle(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Delete failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * REORDER articles action (drag-and-drop)
 */
export async function reorderArticlesAction(
    input: unknown
): Promise<ActionResult> {
    try {
        const validated: ReorderArticlesInput = ReorderArticlesSchema.parse(input);
        const result = await reorderArticles(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Reorder failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");
        revalidatePath("/"); // Homepage "À la une" widget

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
