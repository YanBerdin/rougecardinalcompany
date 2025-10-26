import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../lib/utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  //TODO: If the env vars are not set, skip middleware check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  // Debug: inspect incoming cookies to help diagnose intermittent missing claims
  const incomingCookies = request.cookies.getAll();
  if (!incomingCookies || incomingCookies.length === 0) {
    // Fallback: try to parse the raw Cookie header for diagnostic purposes
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
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // When running in middleware, setting request.cookies may throw in some environments.
          // Wrap in try/catch and always propagate cookies to the response object.
          try {
            cookiesToSet.forEach(({ name, value }) => {
              try {
                request.cookies.set(name, value);
              } catch (e) {
                // Non-fatal: log for diagnostics and continue
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

  //! Do not run code between createServerClient and
  //! supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  //! IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.

  // Strict diagnostic logging: capture cookies/headers/timestamp immediately before getClaims()
  try {
    const beforeTs = new Date().toISOString();
    const beforeCookies = request.cookies.getAll().map((c) => ({
      name: c.name,
      // only keep a short sample for diagnostics
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

  // Strict diagnostic logging: capture cookies/headers/timestamp immediately after getClaims()
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

  // keep backwards-compatible, user metadata quick log (debug only)
  console.debug("USER_metadata:", user?.user_metadata?.role); //TODO: remove
  if (request.nextUrl.pathname.startsWith("/protected") && !user) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Protect admin routes: require authenticated user with role 'admin'
  // also protect API admin endpoints under /api/admin
  // Protect UI admin routes (redirect to login) and API admin routes (return 403 JSON)
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isApiAdminPath = request.nextUrl.pathname.startsWith("/api/admin");

  if (isAdminPath || isApiAdminPath) {
    try {
      // user may be undefined; rely on the helper shape from claims
      const isAdminCandidate =
        Boolean(user) &&
        String(user?.user_metadata?.role ?? "").toLowerCase() === "admin";

      if (!isAdminCandidate) {
        if (isApiAdminPath) {
          // For API endpoints, return 403 JSON so clients can handle programmatically
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // For UI admin pages, redirect to login
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

  //! IMPORTANT: You *must* return the supabaseResponse object as it is.
  //? If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
