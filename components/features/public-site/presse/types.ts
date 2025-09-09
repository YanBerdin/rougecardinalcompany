import { z } from "zod";
import { LucideIcon } from "lucide-react";

// Schéma pour les communiqués de presse
export const PressReleaseSchema = z.object({
  id: z.number(),
  title: z.string(),
  date: z.string(),
  description: z.string(),
  fileUrl: z.string(),
  fileSize: z.string(),
});

// Schéma pour les articles médias
export const MediaArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  type: z.enum(["Article", "Critique", "Interview", "Portrait"]),
  excerpt: z.string(),
  source_publication: z.string(),
  source_url: z.string(),
  published_at: z.string(),
});

// Schéma pour les éléments du kit média
export const MediaKitItemSchema = z.object({
  type: z.string(),
  description: z.string(),
  icon: z.any(), // LucideIcon
  fileSize: z.string(),
  fileUrl: z.string(),
});

// Types inférés des schémas
export type PressRelease = z.infer<typeof PressReleaseSchema>;
export type MediaArticle = z.infer<typeof MediaArticleSchema>;
export type MediaKitItem = z.infer<typeof MediaKitItemSchema>;

// Props pour le composant PresseView
export interface PresseViewProps {
  pressReleases: PressRelease[];
  mediaArticles: MediaArticle[];
  mediaKit: MediaKitItem[];
  loading?: boolean;
}
