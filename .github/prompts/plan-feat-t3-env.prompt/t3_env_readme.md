# T3 Env Implementation Guide

## 📋 Overview

This project uses [@t3-oss/env-nextjs](https://env.t3.gg/) for environment variable validation and type-safety.

## ✨ Benefits

- **Runtime Validation**: Zod schemas validate all env vars at startup
- **Type Safety**: Full TypeScript autocomplete for `env.*`
- **Client/Server Split**: Prevents accidental exposure of secrets
- **Early Error Detection**: Fails fast with clear error messages
- **No Manual Checks**: No more `if (!process.env.X) throw new Error(...)`

## 🏗️ Architecture

```typescript
// lib/env.ts - Single source of truth
export const env = createEnv({
  server: {
    // Server-only variables (NEVER exposed to browser)
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    RESEND_API_KEY: z.string(),
  },
  client: {
    // Client-safe variables (MUST start with NEXT_PUBLIC_)
    NEXT_PUBLIC_SITE_URL: z.string().url(),
  },
  runtimeEnv: {
    // Manual mapping required for Next.js
  },
});
```

## 🔒 Security Rules

### ✅ Server-Only Variables (Safe)

```typescript
// ✅ In Server Components
import { env } from "@/lib/env";
const apiKey = env.RESEND_API_KEY;

// ✅ In Server Actions
"use server";
import { env } from "@/lib/env";
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ In API Routes
import { env } from "@/lib/env";
export async function POST() {
  const key = env.RESEND_API_KEY;
}
```

### ❌ Never in Client Components

```typescript
"use client";
import { env } from "@/lib/env";

// ❌ DANGER: Exposes secrets to browser!
const apiKey = env.RESEND_API_KEY; // TypeScript error
```

### ✅ Client-Safe Variables

```typescript
"use client";
import { env } from "@/lib/env";

// ✅ Safe - NEXT_PUBLIC_ variables
const siteUrl = env.NEXT_PUBLIC_SITE_URL;
```

## 📝 Usage Examples

### Site Configuration

```typescript
// lib/site-config.ts
import { env } from "./env";

export const SITE_CONFIG = {
  EMAIL: {
    FROM: env.EMAIL_FROM,        // ✅ Validated
    CONTACT: env.EMAIL_CONTACT,  // ✅ Validated
  },
  SERVER: {
    DEV_URL: env.NEXT_PUBLIC_SITE_URL, // ✅ Type-safe
  },
};
```

### Email Service

```typescript
// lib/email/actions.ts
"use server";
import { env } from "@/lib/env";

export async function sendInvitation() {
  // ✅ Type-safe boolean (transformed from string)
  if (env.NODE_ENV === "development" && env.EMAIL_DEV_REDIRECT) {
    const recipient = env.EMAIL_DEV_REDIRECT_TO;
    // ...
  }
}
```

### Supabase Client

```typescript
// supabase/server.ts
import { env } from "@/lib/env";

export async function createAdminClient() {
  return createSupabaseServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY, // ✅ Validated at startup
  );
}
```

## 🧪 Testing

```bash
# Test validation
pnpm tsx scripts/test-env-validation.ts

# Test missing variable (should fail)
RESEND_API_KEY= pnpm tsx scripts/test-env-validation.ts
```

## 🚀 Adding New Variables

### 1. Update `lib/env.ts`

```typescript
export const env = createEnv({
  server: {
    // Add server variable
    NEW_API_KEY: z.string().min(1),
  },
  client: {
    // Add client variable (must start with NEXT_PUBLIC_)
    NEXT_PUBLIC_NEW_FEATURE: z.boolean().default(false),
  },
  runtimeEnv: {
    // Add to mapping
    NEW_API_KEY: process.env.NEW_API_KEY,
    NEXT_PUBLIC_NEW_FEATURE: process.env.NEXT_PUBLIC_NEW_FEATURE,
  },
});
```

### 2. Update `.env.example`

```bash
# ============================================================================
# 🆕 NEW FEATURE
# ============================================================================
NEW_API_KEY=your_api_key_here
NEXT_PUBLIC_NEW_FEATURE=false
```

### 3. Use with Type Safety

```typescript
import { env } from "@/lib/env";

const apiKey = env.NEW_API_KEY; // ✅ Autocomplete + validation
```

## ⚠️ Common Pitfalls

### 1. Forgetting `runtimeEnv` Mapping

```typescript
// ❌ Won't work - T3 Env can't auto-detect in Next.js
export const env = createEnv({
  server: { NEW_VAR: z.string() },
  // Missing runtimeEnv!
});

// ✅ Must add mapping
runtimeEnv: {
  NEW_VAR: process.env.NEW_VAR,
}
```

### 2. Client Variables Without `NEXT_PUBLIC_`

```typescript
// ❌ Error: Client var must start with NEXT_PUBLIC_
client: {
  MY_VAR: z.string(),
}

// ✅ Correct
client: {
  NEXT_PUBLIC_MY_VAR: z.string(),
}
```

### 3. Using `process.env` Directly

```typescript
// ❌ Old way - no validation
const url = process.env.NEXT_PUBLIC_SITE_URL;

// ✅ New way - validated & typed
import { env } from "@/lib/env";
const url = env.NEXT_PUBLIC_SITE_URL;
```

## 🛠️ Migration Checklist

- [x] Install `@t3-oss/env-nextjs`
- [x] Create `lib/env.ts`
- [x] Migrate `lib/site-config.ts`
- [x] Migrate `lib/resend.ts`
- [x] Migrate `supabase/server.ts`
- [x] Migrate `lib/email/actions.ts`
- [ ] Migrate all DAL files
- [ ] Migrate all scripts
- [ ] Update `.env.example`
- [ ] Test validation script
- [ ] Update CI/CD if needed

## 📚 Resources

- [T3 Env Docs](https://env.t3.gg/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Zod Documentation](https://zod.dev/)

## Architecture Supabase Clients - Recommandation

 Mise à Jour du Plan avec Décisions

## 🎯 Structure Recommandée (Keep Current Separation)

```bash
supabase/
├── client.ts        # Browser client (Client Components)
├── server.ts        # Server client (Server Components, user-scoped)
├── admin.ts         # Admin client (Service role, privileged ops)
└── middleware.ts    # Middleware client (auth checks)
```

## ✅ Pourquoi Garder la Séparation ?

### 1. **Principe de Responsabilité Unique (SOLID)**

```typescript
// supabase/server.ts - User-scoped operations
// Used in: Server Components, Server Actions (most DAL calls)
export async function createClient() {
  // Uses ANON key + RLS policies
  // Respects user permissions
}

// supabase/admin.ts - Privileged operations
// Used in: Admin DAL, user invitation, role management
export async function createAdminClient() {
  // Uses SERVICE_ROLE key
  // Bypasses RLS policies
  // Should be used sparingly
}
```

### 2. **Sécurité par Séparation**

- **Import explicite** : `import { createAdminClient } from "@/supabase/admin"` est plus visible dans code review
- **Audit trail** : Facile de grep `createAdminClient` pour auditer usages privilégiés
- **Service role containment** : La clé service role reste isolée dans un fichier
- **Erreur claire** : Si `admin.ts` manque la clé, erreur explicite avec message custom

### 3. **Architecture Mentale Claire**

```typescript
// ✅ Clear intent - user-scoped operation
import { createClient } from "@/supabase/server";
const supabase = await createClient();
const { data } = await supabase.from("spectacles").select();

// ✅ Clear intent - admin operation
import { createAdminClient } from "@/supabase/admin";
const supabase = await createAdminClient();
const { data } = await supabase.from("profiles").update(...);
```

### 4. **Erreur Handling Différencié**

```typescript
// supabase/admin.ts - Custom error for missing service key
if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY manquante. Cette clé est requise pour les opérations admin. " +
    "Ajoutez-la à .env.local (ne jamais committer cette clé !)"
  );
}

// supabase/server.ts - T3 Env handles validation
// No need for manual check
```

## 📊 Patterns d'Usage Actuels

### Pattern 1: DAL Standard (User-scoped)

```typescript
// lib/dal/spectacles.ts
"use server";
import { createClient } from "@/supabase/server"; // ✅ Standard client

export async function fetchSpectacles() {
  const supabase = await createClient();
  // RLS policies applied automatically
}
```

### Pattern 2: DAL Admin (Privileged)

```typescript
// lib/dal/admin-users.ts
"use server";
import { createAdminClient } from "@/supabase/admin"; // ✅ Admin client

export async function inviteUserDAL(email: string) {
  const supabase = await createAdminClient();
  // Bypasses RLS, can insert into auth.users
}
```

### Pattern 3: Mixed Operations

```typescript
// lib/dal/team.ts
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";

export async function updateTeamMember(id: bigint, data: any) {
  // ✅ Auth check first
  await requireAdmin();
  
  // ✅ But use regular client (RLS admin policy applies)
  const supabase = await createClient();
  return supabase.from("membres_equipe").update(data).eq("id", id);
}
```

## 🔄 Migration avec T3 Env

### supabase/server.ts (User-scoped)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env"; // ✅ T3 Env

export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,        // ✅ Validated
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY, // ✅ Validated
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  );
}
```

### supabase/admin.ts (Privileged)

```typescript
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env"; // ✅ T3 Env

export async function createAdminClient() {
  // ✅ T3 Env validates at startup, but keep custom error for clarity
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Optional: Additional runtime check with better error message
  if (!serviceRoleKey) {
    throw new Error(
      "[ADMIN_CLIENT] SUPABASE_SERVICE_ROLE_KEY missing. " +
      "This key is required for admin operations. " +
      "Add it to .env.local (NEVER commit this key!)"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  );
}
```

### supabase/client.ts (Browser)

```typescript
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env"; // ✅ T3 Env (client-safe vars)

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
  );
}
```

### supabase/middleware.ts (Auth checks)

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env"; // ✅ T3 Env

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          // ... existing logic
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // ... existing admin checks
}
```

## 🎯 Checklist de Migration

### Phase 1: Core Supabase Files

- [ ] `supabase/client.ts` - Ajouter `import { env } from "@/lib/env"`
- [ ] `supabase/server.ts` - Remplacer `process.env.*` par `env.*`
- [ ] `supabase/admin.ts` - Remplacer `process.env.*` par `env.*`
- [ ] `supabase/middleware.ts` - Remplacer `process.env.*` par `env.*`

### Phase 2: Remove hasEnvVars Check

```typescript
// ❌ Remove this from middleware.ts (T3 Env handles validation)
if (!hasEnvVars) {
  return supabaseResponse;
}

// ✅ T3 Env fails at startup if vars are missing
```

### Phase 3: Update lib/utils.ts

```typescript
// lib/utils.ts
// ❌ Remove hasEnvVars export (no longer needed)
export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
);

// ✅ T3 Env handles this automatically
```

## 📚 Documentation Updates

### README.md Section

## Environment Variables

This project uses [T3 Env](https://env.t3.gg/) for type-safe environment variables.

### Required Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ Admin operations only (never commit!)
- `RESEND_API_KEY` - Email service API key

See `.env.example` for full list and documentation.

### Client Architecture

- **Browser**: `supabase/client.ts` (public operations)
- **Server**: `supabase/server.ts` (user-scoped with RLS)
- **Admin**: `supabase/admin.ts` (privileged, bypasses RLS)
- **Middleware**: `supabase/middleware.ts` (auth checks)

Always use the appropriate client for your use case.

## 🚨 Anti-Pattern à Éviter

```typescript
// ❌ BAD - Merging admin client into server.ts
// supabase/server.ts
export async function createClient(options?: { admin?: boolean }) {
  if (options?.admin) {
    return createServerClient(url, SERVICE_ROLE_KEY); // 🚨 Dangerous!
  }
  return createServerClient(url, ANON_KEY);
}

// Problems:
// 1. Service role key exposed in same file as regular client
// 2. Easy to accidentally use admin client
// 3. Implicit admin escalation via boolean flag
// 4. Harder to audit admin operations
```

## ✅ Best Practice - Keep Separate

```typescript
// ✅ GOOD - Explicit imports show intent

// Regular operation
import { createClient } from "@/supabase/server";

// Admin operation - clearly visible in imports
import { createAdminClient } from "@/supabase/admin";
```

## 📊 Usage Statistics (Current Codebase)

```bash
# Regular client usage (most common)
grep -r "createClient()" lib/dal/*.ts | wc -l
# Expected: ~15-17 files

# Admin client usage (rare, auditable)
grep -r "createAdminClient()" lib/dal/*.ts | wc -l
# Expected: ~2-3 files (admin-users.ts, etc.)
```

## 🎯 Conclusion

**Recommendation: KEEP the separation** between `server.ts` and `admin.ts`

- ✅ Better security (explicit admin operations)
- ✅ Easier auditing (grep for `createAdminClient`)
- ✅ Clearer code intent (imports show privilege level)
- ✅ SOLID principles (Single Responsibility)
- ✅ Prevents accidental admin escalation
- ✅ Custom error messages for admin key

The slight overhead of an extra file is worth the clarity and security benefits.
