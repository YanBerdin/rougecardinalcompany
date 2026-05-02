"use server";
import "server-only";

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireMinRole } from "@/lib/auth/roles";
import {
    type DALResult,
    dalSuccess,
    dalError,
    buildMediaPublicUrl,
    generateSlug,
} from "@/lib/dal/helpers";
import {
    PresentationSectionInputSchema,
    type PresentationSectionInput,
    type PresentationSectionDTO,
    type SectionKind,
} from "@/lib/schemas/compagnie-admin";

// ─── Types ────────────────────────────────────────────────────────────────────

type RawMediaData =
    | { storage_path: string }
    | { storage_path: string }[]
    | null;

interface RawPresentationRow {
    id: unknown;
    slug: string;
    kind: string;
    title: string | null;
    subtitle: string | null;
    content: string[] | null;
    quote_text: string | null;
    quote_author: string | null;
    image_url: string | null;
    image_media_id: unknown;
    alt_text: string | null;
    milestones: unknown;
    position: number;
    active: boolean;
    created_at: string;
    updated_at: string;
    media: RawMediaData;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_SELECT_FIELDS = `
  id,
  slug,
  kind,
  title,
  subtitle,
  content,
  quote_text,
  quote_author,
  image_url,
  image_media_id,
  alt_text,
  milestones,
  position,
  active,
  created_at,
  updated_at,
  media:image_media_id (
    storage_path
  )
`;

// ─── Private helpers ──────────────────────────────────────────────────────────

function mapToPresentationSectionDTO(raw: RawPresentationRow): PresentationSectionDTO {
    const storagePath = Array.isArray(raw.media)
        ? raw.media[0]?.storage_path ?? null
        : raw.media?.storage_path ?? null;

    return {
        id: Number(raw.id),
        slug: raw.slug,
        kind: raw.kind as SectionKind,
        title: raw.title,
        subtitle: raw.subtitle,
        content: raw.content,
        quote_text: raw.quote_text,
        quote_author: raw.quote_author,
        image_url: buildMediaPublicUrl(storagePath) ?? raw.image_url ?? null,
        image_media_id: raw.image_media_id ? Number(raw.image_media_id) : null,
        alt_text: raw.alt_text,
        milestones: Array.isArray(raw.milestones)
            ? (raw.milestones as Array<{ year: string; label: string }>)
            : null,
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
        .from("compagnie_presentation_sections")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)
        .single();
    return (data?.position ?? -1) + 1;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetch all presentation sections (admin view — includes inactive)
 */
export const fetchAllPresentationSectionsAdmin = cache(
    async (): Promise<DALResult<PresentationSectionDTO[]>> => {
        await requireMinRole("editor");

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("compagnie_presentation_sections")
            .select(SECTION_SELECT_FIELDS)
            .order("position", { ascending: true });

        if (error) {
            return dalError(`[ERR_COMPAGNIE_P01] ${error.message}`);
        }

        return dalSuccess(
            (data ?? []).map((row) => mapToPresentationSectionDTO(row as unknown as RawPresentationRow))
        );
    }
);

/**
 * Create new presentation section
 */
export async function createPresentationSection(
    input: PresentationSectionInput
): Promise<DALResult<PresentationSectionDTO>> {
    await requireMinRole("editor");
    await PresentationSectionInputSchema.parseAsync(input);

    const supabase = await createClient();
    const nextPosition = await getNextPosition(supabase);
    const slug = input.slug?.trim() || generateSlug(`${input.kind}-${Date.now()}`);

    const { data, error } = await supabase
        .from("compagnie_presentation_sections")
        .insert({
            slug,
            kind: input.kind,
            title: input.title ?? null,
            subtitle: input.subtitle ?? null,
            content: input.content ?? null,
            quote_text: input.quote_text ?? null,
            quote_author: input.quote_author ?? null,
            image_url: input.image_url || null,
            image_media_id: input.image_media_id ? Number(input.image_media_id) : null,
            alt_text: input.alt_text ?? null,
            milestones: input.milestones ?? null,
            position: input.position ?? nextPosition,
            active: input.active ?? true,
        })
        .select(SECTION_SELECT_FIELDS)
        .single();

    if (error) {
        return dalError(`[ERR_COMPAGNIE_P02] ${error.message}`);
    }

    return dalSuccess(mapToPresentationSectionDTO(data as unknown as RawPresentationRow));
}

/**
 * Update presentation section
 */
export async function updatePresentationSection(
    id: bigint,
    input: Partial<PresentationSectionInput>
): Promise<DALResult<PresentationSectionDTO>> {
    await requireMinRole("editor");
    await PresentationSectionInputSchema.partial().parseAsync(input);

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("compagnie_presentation_sections")
        .update({
            ...(input.slug !== undefined && { slug: input.slug }),
            ...(input.kind !== undefined && { kind: input.kind }),
            ...(input.title !== undefined && { title: input.title ?? null }),
            ...(input.subtitle !== undefined && { subtitle: input.subtitle ?? null }),
            ...(input.content !== undefined && { content: input.content ?? null }),
            ...(input.quote_text !== undefined && { quote_text: input.quote_text ?? null }),
            ...(input.quote_author !== undefined && { quote_author: input.quote_author ?? null }),
            ...(input.image_url !== undefined && { image_url: input.image_url || null }),
            ...(input.image_media_id !== undefined && {
                image_media_id: input.image_media_id ? Number(input.image_media_id) : null,
            }),
            ...(input.alt_text !== undefined && { alt_text: input.alt_text ?? null }),
            ...(input.milestones !== undefined && { milestones: input.milestones ?? null }),
            ...(input.position !== undefined && { position: input.position }),
            ...(input.active !== undefined && { active: input.active }),
        })
        .eq("id", id.toString())
        .select(SECTION_SELECT_FIELDS)
        .single();

    if (error) {
        return dalError(`[ERR_COMPAGNIE_P03] ${error.message}`);
    }

    return dalSuccess(mapToPresentationSectionDTO(data as unknown as RawPresentationRow));
}

/**
 * Delete presentation section
 */
export async function deletePresentationSection(id: bigint): Promise<DALResult<void>> {
    await requireMinRole("editor");

    const supabase = await createClient();
    const { error } = await supabase
        .from("compagnie_presentation_sections")
        .delete()
        .eq("id", id.toString());

    if (error) {
        return dalError(`[ERR_COMPAGNIE_P04] ${error.message}`);
    }

    return dalSuccess(undefined);
}

