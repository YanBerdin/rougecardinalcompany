/**
 * @file Footer Configuration Schemas
 * @description Zod schemas + defaults for the public footer content
 *   stored in `public.configurations_site` under the key
 *   `public:footer:content`.
 * @module lib/schemas/footer-config
 *
 * @see .github/prompts/plan-TASK095-footerAdmin.prompt.md
 */

import { z } from "zod";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Single source of truth: row key used in `public.configurations_site`.
 * Matches the existing RLS pattern `key like 'public:%'` (public read).
 */
export const FOOTER_CONFIG_KEY = "public:footer:content" as const;

/**
 * Maximum description length (UI + DB safety).
 */
const DESCRIPTION_MAX = 500;

// =============================================================================
// SUB-SCHEMAS
// =============================================================================

const ContactSchema = z.object({
    email: z.string().email("Email invalide"),
    phone: z.string().min(1, "Téléphone requis"),
    address: z.string().min(1, "Adresse requise"),
});

const OptionalUrlSchema = z
    .string()
    .url("URL invalide")
    .optional()
    .or(z.literal(""));

const SocialLinksSchema = z.object({
    facebook: OptionalUrlSchema,
    instagram: OptionalUrlSchema,
    twitter: OptionalUrlSchema,
});

// =============================================================================
// MAIN SCHEMAS
// =============================================================================

/**
 * Server schema — validates the JSON `value` payload before persistence.
 */
export const FooterConfigInputSchema = z.object({
    description: z
        .string()
        .min(1, "Description requise")
        .max(DESCRIPTION_MAX, `Description trop longue (max ${DESCRIPTION_MAX} caractères)`),
    contact: ContactSchema,
    socialLinks: SocialLinksSchema,
});

/**
 * UI/Form schema — identical to the server schema (no bigint here, all strings).
 * Kept as a separate export to follow the project's "Server vs UI schema"
 * convention and to allow future divergence.
 */
export const FooterConfigFormSchema = FooterConfigInputSchema;

// =============================================================================
// TYPES
// =============================================================================

export type FooterConfigInput = z.infer<typeof FooterConfigInputSchema>;
export type FooterConfigFormValues = z.infer<typeof FooterConfigFormSchema>;

/**
 * DTO returned by the DAL. Mirrors the `value` JSON shape plus metadata.
 */
export type FooterConfigDTO = FooterConfigInput;

// =============================================================================
// DEFAULTS
// =============================================================================

/**
 * Default footer content. Reused by:
 *   - the seed migration (`supabase/migrations/*_seed_footer_config.sql`)
 *   - the DAL fallback when the row is missing or invalid
 *   - the public footer rendering on DAL error
 *
 * Keep aligned with the current hardcoded values in
 * `components/layout/footer.tsx` to avoid visible regression.
 */
export const FOOTER_DEFAULTS: FooterConfigDTO = {
    description:
        "Compagnie de théâtre passionnée par les arts de la scène, nous créons et produisons des spectacles qui touchent et interrogent notre époque.",
    contact: {
        email: "contact@rouge-cardinal.fr",
        phone: "+33 1 23 45 67 89",
        address: "75011 Paris, France",
    },
    socialLinks: {
        facebook: "https://www.facebook.com/",
        instagram: "https://www.instagram.com/",
        twitter: "https://twitter.com/",
    },
};
