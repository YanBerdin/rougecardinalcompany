import type { AuditLogDTO } from "@/lib/schemas/audit-logs";

// Sortable fields for audit logs
export type AuditLogSortField = "created_at" | "action" | "table_name";

export type SortDirection = "asc" | "desc";

export interface AuditLogSortState {
    field: AuditLogSortField;
    direction: SortDirection;
}

/**
 * Sort audit logs based on current sort state
 */
export function sortAuditLogs(
    logs: AuditLogDTO[],
    sortState: AuditLogSortState
): AuditLogDTO[] {
    return [...logs].sort((a, b) => {
        const { field, direction } = sortState;

        // Handle created_at as Date comparison
        if (field === "created_at") {
            const aDate = new Date(a.created_at).getTime();
            const bDate = new Date(b.created_at).getTime();
            const comparison = aDate - bDate;
            return direction === "asc" ? comparison : -comparison;
        }

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
export function toggleSortDirection(current: SortDirection): SortDirection {
    return current === "asc" ? "desc" : "asc";
}

/**
 * Get next sort state based on current state and clicked field
 * Tri-state cycling: null → asc → desc → null
 */
export function getNextSortState(
    currentSort: AuditLogSortState | null,
    field: AuditLogSortField
): AuditLogSortState | null {
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
