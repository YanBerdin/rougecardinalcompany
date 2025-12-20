// ============================================================================
// FILE 1: supabase/client.ts
// ============================================================================
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
  );
}

// ============================================================================
// FILE 2: supabase/server.ts
// ============================================================================
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * User-scoped Supabase client for Server Components and Server Actions.
 * Uses anon key + RLS policies to respect user permissions.
 * 
 * Use this for most DAL operations unless you need admin privileges.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

// ============================================================================
// FILE 3: supabase/admin.ts
// ============================================================================
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Admin Supabase client with service role key.
 * Bypasses RLS policies - use ONLY for privileged operations.
 * 
 * Use cases:
 * - User invitation (writing to auth.users)
 * - Role management (updating profiles.role)
 * - System operations requiring elevated permissions
 * 
 * ⚠️ SECURITY: Always pair with requireAdmin() auth check
 */
export async function createAdminClient() {
  // T3 Env validates at startup, but keep explicit check for better error message
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "[ADMIN_CLIENT] SUPABASE_SERVICE_ROLE_KEY manquante. " +
      "Cette clé est requise pour les opérations admin. " +
      "Ajoutez-la à .env.local (ne jamais committer cette clé !)"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
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

// ============================================================================
// FILE 4: supabase/middleware.ts
// ============================================================================
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Debug: inspect incoming cookies
  const incomingCookies = request.cookies.getAll();
  if (!incomingCookies || incomingCookies.length === 0) {
    const raw = request.headers.get("cookie");
    console.debug(
      "Middleware - no cookies from request.cookies.getAll(), raw cookie header:",
      raw ? raw.slice(0, 200) : null
    );
  } else {
    console.debug(
      "Middleware - incoming cookie names:",
      incomingCookies.map((c) => c.name)
    );
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => {
              try {
                request.cookies.set(name, value);
              } catch (e) {
                console.warn(
                  `Middleware - warning: request.cookies.set failed for ${name}:`,
                  e
                );
              }
            });
          } catch (e) {
            console.warn(
              "Middleware - unexpected error while setting request.cookies:",
              e
            );
          }

          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Diagnostic logging before getClaims()
  try {
    const beforeTs = new Date().toISOString();
    const beforeCookies = request.cookies.getAll().map((c) => ({
      name: c.name,
      valueSample: String(c.value).slice(0, 12),
    }));
    const rawCookieHeader = request.headers.get("cookie");
    console.debug("Middleware - getClaims BEFORE", {
      beforeTs,
      beforeCookies,
      rawCookieHeader,
    });
  } catch (err) {
    console.warn("Middleware - before getClaims logging failed:", err);
  }

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Diagnostic logging after getClaims()
  try {
    const afterTs = new Date().toISOString();
    const afterCookies = request.cookies.getAll().map((c) => ({
      name: c.name,
      valueSample: String(c.value).slice(0, 12),
    }));
    const rawCookieHeaderAfter = request.headers.get("cookie");
    console.debug("Middleware - getClaims AFTER", {
      afterTs,
      afterCookies,
      rawCookieHeaderAfter,
      claims: user,
    });
  } catch (err) {
    console.warn("Middleware - after getClaims logging failed:", err);
  }

  console.debug("USER_metadata:", user?.user_metadata?.role);

  // Protected routes
  if (request.nextUrl.pathname.startsWith("/protected") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Admin routes protection
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isApiAdminPath = request.nextUrl.pathname.startsWith("/api/admin");

  if (isAdminPath || isApiAdminPath) {
    try {
      const isAdminCandidate =
        Boolean(user) &&
        String(user?.user_metadata?.role ?? "").toLowerCase() === "admin";

      if (!isAdminCandidate) {
        if (isApiAdminPath) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
      }
    } catch (err) {
      console.warn("Middleware admin check failed:", err);
      if (isApiAdminPath) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
