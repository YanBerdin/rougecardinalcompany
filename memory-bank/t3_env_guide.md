# T3 Env Implementation Guide - Rouge Cardinal Company

## 📋 Overview

T3 Env provides runtime validation and type-safety for environment variables. All environment variables are now accessed through the `env` object from `lib/env.ts`.

## 🎯 Key Benefits

✅ **Runtime Validation**: Zod schemas catch missing or invalid env vars at startup  
✅ **Type Safety**: Full TypeScript autocomplete and type checking  
✅ **Client/Server Separation**: Clear distinction between public and server-only vars  
✅ **Early Error Detection**: Fails fast with clear error messages  
✅ **Developer Experience**: Autocomplete in IDE, no more typos

## 📝 Usage

### ✅ Correct Usage

```typescript
import { env } from "@/lib/env";

// ✅ Use env object for all environment variables
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const apiKey = env.RESEND_API_KEY;

// ✅ TypeScript knows the types
const isDevRedirect: boolean = env.EMAIL_DEV_REDIRECT;
const nodeEnv: "development" | "test" | "production" = env.NODE_ENV;
```

### ❌ Incorrect Usage

```typescript
// ❌ Never access process.env directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// ❌ No type safety, no validation
const apiKey = process.env.RESEND_API_KEY;
```

## 🔐 Variable Categories

### Required Server Variables

These must be set for the app to start:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
EMAIL_CONTACT=contact@yourdomain.com
```

### Required Client Variables

These are exposed to the browser:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Optional Variables

#### Development Email Redirect

```bash
EMAIL_DEV_REDIRECT=false
EMAIL_DEV_REDIRECT_TO=dev@example.com
```

⚠️ **Production Safety**: `EMAIL_DEV_REDIRECT` should always be `false` in production

#### External Tooling (MCP, CI/CD)

```bash
SUPABASE_PROJECT_REF=xxx
SUPABASE_ACCESS_TOKEN=sbp_...
GITHUB_TOKEN=ghp_...
CONTEXT7_API_KEY=ctx_...
```

These are NOT required for Next.js runtime and won't block app startup.

### Auto-Detected

```bash
NODE_ENV=development  # Set by Next.js automatically
```

## 🧪 Testing

Run the validation test script:

```bash
pnpm tsx scripts/test-env-validation.ts
```

This script validates:

1. ✅ Env config loads successfully
2. ✅ All required server variables present
3. ✅ All client variables present
4. ✅ Optional variables checked
5. ✅ Email dev redirect logic validated
6. ✅ NODE_ENV safety checks (no dev redirect in production)

## 🚀 Migration Checklist

When migrating a file to use T3 Env:

- [ ] Add import: `import { env } from "@/lib/env";`
- [ ] Replace all `process.env.XXX` with `env.XXX`
- [ ] Remove manual env validation (e.g., `hasEnvVars` checks)
- [ ] Test the file compiles with `pnpm tsc --noEmit`
- [ ] Test runtime behavior
- [ ] Update documentation if needed

## ⚠️ Common Pitfalls

### 1. Accessing Env in Client Components

❌ **Wrong**:

```typescript
"use client";
import { env } from "@/lib/env";

function MyComponent() {
  // This will throw an error - server vars not accessible client-side
  const apiKey = env.RESEND_API_KEY;
}
```

✅ **Correct**:

```typescript
"use client";
import { env } from "@/lib/env";

function MyComponent() {
  // Only NEXT_PUBLIC_* vars accessible in client components
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
}
```

### 2. Missing Required Variables

If a required variable is missing, the app will fail to start with a clear error:

```bash
❌ Invalid environment variables:
  RESEND_API_KEY: Required
```

Fix: Add the missing variable to `.env.local`

### 3. Type Mismatches

T3 Env enforces types at runtime:

```typescript
// ❌ Wrong type
EMAIL_DEV_REDIRECT=yes  // Must be "true" or "false"

// ✅ Correct
EMAIL_DEV_REDIRECT=true
```

## 🔧 Adding New Environment Variables

1. Add to `lib/env.ts` schema:

```typescript
server: {
  // Existing vars...
  NEW_API_KEY: z.string().min(1),  // Required
  NEW_OPTIONAL_VAR: z.string().optional(),  // Optional
}
```

2. Add to `runtimeEnv` mapping:

```typescript
runtimeEnv: {
  // Existing mappings...
  NEW_API_KEY: process.env.NEW_API_KEY,
  NEW_OPTIONAL_VAR: process.env.NEW_OPTIONAL_VAR,
}
```

3. Add to `.env.example`:

```bash
# NEW FEATURE
NEW_API_KEY=your_key_here
NEW_OPTIONAL_VAR=optional_value
```

4. Update local `.env.local` and test

## � Exception: Scripts CLI (`scripts/*.ts`)

**Les scripts CLI utilisent `process.env` avec `dotenv/config`** — PAS T3 Env.

### Pourquoi ?

1. **T3 Env est conçu pour Next.js** — Il s'intègre avec le runtime Next.js (client/server separation, SSR)
2. **Scripts hors contexte Next.js** — Exécutés via `tsx` directement
3. **Convention du projet** — Cohérence avec les autres scripts existants

### Pattern pour scripts

```typescript
#!/usr/bin/env tsx
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// ... script logic
```

### Résumé par contexte

| Contexte | Méthode | Raison |
| ---------- | -------- | ------ |
| `app/`, `lib/`, `components/` | `import { env } from '@/lib/env'` (T3 Env) | Contexte Next.js runtime |
| `scripts/*.ts` | `import 'dotenv/config'` + `process.env.*` | Hors runtime Next.js (tsx direct) |
| `next.config.ts` | `process.env.*` | S'exécute **avant** le runtime Next.js — importer T3 Env forcerait la validation de toutes les variables serveur même en contexte E2E/CI où certaines sont absentes |
| `instrumentation.ts` | `process.env.*` via `lib/env-validation.ts` | Exception : validation runtime inter-variables (ref match, blocklist, format clés). Utilise `process.env` directement car s'exécute avant T3 Env et valide la cohérence, pas la présence. Module extrait avec DI pour testabilité (22 tests). |
| `supabase/functions/` | `Deno.env.get()` | Runtime Deno |

---

## 📖 References

- T3 Env Documentation: https://env.t3.gg
- Project Implementation: `lib/env.ts`
- Runtime Validation Module: `lib/env-validation.ts` (complète T3 Env avec checks de cohérence)
- Runtime Validation Tests: `__tests__/utils/env-validation.test.ts` (22 tests)
- Test Script: `scripts/test-env-validation.ts`
- Memory Bank: `memory-bank/systemPatterns.md` (T3 Env section)
- Scripts Convention: `scripts/README.md`

## 🎯 Phase Completion Status

- ✅ Phase 1: Setup Complete
- ✅ Phase 2: Core Files Migrated
- ✅ Phase 3: Email System Migrated
- ⏳ Phase 4: DAL Files (In Progress)
- ⏳ Phase 5: Scripts
- ⏳ Phase 6: API Routes
- ⏳ Phase 7: Tests & CI

---

**Last Updated**: 2025-12-20  
**Maintainer**: Claude AI Assistant
