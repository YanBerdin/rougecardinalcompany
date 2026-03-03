"use server";
import "server-only";

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import {
    type DALResult,
    dalSuccess,
    dalError,
    generateSlug,
} from "@/lib/dal/helpers";
import {
    CompagnieValueInputSchema,
    type CompagnieValueInput,
    type CompagnieValueDTO,
    type ReorderCompagnieValuesInput,
} from "@/lib/schemas/compagnie-admin";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawValueRow {
    id: unknown;
    key: string;
    title: string;
    description: string;
    position: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VALUE_SELECT_FIELDS =
    "id, key, title, description, position, active, created_at, updated_at";

// ─── Private helpers ──────────────────────────────────────────────────────────

function mapToCompagnieValueDTO(raw: RawValueRow): CompagnieValueDTO {
    return {
        id: Number(raw.id),
        key: raw.key,
        title: raw.title,
        description: raw.description,
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
        .from("compagnie_values")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)
        .single();
    return (data?.position ?? -1) + 1;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetch all compagnie values (admin view — includes inactive)
 */
export const fetchAllCompagnieValuesAdmin = cache(
    async (): Promise<DALResult<CompagnieValueDTO[]>> => {
        await requireAdmin();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("compagnie_values")
            .select(VALUE_SELECT_FIELDS)
            .order("position", { ascending: true });

        if (error) {
            return dalError(`[ERR_COMPAGNIE_V01] ${error.message}`);
        }

        return dalSuccess((data ?? []).map((row) => mapToCompagnieValueDTO(row as unknown as RawValueRow)));
    }
);

/**
 * Create new compagnie value
 */
export async function createCompagnieValue(
    input: CompagnieValueInput
): Promise<DALResult<CompagnieValueDTO>> {
    await requireAdmin();
    await CompagnieValueInputSchema.parseAsync(input);

    const supabase = await createClient();
    const nextPosition = await getNextPosition(supabase);
    const key = input.key || generateSlug(input.title);

    const { data, error } = await supabase
        .from("compagnie_values")
        .insert({
            key,
            title: input.title,
            description: input.description,
            position: input.position ?? nextPosition,
            active: input.active ?? true,
        })
        .select(VALUE_SELECT_FIELDS)
        .single();

    if (error) {
        return dalError(`[ERR_COMPAGNIE_V02] ${error.message}`);
    }

    return dalSuccess(mapToCompagnieValueDTO(data as unknown as RawValueRow));
}

/**
 * Update existing compagnie value
 */
export async function updateCompagnieValue(
    id: bigint,
    input: Partial<CompagnieValueInput>
): Promise<DALResult<CompagnieValueDTO>> {
    await requireAdmin();
    await CompagnieValueInputSchema.partial().parseAsync(input);

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("compagnie_values")
        .update({
            ...(input.title !== undefined && { title: input.title }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.position !== undefined && { position: input.position }),
            ...(input.active !== undefined && { active: input.active }),
        })
        .eq("id", id.toString())
        .select(VALUE_SELECT_FIELDS)
        .single();

    if (error) {
        return dalError(`[ERR_COMPAGNIE_V03] ${error.message}`);
    }

    return dalSuccess(mapToCompagnieValueDTO(data as unknown as RawValueRow));
}

/**
 * Delete compagnie value
 */
export async function deleteCompagnieValue(id: bigint): Promise<DALResult<void>> {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase
        .from("compagnie_values")
        .delete()
        .eq("id", id.toString());

    if (error) {
        return dalError(`[ERR_COMPAGNIE_V04] ${error.message}`);
    }

    return dalSuccess(undefined);
}

/**
 * Reorder compagnie values (batch update positions)
 */
export async function reorderCompagnieValues(
    input: ReorderCompagnieValuesInput
): Promise<DALResult<void>> {
    await requireAdmin();

    const supabase = await createClient();

    const updates = input.items.map((item) =>
        supabase
            .from("compagnie_values")
            .update({ position: item.position })
            .eq("id", item.id.toString())
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);

    if (failed?.error) {
        return dalError(`[ERR_COMPAGNIE_V05] ${failed.error.message}`);
    }

    return dalSuccess(undefined);
}
