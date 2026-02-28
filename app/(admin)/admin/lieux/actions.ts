"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLieu, updateLieu, deleteLieu } from "@/lib/dal/admin-lieux";
import { LieuInputSchema, toClientDTO, type LieuClientDTO } from "@/lib/schemas/admin-lieux";
import type { ActionResult } from "@/lib/actions/types";

/**
 * CREATE Lieu
 */
export async function createLieuAction(input: unknown): Promise<ActionResult<LieuClientDTO>> {
    try {
        // 1. Validation Zod
        const validated = LieuInputSchema.parse(input);

        // 2. Appel DAL
        const result = await createLieu(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Create failed" };
        }

        // 3. ✅ Revalidation UNIQUEMENT ICI (pas dans DAL)
        revalidatePath("/admin/lieux");
        revalidatePath("/admin/agenda"); // Rafraîchir select lieux dans agenda

        // 4. ✅ Convertir bigint → number pour le client
        return { success: true, data: toClientDTO(result.data) };
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return {
                success: false,
                error: `Validation échouée: ${err.issues.map(i => i.message).join(", ")}`,
            };
        }
        return {
            success: false,
            error: err instanceof Error ? err.message : "Erreur inconnue",
        };
    }
}

/**
 * UPDATE Lieu
 */
export async function updateLieuAction(
    id: string,
    input: unknown
): Promise<ActionResult<LieuClientDTO>> {
    try {
        const validated = LieuInputSchema.partial().parse(input);
        const result = await updateLieu(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        revalidatePath("/admin/lieux");
        revalidatePath("/admin/agenda");

        // ✅ Convertir bigint → number pour le client
        return { success: true, data: toClientDTO(result.data) };
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return {
                success: false,
                error: `Validation échouée: ${err.issues.map(i => i.message).join(", ")}`,
            };
        }
        return {
            success: false,
            error: err instanceof Error ? err.message : "Erreur inconnue",
        };
    }
}

/**
 * DELETE Lieu
 */
export async function deleteLieuAction(id: string): Promise<ActionResult<null>> {
    try {
        const result = await deleteLieu(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Delete failed" };
        }

        revalidatePath("/admin/lieux");
        revalidatePath("/admin/agenda");

        return { success: true, data: null };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Erreur inconnue",
        };
    }
}
