const PRODUCTION_ORIGIN = "https://compagnie-rouge-cardinal.fr";

/**
 * Validates a Supabase invitation verification URL and its local redirect.
 */
export function isSafeInvitationUrl(
    rawUrl: string,
    supabaseUrl: string,
    currentOrigin: string,
): boolean {
    try {
        const target = new URL(rawUrl);
        const supabaseHost = new URL(supabaseUrl).host;

        if (target.protocol !== "https:" || target.host !== supabaseHost) {
            return false;
        }
        if (!target.pathname.startsWith("/auth/v1/verify")) {
            return false;
        }

        const redirectTo = target.searchParams.get("redirect_to");
        if (!redirectTo) {
            return false;
        }

        const redirectTarget = new URL(redirectTo);
        const allowedOrigins = [currentOrigin, PRODUCTION_ORIGIN];

        return allowedOrigins.includes(redirectTarget.origin);
    } catch {
        return false;
    }
}