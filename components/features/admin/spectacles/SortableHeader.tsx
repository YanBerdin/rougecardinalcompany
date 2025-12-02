"use client";

// Re-export the generic SortableHeader for backward compatibility
// New code should import directly from @/components/ui/sortable-header
export { SortableHeader } from "@/components/ui/sortable-header";
export type { SortState, SortDirection } from "@/components/ui/sortable-header";

// Keep the specific type for spectacles
export type { SortField } from "@/lib/tables/spectacle-table-helpers";