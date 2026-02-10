import type { LieuClientDTO } from "@/lib/schemas/admin-lieux";

// Sortable fields
export type LieuSortField = "nom" | "ville" | "capacite";

export type SortDirection = "asc" | "desc";

export interface LieuSortState {
    field: LieuSortField;
    direction: SortDirection;
}

/**
 * Sort lieux based on current sort state
 */
export function sortLieux(
    lieux: LieuClientDTO[],
    sortState: LieuSortState
): LieuClientDTO[] {
    return [...lieux].sort((a, b) => {
        const { field, direction } = sortState;
        const aVal = a[field];
        const bVal = b[field];

        // Handle null values
        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction === "asc" ? comparison : -comparison;
    });
}

/**
 * Toggle sort direction
 */
function toggleSortDirection(current: SortDirection): SortDirection {
    return current === "asc" ? "desc" : "asc";
}

/**
 * Get next sort state based on current state and clicked field
 */
export function getNextSortState(
    currentSort: LieuSortState | null,
    field: LieuSortField
): LieuSortState | null {
    // First click: sort ascending
    if (!currentSort || currentSort.field !== field) {
        return { field, direction: "asc" };
    }

    // Second click: sort descending
    if (currentSort.direction === "asc") {
        return { field, direction: "desc" };
    }

    // Third click: remove sort (return to default)
    return null;
}
