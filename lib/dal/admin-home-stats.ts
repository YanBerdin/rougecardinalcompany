"use server";
import "server-only";

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdminOnly } from "@/lib/auth/roles";
import {
    type DALResult,
    dalSuccess,
    dalError,
    generateSlug,
} from "@/lib/dal/helpers";
import {
    HomeStatInputSchema,
    type HomeStatInput,
    type HomeStatDTO,
    type ReorderHomeStatsInput,
} from "@/lib/schemas/home-content";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawStatRow {
    id: unknown;
    key: string;
    label: string;
    value: string;
    position: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAT_SELECT_FIELDS =
    "id, key, label, value, position, active, created_at, updated_at";

// ─── Private helpers ──────────────────────────────────────────────────────────

function mapToHomeStatDTO(raw: RawStatRow): HomeStatDTO {
    return {
        id: Number(raw.id),
        label: raw.label,
        value: raw.value,
        icon: null, // table compagnie_stats has no icon column yet
        position: raw.position,
        active: raw.active,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
    };
}

async function getNextPosition(
    supabase: Awaited<ReturnType<typeof createClient>>
): Promise<number> {
    const { data } = await supabase
        .from("compagnie_stats")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)
        .single();
    return (data?.position ?? -1) + 1;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetch all home stats (admin view — includes inactive)
 */
export const fetchHomeStats = cache(
    async (): Promise<DALResult<HomeStatDTO[]>> => {
        await requireAdminOnly();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("compagnie_stats")
            .select(STAT_SELECT_FIELDS)
            .order("position", { ascending: true });

        if (error) {
            return dalError(`[ERR_HOME_S01] ${error.message}`);
        }

        return dalSuccess(
            (data ?? []).map((row) => mapToHomeStatDTO(row as unknown as RawStatRow))
        );
    }
);

/**
 * Create new home stat
 */
export async function createHomeStat(
    input: HomeStatInput
): Promise<DALResult<HomeStatDTO>> {
    await requireAdminOnly();
    await HomeStatInputSchema.parseAsync(input);

    const supabase = await createClient();
    const nextPosition = await getNextPosition(supabase);
    const key = generateSlug(input.label);

    const { data, error } = await supabase
        .from("compagnie_stats")
        .insert({
            key,
            label: input.label,
            value: input.value,
            position: input.position !== undefined ? Number(input.position) : nextPosition,
            active: input.active ?? true,
        })
        .select(STAT_SELECT_FIELDS)
        .single();

    if (error) {
        return dalError(`[ERR_HOME_S02] ${error.message}`);
    }

    return dalSuccess(mapToHomeStatDTO(data as unknown as RawStatRow));
}

/**
 * Update existing home stat
 */
export async function updateHomeStat(
    id: bigint,
    input: Partial<HomeStatInput>
): Promise<DALResult<HomeStatDTO>> {
    await requireAdminOnly();
    await HomeStatInputSchema.partial().parseAsync(input);

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("compagnie_stats")
        .update({
            ...(input.label !== undefined && { label: input.label }),
            ...(input.value !== undefined && { value: input.value }),
            ...(input.position !== undefined && { position: Number(input.position) }),
            ...(input.active !== undefined && { active: input.active }),
        })
        .eq("id", id.toString())
        .select(STAT_SELECT_FIELDS)
        .single();

    if (error) {
        return dalError(`[ERR_HOME_S03] ${error.message}`);
    }

    return dalSuccess(mapToHomeStatDTO(data as unknown as RawStatRow));
}

/**
 * Delete home stat
 */
export async function deleteHomeStat(id: bigint): Promise<DALResult<void>> {
    await requireAdminOnly();

    const supabase = await createClient();
    const { error } = await supabase
        .from("compagnie_stats")
        .delete()
        .eq("id", id.toString());

    if (error) {
        return dalError(`[ERR_HOME_S04] ${error.message}`);
    }

    return dalSuccess(undefined);
}

/**
 * Reorder home stats (batch update positions)
 */
export async function reorderHomeStats(
    input: ReorderHomeStatsInput
): Promise<DALResult<void>> {
    await requireAdminOnly();

    const supabase = await createClient();

    const updates = input.items.map((item) =>
        supabase
            .from("compagnie_stats")
            .update({ position: item.position })
            .eq("id", item.id.toString())
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);

    if (failed?.error) {
        return dalError(`[ERR_HOME_S05] ${failed.error.message}`);
    }

    return dalSuccess(undefined);
}
