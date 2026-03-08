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
    firstName: z.string().trim().min(1, "Le prénom est requis").max(100, "Le prénom est trop long"),
    lastName: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
    email: z.string().email("L'adresse email est invalide").toLowerCase(),
    phone: z.string().trim().max(40, "Le numéro est trop long (40 caractères max)").optional().nullable(),
    reason: ContactReasonEnum.default("autre"),
    message: z.string().trim().min(1, "Le message est requis").max(5000, "Le message est trop long (5000 caractères maximum)"),
    consent: z
        .boolean()
        .refine((v) => v === true, { message: "Vous devez accepter les conditions pour envoyer votre message." }),
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
