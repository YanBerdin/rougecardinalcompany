"use server";

import "server-only";
import { NewsletterSubscriptionSchema } from "@/lib/schemas/contact";
import { sendNewsletterConfirmation } from "@/lib/email/actions";
import {
    createNewsletterSubscriber,
    type NewsletterSubscriberInput,
} from "@/lib/dal/newsletter-subscriber";
import type { ActionResult } from "@/lib/actions/types";

type NewsletterSubscriptionResult = ActionResult<{
    status: "subscribed";
    warning?: string;
}>;

export async function handleNewsletterSubscription(
    input: unknown
): Promise<NewsletterSubscriptionResult> {
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
