"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";

export type CompagnieValueRecord = {
  id: number;
  key: string;
  title: string;
  description: string;
  position: number;
  active: boolean;
};

export type TeamMemberRecord = {
  id: number;
  name: string;
  role: string | null;
  description: string | null;
  image_url: string | null;
  photo_media_id: number | null;
  ordre: number;
  active: boolean;
};

// ============================================================================
// DAL Functions
// ============================================================================

/**
 * Fetch active company values
 * @param limit - Maximum number of values to return (default: 12)
 */
export async function fetchCompagnieValues(
  limit = 12
): Promise<DALResult<CompagnieValueRecord[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("compagnie_values")
      .select("id, key, title, description, position, active")
      .eq("active", true)
      .order("position", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("[DAL] fetchCompagnieValues error:", error);
      return {
        success: false,
        error: `[ERR_COMPAGNIE_001] Failed to fetch values: ${error.message}`,
      };
    }

    return { success: true, data: data ?? [] };
  } catch (err: unknown) {
    console.error("[DAL] fetchCompagnieValues exception:", err);
    return {
      success: false,
      error: `[ERR_COMPAGNIE_002] ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

/**
 * Fetch active team members for public display
 * @param limit - Maximum number of members to return (default: 12)
 */
export async function fetchTeamMembers(
  limit = 12
): Promise<DALResult<TeamMemberRecord[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("membres_equipe")
      .select(
        "id, name, role, description, image_url, photo_media_id, ordre, active"
      )
      .eq("active", true)
      .order("ordre", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("[DAL] fetchTeamMembers error:", error);
      return {
        success: false,
        error: `[ERR_COMPAGNIE_003] Failed to fetch team: ${error.message}`,
      };
    }

    return { success: true, data: data ?? [] };
  } catch (err: unknown) {
    console.error("[DAL] fetchTeamMembers exception:", err);
    return {
      success: false,
      error: `[ERR_COMPAGNIE_004] ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

// ============================================================================
// Legacy Exports (backward compatibility)
// ============================================================================

/**
 * @deprecated Use fetchCompagnieValues() with DALResult instead
 */
export async function fetchCompagnieValuesLegacy(
  limit = 12
): Promise<CompagnieValueRecord[]> {
  const result = await fetchCompagnieValues(limit);
  return result.success ? (result.data ?? []) : [];
}

/**
 * @deprecated Use fetchTeamMembers() with DALResult instead
 */
export async function fetchTeamMembersLegacy(
  limit = 12
): Promise<TeamMemberRecord[]> {
  const result = await fetchTeamMembers(limit);
  return result.success ? (result.data ?? []) : [];
}
