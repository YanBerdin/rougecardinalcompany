import { z } from "zod";

// Admin Zod schemas for Team Management (TASK022)
// Use database types via lib/database.types.ts when necessary for runtime checks

export const TeamMemberDbSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(200),
  role: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z
    .string()
    .url()
    .nullable()
    .optional()
    .or(z.literal("")),
  photo_media_id: z.number().nullable(),
  ordre: z.number().nullable(),
  active: z.boolean().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreateTeamMemberInputSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url()
    .nullable()
    .optional()
    .or(z.literal("")),
  photo_media_id: z.number().nullable().optional(),
  ordre: z.number().nullable().optional(),
  active: z.boolean().optional(),
});

export const UpdateTeamMemberInputSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z
    .string()
    .url()
    .nullable()
    .optional()
    .or(z.literal("")),
  photo_media_id: z.number().nullable().optional(),
  ordre: z.number().nullable().optional(),
  active: z.boolean().optional(),
});

export const ReorderTeamMembersInputSchema = z.array(
  z.object({ id: z.number(), ordre: z.number() })
);

export type TeamMemberDb = z.infer<typeof TeamMemberDbSchema>;
export type CreateTeamMemberInput = z.infer<typeof CreateTeamMemberInputSchema>;
export type UpdateTeamMemberInput = z.infer<typeof UpdateTeamMemberInputSchema>;
export type ReorderTeamMembersInput = z.infer<
  typeof ReorderTeamMembersInputSchema
>;

// =============================================================================
// SET ACTIVE BODY SCHEMA (API Route validation)
// =============================================================================

/**
 * Schema for toggling team member active status
 * Accepts boolean, string "true"/"false", or number 0/1
 */
export const SetActiveBodySchema = z.object({
  active: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]),
      z.number().int().min(0).max(1),
    ])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") return val === "true";
      return val === 1;
    }),
});

export type SetActiveBody = z.infer<typeof SetActiveBodySchema>;

// =============================================================================
// UI FORM SCHEMA (for react-hook-form + Next.js form components)
// =============================================================================

/**
 * UI schema for TeamMemberForm component
 * Uses number (not bigint) for JSON serialization compatibility with forms
 * 
 * @see CreateTeamMemberInputSchema for server-side validation
 */
export const TeamMemberFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200, "200 caractères maximum"),
  role: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().url("URL invalide").optional().nullable().or(z.literal("")),
  photo_media_id: z.number().int().positive().optional().nullable(),
  ordre: z.number().int().optional().nullable(),
  active: z.boolean().optional(),
});

export type TeamMemberFormValues = z.infer<typeof TeamMemberFormSchema>;

export default TeamMemberDbSchema;
