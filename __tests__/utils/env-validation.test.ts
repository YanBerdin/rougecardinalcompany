import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateEnvironment, hasValidPrefix } from "@/lib/env-validation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STAGING_REF = "yvtrlvmbofklefxcxrzv";
const PROD_REF = "prodrefabc123xyz";

function makeValidEnv(
    overrides: Record<string, string | undefined> = {},
): Record<string, string | undefined> {
    return {
        VERCEL_ENV: "production",
        NEXT_PUBLIC_SUPABASE_URL: `https://${PROD_REF}.supabase.co`,
        SUPABASE_PROJECT_REF: PROD_REF,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: "sb_publishable_abc123",
        SUPABASE_SECRET_KEY: "sb_secret_xyz456",
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("hasValidPrefix", () => {
    it("matches a valid prefix", () => {
        expect(hasValidPrefix("sb_publishable_abc", ["eyJ", "sb_publishable_"])).toBe(true);
        expect(hasValidPrefix("eyJabc", ["eyJ", "sb_publishable_"])).toBe(true);
    });

    it("rejects unknown prefixes", () => {
        expect(hasValidPrefix("invalid_key", ["eyJ", "sb_publishable_"])).toBe(false);
        expect(hasValidPrefix("", ["eyJ"])).toBe(false);
    });
});

describe("validateEnvironment", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // -----------------------------------------------------------------------
    // Local dev — skip
    // -----------------------------------------------------------------------
    describe("when VERCEL_ENV is not set (local dev)", () => {
        it("skips validation and warns", () => {
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });

            validateEnvironment({ VERCEL_ENV: undefined });

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("VERCEL_ENV not defined"),
            );
        });
    });

    // -----------------------------------------------------------------------
    // Missing required vars
    // -----------------------------------------------------------------------
    describe("missing required variables", () => {
        it("throws when SUPABASE_URL is missing", () => {
            expect(() =>
                validateEnvironment({
                    VERCEL_ENV: "production",
                    SUPABASE_PROJECT_REF: PROD_REF,
                }),
            ).toThrow("Missing SUPABASE_URL or PROJECT_REF");
        });

        it("throws when PROJECT_REF is missing", () => {
            expect(() =>
                validateEnvironment({
                    VERCEL_ENV: "production",
                    NEXT_PUBLIC_SUPABASE_URL: `https://${PROD_REF}.supabase.co`,
                }),
            ).toThrow("Missing SUPABASE_URL or PROJECT_REF");
        });
    });

    // -----------------------------------------------------------------------
    // Check 1a: URL ref vs expected ref
    // -----------------------------------------------------------------------
    describe("check 1a — URL ref vs expected ref", () => {
        it("passes when URL ref matches expected ref", () => {
            expect(() => validateEnvironment(makeValidEnv())).not.toThrow();
        });

        it("throws in production on mismatch", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        NEXT_PUBLIC_SUPABASE_URL: `https://wrongref.supabase.co`,
                    }),
                ),
            ).toThrow("ENVIRONMENT MISMATCH");
        });

        it("warns (no throw) in preview on mismatch", () => {
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });

            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        VERCEL_ENV: "preview",
                        NEXT_PUBLIC_SUPABASE_URL: `https://wrongref.supabase.co`,
                    }),
                ),
            ).not.toThrow();

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("ENVIRONMENT MISMATCH"),
            );
        });

        it("throws on invalid URL format", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
                    }),
                ),
            ).toThrow("Invalid SUPABASE_URL format");
        });
    });

    // -----------------------------------------------------------------------
    // Check 1b: Non-production refs blocklist
    // -----------------------------------------------------------------------
    describe("check 1b — NON_PRODUCTION_REFS blocklist", () => {
        it("throws when production uses staging ref", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        NEXT_PUBLIC_SUPABASE_URL: `https://${STAGING_REF}.supabase.co`,
                        SUPABASE_PROJECT_REF: STAGING_REF,
                    }),
                ),
            ).toThrow("Non-production Supabase project used in production");
        });

        it("allows staging ref in preview environment", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        VERCEL_ENV: "preview",
                        NEXT_PUBLIC_SUPABASE_URL: `https://${STAGING_REF}.supabase.co`,
                        SUPABASE_PROJECT_REF: STAGING_REF,
                    }),
                ),
            ).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // Check 2: Anon key format
    // -----------------------------------------------------------------------
    describe("check 2 — anon key format", () => {
        it("accepts sb_publishable_ prefix", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: "sb_publishable_test",
                    }),
                ),
            ).not.toThrow();
        });

        it("accepts eyJ (legacy JWT) prefix", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: "eyJhbGciOiJIUzI1NiJ9",
                    }),
                ),
            ).not.toThrow();
        });

        it("throws on invalid anon key prefix", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: "invalid_key_format",
                    }),
                ),
            ).toThrow("anon key has unexpected format");
        });

        it("throws when anon key is missing", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: undefined,
                    }),
                ),
            ).toThrow("anon key has unexpected format");
        });
    });

    // -----------------------------------------------------------------------
    // Check 3: Secret key format
    // -----------------------------------------------------------------------
    describe("check 3 — secret key format", () => {
        it("accepts sb_secret_ prefix", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({ SUPABASE_SECRET_KEY: "sb_secret_test" }),
                ),
            ).not.toThrow();
        });

        it("accepts eyJ (legacy JWT) prefix", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({ SUPABASE_SECRET_KEY: "eyJhbGciOiJIUzI1NiJ9" }),
                ),
            ).not.toThrow();
        });

        it("throws on invalid secret key prefix", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({ SUPABASE_SECRET_KEY: "bad_prefix_key" }),
                ),
            ).toThrow("secret key has unexpected format");
        });

        it("throws when secret key is missing", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({ SUPABASE_SECRET_KEY: undefined }),
                ),
            ).toThrow("secret key has unexpected format");
        });
    });

    // -----------------------------------------------------------------------
    // Full valid environments (integration-like)
    // -----------------------------------------------------------------------
    describe("full valid configurations", () => {
        it("passes for production with new-format keys", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: "sb_publishable_abc",
                        SUPABASE_SECRET_KEY: "sb_secret_xyz",
                    }),
                ),
            ).not.toThrow();
        });

        it("passes for production with legacy JWT keys", () => {
            expect(() =>
                validateEnvironment(
                    makeValidEnv({
                        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: "eyJhbGciOiJIUzI1NiJ9",
                        SUPABASE_SECRET_KEY: "eyJhbGciOiJIUzI1NiJ9",
                    }),
                ),
            ).not.toThrow();
        });

        it("passes for preview environment", () => {
            expect(() =>
                validateEnvironment(makeValidEnv({ VERCEL_ENV: "preview" })),
            ).not.toThrow();
        });
    });
});
