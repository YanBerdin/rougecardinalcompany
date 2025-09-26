"use server";

import "server-only";
import { createClient } from "@/supabase/server";

export type SpectacleSummary = {
    id: number;
    title: string;
    slug: string | null;
    short_description: string | null;
    image_url: string | null;
    premiere: string | null;
    public: boolean;
    genre: string | null;
    duration_minutes: number | null;
    casting: number | null;
    status: string | null;
        awards: string[] | null;
};

/**
 * Fetch all spectacles from DB.
 * - 06_table_spectacles > table public.spectacles (mock currentShowsData[] + archivedShowsData[] )
 * - Only selects safe, known columns
 * - Returns an empty array on error
 */
export async function fetchAllSpectacles(): Promise<SpectacleSummary[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("spectacles")
            .select("id, title, slug, short_description, image_url, premiere, public, genre, duration_minutes, casting, status, awards")
        .order("premiere", { ascending: false });

    if (error) {
        console.error("fetchAllSpectacles error", error);
        return [];
    }

    return (data ?? []) as SpectacleSummary[];
}
