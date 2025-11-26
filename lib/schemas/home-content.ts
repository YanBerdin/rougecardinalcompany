import { z } from "zod";

// Hero Slide Input Schema
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
    }, z.string().url("Invalid URL format").optional()),
    image_media_id: z.coerce.bigint().optional(),
    cta_label: z.string().max(50, "CTA label max 50 characters").optional(),
    cta_url: z.string().url("Invalid CTA URL format").optional(),
    alt_text: z.string().min(1, "Alt text required for accessibility").max(125, "Alt text max 125 characters"),
    active: z.boolean().optional(),
    position: z.number().int().min(0, "Position must be non-negative").optional(),
}).refine(
    (data) => data.image_media_id !== undefined || (typeof data.image_url === 'string' && data.image_url.trim().length > 0),
    { message: "An image is required (media ID or URL)", path: ["image_url"] }
).refine(
    (data) => !data.cta_label || data.cta_url !== undefined,
    { message: "CTA URL required when label provided", path: ["cta_url"] }
).refine(
    (data) => !data.cta_url || data.cta_label !== undefined,
    { message: "CTA label required when URL provided", path: ["cta_label"] }
);

/**
// Hero Slide Input Schema
export const HeroSlideInputSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    slug: z.string().optional().refine(
        (val) => !val || /^[a-z0-9-]+$/.test(val),
        { message: "Slug must be lowercase alphanumeric with hyphens" }
    ),
    subtitle: z.string().max(150, "Subtitle max 150 characters").optional(),
    description: z.string().max(500, "Description max 500 characters").optional(),
    image_url: z.string().url("Invalid URL format").optional(),
    image_media_id: z.coerce.bigint().optional(),
    cta_label: z.string().max(50, "CTA label max 50 characters").optional(),
    cta_url: z.string().optional().refine(
        (val) => !val || z.string().url().safeParse(val).success,
        { message: "Invalid CTA URL format" }
    ),
    alt_text: z.string().min(1, "Alt text required for accessibility").max(125, "Alt text max 125 characters"),
    active: z.boolean().optional(),
    position: z.number().int().min(0, "Position must be non-negative").optional(),
}).refine(
    (data) => data.image_media_id !== undefined || (data.image_url && data.image_url.length > 0),
    { message: "An image is required (media ID or URL)", path: ["image_media_id"] }
).refine(
    (data) => !data.cta_label || (data.cta_url && data.cta_url.length > 0),
    { message: "CTA URL required when label provided", path: ["cta_url"] }
).refine(
    (data) => !data.cta_url || (data.cta_label && data.cta_label.length > 0),
    { message: "CTA label required when URL provided", path: ["cta_label"] }
);

 * 
 */

export type HeroSlideInput = z.infer<typeof HeroSlideInputSchema>;

// About Content Input Schema
export const AboutContentInputSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    intro1: z.string().min(1, "First intro paragraph required").max(1000, "Intro 1 max 1000 characters"),
    intro2: z.string().min(1, "Second intro paragraph required").max(1000, "Intro 2 max 1000 characters"),
    mission_title: z.string().min(1, "Mission title required").max(80, "Mission title max 80 characters"),
    mission_text: z.string().min(1, "Mission text required").max(4000, "Mission text max 4000 characters"),
    image_url: z.string().url("Invalid URL format").optional(),
    image_media_id: z.coerce.bigint().optional(),
    alt_text: z.string().max(125, "Alt text max 125 characters").optional(),
});

export type AboutContentInput = z.infer<typeof AboutContentInputSchema>;

// Reorder Input Schema
export const ReorderInputSchema = z.array(
    z.object({
        id: z.coerce.bigint(),
        position: z.number().int().min(0),
    })
);

export type ReorderInput = z.infer<typeof ReorderInputSchema>;

// DTO Types for API responses
export interface HeroSlideDTO {
    id: bigint;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    image_url: string | null;
    image_media_id: bigint | null;
    cta_label: string | null;
    cta_url: string | null;
    alt_text: string;
    active: boolean;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface AboutContentDTO {
    id: bigint;
    title: string;
    intro1: string;
    intro2: string;
    mission_title: string;
    mission_text: string;
    image_url: string | null;
    image_media_id: bigint | null;
    alt_text: string | null;
    position: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}
