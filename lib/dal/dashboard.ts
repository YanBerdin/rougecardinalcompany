"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";
import {
  DashboardStatsSchema,
  type DashboardStats,
} from "@/lib/schemas/dashboard";

// =============================================================================
// FETCH DASHBOARD STATS
// =============================================================================

/**
 * Fetch dashboard statistics from Supabase
 * Performs parallel queries for team, shows, events, and media counts
 */
export async function fetchDashboardStats(): Promise<DALResult<DashboardStats>> {
  const supabase = await createClient();

  const [teamResult, showsResult, eventsResult, mediaResult, partnersResult] =
    await Promise.all([
      supabase
        .from("membres_equipe")
        .select("*", { count: "exact", head: true }),
      supabase.from("spectacles").select("*", { count: "exact", head: true }),
      supabase.from("evenements").select("*", { count: "exact", head: true }),
      supabase.from("medias").select("*", { count: "exact", head: true }),
      supabase.from("partners").select("*", { count: "exact", head: true }),
    ]);

  const errors = [
    { name: "membres_equipe", error: teamResult.error },
    { name: "spectacles", error: showsResult.error },
    { name: "evenements", error: eventsResult.error },
    { name: "medias", error: mediaResult.error },
    { name: "partners", error: partnersResult.error },
  ].filter((item) => item.error !== null);

  if (errors.length > 0) {
    const errorMessages = errors
      .map((e) => `${e.name}: ${e.error?.message}`)
      .join(", ");
    console.error("[ERR_DASHBOARD_001] Failed to fetch stats:", errorMessages);
    return { success: false, error: `[ERR_DASHBOARD_001] ${errorMessages}` };
  }

  const stats = {
    teamCount: teamResult.count ?? 0,
    showsCount: showsResult.count ?? 0,
    eventsCount: eventsResult.count ?? 0,
    mediaCount: mediaResult.count ?? 0,
    partnersCount: partnersResult.count ?? 0,
  };

  return { success: true, data: DashboardStatsSchema.parse(stats) };
}
