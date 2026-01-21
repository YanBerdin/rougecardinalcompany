import { z } from "zod";

/**
 * Server Schema - Uses bigint for database IDs
 */
export const ArticleInputSchema = z.object({
    title: z.string().min(1, "Le titre est requis").max(255),
    author: z.string().max(100).optional().nullable().transform(val => val === "" ? null : val),
    type: z.enum(["Article", "Critique", "Interview", "Portrait"]).optional().nullable(),
    slug: z.string().max(255).optional().nullable().transform(val => val === "" ? null : val),
    chapo: z.string().optional().nullable().transform(val => val === "" ? null : val),
    excerpt: z.string().optional().nullable().transform(val => val === "" ? null : val),
    source_publication: z.string().max(100).optional().nullable().transform(val => val === "" ? null : val),
    source_url: z.string().url("URL invalide").optional().nullable().or(z.literal("")).transform(val => val === "" ? null : val),
    published_at: z.coerce.date().optional().nullable(),
});

export type ArticleInput = z.infer<typeof ArticleInputSchema>;

/**
 * UI Schema - Uses string dates for form handling
 */
export const ArticleFormSchema = z.object({
    title: z.string().min(1, "Le titre est requis").max(255),
    author: z.string().max(100).optional().or(z.literal("")),
    type: z.enum(["Article", "Critique", "Interview", "Portrait"]).optional().nullable(),
    slug: z.string().min(1).max(255).optional().or(z.literal("")),
    chapo: z.string().optional().or(z.literal("")),
    excerpt: z.string().optional().or(z.literal("")),
    source_publication: z.string().max(100).optional().or(z.literal("")),
    source_url: z.string().url("URL invalide").optional().or(z.literal("")),
    published_at: z.string().optional().or(z.literal("")),
});

export type ArticleFormValues = z.infer<typeof ArticleFormSchema>;

/**
 * DTO returned by DAL
 */
export type ArticleDTO = {
    id: number;
    title: string;
    author: string | null;
    type: string | null;
    slug: string | null;
    chapo: string | null;
    excerpt: string | null;
    source_publication: string | null;
    source_url: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    medias?: Array<{
        id: number;
        url: string;
        alt_text: string | null;
        order_index: number;
    }>;
};
