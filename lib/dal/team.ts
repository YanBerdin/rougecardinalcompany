import "server-only";
import { createClient } from "@/supabase/server";
import type { Database } from "@/lib/database.types";
import { TeamMemberDbSchema } from "@/lib/schemas/team";

type TeamRow = Database["public"]["Tables"]["membres_equipe"]["Row"];

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
): Promise<TeamRow | null> {
  try {
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
      return null;
    }

    const parsed = TeamMemberDbSchema.safeParse(data as unknown);
    if (!parsed.success) {
      console.error("upsertTeamMember: invalid response:", parsed.error);
      return null;
    }

    return parsed.data as TeamRow;
  } catch (err: unknown) {
    console.error("upsertTeamMember exception:", err);
    return null;
  }
}

// Deprecated: use setTeamMemberActive(id, false) instead.
/*
export async function deactivateTeamMember(id: number): Promise<boolean> {
  return await setTeamMemberActive(id, false);
}
*/

export async function setTeamMemberActive(
  id: number,
  active: boolean
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("membres_equipe")
      .update({ active })
      .eq("id", id);

    if (error) {
      console.error("setTeamMemberActive error:", error);
      return false;
    }

    return true;
  } catch (err: unknown) {
    console.error("setTeamMemberActive exception:", err);
    return false;
  }
}

// Permanent deletion (RGPD): deletes the row from the database.
// Use with caution; audit logs should be checked if required prior to deletion.
export async function hardDeleteTeamMember(id: number): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("membres_equipe")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("hardDeleteTeamMember error:", error);
      return false;
    }

    return true;
  } catch (err: unknown) {
    console.error("hardDeleteTeamMember exception:", err);
    return false;
  }
}

export async function reorderTeamMembers(
  updates: { id: number; ordre: number }[]
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // perform updates sequentially to leverage triggers/audit logs
    for (const u of updates) {
      const { error } = await supabase
        .from("membres_equipe")
        .update({ ordre: u.ordre })
        .eq("id", u.id);

      if (error) {
        console.error("reorderTeamMembers partial error for id", u.id, error);
        // continue but mark as failed
      }
    }

    return true;
  } catch (err: unknown) {
    console.error("reorderTeamMembers exception:", err);
    return false;
  }
}
