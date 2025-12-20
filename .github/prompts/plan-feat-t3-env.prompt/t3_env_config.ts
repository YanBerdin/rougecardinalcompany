import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // ============================================================================
    // 🗄️ SUPABASE CONFIGURATION (Required)
    // ============================================================================
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: z.string().min(1),
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
    // 🧪 TESTING & DEVELOPMENT (Optional)
    // ============================================================================
    TEST_DB_URL: z.string().url().optional(),
    
    // ============================================================================
    // 🤖 MCP TOOLS & CI/CD (Optional - External tooling only)
    // ============================================================================
    // These variables are used by MCP Supabase tools and CI/CD pipelines.
    // They are NOT required for the Next.js application to run.
    SUPABASE_PROJECT_REF: z.string().optional(),
    SUPABASE_ACCESS_TOKEN: z.string().optional(),
    GITHUB_TOKEN: z.string().optional(),
    CONTEXT7_API_KEY: z.string().optional(),

    // ============================================================================
    // ⚙️ ENVIRONMENT (Auto-detected by Next.js)
    // ============================================================================
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Server
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_CONTACT: process.env.EMAIL_CONTACT,
    EMAIL_DEV_REDIRECT: process.env.EMAIL_DEV_REDIRECT,
    EMAIL_DEV_REDIRECT_TO: process.env.EMAIL_DEV_REDIRECT_TO,
    TEST_DB_URL: process.env.TEST_DB_URL,
    SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF,
    SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    
    // Client
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
