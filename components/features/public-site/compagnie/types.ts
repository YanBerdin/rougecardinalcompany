import { z } from "zod";
import { PresentationSection as DalPresentationSection } from "@/lib/dal/compagnie-presentation";

// Schéma pour les valeurs de la compagnie
export const ValueSchema = z.object({
  title: z.string(),
  description: z.string(),
});

// Team Member Schema
// Note: This is a simplified schema for the PUBLIC view
// - 'image' is a VIRTUAL field mapped from DB fields 'image_url' (external URL) or 'photo_media_id' (Media Library)
// - Admin schema with all DB fields is in lib/schemas/team.ts (TASK022)
export const TeamMemberSchema = z.object({
  name: z.string(),
  role: z.string().nullable(), // Aligned with DB (string | null)
  description: z.string().nullable(), // Aligned with DB (string | null)
  image: z.string(), // Virtual field (mapped from image_url or photo_media_id → medias.url)
});

// Types inférés des schémas
export type Value = z.infer<typeof ValueSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;

// Sections de présentation (structuration de la page)
export type PresentationSection = DalPresentationSection;

// Props pour le composant CompagnieView
export interface CompagnieViewProps {
  sections: PresentationSection[];
  values: Value[];
  team: TeamMember[];
  loading?: boolean;
}
