"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import { dalError, dalSuccess, getErrorMessage, type DALResult } from "@/lib/dal/helpers/error";

interface TrackPageViewInput {
    pathname: string;
    sessionId: string;
    userAgent?: string;
}

/**
 * Track a page view event in analytics_events.
 * Runs with the authenticated user's (or anon) RLS context.
 * Never throws — failures are silently swallowed to avoid disrupting navigation.
 */
export async function trackPageView(
    input: TrackPageViewInput
): Promise<DALResult<null>> {
    try {
        const supabase = await createClient();

        const { error } = await supabase.from("analytics_events").insert({
            event_type: "page_view",
            pathname: input.pathname,
            session_id: input.sessionId,
            user_agent: input.userAgent?.slice(0, 500) ?? null,
        });

        if (error) {
            return dalError(`Track page view failed: ${error.message}`);
        }

        return dalSuccess(null);
    } catch (err) {
        return dalError(getErrorMessage(err));
    }
}
