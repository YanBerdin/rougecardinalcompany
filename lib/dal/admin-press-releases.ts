"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { type DALResult } from "@/lib/dal/helpers";
import {
    type PressReleaseDTO,
    type PressReleaseInput,
    type SelectOptionDTO,
} from "@/lib/schemas/press-release";

/**
 * Build public URL from storage_path
 */
function buildMediaUrl(storagePath: string | null): string | null {
    if (!storagePath) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medias/${storagePath}`;
}

/**
 * Map database record to PressReleaseDTO
 * Handles spectacle/evenement which can be arrays or objects from Supabase joins
 */
function mapToPressReleaseDTO(release: any): PressReleaseDTO {
    return {
        id: Number(release.id),
        title: release.title,
        slug: release.slug,
        description: release.description,
        date_publication: release.date_publication,
        image_url: release.image_url,
        image_media_id: release.image_media_id ? Number(release.image_media_id) : null,
        spectacle_id: release.spectacle_id ? Number(release.spectacle_id) : null,
        evenement_id: release.evenement_id ? Number(release.evenement_id) : null,
        public: release.public,
        ordre_affichage: release.ordre_affichage,
        file_size_bytes: release.file_size_bytes ? Number(release.file_size_bytes) : null,
        created_by: release.created_by,
        created_at: release.created_at,
        updated_at: release.updated_at,
        spectacle_titre: Array.isArray(release.spectacle)
            ? null
            : (release.spectacle as { title: string } | null)?.title ?? null,
        evenement_titre: Array.isArray(release.evenement)
            ? null
            : (release.evenement as { spectacles: { title: string } } | null)?.spectacles?.title ?? null,
    };
}

/**
 * Fetch all press releases (admin view - includes drafts)
 */
export async function fetchAllPressReleasesAdmin(): Promise<
    DALResult<PressReleaseDTO[]>
> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("communiques_presse")
        .select(
            `
      id,
      title,
      slug,
      description,
      date_publication,
      image_url,
      image_media_id,
      spectacle_id,
      evenement_id,
      public,
      ordre_affichage,
      file_size_bytes,
      created_by,
      created_at,
      updated_at,
      spectacle:spectacle_id (title),
      evenement:evenement_id (spectacle_id, spectacles(title))
    `
        )
        .order("date_publication", { ascending: false });

    if (error) {
        return { success: false, error: error.message };
    }

    const releases: PressReleaseDTO[] = (data ?? []).map(mapToPressReleaseDTO);

    return { success: true, data: releases };
}

/**
 * Fetch single press release by ID
 */
export async function fetchPressReleaseById(
    id: bigint
): Promise<DALResult<PressReleaseDTO | null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("communiques_presse")
        .select(
            `
      id,
      title,
      slug,
      description,
      date_publication,
      image_url,
      image_media_id,
      spectacle_id,
      evenement_id,
      public,
      ordre_affichage,
      file_size_bytes,
      created_by,
      created_at,
      updated_at,
      spectacle:spectacle_id (title),
      evenement:evenement_id (spectacle_id, spectacles(title))
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

    // Use helper to handle spectacle/evenement arrays/objects
    const release = mapToPressReleaseDTO(data);

    return { success: true, data: release };
}

/**
 * Create new press release
 */
export async function createPressRelease(
    input: PressReleaseInput
): Promise<DALResult<PressReleaseDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("communiques_presse")
        .insert({
            title: input.title,
            slug: input.slug,
            description: input.description,
            date_publication: input.date_publication,
            image_url: input.image_url,
            image_media_id: input.image_media_id?.toString(),
            spectacle_id: input.spectacle_id?.toString(),
            evenement_id: input.evenement_id?.toString(),
            public: input.public,
            ordre_affichage: input.ordre_affichage,
            created_by: user?.id,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: `[ERR_PRESS_RELEASE_001] ${error.message}` };
    }

    if (!data) {
        return { success: false, error: "[ERR_PRESS_RELEASE_001] Failed to create press release" };
    }

    return { success: true, data: mapToPressReleaseDTO(data) };
}

/**
 * Update press release
 */
export async function updatePressRelease(
    id: bigint,
    input: Partial<PressReleaseInput>
): Promise<DALResult<PressReleaseDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("communiques_presse")
        .update({
            title: input.title,
            slug: input.slug,
            description: input.description,
            date_publication: input.date_publication,
            image_url: input.image_url,
            image_media_id: input.image_media_id?.toString(),
            spectacle_id: input.spectacle_id?.toString(),
            evenement_id: input.evenement_id?.toString(),
            public: input.public,
            ordre_affichage: input.ordre_affichage,
        })
        .eq("id", id.toString())
        .select()
        .single();

    if (error) {
        return { success: false, error: `[ERR_PRESS_RELEASE_002] ${error.message}` };
    }

    if (!data) {
        return { success: false, error: "[ERR_PRESS_RELEASE_002] Failed to update press release" };
    }

    return { success: true, data: mapToPressReleaseDTO(data) };
}

/**
 * Delete press release
 */
export async function deletePressRelease(
    id: bigint
): Promise<DALResult<null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase
        .from("communiques_presse")
        .delete()
        .eq("id", id.toString());

    if (error) {
        return { success: false, error: `[ERR_PRESS_RELEASE_003] ${error.message}` };
    }

    return { success: true, data: null };
}

/**
 * Publish press release
 */
export async function publishPressRelease(
    id: bigint
): Promise<DALResult<PressReleaseDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("communiques_presse")
        .update({ public: true })
        .eq("id", id.toString())
        .select()
        .single();

    if (error) {
        return { success: false, error: `[ERR_PRESS_RELEASE_004] ${error.message}` };
    }

    if (!data) {
        return { success: false, error: "[ERR_PRESS_RELEASE_004] Failed to publish press release" };
    }

    return { success: true, data: mapToPressReleaseDTO(data) };
}

/**
 * Unpublish press release
 */
export async function unpublishPressRelease(
    id: bigint
): Promise<DALResult<PressReleaseDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("communiques_presse")
        .update({ public: false })
        .eq("id", id.toString())
        .select()
        .single();

    if (error) {
        return { success: false, error: `[ERR_PRESS_RELEASE_005] ${error.message}` };
    }

    if (!data) {
        return { success: false, error: "[ERR_PRESS_RELEASE_005] Failed to unpublish press release" };
    }

    return { success: true, data: mapToPressReleaseDTO(data) };
}

/**
 * Fetch spectacles for select dropdown
 */
export async function fetchSpectaclesForSelect(): Promise<
    DALResult<SelectOptionDTO[]>
> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("spectacles")
        .select("id, titre")
        .eq("active", true)
        .order("titre", { ascending: true });

    if (error) {
        return { success: false, error: error.message };
    }

    const options: SelectOptionDTO[] = (data ?? []).map((item) => ({
        id: Number(item.id),
        titre: item.titre,
    }));

    return { success: true, data: options };
}

/**
 * Fetch evenements for select dropdown
 */
export async function fetchEvenementsForSelect(): Promise<
    DALResult<SelectOptionDTO[]>
> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("evenements")
        .select("id, titre")
        .eq("active", true)
        .order("titre", { ascending: true });

    if (error) {
        return { success: false, error: error.message };
    }

    const options: SelectOptionDTO[] = (data ?? []).map((item) => ({
        id: Number(item.id),
        titre: item.titre,
    }));

    return { success: true, data: options };
}
