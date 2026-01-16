# Project Folders Structure Blueprint v5.2

Date: 2025-12-20

# Résumé

Ce document présente la structure projet actuelle et les décisions récentes (v5.2) intégrant les évolutions suivantes :

- **SOLID & Server Actions Refactoring** — Compliance 78%→98%, création lib/dal/media.ts
- **T3 Env Implementation** (plan-feat-t3-env.prompt.md) — Type-safe environment variables
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

0) Display Toggles System — TASK030 Complete (Jan 2026)

- **10 toggles finaux** : 6 home, 1 agenda, 1 contact, 2 presse
- **Phase 11 (1er jan 2026)** : Split presse toggle en 2 indépendants (Media Kit + Communiqués)
- **Migration 20260101220000** : Transformation idempotente des legacy keys
  - `public:presse:media_kit_enabled` → `display_toggle_media_kit`
  - `public:presse:communiques_enabled` → `display_toggle_presse_articles`
- **Composants** :
  - `PresseServerGate.tsx` : Dual independent toggle fetches
  - `PresseView.tsx` : Conditional section rendering (hide entire sections when disabled)
- **Scripts utilitaires** :
  - `scripts/check-presse-toggles.ts` : Verification utility
  - `scripts/toggle-presse.ts` : Testing utility (enable-all, disable-all, enable-media-kit, enable-press-releases)
- **Admin UI** : Display Toggles management interface in backoffice
- **Documentation** : `.github/prompts/plan-task030DisplayTogglesEpicAlignment.prompt.md`
- **Commit** : b27059f — "feat(presse): separate Media Kit and Press Releases toggles + hide disabled sections"
- Effet : Contrôle granulaire de la visibilité des sections publiques, aligné avec Epic 14.7-back-office

1) SOLID & Server Actions Refactoring (Dec 2025)

- **Compliance achieved**: 78%→98% pattern compliance (0/6 files with violations)
- **New DAL module**: `lib/dal/media.ts` (234 lines) — Centralized Storage/DB operations
  - 4 helpers: uploadToStorage(), getPublicUrl(), createMediaRecord(), cleanupStorage()
  - 3 public functions: uploadMedia(), deleteMedia(), getMediaById()
- **Code quality improvements**:
  - Average function length: 45→22 lines (51% reduction)
  - Code duplication eliminated: 120+ lines removed from team/actions.ts
- **DAL Layer refactoring**:
  - `lib/dal/admin-users.ts` — 5 helpers converted to DALResult<null>, listAllUsers() decomposed
  - `lib/dal/admin-home-hero.ts` — Slug generators converted to DALResult<string>
- **Server Actions refactoring**:
  - `lib/actions/media-actions.ts` — 263→156 lines (41% reduction)
  - `lib/email/actions.ts` — sendEmail() decomposed 41→19 lines
  - All files: Added "server-only" directive
- **SOLID principles**:
  - Single Responsibility: All functions < 30 lines
  - Dependency Inversion: Server Actions depend on DAL abstractions
  - Interface Segregation: DALResult<T> discriminated union
- Effet: Improved maintainability, type safety, eliminated duplication

2) Factorisation Contact

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

```bash
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

scripts/
  ├─ create-admin-user.ts     # Admin user creation (uses env)
  ├─ seed-admin.ts            # Database seeding (uses env)
  ├─ test-env-validation.ts   # ⚠️ T3 Env validation tests (88 lines)
  └─ test-*.ts                # Various test scripts

## Conventions et règles de design
```

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
**Updated:** 29 December 2025  
**Source:** `doc/prompts-github/folder-structure-blueprint-generator.prompt.md` (executed locally)  
**Branch:** feat-MediaLibrary  
**Version:** v5.3

## Executive summary

This document is an updated project folder blueprint generated from the repository structure and the project prompt. It captures current conventions (Next.js 16 app router, strict TypeScript, Supabase with RLS, Resend + React Email), the SOLID refactoring, Clean Code compliance, and the complete Media Library implementation (TASK029).

Key updates since v5.2 → v5.3 (TASK029 Media Library - December 2025):

- **Media Library Complete** — 7 phases: Foundation (SHA-256 duplicate detection), Tags & Folders (hierarchical organization), Bulk Operations (move/tag/delete), Rate Limiting (10 uploads/min), Thumbnails (Sharp 300x300 JPEG), Animations (reduced-motion support), Accessibility (WCAG 2.1 AA), Usage Tracking (7 tables checked with bulk Map optimization).
- **New tables** — `media_tags`, `media_folders`, `media_tag_assignments` (many-to-many).
- **DAL modules created** — 4 modules: `lib/dal/media.ts` (864 lines, Storage + DB ops), `lib/dal/media-tags.ts` (146 lines), `lib/dal/media-folders.ts` (133 lines), `lib/dal/media-usage.ts` (262 lines).
- **UI components** — 8 majeurs: MediaCard, MediaUploadDialog, MediaLibraryPicker, MediaTagsView, MediaFoldersView, MediaBulkActions, MediaDetailsPanel, MediaLibraryView.
- **Security** — 15 RLS policies granulaires (3 tables × 5 policies: select anon/auth, insert/update/delete admin).
- **Performance** — SHA-256 hash index unique pour duplicate prevention, bulk usage tracking Map-based, rate limiting LRU cache.
- **Accessibility** — 100% WCAG 2.1 AA: keyboard navigation (Space/Enter/Tab), ARIA attributes complets, screen reader support, reduced-motion CSS.
- **Quality** — 7 bugs critiques résolus (Phase 4.3), conformité 100% CRUD Pattern, DAL SOLID, Clean Code (<300 lignes par fichier).
- **Documentation** — 7 fichiers complets: plan principal, phase reports (3, 4, 4.3), implementation guides, compliance report.

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
  ├─ env.ts                   # ⚠️ T3 Env configuration (type-safe environment variables)
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
- `lib/schemas/media.ts` — **TASK029 Media Library schemas** (268 lignes totales):
  - **Server schemas** (utilise `z.coerce.bigint()` pour les IDs database):
    - `MediaTagInputSchema` — tag creation/update avec name + color
    - `MediaFolderInputSchema` — folder creation avec parent_id optionnel
    - `MediaItemExtendedSchema` — full media item avec relations (tags[], folder, usage)
  - **UI/DTO schemas** (utilise `z.number()` pour sérialisation JSON):
    - `MediaTagDTOSchema` — tag DTO pour UI components
    - `MediaFolderDTOSchema` — folder DTO avec parent_id number
    - `MediaItemExtendedDTOSchema` — media item DTO avec tags array, folder object, usage tracking
  - **Filter schemas**:
    - `MediaFilterSchema` — query (string) + tags (array) + folders (array)
    - `BulkOperationSchema` — validation pour sélections multiples
    - `BulkMoveSchema` — move to folder avec target_folder_id
    - `BulkTagSchema` — assign/remove tags avec tag_ids array
  - **Usage tracking fields**:
    - `is_used_public: z.boolean().default(false)` — flag pour médias utilisés sur pages publiques
    - `usage_locations: z.array(z.string()).default([])` — array des emplacements d'utilisation
  - **Legacy schemas** (rétrocompatibilité):
    - `MediaItemSchema` — schéma basique original
    - `MediaSelectResultSchema` — pour anciennes queries SELECT
  - **Types exportés**: `MediaTagInput`, `MediaTagDTO`, `MediaFolderInput`, `MediaFolderDTO`, `MediaItemExtended`, `MediaFilter`, `BulkMoveData`, `BulkTagData`
- `lib/schemas/presse.ts` — `PressReleaseSchema`, `MediaArticleSchema`
- `lib/schemas/spectacles.ts` — `SpectacleSchema`, `CurrentShowSchema`, `ArchivedShowSchema`
- `lib/schemas/team.ts` — `TeamMemberDbSchema`, `TeamMemberFormSchema`, `optionalUrlSchema`, DTOs

### Environment Variables (`lib/env.ts`) 🆕

#### **T3 Env Type-Safe Configuration (v0.13.10)**

Configuration centrale pour la validation des variables d'environnement avec @t3-oss/env-nextjs.

**Pattern d'utilisation:**

```typescript
// ✅ CORRECT
import { env } from '@/lib/env';

const apiKey = env.RESEND_API_KEY;           // Server-only
const siteUrl = env.NEXT_PUBLIC_SITE_URL;    // Client-accessible

// ❌ INCORRECT — NEVER USE
const apiKey = process.env.RESEND_API_KEY;
```

**Variables validées:**

**Server-only (14 variables):**

- `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_CONTACT`
- `EMAIL_DEV_REDIRECT` (boolean transform), `EMAIL_DEV_REDIRECT_TO`
- MCP/CI optionnels: `SUPABASE_PROJECT_REF`, `GITHUB_TOKEN`, etc.

**Client-accessible (publiques):**

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`

**Règles architecturales:**

> [!CAUTION]
>
> 1. NEXT_PUBLIC_* variables MUST be in `client` section only (T3 Env requirement)
> 2. ALWAYS import `{ env }` from '@/lib/env', NEVER access `process.env.*` directly
> 3. App crashes at startup if required variables missing (fail fast)
> 4. Use `SKIP_ENV_VALIDATION=1` for Docker builds / CI environments

**Bénéfices:**

- **Type Safety**: Full TypeScript inference, autocomplete pour toutes les variables
- **Fail Fast**: Erreurs détectées au démarrage, pas à runtime
- **Security**: Séparation client/server enforced par Zod
- **Code Cleanup**: ~100 lignes de code `hasEnvVars` pattern supprimées

**Fichiers impactés:**

- Core: `lib/site-config.ts`, `lib/resend.ts`, `supabase/server.ts`, `supabase/client.ts`, `supabase/admin.ts`
- DAL: `lib/dal/admin-users.ts`
- Scripts: `scripts/create-admin-user.ts`, `scripts/seed-admin.ts` (dotenv removed)
- API: `app/api/admin/media/search/route.ts`, `app/api/debug-auth/route.ts`

**Validation script:**

```bash
pnpm tsx scripts/test-env-validation.ts  # Tests 6 catégories de validation
```

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
- `components/features/admin/media/` — **TASK029 Media Library** (8 composants majeurs, 2200+ lignes total):
  - **Core Components**:
    - `MediaLibraryContainer.tsx` (Server) — Fetches initial data via DAL, passes to View
    - `MediaLibraryView.tsx` (Client, ~350 lines) — Main orchestrator avec state management, useEffect sync, filters state
    - `MediaCard.tsx` (Client, 326 lines) — Card avec thumbnail lazy-loading, checkbox multi-select, Eye badge usage indicator, keyboard handlers (Space/Enter), ARIA attributes
  - **Upload & Selection**:
    - `MediaUploadDialog.tsx` (Client, ~200 lines) — 3-phase upload (hashing SHA-256 → uploading → success), progress bars, duplicate detection toast
    - `MediaLibraryPicker.tsx` (Client, ~180 lines) — Modal picker avec recherche + pagination 12 items, utilisé dans ImageFieldGroup
    - `MediaExternalUrlInput.tsx` — Input URL externe avec validation SSRF
  - **Organization**:
    - `MediaTagsView.tsx` (Client, 240 lines) — Tags CRUD avec color picker, inline editing, drag reordering
    - `MediaFoldersView.tsx` (Client, 280 lines) — Hierarchical folders tree avec DnD, expand/collapse, parent-child relationships
  - **Bulk Operations**:
    - `MediaBulkActions.tsx` (Client, 457 lines) — Toolbar avec actions groupées (move to folder, assign/remove tags, delete with warnings)
    - `MediaDetailsPanel.tsx` (Client, 350 lines) — Side panel metadata editor (alt text, folder selector, dual tag system: attribués/disponibles, usage locations display)
  - **Shared**:
    - `types.ts` — Props interfaces (colocated pattern)
    - `index.ts` — Barrel exports
  - **Features**:
    - ✅ Duplicate prevention (SHA-256 hash unique index)
    - ✅ Advanced filters (query + tags + folders)
    - ✅ Bulk operations (select multiple, move, tag, delete)
    - ✅ Thumbnails (300x300 JPEG via Sharp, lazy-loaded)
    - ✅ Usage tracking (7 public tables checked: hero, about, team, spectacles, partners, compagnie, presse)
    - ✅ Rate limiting (10 uploads/min via LRU cache)
    - ✅ Accessibility (WCAG 2.1 AA: keyboard nav, ARIA, screen readers, reduced-motion)
    - ✅ Eye badge indicator (emerald) pour médias utilisés sur pages publiques
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
