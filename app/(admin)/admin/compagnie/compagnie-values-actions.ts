"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/actions/types";
import {
    CompagnieValueInputSchema,
    ReorderCompagnieValuesSchema,
} from "@/lib/schemas/compagnie-admin";
import {
    createCompagnieValue,
    updateCompagnieValue,
    deleteCompagnieValue,
    reorderCompagnieValues,
} from "@/lib/dal/admin-compagnie-values";
import { generateSlug } from "@/lib/dal/helpers";
import { requireMinRole } from "@/lib/auth/roles";

// =============================================================================
// COMPAGNIE VALUES ACTIONS
// =============================================================================

/**
 * CREATE compagnie value
 */
export async function createCompagnieValueAction(
    input: unknown
): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const raw = input as Record<string, unknown>;
        const validated = await CompagnieValueInputSchema.parseAsync({
            ...raw,
            key: (raw.key as string | undefined) || generateSlug(raw.title as string),
        });

        const result = await createCompagnieValue(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Création échouée" };
        }

        revalidatePath("/admin/compagnie");
        revalidatePath("/compagnie");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UPDATE compagnie value
 */
export async function updateCompagnieValueAction(
    id: string,
    input: unknown
): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const validated = await CompagnieValueInputSchema.partial().parseAsync(input);
        const result = await updateCompagnieValue(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Mise à jour échouée" };
        }

        revalidatePath("/admin/compagnie");
        revalidatePath("/compagnie");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * DELETE compagnie value
 */
export async function deleteCompagnieValueAction(
    id: string
): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const result = await deleteCompagnieValue(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Suppression échouée" };
        }

        revalidatePath("/admin/compagnie");
        revalidatePath("/compagnie");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * REORDER compagnie values
 */
export async function reorderCompagnieValuesAction(
    input: unknown
): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const validated = await ReorderCompagnieValuesSchema.parseAsync(input);
        const result = await reorderCompagnieValues(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Réorganisation échouée" };
        }

        revalidatePath("/admin/compagnie");
        revalidatePath("/compagnie");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
