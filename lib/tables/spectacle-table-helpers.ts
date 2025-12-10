import type { SpectacleSummary } from "@/lib/schemas/spectacles";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { capitalizeWords } from "@/lib/forms/spectacle-form-helpers";
import { translateStatus } from "@/lib/i18n/status";
import type { SortState } from "@/components/ui/sortable-header";

export const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  "en cours": "default",
  "terminé": "secondary",
  "projet": "outline",
  "draft": "outline",
  "brouillon": "outline",
  "published": "default",
  "archived": "secondary",
  "archive": "secondary",
  "a l'affiche": "default",
  "en preparation": "outline",
  "annulé": "secondary",
  "actuellement": "default",
};

export const STATUS_LABELS: Record<string, string> = {
  "en cours": "En cours",
  "terminé": "Terminé",
  "projet": "Projet",
  "draft": "Brouillon",
  "brouillon": "Brouillon",
  "published": "Actuellement",
  "archived": "Archivé",
  "archive": "Archive",
  "a l'affiche": "À l'affiche",
  "en preparation": "En préparation",
  "annulé": "Annulé",
  "actuellement": "Actuellement",
};

export function formatSpectacleDate(dateString: string | null): string {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
    });
  } catch {
    return "—";
  }
}

export function formatSpectacleDuration(minutes: number | null): string {
  return minutes ? `${minutes} min` : "—";
}

export function removeSpectacleFromList(
  spectacles: SpectacleSummary[],
  id: number
): SpectacleSummary[] {
  return spectacles.filter((s) => s.id !== id);
}

// ========================================================================
// Sorting Helpers
// ========================================================================

export type SortField = "title" | "genre" | "status" | "duration_minutes" | "premiere" | "public";
export type SortDirection = "asc" | "desc";

// Re-export generic SortState with spectacle-specific field type
export type SpectacleSortState = SortState<SortField>;

// Keep backward compatibility alias
export type { SortState } from "@/components/ui/sortable-header";

export function sortSpectacles(
  spectacles: SpectacleSummary[],
  sortState: SpectacleSortState
): SpectacleSummary[] {
  return [...spectacles].sort((a, b) => {
    const { field, direction } = sortState;
    const multiplier = direction === "asc" ? 1 : -1;

    let aValue: string | number | null;
    let bValue: string | number | null;

    switch (field) {
      case "title":
        aValue = a.title?.toLowerCase() || "";
        bValue = b.title?.toLowerCase() || "";
        break;

      case "status":
        aValue = (a.status || "").replace(/_/g, ' ');
        bValue = (b.status || "").replace(/_/g, ' ');
        break;

      case "genre":
        aValue = a.genre?.toLowerCase() || "";
        bValue = b.genre?.toLowerCase() || "";
        break;

      case "premiere":
        aValue = a.premiere ? new Date(a.premiere).getTime() : 0;
        bValue = b.premiere ? new Date(b.premiere).getTime() : 0;
        break;

      case "duration_minutes":
        aValue = a.duration_minutes || 0;
        bValue = b.duration_minutes || 0;
        break;

      case "public":
        aValue = a.public ? 1 : 0;
        bValue = b.public ? 1 : 0;
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
  currentSort: SpectacleSortState | null,
  clickedField: SortField
): SpectacleSortState {
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

export function getStatusBadge(
  status: string | null
): React.ReactElement | null {
  if (!status) return null;

  // Normalize status for display (handle old underscore format)
  const normalizedStatus = status.replace(/_/g, ' ');

  const variant = STATUS_VARIANTS[normalizedStatus] || "outline";

  // Use central translate helper to show the french label
  const label = translateStatus(normalizedStatus) || capitalizeWords(normalizedStatus);

  return React.createElement(Badge, { variant }, label);
}

export function getVisibilityBadge(isPublic: boolean): React.ReactElement {
  return React.createElement(
    Badge,
    { variant: isPublic ? "default" : "secondary" },
    isPublic ? "Public" : "Privé"
  );
}
