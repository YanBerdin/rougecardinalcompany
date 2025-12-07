"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { Database } from "@/lib/database.types";
import { TeamMemberDbSchema } from "@/lib/schemas/team";
import { z } from "zod";
import { HttpStatus } from "@/lib/api/helpers";
import {
  type DALResult,
  getErrorMessage,
} from "@/lib/dal/helpers";

type TeamRow = Database["public"]["Tables"]["membres_equipe"]["Row"];

const UpsertTeamMemberSchema = TeamMemberDbSchema.partial();

const ReorderItemSchema = z.object({
  id: z.number().int().positive(),
  ordre: z.number().int(),
});
const ReorderSchema = z
  .array(ReorderItemSchema)
  .min(1)
  .refine((arr) => new Set(arr.map((i) => i.id)).size === arr.length, {
    message: "Duplicate id in updates",
  })
  .refine((arr) => new Set(arr.map((i) => i.ordre)).size === arr.length, {
    message: "Duplicate ordre in updates",
  });

/**
 * Fetches all team members from the database
 *
 * By default, only active members are returned. Invalid rows that fail
 * Zod validation are filtered out and logged.
 *
 * @param includeInactive - If true, includes deactivated members
 * @returns Array of validated team member records
 *
 * @example
 * Get only active members
 * const activeMembers = await fetchAllTeamMembers();
 *
 * Get all members including inactive
 * const allMembers = await fetchAllTeamMembers(true);
 */
export async function fetchAllTeamMembers(
  includeInactive = false
): Promise<TeamRow[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("membres_equipe")
      .select("*")
      .order("ordre", { ascending: true });

    if (!includeInactive) {
      // By default, exclude deactivated (active = false) members so that
      // it immediately hides the member from lists unless the user explicitly requests inactive members.
      query = query.eq("active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("fetchAllTeamMembers error:", error);
      return [];
    }

    const rows = (data as TeamRow[]) || [];

    // Validate each row with Zod; log invalid rows and filter them out
    const validRows: TeamRow[] = [];
    for (const r of rows) {
      const parsed = TeamMemberDbSchema.safeParse(r as unknown);
      if (parsed.success) validRows.push(parsed.data as TeamRow);
      else console.error("fetchAllTeamMembers: invalid row:", parsed.error);
    }

    return validRows;
  } catch (err) {
    console.error("fetchAllTeamMembers exception:", err);
    return [];
  }
}

/**
 * Fetches a single team member by ID
 *
 * @param id - Team member ID
 * @returns Team member record or null if not found or invalid
 *
 * @example
 * const member = await fetchTeamMemberById(123);
 * if (member) {
 *   console.log(`Found: ${member.nom}`);
 * }
 */
export async function fetchTeamMemberById(id: number): Promise<TeamRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("membres_equipe")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // PGRST116 = "not found" - expected behavior, not an error
      if (error.code !== "PGRST116") {
        console.error("[ERR_TEAM_010] fetchTeamMemberById error:", error);
      }
      return null;
    }

    const parsed = TeamMemberDbSchema.safeParse(data as unknown);
    if (!parsed.success) {
      console.error("[ERR_TEAM_011] fetchTeamMemberById: invalid row:", parsed.error);
      return null;
    }

    return parsed.data as TeamRow;
  } catch (err) {
    console.error("[ERR_TEAM_012] fetchTeamMemberById exception:", err);
    return null;
  }
}

/**
 * Creates or updates a team member
 *
 * If payload contains an `id`, performs an UPDATE. Otherwise performs an INSERT.
 * Validates payload with Zod and requires admin permissions.
 *
 * @param payload - Partial team member data (id optional for insert)
 * @returns DALResult with the created/updated member or error details
 *
 * @example
 * * Create new member
 * const result = await upsertTeamMember({
 *   nom: 'John Doe',
 *   role: 'Actor',
 *   active: true
 * });
 *
 * * Update existing member
 * const updateResult = await upsertTeamMember({
 *   id: 123,
 *   nom: 'Jane Doe'
 * });
 */
export async function upsertTeamMember(
  payload: Partial<TeamRow>
): Promise<DALResult<TeamRow>> {
  try {
    await requireAdmin();

    // Validate input
    const validated = UpsertTeamMemberSchema.safeParse(payload as unknown);
    if (!validated.success) {
      console.error("upsertTeamMember: invalid payload:", validated.error);
      return { success: false, error: "Invalid payload" };
    }

    const supabase = await createClient();

    // If payload contains an id, perform an update. Otherwise perform an insert.
    // This avoids sending an explicit `id` value to INSERT when the column is
    // defined as GENERATED ALWAYS (Postgres will reject non-default values).
    const { id, ...rest } = payload as Partial<TeamRow>;
    let data: unknown = null;
    let error: unknown = null;

    if (typeof id === "number" && Number.isFinite(id) && id > 0) {
      const res = await supabase
        .from("membres_equipe")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      data = res.data;
      error = res.error;
    } else {
      const res = await supabase
        .from("membres_equipe")
        .insert(rest)
        .select()
        .single();
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error("upsertTeamMember error:", error);
      return { success: false, error: getErrorMessage(error) };
    }

    const parsed = TeamMemberDbSchema.safeParse(data as unknown);
    if (!parsed.success) {
      console.error("upsertTeamMember: invalid response:", parsed.error);
      return { success: false, error: "Invalid response from database" };
    }

    return { success: true, data: parsed.data as TeamRow };
  } catch (err: unknown) {
    console.error("upsertTeamMember exception:", err);
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * Activates or deactivates a team member
 *
 * Requires admin permissions. Used to soft-delete members by setting
 * active=false, allowing restoration without data loss.
 *
 * @param id - Team member ID
 * @param active - New active status (true=active, false=inactive)
 * @returns DALResult with updated id and active status
 *
 * @example
 * * Deactivate member (soft delete)
 * const result = await setTeamMemberActive(123, false);
 *
 * * Reactivate member
 * const restoreResult = await setTeamMemberActive(123, true);
 */
export async function setTeamMemberActive(
  id: number,
  active: boolean
): Promise<DALResult<{ id: number; active: boolean }>> {
  try {
    await requireAdmin();

    // Validate inputs
    const idCheck = z.number().int().positive().safeParse(id);
    if (!idCheck.success) {
      return { success: false, error: "Invalid id" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("membres_equipe")
      .update({ active })
      .eq("id", id);

    if (error) {
      console.error("setTeamMemberActive error:", error);
      return { success: false, error: getErrorMessage(error) };
    }

    return { success: true, data: { id, active } };
  } catch (err: unknown) {
    console.error("setTeamMemberActive exception:", err);
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * Reorders team members by updating their display order
 *
 * Uses a single atomic RPC call to the database to prevent partial updates.
 * Validates that all IDs and order values are unique.
 *
 * @param updates - Array of id/ordre pairs to update
 * @returns DALResult indicating success or validation error
 *
 * @example
 * const result = await reorderTeamMembers([
 *   { id: 1, ordre: 2 },
 *   { id: 2, ordre: 1 },
 *   { id: 3, ordre: 3 }
 * ]);
 */
export async function reorderTeamMembers(
  updates: { id: number; ordre: number }[]
): Promise<DALResult<null>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // Validate updates payload
    const validated = ReorderSchema.safeParse(updates as unknown);
    if (!validated.success) {
      console.error("reorderTeamMembers: invalid updates:", validated.error);
      return { success: false, error: "Invalid reorder payload" };
    }

    // Use a single atomic DB-side operation via RPC function to avoid partial updates
    // The PL/pgSQL function `reorder_team_members(jsonb)` is added as a migration and
    // applies the updates in a single atomic statement with validation.
    const { error } = await supabase.rpc("reorder_team_members", {
      items: validated.data,
    });

    if (error) {
      console.error("reorderTeamMembers rpc error:", error);
      return { success: false, error: getErrorMessage(error) };
    }

    return { success: true, data: null };
  } catch (err: unknown) {
    console.error("reorderTeamMembers exception:", err);
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * Permanently deletes a team member from the database (RGPD compliance).
 *
 * CRITICAL: This operation is irreversible. The team member must be inactive
 * before deletion to prevent accidental data loss.
 *
 * @param id - Team member ID to delete
 * @returns Response indicating success or failure
 */
export async function hardDeleteTeamMember(
  id: number
): Promise<DALResult<null>> {
  try {
    await requireAdmin();

    const validationResult = await validateTeamMemberForDeletion(id);
    if (!validationResult.success) {
      return validationResult;
    }

    const deletionResult = await performTeamMemberDeletion(id);
    if (!deletionResult.success) {
      return deletionResult;
    }

    // Note: revalidatePath moved to Server Action (SOLID DIP compliance)
    return { success: true, data: null };
  } catch (error: unknown) {
    return handleHardDeleteError(error);
  }
}

// ============================================================================
// Hard Delete Helpers
// ============================================================================

/**
 * Validates team member eligibility for deletion
 *
 * Checks:
 * - Member exists in database
 * - Member is not currently active (must be deactivated first)
 *
 * @param id - Team member ID to validate
 * @returns DALResult with success status or error details
 *
 * @example
 * const result = await validateTeamMemberForDeletion(123);
 * if (!result.success) {
 *   console.error(result.error);
 * }
 */
async function validateTeamMemberForDeletion(
  id: number
): Promise<DALResult<null>> {
  const member = await fetchTeamMemberById(id);

  if (!member) {
    return {
      success: false,
      error: "Team member not found",
      status: HttpStatus.NOT_FOUND,
    };
  }

  if (member.active) {
    return {
      success: false,
      error: "Cannot delete active team member. Deactivate first.",
      status: HttpStatus.BAD_REQUEST,
    };
  }

  return { success: true, data: null };
}

/**
 * Performs the actual database deletion of a team member
 *
 * CRITICAL: This operation is irreversible. Validation should be
 * performed before calling this function.
 *
 * @param id - Team member ID to delete
 * @returns DALResult with success status or error details
 *
 * @example
 * const result = await performTeamMemberDeletion(123);
 * if (result.success) {
 *   console.log('Member deleted successfully');
 * }
 */
async function performTeamMemberDeletion(id: number): Promise<DALResult<null>> {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("membres_equipe")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("[DAL] Error deleting team member:", deleteError);
    return {
      success: false,
      error: "Failed to delete team member",
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  return { success: true, data: null };
}

/**
 * Handles errors during hard delete operations
 *
 * Provides user-friendly error messages and appropriate HTTP status codes
 * based on the error type.
 *
 * @param error - Error object caught during deletion
 * @returns DALResult with error details and appropriate status code
 */
function handleHardDeleteError(error: unknown): DALResult<null> {
  console.error("[DAL] hardDeleteTeamMember error:", error);

  if (error instanceof Error && error.message.includes("Forbidden")) {
    return {
      success: false,
      error: "Insufficient permissions",
      status: HttpStatus.FORBIDDEN,
    };
  }

  return {
    success: false,
    error: "Internal error during deletion",
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  };
}
