trigger: always_on
description: EXPLAIN how NextJS 15 backend methods work for Rouge Cardinal theater website with optimized Supabase JWT authentication
globs: "app/**/*.ts", "app/**/*.tsx", "components/**/*.tsx", "lib/**/*.ts"
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
  
  return (
    <div data-theme={theme?.value}>
      {/* Layout content */}
    </div>
  );
}

// In middleware.ts for route protection (OPTIMIZED VERSION)
import { NextResponse } from "next/server";
import { createClient } from "@/supabase/middleware";

export async function middleware(request) {
  const supabase = createClient(request);
  
  // ✅ Use getClaims() for optimal performance (~2-5ms vs ~300ms with getUser())
  const claims = await supabase.auth.getClaims();
  
  if (!claims && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
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
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  
  return Response.json({ success: true });
}

// In Server Action (features/auth/actions.ts)
"use server";
import { cookies } from "next/headers";

export async function setUserPreferences(theme: string, language: string) {
  const cookieStore = await cookies();
  
  cookieStore.set({
    name: "user-preferences",
    value: JSON.stringify({ theme, language }),
    httpOnly: false, // Allow client-side access
    path: "/",
    maxAge: 60 * 60 * 24 * 365 // 1 year
  });
}

// Delete cookie
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("supabase-auth-token");
  cookieStore.delete("user-preferences");
}
```

## Optimized Supabase Authentication with JWT Signing Keys

### Environment Variables (Updated)
```env
# New API Keys format (recommended)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_new_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_new_secret_key

# Legacy format (deprecated - only if not migrated)
# NEXT_PUBLIC_SUPABASE_ANON_KEY=old_anon_key
```

### Supabase Client Configuration
```tsx
// supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

// supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export function createClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, supabaseResponse }
}
```

## Rouge Cardinal Specific Use Cases

### High-Performance Authentication with getClaims()
```tsx
// ✅ OPTIMIZED: Server Component for protected pages
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // ✅ Use getClaims() for optimal performance (~2-5ms with JWT Signing Keys)
  const claims = await supabase.auth.getClaims();
  
  if (!claims) {
    redirect('/auth/login');
  }
  
  // Optional: Get full user data only when needed
  const { data: { user } } = await supabase.auth.getUser();
  
  return <DashboardContainer user={user} />;
}

// ❌ DEPRECATED: Slower method (avoid if possible)
// const { data: { user } } = await supabase.auth.getUser(); // ~300ms network call
```

### Performance Monitoring
```tsx
// Add performance logging to measure JWT verification speed
export default async function ProtectedPage() {
  const supabase = await createClient();
  
  const start = Date.now();
  const claims = await supabase.auth.getClaims();
  const verificationTime = Date.now() - start;
  
  // Log performance (should be ~2-5ms with JWT Signing Keys)
  console.log(`JWT verification: ${verificationTime}ms`);
  
  if (!claims) {
    redirect('/auth/login');
  }
  
  return <PageContent />;
}
```

### Manual JWT Verification (Advanced)
```tsx
// lib/auth/jwt-verify.ts - Manual verification using JWKS endpoint
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`
));

export async function verifyJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`
    });
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Usage in API route
export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.replace('Bearer ', '');
  
  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 401 });
  }
  
  const claims = await verifyJwt(token);
  if (!claims) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  return Response.json({ user: claims.sub });
}
```

### Theme Management with Performance
```tsx
// Layout with optimized theme detection
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";
  
  // Quick authentication check using claims
  const supabase = await createClient();
  const claims = await supabase.auth.getClaims();
  const isAuthenticated = !!claims;
  
  return (
    <html lang="fr" data-theme={theme}>
      <body>
        <ThemeProvider defaultTheme={theme}>
          <AuthContext.Provider value={{ isAuthenticated }}>
            {children}
          </AuthContext.Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### User Tracking for Analytics
```tsx
// Server Component for analytics with auth context
import { headers } from "next/headers";
import { createClient } from "@/supabase/server";

export default async function ShowPage({ params }) {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const referer = headersList.get("referer");
  
  // Quick user identification
  const supabase = await createClient();
  const claims = await supabase.auth.getClaims();
  
  // Log page view for analytics
  await logPageView({
    page: `/shows/${params.slug}`,
    userAgent,
    referer,
    userId: claims?.sub || 'anonymous',
    timestamp: new Date()
  });
  
  return <ShowDetails />;
}
```

## JWT Signing Keys Migration Guide

### Why Migrate to JWT Signing Keys?
- **Performance**: ~2-5ms local verification vs ~300ms network calls
- **Security**: Private signing keys stay server-side
- **Reliability**: Reduced network dependency
- **Scalability**: Better handling of high-traffic scenarios

### Migration Steps in Supabase Dashboard
1. **Project → Settings → JWT Keys → JWT Signing Keys**
2. Click **"Migrate to Signing Keys"**
3. A standby key (ES256/RS256) is created alongside legacy HS256
4. Click **"Rotate"** to make the asymmetric key current
5. Update API keys: **Project → Settings → API → Create new Publishable Key**
6. Update environment variables with new keys
7. Optional: Revoke legacy keys after JWT expiration

### Performance Comparison
```tsx
// Benchmark different auth methods
async function benchmarkAuth() {
  const supabase = await createClient();
  
  // Method 1: getClaims() - Optimal with JWT Signing Keys
  const start1 = Date.now();
  const claims = await supabase.auth.getClaims();
  console.log(`getClaims(): ${Date.now() - start1}ms`); // ~2-5ms
  
  // Method 2: getUser() - Slower network call
  const start2 = Date.now();
  const { data: { user } } = await supabase.auth.getUser();
  console.log(`getUser(): ${Date.now() - start2}ms`); // ~300ms+
}
```

## Important Rules & Best Practices

### Core Rules
- Always `await` headers() and cookies() calls in Next.js 15
- Use cookies() for setting only in API routes or Server Actions
- Headers are read-only in Server Components
- Cookies can be read in any Server Component
- Use Server Actions for form submissions that need to set cookies

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
