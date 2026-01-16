"use server";

import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";

export type PressReleaseRecord = {
  id: number;
  title: string;
  description: string | null;
  date_publication: string;
  image_url: string | null;
  ordre_affichage: number | null;
};

type SupabasePressRow = {
  id: number;
  title: string;
  description?: string | null;
  date_publication: string;
  image_url?: string | null;
  ordre_affichage?: number | null;
  public?: boolean | null;
};

// =============================================================================
// Helpers
// =============================================================================

function filterRecentReleases(
  rows: SupabasePressRow[],
  cutoffDays: number
): PressReleaseRecord[] {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - cutoffDays);

  return rows
    .filter((row) => new Date(row.date_publication) >= cutoff)
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? null,
      date_publication: row.date_publication,
      image_url: row.image_url ?? null,
      ordre_affichage: row.ordre_affichage ?? null,
    }));
}

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch featured press releases from the last 30 days
 *
 * Wrapped with React cache() for intra-request deduplication.
 *
 * @param limit Maximum number of releases to return
 * @returns Recent press releases ordered by publication date
 */
export const fetchFeaturedPressReleases = cache(
  async (limit = 3): Promise<DALResult<PressReleaseRecord[]>> => {
    try {
      const supabase = await createClient();

    const { data, error } = await supabase
      .from("communiques_presse")
      .select(
        "id, title, description, date_publication, image_url, ordre_affichage, public"
      )
      .eq("public", true)
      .order("date_publication", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[DAL] fetchFeaturedPressReleases error:", error);
      return {
        success: false,
        error: `[ERR_HOME_NEWS_001] Failed to fetch press releases: ${error.message}`,
      };
    }

    const recentReleases = filterRecentReleases(data ?? [], 30);

    return { success: true, data: recentReleases };
  } catch (err: unknown) {
    console.error("[DAL] fetchFeaturedPressReleases unexpected error:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "[ERR_HOME_NEWS_002] Unknown error",
    };
  }
  }
);
