import { z } from "zod";
import { addImageUrlValidation } from "@/lib/utils/image-validation-refinements";

// =============================================================================
// SERVER SCHEMAS (with bigint for database operations)
// =============================================================================

// =============================================================================
// URL VALIDATION HELPERS
// =============================================================================

/**
 * Validates that a string is either a relative URL (starts with /) or an absolute URL.
 * Accepts: "/spectacles", "/agenda", "https://external.com/page"
 * Rejects: "spectacles", "javascript:alert(1)", empty strings
 */
const relativeOrAbsoluteUrl = z.string().refine(
    (val) => {
        if (!val || val.trim() === "") return true; // Allow empty (optional)
        const trimmed = val.trim();
        // Relative URL: starts with /
        if (trimmed.startsWith("/")) return true;
        // Absolute URL: valid URL with http/https
        try {
            const url = new URL(trimmed);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    },
    { message: "URL must be relative (/path) or absolute (https://...)" }
);

// Preprocess helper to convert empty strings to undefined
const optionalString = (schema: z.ZodString) =>
    z.preprocess((val) => {
        if (typeof val === "string") {
            const t = val.trim();
            return t === "" ? undefined : t;
        }
        return val;
    }, schema.optional());

// =============================================================================
// Hero Slide Input Schema (Server - uses number for JSON serialization)
// Note: Supabase returns bigint columns as number in JavaScript
// =============================================================================
export const HeroSlideInputSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    slug: z.string().max(100, "Slug max 100 characters").optional(),
    subtitle: z.string().max(150, "Subtitle max 150 characters").optional(),
    description: z.string().max(500, "Description max 500 characters").optional(),
    image_url: z.preprocess((val) => {
        if (typeof val === "string") {
            const t = val.trim();
            return t === "" ? undefined : t;
        }
        return val;
    }, addImageUrlValidation(z.string().url("Invalid URL format")).optional()),
    image_media_id: z.coerce.number().int().positive().optional(),
    alt_text: z.string().min(1, "Alt text required for accessibility").max(125, "Alt text max 125 characters"),

    // CTA Primaire (bouton principal - style plein)
    cta_primary_enabled: z.boolean().default(false),
    cta_primary_label: optionalString(z.string().max(50, "CTA primary label max 50 characters")),
    cta_primary_url: z.preprocess((val) => {
        if (typeof val === "string") {
            const t = val.trim();
            return t === "" ? undefined : t;
        }
        return val;
    }, relativeOrAbsoluteUrl.optional()),

    // CTA Secondaire (bouton secondaire - style outline)
    cta_secondary_enabled: z.boolean().default(false),
    cta_secondary_label: optionalString(z.string().max(50, "CTA secondary label max 50 characters")),
    cta_secondary_url: z.preprocess((val) => {
        if (typeof val === "string") {
            const t = val.trim();
            return t === "" ? undefined : t;
        }
        return val;
    }, relativeOrAbsoluteUrl.optional()),

    active: z.boolean().optional(),
    position: z.number().int().min(0, "Position must be non-negative").optional(),
}).refine(
    (data) => data.image_media_id !== undefined || (typeof data.image_url === 'string' && data.image_url.trim().length > 0),
    { message: "An image is required (media ID or URL)", path: ["image_url"] }
).refine(
    // CTA Primaire: si activé, label ET url requis
    (data) => {
        if (data.cta_primary_enabled) {
            return data.cta_primary_label && data.cta_primary_url;
        }
        return true;
    },
    { message: "CTA primary label and URL required when enabled", path: ["cta_primary_label"] }
).refine(
    // CTA Secondaire: si activé, label ET url requis
    (data) => {
        if (data.cta_secondary_enabled) {
            return data.cta_secondary_label && data.cta_secondary_url;
        }
        return true;
    },
    { message: "CTA secondary label and URL required when enabled", path: ["cta_secondary_label"] }
);

export type HeroSlideInput = z.infer<typeof HeroSlideInputSchema>;

// About Content Input Schema
export const AboutContentInputSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    intro1: z.string().min(1, "First intro paragraph required").max(1000, "Intro 1 max 1000 characters"),
    intro2: z.string().min(1, "Second intro paragraph required").max(1000, "Intro 2 max 1000 characters"),
    mission_title: z.string().min(1, "Mission title required").max(80, "Mission title max 80 characters"),
    mission_text: z.string().min(1, "Mission text required").max(4000, "Mission text max 4000 characters"),
    image_url: addImageUrlValidation(z.string().url("Invalid URL format")).optional(),
    image_media_id: z.coerce.number().int().positive().optional(),
    alt_text: z.string().max(125, "Alt text max 125 characters").optional(),
});

export type AboutContentInput = z.infer<typeof AboutContentInputSchema>;

// Reorder Input Schema (uses number for JSON serialization compatibility)
export const ReorderInputSchema = z.array(
    z.object({
        id: z.coerce.number().int().positive(),
        position: z.number().int().min(0),
    })
);

export type ReorderInput = z.infer<typeof ReorderInputSchema>;

// DTO Types for API responses (uses number for JSON serialization compatibility)
export interface HeroSlideDTO {
    id: number;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    image_url: string | null;
    image_media_id: number | null;
    alt_text: string;

    // CTA Primaire
    cta_primary_enabled: boolean;
    cta_primary_label: string | null;
    cta_primary_url: string | null;

    // CTA Secondaire
    cta_secondary_enabled: boolean;
    cta_secondary_label: string | null;
    cta_secondary_url: string | null;

    active: boolean;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface AboutContentDTO {
    id: number;
    title: string;
    intro1: string;
    intro2: string;
    mission_title: string;
    mission_text: string;
    image_url: string | null;
    image_media_id: number | null;
    alt_text: string | null;
    position: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

// =============================================================================
// UI FORM SCHEMAS (with number for JSON serialization compatibility)
// These schemas are used in Client Components to avoid BigInt serialization issues.
// Server Actions will coerce number -> bigint using the server schemas above.
// =============================================================================

export const HeroSlideFormSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    slug: z.string().max(100, "Slug max 100 characters").optional(),
    subtitle: z.string().max(150, "Subtitle max 150 characters").optional(),
    description: z.string().max(500, "Description max 500 characters").optional(),
    image_url: z.string().url("Invalid URL format").optional().or(z.literal("")),
    image_media_id: z.number().int().positive().optional(),
    alt_text: z.string().min(1, "Alt text required for accessibility").max(125, "Alt text max 125 characters"),

    // CTA Primaire (bouton principal) - optional with default in form
    cta_primary_enabled: z.boolean().optional(),
    cta_primary_label: z.string().max(50, "CTA primary label max 50 characters").optional().or(z.literal("")),
    cta_primary_url: relativeOrAbsoluteUrl.optional().or(z.literal("")),

    // CTA Secondaire (bouton outline) - optional with default in form
    cta_secondary_enabled: z.boolean().optional(),
    cta_secondary_label: z.string().max(50, "CTA secondary label max 50 characters").optional().or(z.literal("")),
    cta_secondary_url: relativeOrAbsoluteUrl.optional().or(z.literal("")),

    active: z.boolean().optional(),
    position: z.number().int().min(0, "Position must be non-negative").optional(),
}).refine(
    (data) => data.image_media_id !== undefined || (typeof data.image_url === 'string' && data.image_url.trim().length > 0),
    { message: "An image is required (media ID or URL)", path: ["image_url"] }
).refine(
    // CTA Primaire: si activé, label ET url requis
    (data) => {
        if (data.cta_primary_enabled === true) {
            const hasLabel = typeof data.cta_primary_label === 'string' && data.cta_primary_label.trim().length > 0;
            const hasUrl = typeof data.cta_primary_url === 'string' && data.cta_primary_url.trim().length > 0;
            return hasLabel && hasUrl;
        }
        return true;
    },
    { message: "CTA primary label and URL required when enabled", path: ["cta_primary_label"] }
).refine(
    // CTA Secondaire: si activé, label ET url requis
    (data) => {
        if (data.cta_secondary_enabled === true) {
            const hasLabel = typeof data.cta_secondary_label === 'string' && data.cta_secondary_label.trim().length > 0;
            const hasUrl = typeof data.cta_secondary_url === 'string' && data.cta_secondary_url.trim().length > 0;
            return hasLabel && hasUrl;
        }
        return true;
    },
    { message: "CTA secondary label and URL required when enabled", path: ["cta_secondary_label"] }
);

export type HeroSlideFormValues = z.infer<typeof HeroSlideFormSchema>;

export const AboutContentFormSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    intro1: z.string().min(1, "First intro paragraph required").max(1000, "Intro 1 max 1000 characters"),
    intro2: z.string().min(1, "Second intro paragraph required").max(1000, "Intro 2 max 1000 characters"),
    mission_title: z.string().min(1, "Mission title required").max(80, "Mission title max 80 characters"),
    mission_text: z.string().min(1, "Mission text required").max(4000, "Mission text max 4000 characters"),
    image_url: z.string().url("Invalid URL format").optional(),
    image_media_id: z.number().int().positive().optional(),
    alt_text: z.string().max(125, "Alt text max 125 characters").optional(),
});

export type AboutContentFormValues = z.infer<typeof AboutContentFormSchema>;
