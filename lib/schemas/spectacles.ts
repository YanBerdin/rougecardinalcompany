import { z } from "zod";

/**
 * Database schema for spectacles table
 * Matches structure from supabase/schemas/06_table_spectacles.sql
 */
export const SpectacleDbSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  slug: z.string().nullable(),
  status: z.string().nullable(),
  description: z.string().nullable(),
  short_description: z.string().nullable(),
  genre: z.string().nullable(),
  duration_minutes: z.number().int().positive().nullable(),
  casting: z.number().int().positive().nullable(),
  premiere: z.string().nullable(), // timestamptz as string
  image_url: z.string().url().nullable(),
  public: z.boolean().default(true),
  awards: z.array(z.string()).nullable(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string(), // timestamptz as string
  updated_at: z.string(), // timestamptz as string
  search_vector: z.unknown().nullable(), // tsvector (not used in TypeScript)
});

/**
 * Input schema for creating a new spectacle
 * All fields optional except title (id is auto-generated)
 */
export const CreateSpectacleSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes")
    .optional(),
  status: z
    .enum(["draft", "published", "archived"])
    .optional()
    .default("draft"),
  description: z.string().optional(),
  short_description: z.string().max(500, "Short description too long").optional(),
  genre: z.string().max(100).optional(),
  duration_minutes: z
    .number()
    .int()
    .positive("Duration must be positive")
    .max(600, "Duration must be less than 10 hours")
    .optional(),
  casting: z
    .number()
    .int()
    .positive("Casting must be positive")
    .max(100, "Casting must be less than 100")
    .optional(),
  premiere: z
    .string()
    .datetime({ message: "Invalid datetime format" })
    .nullable()
    .optional(),
  image_url: z.string().url("Invalid URL format").optional(),
  public: z.boolean().default(false),
  awards: z.array(z.string()).optional(),
});

/**
 * Input schema for updating an existing spectacle
 * All fields optional including id (for partial updates)
 */
export const UpdateSpectacleSchema = CreateSpectacleSchema.partial().extend({
  id: z.number().int().positive("Invalid spectacle ID"),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type SpectacleDb = z.infer<typeof SpectacleDbSchema>;
export type CreateSpectacleInput = z.infer<typeof CreateSpectacleSchema>;
export type UpdateSpectacleInput = z.infer<typeof UpdateSpectacleSchema>;

/**
 * Minimal DTO for public API responses (excludes internal fields)
 */
export const SpectacleSummarySchema = SpectacleDbSchema.pick({
  id: true,
  title: true,
  slug: true,
  short_description: true,
  image_url: true,
  premiere: true,
  public: true,
  genre: true,
  duration_minutes: true,
  casting: true,
  status: true,
  awards: true,
});

export type SpectacleSummary = z.infer<typeof SpectacleSummarySchema>;
