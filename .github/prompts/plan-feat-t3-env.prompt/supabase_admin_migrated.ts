import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Creates a Supabase client with service-role privileges for admin operations.
 * 
 * ⚠️  CRITICAL: This client bypasses RLS policies. Use with extreme caution.
 * Only use for operations that require elevated privileges (e.g., user management).
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Méthode setAll appelée depuis un Server Component
            // Ignoré si middleware rafraîchit les sessions
          }
        },
      },
    }
  );
}
