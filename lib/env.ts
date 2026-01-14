import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   * ⚠️ Ne pas inclure les variables NEXT_PUBLIC_* ici
   */
  server: {
    // ============================================================================
    // 🗄️ SUPABASE CONFIGURATION (Server-only)
    // ============================================================================
    SUPABASE_SECRET_KEY: z.string().min(1),

    // ============================================================================
    // 📧 EMAIL CONFIGURATION (Resend - Required)
    // ============================================================================
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().email(),
    EMAIL_CONTACT: z.string().email(),

    // ============================================================================
    // 🚨 DEVELOPMENT EMAIL REDIRECT (DEV ONLY)
    // ============================================================================
    EMAIL_DEV_REDIRECT: z
      .enum(["true", "false"])
      .default("false")
      .transform((val) => val === "true"),
    EMAIL_DEV_REDIRECT_TO: z.string().email().optional(),

    // ============================================================================
    // 🧪 TESTING & DEVELOPMENT
    // ============================================================================
    TEST_DB_URL: z.string().url().optional(),

    // ============================================================================
    // 🗄️ DATABASE BACKUP (TASK050 - GitHub Actions)
    // ============================================================================
    // PostgreSQL connection string for pg_dump backups
    // Only required in CI/CD context, not for Next.js runtime
    SUPABASE_DB_URL: z.string().url().optional(),

    // ============================================================================
    // 📊 ERROR MONITORING (Sentry - Optional)
    // ============================================================================
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),

    // ============================================================================
    // 🤖 MCP TOOLS & CI/CD (External tooling only)
    // ============================================================================
    // These variables are used by MCP Supabase tools and CI/CD pipelines.
    // They are NOT required for the Next.js application to run.
    SUPABASE_PROJECT_REF: z.string().optional(),
    SUPABASE_ACCESS_TOKEN: z.string().optional(),
    GITHUB_TOKEN: z.string().optional(),
    CONTEXT7_API_KEY: z.string().optional(),

    // ============================================================================
    // ⚙️ ENVIRONMENT (Auto-detected)
    // ============================================================================
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Client-side environment variables schema
   * ✅ Toutes les variables NEXT_PUBLIC_* doivent être ici
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },

  /**
   * Runtime environment mapping
   * Déstructuration manuelle requise pour Edge Runtime et client
   */
  runtimeEnv: {
    // Server-only variables
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_CONTACT: process.env.EMAIL_CONTACT,
    EMAIL_DEV_REDIRECT: process.env.EMAIL_DEV_REDIRECT,
    EMAIL_DEV_REDIRECT_TO: process.env.EMAIL_DEV_REDIRECT_TO,
    TEST_DB_URL: process.env.TEST_DB_URL,
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF,
    SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY,
    NODE_ENV: process.env.NODE_ENV,

    // Client-side variables (NEXT_PUBLIC_*)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },

  /**
   * Skip validation for Docker builds
   * Set SKIP_ENV_VALIDATION=1 to bypass
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined
   * Forces explicit values for all variables
   */
  emptyStringAsUndefined: true,
});
