"use server";
import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { Database } from "@/lib/database.types";
import { TeamMemberDbSchema } from "@/lib/schemas/team";
import { z } from "zod";
import {
  type DALResult,
  dalSuccess,
  dalError,
  getErrorMessage,
} from "@/lib/dal/helpers";

type TeamRow = Database["public"]["Tables"]["membres_equipe"]["Row"];

const UpsertTeamMemberSchema = TeamMemberDbSchema.partial();

/**
 * Fetches all team members from the database
 *
 * Wrapped with React cache() for intra-request deduplication.
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
export const fetchAllTeamMembers = cache(
  async (includeInactive = false): Promise<DALResult<TeamRow[]>> => {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("membres_equipe")
        .select("*")
        .order("ordre", { ascending: true });

      if (!includeInactive) {
        query = query.eq("active", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[ERR_TEAM_001] fetchAllTeamMembers error:", error);
        return dalError(`[ERR_TEAM_001] ${getErrorMessage(error)}`);
      }

      const rows = (data as TeamRow[]) || [];

      const validRows: TeamRow[] = [];
      for (const r of rows) {
        const parsed = TeamMemberDbSchema.safeParse(r as unknown);
        if (parsed.success) validRows.push(parsed.data as TeamRow);
        else console.error("fetchAllTeamMembers: invalid row:", parsed.error);
      }

      return dalSuccess(validRows);
    } catch (err) {
      console.error("[ERR_TEAM_002] fetchAllTeamMembers exception:", err);
      return dalError(`[ERR_TEAM_002] ${getErrorMessage(err)}`);
    }
  }
);

/**
 * Fetches a single team member by ID
 *
 * Wrapped with React cache() for intra-request deduplication.
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
export const fetchTeamMemberById = cache(
  async (id: number): Promise<DALResult<TeamRow | null>> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("membres_equipe")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code !== "PGRST116") {
          console.error("[ERR_TEAM_010] fetchTeamMemberById error:", error);
        }
        return dalSuccess(null);
      }

      const parsed = TeamMemberDbSchema.safeParse(data as unknown);
      if (!parsed.success) {
        console.error("[ERR_TEAM_011] fetchTeamMemberById: invalid row:", parsed.error);
        return dalError("[ERR_TEAM_011] Invalid row from database");
      }

      return dalSuccess(parsed.data as TeamRow);
    } catch (err) {
      console.error("[ERR_TEAM_012] fetchTeamMemberById exception:", err);
      return dalError(`[ERR_TEAM_012] ${getErrorMessage(err)}`);
    }
  }
);

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

    const validated = await UpsertTeamMemberSchema.safeParseAsync(payload as unknown);
    if (!validated.success) {
      console.error("[ERR_TEAM_020] upsertTeamMember: invalid payload:", validated.error);
      return dalError("[ERR_TEAM_020] Invalid payload");
    }

    const supabase = await createClient();
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
      console.error("[ERR_TEAM_021] upsertTeamMember error:", error);
      return dalError(`[ERR_TEAM_021] ${getErrorMessage(error)}`);
    }

    const parsed = TeamMemberDbSchema.safeParse(data as unknown);
    if (!parsed.success) {
      console.error("[ERR_TEAM_022] upsertTeamMember: invalid response:", parsed.error);
      return dalError("[ERR_TEAM_022] Invalid response from database");
    }

    return dalSuccess(parsed.data as TeamRow);
  } catch (err: unknown) {
    console.error("upsertTeamMember exception:", err);
    return dalError(getErrorMessage(err));
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

    const idCheck = z.number().int().positive().safeParse(id);
    if (!idCheck.success) {
      return dalError("[ERR_TEAM_030] Invalid id");
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("membres_equipe")
      .update({ active })
      .eq("id", id);

    if (error) {
      console.error("[ERR_TEAM_031] setTeamMemberActive error:", error);
      return dalError(`[ERR_TEAM_031] ${getErrorMessage(error)}`);
    }

    return dalSuccess({ id, active });
  } catch (err: unknown) {
    console.error("setTeamMemberActive exception:", err);
    return dalError(getErrorMessage(err));
  }
}
