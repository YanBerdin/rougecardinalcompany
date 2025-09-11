trigger: always_on
description: EXPLAIN how NextJS 15 backend methods work for Rouge Cardinal theater website
globs: "app/**/*.ts", "app/**/*.tsx", "components/**/*.tsx", "lib/**/*.ts"
---

## Context
NextJS 15 provides async backend methods for server-side operations. All `headers()` and `cookies()` calls must be awaited in Next.js 15.

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

// In middleware.ts for route protection
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("supabase-auth-token");
  
  if (!authToken && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
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
  
  // Secure cookie for auth
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

## Rouge Cardinal Specific Use Cases

### Authentication with Supabase
```tsx
// Server Component for protected pages
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return <DashboardContainer user={user} />;
}
```

### Theme Management
```tsx
// Layout with theme detection
import { cookies } from "next/headers";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";
  
  return (
    <html lang="fr" data-theme={theme}>
      <body>
        <ThemeProvider defaultTheme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### User Tracking for Analytics
```tsx
// Server Component for analytics
import { headers } from "next/headers";

export default async function ShowPage({ params }) {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const referer = headersList.get("referer");
  
  // Log page view for analytics
  await logPageView({
    page: `/shows/${params.slug}`,
    userAgent,
    referer,
    timestamp: new Date()
  });
  
  return <ShowDetails />;
}
```

## Important Rules
- Always `await` headers() and cookies() calls in Next.js 15
- Use cookies() for setting only in API routes or Server Actions
- Headers are read-only in Server Components
- Cookies can be read in any Server Component
- Use Server Actions for form submissions that need to set cookies
- Prefer Server Components over Client Components for cookie/header access
