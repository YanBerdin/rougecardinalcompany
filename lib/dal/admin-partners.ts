"use server";
import "server-only";

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import {
    type DALResult,
    dalSuccess,
    dalError,
    buildMediaPublicUrl,
} from "@/lib/dal/helpers";
import {
    PartnerInputSchema,
    type PartnerDTO,
    type PartnerInput,
    type ReorderPartnersInput,
} from "@/lib/schemas/partners";

// ─── Types ───────────────────────────────────────────────────────────────────

type RawMediaData =
    | { storage_path: string }
    | { storage_path: string }[]
    | null;

interface RawPartnerRow {
    id: unknown;
    name: string;
    website_url: string | null;
    logo_url: string | null;
    logo_media_id: unknown;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    media: RawMediaData;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTNER_SELECT_FIELDS = `
  id,
  name,
  website_url,
  logo_url,
  logo_media_id,
  display_order,
  is_active,
  created_at,
  updated_at,
  media:logo_media_id (
    storage_path
  )
`;

// ─── Private helpers ──────────────────────────────────────────────────────────

function mapToPartnerDTO(raw: RawPartnerRow): PartnerDTO {
    const storagePath = Array.isArray(raw.media)
        ? raw.media[0]?.storage_path ?? null
        : raw.media?.storage_path ?? null;

    return {
        id: Number(raw.id),
        name: raw.name,
        website_url: raw.website_url,
        logo_media_id: raw.logo_media_id ? Number(raw.logo_media_id) : null,
        logo_url: buildMediaPublicUrl(storagePath) ?? raw.logo_url ?? null,
        display_order: raw.display_order,
        active: raw.is_active,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
    };
}

async function getNextDisplayOrder(
    supabase: Awaited<ReturnType<typeof createClient>>
): Promise<number> {
    const { data } = await supabase
        .from("partners")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .single();
    return (data?.display_order ?? -1) + 1;
}

function buildPartnerUpdatePayload(
    input: Partial<PartnerInput>
): Record<string, unknown> {
    return {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.website_url !== undefined && {
            website_url: input.website_url ?? null,
        }),
        ...(input.logo_media_id !== undefined && {
            logo_media_id: input.logo_media_id
                ? Number(input.logo_media_id)
                : null,
        }),
        ...(input.active !== undefined && { is_active: input.active }),
    };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetch all partners (admin view - includes inactive)
 */
export const fetchAllPartnersAdmin = cache(
    async (): Promise<DALResult<PartnerDTO[]>> => {
        await requireAdmin();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("partners")
            .select(PARTNER_SELECT_FIELDS)
            .order("display_order", { ascending: true });

        if (error) {
            return dalError(`[ERR_PARTNER_001] ${error.message}`);
        }

        return dalSuccess(
            (data ?? []).map((row) => mapToPartnerDTO(row as unknown as RawPartnerRow))
        );
    }
);

/**
 * Fetch single partner by ID
 */
export const fetchPartnerById = cache(
    async (id: bigint): Promise<DALResult<PartnerDTO | null>> => {
        await requireAdmin();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("partners")
            .select(PARTNER_SELECT_FIELDS)
            .eq("id", id.toString())
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return dalSuccess(null);
            }
            return dalError(`[ERR_PARTNER_002] ${error.message}`);
        }

        return dalSuccess(mapToPartnerDTO(data as unknown as RawPartnerRow));
    }
);

/**
 * Create new partner
 */
export async function createPartner(
    input: PartnerInput
): Promise<DALResult<PartnerDTO>> {
    await requireAdmin();
    await PartnerInputSchema.parseAsync(input);

    const supabase = await createClient();
    const nextOrder = await getNextDisplayOrder(supabase);

    const { data, error } = await supabase
        .from("partners")
        .insert({
            name: input.name,
            website_url: input.website_url ?? null,
            logo_media_id: input.logo_media_id
                ? Number(input.logo_media_id)
                : null,
            display_order: nextOrder,
            is_active: input.active ?? true,
        })
        .select(PARTNER_SELECT_FIELDS)
        .single();

    if (error) {
        return dalError(`[ERR_PARTNER_003] ${error.message}`);
    }

    return dalSuccess(mapToPartnerDTO(data as unknown as RawPartnerRow));
}

/**
 * Update existing partner
 */
export async function updatePartner(
    id: bigint,
    input: Partial<PartnerInput>
): Promise<DALResult<PartnerDTO>> {
    await requireAdmin();
    await PartnerInputSchema.partial().parseAsync(input);

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("partners")
        .update(buildPartnerUpdatePayload(input))
        .eq("id", id.toString())
        .select(PARTNER_SELECT_FIELDS)
        .single();

    if (error) {
        return dalError(`[ERR_PARTNER_004] ${error.message}`);
    }

    return dalSuccess(mapToPartnerDTO(data as unknown as RawPartnerRow));
}

/**
 * Delete partner
 */
export async function deletePartner(id: bigint): Promise<DALResult<void>> {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase
        .from("partners")
        .delete()
        .eq("id", id.toString());

    if (error) {
        return dalError(`[ERR_PARTNER_005] ${error.message}`);
    }

    return dalSuccess(undefined);
}

/**
 * Reorder partners (batch update display_order)
 */
export async function reorderPartners(
    input: ReorderPartnersInput
): Promise<DALResult<void>> {
    await requireAdmin();

    const supabase = await createClient();

    const updates = input.partners.map((partner) =>
        supabase
            .from("partners")
            .update({ display_order: partner.display_order })
            .eq("id", partner.id.toString())
    );

    const results = await Promise.all(updates);
    const failedUpdate = results.find((result) => result.error);

    if (failedUpdate?.error) {
        return dalError(`[ERR_PARTNER_006] ${failedUpdate.error.message}`);
    }

    return dalSuccess(undefined);
}
