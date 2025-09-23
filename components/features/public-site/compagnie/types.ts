import { z } from "zod";
import { PresentationSectionSchema as DalPresentationSectionSchema } from "@/lib/dal/compagnie-presentation";

// Schéma pour les valeurs de la compagnie
export const ValueSchema = z.object({
  icon: z.any(), // Type Lucide icon
  title: z.string(),
  description: z.string(),
});

// Schéma pour les membres de l'équipe
export const TeamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  image: z.string(),
});

// Types inférés des schémas
export type Value = z.infer<typeof ValueSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;

// Sections de présentation (structuration de la page)
export type PresentationSection = z.infer<typeof DalPresentationSectionSchema>;

// Props pour le composant CompagnieView
export interface CompagnieViewProps {
  sections: PresentationSection[];
  values: Value[];
  team: TeamMember[];
  loading?: boolean;
}

