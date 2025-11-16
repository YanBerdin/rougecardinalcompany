"use server";

import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
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
import { HttpStatus, type HttpStatusCode } from "@/lib/api/helpers";

// ============================================================================
// Types & Helpers
// ============================================================================

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const maybe = (err as { message?: unknown }).message;
    if (typeof maybe === "string") return maybe;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

type DALSuccess<T> = { readonly success: true; readonly data: T };
type DALError = {
  readonly success: false;
  readonly error: string;
  readonly status?: HttpStatusCode;
};
export type DALResult<T> = DALSuccess<T> | DALError;

// ============================================================================
// READ Operations
// ============================================================================

/**
 * Fetches all spectacles from the database
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
export async function fetchAllSpectacles(
  includePrivate = false
): Promise<SpectacleSummary[]> {
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
export async function fetchSpectacleById(
  id: number
): Promise<SpectacleDb | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("spectacles")
      .select("*")
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

/**
 * Fetches a spectacle by slug
 *
 * @param slug - Spectacle slug (URL-friendly identifier)
 * @returns Spectacle record or null if not found
 *
 * @example
 * const spectacle = await fetchSpectacleBySlug("hamlet-2025");
 */
export async function fetchSpectacleBySlug(
  slug: string
): Promise<SpectacleDb | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("spectacles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("fetchSpectacleBySlug error:", error);
      return null;
    }

    const parsed = SpectacleDbSchema.safeParse(data as unknown);
    if (!parsed.success) {
      console.error("fetchSpectacleBySlug: invalid row:", parsed.error);
      return null;
    }

    return parsed.data;
  } catch (err) {
    console.error("fetchSpectacleBySlug exception:", err);
    return null;
  }
}

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
  const validated = CreateSpectacleSchema.safeParse(input as unknown);
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
  // DEBUG: Vérifier les données avant insert
  // console.log("=== DEBUG INSERT ===");
  // console.log("Data to insert:", JSON.stringify(dataToInsert, null, 2));

  // DEBUG: Vérifier l'authentification
  // const { data: { user } } = await supabase.auth.getUser();
  // console.log("Current user:", user?.id);
  // console.log("User metadata:", user?.user_metadata);

  // DEBUG: Tester is_admin() function
  // const { data: isAdminResult, error: adminCheckError } = await supabase
  // .rpc("is_admin");
  // console.log("is_admin() result:", isAdminResult, "error:", adminCheckError);

  // DEBUG: Tester une simple requête SELECT pour vérifier le contexte auth
  // const { data: selectTest, error: selectError } = await supabase
  //  .from("spectacles")
  //  .select("id")
  //  .limit(1);
  // console.log("SELECT test:", selectTest ? "SUCCESS" : "FAILED", selectError);

  const { data, error } = await supabase
    .from("spectacles")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("performAuthenticatedInsert error:", error);
    console.error("Error code:", error.code);
    console.error("Error details:", error.details);
    console.error("Error hint:", error.hint);
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

    revalidatePath("/admin/spectacles");
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
  const validated = UpdateSpectacleSchema.safeParse(input as unknown);
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

    revalidatePath("/admin/spectacles");
    revalidatePath(`/admin/spectacles/${id}`);
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

    revalidatePath("/admin/spectacles");
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a URL-friendly slug from a title
 *
 * Converts to lowercase, replaces spaces with dashes, removes special chars
 *
 * @param title - Title to convert to slug
 * @returns URL-friendly slug
 *
 * @example
 * generateSlug("Hamlet: La Tragédie") // "hamlet-la-tragedie"
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-"); // Remove duplicate dashes
}
