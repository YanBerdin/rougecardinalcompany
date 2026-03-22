import { createBrowserClient } from "@supabase/ssr";

// NEXT_PUBLIC_* vars are embedded at build time by Next.js — direct access via process.env
// is correct here. Importing @/lib/env (t3-env) in a file used by 'use client' components
// pulls server-side validation code into the client bundle, crashing the Turbopack worker.
// Same documented exception as next.config.ts (see .github/instructions/t3_env_guide.instructions.md).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );
}
