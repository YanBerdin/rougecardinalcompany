"use server";
import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { DALResult } from "@/lib/dal/helpers";
import { dalSuccess, dalError } from "@/lib/dal/helpers";
import type { LieuInput, LieuDTO } from "@/lib/schemas/admin-lieux";

/**
 * Fetch all lieux (admin)
 * @returns DALResult with array of LieuDTO
 */
export const fetchAllLieuxAdmin = cache(async (): Promise<DALResult<LieuDTO[]>> => {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("lieux")
        .select("*")
        .order("nom", { ascending: true });

    if (error) {
        console.error("[ERR_LIEUX_001] Failed to fetch lieux:", error);
        return dalError("[ERR_LIEUX_001] Failed to fetch lieux");
    }

    return dalSuccess(data ?? []);
});

/**
 * Fetch lieu by ID (admin)
 * @param id - Lieu ID
 * @returns DALResult with LieuDTO or null
 */
export const fetchLieuByIdAdmin = cache(
    async (id: bigint): Promise<DALResult<LieuDTO | null>> => {
        await requireAdmin();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("lieux")
            .select("*")
            .eq("id", String(id))
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return dalSuccess(null);
            }
            console.error("[ERR_LIEUX_002] Failed to fetch lieu:", error);
            return dalError("[ERR_LIEUX_002] Failed to fetch lieu");
        }

        return dalSuccess(data);
    }
);

/**
 * Create lieu
 * @param input - LieuInput data
 * @returns DALResult with created LieuDTO
 */
export async function createLieu(input: LieuInput): Promise<DALResult<LieuDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("lieux")
        .insert(input)
        .select()
        .single();

    if (error) {
        console.error("[ERR_LIEUX_003] Failed to create lieu:", error);
        return dalError("[ERR_LIEUX_003] Failed to create lieu");
    }

    return dalSuccess(data);
}

/**
 * Update lieu
 * @param id - Lieu ID
 * @param input - Partial LieuInput data
 * @returns DALResult with updated LieuDTO
 */
export async function updateLieu(
    id: bigint,
    input: Partial<LieuInput>
): Promise<DALResult<LieuDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("lieux")
        .update(input)
        .eq("id", String(id))
        .select()
        .single();

    if (error) {
        console.error("[ERR_LIEUX_004] Failed to update lieu:", error);
        return dalError("[ERR_LIEUX_004] Failed to update lieu");
    }

    return dalSuccess(data);
}

/**
 * Delete lieu
 * @param id - Lieu ID
 * @returns DALResult with null on success
 */
export async function deleteLieu(id: bigint): Promise<DALResult<null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase.from("lieux").delete().eq("id", String(id));

    if (error) {
        console.error("[ERR_LIEUX_005] Failed to delete lieu:", error);
        return dalError("[ERR_LIEUX_005] Failed to delete lieu");
    }

    return dalSuccess(null);
}
