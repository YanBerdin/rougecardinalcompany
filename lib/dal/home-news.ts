"use server";

import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";

export type FeaturedArticleRecord = {
  id: number;
  title: string;
  chapo: string | null;
  excerpt: string | null;
  source_url: string | null;
  source_publication: string | null;
  published_at: string;
  image_url: string | null;
};

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch featured press articles for the homepage "À la Une" section
 *
 * Queries articles_presse (revue de presse externe) ordered by
 * publication date, without time-based filtering.
 *
 * Wrapped with React cache() for intra-request deduplication.
 *
 * @param limit Maximum number of articles to return
 * @returns Published press articles ordered by date (most recent first)
 */
export const fetchFeaturedArticles = cache(
  async (limit = 3): Promise<DALResult<FeaturedArticleRecord[]>> => {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("articles_presse")
        .select(
          "id, title, chapo, excerpt, source_url, source_publication, published_at, image_url"
        )
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[DAL] fetchFeaturedArticles error:", error);
        return {
          success: false,
          error: `[ERR_HOME_NEWS_001] Failed to fetch articles: ${error.message}`,
        };
      }

      return { success: true, data: data ?? [] };
    } catch (err: unknown) {
      console.error("[DAL] fetchFeaturedArticles unexpected error:", err);
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
