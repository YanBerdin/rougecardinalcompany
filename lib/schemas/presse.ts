/**
 * @file Presse Schemas
 * @description Zod schemas for press releases, media articles, and media kit (DAL + UI)
 * @module lib/schemas/presse
 */
import { z } from "zod";
import type { LucideIcon } from "lucide-react";

// =============================================================================
// ENUMS
// =============================================================================

export const MediaArticleTypeEnum = z.enum([
  "Article",
  "Critique",
  "Interview",
  "Portrait",
]);

// =============================================================================
// DATABASE/DAL SCHEMAS
// =============================================================================

/**
 * Press release schema (communiqués de presse)
 */
export const PressReleaseSchema = z.object({
  id: z.number(),
  title: z.string(),
  date: z.string(), // ISO date
  description: z.string(),
  fileUrl: z.string(),
  fileSize: z.string(),
});

/**
 * Media article schema (articles, interviews, reviews)
 */
export const MediaArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  type: MediaArticleTypeEnum,
  chapo: z.string(), // Introduction/chapô de l'article
  excerpt: z.string(), // Extrait/citation de l'article
  source_publication: z.string(),
  source_url: z.string(),
  published_at: z.string(),
});

/**
 * Media kit item schema (photos, logos, documents for download)
 * Icon is added at UI level (not in runtime data)
 */
export const MediaKitItemSchema = z.object({
  type: z.string(),
  description: z.string(),
  fileSize: z.string(),
  fileUrl: z.string(),
});

// =============================================================================
// TYPES
// =============================================================================

export type IconComponent = LucideIcon;
export type MediaArticleType = z.infer<typeof MediaArticleTypeEnum>;

export type PressRelease = z.infer<typeof PressReleaseSchema>;
export type MediaArticle = z.infer<typeof MediaArticleSchema>;
export type MediaKitItem = z.infer<typeof MediaKitItemSchema> & {
  icon?: IconComponent;
};

// =============================================================================
// FILTER SCHEMAS
// =============================================================================

export const PresseFilterSchema = z.object({
  type: MediaArticleTypeEnum.optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
});

export type PresseFilter = z.infer<typeof PresseFilterSchema>;