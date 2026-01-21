import { z } from "zod";

/**
 * Server Schema - Uses bigint for database IDs
 */
export const PressContactInputSchema = z.object({
    nom: z.string().min(1, "Le nom est requis").max(100),
    prenom: z.string().max(100).optional().nullable(),
    fonction: z.string().max(100).optional().nullable(),
    media: z.string().min(1, "Le nom du média est requis").max(150),
    email: z.string().email("Email invalide").toLowerCase(),
    telephone: z.string().max(20).optional().nullable(),
    adresse: z.string().optional().nullable(),
    ville: z.string().max(100).optional().nullable(),
    specialites: z.array(z.string()).optional().nullable(),
    notes: z.string().optional().nullable(),
    actif: z.boolean().default(true),
    derniere_interaction: z.coerce.date().optional().nullable(),
});

export type PressContactInput = z.infer<typeof PressContactInputSchema>;

/**
 * UI Schema - For form handling
 */
export const PressContactFormSchema = z.object({
    nom: z.string().min(1, "Le nom est requis").max(100),
    prenom: z.string().max(100).optional().or(z.literal("")),
    fonction: z.string().max(100).optional().or(z.literal("")),
    media: z.string().min(1, "Le nom du média est requis").max(150),
    email: z.string().email("Email invalide").toLowerCase(),
    telephone: z.string().max(20).optional().or(z.literal("")),
    adresse: z.string().optional().or(z.literal("")),
    ville: z.string().max(100).optional().or(z.literal("")),
    specialites: z.array(z.string()).optional().nullable(),
    notes: z.string().optional().or(z.literal("")),
    actif: z.boolean(),
    derniere_interaction: z.string().optional().or(z.literal("")),
});

export type PressContactFormValues = z.infer<typeof PressContactFormSchema>;

/**
 * DTO returned by DAL
 */
export type PressContactDTO = {
    id: number;
    nom: string;
    prenom: string | null;
    fonction: string | null;
    media: string;
    email: string;
    telephone: string | null;
    adresse: string | null;
    ville: string | null;
    specialites: string[] | null;
    notes: string | null;
    actif: boolean;
    derniere_interaction: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
};

/**
 * Toggle Active Schema
 */
export const TogglePressContactActiveSchema = z.object({
    id: z.coerce.bigint(),
    actif: z.boolean(),
});

export type TogglePressContactActiveInput = z.infer<typeof TogglePressContactActiveSchema>;
