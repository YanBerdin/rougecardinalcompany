"use server";

import "server-only";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";

export type HomeHeroSlideRecord = {
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  position: number;
};

type SupabaseHeroRow = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  position?: number | null;
  active?: boolean | null;
  starts_at?: string | null;
  ends_at?: string | null;
};

// =============================================================================
// Helpers
// =============================================================================

function filterActiveSlides(
  rows: SupabaseHeroRow[],
  now: Date
): HomeHeroSlideRecord[] {
  return rows
    .filter((row) => {
      if (row.active === false) return false;
      const startsOk = !row.starts_at || new Date(row.starts_at) <= now;
      const endsOk = !row.ends_at || new Date(row.ends_at) >= now;
      return startsOk && endsOk;
    })
    .map((row) => ({
      title: row.title,
      subtitle: row.subtitle ?? null,
      description: row.description ?? null,
      image_url: row.image_url ?? null,
      cta_label: row.cta_label ?? null,
      cta_url: row.cta_url ?? null,
      position: row.position ?? 0,
    }));
}

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch active hero slides filtered by date range
 * @returns Active slides ordered by position
 */
export async function fetchActiveHomeHeroSlides(): Promise<
  DALResult<HomeHeroSlideRecord[]>
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("home_hero_slides")
      .select(
        "title, subtitle, description, image_url, cta_label, cta_url, position, active, starts_at, ends_at"
      )
      .order("position", { ascending: true });

    if (error) {
      console.error("[DAL] fetchActiveHomeHeroSlides error:", error);
      return {
        success: false,
        error: `[ERR_HOME_HERO_001] Failed to fetch hero slides: ${error.message}`,
      };
    }

    const now = new Date();
    const filteredSlides = filterActiveSlides(data ?? [], now);

    return { success: true, data: filteredSlides };
  } catch (err: unknown) {
    console.error("[DAL] fetchActiveHomeHeroSlides unexpected error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "[ERR_HOME_HERO_002] Unknown error",
    };
  }
}
