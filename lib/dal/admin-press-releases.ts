"use server";
import "server-only";

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { dalSuccess, dalError, type DALResult } from "@/lib/dal/helpers";
import {
    type PressReleaseDTO,
    type PressReleaseInput,
} from "@/lib/schemas/press-release";

// ============================================================================
// Internal types
// ============================================================================

interface RawPressReleaseRow {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    date_publication: string;
    image_url: string | null;
    image_media_id: number | null;
    spectacle_id: number | null;
    evenement_id: number | null;
    public: boolean;
    ordre_affichage: number;
    file_size_bytes: number | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    spectacle: { title: string } | null | Array<unknown>;
    evenement: { spectacles: { title: string } } | null | Array<unknown>;
}

/**
 * Map database record to PressReleaseDTO
 * Handles spectacle/evenement which can be arrays or objects from Supabase joins
 */
function mapToPressReleaseDTO(release: RawPressReleaseRow): PressReleaseDTO {
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
export const fetchAllPressReleasesAdmin = cache(
    async (): Promise<DALResult<PressReleaseDTO[]>> => {
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
        return dalError(`[ERR_PRESS_RELEASE_010] ${error.message}`);
    }

    const releases: PressReleaseDTO[] = (data ?? []).map(mapToPressReleaseDTO);

    return dalSuccess(releases);
    }
);

/**
 * Fetch single press release by ID
 */
export const fetchPressReleaseById = cache(
    async (id: bigint): Promise<DALResult<PressReleaseDTO | null>> => {
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
            return dalSuccess(null);
        }
        return dalError(`[ERR_PRESS_RELEASE_011] ${error.message}`);
    }

    // Use helper to handle spectacle/evenement arrays/objects
    const release = mapToPressReleaseDTO(data as unknown as RawPressReleaseRow);

    return dalSuccess(release);
    }
);

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
        return dalError(`[ERR_PRESS_RELEASE_001] ${error.message}`);
    }

    if (!data) {
        return dalError("[ERR_PRESS_RELEASE_001] Failed to create press release");
    }

    return dalSuccess(mapToPressReleaseDTO(data as unknown as RawPressReleaseRow));
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
        return dalError(`[ERR_PRESS_RELEASE_002] ${error.message}`);
    }

    if (!data) {
        return dalError("[ERR_PRESS_RELEASE_002] Failed to update press release");
    }

    return dalSuccess(mapToPressReleaseDTO(data as unknown as RawPressReleaseRow));
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
        return dalError(`[ERR_PRESS_RELEASE_003] ${error.message}`);
    }

    return dalSuccess(null);
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
        return dalError(`[ERR_PRESS_RELEASE_004] ${error.message}`);
    }

    if (!data) {
        return dalError("[ERR_PRESS_RELEASE_004] Failed to publish press release");
    }

    return dalSuccess(mapToPressReleaseDTO(data as unknown as RawPressReleaseRow));
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
        return dalError(`[ERR_PRESS_RELEASE_005] ${error.message}`);
    }

    if (!data) {
        return dalError("[ERR_PRESS_RELEASE_005] Failed to unpublish press release");
    }

    return dalSuccess(mapToPressReleaseDTO(data as unknown as RawPressReleaseRow));
}
