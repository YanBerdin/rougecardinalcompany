import { z } from "zod";

export const NewsletterSubscriptionSchema = z.object({
  email: z.string().email("Email invalide"),
  consent: z.boolean().optional().default(true),
  source: z.string().optional().default("website"),
});

export const ContactMessageSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  phone: z.string().optional(),
  reason: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions"
  }),
});

export type NewsletterSubscription = z.infer<typeof NewsletterSubscriptionSchema>;
export type ContactMessage = z.infer<typeof ContactMessageSchema>;