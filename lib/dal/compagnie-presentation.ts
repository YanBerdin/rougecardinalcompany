"use server";

import "server-only";
import { cache } from "react";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { compagniePresentationFallback } from "@/components/features/public-site/compagnie/data/presentation";
import { type DALResult } from "@/lib/dal/helpers";

const PresentationSectionSchema = z.object({
  id: z.string(),
  kind: z.enum([
    "hero",
    "history",
    "quote",
    "values",
    "team",
    "mission",
    "custom",
  ]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.array(z.string()).optional(),
  image: z.string().optional(),
  quote: z
    .object({ text: z.string(), author: z.string().optional() })
    .optional(),
});

export type PresentationSection = z.infer<typeof PresentationSectionSchema>;

type SectionRecord = {
  id: number;
  slug: string;
  kind: "hero" | "history" | "quote" | "values" | "team" | "mission" | "custom";
  title: string | null;
  subtitle: string | null;
  content: string[] | null;
  quote_text: string | null;
  quote_author: string | null;
  image_url: string | null;
  image_media_id: number | null;
  position: number;
  active: boolean;
};

// =============================================================================
// Helpers
// =============================================================================

function mapRecordToSection(r: SectionRecord): PresentationSection {
  const base = {
    id: r.slug,
    kind: r.kind,
    title: r.title ?? undefined,
    subtitle: r.subtitle ?? undefined,
    content: r.content ?? undefined,
    image: r.image_url ?? undefined,
  } satisfies Partial<PresentationSection> as PresentationSection;

  if (r.kind === "quote") {
    return PresentationSectionSchema.parse({
      ...base,
      quote: r.quote_text
        ? { text: r.quote_text, author: r.quote_author ?? undefined }
        : undefined,
    });
  }

  return PresentationSectionSchema.parse(base);
}

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch active compagnie presentation sections
 *
 * Wrapped with React cache() for intra-request deduplication.
 * Falls back to static data if database unavailable or empty
 *
 * @returns Presentation sections ordered by position
 */
export const fetchCompagniePresentationSections = cache(
  async (): Promise<DALResult<PresentationSection[]>> => {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("compagnie_presentation_sections")
        .select(
          "id, slug, kind, title, subtitle, content, quote_text, quote_author, image_url, image_media_id, position, active"
        )
        .eq("active", true)
        .order("position", { ascending: true });

      if (error) {
        console.error("[DAL] fetchCompagniePresentationSections error:", error);
        // Fallback to static data on error
        return {
          success: true,
          data: compagniePresentationFallback as unknown as PresentationSection[],
        };
      }

      if (!data || data.length === 0) {
        // Fallback to static data if table empty
        return {
          success: true,
          data: compagniePresentationFallback as unknown as PresentationSection[],
        };
      }

      const sections = (data as SectionRecord[]).map(mapRecordToSection);
      const validatedSections = sections.map((s) =>
        PresentationSectionSchema.parse(s)
      );

      return { success: true, data: validatedSections };
    } catch (err: unknown) {
      console.error(
        "[DAL] fetchCompagniePresentationSections unexpected error:",
        err
      );
      // Fallback on unexpected errors
      return {
        success: true,
        data: compagniePresentationFallback as unknown as PresentationSection[],
      };
    }
  }
);
