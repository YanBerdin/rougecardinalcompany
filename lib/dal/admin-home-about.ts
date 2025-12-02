"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import type { AboutContentInput, AboutContentDTO } from "@/lib/schemas/home-content";
import { AboutContentInputSchema } from "@/lib/schemas/home-content";
import { requireAdmin } from "@/lib/auth/is-admin";
import { type DALResult } from "@/lib/dal/helpers";

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch active about content (single record)
 * @returns Active about content or null if not found
 */
export async function fetchActiveAboutContent(): Promise<
  DALResult<AboutContentDTO | null>
> {
  try {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("home_about_content")
      .select("*")
      .eq("active", true)
      .order("position", { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: true, data: null };
      }
      console.error("[DAL] fetchActiveAboutContent error:", error);
      return {
        success: false,
        error: `[ERR_ABOUT_001] Failed to fetch about content: ${error.message}`,
      };
    }

    return { success: true, data };
  } catch (err: unknown) {
    console.error("[DAL] fetchActiveAboutContent unexpected error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "[ERR_ABOUT_002] Unknown error",
    };
  }
}

/**
 * Update about content
 * @param id - About content ID
 * @param input - About content data
 * @returns Updated about content
 */
export async function updateAboutContent(
  id: bigint,
  input: AboutContentInput
): Promise<DALResult<AboutContentDTO>> {
  try {
    await requireAdmin();

    const validated = AboutContentInputSchema.parse(input);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("home_about_content")
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[DAL] updateAboutContent error:", error);
      return {
        success: false,
        error: `[ERR_ABOUT_003] Failed to update about content: ${error.message}`,
      };
    }

    return { success: true, data };
  } catch (err: unknown) {
    console.error("[DAL] updateAboutContent unexpected error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "[ERR_ABOUT_004] Unknown error",
    };
  }
}
