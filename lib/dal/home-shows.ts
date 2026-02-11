"use server";

import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";

export type ShowRecord = {
  id: number;
  title: string;
  slug: string | null;
  short_description: string | null;
  image_url: string | null;
  premiere: string | null;
};

export type ShowWithDates = ShowRecord & {
  dates: string[];
};

type SupabaseShowRow = {
  id: number;
  title: string;
  slug?: string | null;
  short_description?: string | null;
  image_url?: string | null;
  premiere?: string | null;
  public?: boolean | null;
  status?: string | null;
};

type SupabaseEventRow = {
  spectacle_id: number;
  date_debut: string;
};

// =============================================================================
// Helpers
// =============================================================================

function buildEventsByShowMap(events: SupabaseEventRow[]): Map<number, string[]> {
  const eventsByShow = new Map<number, string[]>();

  events.forEach((event) => {
    const existing = eventsByShow.get(event.spectacle_id) ?? [];
    existing.push(event.date_debut);
    eventsByShow.set(event.spectacle_id, existing);
  });

  return eventsByShow;
}

function mapShowsWithDates(
  shows: SupabaseShowRow[],
  eventsByShow: Map<number, string[]>
): ShowWithDates[] {
  return shows.map((show) => ({
    id: show.id,
    title: show.title,
    slug: show.slug ?? null,
    short_description: show.short_description ?? null,
    image_url: show.image_url ?? null,
    premiere: show.premiere ?? null,
    dates: eventsByShow.get(show.id) ?? [],
  }));
}

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch featured shows with their upcoming event dates
 *
 * Wrapped with React cache() for intra-request deduplication.
 *
 * @param limit Maximum number of shows to return
 * @returns Shows with dates ordered by premiere
 */
export const fetchFeaturedShows = cache(
  async (limit = 3): Promise<DALResult<ShowWithDates[]>> => {
    try {
      const supabase = await createClient();

      const { data: shows, error } = await supabase
        .from("spectacles")
        .select("id, title, slug, short_description, image_url, premiere, public, status")
        .eq("public", true)
        .neq("status", "archived")
        .order("premiere", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[DAL] fetchFeaturedShows error:", error);
        return {
          success: false,
          error: `[ERR_HOME_SHOWS_001] Failed to fetch shows: ${error.message}`,
        };
      }

      const ids = (shows ?? []).map((s) => s.id);
      if (ids.length === 0) {
        return { success: true, data: [] };
      }

      const { data: events, error: eventsError } = await supabase
        .from("evenements")
        .select("spectacle_id, date_debut")
        .in("spectacle_id", ids)
        .order("date_debut", { ascending: true });

      if (eventsError) {
        console.error("[DAL] fetchFeaturedShows events error:", eventsError);
        // Continue with empty events - non-blocking error
      }

      const eventsByShow = buildEventsByShowMap(events ?? []);
      const showsWithDates = mapShowsWithDates(shows ?? [], eventsByShow);

      return { success: true, data: showsWithDates };
    } catch (err: unknown) {
      console.error("[DAL] fetchFeaturedShows unexpected error:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "[ERR_HOME_SHOWS_002] Unknown error",
      };
    }
  }
);
