"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/actions/types";
import {
    PresentationSectionInputSchema,
} from "@/lib/schemas/compagnie-admin";
import {
    updatePresentationSection,
} from "@/lib/dal/admin-compagnie-presentation";
import { requireMinRole } from "@/lib/auth/roles";

// =============================================================================
// PRESENTATION SECTIONS ACTIONS
// =============================================================================

/**
 * UPDATE presentation section
 */
export async function updatePresentationSectionAction(
    id: string,
    input: unknown
): Promise<ActionResult> {
    try {
        await requireMinRole("editor");

        const validated = await PresentationSectionInputSchema.partial().parseAsync(input);
        const result = await updatePresentationSection(BigInt(id), validated);

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