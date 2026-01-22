import { z } from "zod";

/**
 * Server Schema - Uses bigint for database IDs
 */
export const PressReleaseInputSchema = z.object({
    title: z.string().min(1, "Le titre est requis").max(200),
    slug: z.string().max(255).optional().nullable().transform(val => val === "" ? null : val),
    description: z.string().optional().nullable().transform(val => val === "" ? null : val),
    date_publication: z.coerce.date(),
    image_url: z.string().url("URL invalide").optional().nullable().or(z.literal("")).transform(val => val === "" ? null : val),
    image_media_id: z.coerce.bigint().optional().nullable(),
    spectacle_id: z.coerce.bigint().optional().nullable(),
    evenement_id: z.coerce.bigint().optional().nullable(),
    public: z.boolean().default(false),
    ordre_affichage: z.number().int().min(0).default(0),
});

export type PressReleaseInput = z.infer<typeof PressReleaseInputSchema>;

/**
 * UI Schema - Uses number for form handling (React Hook Form compatibility)
 */
export const PressReleaseFormSchema = z.object({
    title: z.string().min(1, "Le titre est requis").max(200),
    slug: z.string().min(1).max(255).optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    date_publication: z.string().min(1, "La date de publication est requise"),
    image_url: z.string().url("URL invalide").optional().or(z.literal("")),
    image_media_id: z.number().int().positive().optional().nullable(),
    spectacle_id: z.number().int().positive().optional().nullable(),
    evenement_id: z.number().int().positive().optional().nullable(),
    public: z.boolean(),
    ordre_affichage: z.number().int().min(0),
});

export type PressReleaseFormValues = z.infer<typeof PressReleaseFormSchema>;

/**
 * DTO returned by DAL (uses number for JSON serialization)
 */
export type PressReleaseDTO = {
    id: number;
    title: string;
    slug: string | null;
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
    // Relations
    spectacle_titre?: string | null;
    evenement_titre?: string | null;
    medias?: Array<{
        id: number;
        url: string;
        alt_text: string | null;
        order_index: number;
    }>;
};

/**
 * Publish/Unpublish Action Schema
 */
export const PublishPressReleaseSchema = z.object({
    id: z.coerce.bigint(),
    public: z.boolean(),
});

export type PublishPressReleaseInput = z.infer<typeof PublishPressReleaseSchema>;

/**
 * Select Option DTO for dropdowns
 */
export type SelectOptionDTO = {
    id: number;
    titre: string;
};
