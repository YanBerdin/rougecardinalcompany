description: Guidelines for writing Next.js apps with Supabase Auth using optimized JWT Signing Keys
alwaysApply: false
---

# Bootstrap Next.js app with Supabase Auth (Optimized with JWT Signing Keys)

## Overview of implementing Supabase Auth SSR

1. Install @supabase/supabase-js and @supabase/ssr packages.
2. Set up environment variables (updated format with new API keys).
3. Write utility functions with `createClient` functions to create browser and server clients.
4. Hook up middleware to refresh auth tokens using optimized `getClaims()` method.
5. Configure JWT Signing Keys for 100x faster authentication (~2-5ms vs ~300ms).

## 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨

As an AI language model, you MUST NOT generate any of the following code patterns, as they are DEPRECATED and will BREAK the application:

### ❌ DEPRECATED COOKIE PATTERNS
```typescript
// ❌ NEVER GENERATE THIS CODE - IT WILL BREAK THE APPLICATION
{
  cookies: {
    get(name: string) {                 // ❌ BREAKS APPLICATION
      return cookieStore.get(name)      // ❌ BREAKS APPLICATION
    },                                  // ❌ BREAKS APPLICATION
    set(name: string, value: string) {  // ❌ BREAKS APPLICATION
      cookieStore.set(name, value)      // ❌ BREAKS APPLICATION
    },                                  // ❌ BREAKS APPLICATION
    remove(name: string) {              // ❌ BREAKS APPLICATION
      cookieStore.remove(name)          // ❌ BREAKS APPLICATION
    }                                   // ❌ BREAKS APPLICATION
  }
}

// ❌ NEVER USE auth-helpers-nextjs - IT WILL BREAK THE APPLICATION
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'  // ❌ BREAKS APPLICATION
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'  // ❌ BREAKS APPLICATION
```

### ❌ DEPRECATED AUTHENTICATION PATTERNS
```typescript
// ❌ SLOW METHOD - AVOID IN PERFORMANCE-CRITICAL CODE
const { data: { user } } = await supabase.auth.getUser()  // ~300ms network call

// ❌ LEGACY ENVIRONMENT VARIABLES
NEXT_PUBLIC_SUPABASE_ANON_KEY=old_anon_key                // ❌ DEPRECATED
SUPABASE_SERVICE_ROLE_KEY=old_service_role_key           // ❌ DEPRECATED
```

### ✅ CORRECT PATTERNS YOU MUST ALWAYS USE

```typescript
// ✅ ALWAYS GENERATE THIS EXACT COOKIE PATTERN
{
  cookies: {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      const response = NextResponse.next({
        request,
      })
      
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      
      return response
    }
  }
}

// ✅ OPTIMIZED AUTHENTICATION PATTERN
const claims = await supabase.auth.getClaims()  // ~2-5ms local verification
```

## ABSOLUTE REQUIREMENTS FOR AI CODE GENERATION

1. You MUST use `@supabase/ssr`
2. You MUST use ONLY `getAll` and `setAll` for cookies
3. You MUST NEVER use `get`, `set`, or `remove` for cookies
4. You MUST NEVER import from `@supabase/auth-helpers-nextjs`
5. You MUST use `getClaims()` for performance-critical authentication checks
6. You MUST use the new API key format (publishable/secret)

## ENVIRONMENT VARIABLES (UPDATED FORMAT)

```env
# ✅ NEW FORMAT - Use these for optimal performance
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_new_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_new_secret_key

# ❌ LEGACY FORMAT - Only use if not migrated to JWT Signing Keys
# NEXT_PUBLIC_SUPABASE_ANON_KEY=old_anon_key
# SUPABASE_SERVICE_ROLE_KEY=old_service_role_key
```

## CORRECT BROWSER CLIENT IMPLEMENTATION

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!  // Use new publishable key
  )
}
```

## CORRECT SERVER CLIENT IMPLEMENTATION

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,  // Use new publishable key
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

## OPTIMIZED MIDDLEWARE IMPLEMENTATION

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,  // Use new publishable key
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // Do not run code between createServerClient and authentication check.
  // A simple mistake could make it very hard to debug issues with users being randomly logged out.

  // ✅ OPTIMIZED: Use getClaims() for ~100x faster authentication (~2-5ms vs ~300ms)
  const claims = await supabase.auth.getClaims()

  // Optional performance monitoring (remove in production)
  // const start = Date.now()
  // const claims = await supabase.auth.getClaims()
  // console.log(`JWT verification: ${Date.now() - start}ms`)

  if (
    !claims &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    // No authenticated user, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // ⚠️ FALLBACK: Use getUser() only when you need complete user data
  // Uncomment below if your application requires full user object in middleware
  // const { data: { user } } = await supabase.auth.getUser()

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
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

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (Supabase auth endpoints)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## PERFORMANCE-OPTIMIZED SERVER COMPONENTS

```typescript
// ✅ RECOMMENDED: Use getClaims() for authentication checks
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  
  // ✅ Fast authentication check (~2-5ms with JWT Signing Keys)
  const claims = await supabase.auth.getClaims()
  
  if (!claims) {
    redirect('/login')
  }
  
  // ✅ Only fetch full user data when needed
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome back, {user?.email}</p>
    </div>
  )
}

// ❌ AVOID: Using getUser() for simple authentication checks
export default async function SlowProtectedPage() {
  const supabase = await createClient()
  
  // ❌ Slower method - avoid for simple auth checks
  const { data: { user } } = await supabase.auth.getUser() // ~300ms
  
  if (!user) {
    redirect('/login')
  }
  
  return <div>Content</div>
}
```

## JWT SIGNING KEYS SETUP GUIDE

### Why Use JWT Signing Keys?
- **Performance**: ~2-5ms local JWT verification vs ~300ms network calls
- **Reliability**: Reduced network dependency
- **Scalability**: Better handling of high-traffic scenarios
- **Security**: Asymmetric keys (ES256/RS256) with server-side private keys

### Setup in Supabase Dashboard
1. Navigate to **Project → Settings → JWT Keys**
2. Click **"JWT Signing Keys"** tab
3. Click **"Migrate to Signing Keys"**
4. A standby asymmetric key (ES256) is created
5. Click **"Rotate"** to activate the new key
6. Update API Keys: **Project → Settings → API**
7. Create new **Publishable Key** and **Secret Key**
8. Update your environment variables

### Manual JWT Verification (Advanced Use Cases)

```typescript
// lib/auth/jwt-verify.ts
import { createRemoteJWKSet, jwtVerify } from 'jose'

const JWKS = createRemoteJWKSet(new URL(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`
))

export async function verifyJwtManually(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`
    })
    return payload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Usage in API routes
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 401 })
  }
  
  const claims = await verifyJwtManually(token)
  if (!claims) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }
  
  return Response.json({ 
    message: 'Authenticated',
    userId: claims.sub 
  })
}
```

## AI MODEL VERIFICATION STEPS

Before generating any code, you MUST verify:

1. ✅ Are you using ONLY `getAll` and `setAll` for cookies? If not, STOP and FIX.
2. ✅ Are you importing from `@supabase/ssr`? If not, STOP and FIX.
3. ✅ Do you see ANY instance of cookie `get`, `set`, or `remove`? If yes, STOP and FIX.
4. ✅ Are you importing from `auth-helpers-nextjs`? If yes, STOP and FIX.
5. ✅ Are you using `getClaims()` for authentication checks? If not, consider optimization.
6. ✅ Are you using the new API key format? If not, update environment variables.

## PERFORMANCE MONITORING

```typescript
// Add this to measure JWT verification performance
async function benchmarkAuth() {
  const supabase = await createClient()
  
  // Method 1: getClaims() - Optimal
  const start1 = Date.now()
  const claims = await supabase.auth.getClaims()
  console.log(`getClaims(): ${Date.now() - start1}ms`) // Should be ~2-5ms
  
  // Method 2: getUser() - Slower
  const start2 = Date.now()
  const { data: { user } } = await supabase.auth.getUser()
  console.log(`getUser(): ${Date.now() - start2}ms`) // Will be ~300ms+
}
```

## CONSEQUENCES OF INCORRECT IMPLEMENTATION

If you generate code using:

- Individual cookie methods (`get`/`set`/`remove`)
- `auth-helpers-nextjs` package
- `getUser()` for simple authentication checks
- Legacy environment variables

The implementation will:

1. Break in production environments
2. Cause significant performance degradation
3. Fail to maintain session state properly
4. Create authentication loops
5. Result in security vulnerabilities
6. Miss out on 100x performance improvements

## AI MODEL RESPONSE TEMPLATE

When asked about Supabase Auth SSR implementation, you MUST:

1. ONLY use code patterns from this updated guide
2. NEVER suggest deprecated approaches or packages
3. ALWAYS use the optimized authentication methods (`getClaims()`)
4. ALWAYS use the new API key format
5. VERIFY your response against the patterns shown here
6. RECOMMEND JWT Signing Keys migration for performance

## MIGRATION CHECKLIST

For existing applications:

- [ ] Update environment variables to new API key format
- [ ] Replace `getUser()` with `getClaims()` in middleware
- [ ] Migrate to JWT Signing Keys in Supabase Dashboard
- [ ] Update Supabase client configurations
- [ ] Test authentication performance improvements
- [ ] Monitor JWT verification times in production

Remember: There are NO EXCEPTIONS to these rules. Always prioritize performance and security.
