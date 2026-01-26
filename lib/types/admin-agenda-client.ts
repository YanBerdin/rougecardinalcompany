/**
 * Types Client pour l'interface admin agenda
 * ⚠️ IMPORTANT : Ce fichier ne contient AUCUN bigint pour éviter les erreurs de sérialisation
 * Utilisé par les Client Components et les formulaires React Hook Form
 */

// ✅ DTO Client pour EventForm (id: number pour sérialisation JSON)
export type EventClientDTO = {
    id: number;
    spectacle_id: number;
    spectacle_titre?: string;
    lieu_id: number | null;
    lieu_nom?: string;
    lieu_ville?: string;
    date_debut: string;
    date_fin: string | null;
    start_time: string;
    end_time: string | null;
    status: "scheduled" | "cancelled" | "completed";
    ticket_url: string | null;
    capacity: number | null;
    price_cents: number | null;
    created_at: string;
    updated_at: string;
};

// ✅ DTO Client pour SpectacleSelect (id: number pour JSON)
export type SpectacleClientDTO = {
    id: number;
    title: string;
    slug: string | null;
    short_description: string | null;
    image_url: string | null;
    premiere: string | null;
    public: boolean;
    genre: string | null;
    duration_minutes: number | null;
    casting: number | null;
    status: string | null;
    awards: string[] | null;
};

// ✅ DTO Lieu pour le client (id: number pour JSON)
export type LieuClientDTO = {
    id: number;
    nom: string;
    ville: string | null;
    adresse: string | null;
};
