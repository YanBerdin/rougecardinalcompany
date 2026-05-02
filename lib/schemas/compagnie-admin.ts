import { z } from "zod";
import { addImageUrlValidation } from "@/lib/utils/image-validation-refinements";

// ─── Section kinds ────────────────────────────────────────────────────────────

export const SECTION_KINDS = [
    "hero",
    "history",
    "quote",
    "values",
    "team",
    "mission",
    "founder",
    "custom",
] as const;

export type SectionKind = (typeof SECTION_KINDS)[number];

// ─── Milestone ────────────────────────────────────────────────────────────────

export const MilestoneSchema = z.object({
    year: z.string().min(1).max(10),
    label: z.string().min(1).max(120),
});

export type Milestone = z.infer<typeof MilestoneSchema>;

// =============================================================================
// COMPAGNIE VALUES
// =============================================================================

/**
 * Server Schema — bigint IDs, utilisé dans le DAL
 */
export const CompagnieValueInputSchema = z.object({
    key: z.string().min(1).max(80),
    title: z.string().min(1, "Le titre est requis").max(80),
    description: z.string().min(1, "La description est requise"),
    position: z.number().int().min(0).optional(),
    active: z.boolean().optional(),
});

export type CompagnieValueInput = z.infer<typeof CompagnieValueInputSchema>;

/**
 * UI Schema — sans key (auto-généré depuis title dans le DAL)
 */
export const CompagnieValueFormSchema = z.object({
    title: z.string().min(1, "Le titre est requis").max(80),
    description: z.string().min(1, "La description est requise"),
    position: z.number().int().min(0),
    active: z.boolean(),
});

export type CompagnieValueFormValues = z.infer<typeof CompagnieValueFormSchema>;

/**
 * DTO — number IDs pour sérialisation JSON côté client
 */
export interface CompagnieValueDTO {
    id: number;
    key: string;
    title: string;
    description: string;
    position: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Reorder Schema
 */
export const ReorderCompagnieValuesSchema = z.object({
    items: z.array(
        z.object({
            id: z.coerce.bigint(),
            position: z.number().int().min(0),
        })
    ),
});

export type ReorderCompagnieValuesInput = z.infer<typeof ReorderCompagnieValuesSchema>;

// =============================================================================
// COMPAGNIE PRESENTATION SECTIONS
// =============================================================================

/**
 * Server Schema
 */
export const PresentationSectionInputSchema = z.object({
    slug: z.string().max(80).optional().or(z.literal("")),
    kind: z.enum(SECTION_KINDS),
    title: z.string().optional().nullable(),
    subtitle: z.string().optional().nullable(),
    content: z.array(z.string()).optional().nullable(),
    quote_text: z.string().optional().nullable(),
    quote_author: z.string().optional().nullable(),
    image_url: addImageUrlValidation(z.string().url())
        .optional()
        .nullable()
        .or(z.literal("")),
    image_media_id: z.coerce.bigint().optional().nullable(),
    alt_text: z.string().optional().nullable(),
    milestones: z.array(MilestoneSchema).max(20).optional().nullable(),
    position: z.number().int().min(0).optional(),
    active: z.boolean().optional(),
});

export type PresentationSectionInput = z.infer<typeof PresentationSectionInputSchema>;

/**
 * UI Schema — image_media_id en number (pas bigint)
 */
export const PresentationSectionFormSchema = z.object({
    slug: z.string().max(80).optional().or(z.literal("")),
    kind: z.enum(SECTION_KINDS),
    title: z.string().optional().or(z.literal("")),
    subtitle: z.string().optional().or(z.literal("")),
    content: z.array(z.string()).optional(),
    quote_text: z.string().optional().or(z.literal("")),
    quote_author: z.string().optional().or(z.literal("")),
    image_url: z.string().url().optional().or(z.literal("")),
    image_media_id: z.number().int().positive().optional().nullable(),
    alt_text: z.string().optional().or(z.literal("")),
    milestones: z.array(MilestoneSchema).max(20).optional(),
    position: z.number().int().min(0).optional(),
    active: z.boolean(),
});

export type PresentationSectionFormValues = z.infer<typeof PresentationSectionFormSchema>;

/**
 * DTO
 */
export interface PresentationSectionDTO {
    id: number;
    slug: string;
    kind: SectionKind;
    title: string | null;
    subtitle: string | null;
    content: string[] | null;
    quote_text: string | null;
    quote_author: string | null;
    image_url: string | null;
    image_media_id: number | null;
    alt_text: string | null;
    milestones: Array<{ year: string; label: string }> | null;
    position: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

