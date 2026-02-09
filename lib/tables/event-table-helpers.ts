import React from "react";
import { Badge } from "@/components/ui/badge";
import type { SortState } from "@/components/ui/sortable-header";

// Type Client (BigInt → Number pour sérialisation JSON)
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

// ========================================================================
// Sorting Helpers
// ========================================================================

export type SortField = "spectacle_titre" | "date_debut" | "lieu_nom" | "status";
export type SortDirection = "asc" | "desc";
export type EventSortState = SortState<SortField>;

export function sortEvents(
    events: EventClientDTO[],
    sortState: EventSortState
): EventClientDTO[] {
    return [...events].sort((a, b) => {
        const { field, direction } = sortState;
        const multiplier = direction === "asc" ? 1 : -1;

        let aValue: string | number | null;
        let bValue: string | number | null;

        switch (field) {
            case "spectacle_titre":
                aValue = a.spectacle_titre?.toLowerCase() || "";
                bValue = b.spectacle_titre?.toLowerCase() || "";
                break;

            case "date_debut":
                aValue = a.date_debut ? new Date(a.date_debut).getTime() : 0;
                bValue = b.date_debut ? new Date(b.date_debut).getTime() : 0;
                break;

            case "lieu_nom":
                aValue = a.lieu_nom?.toLowerCase() || "";
                bValue = b.lieu_nom?.toLowerCase() || "";
                break;

            case "status":
                aValue = a.status;
                bValue = b.status;
                break;

            default:
                return 0;
        }

        // Handle null/empty values - put them at the end
        if (!aValue && bValue) return 1 * multiplier;
        if (aValue && !bValue) return -1 * multiplier;
        if (!aValue && !bValue) return 0;

        // String comparison with French locale
        if (typeof aValue === "string" && typeof bValue === "string") {
            return aValue.localeCompare(bValue, "fr", { sensitivity: "base" }) * multiplier;
        }

        // Numeric comparison
        if (typeof aValue === "number" && typeof bValue === "number") {
            return (aValue - bValue) * multiplier;
        }

        return 0;
    });
}

export function toggleSortDirection(currentDirection: SortDirection): SortDirection {
    return currentDirection === "asc" ? "desc" : "asc";
}

export function getNextSortState(
    currentSort: EventSortState | null,
    clickedField: SortField
): EventSortState {
    if (!currentSort || currentSort.field !== clickedField) {
        // First click on this field - sort ascending
        return { field: clickedField, direction: "asc" };
    }

    // Same field clicked - toggle direction
    return {
        field: clickedField,
        direction: toggleSortDirection(currentSort.direction),
    };
}

// ========================================================================
// Badge Helpers (React Components)
// ========================================================================

const STATUS_VARIANTS: Record<EventClientDTO["status"], "default" | "destructive" | "secondary"> = {
    scheduled: "default",
    cancelled: "destructive",
    completed: "secondary",
};

const STATUS_LABELS: Record<EventClientDTO["status"], string> = {
    scheduled: "Programmé",
    cancelled: "Annulé",
    completed: "Terminé",
};

export function getEventStatusBadge(status: EventClientDTO["status"]): React.ReactElement {
    return React.createElement(
        Badge,
        { variant: STATUS_VARIANTS[status] },
        STATUS_LABELS[status]
    );
}
