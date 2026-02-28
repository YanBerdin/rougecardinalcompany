import { z } from "zod";

// ✅ Schéma SERVER (pour DAL/BDD) — utilise bigint
export const LieuInputSchema = z.object({
    nom: z.string().min(1, "Le nom est requis").max(200),
    adresse: z.string().max(500).nullable().optional(),
    ville: z.string().max(100).nullable().optional(),
    code_postal: z.string().max(10).nullable().optional(),
    pays: z.string().max(100).default("France"),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    capacite: z.number().int().positive().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).default({}),
});

export type LieuInput = z.infer<typeof LieuInputSchema>;

// ✅ Schéma UI (pour formulaires React Hook Form)
export const LieuFormSchema = z.object({
    nom: z.string().min(1, "Le nom est requis").max(200),
    adresse: z.string().max(500).nullable().optional(),
    ville: z.string().max(100).nullable().optional(),
    code_postal: z.string().max(10).nullable().optional(),
    pays: z.string().min(1, "Le pays est requis").max(100),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    capacite: z.number().int().positive().nullable().optional(),
});

export type LieuFormValues = z.infer<typeof LieuFormSchema>;

// ✅ DTO (retourné par le DAL)
export type LieuDTO = {
    id: bigint;
    nom: string;
    adresse: string | null;
    ville: string | null;
    code_postal: string | null;
    pays: string;
    latitude: number | null;
    longitude: number | null;
    capacite: number | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
};

// ✅ Client DTO (pour composants Client, id: number au lieu de bigint)
export type LieuClientDTO = {
    id: number;
    nom: string;
    adresse: string | null;
    ville: string | null;
    code_postal: string | null;
    pays: string;
    latitude: number | null;
    longitude: number | null;
    capacite: number | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
};

/** Convert LieuDTO (bigint) → LieuClientDTO (number) for client serialization */
export function toClientDTO(lieu: LieuDTO): LieuClientDTO {
    return {
        id: Number(lieu.id),
        nom: lieu.nom,
        adresse: lieu.adresse,
        ville: lieu.ville,
        code_postal: lieu.code_postal,
        pays: lieu.pays,
        latitude: lieu.latitude,
        longitude: lieu.longitude,
        capacite: lieu.capacite,
        metadata: lieu.metadata,
        created_at: lieu.created_at,
        updated_at: lieu.updated_at,
    };
}
