/**
 * @file Compagnie Schemas
 * @description Zod schemas for company values and team members (DAL + UI)
 * @module lib/schemas/compagnie
 */
import { z } from "zod";

// =============================================================================
// DATABASE/DAL SCHEMAS
// =============================================================================

/**
 * Company value schema (mission, vision, values)
 */
export const ValueSchema = z.object({
  title: z.string(),
  description: z.string(),
});

/**
 * Team member schema for PUBLIC display
 * Note: This is a simplified schema for the public view
 * - 'image' is a VIRTUAL field mapped from DB fields 'image_url' or 'photo_media_id'
 * - For admin CRUD operations, use TeamMemberInputSchema from team.ts
 */
export const TeamMemberSchema = z.object({
  name: z.string(),
  role: z.string().nullable(), // Aligned with DB (string | null)
  description: z.string().nullable(), // Aligned with DB (string | null)
  image: z.string(), // Virtual field (mapped from image_url or photo_media_id → medias.url)
});

// =============================================================================
// TYPES
// =============================================================================

export type Value = z.infer<typeof ValueSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;

// =============================================================================
// PRESENTATION SECTION
// =============================================================================

/**
 * NOTE: PresentationSection type is defined in lib/dal/compagnie-presentation.ts
 * because it's tightly coupled to the DAL mapping logic and database schema.
 *
 * Import it from there:
 * import type { PresentationSection } from "@/lib/dal/compagnie-presentation";
 *
 * This follows the principle that the DAL owns the DTO types for its entities.
 */