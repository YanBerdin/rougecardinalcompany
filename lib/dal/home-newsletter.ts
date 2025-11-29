"use server";

import "server-only";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";

export type NewsletterSettings = {
  enabled: boolean;
  title?: string | null;
  subtitle?: string | null;
};

const NewsletterSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
});

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch newsletter settings from site configurations
 * @returns Newsletter section settings (enabled, title, subtitle)
 */
export async function fetchNewsletterSettings(): Promise<
  DALResult<NewsletterSettings>
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("configurations_site")
      .select("value")
      .eq("key", "public:home:newsletter")
      .maybeSingle();

    if (error) {
      console.error("[DAL] fetchNewsletterSettings error:", error);
      return {
        success: false,
        error: `[ERR_HOME_NEWSLETTER_001] Failed to fetch newsletter settings: ${error.message}`,
      };
    }

    const parsed = NewsletterSettingsSchema.safeParse(data?.value ?? {});
    if (!parsed.success) {
      // Return default settings if parsing fails
      return { success: true, data: { enabled: true } };
    }

    return { success: true, data: parsed.data };
  } catch (err: unknown) {
    console.error("[DAL] fetchNewsletterSettings unexpected error:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "[ERR_HOME_NEWSLETTER_002] Unknown error",
    };
  }
}
