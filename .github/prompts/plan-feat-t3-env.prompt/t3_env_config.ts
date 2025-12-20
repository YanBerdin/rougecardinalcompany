// lib/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * ============================================================================
   * SERVER-SIDE ENVIRONMENT VARIABLES
   * ============================================================================
   * Ces variables ne sont JAMAIS exposées au client.
   * Elles sont disponibles uniquement dans :
   * - Server Components
   * - Server Actions
   * - API Routes
   * - DAL functions
   */
  server: {
    // ============================================================================
    // 🗄️ DATABASE (Supabase)
    // ============================================================================
    // Reference: .github/instructions/nextjs-supabase-auth-2025.instructions.md
    // ✅ NEW FORMAT: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY (with JWT Signing Keys)
    // ❌ LEGACY FORMAT: NEXT_PUBLIC_SUPABASE_ANON_KEY (deprecated)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: z.string().min(1),

    // CRITICAL: Service role key - admin operations only
    // Same name in both NEW and LEGACY formats (NOT deprecated)
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // ============================================================================
    // 📧 EMAIL (Resend)
    // ============================================================================
    RESEND_API_KEY: z.string().startsWith("re_").min(1),
    EMAIL_FROM: z.string().email(),
    EMAIL_CONTACT: z.string().email(),

    // ============================================================================
    // 🚨 DEVELOPMENT EMAIL REDIRECT (DEV ONLY)
    // ============================================================================
    // WARNING: Must be 'false' or undefined in production!
    EMAIL_DEV_REDIRECT: z
      .enum(["true", "false"])
      .optional()
      .default("false")
      .transform((val) => val === "true"),

    EMAIL_DEV_REDIRECT_TO: z.string().email().optional(),

    // ============================================================================
    // 🔐 ADMIN SEEDING (Local development)
    // ============================================================================
    DEFAULT_ADMIN_EMAIL: z.string().email().optional(),
    DEFAULT_ADMIN_PASSWORD: z.string().min(8).optional(),

    // ============================================================================
    // 🧪 TESTING & DEVELOPMENT
    // ============================================================================
    TEST_DB_URL: z.string().url().optional(),
    GITHUB_TOKEN: z.string().optional(),
    CONTEXT7_API_KEY: z.string().optional(),

    // ============================================================================
    // 🤖 MCP TOOLS & CI/CD (External tooling - not used by Next.js app)
    // ============================================================================
    // These are used by MCP Supabase tools and CI/CD scripts
    // They are NOT required for the Next.js application to run
    SUPABASE_PROJECT_REF: z.string().optional(),
    SUPABASE_ACCESS_TOKEN: z.string().optional(),

    // ============================================================================
    // ⚙️ NODE ENVIRONMENT
    // ============================================================================
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /*
   * ============================================================================
   * CLIENT-SIDE ENVIRONMENT VARIABLES
   * ============================================================================
   * Ces variables sont exposées au navigateur.
   * Elles DOIVENT commencer par NEXT_PUBLIC_
   * 
   * ⚠️ NE JAMAIS mettre de secrets ici !
   * 
   * Reference: .github/instructions/nextjs-supabase-auth-2025.instructions.md
   * ✅ NEW FORMAT: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY (with JWT Signing Keys)
   * ❌ LEGACY FORMAT: NEXT_PUBLIC_SUPABASE_ANON_KEY (deprecated)
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
  },

  /*
   * ============================================================================
   * RUNTIME ENVIRONMENT MAPPING
   * ============================================================================
   * T3 Env ne peut pas auto-détecter les variables dans Next.js
   * On doit les mapper manuellement
   */
  runtimeEnv: {
    // Server
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_CONTACT: process.env.EMAIL_CONTACT,
    EMAIL_DEV_REDIRECT: process.env.EMAIL_DEV_REDIRECT,
    EMAIL_DEV_REDIRECT_TO: process.env.EMAIL_DEV_REDIRECT_TO,
    DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL,
    DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD,
    TEST_DB_URL: process.env.TEST_DB_URL,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY,
    SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF,
    SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  /*
   * ============================================================================
   * VALIDATION OPTIONS
   * ============================================================================
   */
  // Skip validation during build (CI/CD)
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  // Make env vars available on the client via `window.__env__`
  emptyStringAsUndefined: true,
});
