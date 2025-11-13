"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import {
  DashboardStatsSchema,
  type DashboardStats,
} from "@/types/dashboard.types";

/**
 * Fetch dashboard statistics from Supabase
 *
 * Performs parallel queries for team, shows, events, and media counts
 * Returns validated DashboardStats object
 *
 * @throws Error if any query fails
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Parallel queries for optimal performance
  const [teamResult, showsResult, eventsResult, mediaResult] =
    await Promise.all([
      supabase
        .from("membres_equipe")
        .select("*", { count: "exact", head: true }),
      supabase.from("spectacles").select("*", { count: "exact", head: true }),
      supabase.from("evenements").select("*", { count: "exact", head: true }),
      supabase.from("medias").select("*", { count: "exact", head: true }),
    ]);

  // Check for individual errors
  const errors = [
    { name: "membres_equipe", error: teamResult.error },
    { name: "spectacles", error: showsResult.error },
    { name: "evenements", error: eventsResult.error },
    { name: "medias", error: mediaResult.error },
  ].filter((item) => item.error !== null);

  if (errors.length > 0) {
    const errorMessages = errors
      .map((e) => `${e.name}: ${e.error?.message}`)
      .join(", ");
    throw new Error(`Failed to fetch dashboard stats: ${errorMessages}`);
  }

  // Build and validate stats object
  const stats = {
    teamCount: teamResult.count || 0,
    showsCount: showsResult.count || 0,
    eventsCount: eventsResult.count || 0,
    mediaCount: mediaResult.count || 0,
  };

  // Runtime validation with Zod
  return DashboardStatsSchema.parse(stats);
}
