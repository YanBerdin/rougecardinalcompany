// import type { Database } from "@/lib/database.types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

// Must stay well below the Vercel function maxDuration (10s) so pages can render fallbacks.
const REST_REQUEST_TIMEOUT_MS = 5000;
const REST_PATH_SEGMENT = "/rest/v1/";

function isRestRequest(input: RequestInfo | URL): boolean {
  const url = input instanceof Request ? input.url : input.toString();
  return url.includes(REST_PATH_SEGMENT);
}

// Storage uploads and auth calls are excluded: only PostgREST reads/writes get a deadline.
const fetchWithRestTimeout: typeof fetch = (input, init) => {
  if (!isRestRequest(input)) {
    return fetch(input, init);
  }
  const timeoutSignal = AbortSignal.timeout(REST_REQUEST_TIMEOUT_MS);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;
  return fetch(input, { ...init, signal });
};

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();
  //return createServerClient<Database>(
  return createServerClient(

    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    {
      global: { fetch: fetchWithRestTimeout },
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
