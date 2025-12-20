# Project Folders Structure Blueprint v5

Date: 2025-12-13

# Résumé

Ce document présente la structure projet actuelle et les décisions récentes (v5) intégrant les évolutions suivantes :

- Factorisation du handler Contact (plan-factoriserContactHandler-v2.prompt.md)
- Factorisation du handler Newsletter (plan-factoriserNewsletterHandler.prompt.md)
- Finalisation du groupement ImageField (plan-imageFieldGroupFinalization/plan-imageFieldGroupV2.prompt.md)
- Plan de validation publique pour upload Clear URL (plan_Validation_publique_Clear_URL_Upload_générique)

Objectif

---

Fournir un guide unique qui décrit l'organisation des dossiers, conventions et modifications récentes pour faciliter les contributions, la revue et l'intégration CI/CD.

## Principes d'organisation

---

- Architecture feature-first (App Router + route groups `(admin)` et `(marketing)`).
- Séparation claire Server vs Client : DAL (`lib/dal/*`) = server-only, Server Actions (`app/actions` ou `lib/actions`) pour mutations, API Routes `/api/*` conservées pour compatibilité externe.
- Zod pour validation runtime + types TypeScript stricts.
- Mail/Notifications dans `lib/email/*` (effet secondaire asynchrone, non bloquant pour l'opération principale).

## Résumé des changements récents

---

1) Factorisation Contact

- Nouveau module partagé `lib/actions/contact-server.ts` implémente `handleContactSubmission()`.
- `app/api/contact/route.ts` délègue à cette fonction, conservant le contrat API (compatibilité curl/clients externes).
- `app/actions/contact.actions.ts` expose la Server Action `submitContactAction(formData)` pour progressive enhancement.
- Effet : centralisation validation (Zod) + DAL appels + notifications; rate-limiting / journaux recommandés en prochain ticket.

2) Factorisation Newsletter

- Nouveau DAL `lib/dal/newsletter-subscriber.ts` (idempotence sur `unique_violation`).
- `lib/actions/newsletter-server.ts` expose `handleNewsletterSubscription()` : valide, insère via DAL, envoie mail de confirmation (erreur mail non bloquante).
- `app/actions/newsletter.actions.ts` propose `subscribeNewsletterAction(formData)` pour formulaires JS progressive.
- `app/api/newsletter/route.ts` simplifié pour délégation au handler partagé.

3) ImageFieldGroup finalization (V2)

- Regroupement des composants média/image dans `components/features/admin/*/media/`.
- Création/split : `ImageFieldGroup.tsx` (champs texte/meta), `MediaLibraryPicker.tsx`, `MediaUploadDialog.tsx`.
- Règle : chaque gros composant < 300 lignes; splitter champs et sections (FormFields, FormImageSection, FormCtaFields...).
- Conséquence : meilleure réutilisabilité pour modules `hero`, `spectacles`, `team`.

4) Validation publique Clear URL / Upload générique

- Nouveau pattern pour validation d'URL publiques et upload via service de stockage :
  - Schémas Zod côté serveur pour `ClearUrlUpload` (validate url, mime-type, size limits).
  - Middleware ou logique centralisée pour `getClaims()` (Supabase optimized) et `cookies` getAll/setAll pattern.
  - Stocker métadonnées dans table dédiée `uploads_public` et appliquer RLS poli cies appropriées.
- Emplacement recommandé : `lib/schemas/uploads.ts`, `lib/dal/uploads.ts`, `lib/actions/uploads-server.ts`.

## Structure de dossiers (points clés)

---

- app/
  - (admin)/admin/* : pages admin (force-dynamic, revalidate=0 where required)
  - (marketing)/* : pages publiques
  - api/contact/route.ts -> délègue à `lib/actions/contact-server.ts`
  - api/newsletter/route.ts -> délègue à `lib/actions/newsletter-server.ts`

- components/
  - features/admin/*/media/
    - ImageFieldGroup.tsx
    - MediaLibraryPicker.tsx
    - MediaUploadDialog.tsx
  - features/*/_Form_.tsx split en `FormFields`, `FormImageSection`, `FormCtaFields`, `FormToggle` si >300 lignes

- lib/
  - dal/
    - newsletter-subscriber.ts  # insert idempotent
    - home-newsletter.ts        # lecture / listing (si applicable)
    - uploads.ts                # DAL pour uploads public (recommandé)
  - actions/
    - contact-server.ts         # handleContactSubmission
    - newsletter-server.ts      # handleNewsletterSubscription
    - uploads-server.ts         # handle upload validation + insert
  - schemas/
    - contact.ts                # Contact + NewsletterFormSchema (ou split to newsletter.ts)
    - newsletter.ts             # recommandation : extraire NewsletterSubscriptionSchema ici
    - uploads.ts                # Clear URL / Upload schemas
  - email/
    - actions.ts                # sendContactNotification, sendNewsletterConfirmation
  - api/
    - helpers.ts                # ApiResponse, HttpStatus, isUniqueViolation

## Conventions et règles de design

---

- DAL must be server-only (`"use server"` + `import "server-only"`) and return `DALResult<T>` — ne doit pas appeler `revalidatePath()`.
- Server Actions reside in `app/actions` or `lib/actions` with `"use server"` and must call DAL then `revalidatePath()` where needed.
- Client forms: use UI schema (numbers) vs server schema (bigint) — voir `FeatureFormSchema` pattern.
- Supabase auth: prefer `getClaims()` for fast checks; use `createServerClient` from `@supabase/ssr` and cookie pattern `getAll/setAll`.
- Keep files < 300 lines; split large forms into subcomponents per CRUD pattern doc.

## Migration notes & compatibilité

---

- Toutes les routes `/api/contact` et `/api/newsletter` restent pour rétrocompatibilité mais délèguent au code centralisé. Les hooks client (`lib/hooks/useContactForm.ts`, `lib/hooks/useNewsletterSubscribe.ts`) continuent de fonctionner.
- Recommander d'ajouter tests DAL (scripts/tests) pour les mutations (idempotence newsletter, toggles team) et d'ajouter ces tests au pipeline CI.
- Prochaine tâche prioritaire : rate-limiting sur `handleNewsletterSubscription()` et `handleContactSubmission()` (middleware ou inside handler).

## Checklist d'actions recommandées

---

- [ ] Extraire `NewsletterSubscriptionSchema` dans `lib/schemas/newsletter.ts`.
- [ ] Ajouter `lib/dal/uploads.ts` + `lib/actions/uploads-server.ts` pour pattern Clear URL upload.
- [ ] Intégrer tests DAL dans CI (scripts/test-*.ts).
- [ ] Ajouter rate-limiting (IP/form throttling) pour contact/newsletter handlers.

Annexes

---

- Références : voir prompts sources dans `.github/prompts/` et instructions détaillées dans `.github/instructions/` pour Next.js 15, Supabase auth et CRUD Server Actions pattern.

Fin du document.

# Project Folders Structure Blueprint — Rouge Cardinal Company

**Generated:** 30 November 2025  
**Updated:** 6 December 2025  
**Source:** `doc/prompts-github/folder-structure-blueprint-generator.prompt.md` (executed locally)  
**Branch:** master  
**Version:** v5.2

## Executive summary

This document is an updated project folder blueprint generated from the repository structure and the project prompt. It captures current conventions (Next.js 15 app router, strict TypeScript, Supabase with RLS, Resend + React Email), and the recent SOLID refactoring completed on `feature/backoffice`.

Key updates since v5.1 → v5.2 (Clean Code Refactoring):

- **lib/constants/ created** — New `lib/constants/hero-slides.ts` with `HERO_SLIDE_LIMITS`, `HERO_SLIDE_DEFAULTS`, `ANIMATION_CONFIG`, `DRAG_CONFIG` constants.
- **Hero Slides hooks extracted** — 4 new hooks in `lib/hooks/`: `useHeroSlideForm.ts`, `useHeroSlideFormSync.ts`, `useHeroSlidesDnd.ts`, `useHeroSlidesDelete.ts`.
- **CtaFieldGroup component** — New DRY component `components/features/admin/home/CtaFieldGroup.tsx` for CTA Primary/Secondary fields.
- **HeroSlideFormFields simplified** — Removed inline `HeroSlideCtaFields`, now uses `CtaFieldGroup` component.
- **File size compliance** — All refactored files < 300 lines (Clean Code limit). Forms split into sub-components.

Key updates since v4 → v5 (SOLID Refactoring):

- **DALResult uniformization** — All 17 DAL files now use `DALResult<T>` pattern from `lib/dal/helpers/error.ts`.
- **DAL helpers extraction** — Common utilities extracted to `lib/dal/helpers/` (error handling, formatting, slug generation).
- **Zod schemas centralization** — 11 schema files in `lib/schemas/` with barrel exports. All schemas moved from DAL/feature files.
- **lib/types/ removal** — Folder deleted. Component props now colocated with features (e.g., `components/features/admin/media/types.ts`).
- **Email imports removed from DAL** — `admin-users.ts` no longer imports email; email sent via Server Action wrapper.
- **revalidatePath removed from DAL** — All 17 DAL files are now pure data access; cache invalidation happens in Server Actions only.
- **Error codes standardized** — All DAL files use `[ERR_ENTITY_NNN]` format (e.g., `[ERR_TEAM_001]`, `[ERR_CONTACT_001]`).
- **SOLID compliance** — Score improved from 70% to **92%** (target was 90%).

Key updates v5 → v5.1 (API Routes Cleanup - December 2025):

- **API Routes deprecated** — 11 admin API routes removed, replaced by Server Actions
- **invite/actions.ts consolidated** — Merged into `app/(admin)/admin/users/actions.ts`
- **Only 1 admin API route remains** — `/api/admin/media/search` (intentionally kept for interactive search)

## Auto-detection summary

- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict)
- React: 19.x
- Bundler/dev: turbopack (dev script)
- Data: Supabase (Postgres) with declarative schemas and migrations
- Email: Resend + React Email
- Project layout: feature-based, Server Components first, DAL under `lib/dal`

## High-level organization principles

- Feature-based: each feature has a Server `Container` (data-fetching, DAL calls) and a Client `View` for interactivity.
- **DAL (server-only)** under `lib/dal/*` with `"use server"` + `import "server-only"` directives. Acts as boundary for all DB access.
  - **NO `revalidatePath()` in DAL** — Cache invalidation in Server Actions only.
  - **NO email imports in DAL** — Email sending via Server Action wrappers.
  - Returns `DALResult<T>` type from `lib/dal/helpers/error.ts`.
  - Uses standardized error codes `[ERR_ENTITY_NNN]`.
- **Server Actions** (`app/(admin)/admin/.../actions.ts`) — Mutation layer between Client Components and DAL. All `revalidatePath()` and email calls happen here.
- **Zod schemas** (`lib/schemas/*`) — Centralized validation schemas with barrel exports. Dual schemas pattern: Server schemas (with `bigint`) for DAL/DB, UI schemas (with `number`) for forms.
- **Component props colocation** — Props interfaces colocated with features (e.g., `components/features/admin/media/types.ts`), not in `lib/types/`.
- Email templates live in `emails/` with shared layout in `emails/utils` and server actions in `lib/email`.
- Admin/backoffice features grouped under `components/features/admin/` and `app/(admin)/` route group.
- **Component splitting** — Forms over 300 lines are split into sub-components (`*FormFields.tsx`, `*ImageSection.tsx`).

## Directory visualization (selected depths)

```bash
app/
  ├─ (admin)/
  │   ├─ admin/
  │   │   ├─ home/
  │   │   │   ├─ hero/        # Hero slides management (CRUD + DnD reorder)
  │   │   │   └─ about/       # About section editor
  │   │   ├─ users/           # admin users pages & invite flow
  │   │   ├─ team/            # team management (CRUD pages pattern)
  │   │   │   ├─ new/         # Create new member page
  │   │   │   ├─ [id]/edit/   # Edit member page
  │   │   │   └─ actions.ts   # Server Actions (all Team mutations)
  │   │   └─ spectacles/      # spectacles CRUD
  │   └─ layout.tsx
  ├─ (marketing)/
  │   ├─ spectacles/
  │   ├─ compagnie/
  │   ├─ contact/
  │   ├─ agenda/
  │   └─ presse/
  ├─ api/
  │   ├─ admin/
  │   │   └─ media/search/    # Media library search (only remaining admin API)
  │   ├─ public/              # Public API endpoints
  │   ├─ newsletter/          # Newsletter subscription
  │   └─ contact/             # Contact form
  └─ layout.tsx

components/
  ├─ features/
  │   ├─ admin/
  │   │   ├─ home/            # HeroSlidesView, HeroSlideForm, AboutContentForm, etc.
  │   │   ├─ users/           # InviteUserForm, UsersManagementView
  │   │   ├─ team/            # Team management components
  │   │   ├─ media/           # MediaLibraryPicker, MediaUploadDialog
  │   │   └─ spectacles/      # Spectacles management components
  │   └─ public-site/
  │       ├─ home/            # Hero, About, Newsletter, Partners, News sections
  │       ├─ spectacles/
  │       ├─ compagnie/
  │       ├─ contact/
  │       ├─ agenda/
  │       └─ presse/
  ├─ skeletons/               # Loading skeletons for Suspense
  └─ ui/                      # shadcn/ui components

lib/
  ├─ constants/               # Feature constants (Clean Code: no magic numbers)
  │   └─ hero-slides.ts       # HERO_SLIDE_LIMITS, HERO_SLIDE_DEFAULTS, ANIMATION_CONFIG, DRAG_CONFIG
  ├─ dal/                     # Data Access Layer (server-only, NO revalidatePath, NO email)
  │   ├─ helpers/             # Shared DAL utilities
  │   │   ├─ error.ts         # DALResult<T> type + handleError()
  │   │   ├─ format.ts        # Formatting utilities
  │   │   ├─ slug.ts          # Slug generation
  │   │   └─ index.ts         # Barrel exports
  │   ├─ admin-home-hero.ts   # Hero slides DAL
  │   ├─ admin-home-about.ts  # About section DAL
  │   ├─ admin-users.ts       # User management DAL
  │   ├─ agenda.ts            # Events/agenda DAL
  │   ├─ compagnie.ts         # Company pages DAL
  │   ├─ compagnie-presentation.ts
  │   ├─ contact.ts           # Contact messages DAL
  │   ├─ dashboard.ts         # Dashboard stats DAL
  │   ├─ home-about.ts        # Public about content
  │   ├─ home-hero.ts         # Public hero slides
  │   ├─ home-news.ts         # News items DAL
  │   ├─ home-newsletter.ts   # Newsletter subscriptions
  │   ├─ home-partners.ts     # Partners DAL
  │   ├─ home-shows.ts        # Shows preview DAL
  │   ├─ presse.ts            # Press releases DAL
  │   ├─ spectacles.ts        # Spectacles CRUD DAL
  │   └─ team.ts              # Team members DAL
  ├─ schemas/                 # Centralized Zod validation schemas
  │   ├─ admin-users.ts       # UpdateUserRoleSchema, InviteUserSchema
  │   ├─ agenda.ts            # EventSchema, EventFilterSchema
  │   ├─ compagnie.ts         # ValueSchema, TeamMemberSchema
  │   ├─ contact.ts           # ContactMessageSchema, NewsletterSubscriptionSchema
  │   ├─ dashboard.ts         # DashboardStatsSchema
  │   ├─ home-content.ts      # HeroSlideSchema, AboutContentSchema
  │   ├─ media.ts             # MediaItemSchema, MediaSelectResultSchema
  │   ├─ presse.ts            # PressReleaseSchema, MediaArticleSchema
  │   ├─ spectacles.ts        # SpectacleSchema, CurrentShowSchema
  │   ├─ team.ts              # TeamMemberSchema, SetActiveBodySchema
  │   └─ index.ts             # Barrel exports for all schemas
  ├─ email/
  │   └─ actions.ts           # sendInvitationEmail wrapper
  ├─ api/                     # API helpers (withAdminAuth, etc.)
  ├─ auth/                    # Auth utilities (is-admin, guards)
  ├─ hooks/                   # Custom hooks
  │   ├─ use-debounce.ts      # Debounce hook
  │   ├─ use-mobile.ts        # Mobile detection hook
  │   ├─ useContactForm.ts    # Contact form logic
  │   ├─ useHeroSlideForm.ts  # Form state + submission logic (53 lines)
  │   ├─ useHeroSlideFormSync.ts # Props/form sync with useEffect (38 lines)
  │   ├─ useHeroSlidesDnd.ts  # Drag & drop logic with dnd-kit (73 lines)
  │   ├─ useHeroSlidesDelete.ts # Delete confirmation dialog logic (61 lines)
  │   ├─ useMediaUpload.ts    # Media upload logic
  │   └─ useNewsletterSubscribe.ts # Newsletter subscription logic
  ├─ forms/                   # Form utilities
  ├─ utils/                   # Utility functions
  └─ database.types.ts        # Supabase generated types

emails/
  ├─ invitation-email.tsx
  └─ utils/

supabase/
  ├─ schemas/                 # Declarative schema files
  └─ migrations/              # Generated migrations

.github/
  ├─ instructions/            # AI coding instructions
  │   ├─ crud-server-actions-pattern.instructions.md  # CRUD pattern v1.1
  │   └─ ... other instructions
  ├─ prompts/                 # Execution plans
  └─ workflows/               # CI workflows
```

## Key directory analysis

### Constants (`lib/constants/`)

Centralized constants for Clean Code compliance (no magic numbers):

- `lib/constants/hero-slides.ts`:
  - `HERO_SLIDE_LIMITS` — Max lengths for title (80), subtitle (120), description (500), CTA label (30), CTA URL (500)
  - `HERO_SLIDE_DEFAULTS` — Default values for form initialization
  - `ANIMATION_CONFIG` — Framer Motion animation settings
  - `DRAG_CONFIG` — dnd-kit drag configuration

**Pattern**: Export named const objects, use in components via imports.

### Hooks (`lib/hooks/`)

Extracted hooks following Clean Code principles (max 30 lines/function, single responsibility):

**Hero Slides hooks** (extracted from large components):

- `useHeroSlideForm.ts` (53 lines) — Form state management + submission logic
- `useHeroSlideFormSync.ts` (38 lines) — Syncs form with props changes via `useEffect`
- `useHeroSlidesDnd.ts` (73 lines) — Drag & drop reordering with dnd-kit
- `useHeroSlidesDelete.ts` (61 lines) — Delete confirmation dialog state + handler

**General hooks**:

- `use-debounce.ts` — Value debouncing
- `use-mobile.ts` — Mobile viewport detection
- `useContactForm.ts` — Contact form logic
- `useMediaUpload.ts` — Media upload state + handlers
- `useNewsletterSubscribe.ts` — Newsletter subscription logic

**Pattern**: Extract logic when component exceeds 300 lines or when logic is reusable.

### DAL Helpers (`lib/dal/helpers/`)

Centralized utilities for all DAL files:

- `lib/dal/helpers/error.ts` — Core `DALResult<T>` type and error handling:

  ```typescript
  export type DALResult<T> = 
    | { success: true; data: T } 
    | { success: false; error: string };
  ```

- `lib/dal/helpers/format.ts` — Data formatting utilities
- `lib/dal/helpers/slug.ts` — URL slug generation
- `lib/dal/helpers/index.ts` — Barrel exports

### Data Access Layer (`lib/dal/`)

All 17 DAL files follow the same pattern:

```typescript
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { type DALResult } from "./helpers";

export async function fetchEntity(): Promise<DALResult<Entity[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("table").select("*");
  
  if (error) {
    console.error("[ERR_ENTITY_001] Failed to fetch:", error.message);
    return { success: false, error: `[ERR_ENTITY_001] ${error.message}` };
  }
  
  return { success: true, data: data ?? [] };
}
```

**Rules enforced:**

- ✅ `"use server"` directive (top of file)
- ✅ `import "server-only"` (security boundary)
- ✅ Returns `DALResult<T>` (never throws)
- ✅ Error codes `[ERR_ENTITY_NNN]` format
- ❌ NO `revalidatePath()` imports
- ❌ NO `@/lib/email` imports

### Server Actions (`app/(admin)/admin/.../actions.ts`)

Mutation layer calling DAL + side effects:

- `app/(admin)/admin/home/hero/actions.ts` — Hero Slides CRUD actions
- `app/(admin)/admin/home/about/actions.ts` — About section actions
- `app/(admin)/admin/users/actions.ts` — User management + invite email
- `app/(admin)/admin/team/actions.ts` — Team management actions
- `app/(admin)/admin/spectacles/actions.ts` — Spectacles CRUD actions

Pattern:

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { createEntity } from "@/lib/dal/entity";

export async function createEntityAction(input: unknown) {
  const validated = EntitySchema.parse(input);
  const result = await createEntity(validated);
  
  if (!result.success) return result;
  
  revalidatePath("/admin/entity");
  return { success: true, data: result.data };
}
```

### Schemas (`lib/schemas/`)

Centralized Zod schemas with barrel exports from `lib/schemas/index.ts`:

- `lib/schemas/admin-users.ts` — `UpdateUserRoleSchema`, `InviteUserSchema`, `UserRoleEnum`
- `lib/schemas/agenda.ts` — `EventSchema`, `EventFilterSchema`
- `lib/schemas/compagnie.ts` — `ValueSchema`, `TeamMemberSchema`
- `lib/schemas/contact.ts` — `ContactMessageSchema`, `ContactEmailSchema`, `NewsletterSubscriptionSchema`
- `lib/schemas/dashboard.ts` — `DashboardStatsSchema`
- `lib/schemas/home-content.ts` — Dual schemas pattern:
  - **Server schemas**: `HeroSlideInputSchema` (uses `z.coerce.bigint()` for IDs)
  - **UI schemas**: `HeroSlideFormSchema` (uses `z.number().int().positive()` for JSON serialization)
  - **DTOs**: `HeroSlideDTO`, `AboutContentDTO` types
- `lib/schemas/media.ts` — `MediaItemSchema`, `MediaSelectResultSchema`, constants
- `lib/schemas/presse.ts` — `PressReleaseSchema`, `MediaArticleSchema`
- `lib/schemas/spectacles.ts` — `SpectacleSchema`, `CurrentShowSchema`, `ArchivedShowSchema`
- `lib/schemas/team.ts` — `TeamMemberDbSchema`, `TeamMemberFormSchema`, `optionalUrlSchema`, DTOs

### Admin Components (`components/features/admin/`)

- `components/features/admin/home/` — Homepage management (11 files):
  - `HeroSlidesContainer.tsx` — Server Component, fetches data
  - `HeroSlidesView.tsx` (~241 lines) — Client Component, list + DnD + state sync via `useEffect`, uses extracted hooks
  - `HeroSlideForm.tsx` (~117 lines) — Main form dialog, uses `useHeroSlideForm` and `useHeroSlideFormSync` hooks
  - `HeroSlideFormFields.tsx` (~127 lines) — Extracted text fields (title, subtitle, description, toggle), uses `CtaFieldGroup`
  - `HeroSlideImageSection.tsx` — Extracted image picker section
  - `HeroSlidePreview.tsx` — Preview component
  - `HeroSlidesErrorBoundary.tsx` — Error boundary wrapper
  - `CtaFieldGroup.tsx` (~130 lines) — **NEW** DRY component for CTA Primary/Secondary fields, config-driven with `CTA_CONFIGS`
  - `AboutContentContainer.tsx`, `AboutContentForm.tsx` — About section management
- `components/features/admin/media/` — Media library with colocated types:
  - `MediaLibraryPicker.tsx`, `MediaUploadDialog.tsx`, `MediaExternalUrlInput.tsx`
  - `types.ts` — Props interfaces (colocated, not in lib/types/)
  - `index.ts` — Barrel exports
- `components/features/admin/users/` — User management:
  - `UsersManagementContainer.tsx` (Server), `UsersManagementView.tsx` (Client), `InviteUserForm.tsx`

### Emails

- `emails/invitation-email.tsx` — React Email template (single `<Tailwind>` wrapper, CTA inline styles). Paired with `lib/email/actions.ts` for sending and a dev redirect gate `EMAIL_DEV_REDIRECT`.

## File placement & naming patterns

### Components

- **Containers**: `PascalCase` + `Container.tsx` (e.g., `HeroSlidesContainer.tsx`) — Server Components
- **Views**: `PascalCase` + `View.tsx` (e.g., `HeroSlidesView.tsx`) — Client Components with state
- **Forms**: `PascalCase` + `Form.tsx` (e.g., `HeroSlideForm.tsx`) — Client form dialogs, max 300 lines
- **Form sub-components** (when form > 300 lines):
  - `*FormFields.tsx` — Text input fields (title, description, etc.)
  - `*ImageSection.tsx` — Image picker sections
  - `*CtaFields.tsx` — CTA-related fields
  - `*Toggle.tsx` — Switch/toggle controls

### Server Actions

- **Location**: `app/(admin)/admin/<feature>/actions.ts` (colocated with routes)
- **Naming**: `<verb><Entity>Action()` (e.g., `createHeroSlideAction`, `updateAboutContentAction`)
- **Pattern**: Zod validation → DAL call → `revalidatePath()` → return `ActionResult<T>`
- **Rule**: All `revalidatePath()` and email calls happen here, never in DAL

### DAL Modules

- **Location**: `lib/dal/<feature>.ts` (e.g., `admin-home-hero.ts`, `team.ts`)
- **Naming**: kebab-case with optional feature prefix
- **Directives**: `"use server"` + `import "server-only"`
- **Pattern**: auth check → database operation → return `DALResult<T>`
- **Helpers**: Import from `lib/dal/helpers/` for error handling, formatting
- **Rules**:
  - ❌ NO `revalidatePath()` imports
  - ❌ NO `@/lib/email` imports
  - ✅ Use `DALResult<T>` from helpers
  - ✅ Use error codes `[ERR_ENTITY_NNN]`

### Schemas

- **Location**: `lib/schemas/<feature>.ts` (centralized)
- **Barrel exports**: `lib/schemas/index.ts` re-exports all schemas
- **Server schemas**: Use `z.coerce.bigint()` for database IDs
- **UI schemas**: Use `z.number().int().positive()` for form IDs (JSON serializable)
- **Exports**: `*Schema`, `*Input`, `*DTO` types

### Component Props (Colocation Pattern)

- **Location**: `components/features/admin/<feature>/types.ts` (colocated with components)
- **NOT in**: `lib/types/` (folder removed)
- **Re-exports**: Can re-export from `lib/schemas/` for convenience

### Constants (Clean Code: No Magic Numbers)

- **Location**: `lib/constants/<feature>.ts` (e.g., `hero-slides.ts`)
- **Naming**: `UPPER_SNAKE_CASE` for constants (e.g., `HERO_SLIDE_LIMITS`, `ANIMATION_CONFIG`)
- **Pattern**: Export named const objects
- **Content examples**:
  - `*_LIMITS` — Max lengths for validation (title, description, etc.)
  - `*_DEFAULTS` — Default values for form initialization
  - `*_CONFIG` — Configuration objects (animation, drag, etc.)

### Hooks (Clean Code: Single Responsibility)

- **Location**: `lib/hooks/use<Feature>.ts` (e.g., `useHeroSlideForm.ts`)
- **Naming**: `use<Feature><Action>.ts` (e.g., `useHeroSlidesDnd.ts`, `useHeroSlidesDelete.ts`)
- **Max lines**: ~70-80 lines per hook (extracted from components)
- **Pattern**: Extract when component > 300 lines or logic is reusable
- **Exports**: Single default export of the hook function

### Email templates

- `emails/<name>.tsx` and utils under `emails/utils/`

### Tests

- Top-level `__tests__/` or co-located `*.test.tsx` for components

## Development workflow notes

- Add new admin features under `components/features/admin/` and expose them via `app/(admin)/` routes.
- Always use `createServerClient()` or `createAdminClient()` inside DAL functions and mark DAL files with `import "server-only"`.
- Validate inputs at Server Action boundary (Zod) and again in DAL (defense in depth).

## CI / Tests

- A lightweight GitHub Actions workflow was added to execute the standalone InvitationEmail render test on pushes/PRs: `.github/workflows/invitation-email-test.yml`.
- Recommended next steps:
  - integrate unit tests into the main test matrix
  - run `pnpm tsc --noEmit` and `pnpm lint` in CI

## Security & RLS

- RLS policies live under `supabase/schemas/60_rls_profiles.sql` and related files. Recent migration relaxed the UPDATE policy for `profiles` to allow admin UPSERT scenario.
- Never expose `(❌ SUPABASE_SERVICE_ROLE_KEY/✅ SUPABASE_SECRET_KEY` to the client. Use server-only admin client for privileged operations.

## Extension templates (how to add a new feature)

### CRUD Feature (with Server Actions pattern)

1. **Create schemas** in `lib/schemas/<feature>.ts`:
   - Server schema with `z.coerce.bigint()` for IDs
   - UI schema with `z.number()` for form IDs
   - DTO types for data transfer
   - Add exports to `lib/schemas/index.ts`

2. **Create DAL** in `lib/dal/<feature>.ts`:
   - Add `"use server"` directive at top
   - Add `import "server-only"`
   - Import `DALResult` from `./helpers`
   - Add auth check with `requireAdmin()`
   - Implement CRUD functions returning `DALResult<T>`
   - Use error codes `[ERR_FEATURE_NNN]`
   - ❌ NO `revalidatePath()` here
   - ❌ NO email imports here

3. **Create Server Actions** in `app/(admin)/admin/<feature>/actions.ts`:
   - Mark with `"use server"`
   - Validate input with Zod (from `lib/schemas/`)
   - Call DAL functions
   - Call `revalidatePath()` on success
   - Send emails if needed (email calls only here)
   - Return `ActionResult<T>`

4. **Create components** in `components/features/admin/<feature>/`:
   - `<Feature>Container.tsx` — Server Component, fetches data from DAL
   - `<Feature>View.tsx` — Client Component with `useState` + `useEffect` sync
   - `<Feature>Form.tsx` — Client form dialog (max 300 lines)
   - `types.ts` — Component props (colocated, not in lib/types/)
   - Split form if > 300 lines: `*FormFields.tsx`, `*ImageSection.tsx`

5. **Create route** in `app/(admin)/admin/<feature>/page.tsx`:
   - Add `export const dynamic = 'force-dynamic'`
   - Add `export const revalidate = 0`
   - Render Container component

6. **Add tests** under `__tests__/` and include in CI

### Simple API Feature (for external access)

1. Create route in `app/api/<feature>/route.ts`
2. Validate input with Zod (import from `lib/schemas/`)
3. Use DAL for database access
4. Return proper HTTP status codes

---

## SOLID Compliance Summary

**Score: 92%** (target was 90%)

| Metric | Value | Status |
|--------|-------|--------|

| DALResult coverage | 17/17 | ✅ |
| revalidatePath in DAL | 0 | ✅ |
| Email imports in DAL | 0 | ✅ |
| "use server" directive | 17/17 | ✅ |
| Schemas centralized | 11 files | ✅ |
| Error codes standardized | All | ✅ |

---

**Maintenance**: Update this blueprint when adding new top-level areas (new `app` route groups, new DAL modules, new Server Actions, significant email/system integrations) and bump the generated date.

End of generated blueprint v5
