"use server";

import "server-only";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";
import { isUniqueViolation } from "@/lib/api/helpers";

export type NewsletterSubscriberInput = {
    email: string;
    consent: boolean;
    source: string;
};

//TODO: add rate limiting
//* supabase/schemas/10_tables_system.sql
//* table public.abonnes_newsletter
/**
 * Handles newsletter subscription requests.
 *
 * Expects a JSON body with the following structure:
 * {
 *   email: string (valid email address),
 *   consent: boolean (optional, defaults to true),
 *   source: string (optional, max length 64, defaults to "home")
 * }
 *
 */
export async function createNewsletterSubscriber(
    input: NewsletterSubscriberInput
): Promise<DALResult<{ isNew: boolean }>> {
    const supabase = await createClient();

    // RGPD Compliance: Use INSERT instead of UPSERT to avoid exposing emails via RLS SELECT policy
    // Don't use .select() to avoid RLS blocking the read after insert
    const { error } = await supabase.from("abonnes_newsletter").insert({
        email: input.email,
        metadata: { consent: input.consent, source: input.source },
    });
    // Unique violation (duplicate email) is OK - user is already subscribed
    if (error && !isUniqueViolation(error)) {
        console.error(
            "[ERR_NEWSLETTER_001] createNewsletterSubscriber:",
            error.message
        );
        return { success: false, error: `[ERR_NEWSLETTER_001] ${error.message}` };
    }

    return { success: true, data: { isNew: !error } };
}
