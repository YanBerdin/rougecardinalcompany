"use server";

import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";

export type PartnerRecord = {
  id: number;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  is_active: boolean;
  display_order: number;
};

/**
 * Build public URL from storage_path
 */
function buildMediaUrl(storagePath: string | null): string | null {
  if (!storagePath) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medias/${storagePath}`;
}

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch active partners for homepage display
 *
 * Wrapped with React cache() for intra-request deduplication.
 * Priority: media library (logo_media_id) > direct URL (logo_url)
 *
 * @param limit Maximum number of partners to return
 * @returns Active partners ordered by display order
 */
export const fetchActivePartners = cache(
  async (limit = 12): Promise<DALResult<PartnerRecord[]>> => {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("partners")
        .select(
          `
          id,
          name,
          description,
          website_url,
          logo_url,
          logo_media_id,
          is_active,
          display_order,
          media:logo_media_id (
            storage_path
          )
        `
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("[DAL] fetchActivePartners error:", error);
        return {
          success: false,
          error: `[ERR_HOME_PARTNERS_001] Failed to fetch partners: ${error.message}`,
        };
      }

      const partners: PartnerRecord[] = (data ?? []).map((partner) => {
        const mediaData = partner.media as { storage_path: string } | { storage_path: string }[] | null;
        const storagePath = Array.isArray(mediaData)
          ? mediaData[0]?.storage_path ?? null
          : mediaData?.storage_path ?? null;

        return {
          id: Number(partner.id),
          name: partner.name,
          description: partner.description,
          website_url: partner.website_url,
          logo_url: buildMediaUrl(storagePath) ?? partner.logo_url ?? null,
          is_active: partner.is_active,
          display_order: partner.display_order,
        };
      });

      return { success: true, data: partners };
    } catch (err: unknown) {
      console.error("[DAL] fetchActivePartners unexpected error:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "[ERR_HOME_PARTNERS_002] Unknown error",
      };
    }
  }
);
