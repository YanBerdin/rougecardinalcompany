"use server";
import "server-only";
import { createClient } from "@/supabase/server";

/**
 * @file Media Usage Tracking DAL
 * @description Check if media is used in public marketing pages
 * @module lib/dal/media-usage
 */

export interface MediaUsageCheck {
    is_used_public: boolean;
    usage_locations: string[];
}

/**
 * Check if a media is used in public marketing pages
 * @param mediaId - Media ID to check
 * @returns Usage information
 */
export async function checkMediaUsagePublic(
    mediaId: bigint
): Promise<MediaUsageCheck> {
    const supabase = await createClient();
    const locations: string[] = [];

    try {
        // Check home_hero_slides (active + within schedule window)
        const { data: heroSlides } = await supabase
            .from("home_hero_slides")
            .select("id")
            .eq("image_media_id", mediaId)
            .eq("active", true)
            .limit(1);

        if (heroSlides && heroSlides.length > 0) {
            locations.push("home_hero_slides");
        }

        // Check home_about_content (active only)
        const { data: aboutContent } = await supabase
            .from("home_about_content")
            .select("id")
            .eq("image_media_id", mediaId)
            .eq("active", true)
            .limit(1);

        if (aboutContent && aboutContent.length > 0) {
            locations.push("home_about");
        }

        // Check membres_equipe (active only)
        const { data: teamMembers } = await supabase
            .from("membres_equipe")
            .select("id")
            .eq("photo_media_id", mediaId)
            .eq("active", true)
            .limit(1);

        if (teamMembers && teamMembers.length > 0) {
            locations.push("team_members");
        }

        // Check spectacles (active only)
        const { data: spectacles } = await supabase
            .from("spectacles")
            .select("id")
            .eq("og_image_media_id", mediaId)
            .eq("active", true)
            .limit(1);

        if (spectacles && spectacles.length > 0) {
            locations.push("spectacles");
        }

        // Check spectacles_medias (photos paysage - public spectacles only)
        const { data: spectaclePhotos } = await supabase
            .from("spectacles_medias")
            .select(`
                id,
                spectacles!inner(id, public)
            `)
            .eq("media_id", mediaId)
            .eq("spectacles.public", true)
            .limit(1);

        if (spectaclePhotos && spectaclePhotos.length > 0) {
            locations.push("spectacle_photos");
        }

        // Check articles_presse (published only)
        const { data: articles } = await supabase
            .from("articles_presse")
            .select("id")
            .eq("og_image_media_id", mediaId)
            .not("published_at", "is", null)
            .limit(1);

        if (articles && articles.length > 0) {
            locations.push("press_articles");
        }

        // Check partners (is_active only)
        const { data: partners } = await supabase
            .from("partners")
            .select("id")
            .eq("logo_media_id", mediaId)
            .eq("is_active", true)
            .limit(1);

        if (partners && partners.length > 0) {
            locations.push("partners");
        }

        // Check compagnie_presentation_sections (active only)
        const { data: sections } = await supabase
            .from("compagnie_presentation_sections")
            .select("id")
            .eq("image_media_id", mediaId)
            .eq("active", true)
            .limit(1);

        if (sections && sections.length > 0) {
            locations.push("company_sections");
        }

        return {
            is_used_public: locations.length > 0,
            usage_locations: locations,
        };
    } catch (error) {
        console.error("[checkMediaUsagePublic] Error:", error);
        return {
            is_used_public: false,
            usage_locations: [],
        };
    }
}

/**
 * Bulk check media usage for multiple media IDs
 * Optimized for performance with single query per table
 * @param mediaIds - Array of media IDs to check
 * @returns Map of media ID to usage info
 */
export async function bulkCheckMediaUsagePublic(
    mediaIds: bigint[]
): Promise<Map<string, MediaUsageCheck>> {
    const supabase = await createClient();
    const usageMap = new Map<string, MediaUsageCheck>();

    // Initialize all as not used
    mediaIds.forEach((id) => {
        usageMap.set(String(id), {
            is_used_public: false,
            usage_locations: [],
        });
    });

    // Convert bigint[] to number[] for Supabase compatibility
    const numericIds = mediaIds.map((id) => Number(id));

    try {
        // Batch check all tables
        const [heroSlides, aboutContent, teamMembers, spectacles, spectaclePhotos, articles, partners, sections] =
            await Promise.all([
                supabase
                    .from("home_hero_slides")
                    .select("image_media_id")
                    .in("image_media_id", numericIds)
                    .eq("active", true),

                supabase
                    .from("home_about_content")
                    .select("image_media_id")
                    .in("image_media_id", numericIds)
                    .eq("active", true),

                supabase
                    .from("membres_equipe")
                    .select("photo_media_id")
                    .in("photo_media_id", numericIds)
                    .eq("active", true),

                supabase
                    .from("spectacles")
                    .select("og_image_media_id")
                    .in("og_image_media_id", numericIds)
                    .eq("active", true),

                supabase
                    .from("spectacles_medias")
                    .select(`
                        media_id,
                        spectacles!inner(id, public)
                    `)
                    .in("media_id", numericIds)
                    .eq("spectacles.public", true),

                supabase
                    .from("articles_presse")
                    .select("og_image_media_id")
                    .in("og_image_media_id", numericIds)
                    .not("published_at", "is", null),

                supabase
                    .from("partners")
                    .select("logo_media_id")
                    .in("logo_media_id", numericIds)
                    .eq("is_active", true),

                supabase
                    .from("compagnie_presentation_sections")
                    .select("image_media_id")
                    .in("image_media_id", numericIds)
                    .eq("active", true),
            ]);

        // Process results
        heroSlides.data?.forEach((row) => {
            const key = String(row.image_media_id);
            const existing = usageMap.get(key);
            if (existing) {
                existing.is_used_public = true;
                existing.usage_locations.push("home_hero_slides");
            }
        });

        aboutContent.data?.forEach((row) => {
            const key = String(row.image_media_id);
            const existing = usageMap.get(key);
            if (existing) {
                existing.is_used_public = true;
                existing.usage_locations.push("home_about");
            }
        });

        teamMembers.data?.forEach((row) => {
            const key = String(row.photo_media_id);
            const existing = usageMap.get(key);
            if (existing) {
                existing.is_used_public = true;
                existing.usage_locations.push("team_members");
            }
        });

        spectacles.data?.forEach((row) => {
            const key = String(row.og_image_media_id);
            const existing = usageMap.get(key);
            if (existing) {
                existing.is_used_public = true;
                existing.usage_locations.push("spectacles");
            }
        });

        spectaclePhotos.data?.forEach((row) => {
            const key = String(row.media_id);
            const existing = usageMap.get(key);
            if (existing) {
                existing.is_used_public = true;
                existing.usage_locations.push("spectacle_photos");
            }
        });

        articles.data?.forEach((row) => {
            const key = String(row.og_image_media_id);
            const existing = usageMap.get(key);
            if (existing) {
                existing.is_used_public = true;
                existing.usage_locations.push("press_articles");
            }
        });

        partners.data?.forEach((row) => {
            const key = String(row.logo_media_id);
            const existing = usageMap.get(key);
            if (existing) {
                existing.is_used_public = true;
                existing.usage_locations.push("partners");
            }
        });

        sections.data?.forEach((row) => {
            const key = String(row.image_media_id);
            const existing = usageMap.get(key);
            if (existing) {
                existing.is_used_public = true;
                existing.usage_locations.push("company_sections");
            }
        });

        return usageMap;
    } catch (error) {
        console.error("[bulkCheckMediaUsagePublic] Error:", error);
        return usageMap;
    }
}
