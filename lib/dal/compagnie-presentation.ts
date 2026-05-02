"use server";

import "server-only";
import { cache } from "react";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { compagniePresentationFallback } from "@/lib/dal/fallback/compagnie-presentation-fallback";
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
    "founder",
    "custom",
  ]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.array(z.string()).optional(),
  image: z.string().optional(),
  quote: z
    .object({ text: z.string(), author: z.string().optional() })
    .optional(),
  milestones: z
    .array(z.object({ year: z.string(), label: z.string() }))
    .optional(),
});

export type PresentationSection = z.infer<typeof PresentationSectionSchema>;

type SectionRecord = {
  id: number;
  slug: string;
  kind: "hero" | "history" | "quote" | "values" | "team" | "mission" | "founder" | "custom";
  title: string | null;
  subtitle: string | null;
  content: string[] | null;
  quote_text: string | null;
  quote_author: string | null;
  image_url: string | null;
  image_media_id: number | null;
  milestones: Array<{ year: string; label: string }> | null;
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
    milestones: r.milestones ?? undefined,
  } satisfies Partial<PresentationSection> as PresentationSection;

  if (r.kind === "founder") {
    return PresentationSectionSchema.parse(base);
  }

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

function getDefaultSections(): DALResult<PresentationSection[]> {
  return { success: true, data: compagniePresentationFallback };
}

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch active compagnie presentation sections.
 *
 * Wrapped with React cache() for intra-request deduplication.
 * Falls back to static data if database unavailable or empty.
 */
export const fetchCompagniePresentationSections = cache(
  async (): Promise<DALResult<PresentationSection[]>> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("compagnie_presentation_sections")
        .select("id, slug, kind, title, subtitle, content, quote_text, quote_author, image_url, image_media_id, milestones, position, active")
        .eq("active", true)
        .order("position", { ascending: true });

      if (error) {
        console.error("[ERR_PRESENTATION_001] fetchCompagniePresentationSections:", error);
        return getDefaultSections();
      }
      if (!data || data.length === 0) return getDefaultSections();

      const sections = (data as SectionRecord[]).map(mapRecordToSection);
      return { success: true, data: sections.map((s) => PresentationSectionSchema.parse(s)) };
    } catch (err: unknown) {
      console.error("[ERR_PRESENTATION_002] fetchCompagniePresentationSections:", err);
      return getDefaultSections();
    }
  }
);
