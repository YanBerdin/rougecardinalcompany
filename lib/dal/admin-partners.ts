"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { type DALResult } from "@/lib/dal/helpers";
import {
    type PartnerDTO,
    type PartnerInput,
    type ReorderPartnersInput,
} from "@/lib/schemas/partners";

/**
 * Build public URL from storage_path
 */
function buildMediaUrl(storagePath: string | null): string | null {
    if (!storagePath) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medias/${storagePath}`;
}

/**
 * Fetch all partners (admin view - includes inactive)
 */
export async function fetchAllPartnersAdmin(): Promise<DALResult<PartnerDTO[]>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("partners")
        .select(
            `
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
    `
        )
        .order("display_order", { ascending: true });

    if (error) {
        return { success: false, error: error.message };
    }

    const partners: PartnerDTO[] = (data ?? []).map((partner) => {
        const mediaData = partner.media as { storage_path: string } | { storage_path: string }[] | null;
        const storagePath = Array.isArray(mediaData) 
            ? mediaData[0]?.storage_path ?? null 
            : mediaData?.storage_path ?? null;

        return {
            id: Number(partner.id),
            name: partner.name,
            website_url: partner.website_url,
            logo_media_id: partner.logo_media_id ? Number(partner.logo_media_id) : null,
            logo_url: buildMediaUrl(storagePath) ?? partner.logo_url ?? null,
            display_order: partner.display_order,
            active: partner.is_active,
            created_at: partner.created_at,
            updated_at: partner.updated_at,
        };
    });

    return { success: true, data: partners };
}

/**
 * Fetch single partner by ID
 */
export async function fetchPartnerById(
    id: bigint
): Promise<DALResult<PartnerDTO | null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("partners")
        .select(
            `
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
    `
        )
        .eq("id", id.toString())
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        return { success: false, error: error.message };
    }

    const mediaData = data.media as { storage_path: string } | { storage_path: string }[] | null;
    const storagePath = Array.isArray(mediaData) 
        ? mediaData[0]?.storage_path ?? null 
        : mediaData?.storage_path ?? null;

    const partner: PartnerDTO = {
        id: Number(data.id),
        name: data.name,
        website_url: data.website_url,
        logo_media_id: data.logo_media_id ? Number(data.logo_media_id) : null,
        logo_url: buildMediaUrl(storagePath) ?? data.logo_url ?? null,
        display_order: data.display_order,
        active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };

    return { success: true, data: partner };
}

/**
 * Create new partner
 */
export async function createPartner(
    input: PartnerInput
): Promise<DALResult<PartnerDTO>> {
    await requireAdmin();

    const supabase = await createClient();

    // Get max display_order for new partner
    const { data: maxOrderData } = await supabase
        .from("partners")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .single();

    const nextOrder = (maxOrderData?.display_order ?? -1) + 1;

    const { data, error } = await supabase
        .from("partners")
        .insert({
            name: input.name,
            website_url: input.website_url ?? null,
            logo_media_id: input.logo_media_id ? Number(input.logo_media_id) : null,
            display_order: nextOrder,
            is_active: input.active ?? true,
        })
        .select(
            `
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
    `
        )
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    const mediaData = data.media as { storage_path: string } | { storage_path: string }[] | null;
    const storagePath = Array.isArray(mediaData) 
        ? mediaData[0]?.storage_path ?? null 
        : mediaData?.storage_path ?? null;

    const partner: PartnerDTO = {
        id: Number(data.id),
        name: data.name,
        website_url: data.website_url,
        logo_media_id: data.logo_media_id ? Number(data.logo_media_id) : null,
        logo_url: buildMediaUrl(storagePath) ?? data.logo_url ?? null,
        display_order: data.display_order,
        active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };

    return { success: true, data: partner };
}

/**
 * Update existing partner
 */
export async function updatePartner(
    id: bigint,
    input: Partial<PartnerInput>
): Promise<DALResult<PartnerDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("partners")
        .update({
            ...(input.name !== undefined && { name: input.name }),
            ...(input.website_url !== undefined && {
                website_url: input.website_url ?? null,
            }),
            ...(input.logo_media_id !== undefined && {
                logo_media_id: input.logo_media_id ? Number(input.logo_media_id) : null,
            }),
            ...(input.active !== undefined && { is_active: input.active }),
        })
        .eq("id", id.toString())
        .select(
            `
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
    `
        )
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    const mediaData = data.media as { storage_path: string } | { storage_path: string }[] | null;
    const storagePath = Array.isArray(mediaData) 
        ? mediaData[0]?.storage_path ?? null 
        : mediaData?.storage_path ?? null;

    const partner: PartnerDTO = {
        id: Number(data.id),
        name: data.name,
        website_url: data.website_url,
        logo_media_id: data.logo_media_id ? Number(data.logo_media_id) : null,
        logo_url: buildMediaUrl(storagePath) ?? data.logo_url ?? null,
        display_order: data.display_order,
        active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };

    return { success: true, data: partner };
}

/**
 * Delete partner
 */
export async function deletePartner(id: bigint): Promise<DALResult<void>> {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase.from("partners").delete().eq("id", id.toString());

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
}

/**
 * Reorder partners (batch update display_order)
 */
export async function reorderPartners(
    input: ReorderPartnersInput
): Promise<DALResult<void>> {
    await requireAdmin();

    const supabase = await createClient();

    // Update each partner's display_order
    const updates = input.partners.map((partner) =>
        supabase
            .from("partners")
            .update({ display_order: partner.display_order })
            .eq("id", partner.id.toString())
    );

    const results = await Promise.all(updates);

    const failedUpdate = results.find((result) => result.error);
    if (failedUpdate?.error) {
        return { success: false, error: failedUpdate.error.message };
    }

    return { success: true, data: undefined };
}
