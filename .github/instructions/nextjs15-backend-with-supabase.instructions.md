---
applyTo: "**"
---

trigger: always_on
description: EXPLAIN how NextJS 15 backend methods work for Rouge Cardinal theater website with optimized Supabase JWT authentication
globs: "app/**/\*.ts", "app/**/_.tsx", "components/\*\*/_.tsx", "lib/\*_/_.ts"

---

## Context

NextJS 15 provides async backend methods for server-side operations. All `headers()` and `cookies()` calls must be awaited in Next.js 15. This guide includes optimized Supabase authentication using JWT Signing Keys for enhanced performance.

## Headers Access

Get request headers in Server Components, API routes, and Server Actions.

```tsx
import { headers } from "next/headers";

// In Server Components (pages/layouts)
export default async function Page() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const authorization = headersList.get("authorization");
  const referer = headersList.get("referer");

  return <div>User Agent: {userAgent}</div>;
}

// In API routes
export async function GET() {
  const headersList = await headers();
  const contentType = headersList.get("content-type");

  return Response.json({ contentType });
}

// Common use cases for Rouge Cardinal:
// - User agent detection for analytics
// - Authorization headers for API protection
// - Referrer tracking for traffic analysis
```

## Cookies Management

Handle cookies for authentication, preferences, and session management.

### Reading Cookies

```tsx
import { cookies } from "next/headers";

// In Server Components
export default async function AdminLayout() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");
  const sessionToken = cookieStore.get("supabase-auth-token");

  return <div data-theme={theme?.value}>{/* Layout content */}</div>;
}

// In middleware.ts for route protection (OPTIMIZED VERSION)
import { NextResponse } from "next/server";
import { createClient } from "@/supabase/middleware";

export async function middleware(request) {
  const supabase = createClient(request);

  // ✅ Use getClaims() for optimal performance (~2-5ms vs ~300ms with getUser())
  const claims = await supabase.auth.getClaims();

  if (!claims && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}
```

### Setting Cookies

Can only be done in API routes or Server Actions:

```tsx
// In API route (app/api/auth/route.ts)
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  // Basic cookie
  cookieStore.set("theme", "dark");

  // Secure cookie for auth with updated JWT token
  cookieStore.set("supabase-auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return Response.json({ success: true });
}

// In Server Action (features/auth/actions.ts)
("use server");
import { cookies } from "next/headers";
```

## Supabase Auth (canonical)

Pour toutes les règles prescriptives et exemples d'implémentation concernant Supabase Auth (JWT Signing Keys, createServerClient, pattern cookies { getAll / setAll }, utilisation de `getClaims()` vs `getUser()`, et la checklist de migration), veuillez consulter le fichier canonique :

`.github/instructions/nextjs-supabase-auth-2025.instructions.md`

Ce fichier contient les exigences strictes destinées aux générateurs de code (AI), les exemples de middleware optimisés et la checklist de migration. Le présent document (`nextjs15-backend-with-supabase.instructions.md`) reste le guide Next.js 15 centré sur les API backend, l'accès aux headers/cookies, les Server Components, les Server Actions et les patterns DAL. Référez-vous au fichier canonique pour toute règle d'authentification et toute mise à jour liée aux clés Supabase.

---

Merci de mettre à jour le fichier canonique si vous changez les règles d'auth (il servira de source de vérité pour les autres guides).

### Performance Rules

- **Always use `getClaims()`** instead of `getUser()` for authentication checks
- Use `getUser()` only when you need complete user profile data
- Prefer Server Components over Client Components for cookie/header access
- Monitor JWT verification times in production

### Security Rules

- Use JWT Signing Keys (ES256/RS256) for production applications
- Rotate signing keys regularly via Supabase Dashboard
- Use new API Key format (publishable/secret) instead of legacy anon keys
- Set appropriate cookie security options (`httpOnly`, `secure`, `sameSite`)

### Supabase Optimization

- Migrate to JWT Signing Keys for 100x faster authentication
- Use JWKS endpoint caching (10 minutes recommended)
- Monitor performance with verification time logging
- Plan key rotation schedule (quarterly recommended)
