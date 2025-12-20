"use server";

import "server-only";
import { handleNewsletterSubscription } from "@/lib/actions/newsletter-server";
import type { ActionResult } from "@/lib/actions/types";

type NewsletterActionResult = ActionResult<{
    status: "subscribed";
    warning?: string;
}>;

export async function subscribeNewsletterAction(
    formData: FormData
): Promise<NewsletterActionResult> {
    const input = {
        email: formData.get("email"),
        consent: formData.get("consent") !== "false",
        source: formData.get("source") || "website",
    };

    return handleNewsletterSubscription(input);
}
