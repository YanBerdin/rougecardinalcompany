"use server";

import "server-only";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { compagniePresentationFallback } from "@/components/features/public-site/compagnie/data/presentation";

export const PresentationSectionSchema = z.object({
  id: z.string(),
  kind: z.enum(["hero", "history", "quote", "values", "team", "mission", "custom"]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.array(z.string()).optional(),
  image: z.string().optional(),
  quote: z
    .object({ text: z.string(), author: z.string().optional() })
    .optional(),
});

export type PresentationSection = z.infer<typeof PresentationSectionSchema>;

// Raw DB record type
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

export async function fetchCompagniePresentationSections(): Promise<PresentationSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compagnie_presentation_sections")
    .select(
      "id, slug, kind, title, subtitle, content, quote_text, quote_author, image_url, image_media_id, position, active"
    )
    .eq("active", true)
    .order("position", { ascending: true });

  if (error) {
    console.error("fetchCompagniePresentationSections error", error);
    // Fallback automatique si la lecture échoue
    return compagniePresentationFallback as unknown as PresentationSection[];
  }

  if (!data || data.length === 0) {
    // Fallback automatique si la table est vide
    return compagniePresentationFallback as unknown as PresentationSection[];
  }

  const sections = (data as SectionRecord[]).map(mapRecordToSection);

  // Final validation and sanitization
  return sections.map((s) => PresentationSectionSchema.parse(s));
}
