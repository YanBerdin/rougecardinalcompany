import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/database.types";
import { TeamMemberDbSchema } from "@/lib/schemas/team";
import { z } from "zod";

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

type TeamRow = Database["public"]["Tables"]["membres_equipe"]["Row"];

type DALSuccess<T> = { success: true; data: T };
type DALError = { success: false; error: string };
export type DALResult<T> = DALSuccess<T> | DALError;

type DalResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
};

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

export async function fetchTeamMemberById(id: number): Promise<TeamRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("membres_equipe")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("fetchTeamMemberById error:", error);
      return null;
    }

    const parsed = TeamMemberDbSchema.safeParse(data as unknown);
    if (!parsed.success) {
      console.error("fetchTeamMemberById: invalid row:", parsed.error);
      return null;
    }

    return parsed.data as TeamRow;
  } catch (err) {
    console.error("fetchTeamMemberById exception:", err);
    return null;
  }
}

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
export async function hardDeleteTeamMember(id: number): Promise<DalResponse> {
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

    revalidatePath("/admin/team");
    return { success: true };
  } catch (error: unknown) {
    return handleHardDeleteError(error);
  }
}

// ============================================================================
// Hard Delete Helpers
// ============================================================================

async function validateTeamMemberForDeletion(
  id: number
): Promise<DalResponse> {
  const member = await fetchTeamMemberById(id);

  if (!member) {
    return {
      success: false,
      error: "Team member not found",
      status: 404,
    };
  }

  if (member.active) {
    return {
      success: false,
      error: "Cannot delete active team member. Deactivate first.",
      status: 400,
    };
  }

  return { success: true };
}

async function performTeamMemberDeletion(id: number): Promise<DalResponse> {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("membres_equipe")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("[DAL] Hard delete failed:", deleteError);
    return {
      success: false,
      error: "Failed to delete team member",
      status: 500,
    };
  }

  return { success: true };
}

function handleHardDeleteError(error: unknown): DalResponse {
  console.error("[DAL] hardDeleteTeamMember error:", error);

  if (error instanceof Error && error.message.includes("Forbidden")) {
    return {
      success: false,
      error: "Insufficient permissions",
      status: 403,
    };
  }

  return {
    success: false,
    error: "Internal error during deletion",
    status: 500,
  };
}
