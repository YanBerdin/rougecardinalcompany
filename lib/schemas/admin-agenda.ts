import { z } from "zod";

// ✅ Schéma SERVER (pour DAL/BDD) — utilise bigint
export const EventInputSchema = z.object({
    spectacle_id: z.coerce.bigint(),
    lieu_id: z.coerce.bigint().nullable().optional(),
    date_debut: z.string().datetime(), // ISO 8601 string → timestamptz
    date_fin: z.string().datetime().nullable().optional(),
    start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/), // HH:MM:SS
    end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).nullable().optional(),
    status: z.enum(["scheduled", "cancelled", "completed"]).default("scheduled"),
    notes: z.string().max(2000).nullable().optional(),
    ticket_url: z.string().url().nullable().optional(),
    tags: z.array(z.string()).default([]),
    capacity: z.number().int().positive().nullable().optional(),
    price_cents: z.number().int().nonnegative().nullable().optional(),
});
export type EventInput = z.infer<typeof EventInputSchema>;

// ✅ Schéma UI (pour formulaires React Hook Form) — utilise number
export const EventFormSchema = z.object({
    spectacle_id: z.number().int().positive({ message: "Spectacle requis" }),
    date_debut: z.string().datetime(),
    start_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM pour input type="time"
    status: z.enum(["scheduled", "cancelled", "completed"]), // Requis (pas de default pour éviter undefined)
    tags: z.array(z.string()), // Requis (pas de default pour éviter undefined)
    lieu_id: z.number().int().positive().nullable().optional(),
    date_fin: z.string().datetime().nullable().optional(),
    end_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    ticket_url: z.string().url().nullable().optional(),
    capacity: z.number().int().positive().nullable().optional(),
    price_cents: z.number().int().nonnegative().nullable().optional(),
});
export type EventFormValues = z.infer<typeof EventFormSchema>;

// ✅ DTO (retourné par le DAL)
export type EventDTO = {
    id: bigint;
    spectacle_id: bigint;
    spectacle_titre?: string; // Join depuis spectacles
    lieu_id: bigint | null;
    lieu_nom?: string; // Join depuis lieux_evenements
    lieu_ville?: string;
    date_debut: string; // ISO 8601
    date_fin: string | null;
    start_time: string; // HH:MM:SS
    end_time: string | null;
    status: "scheduled" | "cancelled" | "completed";
    notes: string | null;
    ticket_url: string | null;
    tags: string[];
    capacity: number | null;
    price_cents: number | null;
    created_at: string;
    updated_at: string;
};

// ✅ DTO Lieu (lecture seule)
export type LieuDTO = {
    id: bigint;
    nom: string;
    ville: string | null;
    adresse: string | null;
};
