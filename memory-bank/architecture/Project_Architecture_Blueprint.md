# Project Architecture Blueprint — Rouge Cardinal Company

Generated: 27 November 2025
Source: `doc/prompts-github/architecture-blueprint-generator.prompt.md`
Repository branch: `feature/backoffice`

Résumé: ce document analyse la base de code existante et formalise le modèle d'architecture, les patterns observés et les recommandations pour l'évolution et l'extensibilité. Il s'appuie sur l'organisation actuelle (Next.js 15, TypeScript strict, Supabase, React 19) et couvre les composantes clés, la sécurité RLS, les modèles d'accès aux données, les tests et le déploiement.

## 1. Détection et analyse du projet

- Principaux frameworks et technologies détectés:
  - Next.js 15.4.5 (app/ router, Server Components, Server Actions)
  - React 19
  - TypeScript 5.x (mode strict)
  - Supabase (Postgres) avec RLS, schémas déclaratifs (37 fichiers) et migrations
  - React Email + Tailwind pour templates d'email
  - React Hook Form 7.x + Zod 4.x pour validation
  - @dnd-kit pour drag & drop (réordonnancement Hero Slides)
  - Radix UI pour composants accessibles
  - pnpm / tsx pour scripts de développement/test
  - GitHub Actions pour CI légère (workflows ajoutés)

- Organisation observable:
  - Structure feature-based: `components/features/*`, `lib/dal/*`, `lib/actions/*`, `lib/schemas/*`
  - Route groups: `app/(admin)` et `app/(marketing)` pour séparation des layouts
  - **Server Actions** centralisées dans `lib/actions/*` pour les mutations avec revalidation
  - **DAL** (Data Access Layer) dans `lib/dal/*` marqué `server-only` (sans revalidation)
  - **Schemas Zod** duaux dans `lib/schemas/*` (Server vs UI pour sérialisation JSON)
  - Emails centralisés sous `emails/` avec utilitaires dans `emails/utils`
  - Migrations et schémas Supabase sous `supabase/schemas` et `supabase/migrations`

## 2. Vue d'ensemble de l'architecture

Approche principale: application monolithique modulée (feature-based) servant des Server Components par défaut et utilisant une architecture en 4 couches : Présentation → Server Actions → DAL → Database.

Principes directeurs:

- **Server Components par défaut**; Client Components uniquement pour l'interactivité
- **Server Actions** (`lib/actions/*`) pour toutes les mutations avec `revalidatePath()`
- **DAL** (`lib/dal/*`) pour l'accès DB uniquement (pas de revalidation)
- **Dual Zod schemas**: Server schemas (bigint) vs UI schemas (number pour JSON)
- Validation runtime à chaque frontière (Zod) + typage TypeScript strict
- RLS (Row-Level Security) activé et considéré premier mécanisme de sécurité côté DB
- **Clean Code**: max 300 lignes par fichier, split des formulaires en sous-composants

Boundaries:

- Frontend public (`app/(marketing)`) vs backoffice (`app/(admin)`)
- Boundary serveur/DB: `lib/dal` exécute `createServerClient()`/`createAdminClient()` et utilise `import "server-only"`
- Boundary mutations: `lib/actions` gère la revalidation après appel DAL

## 3. Visualisation architecturale (textuelle)

### High-level Architecture

```bash
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS APP                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Middleware (supabase/middleware.ts)                                    ││
│  │  - JWT claims validation via getClaims() (~2-5ms)                       ││
│  │  - Admin route protection (/admin/*, /api/admin/*)                      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  (marketing)    │  │   (admin)       │  │   api/          │              │
│  │  Public pages   │  │   Backoffice    │  │   API Routes    │              │
│  │  - spectacles   │  │   - home/hero   │  │   - admin/*     │              │
│  │  - compagnie    │  │   - users       │  │   - public/*    │              │
│  │  - contact      │  │   - team        │  │   - newsletter  │              │
│  │  - agenda       │  │   - spectacles  │  │   - contact     │              │
│  │  - presse       │  │                 │  │                 │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                    │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  LAYER: Server Actions (lib/actions/)                                   ││
│  │  - Zod validation (UI schema → Server schema)                           ││
│  │  - Calls DAL functions                                                  ││
│  │  - revalidatePath() on success                                          ││
│  │  - Returns ActionResult<T>                                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  LAYER: Data Access Layer (lib/dal/)                                    ││
│  │  - import "server-only"                                                 ││
│  │  - requireAdmin() auth check                                            ││
│  │  - Database operations only                                             ││
│  │  - Returns DALResult<T> or throws                                       ││
│  │  - NO revalidatePath() here                                             ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  LAYER: Supabase Client (supabase/server.ts)                            ││
│  │  - createClient() for user-scoped operations                            ││
│  │  - createAdminClient() for service-role operations                      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (Postgres)                                 │
│  - RLS policies (37 schema files)                                           │
│  - Database functions (is_admin(), reorder_hero_slides(), etc.)             │
│  - Storage buckets (media)                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture (Admin Home Feature)

```bash
app/(admin)/admin/home/hero/page.tsx
  ├── export const dynamic = 'force-dynamic'
  ├── export const revalidate = 0
  └── <HeroSlidesContainer />

components/features/admin/home/
  ├── HeroSlidesContainer.tsx (Server Component)
  │     └── fetchAllHeroSlides() → <HeroSlidesView slides={data} />
  │
  ├── HeroSlidesView.tsx (Client Component)
  │     ├── useState(initialSlides)
  │     ├── useEffect(() => setSlides(props), [props])  ← CRITICAL for re-render
  │     ├── DnD reordering with @dnd-kit
  │     └── <HeroSlideForm />
  │
  ├── HeroSlideForm.tsx (~200 lines)
  │     ├── useForm<HeroSlideFormValues>()
  │     ├── zodResolver(HeroSlideFormSchema)  ← UI schema (number IDs)
  │     ├── <HeroSlideFormFields form={form} />
  │     └── <HeroSlideImageSection form={form} />
  │
  ├── HeroSlideFormFields.tsx (143 lines) — Extracted text fields
  │
  └── HeroSlideImageSection.tsx (85 lines) — Extracted image picker
```

### Data Flow (Mutation)

```bash
User clicks "Save" in HeroSlideForm
         │
         ▼
form.handleSubmit(onSubmit)
         │
         ▼
createHeroSlideAction(data)      ← lib/actions/home-hero-actions.ts
  ├── HeroSlideInputSchema.parse(data)  ← Server schema validation
  ├── createHeroSlide(validated)        ← DAL call
  │         │
  │         ▼
  │   lib/dal/admin-home-hero.ts
  │     ├── requireAdmin()
  │     ├── HeroSlideInputSchema.parse()  ← Defense in depth
  │     ├── generateUniqueSlug()
  │     └── supabase.from().insert()
  │         │
  │         ▼
  │   Returns DALResult<HeroSlideDTO>
  │
  ├── revalidatePath('/admin/home/hero')
  ├── revalidatePath('/')
  └── return ActionResult
         │
         ▼
onSuccess() → router.refresh()
         │
         ▼
Server Component re-fetches → new props → useEffect syncs state
```

## 4. Composants architecturaux détaillés

### 4.1 Server Actions (`lib/actions/`)

**Fichiers actuels:**

- `home-hero-actions.ts` — CRUD Hero Slides (create, update, delete, reorder)
- `home-about-actions.ts` — Update About content

**Pattern obligatoire:**

```typescript
"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { SomeInputSchema } from "@/lib/schemas/feature";
import { createSomething } from "@/lib/dal/feature";

export type ActionResult<T> = { success: true; data?: T } | { success: false; error: string };

export async function createSomethingAction(input: unknown): Promise<ActionResult> {
  try {
    const validated = SomeInputSchema.parse(input);  // Zod validation
    const result = await createSomething(validated);  // DAL call
    
    if (!result.success) return { success: false, error: result.error ?? "failed" };
    
    revalidatePath("/admin/feature");  // Cache invalidation
    revalidatePath("/");               // Public page if affected
    
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
```

### 4.2 DAL (`lib/dal/`)

**Fichiers actuels (17 modules):**

- `admin-home-hero.ts` — Hero Slides CRUD (fetch, create, update, delete, reorder)
- `admin-home-about.ts` — About section CRUD
- `admin-users.ts` — User invitation and management
- `team.ts`, `spectacles.ts`, `agenda.ts`, `presse.ts`, `compagnie.ts`, etc.

**Pattern obligatoire:**

```typescript
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";

export interface DALResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createSomething(input: ValidatedInput): Promise<DALResult<SomeDTO>> {
  try {
    await requireAdmin();  // Auth check
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("table")
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error("[DAL] Failed:", error);
      return { success: false, error: `[ERR_XXX] ${error.message}` };
    }

    // NO revalidatePath() here — handled by Server Actions
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown" };
  }
}
```

### 4.3 Schemas (`lib/schemas/`)

**Fichiers actuels:**

- `home-content.ts` — Hero Slides + About schemas (Server + UI)
- `team.ts` — Team member schemas
- `spectacles.ts` — Shows schemas

**Pattern dual schemas:**

```typescript
// =============================================================================
// SERVER SCHEMAS (with bigint for database operations)
// =============================================================================
export const HeroSlideInputSchema = z.object({
  title: z.string().min(1).max(80),
  image_media_id: z.coerce.bigint().optional(),  // ← bigint for DB
  // ...
});
export type HeroSlideInput = z.infer<typeof HeroSlideInputSchema>;

// DTO type for API responses
export interface HeroSlideDTO {
  id: bigint;
  // ...
}

// =============================================================================
// UI FORM SCHEMAS (with number for JSON serialization)
// =============================================================================
export const HeroSlideFormSchema = z.object({
  title: z.string().min(1).max(80),
  image_media_id: z.number().int().positive().optional(),  // ← number for JSON
  // ...
});
export type HeroSlideFormValues = z.infer<typeof HeroSlideFormSchema>;
```

### 4.4 Emails (`emails/`)

- Templates: React Email components; wrapper unique `<Tailwind>` pour compatibilité
- Envoi: `lib/email/actions.ts` contient gate `EMAIL_DEV_REDIRECT` pour redirection en environnement dev/test

### 4.5 Admin UI Components

**Structure par feature** (`components/features/admin/`):

- `home/` — 9 fichiers: Hero Slides + About management
- `users/` — User invitation and management
- `team/` — Team member CRUD
- `media/` — Media library picker
- `spectacles/` — Shows management

**Component hierarchy pattern:**

```
FeatureContainer.tsx   (Server Component)
  └── FeatureView.tsx  (Client Component with state)
        ├── FeatureForm.tsx (~200 lines max)
        │     ├── FeatureFormFields.tsx  (extracted if > 300 lines)
        │     └── FeatureImageSection.tsx
        └── FeatureList.tsx
```

## 5. Couches et dépendances

```bash
┌───────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                           │
│  app/, components/                                            │
│  - Server Components (fetching, rendering)                    │
│  - Client Components (interactivity, forms)                   │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER                                            │
│  lib/actions/                                                 │
│  - Server Actions (mutations)                                 │
│  - Zod validation (UI → Server schema)                        │
│  - Cache invalidation (revalidatePath)                        │
│  - ActionResult<T> response pattern                           │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  DATA ACCESS LAYER                                            │
│  lib/dal/                                                     │
│  - server-only modules                                        │
│  - Auth guards (requireAdmin)                                 │
│  - Database operations (Supabase client)                      │
│  - DALResult<T> response pattern                              │
│  - NO revalidation                                            │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE LAYER                                         │
│  supabase/schemas/, supabase/migrations/                      │
│  - Postgres tables with RLS                                   │
│  - Database functions                                         │
│  - Storage buckets                                            │
└───────────────────────────────────────────────────────────────┘
```

**Règles de dépendance:**

- Couche supérieure dépend de couche inférieure uniquement
- DAL ne dépend pas des composants UI
- Server Actions ne contiennent pas de logique DB directe
- **revalidatePath() UNIQUEMENT dans Server Actions, JAMAIS dans DAL**

## 6. Architecture des données

- Modèle de données principal: tables Postgres avec RLS; 37 fichiers de schémas déclaratifs
- Tables principales: `profiles`, `membres_equipe`, `spectacles`, `home_hero_slides`, `home_about`, `medias`
- Accès: DAL retourne DTOs minimalistes; éviter d'exposer colonnes sensibles
- Transactions & upserts: pattern `upsert(..., { onConflict: 'user_id' })` pour gérer trigger `on_auth_user_created`
- Indexation: recommander index sur colonnes utilisées dans policies (e.g., `user_id` dans `profiles`)
- Fonctions DB: `is_admin()`, `reorder_hero_slides()` pour opérations complexes

## 7. Cross-cutting concerns

7.1 Auth & Authorization

- Supabase JWT Signing Keys + `getClaims()` pour checks rapides (~2-5ms). `getUser()` réservé aux cas nécessitant full user data (~300ms).
- RLS: policies fines, une policy par opération (select/insert/update/delete) et spécification `to authenticated, anon` selon besoin.

7.2 Validation

- Zod utilisé à la frontière des Server Actions et dans DAL (defense-in-depth).

7.3 Logging & Monitoring

- Logs applicatifs côté serveur (erreurs + codes) et instrumentation recommandée (Sentry/Datadog) pour erreurs critiques et latences DB.

7.4 Error handling

- Pattern: throw early, ActionResponse shape for server actions, traduction d'erreurs pour UI.

## 8. Communication et APIs

- Interne: Server Actions pour mutations initiées par l'app; API Routes pour webhooks et clients externes.
- Versioning: API Routes versionnées (ex: `/api/v1/...`) si ouverture publique.

## 9. Patterns spécifiques (React / Next.js)

### Server Components

- Par défaut pour data fetching et rendu initial
- Ne pas utiliser `next/dynamic` avec `{ ssr: false }` dans Server Components
- Utiliser Suspense pour le streaming

### Client Components

- Marqués avec `'use client'`
- Pour interactivité, state, event handlers
- **CRITIQUE**: Synchroniser état local avec props via `useEffect`

```typescript
"use client";
export function FeatureView({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  
  // ✅ CRITICAL: Sync state when props change (after router.refresh())
  useEffect(() => {
    setData(initialData);
  }, [initialData]);
  
  // ...
}
```

### Server Actions

- Directive `'use server'` (lowercase) + `import "server-only"`
- Validation + auth + DAL + revalidatePath
- Retour ActionResult<T> standardisé

### Forms

- React Hook Form + zodResolver
- **Utiliser UI schema** (number) dans le form, Server Action convertit en bigint
- **Max 300 lignes** par fichier form — splitter si nécessaire

### Page Admin Pattern

```typescript
// app/(admin)/admin/feature/page.tsx
export const dynamic = 'force-dynamic';  // ✅ Force re-fetch
export const revalidate = 0;             // ✅ Disable cache

export default function FeaturePage() {
  return <FeatureContainer />;
}
```

## 10. Patterns d'implémentation

### Clean Code Rules (Enforced)

- Max 30 lignes par fonction
- Max 5 paramètres par fonction
- Max 300 lignes par fichier
- Max 10 sous-fichiers par dossier
- Une responsabilité par fichier

### Component Naming

- `*Container.tsx` — Server Components (async, data fetching)
- `*View.tsx` — Client Components with state management
- `*Form.tsx` — Form dialogs (max 300 lines)
- `*FormFields.tsx` — Extracted text input fields
- `*ImageSection.tsx` — Extracted image picker sections

### DAL Naming

- `admin-*.ts` — Admin-only operations
- `<feature>.ts` — Public feature data access
- Functions: `fetch*`, `create*`, `update*`, `delete*`, `reorder*`

### Server Actions Naming

- `<feature>-actions.ts`
- Functions: `create*Action`, `update*Action`, `delete*Action`

## 11. Tests

- Stratégie actuelle: tests isolés pour rendu d'email (`__tests__/emails/invitation-email.test.tsx`) exécutés via `tsx` in script.
- Recommandation: intégrer Vitest/Jest et exécuter `pnpm tsc --noEmit`, lint, et tests dans CI matrix; ajouter tests d'intégration pour DAL via un environnement Postgres (Supabase local) ou mocks.

## 12. Déploiement

- Environnements: dev/local (supabase local), staging, production (Supabase Cloud).
- Migrations: workflow declarative schema -> stop supabase local -> `supabase db diff -f name` -> push migrations. Ne pas modifier migrations manuellement sauf hotfix.

## 13. Extensibilité

### Pour ajouter une nouvelle feature CRUD

1. **Créer schemas** `lib/schemas/<feature>.ts`:
   - Server schema avec `z.coerce.bigint()` pour IDs
   - UI schema avec `z.number()` pour form IDs
   - DTO types pour réponses API

2. **Créer DAL** `lib/dal/<feature>.ts`:
   - Marquer avec `import "server-only"`
   - Ajouter auth check avec `requireAdmin()`
   - Implémenter CRUD fonctions retournant `DALResult<T>`
   - **PAS de revalidatePath() ici**

3. **Créer Server Actions** `lib/actions/<feature>-actions.ts`:
   - Marquer avec `"use server"` et `import "server-only"`
   - Valider input avec Zod
   - Appeler fonctions DAL
   - Appeler `revalidatePath()` sur succès
   - Retourner `ActionResult<T>`

4. **Créer composants** `components/features/admin/<feature>/`:
   - `<Feature>Container.tsx` — Server Component, fetch data from DAL
   - `<Feature>View.tsx` — Client Component avec `useState` + `useEffect` sync
   - `<Feature>Form.tsx` — Client form dialog (max 300 lines)
   - Split form si > 300 lignes: `*FormFields.tsx`, `*ImageSection.tsx`

5. **Créer route** `app/(admin)/admin/<feature>/page.tsx`:
   - Ajouter `export const dynamic = 'force-dynamic'`
   - Ajouter `export const revalidate = 0`
   - Render Container component

6. **Ajouter tests** sous `__tests__/` et inclure dans CI

## 14. Exemples de code (patterns)

### Server Action pattern (complet)

```typescript
// lib/actions/feature-actions.ts
"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { FeatureInputSchema } from "@/lib/schemas/feature";
import { createFeature } from "@/lib/dal/feature";

export type ActionResult<T = unknown> = 
  | { success: true; data?: T } 
  | { success: false; error: string };

export async function createFeatureAction(input: unknown): Promise<ActionResult> {
  try {
    // 1. Zod validation (coerces number → bigint for IDs)
    const validated = FeatureInputSchema.parse(input);
    
    // 2. DAL call
    const result = await createFeature(validated);
    if (!result.success) {
      return { success: false, error: result.error ?? "create failed" };
    }
    
    // 3. Cache invalidation (ONLY here, not in DAL)
    revalidatePath("/admin/feature");
    revalidatePath("/");
    
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
```

### Client View pattern (avec useEffect sync)

```typescript
// components/features/admin/feature/FeatureView.tsx
"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteFeatureAction } from "@/lib/actions/feature-actions";
import type { FeatureDTO } from "@/lib/schemas/feature";

interface ViewProps {
  initialItems: FeatureDTO[];
}

export function FeatureView({ initialItems }: ViewProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  // ✅ CRITICAL: Sync local state when props change (after router.refresh())
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleDelete = useCallback(async (id: bigint) => {
    if (!confirm("Supprimer?")) return;

    const result = await deleteFeatureAction(String(id));
    
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    
    toast.success("Supprimé");
    router.refresh();  // Triggers Server Component re-fetch
  }, [router]);

  return (/* UI */);
}
```

### Form with UI Schema pattern

```typescript
// components/features/admin/feature/FeatureForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// ✅ Use UI schema (number IDs), NOT server schema (bigint)
import { FeatureFormSchema, type FeatureFormValues } from "@/lib/schemas/feature";
import { createFeatureAction } from "@/lib/actions/feature-actions";

export function FeatureForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<FeatureFormValues>({
    resolver: zodResolver(FeatureFormSchema),  // ✅ No type casting needed
  });

  const onSubmit = async (data: FeatureFormValues) => {
    // Server Action validates with server schema (coerces number → bigint)
    const result = await createFeatureAction(data);
    
    if (result.success) {
      toast.success("Créé");
      onSuccess();  // Parent calls router.refresh()
    } else {
      toast.error(result.error);
    }
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* fields */}</form>;
}
```

## 15. Records de décisions architecturales (ADR) — aperçu

- Choix d'utiliser Next.js 15 App Router et Server Components pour prioriser SSR et sécurité
- Migration vers JWT Signing Keys pour Supabase (`getClaims()` central) pour latence d'auth ~2-5ms
- **Novembre 2025**: Séparation Server Actions / DAL pour résoudre les problèmes de re-render
  - `revalidatePath()` uniquement dans Server Actions (pas dans DAL)
  - Pattern `useEffect` sync dans Client Components pour synchroniser état après `router.refresh()`
- **Novembre 2025**: Dual Zod schemas (Server vs UI) pour éviter les erreurs de sérialisation bigint/JSON
- **Novembre 2025**: Split des formulaires > 300 lignes en sous-composants (`*FormFields.tsx`, `*ImageSection.tsx`)

## 16. Governance & qualité

- Recommandations automatiques:
  - CI: ajouter `pnpm tsc --noEmit`, `pnpm lint` et `pnpm test` au workflow principal.
  - PR template: checklist RLS/DB/migrations, tests, types.

## 17. Guide pratique pour nouveaux développements

### Workflow recommandé (CRUD feature)

1. **Créer schemas** (`lib/schemas/<feature>.ts`)
   - Server schema (bigint IDs)
   - UI schema (number IDs)
   - DTO types

2. **Créer DAL** (`lib/dal/<feature>.ts`)
   - `import "server-only"`
   - `requireAdmin()` auth check
   - CRUD functions → `DALResult<T>`
   - **NO revalidatePath()**

3. **Créer Server Actions** (`lib/actions/<feature>-actions.ts`)
   - `"use server"` + `import "server-only"`
   - Zod validation → DAL call → `revalidatePath()` → `ActionResult<T>`

4. **Créer composants** (`components/features/admin/<feature>/`)
   - `Container.tsx` (Server) — fetch from DAL
   - `View.tsx` (Client) — `useState` + `useEffect` sync + `router.refresh()`
   - `Form.tsx` (Client) — React Hook Form + UI schema + max 300 lines

5. **Créer route** (`app/(admin)/admin/<feature>/page.tsx`)
   - `dynamic = 'force-dynamic'`
   - `revalidate = 0`

6. **Tests** — `__tests__/` ou co-located

### Common Pitfalls à éviter

| ❌ Anti-pattern | ✅ Solution |
|-----------------|-------------|
| `revalidatePath()` dans DAL | Déplacer dans Server Action |
| `useState(props)` sans `useEffect` | Ajouter `useEffect(() => setState(props), [props])` |
| UI schema avec `bigint` | Utiliser `z.number()` pour form IDs |
| Type casting `as unknown as Resolver<>` | Utiliser UI schema correspondant au form type |
| Form > 300 lignes | Split en `*FormFields.tsx`, `*ImageSection.tsx` |
| API Route pour mutation interne | Utiliser Server Action |

## Annexes & références

- Fichiers clefs:
  - `lib/actions/*` — Server Actions
  - `lib/dal/*` — DAL
  - `lib/schemas/*` — Zod schemas (Server + UI)
  - `components/features/admin/*` — Admin UI components
  - `emails/*` — Email templates
  - `supabase/schemas/*` — Declarative schema (37 files)
  - `supabase/migrations/*` — Generated migrations
  - `.github/instructions/crud-server-actions-pattern.instructions.md` — CRUD pattern v1.1
  - `.github/workflows/*` — CI

---

Maintenir ce document à jour: exécuter le générateur chaque fois qu'une refonte structurelle (nouveau route group, changement DAL/Server Actions majeur, migration de provider critique) est effectuée.

End of file
