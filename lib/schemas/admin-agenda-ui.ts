import { z } from "zod";

/**
 * Schemas UI pour les formulaires React Hook Form
 * ⚠️ IMPORTANT : Ce fichier ne contient AUCUN bigint pour éviter les erreurs de sérialisation
 * Utilise uniquement number pour les IDs
 */

// ✅ Schéma UI (pour formulaires React Hook Form) — utilise number
export const EventFormSchema = z.object({
    spectacle_id: z.number().int().positive({ message: "Spectacle requis" }),
    date_debut: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/), // Format datetime-local: YYYY-MM-DDTHH:mm
    start_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM pour input type="time"
    status: z.enum(["scheduled", "cancelled", "completed"]), // Requis (pas de default pour éviter undefined)
    lieu_id: z.number().int().positive().nullable().optional(),
    date_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).nullable().optional(),
    end_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
    // Accepte une URL valide, une chaîne vide (champ vidé par l'utilisateur) ou null/undefined.
    // Validation : une valeur non-vide DOIT être une URL valide.
    ticket_url: z
        .string()
        .nullable()
        .optional()
        .refine(
            (val) => !val || z.string().url().safeParse(val).success,
            "Invalid URL"
        ),
    capacity: z.number().int().positive().nullable().optional(),
    price_cents: z.number().int().nonnegative().nullable().optional(),
});

export type EventFormValues = z.infer<typeof EventFormSchema>;
