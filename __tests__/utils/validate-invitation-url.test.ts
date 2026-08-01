import { describe, expect, it } from "vitest";
import { isSafeInvitationUrl } from "@/lib/utils/validate-invitation-url";

const SUPABASE_URL = "https://project.supabase.co";
const CURRENT_ORIGIN = "http://localhost:3000";

function createInvitationUrl(redirectTo: string): string {
    const invitationUrl = new URL(`${SUPABASE_URL}/auth/v1/verify`);
    invitationUrl.searchParams.set("redirect_to", redirectTo);
    return invitationUrl.toString();
}

describe("isSafeInvitationUrl", () => {
    it("accepts a redirect to the current origin", () => {
        expect(
            isSafeInvitationUrl(
                createInvitationUrl(`${CURRENT_ORIGIN}/auth/callback`),
                SUPABASE_URL,
                CURRENT_ORIGIN,
            ),
        ).toBe(true);
    });

    it("accepts a redirect to the production origin", () => {
        expect(
            isSafeInvitationUrl(
                createInvitationUrl(
                    "https://compagnie-rouge-cardinal.fr/auth/callback",
                ),
                SUPABASE_URL,
                CURRENT_ORIGIN,
            ),
        ).toBe(true);
    });

    it("rejects a lookalike suffix domain", () => {
        expect(
            isSafeInvitationUrl(
                createInvitationUrl(
                    "https://compagnie-rouge-cardinal.fr.evil.test/auth/callback",
                ),
                SUPABASE_URL,
                CURRENT_ORIGIN,
            ),
        ).toBe(false);
    });

    it("rejects another origin and malformed URLs", () => {
        expect(
            isSafeInvitationUrl(
                createInvitationUrl("https://evil.test/auth/callback"),
                SUPABASE_URL,
                CURRENT_ORIGIN,
            ),
        ).toBe(false);
        expect(
            isSafeInvitationUrl("not-a-url", SUPABASE_URL, CURRENT_ORIGIN),
        ).toBe(false);
    });

    it("rejects non-verification or non-HTTPS Supabase URLs", () => {
        const nonVerificationUrl = new URL(`${SUPABASE_URL}/auth/v1/token`);
        nonVerificationUrl.searchParams.set(
            "redirect_to",
            `${CURRENT_ORIGIN}/auth/callback`,
        );

        expect(
            isSafeInvitationUrl(
                nonVerificationUrl.toString(),
                SUPABASE_URL,
                CURRENT_ORIGIN,
            ),
        ).toBe(false);
        expect(
            isSafeInvitationUrl(
                createInvitationUrl(`${CURRENT_ORIGIN}/auth/callback`).replace(
                    "https://project.supabase.co",
                    "http://project.supabase.co",
                ),
                SUPABASE_URL,
                CURRENT_ORIGIN,
            ),
        ).toBe(false);
    });
});