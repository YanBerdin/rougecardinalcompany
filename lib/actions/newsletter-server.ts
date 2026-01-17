"use server";

import "server-only";
import { NewsletterSubscriptionSchema } from "@/lib/schemas/newsletter";
import { sendNewsletterConfirmation } from "@/lib/email/actions";
import {
    createNewsletterSubscriber,
    type NewsletterSubscriberInput,
} from "@/lib/dal/newsletter-subscriber";
import type { ActionResult } from "@/lib/actions/types";
import { recordRequest } from "@/lib/utils/rate-limit";

type NewsletterSubscriptionResult = ActionResult<{
    status: "subscribed";
    warning?: string;
}>;

export async function handleNewsletterSubscription(
    input: unknown
): Promise<NewsletterSubscriptionResult> {
    // 1. Validation email MINIMALE (pour normaliser la clé)
    if (!input || typeof input !== "object" || !("email" in input) || typeof input.email !== "string") {
        return { success: false, error: "Email requis" };
    }
    const normalizedEmail = input.email.toLowerCase().trim();

    // 2. Rate-limiting AVANT validation complète
    const rateLimitKey = `newsletter:${normalizedEmail}`;

    const rateLimit = recordRequest(
        rateLimitKey,
        3, // max 3 requêtes
        60 * 60 * 1000 // fenêtre de 1 heure
    );

    if (!rateLimit.success) {
        console.warn(`[Newsletter] Rate limit exceeded for email: ${normalizedEmail}`);
        return {
            success: false,
            error: `Trop de tentatives d'inscription. Veuillez réessayer dans ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes.`,
        };
    }

    // 3. Validation complète APRÈS rate-limiting
    const validation = NewsletterSubscriptionSchema.safeParse(input);

    if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        return {
            success: false,
            error: firstIssue?.message ?? "Validation failed",
        };
    }

    const subscriberInput: NewsletterSubscriberInput = {
        email: validation.data.email,
        consent: validation.data.consent,
        source: validation.data.source,
    };

    const dalResult = await createNewsletterSubscriber(subscriberInput);
    if (!dalResult.success) {
        console.error("[Newsletter] Database error:", dalResult.error);
        return { success: false, error: "Subscription failed" };
    }

    let emailSent = true;
    try {
        await sendNewsletterConfirmation(validation.data.email);
    } catch (emailError) {
        console.error("[Newsletter] Confirmation email failed:", emailError);
        emailSent = false;
        // Ne pas échouer la souscription si l'email échoue (inscription en base réussie)
    }

    return {
        success: true,
        data: {
            status: "subscribed",
            ...(emailSent ? {} : { warning: "Confirmation email could not be sent" }),
        },
    };
}
