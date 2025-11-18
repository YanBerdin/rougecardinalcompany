import { z } from "zod";

// ============================================================================
// String Formatting Helpers
// ============================================================================

/**
 * Capitalizes first letter of each word and normalizes spaces
 * @example capitalizeWords("en cours") → "En cours"
 * @example capitalizeWords("tragédie") → "Tragédie"
 */
export function capitalizeWords(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Normalizes status: removes underscores and capitalizes
 * @example normalizeStatus("en_cours") → "En cours"
 */
export function normalizeStatus(status: string): string {
  return capitalizeWords(status.replace(/_/g, ' '));
}

/**
 * Normalizes genre: capitalizes first letter only
 * @example normalizeGenre("tragédie") → "Tragédie"
 * @example normalizeGenre("comédie musicale") → "Comédie musicale"
 */
export function normalizeGenre(genre: string): string {
  const trimmed = genre.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

// Types
export const spectacleFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  slug: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  description: z.string().optional(),
  short_description: z.string().max(500).optional(),
  genre: z.string().max(100).optional().transform((val) => val ? normalizeGenre(val) : val),
  duration_minutes: z.coerce.number().int().positive().optional(),
  casting: z.coerce.number().int().positive().optional(),
  premiere: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  public: z.boolean().optional(),
});

export type SpectacleFormValues = z.infer<typeof spectacleFormSchema>;

// ============================================================================
// Data Cleaning Helpers
// ============================================================================

function cleanEmptyValues(data: SpectacleFormValues): Record<string, unknown> {
  const cleanData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === "" || value === null) {
      cleanData[key] = undefined;
      continue;
    }
    cleanData[key] = value;
  }

  return cleanData;
}

function transformNumberFields(
  cleanData: Record<string, unknown>
): Record<string, unknown> {
  const numberFields = ["duration_minutes", "casting"];

  for (const field of numberFields) {
    const value = cleanData[field];
    if (typeof value === "string") {
      const numValue = parseInt(value, 10);
      cleanData[field] =
        !isNaN(numValue) && numValue !== 0 ? numValue : undefined;
    }
  }

  return cleanData;
}

function transformDateFields(
  cleanData: Record<string, unknown>
): Record<string, unknown> {
  if (cleanData.premiere && typeof cleanData.premiere === "string") {
    cleanData.premiere = new Date(cleanData.premiere).toISOString();
  }

  return cleanData;
}

function transformSlugField(
  cleanData: Record<string, unknown>
): Record<string, unknown> {
  if (cleanData.slug && typeof cleanData.slug === "string") {
    cleanData.slug = cleanData.slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  return cleanData;
}

export function cleanSpectacleFormData(
  data: SpectacleFormValues
): Record<string, unknown> {
  let cleanData = cleanEmptyValues(data);
  cleanData = transformNumberFields(cleanData);
  cleanData = transformDateFields(cleanData);
  cleanData = transformSlugField(cleanData);

  // Ensure boolean fields always have a value
  if (cleanData.public === undefined) {
    cleanData.public = false;
  }

  return cleanData;
}
