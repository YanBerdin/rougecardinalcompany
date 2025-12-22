# Project Architecture Blueprint — Rouge Cardinal Company

Date: 2025-12-20

Décrire l'architecture globale de l'application Rouge Cardinal Company : patterns d'accès aux données, organisation des routes, Server/Client split, sécurité (Supabase/RLS), et bonnes pratiques opérationnelles (CI, tests, migrations).

## Résumé exécutif

- Framework principal : Next.js 16 (App Router) avec React 19.
- Langage : TypeScript (strict). Conventions Clean Code (max 300 lignes/fichier, fonctions courtes).
- Base de données : Supabase (Postgres) avec RLS, migrations déclaratives dans `supabase/schemas`.
- Auth : Supabase optimized JWT Signing Keys; utiliser `getClaims()` pour checks rapides.
- Mutations internes : Server Actions (colocées sous `app/actions` ou `lib/actions`) — API Routes conservées uniquement pour clients externes ou webhooks.
- DAL : centralisé sous `lib/dal/*` (server-only, retourne `DALResult<T>`, ne fait pas de revalidatePath).
- **Environment Variables** : Type-safe validation avec T3 Env (@t3-oss/env-nextjs) dans `lib/env.ts`; accès UNIQUEMENT via `import { env } from '@/lib/env'`, JAMAIS `process.env.*` directement.

## Principes architecturaux

- Séparation nette des responsabilités :
  - Lecture & rendu initial → Server Components (app/ pages & containers).
  - Mutations → Server Actions → app/actions ou lib/actions (validation Zod, requireAuth, DAL call, revalidatePath()).
  - Accès DB encapsulé → `lib/dal/*.ts` ("use server" + `import 'server-only'`).

- Pattern dual-schema :
  - Schémas SERVER (BDD) utilisent `z.coerce.bigint()` pour les IDs.
  - Schémas UI (forms) utilisent `number` pour les inputs (évite casting dangereux dans react-hook-form).

- Révalidation / cache :
  - `revalidatePath()` ou `revalidateTag()` appelés uniquement dans les Server Actions après mutations.
  - Pages admin sensibles exportent `export const dynamic = 'force-dynamic'` et `export const revalidate = 0` où nécessaire.

## Organisation des dossiers (rappel synthétique)

- `app/` : routes, layouts, groupe `(admin)` et `(marketing)`.
- `components/` : UI partagé et features (split smart/dumb).
- `lib/` :
  - `lib/dal/` — DAL server-only
  - `lib/actions/` — shared server handlers (contact-server.ts, newsletter-server.ts, uploads-server.ts)
  - `lib/schemas/` — Zod schemas (barrel)
  - `lib/email/` — envois d'email (sendNewsletterConfirmation, sendContactNotification)
  - `lib/api/helpers.ts` — ApiResponse, HttpStatus, utilitaires (isUniqueViolation)
- `emails/` : templates React Email + layout
- `supabase/schemas/` & `supabase/migrations/` : source of truth DB schema

## Data flow exemples

1) Inscription newsletter (public)

- Client form → `POST /api/newsletter` (route existante) ou Server Action `app/actions/newsletter.actions.ts`.
- Route/Action appelle `lib/actions/newsletter-server.ts` (validate Zod → `lib/dal/newsletter-subscriber.ts` → send email non bloquant → return ActionResult).
- DAL gère `unique_violation` comme succès idempotent.

2) Edition backoffice (Hero slides)

- Server Component fetch initial data via DAL (`lib/dal/home-hero.ts`)
- Client form uses UI schema + `app/actions/home-hero-actions.ts` Server Action for create/update (Server Action validates, calls DAL, revalidatePath on success).

## Sécurité et auth

- Toujours valider côté serveur (Zod) pour toutes les entrées externes.
- Utiliser `requireAdmin()` / guards dans les Server Actions avant DAL ops.
- Supabase : préférer `getClaims()` (fast local JWT verify) dans middleware et Server Components; `getUser()` uniquement si besoin du profil complet.
- Cookies : usage `getAll` / `setAll` pattern via `@supabase/ssr`.

## CI / Tests / Migration

- Tests DAL : scripts/tests (ex: `scripts/test-team-server-actions.ts`) à intégrer au pipeline CI pour valider mutations idempotentes.
- Migrations : workflow déclaratif (`supabase db diff` → migration files) et `supabase/schemas` as source of truth.

## Operational considerations

- Rate limiting: ajouter throttle sur `handleContactSubmission()` et `handleNewsletterSubscription()` (middleware ou inside handler) — TODO prioritaire.
- Monitoring: tracer erreurs email et échecs DAL; normaliser logs avec codes d'erreur `[ERR_ENTITY_NNN]`.
- Key rotation: planifier rotation périodique des JWT signing keys dans Supabase.

## Annexes & références

- Voir `memory-bank/architecture/Project_Folders_Structure_Blueprint_v5.md` pour mapping fichiers et recommandations d'extraction de schémas.
- Voir `.github/instructions/nextjs-supabase-auth-2025.instructions.md` pour patterns auth.

Fin

## Project Architecture Blueprint — Rouge Cardinal Company

Generated: 30 November 2025  
Updated: 20 December 2025  
Source: `doc/prompts-github/architecture-blueprint-generator.prompt.md`  
Repository branch: `master`  
Version: v2.3

Résumé: ce document analyse la base de code existante et formalise le modèle d'architecture, les patterns observés et les recommandations pour l'évolution et l'extensibilité. Il s'appuie sur l'organisation actuelle (Next.js 16, TypeScript strict, Supabase, React 19) et couvre les composantes clés, la sécurité RLS, les modèles d'accès aux données, les tests et le déploiement.

**Mise à jour v2.5 (22 décembre 2025) — React Hook Form Hydration Fixes:**

- **Hydration Pattern**: Client Component wrappers with next/dynamic + ssr:false for forms
- **Files Created**: AboutContentFormWrapper.tsx, TeamMemberFormClient.tsx
- **Forms Fixed**: About content, Team member (new/edit)
- **DALResult Safety**: UsersManagementContainer now checks result.success
- **Zero Hydration Errors**: All admin forms load client-side only
- **Next.js 16 Compliant**: ssr:false pattern in Client Components (required)

**Mise à jour v2.4 (20 décembre 2025) — SOLID & Server Actions Refactoring:**

- **Compliance**: Pattern compliance 78%→98% (0/6 files with violations)
- **lib/dal/media.ts**: NEW centralized Storage/DB operations (234 lines)
- **Code Quality**: Average function length 45→22 lines (51% reduction)
- **Duplication**: Eliminated 120+ lines of duplicate Storage helpers
- **DAL Layer**: All helpers converted to DALResult<T> pattern
- **Server Actions**: All files with "server-only" directive + proper revalidatePath()
- **Type Safety**: Discriminated unions for error handling, type guards instead of assertions

**Mise à jour v2.3 (20 décembre 2025) — T3 Env Integration:**

- **Environment Variables**: Type-safe validation avec @t3-oss/env-nextjs v0.13.10
- **lib/env.ts**: Configuration centrale avec validation Zod au démarrage
- **Pattern hasEnvVars supprimé**: ~100 lignes de code manuel nettoyées
- **Validation runtime**: Fail fast si variables requises manquantes
- **Type safety**: Full TypeScript inference pour toutes les variables env
- **Security**: Séparation client/server enforced (NEXT_PUBLIC_* uniquement dans client section)

**Mise à jour v2.2 (6 décembre 2025) — Clean Code Refactoring:**

- **Constants extraction**: `lib/constants/hero-slides.ts` (LIMITS, DEFAULTS, CONFIGS)
- **Hooks extraction**: 4 hooks extraits (useHeroSlideForm, useHeroSlideFormSync, useHeroSlidesDnd, useHeroSlidesDelete)
- **DRY components**: CtaFieldGroup composant config-driven
- **File size compliance**: Tous fichiers < 300 lignes

**Mise à jour v2 (30 novembre 2025) — SOLID Refactoring:**

- **DAL uniformisé**: 17/17 fichiers utilisent `DALResult<T>` depuis `lib/dal/helpers/`
- **DAL helpers**: Utilitaires extraits dans `lib/dal/helpers/` (error, format, slug)
- **Schemas centralisés**: 11 fichiers dans `lib/schemas/` avec barrel exports
- **lib/types/ supprimé**: Props colocalisées avec les features
- **Email/revalidatePath**: Supprimés du DAL, uniquement dans Server Actions
- **Error codes**: Standardisés `[ERR_ENTITY_NNN]` dans tous les DAL
- **SOLID compliance**: Score 92% (objectif était 90%)

**Mise à jour v2.2 (6 décembre 2025) — Clean Code Refactoring:**

- **lib/constants/ créé**: Nouveau `lib/constants/hero-slides.ts` avec `HERO_SLIDE_LIMITS`, `HERO_SLIDE_DEFAULTS`, `ANIMATION_CONFIG`, `DRAG_CONFIG`
- **Hooks extraits**: 4 nouveaux hooks dans `lib/hooks/`: `useHeroSlideForm.ts`, `useHeroSlideFormSync.ts`, `useHeroSlidesDnd.ts`, `useHeroSlidesDelete.ts`
- **CtaFieldGroup component**: Nouveau composant DRY `components/features/admin/home/CtaFieldGroup.tsx` pour champs CTA
- **Fichiers < 300 lignes**: `HeroSlideForm.tsx` (117 lignes), `HeroSlideFormFields.tsx` (127 lignes), `HeroSlidesView.tsx` (241 lignes)
- **Pattern hooks extraction**: Extraction de logique dans hooks custom quand composant > 300 lignes

**Mise à jour v2.1 (4 décembre 2025) — API Routes Cleanup:**

- **API Routes dépréciées supprimées**: 11 routes admin supprimées (hero, spectacles, invite-user)
- **Server Actions consolidées**: `invite/actions.ts` fusionné dans `users/actions.ts`
- **1 seule API admin conservée**: `/api/admin/media/search` (recherche interactive)
- **Scripts de test archivés**: `test-home-hero-api.ts`, `test-spectacles-api.ts` → `doc-perso/scripts-archived/`

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
  - Structure feature-based: `components/features/*`, `lib/dal/*`, `lib/schemas/*`
  - Route groups: `app/(admin)` et `app/(marketing)` pour séparation des layouts
  - **Server Actions** colocalisées avec routes: `app/(admin)/admin/.../actions.ts`
  - **DAL** (Data Access Layer) dans `lib/dal/*` avec `lib/dal/helpers/` pour utilitaires partagés
  - **Schemas Zod** centralisés dans `lib/schemas/*` (11 fichiers avec barrel exports)
  - **Props colocation**: Props des composants colocalisées avec features (ex: `components/features/admin/media/types.ts`)
  - Emails centralisés sous `emails/` avec utilitaires dans `emails/utils`
  - Migrations et schémas Supabase sous `supabase/schemas` et `supabase/migrations`

## 2. Vue d'ensemble de l'architecture

Approche principale: application monolithique modulée (feature-based) servant des Server Components par défaut et utilisant une architecture en 4 couches : Présentation → Server Actions → DAL → Database.

Principes directeurs:

- **Server Components par défaut**; Client Components uniquement pour l'interactivité
- **Server Actions** (colocalisées `app/(admin)/admin/.../actions.ts`) pour toutes les mutations avec `revalidatePath()`
- **DAL** (`lib/dal/*`) pour l'accès DB uniquement — retourne `DALResult<T>`, pas de revalidation
- **DAL Helpers** (`lib/dal/helpers/`) pour utilitaires partagés (error, format, slug)
- **Dual Zod schemas**: Server schemas (bigint) vs UI schemas (number pour JSON) dans `lib/schemas/`
- **Error codes standardisés**: Format `[ERR_ENTITY_NNN]` dans tous les fichiers DAL
- Validation runtime à chaque frontière (Zod) + typage TypeScript strict
- RLS (Row-Level Security) activé et considéré premier mécanisme de sécurité côté DB
- **Clean Code**: max 300 lignes par fichier, split des formulaires en sous-composants
- **Constants centralisées**: `lib/constants/` pour éviter les magic numbers (LIMITS, DEFAULTS, CONFIG)
- **Hooks extraction**: Logique complexe extraite dans `lib/hooks/` (DnD, form state, delete dialog)
- **Props colocation**: Props interfaces avec leurs composants, pas dans lib/types/

Boundaries:

- Frontend public (`app/(marketing)`) vs backoffice (`app/(admin)`)
- Boundary serveur/DB: `lib/dal` exécute `createServerClient()`/`createAdminClient()` et utilise `"use server"` + `import "server-only"`
- Boundary mutations: Server Actions (colocalisées) gèrent la revalidation après appel DAL

## 3. Visualisation architecturale (textuelle)

### High-level Architecture

```bash
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS APP                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │              Middleware (supabase/middleware.ts)                        ││
│  │              - JWT claims validation via getClaims() (~2-5ms)           ││
│  │              - Admin route protection (/admin/*, /api/admin/*)          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                        │
│          ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│          │  (marketing)    │  │   (admin)       │  │   api/          │      │
│          │  Public pages   │  │   Backoffice    │  │   API Routes    │      │
│          │  - spectacles   │  │   - home/hero   │  │   (minimales)   │      │
│          │  - compagnie    │  │   - users       │  │   - newsletter  │      │
│          │  - contact      │  │   - team        │  │   - contact     │      │
│          │  - agenda       │  │   - spectacles  │  │   - media/search│      │
│          │  - presse       │  │                 │  │                 │      │
│          └─────────────────┘  └─────────────────┘  └─────────────────┘      │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  LAYER: Server Actions (app/(admin)/admin/.../actions.ts)               ││
│  │  - Colocated with routes                                                ││
│  │  - Zod validation (UI schema → Server schema)                           ││
│  │  - Calls DAL functions                                                  ││
│  │  - revalidatePath() on success                                          ││
│  │  - Email sending (if needed)                                            ││
│  │  - Returns ActionResult<T>                                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  LAYER: Data Access Layer (lib/dal/)                                    ││
│  │  - "use server" + import "server-only"                                  ││
│  │  - requireAdmin() auth check                                            ││
│  │  - Database operations only                                             ││
│  │  - Returns DALResult<T> (from lib/dal/helpers/)                         ││
│  │  - Error codes [ERR_ENTITY_NNN]                                         ││
│  │  - NO revalidatePath() — NO email imports                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                        │
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

lib/constants/
  └── hero-slides.ts
        ├── HERO_SLIDE_LIMITS (title: 80, subtitle: 120, description: 500, etc.)
        ├── HERO_SLIDE_DEFAULTS (initial form values)
        ├── ANIMATION_CONFIG (Framer Motion settings)
        └── DRAG_CONFIG (dnd-kit configuration)

lib/hooks/
  ├── useHeroSlideForm.ts (53 lines) — Form state + submission logic
  ├── useHeroSlideFormSync.ts (38 lines) — Props/form sync via useEffect
  ├── useHeroSlidesDnd.ts (73 lines) — Drag & drop with @dnd-kit
  └── useHeroSlidesDelete.ts (61 lines) — Delete confirmation dialog

components/features/admin/home/
  ├── HeroSlidesContainer.tsx (Server Component)
  │     └── fetchAllHeroSlides() → <HeroSlidesView slides={data} />
  │
  ├── HeroSlidesView.tsx (~241 lines, Client Component)
  │     ├── useHeroSlidesDnd() — Extracted DnD logic
  │     ├── useHeroSlidesDelete() — Extracted delete logic
  │     ├── useEffect(() => setSlides(props), [props])  ← CRITICAL for re-render
  │     └── <HeroSlideForm />
  │
  ├── HeroSlideForm.tsx (~117 lines)
  │     ├── useHeroSlideForm() — Extracted form logic
  │     ├── useHeroSlideFormSync() — Extracted sync logic
  │     ├── <HeroSlideFormFields form={form} />
  │     └── <HeroSlideImageSection form={form} />
  │
  ├── HeroSlideFormFields.tsx (~127 lines) — Text fields + CtaFieldGroup
  │     └── <CtaFieldGroup /> — DRY CTA Primary/Secondary
  │
  ├── CtaFieldGroup.tsx (~130 lines) — Config-driven CTA fields
  │     └── CTA_CONFIGS for Primary/Secondary field mapping
  │
  └── HeroSlideImageSection.tsx (85 lines) — Image picker
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

### 4.1 Server Actions (colocalisées avec routes)

**Localisation:** `app/(admin)/admin/<feature>/actions.ts`

**Fichiers actuels:**

- `app/(admin)/admin/home/hero/home-hero-actions.ts` — CRUD Hero Slides
- `app/(admin)/admin/home/about/home-about-actions.ts` — Update About content
- `app/(admin)/admin/users/actions.ts` — User management + invite email
- `app/(admin)/admin/team/actions.ts` — Team management
- `app/(admin)/admin/spectacles/actions.ts` — Spectacles CRUD

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
- `agenda.ts`, `compagnie.ts`, `compagnie-presentation.ts`, `contact.ts`
- `dashboard.ts`, `home-about.ts`, `home-hero.ts`, `home-news.ts`
- `home-newsletter.ts`, `home-partners.ts`, `home-shows.ts`
- `presse.ts`, `spectacles.ts`, `team.ts`

**DAL Helpers (`lib/dal/helpers/`):**

- `error.ts` — `DALResult<T>` type et `handleError()`
- `format.ts` — Utilitaires de formatage
- `slug.ts` — Génération de slugs
- `index.ts` — Barrel exports

**Pattern obligatoire:**

```typescript
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { type DALResult } from "./helpers";

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
      console.error("[ERR_ENTITY_001] Failed:", error);
      return { success: false, error: `[ERR_ENTITY_001] ${error.message}` };
    }

    // NO revalidatePath() here — handled by Server Actions
    // NO email imports here — handled by Server Actions
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown" };
  }
}
```

**Règles SOLID enforced:**

- ✅ `"use server"` directive (top of file)
- ✅ `import "server-only"` (security boundary)
- ✅ Returns `DALResult<T>` (never throws)
- ✅ Error codes `[ERR_ENTITY_NNN]` format
- ❌ NO `revalidatePath()` imports
- ❌ NO `@/lib/email` imports

### 4.3 Constants (`lib/constants/`)

**Fichiers actuels:**

- `hero-slides.ts` — Constantes pour Hero Slides feature

**Pattern obligatoire:**

```typescript
// lib/constants/hero-slides.ts

// Validation limits (no magic numbers in components)
export const HERO_SLIDE_LIMITS = {
  TITLE_MAX_LENGTH: 80,
  SUBTITLE_MAX_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 500,
  CTA_LABEL_MAX_LENGTH: 30,
  CTA_URL_MAX_LENGTH: 500,
} as const;

// Form default values
export const HERO_SLIDE_DEFAULTS = {
  title: "",
  subtitle: "",
  description: "",
  is_active: true,
  // ...
} as const;

// Animation configuration (Framer Motion)
export const ANIMATION_CONFIG = {
  duration: 0.2,
  ease: "easeInOut",
} as const;

// Drag configuration (dnd-kit)
export const DRAG_CONFIG = {
  activationConstraint: {
    distance: 8,
  },
} as const;
```

**Règles de nommage:**

- `*_LIMITS` — Longueurs max pour validation
- `*_DEFAULTS` — Valeurs par défaut formulaires
- `*_CONFIG` — Objets de configuration

### 4.4 Hooks (`lib/hooks/`)

**Fichiers actuels (9 hooks):**

**Hero Slides (Clean Code extraction):**

- `useHeroSlideForm.ts` (53 lines) — Form state, isPending, handleSubmit
- `useHeroSlideFormSync.ts` (38 lines) — Sync form with props via useEffect
- `useHeroSlidesDnd.ts` (73 lines) — Drag & drop avec @dnd-kit, sensors, handleDragEnd
- `useHeroSlidesDelete.ts` (61 lines) — Delete dialog state, handleDelete

**General:**

- `use-debounce.ts` — Value debouncing
- `use-mobile.ts` — Mobile viewport detection
- `useContactForm.ts` — Contact form logic
- `useMediaUpload.ts` — Media upload state
- `useNewsletterSubscribe.ts` — Newsletter subscription

**Pattern extraction hook:**

```typescript
// lib/hooks/useHeroSlidesDnd.ts
"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { DRAG_CONFIG } from "@/lib/constants/hero-slides";

export function useHeroSlidesDnd(
  slides: HeroSlideDTO[],
  onReorder: (slides: HeroSlideDTO[]) => Promise<void>
) {
  const [isReordering, setIsReordering] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, DRAG_CONFIG),
    useSensor(KeyboardSensor)
  );
  
  const handleDragEnd = async (event: DragEndEvent) => {
    // ... reorder logic
  };
  
  return { sensors, handleDragEnd, isReordering };
}
```

**Règles d'extraction:**

- Extraire quand composant > 300 lignes
- Extraire quand logique réutilisable
- Hook max ~70-80 lignes
- Nommage: `use<Feature><Action>.ts`

### 4.5 Schemas (`lib/schemas/`)

**Fichiers actuels (11 fichiers + barrel):**

- `admin-users.ts` — `UpdateUserRoleSchema`, `InviteUserSchema`, `UserRoleEnum`
- `agenda.ts` — `EventSchema`, `EventFilterSchema`
- `compagnie.ts` — `ValueSchema`, `TeamMemberSchema`
- `contact.ts` — `ContactMessageSchema`, `ContactEmailSchema`, `NewsletterSubscriptionSchema`

### 4.6 Environment Variables (`lib/env.ts`) 🆕

#### **T3 Env Type-Safe Configuration (v0.13.10)**

Fichier central pour la validation type-safe des variables d'environnement avec Zod runtime validation.

**Configuration structure:**

```typescript
// lib/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Variables server-only (sensibles)
    SUPABASE_SECRET_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().email(),
    EMAIL_CONTACT: z.string().email(),
    EMAIL_DEV_REDIRECT: z
      .string()
      .default("false")
      .transform(val => val === "true"), // boolean transform
    // ... optional MCP/CI variables
  },
  client: {
    // Variables client-accessible (publiques)
    // ⚠️ NEXT_PUBLIC_* MUST be in client section only
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
  },
  runtimeEnv: {
    // Manual destructuring for Edge Runtime compatibility
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: 
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    // ... all variables
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION, // Docker builds
  emptyStringAsUndefined: true,
});
```

**Variables validées (14 au total):**

**Server-only (sensibles):**

- `SUPABASE_SECRET_KEY` — Clé secrète Supabase (admin access)
- `RESEND_API_KEY` — Clé API Resend pour emails
- `EMAIL_FROM` — Email expéditeur (format validé)
- `EMAIL_CONTACT` — Email contact (format validé)
- `EMAIL_DEV_REDIRECT` — Boolean transform (dev email redirection)
- `EMAIL_DEV_REDIRECT_TO` — Email de redirection dev (optionnel)
- MCP/CI optionnels : `SUPABASE_PROJECT_REF`, `GITHUB_TOKEN`, etc.

**Client-accessible (publiques):**

- `NEXT_PUBLIC_SUPABASE_URL` — URL Supabase (format URL validé)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` — Clé publique Supabase
- `NEXT_PUBLIC_SITE_URL` — URL du site (format URL validé)

**Règles d'utilisation:**

> [!CAUTION]
> **Règle critique ⚠️** :
>
> - TOUJOURS utiliser `import { env } from '@/lib/env'`
> - JAMAIS accéder directement à `process.env.*`
> - NEXT_PUBLIC_* variables DOIVENT être dans la section `client` uniquement

**Pattern d'import:**

```typescript
// ✅ CORRECT
import { env } from '@/lib/env';

const apiKey = env.RESEND_API_KEY;
const siteUrl = env.NEXT_PUBLIC_SITE_URL;

// ❌ INCORRECT
const apiKey = process.env.RESEND_API_KEY;
```

**Bénéfices:**

1. **Fail Fast** — App crash au démarrage si variables requises manquantes
2. **Type Safety** — Full TypeScript inference (autocomplete `env.*`)
3. **Security** — Séparation client/server enforced par Zod
4. **Documentation** — Single source of truth pour toutes les variables
5. **Testing** — `SKIP_ENV_VALIDATION=1` pour CI/Docker builds
6. **Code Cleanup** — ~100 lignes de code `hasEnvVars` supprimées

**Fichiers migrés (12 au total):**

- `lib/site-config.ts` — Utilise `env.EMAIL_FROM`, `env.NEXT_PUBLIC_SITE_URL`
- `lib/resend.ts` — Utilise `env.RESEND_API_KEY`
- `supabase/server.ts, client.ts, admin.ts` — Utilise `env` pour credentials
- `lib/dal/admin-users.ts` — Utilise `env.NEXT_PUBLIC_SITE_URL`
- `scripts/create-admin-user.ts, seed-admin.ts` — Imports `env` (pas dotenv)
- `app/api/admin/media/search/route.ts`
- `app/api/debug-auth/route.ts`

**Validation script:**

```bash
# Test de validation (sans .env.local, doit échouer)
pnpm tsx scripts/test-env-validation.ts

# Build avec skip validation (Docker/CI)
SKIP_ENV_VALIDATION=1 pnpm build
```

**Commits:**

- `feat(env): implement T3 Env validation (Phases 1-3)` — Core migration
- `feat(env): complete T3 Env migration (Phases 4-7)` — Final cleanup
- `dashboard.ts` — `DashboardStatsSchema`
- `home-content.ts` — Hero Slides + About schemas (Server + UI)
- `media.ts` — `MediaItemSchema`, `MediaSelectResultSchema`, constants
- `presse.ts` — `PressReleaseSchema`, `MediaArticleSchema`
- `spectacles.ts` — `SpectacleSchema`, `CurrentShowSchema`, `ArchivedShowSchema`
- `team.ts` — `TeamMemberSchema`, `SetActiveBodySchema`
- `index.ts` — Barrel exports pour tous les schemas

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

### 4.6 Emails (`emails/`)

- Templates: React Email components; wrapper unique `<Tailwind>` pour compatibilité
- Envoi: `lib/email/actions.ts` contient gate `EMAIL_DEV_REDIRECT` pour redirection en environnement dev/test

### 4.7 Admin UI Components

**Structure par feature** (`components/features/admin/`):

- `home/` — 9 fichiers: Hero Slides + About management
- `users/` — User invitation and management
- `team/` — Team member CRUD (5 fichiers):
  - `TeamManagementContainer.tsx` — Server Component, fetches data
  - `TeamMemberList.tsx` — Card grid with actions
  - `TeamMemberCard.tsx` — Individual member card
  - `TeamMemberForm.tsx` — React Hook Form + zodResolver
  - `TeamMemberFormWrapper.tsx` — Bridge with `sanitizePayload()` for DB constraints
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
│   PRESENTATION LAYER                                           │
│   app/, components/                                            │
│   - Server Components (fetching, rendering)                    │
│   - Client Components (interactivity, forms)                   │
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
- **Novembre 2025**: Migration Team CRUD vers le pattern Server Actions complet
  - Suppression API Routes `/api/admin/team/` (3 fichiers) au profit de Server Actions colocalisées
  - Migration inline form → pages dédiées (`/admin/team/new`, `/admin/team/[id]/edit`)
  - Ajout `TeamMemberFormWrapper.tsx` avec `sanitizePayload()` (empty string → null) pour contrainte DB
  - Ajout helper `optionalUrlSchema` pour champs URL acceptant chaînes vides

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
| ----------------- | ------------- |
| `revalidatePath()` dans DAL | Déplacer dans Server Action |
| `useState(props)` sans `useEffect` | Ajouter `useEffect(() => setState(props), [props])` |
| UI schema avec `bigint` | Utiliser `z.number()` pour form IDs |
| Type casting `as unknown as Resolver<>` | Utiliser UI schema correspondant au form type |
| Form > 300 lignes | Split en `*FormFields.tsx`, `*ImageSection.tsx` |
| API Route pour mutation interne | Utiliser Server Action |

## Annexes & références bis

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
