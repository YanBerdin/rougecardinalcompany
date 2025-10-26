import { z } from "zod";

// Admin Zod schemas for Team Management (TASK022)
// Use database types via lib/database.types.ts when necessary for runtime checks

export const TeamMemberDbSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(200),
  role: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
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
  image_url: z.string().url().nullable().optional(),
  photo_media_id: z.number().nullable().optional(),
  ordre: z.number().nullable().optional(),
  active: z.boolean().optional(),
});

export const UpdateTeamMemberInputSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
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

export default TeamMemberDbSchema;
