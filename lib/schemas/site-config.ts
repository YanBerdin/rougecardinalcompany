import { z } from "zod";

/**
 * Standardized value schema for display toggles
 * Uses `max_items` (not `limit`) for consistency with existing seed data
 */
const DisplayToggleValueSchema = z.object({
    enabled: z.boolean(),
    max_items: z.number().int().positive().optional(),
    // Additional optional fields from existing configs
    autoplay: z.boolean().optional(),
    interval: z.number().int().positive().optional(),
    show_stats: z.boolean().optional(),
    show_mission: z.boolean().optional(),
    show_archived: z.boolean().optional(),
    show_inactive: z.boolean().optional(),
    show_private: z.boolean().optional(),
    double_optin: z.boolean().optional(),
    show_consent: z.boolean().optional(),
});

// ✅ Server Schema (for validation)
export const DisplayToggleInputSchema = z.object({
    key: z.string().regex(/^public:[a-z]+:[a-z_]+$/),
    value: DisplayToggleValueSchema,
});

// ✅ UI Schema (for forms - simplified)
export const DisplayToggleFormSchema = z.object({
    key: z.string(),
    enabled: z.boolean(),
    max_items: z.number().int().positive().optional(),
});

// ✅ DTO (returned by DAL - uses `key` as identifier, not `id`)
export type DisplayToggleDTO = {
    key: string;
    value: {
        enabled: boolean;
        max_items?: number;
        [key: string]: unknown; // Allow additional fields
    };
    description: string | null;
    category: string | null;
    updated_at: string;
    updated_by: string | null;
};

export type DisplayToggleInput = z.infer<typeof DisplayToggleInputSchema>;
export type DisplayToggleFormValues = z.infer<typeof DisplayToggleFormSchema>;
