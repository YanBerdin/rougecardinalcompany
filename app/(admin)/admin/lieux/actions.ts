"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLieu, updateLieu, deleteLieu } from "@/lib/dal/admin-lieux";
import { LieuInputSchema, type LieuDTO } from "@/lib/schemas/admin-lieux";

export type ActionResult<T = unknown> =
    | { success: true; data?: T }
    | { success: false; error: string };

// ✅ Client DTO (number au lieu de bigint pour sérialisation JSON)
export type LieuClientDTO = {
    id: number;
    nom: string;
    adresse: string | null;
    ville: string | null;
    code_postal: string | null;
    pays: string;
    latitude: number | null;
    longitude: number | null;
    capacite: number | null;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
};

// ✅ Helper pour convertir LieuDTO → LieuClientDTO
function toClientDTO(lieu: LieuDTO): LieuClientDTO {
    return {
        id: Number(lieu.id),
        nom: lieu.nom,
        adresse: lieu.adresse,
        ville: lieu.ville,
        code_postal: lieu.code_postal,
        pays: lieu.pays,
        latitude: lieu.latitude,
        longitude: lieu.longitude,
        capacite: lieu.capacite,
        metadata: lieu.metadata,
        created_at: lieu.created_at,
        updated_at: lieu.updated_at,
    };
}

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
export async function deleteLieuAction(id: string): Promise<ActionResult> {
    try {
        const result = await deleteLieu(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Delete failed" };
        }

        revalidatePath("/admin/lieux");
        revalidatePath("/admin/agenda");

        return { success: true };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Erreur inconnue",
        };
    }
}
