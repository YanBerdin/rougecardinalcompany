import { z } from "zod";

/**
 * Server Schema - Uses bigint for database IDs
 */
export const PartnerInputSchema = z.object({
    name: z.string().min(1, "Le nom est requis").max(100),
    website_url: z.string().url("URL invalide").optional().nullable(),
    logo_media_id: z.coerce.bigint().optional().nullable(),
    display_order: z.number().int().min(0).default(0),
    active: z.boolean().default(true),
});

export type PartnerInput = z.infer<typeof PartnerInputSchema>;

/**
 * UI Schema - Uses number for form handling (React Hook Form compatibility)
 */
export const PartnerFormSchema = z.object({
    name: z.string().min(1, "Le nom est requis").max(100),
    website_url: z.string().url("URL invalide").optional().or(z.literal("")),
    logo_url: z.string().url().optional().or(z.literal("")),
    logo_media_id: z.number().int().positive().optional().nullable(),
    display_order: z.number().int().min(0).default(0),
    active: z.boolean().default(true),
});

export type PartnerFormValues = z.infer<typeof PartnerFormSchema>;

/**
 * DTO returned by DAL (uses number for JSON serialization)
 */
export type PartnerDTO = {
    id: number;
    name: string;
    website_url: string | null;
    logo_media_id: number | null;
    logo_url: string | null;
    display_order: number;
    active: boolean;
    created_at: string;
    updated_at: string;
};

/**
 * Reorder Schema - Array of partner IDs with new order
 */
export const ReorderPartnersSchema = z.object({
    partners: z.array(
        z.object({
            id: z.coerce.bigint(),
            display_order: z.number().int().min(0),
        })
    ),
});

export type ReorderPartnersInput = z.infer<typeof ReorderPartnersSchema>;
