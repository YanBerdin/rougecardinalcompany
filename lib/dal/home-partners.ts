"use server";

import "server-only";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";

// Re-export types for consumers
export type { DALResult };

export type PartnerRecord = {
  id: number;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  is_active: boolean;
  display_order: number;
};

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch active partners for homepage display
 * @param limit Maximum number of partners to return
 * @returns Active partners ordered by display order
 */
export async function fetchActivePartners(
  limit = 12
): Promise<DALResult<PartnerRecord[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("partners")
      .select(
        "id, name, description, website_url, logo_url, is_active, display_order"
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

    return { success: true, data: data ?? [] };
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
