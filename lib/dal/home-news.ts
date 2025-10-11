"use server";

import "server-only";
import { createClient } from "@/supabase/server";

export type PressReleaseRecord = {
  id: number;
  title: string;
  description: string | null;
  date_publication: string;
  image_url: string | null;
  ordre_affichage: number | null;
};

export async function fetchFeaturedPressReleases(limit = 3) {
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
    console.error("fetchFeaturedPressReleases error", error);
    return [] as PressReleaseRecord[];
  }

  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - 30);

  //TODO: fix Unexpected any
  return (data ?? []).filter(
    (r: any) => new Date(r.date_publication) >= cutoff
  ) as PressReleaseRecord[];
}
