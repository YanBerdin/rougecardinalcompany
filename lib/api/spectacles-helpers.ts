/**
 * API helpers for spectacles operations
 */

/**
 * Submit spectacle data to API (create or update)
 */
export async function submitSpectacleToApi(
  cleanData: Record<string, unknown>,
  spectacleId?: number
): Promise<Response> {
  const endpoint = spectacleId 
    ? `/api/admin/spectacles/${spectacleId}`
    : `/api/admin/spectacles`;
  const method = spectacleId ? "PATCH" : "POST";
  
  return fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanData),
  });
}

/**
 * Extract error message from API error
 */
export function handleSpectacleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Impossible de sauvegarder le spectacle";
}

/**
 * Generate success message for create/update operations
 */
export function getSpectacleSuccessMessage(
  isEditing: boolean,
  title: string
): {
  action: string;
  description: string;
} {
  const action = isEditing ? "Spectacle mis à jour" : "Spectacle créé";
  const verb = isEditing ? "mis à jour" : "créé";
  
  return {
    action,
    description: `"${title}" a été ${verb} avec succès.`,
  };
}
