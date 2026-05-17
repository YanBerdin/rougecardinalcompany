import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Crée un client Supabase avec privilèges service_role.
 *
 * IMPORTANT : ce client ne lit PAS les cookies de session de l'utilisateur.
 * Il s'authentifie auprès de PostgREST avec la SUPABASE_SECRET_KEY, ce qui
 * permet à PostgREST de résoudre le rôle comme `service_role` plutôt que
 * `authenticated`.
 *
 * Pourquoi ne pas utiliser @supabase/ssr ici ?
 *   createServerClient (SSR) injecte le JWT utilisateur depuis les cookies,
 *   ce qui fait que PostgREST traite la requête comme `authenticated` et non
 *   `service_role`. Conséquence : les appels .rpc() et toute opération RLS
 *   restreinte échouent (ex: ERR_AUDIT_001).
 *
 * Cette fonction reste `async` pour préserver la signature des appelants.
 */
export async function createAdminClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
