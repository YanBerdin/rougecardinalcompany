"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { DisplayToggleDTO } from "@/lib/schemas/site-config";
import type { DALResult } from "./helpers";

/**
 * Fetch display toggle by key
 * @param key - Config key (e.g., "public:home:newsletter")
 * @returns Display toggle configuration
 */
export async function fetchDisplayToggle(
  key: string
): Promise<DALResult<DisplayToggleDTO | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("configurations_site")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error("[DAL] fetchDisplayToggle error:", error);
    return { success: false, error: `[ERR_CONFIG_001] ${error.message}` };
  }

  return { success: true, data };
}

/**
 * Fetch all display toggles by category
 * @param category - Category filter (e.g., "home_display")
 * @returns Array of display toggles
 */
export async function fetchDisplayTogglesByCategory(
  category: string
): Promise<DALResult<DisplayToggleDTO[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("configurations_site")
    .select("*")
    .eq("category", category)
    .order("key", { ascending: true });

  if (error) {
    console.error("[DAL] fetchDisplayTogglesByCategory error:", error);
    return { success: false, error: `[ERR_CONFIG_002] ${error.message}` };
  }

  return { success: true, data: data ?? [] };
}

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
