"use server";
import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { DisplayToggleDTO } from "@/lib/schemas/site-config";
import type { DALResult } from "./helpers";

/**
 * Fetch display toggle by key
 *
 * Wrapped with React cache() for intra-request deduplication.
 * If called multiple times with the same key in the same request,
 * the database query runs only once.
 *
 * @param key - Config key (e.g., "display_toggle_home_hero")
 * @returns Display toggle configuration
 */
export const fetchDisplayToggle = cache(
  async (key: string): Promise<DALResult<DisplayToggleDTO | null>> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("configurations_site")
      .select("key, value, description, category, updated_at, updated_by")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      console.error("[DAL] fetchDisplayToggle error:", error);
      return { success: false, error: `[ERR_CONFIG_001] ${error.message}` };
    }

    // if the toggle is missing (data == null) and it's a display toggle,
    // return a sensible default so public pages don't break for anonymous users
    if (!data && key.startsWith("display_toggle_")) {
      const defaultData = {
        key,
        value: { enabled: true, max_items: null },
        description: "default: enabled for display toggles when not configured",
        category: "home_display",
        updated_at: null,
        updated_by: null,
      } as unknown as DisplayToggleDTO;

      return { success: true, data: defaultData };
    }

    return { success: true, data };
  }
);

/**
 * Fetch all display toggles by category
 *
 * Wrapped with React cache() for intra-request deduplication.
 *
 * @param category - Category filter (e.g., "home_display")
 * @returns Array of display toggles
 */
export const fetchDisplayTogglesByCategory = cache(
  async (category: string): Promise<DALResult<DisplayToggleDTO[]>> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("configurations_site")
      .select("key, value, description, category, updated_at, updated_by")
      .eq("category", category)
      .order("key", { ascending: true });

    if (error) {
      console.error("[DAL] fetchDisplayTogglesByCategory error:", error);
      return { success: false, error: `[ERR_CONFIG_002] ${error.message}` };
    }

    return { success: true, data: data ?? [] };
  }
);

/**
 * Update display toggle
 * IMPORTANT: Requires admin privileges
 * @param key - Config key
 * @param value - New toggle value
 * @returns Updated toggle
 */
export async function updateDisplayToggle(
  key: string,
  value: { enabled: boolean; max_items?: number }
): Promise<DALResult<DisplayToggleDTO>> {
  await requireAdmin();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("configurations_site")
    .update({
      value,
      updated_at: new Date().toISOString(),
      updated_by: user?.id,
    })
    .eq("key", key)
    .select()
    .single();

  if (error) {
    console.error("[DAL] updateDisplayToggle error:", error);
    return { success: false, error: `[ERR_CONFIG_003] ${error.message}` };
  }

  return { success: true, data };
}
