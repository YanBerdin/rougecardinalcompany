import { z } from "zod";

// =============================================================================
// CONTACT REASON ENUM
// =============================================================================

export const ContactReasonEnum = z.enum([
    "booking",
    "partenariat",
    "presse",
    "education",
    "technique",
    "autre",
]);

export type ContactReason = z.infer<typeof ContactReasonEnum>;

// =============================================================================
// CONTACT MESSAGE SCHEMA (DAL/Database)
// =============================================================================

/**
 * Schema for contact form submission (DAL layer)
 * Uses firstName/lastName split format
 */
export const ContactMessageSchema = z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().email().toLowerCase(),
    phone: z.string().trim().max(40).optional().nullable(),
    reason: ContactReasonEnum.default("autre"),
    message: z.string().trim().min(1).max(5000),
    consent: z
        .boolean()
        .refine((v) => v === true, { message: "Consent required" }),
});

export type ContactMessageInput = z.infer<typeof ContactMessageSchema>;

// =============================================================================
// CONTACT EMAIL SCHEMA (Email notification format)
// =============================================================================

/**
 * Schema for email notification (different format from DAL)
 * Uses combined name and subject format
 */
export const ContactEmailSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
    message: z
        .string()
        .min(10, "Le message doit contenir au moins 10 caractères"),
    phone: z.string().optional(),
    reason: z.string().optional(),
    consent: z.boolean().refine((val) => val === true, {
        message: "Vous devez accepter les conditions",
    }),
});

export type ContactEmailInput = z.infer<typeof ContactEmailSchema>;

// =============================================================================
// NEWSLETTER SUBSCRIPTION SCHEMA
// =============================================================================

export const NewsletterSubscriptionSchema = z.object({
    email: z.string().email("Email invalide"),
    consent: z.boolean().optional().default(true),
    source: z.string().optional().default("website"),
});

export type NewsletterSubscription = z.infer<
    typeof NewsletterSubscriptionSchema
>;
