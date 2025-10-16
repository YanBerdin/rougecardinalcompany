"use server";

import "server-only";
import { createClient } from "@/supabase/server";

export type ShowRecord = {
  id: number;
  title: string;
  slug: string | null;
  short_description: string | null;
  image_url: string | null;
  premiere: string | null;
};

export type EventRecord = {
  spectacle_id: number;
  date_debut: string;
};

export async function fetchFeaturedShows(limit = 3) {
  const supabase = await createClient();

  const { data: shows, error } = await supabase
    .from("spectacles")
    .select("id, title, slug, short_description, image_url, premiere, public")
    .eq("public", true)
    .order("premiere", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("fetchFeaturedShows error", error);
    return [] as Array<ShowRecord & { dates: string[] }>;
  }

  const ids = (shows ?? []).map((s) => s.id);
  if (ids.length === 0) return [];

  const { data: events, error: evErr } = await supabase
    .from("evenements")
    .select("spectacle_id, date_debut")
    .in("spectacle_id", ids)
    .order("date_debut", { ascending: true });

  if (evErr) {
    console.error("fetchFeaturedShows events error", evErr);
  }

  const eventsByShow = new Map<number, string[]>();
  (events ?? []).forEach((e) => {
    const arr = eventsByShow.get(e.spectacle_id) ?? [];
    arr.push(e.date_debut);
    eventsByShow.set(e.spectacle_id, arr);
  });

  return (shows ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    short_description: s.short_description,
    image_url: s.image_url,
    premiere: s.premiere,
    dates: eventsByShow.get(s.id) ?? [],
  }));
}
