import { z } from "zod";

// Hero Slide Input Schema
export const HeroSlideInputSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    subtitle: z.string().max(150, "Subtitle max 150 characters").default(""),
    description: z.string().max(500, "Description max 500 characters").default(""),
    image_url: z.string().url("Invalid URL format").optional(),
    image_media_id: z.string().optional(),
    cta_label: z.string().max(50, "CTA label max 50 characters").default(""),
    cta_url: z.string().url("Invalid CTA URL format").optional(),
    alt_text: z.string().min(1, "Alt text required for accessibility").max(125, "Alt text max 125 characters"),
    active: z.boolean().default(true),
    position: z.number().int().min(0, "Position must be non-negative").optional(),
}).refine(
    (data) => data.image_media_id !== undefined || data.image_url !== undefined,
    { message: "An image is required (media ID or URL)", path: ["image_media_id"] }
).refine(
    (data) => !data.cta_label || data.cta_url !== undefined,
    { message: "CTA URL required when label provided", path: ["cta_url"] }
).refine(
    (data) => !data.cta_url || data.cta_label !== undefined,
    { message: "CTA label required when URL provided", path: ["cta_label"] }
);

export type HeroSlideInput = z.infer<typeof HeroSlideInputSchema>;

// About Content Input Schema
export const AboutContentInputSchema = z.object({
    title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
    intro1: z.string().min(1, "First intro paragraph required").max(1000, "Intro 1 max 1000 characters"),
    intro2: z.string().min(1, "Second intro paragraph required").max(1000, "Intro 2 max 1000 characters"),
    mission_title: z.string().min(1, "Mission title required").max(80, "Mission title max 80 characters"),
    mission_text: z.string().min(1, "Mission text required").max(4000, "Mission text max 4000 characters"),
    image_url: z.string().url("Invalid URL format").optional(),
    image_media_id: z.string().optional(),
    alt_text: z.string().max(125, "Alt text max 125 characters").optional(),
});

export type AboutContentInput = z.infer<typeof AboutContentInputSchema>;

// Reorder Input Schema
export const ReorderInputSchema = z.array(
    z.object({
        id: z.string(),
        position: z.number().int().min(0),
    })
);

export type ReorderInput = z.infer<typeof ReorderInputSchema>;

// DTO Types for API responses
export interface HeroSlideDTO {
    id: bigint;
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
