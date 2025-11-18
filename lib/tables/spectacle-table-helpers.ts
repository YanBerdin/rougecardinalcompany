import type { SpectacleSummary } from "@/lib/schemas/spectacles";
import { Badge } from "@/components/ui/badge";
import React from "react";

export const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  en_cours: "default",
  termine: "secondary",
  projet: "outline",
};

export const STATUS_LABELS: Record<string, string> = {
  en_cours: "En cours",
  termine: "Terminé",
  projet: "Projet",
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

export async function deleteSpectacleFromApi(id: number): Promise<void> {
  const response = await fetch(`/api/admin/spectacles/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete spectacle");
  }
}

export function removeSpectacleFromList(
  spectacles: SpectacleSummary[],
  id: number
): SpectacleSummary[] {
  return spectacles.filter((s) => s.id !== id);
}

// ========================================================================
// Badge Helpers (React Components)
// ========================================================================

export function getStatusBadge(
  status: string | null
): React.ReactElement | null {
  if (!status) return null;

  const variant = STATUS_VARIANTS[status] || "outline";
  const label = STATUS_LABELS[status] || status;

  return React.createElement(Badge, { variant }, label);
}

export function getVisibilityBadge(isPublic: boolean): React.ReactElement {
  return React.createElement(
    Badge,
    { variant: isPublic ? "default" : "secondary" },
    isPublic ? "Public" : "Privé"
  );
}
