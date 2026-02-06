"use server";

import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  SpectacleDbSchema,
  CreateSpectacleSchema,
  UpdateSpectacleSchema,
  type SpectacleDb,
  type CreateSpectacleInput,
  type UpdateSpectacleInput,
  type SpectacleSummary,
} from "@/lib/schemas/spectacles";
import { HttpStatus } from "@/lib/api/helpers";
import {
  type DALResult,
  getErrorMessage,
  generateSlug,
} from "@/lib/dal/helpers";

// ============================================================================
// READ Operations
// ============================================================================

/**
 * Fetches the venue (lieu) for the next upcoming event of a spectacle
 *
 * Returns the venue name and city from the next scheduled event.
 * If no future events exist, returns null.
 *
 * @param spectacleId - Spectacle ID
 * @returns Venue name and city or null if no upcoming events
 *
 * @example
 * const venue = await fetchSpectacleNextVenue(123);
 * if (venue) {
 *   console.log(`Next show at: ${venue.nom}, ${venue.ville}`);
 * }
 */
export const fetchSpectacleNextVenue = cache(
  async (spectacleId: number): Promise<{ nom: string; ville: string | null } | null> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("evenements")
        .select("lieux(nom, ville)")
        .eq("spectacle_id", spectacleId)
        .not("lieux", "is", null)
        .gte("date_debut", new Date().toISOString())
        .order("date_debut", { ascending: true })
        .limit(1)
        .single();

      if (error) {
        // PGRST116 = Not found (no upcoming events) - this is expected
        if (error.code !== "PGRST116") {
          console.error("fetchSpectacleNextVenue error:", error);
        }
        return null;
      }

      const lieu = Array.isArray(data.lieux) ? data.lieux[0] : data.lieux;
      if (!lieu || !lieu.nom) {
        return null;
      }

      return {
        nom: lieu.nom,
        ville: lieu.ville ?? null,
      };
    } catch (err) {
      console.error("fetchSpectacleNextVenue exception:", err);
      return null;
    }
  }
);

/**
 * Fetches all spectacles from the database
 *
 * Wrapped with React cache() for intra-request deduplication.
 * ISR (revalidate=60) on marketing pages provides cross-request caching.
 *
 * By default, only public spectacles are returned. Invalid rows that fail
 * Zod validation are filtered out and logged.
 *
 * @param includePrivate - If true, includes private spectacles (admin only)
 * @returns Array of validated spectacle records
 *
 * @example
 * // Get only public spectacles
 * const publicSpectacles = await fetchAllSpectacles();
 *
 * // Get all spectacles including private (admin)
 * const allSpectacles = await fetchAllSpectacles(true);
 */
export const fetchAllSpectacles = cache(
  async (includePrivate = false): Promise<SpectacleSummary[]> => {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("spectacles")
        .select(
          "id, title, slug, short_description, image_url, premiere, public, genre, duration_minutes, casting, status, awards"
        )
        .order("premiere", { ascending: false });

      if (!includePrivate) {
        query = query.eq("public", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("fetchAllSpectacles error:", error);
        return [];
      }

      const rows = (data as SpectacleSummary[]) || [];

      // Validate each row with Zod; log invalid rows and filter them out
      const validRows: SpectacleSummary[] = [];
      for (const r of rows) {
        const parsed = SpectacleDbSchema.partial().safeParse(r as unknown);
        if (parsed.success) validRows.push(r);
        else console.error("fetchAllSpectacles: invalid row:", parsed.error);
      }

      return validRows;
    } catch (err) {
      console.error("fetchAllSpectacles exception:", err);
      return [];
    }
  }
);

/**
 * Fetches a single spectacle by ID
 *
 * @param id - Spectacle ID
 * @returns Spectacle record or null if not found or invalid
 *
 * @example
 * const spectacle = await fetchSpectacleById(123);
 * if (spectacle) {
 *   console.log(`Found: ${spectacle.title}`);
 * }
 */
/**
 * Fetches a spectacle by ID
 *
 * Wrapped with React cache() for intra-request deduplication.
 *
 * @param id - Spectacle ID
 * @returns Spectacle record or null if not found
 */
export const fetchSpectacleById = cache(
  async (id: number): Promise<SpectacleDb | null> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("spectacles")
        .select(
          "id, title, slug, status, description, paragraph_2, paragraph_3, short_description, genre, duration_minutes, casting, premiere, image_url, public, awards, created_by, created_at, updated_at"
        )
        .eq("id", id)
        .single();

      if (error) {
        // PGRST116 = Not found (0 rows) - this is expected for non-existent IDs
        if (error.code !== "PGRST116") {
          console.error("fetchSpectacleById error:", error);
        }
        return null;
      }

      const parsed = SpectacleDbSchema.safeParse(data as unknown);
      if (!parsed.success) {
        console.error("fetchSpectacleById: invalid row:", parsed.error);
        return null;
      }

      return parsed.data;
    } catch (err) {
      console.error("fetchSpectacleById exception:", err);
      return null;
    }
  }
);

/**
 * Fetches a spectacle by slug or ID
 *
 * Wrapped with React cache() for intra-request deduplication.
 *
 * @param slugOrId - Spectacle slug (URL-friendly identifier) or numeric ID as string
 * @returns Spectacle record or null if not found
 *
 * @example
 * const spectacle1 = await fetchSpectacleBySlug("hamlet-2025");
 * const spectacle2 = await fetchSpectacleBySlug("123"); // Fallback to ID
 */
export const fetchSpectacleBySlug = cache(
  async (slugOrId: string): Promise<SpectacleDb | null> => {
    try {
      const supabase = await createClient();

      // Check if slugOrId is a number (ID fallback)
      const isNumeric = /^\d+$/.test(slugOrId);

      console.log("[fetchSpectacleBySlug] Input:", slugOrId, "| isNumeric:", isNumeric);

      let query = supabase
        .from("spectacles")
        .select(
          "id, title, slug, status, description, paragraph_2, paragraph_3, short_description, genre, duration_minutes, casting, premiere, image_url, public, awards, created_by, created_at, updated_at"
        );

      if (isNumeric) {
        // Search by ID as fallback
        const id = parseInt(slugOrId, 10);
        console.log("[fetchSpectacleBySlug] Querying by ID:", id);
        query = query.eq("id", id);
      } else {
        // Search by slug (primary method)
        console.log("[fetchSpectacleBySlug] Querying by slug:", slugOrId);
        query = query.eq("slug", slugOrId);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error("[fetchSpectacleBySlug] Supabase error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return null;
      }

      console.log("[fetchSpectacleBySlug] Raw data received:", data);

      const parsed = SpectacleDbSchema.safeParse(data as unknown);
      if (!parsed.success) {
        console.error("[fetchSpectacleBySlug] Validation failed:", parsed.error.issues);
        return null;
      }

      console.log("[fetchSpectacleBySlug] Success! Returning spectacle:", parsed.data.title);
      return parsed.data;
    } catch (err) {
      console.error("fetchSpectacleBySlug exception:", err);
      return null;
    }
  }
);

/**
 * Fetches all distinct genres used in spectacles
 *
 * Wrapped with React cache() for intra-request deduplication.
 * Returns sorted array of non-null genres
 *
 * @example
 * const genres = await fetchDistinctGenres();
 * // ["Comédie", "Drame", "Tragédie"]
 */
export const fetchDistinctGenres = cache(async (): Promise<string[]> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("spectacles")
      .select("genre")
      .not("genre", "is", null)
      .order("genre");

    if (error) {
      console.error("[DAL] fetchDistinctGenres error:", error);
      return [];
    }

    // Extract unique genres and filter out nulls/empty
    const uniqueGenres = Array.from(
      new Set(
        data
          .map((item) => item.genre)
          .filter((genre): genre is string => Boolean(genre && genre.trim()))
      )
    );

    return uniqueGenres.sort((a, b) => a.localeCompare(b, "fr"));
  } catch (error) {
    console.error("[DAL] fetchDistinctGenres exception:", error);
    return [];
  }
});

// ============================================================================
// CREATE Operation
// ============================================================================

/**
 * Validates spectacle creation input
 * @internal
 */
async function validateCreateInput(
  input: CreateSpectacleInput
): Promise<DALResult<CreateSpectacleInput>> {
  const validated = await CreateSpectacleSchema.safeParseAsync(input as unknown);
  if (!validated.success) {
    console.error("createSpectacle: invalid input:", validated.error);
    return {
      success: false,
      error: "Données invalides : vérifiez les champs requis",
      status: HttpStatus.BAD_REQUEST,
    };
  }
  return { success: true, data: validated.data };
}

/**
 * Validates database response against a Zod schema
 * @internal
 */
function validateDatabaseResponse<T>(
  data: unknown,
  schema: z.ZodType<T>,
  operation: string
): DALResult<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.error(`${operation}: invalid response:`, parsed.error);
    return {
      success: false,
      error: "Réponse invalide de la base de données",
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
  return { success: true, data: parsed.data };
}

/**
 * Performs database insert with authenticated Supabase client
 * @internal
 */
async function performAuthenticatedInsert(
  supabase: SupabaseClient,
  dataToInsert: CreateSpectacleInput & { created_by: string }
): Promise<DALResult<SpectacleDb>> {

  const { data, error } = await supabase
    .from("spectacles")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("performAuthenticatedInsert error:", error);
    if (error.code === "23505") {
      return {
        success: false,
        error: "Un spectacle avec ce slug existe déjà",
        status: HttpStatus.CONFLICT,
      };
    }
    return {
      success: false,
      error: getErrorMessage(error),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  return validateDatabaseResponse(
    data,
    SpectacleDbSchema,
    "performAuthenticatedInsert"
  );
}

/**
 * Inserts spectacle into database with auto-generated slug if needed
 * @internal
 */
async function insertSpectacle(
  validatedData: CreateSpectacleInput
): Promise<DALResult<SpectacleDb>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return {
      success: false,
      error: "Erreur d'authentification",
      status: HttpStatus.UNAUTHORIZED,
    };
  }

  if (!user) {
    return {
      success: false,
      error: "Utilisateur non authentifié",
      status: HttpStatus.UNAUTHORIZED,
    };
  }

  const dataToInsert = {
    ...(validatedData.slug
      ? validatedData
      : { ...validatedData, slug: generateSlug(validatedData.title) }),
    created_by: user.id,
  };

  return await performAuthenticatedInsert(supabase, dataToInsert);
}

/**
 * Creates a new spectacle
 *
 * Validates input with Zod and requires admin permissions.
 * Automatically generates slug from title if not provided.
 *
 * @param input - Spectacle data (title required)
 * @returns DALResult with the created spectacle or error details
 *
 * @example
 * const result = await createSpectacle({
 *   title: 'Hamlet',
 *   genre: 'Tragédie',
 *   duration_minutes: 180,
 *   casting: 12,
 *   public: true
 * });
 *
 * if (result.success) {
 *   console.log(`Created spectacle ID: ${result.data.id}`);
 * }
 */
export async function createSpectacle(
  input: CreateSpectacleInput
): Promise<DALResult<SpectacleDb>> {
  try {
    await requireAdmin();

    const validationResult = await validateCreateInput(input);
    if (!validationResult.success) return validationResult;

    const insertResult = await insertSpectacle(validationResult.data);
    if (!insertResult.success) return insertResult;

    return insertResult;
  } catch (err: unknown) {
    console.error("createSpectacle exception:", err);
    return {
      success: false,
      error: getErrorMessage(err),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}

// ============================================================================
// UPDATE Operation
// ============================================================================

/**
 * Validates spectacle update input
 * @internal
 */
async function validateUpdateInput(
  input: UpdateSpectacleInput
): Promise<DALResult<UpdateSpectacleInput>> {
  const validated = await UpdateSpectacleSchema.safeParseAsync(input as unknown);
  if (!validated.success) {
    console.error("updateSpectacle: invalid input:", validated.error);
    return {
      success: false,
      error: "Données invalides : vérifiez les champs modifiés",
      status: HttpStatus.BAD_REQUEST,
    };
  }
  return { success: true, data: validated.data };
}

/**
 * Performs database update for spectacle
 * @internal
 */
async function performSpectacleUpdate(
  id: number,
  updateData: Partial<CreateSpectacleInput>
): Promise<DALResult<SpectacleDb>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("spectacles")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("performSpectacleUpdate error:", error);
    if (error.code === "23505") {
      return {
        success: false,
        error: "Un spectacle avec ce slug existe déjà",
        status: HttpStatus.CONFLICT,
      };
    }
    return {
      success: false,
      error: getErrorMessage(error),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  return validateDatabaseResponse(
    data,
    SpectacleDbSchema,
    "performSpectacleUpdate"
  );
}

/**
 * Updates an existing spectacle
 *
 * Validates input with Zod and requires admin permissions.
 * Only updates provided fields (partial update).
 *
 * @param input - Partial spectacle data with required id
 * @returns DALResult with the updated spectacle or error details
 *
 * @example
 * const result = await updateSpectacle({
 *   id: 123,
 *   title: 'Hamlet (New Version)',
 *   duration_minutes: 200
 * });
 */
export async function updateSpectacle(
  input: UpdateSpectacleInput
): Promise<DALResult<SpectacleDb>> {
  try {
    await requireAdmin();

    const validationResult = await validateUpdateInput(input);
    if (!validationResult.success) return validationResult;

    const { id, ...updateData } = validationResult.data;

    const existing = await fetchSpectacleById(id);
    if (!existing) {
      return {
        success: false,
        error: "Spectacle introuvable",
        status: HttpStatus.NOT_FOUND,
      };
    }

    const updateResult = await performSpectacleUpdate(id, updateData);
    if (!updateResult.success) return updateResult;

    return updateResult;
  } catch (err: unknown) {
    console.error("updateSpectacle exception:", err);
    return {
      success: false,
      error: getErrorMessage(err),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}

// ============================================================================
// DELETE Operation
// ============================================================================

/**
 * Permanently deletes a spectacle from the database
 *
 * CRITICAL: This operation is irreversible and will cascade delete
 * related records (events, relations, etc.) due to ON DELETE CASCADE
 * constraints.
 *
 * @param id - Spectacle ID to delete
 * @returns DALResult indicating success or failure
 *
 * @example
 * const result = await deleteSpectacle(123);
 * if (result.success) {
 *   console.log('Spectacle deleted successfully');
 * }
 */
export async function deleteSpectacle(id: number): Promise<DALResult<null>> {
  try {
    await requireAdmin();

    // Check if spectacle exists
    const existing = await fetchSpectacleById(id);
    if (!existing) {
      return {
        success: false,
        error: "Spectacle introuvable",
        status: HttpStatus.NOT_FOUND,
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("spectacles").delete().eq("id", id);

    if (error) {
      console.error("deleteSpectacle error:", error);
      // Check for foreign key constraint violation
      if (error.code === "23503") {
        return {
          success: false,
          error:
            "Impossible de supprimer : ce spectacle a des événements associés",
          status: HttpStatus.CONFLICT,
        };
      }
      return {
        success: false,
        error: getErrorMessage(error),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    return { success: true, data: null };
  } catch (err: unknown) {
    console.error("deleteSpectacle exception:", err);
    return {
      success: false,
      error: getErrorMessage(err),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}

