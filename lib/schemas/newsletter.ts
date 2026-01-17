import { z } from "zod";

// =============================================================================
// Newsletter Subscription Schema
// =============================================================================

export const NewsletterSubscriptionSchema = z.object({
    email: z.string().email("Email invalide"),
    consent: z.boolean().optional().default(true),
    source: z.string().optional().default("website"),
});

export type NewsletterSubscription = z.infer<
    typeof NewsletterSubscriptionSchema
>;
