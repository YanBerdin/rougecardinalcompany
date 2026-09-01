"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import { buildMediaPublicUrl } from "@/lib/dal/helpers/media-url";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type ReferenceUpdater = (
    supabase: SupabaseServerClient,
    previousUrl: string,
    nextUrl: string
) => PromiseLike<{ error: { message: string } | null }>;

/**
 * Tables that denormalize the absolute public URL of a media file.
 * They must be rewritten whenever the underlying storage path changes,
 * otherwise the public site renders dead URLs (Storage 404 -> /_next/image 400).
 */
const URL_REFERENCE_UPDATERS: readonly ReferenceUpdater[] = [
    (supabase, previousUrl, nextUrl) =>
        supabase.from("articles_presse").update({ image_url: nextUrl }).eq("image_url", previousUrl),
    (supabase, previousUrl, nextUrl) =>
        supabase.from("compagnie_presentation_sections").update({ image_url: nextUrl }).eq("image_url", previousUrl),
    (supabase, previousUrl, nextUrl) =>
        supabase.from("home_about_content").update({ image_url: nextUrl }).eq("image_url", previousUrl),
    (supabase, previousUrl, nextUrl) =>
        supabase.from("home_hero_slides").update({ image_url: nextUrl }).eq("image_url", previousUrl),
    (supabase, previousUrl, nextUrl) =>
        supabase.from("membres_equipe").update({ image_url: nextUrl }).eq("image_url", previousUrl),
    (supabase, previousUrl, nextUrl) =>
        supabase.from("spectacles").update({ image_url: nextUrl }).eq("image_url", previousUrl),
];

/**
 * Rewrite every denormalized public URL pointing to `previousStoragePath`
 * so that it points to `nextStoragePath`.
 *
 * Best effort: a failing table is logged but does not abort the whole sync,
 * since the Storage move and the `medias` record are already consistent.
 */
export async function syncMediaReferenceUrls(
    previousStoragePath: string,
    nextStoragePath: string
): Promise<void> {
    if (previousStoragePath === nextStoragePath) {
        return;
    }

    const previousUrl = buildMediaPublicUrl(previousStoragePath);
    const nextUrl = buildMediaPublicUrl(nextStoragePath);

    if (!previousUrl || !nextUrl) {
        return;
    }

    const supabase = await createClient();

    for (const updateReference of URL_REFERENCE_UPDATERS) {
        const { error } = await updateReference(supabase, previousUrl, nextUrl);

        if (error) {
            console.error(`[DAL] Media URL sync failed: ${error.message}`);
        }
    }
}
