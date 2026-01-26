/**
 * Types pour les composants admin agenda
 * ⚠️ IMPORTANT : N'importe QUE des types client-safe (sans BigInt)
 */

// Re-exports depuis types client-safe
export type {
    EventClientDTO,
    SpectacleClientDTO,
    LieuClientDTO,
} from "@/lib/types/admin-agenda-client";

// Re-export du schéma UI uniquement
export type { EventFormValues } from "@/lib/schemas/admin-agenda-ui";