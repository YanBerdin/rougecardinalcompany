// lib/env-validation.ts
// Environment consistency validation for production safety.
// Extracted from instrumentation.ts to enable unit testing.

const VALID_KEY_PREFIXES = ["eyJ", "sb_publishable_"] as const;
const VALID_SECRET_PREFIXES = ["eyJ", "sb_secret_"] as const;

// Known non-production project refs (staging, dev)
// Update this list when adding/removing Supabase projects
const NON_PRODUCTION_REFS = ["yvtrlvmbofklefxcxrzv"] as const;

export function hasValidPrefix(
    value: string,
    prefixes: readonly string[],
): boolean {
    return prefixes.some((prefix) => value.startsWith(prefix));
}

type EnvLike = Record<string, string | undefined>;

export function validateEnvironment(
    envVars: EnvLike = process.env as EnvLike,
): void {
    const vercelEnv = envVars.VERCEL_ENV;
    const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
    const expectedRef = envVars.SUPABASE_PROJECT_REF;
    const anonKey = envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
    const secretKey = envVars.SUPABASE_SECRET_KEY;

    // Skip in local dev (no VERCEL_ENV)
    if (!vercelEnv) {
        console.warn("⚠️ VERCEL_ENV not defined (local dev)");
        return;
    }

    if (!supabaseUrl || !expectedRef) {
        throw new Error("❌ Missing SUPABASE_URL or PROJECT_REF");
    }

    // Check 1a: URL project ref matches expected ref
    let urlRef: string;
    try {
        urlRef = new URL(supabaseUrl).hostname.split(".")[0];
    } catch {
        throw new Error("❌ Invalid SUPABASE_URL format");
    }

    if (urlRef !== expectedRef) {
        const message = [
            "🚨 ENVIRONMENT MISMATCH",
            `VERCEL_ENV: ${vercelEnv}`,
            `EXPECTED_REF: ${expectedRef}`,
            `URL_REF: ${urlRef}`,
        ].join("\n");

        if (vercelEnv === "production") {
            throw new Error(message);
        }
        console.warn(message);
    }

    // Check 1b: Production must never use a known staging/dev project
    if (
        vercelEnv === "production" &&
        NON_PRODUCTION_REFS.includes(
            urlRef as (typeof NON_PRODUCTION_REFS)[number],
        )
    ) {
        throw new Error(
            [
                "🚨 CRITICAL: Non-production Supabase project used in production",
                `VERCEL_ENV: ${vercelEnv}`,
                `PROJECT_REF: ${urlRef}`,
                "This ref is in NON_PRODUCTION_REFS blocklist.",
                "→ Check Vercel environment variables for this deployment scope.",
            ].join("\n"),
        );
    }

    // Check 2: Anon key has valid Supabase format
    if (!anonKey || !hasValidPrefix(anonKey, VALID_KEY_PREFIXES)) {
        throw new Error("❌ SUPABASE anon key has unexpected format");
    }

    // Check 3: Secret key has valid Supabase format
    if (!secretKey || !hasValidPrefix(secretKey, VALID_SECRET_PREFIXES)) {
        throw new Error("❌ SUPABASE secret key has unexpected format");
    }
}
