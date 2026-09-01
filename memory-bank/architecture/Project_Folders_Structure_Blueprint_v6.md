# Project Folders Structure Blueprint

> **Version:** 6.1
> **Date:** 2026-08-20
> **Repository:** Rouge Cardinal Company
> **Total source files:** ~1 690 (.ts, .tsx, .js, .sql, .css, .md — hors node_modules, .next, doc-perso)
>
> **Changelog v6.1 (2026-08-20)** : Next.js 16.1.5 → 16.3.0 (correctif upstream Sharp/nft, TASK200) · correction TailwindCSS 4 → 3.4 (erreur v6.0) · nouvelle section admin `footer` (TASK095) · pages légales statiques `mentions-legales` / `politique-confidentialite` / `cookies` (TASK098) · Metadata Routes `sitemap.ts` / `robots.ts` / `manifest.ts` + icônes PWA (TASK107) · Server Actions racine renommées `*.actions.ts` · nouveaux modules DAL (`media-url-sync`, `media-move`, `footer-config`, `team-hard-delete`, `team-reorder`) · `lib/api/` + `lib/env-validation.ts` · `lib/auth/is-admin.ts` supprimé (TASK096) · 10 workflows CI/CD · graphe sémantique `graphify-out/` · workaround Sharp `outputFileTracingIncludes` (TASK104)

---

## 1. Structural Overview

### 1.1 Auto-Detection Summary

| Property              | Value                                                       |
| --------------------- | ----------------------------------------------------------- |
| **Project Type**      | Full-stack Web Application                                  |
| **Framework**         | Next.js 16.3.0 (App Router, Turbopack)                      |
| **UI Framework**      | React 19.2.0                                                |
| **Language**          | TypeScript (strict mode, ES2017 target, bundler resolution) |
| **Backend/Database**  | Supabase (PostgreSQL, Auth, Storage, Edge Functions)        |
| **Styling**           | TailwindCSS 3.4 + shadcn/ui + Radix UI                      |
| **Validation**        | Zod 4 (schémas Server + UI)                                 |
| **Tests**             | Vitest 4 (unit) + Playwright 1.57 (E2E)                     |
| **Images**            | Sharp 0.35 (compression + thumbnails, server-externalized)  |
| **Package Manager**   | pnpm (ESM "type": "module")                                 |
| **Monorepo**          | No — Single application                                     |
| **Microservices**     | No — Server-first monolith with Supabase backend            |
| **Module System**     | ESM (`"type": "module"` in package.json)                    |
| **Error Monitoring**  | Sentry (@sentry/nextjs ^10.40.0, multi-runtime)             |
| **Env Validation**    | @t3-oss/env-nextjs (type-safe env vars)                     |
| **Email**             | React Email + Resend                                        |
| **Forms**             | react-hook-form + @hookform/resolvers + Zod                 |

### 1.2 Architecture Philosophy

- **Server-first**: Server Components by default; Client Components only for interactivity
- **Feature-based organization**: Components, actions, schemas grouped by domain feature
- **Data Access Layer (DAL)**: Strict server-only boundary (`"use server"` + `import "server-only"`)
- **Defense-in-depth security**: RLS policies + `is_admin()` guards + auth checks in Server Actions
- **Smart/Dumb component split**: Containers fetch data → presentational components render
- **Declarative schema management**: `supabase/schemas/` is source of truth; migrations are auto-generated
- **BigInt Three-Layer serialization**: UI (number) → Transport (string) → DAL (bigint)

---

## 2. Directory Visualization

```bash
rougecardinalcompany/
├── app/                            # Next.js App Router — routing, layouts, pages (125 fichiers)
│   ├── layout.tsx                  # Root layout: HTML shell + ThemeProvider
│   ├── globals.css                 # Global TailwindCSS styles
│   ├── error.tsx                   # Page-level error boundary
│   ├── global-error.tsx            # Root-level error boundary (Sentry)
│   ├── sitemap.ts                  # Metadata Route: sitemap XML statique, 9 URLs publiques (TASK107)
│   ├── robots.ts                   # Metadata Route: robots.txt → /sitemap.xml
│   ├── manifest.ts                 # Metadata Route: PWA manifest
│   ├── favicon.ico / icon1.png / icon2.png / apple-icon.png / twitter-image.png  # Icônes PWA & OG
│   │
│   ├── (admin)/                    # Route group — admin zone (protected)
│   │   ├── layout.tsx              # Admin layout: AppSidebar + auth guard
│   │   └── admin/
│   │       ├── agenda/             # CRUD: events (list, new, [id]/edit)
│   │       ├── analytics/          # Dashboard analytics
│   │       ├── audit-logs/         # System audit trail
│   │       ├── compagnie/          # Company info (presentation, valeurs)
│   │       ├── debug-auth/         # Auth/RLS diagnostic tools
│   │       ├── footer/             # Footer & coordonnées admin (TASK095)
│   │       ├── home/               # Homepage admin (about, hero)
│   │       ├── lieux/              # CRUD: venues
│   │       ├── media/              # Media library (library, folders, tags)
│   │       ├── partners/           # CRUD: partners
│   │       ├── presse/             # Press (articles, communiques, contacts)
│   │       ├── site-config/        # Display toggles admin
│   │       ├── spectacles/         # CRUD: shows
│   │       ├── team/               # CRUD: team members
│   │       └── users/              # User management + invitations
│   │
│   ├── (marketing)/                # Route group — public site
│   │   ├── layout.tsx              # Public layout: Header + Footer
│   │   ├── page.tsx                # Homepage
│   │   ├── agenda/                 # Public events calendar
│   │   ├── compagnie/              # Company page
│   │   ├── contact/                # Contact form
│   │   ├── presse/                 # Press / media kit
│   │   ├── spectacles/             # Shows listing + [slug] detail
│   │   ├── mentions-legales/       # Pages légales statiques (TASK098, RGPD)
│   │   ├── politique-confidentialite/
│   │   ├── cookies/
│   │   ├── protected/              # Page protégée (démo auth)
│   │   └── auth/                   # accept-invitation/ + setup-account/
│   │
│   ├── actions/                    # Root-level server actions (public, suffixe .actions.ts)
│   │   ├── analytics.actions.ts    # Analytics tracking
│   │   ├── contact.actions.ts      # Contact form submission
│   │   └── newsletter.actions.ts   # Newsletter subscription
│   │
│   ├── api/                        # API Route Handlers
│   │   ├── admin/media/            # Media search + thumbnail generation
│   │   ├── admin/spectacles/       # Spectacle gallery API
│   │   ├── contact/                # Public contact endpoint
│   │   ├── newsletter/             # Newsletter endpoint
│   │   ├── spectacles/             # Public spectacles + photos
│   │   ├── webhooks/resend/        # Resend webhook receiver
│   │   └── ...                     # Debug, test, sentry endpoints
│   │
│   └── auth/                       # Auth pages (login, sign-up, etc.)
│       ├── confirm/                # Email confirmation
│       ├── login/                  # Login page
│       ├── sign-up/                # Registration
│       ├── sign-up-success/        # Post-registration confirmation
│       ├── forgot-password/        # Password reset request
│       ├── update-password/        # Password update
│       └── error/                  # Auth error page
│
├── components/                     # React component library (352 fichiers)
│   ├── features/                   # Feature-scoped components (262 fichiers)
│   │   ├── admin/                  # Admin feature components
│   │   │   ├── agenda/             # Event management UI
│   │   │   ├── analytics/          # Charts, stats, tracking
│   │   │   ├── audit-logs/         # Audit log viewer
│   │   │   ├── compagnie/          # Company editor
│   │   │   ├── footer/             # Footer & coordonnées editor
│   │   │   ├── home/               # Homepage admin (hero, about)
│   │   │   ├── lieux/              # Venue CRUD UI
│   │   │   ├── media/              # Media library UI (30+ fichiers)
│   │   │   ├── partners/           # Partners CRUD UI
│   │   │   ├── presse/             # Press management UI
│   │   │   ├── shared/             # Composants admin partagés (AutoSaveIndicator)
│   │   │   ├── site-config/        # Display toggles UI
│   │   │   ├── spectacles/         # Show CRUD UI
│   │   │   ├── team/               # Team CRUD UI
│   │   │   └── users/              # User management UI
│   │   ├── public-site/            # Public-facing feature components
│   │   │   ├── agenda/             # Public events list
│   │   │   ├── compagnie/          # Company sections (+ SectionFounder statique)
│   │   │   ├── contact/            # Contact form components
│   │   │   ├── legal/              # Pages légales (mentions, confidentialité, cookies)
│   │   │   ├── home/               # Homepage sections
│   │   │   │   ├── about/          # About section
│   │   │   │   ├── hero/           # Hero carousel
│   │   │   │   ├── news/           # News section
│   │   │   │   ├── newsletter/     # Newsletter form
│   │   │   │   ├── partners/       # Partners logos
│   │   │   │   ├── shows/          # Shows preview
│   │   │   │   └── team/           # Team section (HomeTeamContainer)
│   │   │   ├── presse/             # Press landing components
│   │   │   └── spectacles/         # Show details
│   │   └── analytics/              # PageViewTracker
│   │
│   ├── ui/                         # shadcn/ui primitives (33 fichiers)
│   │   ├── button.tsx              # Alert-dialog, avatar, badge, ...
│   │   └── ...                     # Calendar, card, dialog, ...
│   │
│   ├── admin/                      # Admin shared components
│   │   ├── AdminSidebar.tsx        # Navigation sidebar
│   │   ├── dashboard/              # StatsCard, DashboardStatsContainer
│   │   ├── ErrorBoundary.tsx       # Admin error boundary
│   │   └── BfcacheHandler.tsx      # Back/forward cache handler
│   │
│   ├── error-boundaries/           # Reusable error boundaries
│   │   ├── ComponentErrorBoundary.tsx
│   │   ├── PageErrorBoundary.tsx
│   │   └── RootErrorBoundary.tsx
│   │
│   ├── layout/                     # Shared layout components
│   │   ├── header.tsx              # Public site header
│   │   └── footer.tsx              # Public site footer (config DB via configurations_site)
│   │
│   ├── skeletons/                  # Loading state placeholders (21 fichiers)
│   │
│   ├── auth/                       # Auth-specific components
│   ├── LogoCloud/                  # Logo cloud display
│   └── LogoCloudModel/             # Logo data model
│
├── lib/                            # Core application library (138 fichiers)
│   ├── dal/                        # Data Access Layer (48 fichiers, server-only)
│   │   ├── helpers/                # Centralized DAL utilities
│   │   │   ├── error.ts            # DALResult<T> + dalSuccess/dalError + isDynamicServerError
│   │   │   ├── format.ts           # Formatting helpers
│   │   │   ├── media-url.ts        # buildMediaPublicUrl (T3 Env)
│   │   │   ├── serialize.ts        # BigInt serialization
│   │   │   ├── slug.ts             # Slug generation
│   │   │   └── index.ts            # Barrel exports
│   │   ├── fallback/               # Fallback data providers
│   │   ├── admin-*.ts              # Admin-scoped DAL modules (17+)
│   │   ├── home-*.ts               # Homepage sections DAL (6)
│   │   ├── media-*.ts              # Media DAL (move, thumbnail, url-sync, usage)
│   │   ├── footer-config.ts        # Footer & coordonnées DAL
│   │   ├── team.ts / team-reorder.ts / team-hard-delete.ts
│   │   ├── spectacles.ts           # Public shows DAL
│   │   └── ...                     # 48 modules DAL au total
│   │
│   ├── schemas/                    # Zod validation schemas (26 fichiers)
│   │   ├── auth.ts                 # PasswordSchema (TASK096)
│   │   ├── footer-config.ts        # Footer config schemas
│   │   └── ...                     # Un fichier par domaine (Server + UI variants)
│   │
│   ├── actions/                    # Server action helpers (13 fichiers)
│   │   ├── auth-setup-actions.ts   # setupAccountAction (TASK096)
│   │   ├── footer-config-actions.ts
│   │   ├── media-actions.ts        # Media CRUD + upload pipeline (compression Sharp)
│   │   ├── media-bulk-actions.ts   # Bulk operations
│   │   ├── site-config-actions.ts  # Display toggle mutations
│   │   ├── types.ts                # ActionResult type
│   │   └── ...
│   │
│   ├── api/                        # Helpers API partagés (helpers.ts)
│   │
│   ├── hooks/                      # Client-side React hooks (13 fichiers)
│   │   ├── use-debounce.ts         # Input debouncing
│   │   ├── use-form-autosave.ts    # Auto-save générique type Google Docs
│   │   ├── use-press-release-autosave.ts
│   │   ├── use-prefers-reduced-motion.ts
│   │   ├── useArticlesDnd.ts       # DnD articles de presse
│   │   └── ...
│   │
│   ├── utils/                      # Utility functions (14 fichiers)
│   │   ├── mime-verify.ts          # Magic bytes file validation
│   │   ├── image-compress.ts       # Compression Sharp (TASK087)
│   │   ├── google-maps.ts          # buildGoogleMapsUrl
│   │   ├── validate-invitation-url.ts  # Anti open-redirect (CodeQL #30)
│   │   ├── with-display-toggle.tsx # RSC helper pour display toggles
│   │   ├── rate-limit.ts           # API rate limiting
│   │   └── ...
│   │
│   ├── auth/                       # Role guards (roles.ts, role-helpers.ts — is-admin.ts supprimé)
│   ├── email/                      # Email service (actions.ts, types.ts)
│   ├── services/                   # External services (sentry-api.ts)
│   ├── sentry/                     # Sentry integration (capture-error.ts)
│   ├── tables/                     # Table column helpers (5 fichiers)
│   ├── forms/                      # Form helpers
│   ├── i18n/                       # Status label translations
│   ├── constants/                  # App constants
│   ├── plugins/                    # TailwindCSS plugins
│   ├── types/                      # Shared TypeScript types
│   │
│   ├── env.ts                      # T3 Env configuration (type-safe env)
│   ├── env-validation.ts           # Validation runtime des variables Supabase (instrumentation)
│   ├── database.types.ts           # Supabase auto-generated types
│   ├── utils.ts                    # cn() utility for class merging
│   ├── resend.ts                   # Resend client instantiation
│   └── site-config.ts              # Site configuration helpers
│
├── supabase/                       # Supabase infrastructure
│   ├── schemas/                    # Declarative SQL schemas (48 fichiers, 01→70 + README)
│   │   ├── 01_extensions.sql       # PostGIS, pg_cron, etc.
│   │   ├── 02_table_profiles.sql   # User profiles
│   │   ├── 02b_functions_core.sql  # Core functions (is_admin, has_min_role, updated_at)
│   │   ├── 03_table_medias.sql     # Media library
│   │   ├── ...                     # Ordered by dependency (01→63)
│   │   └── 70_grants_baseline.sql  # Baseline GRANTs (non capturés par db diff)
│   │
│   ├── migrations/                 # Auto-generated + hotfix migrations (165 fichiers)
│   │   └── archived/               # Archived old migrations
│   │
│   ├── functions/                  # Supabase Edge Functions
│   │   └── scheduled-cleanup/      # Scheduled data cleanup
│   │
│   ├── tests/                      # SQL/database tests
│   ├── scripts/                    # Database utility scripts
│   ├── reconstruction_database_plan/ # DB reconstruction docs
│   │
│   ├── server.ts                   # Server-side Supabase client factory
│   ├── client.ts                   # Browser-side Supabase client factory
│   ├── middleware.ts               # Middleware Supabase client factory
│   └── admin.ts                    # Service-role Supabase client
│
├── emails/                         # React Email templates (5 fichiers)
│   ├── contact-message-notification.tsx
│   ├── invitation-email.tsx
│   ├── newsletter-confirmation.tsx
│   └── utils/                      # Email utility helpers
│
├── scripts/                        # Maintenance & testing scripts (117 fichiers)
│   ├── lib/                        # Script shared libs (env.ts)
│   ├── utils/                      # Script utilities (supabase-local-credentials.ts)
│   ├── Archived-tests/             # Archived test scripts
│   ├── Thumbnails/                 # Thumbnail management scripts
│   ├── check-*.ts                  # Verification/audit scripts (15+)
│   ├── test-*.ts                   # Testing scripts (10+)
│   └── ...                         # Backup, deployment, admin scripts
│
├── e2e/                            # Playwright E2E suite (112 fichiers)
│   ├── factories/                  # Test data factories (10 fichiers)
│   ├── fixtures/                   # Fixtures + assets
│   ├── pages/                      # Page Object Models (admin/ auth/ public/)
│   ├── helpers/                    # Test helpers
│   ├── tests/                      # Specs (admin/ auth/ cross/ editor/ permissions/ public/)
│   └── global-setup.ts             # Pre-flight checks (env vars + Supabase + warmup)
│
├── __tests__/                      # Unit/integration tests Vitest
│   ├── auth/                       # roles.test.ts (readRoleFromMeta)
│   ├── dal/                        # permissions-integration.test.ts
│   ├── emails/                     # Email template tests
│   ├── schemas/                    # auth.test.ts (PasswordSchema)
│   └── utils/                      # image-compress, env-validation, google-maps, ...
│
├── .github/                        # GitHub configuration
│   ├── workflows/                  # CI/CD pipelines (10 workflows)
│   │   ├── deploy.yml              # Production deployment
│   │   ├── e2e.yml                 # Pipeline E2E (Supabase local + Playwright)
│   │   ├── unit-tests.yml          # Vitest sur push/PR
│   │   ├── check-role-invariant.yml # Invariant app_metadata.role = profiles.role (cron)
│   │   ├── backup-database.yml     # DB backup automation
│   │   ├── invitation-email-test.yml
│   │   ├── reorder-sql-tests.yml
│   │   ├── copilot-setup-steps.yml
│   │   ├── detect-revoke-warn.yml  # Security monitoring
│   │   └── monitor-detect-revoke.yml
│   ├── instructions/               # AI coding instructions (27 fichiers)
│   ├── prompts/                    # Reusable prompt templates
│   ├── skills/                     # Agent skills
│   └── copilot-instructions.md     # Main Copilot config
│
├── memory-bank/                    # Project knowledge base
│   ├── architecture/               # Architecture docs & blueprints
│   ├── tasks/                      # Task tracking (per-task markdown)
│   ├── epics/                      # Epic definitions & details
│   ├── changes/                    # Change logs
│   └── procedures/                 # Operational procedures
│
├── graphify-out/                   # Graphe sémantique du codebase (graph.json, GRAPH_REPORT.md, graph.html)
├── doc/                            # Developer documentation
├── public/                         # Static assets (images, fonts, etc.)
│
├── proxy.ts                        # Next.js 16 middleware (renamed from middleware.ts)
├── instrumentation.ts              # Sentry instrumentation + env validation hook
├── next.config.ts                  # Next.js + Sentry + Sharp tracing configuration
├── tailwind.config.ts              # TailwindCSS configuration
├── tsconfig.json                   # TypeScript configuration
├── eslint.config.mjs               # ESLint flat config
├── postcss.config.mjs              # PostCSS configuration
├── components.json                 # shadcn/ui configuration
├── sentry.client.config.ts         # Sentry browser config
├── sentry.server.config.ts         # Sentry server config
├── sentry.edge.config.ts           # Sentry edge config
└── package.json                    # Dependencies & scripts
```

---

## 3. Key Directory Analysis

### 3.1 `app/` — Routing Layer (125 files)

The App Router uses **route groups** to separate admin and public layouts without affecting URLs.

| Route Group    | Layout                         | Auth Requirement | URL prefix  |
| -------------- | ------------------------------ | ---------------- | ----------- |
| `(admin)/`     | AdminSidebar + auth protection | `requireBackofficePageAccess()`| `/admin/*` |
| `(marketing)/` | Header + Footer                | Public           | `/*`        |
| `auth/`        | Minimal (no layout group)      | Public           | `/auth/*`   |
| `api/`         | None (route handlers)          | Per-endpoint     | `/api/*`    |

**Admin CRUD Route Pattern** (repeated for 7+ features):

```bash
app/(admin)/admin/{feature}/
├── page.tsx                # List page (Server Component → Container)
├── loading.tsx             # Skeleton loader
├── actions.ts              # Colocated Server Actions
├── new/
│   ├── page.tsx            # Create page
│   └── loading.tsx
└── [id]/
    └── edit/
        ├── page.tsx        # Edit page
        └── loading.tsx
```

Features using this full CRUD pattern: `agenda`, `lieux`, `partners`, `spectacles`, `team`.

**Marketing Route Pattern** (simpler, read-only):

```bash
app/(marketing)/{feature}/
├── page.tsx                # Public page (Server Component)
└── metadata.ts             # Optional SEO metadata
```

**Cas particuliers (marketing)** :

- Pages légales statiques : `mentions-legales/`, `politique-confidentialite/`, `cookies/` (TASK098)
- `auth/accept-invitation/` : page intermédiaire d'invitation (validation anti open-redirect via Server Action, TASK106)
- `auth/setup-account/` : définition du mot de passe après invitation

**Metadata Routes (racine `app/`)** : `sitemap.ts` (9 URLs publiques canoniques), `robots.ts`, `manifest.ts` + icônes fichiers-conventions (`favicon.ico`, `icon1.png`, `icon2.png`, `apple-icon.png`, `twitter-image.png`).

### 3.2 `components/` — UI Component Library (352 files)

Organized in three tiers:

| Tier              | Path                         | Count | Description                              |
| ----------------- | ---------------------------- | ----- | ---------------------------------------- |
| **UI Primitives** | `components/ui/`             | 33    | shadcn/ui components (button, dialog...) |
| **Features**      | `components/features/`       | 262   | Domain-specific components               |
| **Shared**        | `components/{admin,layout}/` | ~57   | Cross-feature shared components          |

**Feature Component Pattern** (per admin feature):

```bash
components/features/admin/{feature}/
├── {Feature}ManagementContainer.tsx   # Smart: data fetching + orchestration
├── {Feature}List.tsx                  # Dumb: list display
├── {Feature}Card.tsx                  # Dumb: card display
├── {Feature}Form.tsx                  # Client: form with react-hook-form
├── {Feature}FormClient.tsx            # Client: form wrapper (optional)
├── types.ts                           # Props interfaces + feature types
├── constants.ts                       # Feature-specific constants (optional)
└── index.ts                           # Barrel exports (optional)
```

**Public-site Feature Pattern** (homepage sections):

```bash
components/features/public-site/home/{section}/
├── {Section}Container.tsx             # Server: fetches via DAL
├── {Section}View.tsx                  # Client: interactive display
├── {Section}Client.tsx                # Client: carousel/animation logic
├── types.ts                           # Section-specific types
├── constants.ts                       # Section constants
└── index.ts                           # Barrel export
```

### 3.3 `lib/` — Core Library (138 files)

The `lib/` directory is the application's core — it **never** contains UI components.

| Subdirectory    | Files | Role                                            | Server-only? |
| --------------- | ----- | ----------------------------------------------- | ------------ |
| `dal/`          | 48    | Database access — all Supabase queries          | Yes          |
| `schemas/`      | 26    | Zod schemas (Server + UI variants)              | No           |
| `actions/`      | 13    | Server Action helpers + shared action utilities | Yes          |
| `hooks/`        | 13    | Client-side React hooks                         | No           |
| `utils/`        | 14    | Pure utility functions                          | Mixed        |
| `tables/`       | 5     | Table column definition helpers                 | No           |
| `auth/`         | 2     | Role-based guards (`roles.ts`, `role-helpers.ts`) — `is-admin.ts` supprimé | Yes          |
| `api/`          | 1     | Helpers partagés pour Route Handlers            | Yes          |
| `email/`        | 2     | Email sending service                           | Yes          |
| `services/`     | 1     | External service clients (Sentry API)           | Yes          |
| `sentry/`       | 2     | Error capture helpers                           | Mixed        |
| `forms/`        | 1     | Form-specific helpers                           | No           |
| `i18n/`         | 1     | Status label translations                       | No           |
| `constants/`    | 1     | Application constants                           | No           |
| `plugins/`      | 1     | TailwindCSS plugins                             | N/A          |
| `types/`        | 1     | Shared TypeScript type definitions              | No           |

**DAL Module Naming Convention**:

- `admin-{feature}.ts` — Admin-only data access (e.g., `admin-partners.ts`)
- `{feature}.ts` — Public-facing data access (e.g., `spectacles.ts`)
- `home-{section}.ts` — Homepage section data (e.g., `home-hero.ts`)

### 3.4 `supabase/` — Database Infrastructure

| Subdirectory                    | Files | Role                                       |
| ------------------------------- | ----- | ------------------------------------------ |
| `schemas/`                      | 48    | Declarative SQL — source of truth          |
| `migrations/`                   | 165   | Generated + hotfix migrations              |
| `functions/`                    | —     | Supabase Edge Functions                    |
| `tests/`                        | —     | SQL tests                                  |
| `scripts/`                      | —     | Database scripts                           |
| `reconstruction_database_plan/` | —     | DB reconstruction documentation            |
| Root `.ts` files                | 4     | Client factories (server, client, admin, middleware) |

**Schema File Ordering Convention**: Files are prefixed with numbers (`01_`–`63_`) to control execution order. Dependencies flow from lower numbers to higher.

```bash
01_extensions.sql          → PostgreSQL extensions
02_table_profiles.sql      → Base user tables
02b_functions_core.sql     → Core functions (is_admin, has_min_role, updated_at)
02c_storage_buckets.sql    → Storage configuration
03–09_table_*.sql          → Content tables (ordered by FK deps)
10–15_tables_system.sql    → System tables (audit, analytics, etc.)
20+_*.sql                  → Views, indexes, constraints, triggers
70_grants_baseline.sql     → Baseline GRANTs (non capturés par db diff)
```

### 3.5 `scripts/` — Utilities & Maintenance (117 files)

Scripts follow a verb-noun naming pattern:

| Prefix       | Purpose                  | Examples                                      |
| ------------ | ------------------------ | --------------------------------------------- |
| `check-*`    | Verification/auditing    | `check-rls-policies.ts`, `check-buckets.ts`   |
| `test-*`     | Integration testing      | `test-admin-access.ts`, `test-email-*.ts`     |
| `create-*`   | Resource creation        | `create-admin-user.ts`                        |
| `backup-*`   | Data backup              | `backup-database.ts`                          |
| `toggle-*`   | Feature toggling         | `toggle-presse.ts`                            |
| `audit-*`    | Security auditing        | `audit-secrets-management.ts`                 |

Run via: `pnpm exec tsx scripts/{script-name}.ts`

---

## 4. File Placement Patterns

### 4.1 Decision Matrix — "Where does this file go?"

| What you're building                      | Where it goes                                         |
| ----------------------------------------- | ----------------------------------------------------- |
| New page/route                            | `app/(admin)/admin/{feature}/` or `app/(marketing)/`  |
| Server Action (admin mutation)            | `app/(admin)/admin/{feature}/actions.ts`              |
| Server Action (public)                    | `app/actions/{feature}.actions.ts`                    |
| API endpoint (external/webhook)           | `app/api/{feature}/route.ts`                          |
| Feature UI component                      | `components/features/{admin\|public-site}/{feature}/` |
| Shared UI primitive                       | `components/ui/` (via shadcn CLI)                     |
| Layout component                          | `components/layout/`                                  |
| Loading skeleton                          | `components/skeletons/`                               |
| Error boundary                            | `components/error-boundaries/`                        |
| Database query                            | `lib/dal/{feature}.ts`                                |
| Zod validation schema                     | `lib/schemas/{feature}.ts`                            |
| Reusable server action logic              | `lib/actions/{feature}-actions.ts`                    |
| Client-side hook                          | `lib/hooks/use-{name}.ts`                             |
| Pure utility function                     | `lib/utils/{name}.ts`                                 |
| Table column definitions                  | `lib/tables/{feature}-table-helpers.ts`               |
| Type definitions (shared)                 | `lib/types/{name}.ts`                                 |
| Database schema (new table/function/RLS)  | `supabase/schemas/{NN}_{name}.sql`                    |
| Database migration (hotfix only)          | `supabase/migrations/{timestamp}_{name}.sql`          |
| Email template                            | `emails/{template-name}.tsx`                          |
| Maintenance/test script                   | `scripts/{verb}-{noun}.ts`                            |
| E2E test                                  | `e2e-tests/{feature}.spec.ts`                         |
| Unit test                                 | `__tests__/{module}/{name}.test.ts`                   |
| CI/CD workflow                            | `.github/workflows/{name}.yml`                        |
| AI coding instructions                    | `.github/instructions/{name}.instructions.md`         |
| Architecture documentation                | `memory-bank/architecture/`                           |
| Task tracking                             | `memory-bank/tasks/`                                  |

### 4.2 Colocated vs Centralized

| Strategy         | What                          | Where                                        |
| ---------------- | ----------------------------- | -------------------------------------------- |
| **Colocated**    | Server Actions (admin CRUD)   | `app/(admin)/admin/{feature}/actions.ts`     |
| **Colocated**    | Feature types + props         | `components/features/{feature}/types.ts`     |
| **Colocated**    | Feature constants             | `components/features/{feature}/constants.ts` |
| **Colocated**    | Loading skeletons             | `app/{route}/loading.tsx` or `components/skeletons/` |
| **Centralized**  | DAL modules                   | `lib/dal/`                                   |
| **Centralized**  | Zod schemas                   | `lib/schemas/`                               |
| **Centralized**  | React hooks                   | `lib/hooks/`                                 |
| **Centralized**  | Utility functions             | `lib/utils/`                                 |
| **Centralized**  | Auth guards                   | `lib/auth/`                                  |
| **Centralized**  | Email service                 | `lib/email/`                                 |

---

## 5. Naming and Organization Conventions

### 5.1 File Naming

| Context                   | Convention         | Examples                                       |
| ------------------------- | ------------------ | ---------------------------------------------- |
| React components          | `PascalCase.tsx`   | `TeamMemberCard.tsx`, `HeroContainer.tsx`      |
| React hooks               | `use-kebab.ts`     | `use-debounce.ts`, `use-mobile.ts`             |
| DAL modules               | `kebab-case.ts`    | `admin-partners.ts`, `home-hero.ts`            |
| Schemas                   | `kebab-case.ts`    | `press-article.ts`, `admin-agenda-ui.ts`       |
| Server action files       | `kebab-case.ts`    | `media-actions.ts`, `site-config-actions.ts`   |
| Utility functions         | `kebab-case.ts`    | `mime-verify.ts`, `rate-limit.ts`              |
| Route pages               | `page.tsx`         | Next.js convention                             |
| Route layouts             | `layout.tsx`       | Next.js convention                             |
| Route loading             | `loading.tsx`      | Next.js convention                             |
| Route error               | `error.tsx`        | Next.js convention                             |
| SQL schemas               | `NN_snake_case.sql`| `03_table_medias.sql`, `10b_tables_user_management.sql` |
| Scripts                   | `kebab-case.ts`    | `check-rls-policies.ts`, `backup-database.ts`  |
| Email templates           | `kebab-case.tsx`   | `newsletter-confirmation.tsx`                  |
| Skeleton components       | `PascalCase.tsx` or `kebab-case.tsx` | `AdminTeamSkeleton.tsx`, `hero-skeleton.tsx` |
| shadcn/ui components      | `kebab-case.tsx`   | `button.tsx`, `alert-dialog.tsx`               |
| CI/CD workflows           | `kebab-case.yml`   | `backup-database.yml`, `deploy.yml`            |

### 5.2 Directory Naming

| Context            | Convention     | Examples                           |
| ------------------ | -------------- | ---------------------------------- |
| Route groups       | `(name)`       | `(admin)`, `(marketing)`           |
| Dynamic segments   | `[param]`      | `[id]`, `[slug]`                   |
| Feature folders    | `kebab-case`   | `audit-logs`, `site-config`        |
| Component folders  | `kebab-case`   | `public-site`, `image-field`       |
| Shared UI          | `PascalCase`   | `LogoCloud`, `LogoCloudModel`      |

### 5.3 Export Conventions

| File Type         | Export Style                                                |
| ----------------- | ----------------------------------------------------------- |
| Components        | Named export: `export function TeamMemberCard() {}`         |
| Hooks             | Named export: `export function useDebounce() {}`            |
| DAL functions     | Named export wrapped in `cache()`: `export const fetch... = cache(async () => ...)` |
| Schemas           | Named export: `export const TeamSchema = z.object({...})`  |
| Types             | Named export: `export type TeamMemberDTO = {...}`           |
| Server Actions    | Named export with `"use server"` directive                  |
| Barrel files      | Re-exports: `export { X } from './X'`                      |

### 5.4 Import Order Convention

```typescript
// 1. Framework/library imports
import { cache } from "react";
import { redirect } from "next/navigation";

// 2. Server-only marker (DAL/actions)
import "server-only";

// 3. Internal library imports (path alias)
import { createClient } from "@/supabase/server";
import { requireBackofficeAccess } from "@/lib/auth/roles";
import { dalSuccess, dalError } from "@/lib/dal/helpers";

// 4. Schema/type imports
import type { TeamMemberDTO } from "@/lib/schemas/team";

// 5. Relative imports
import { TeamMemberCard } from "./TeamMemberCard";
```

---

## 6. Navigation and Development Workflow

### 6.1 Common Development Pathways

**Adding a new admin CRUD feature** (e.g., "sponsors"):

```bash
1. supabase/schemas/XX_table_sponsors.sql     → Define table + RLS
2. lib/schemas/sponsors.ts                     → Zod schemas (Server + UI)
3. lib/dal/admin-sponsors.ts                   → DAL functions (server-only)
4. components/features/admin/sponsors/
   ├── SponsorsContainer.tsx                   → Smart component
   ├── SponsorsList.tsx                        → Dumb list
   ├── SponsorCard.tsx                         → Dumb card
   ├── SponsorForm.tsx                         → Client form
   └── types.ts                                → Props & types
5. app/(admin)/admin/sponsors/
   ├── page.tsx                                → Server page → Container
   ├── loading.tsx                             → Skeleton
   ├── actions.ts                              → Server Actions
   ├── new/page.tsx                            → Create page
   └── [id]/edit/page.tsx                      → Edit page
6. components/skeletons/SponsorsSkeleton.tsx    → Loading UI
7. components/admin/AdminSidebar.tsx            → Add nav entry
```

**Adding a new public page section**:

```bash
1. lib/dal/{section}.ts or lib/dal/home-{section}.ts
2. components/features/public-site/home/{section}/
   ├── {Section}Container.tsx
   ├── {Section}View.tsx
   └── types.ts
3. app/(marketing)/page.tsx or section page     → Import Container
```

**Modifying database schema**:

```bash
1. Edit supabase/schemas/{NN}_{name}.sql        → Change declarative schema
2. pnpm dlx supabase stop                       → Stop local DB
3. pnpm dlx supabase db diff -f {description}   → Generate migration
4. pnpm dlx supabase start                      → Restart & verify
```

### 6.2 Key Development Commands

```bash
# Development
pnpm dev                                    # Dev server (Turbopack)
pnpm build                                  # Production build
pnpm lint                                   # ESLint check

# Database
pnpm dlx supabase start                     # Local Supabase
pnpm dlx supabase stop                      # Stop local Supabase
pnpm dlx supabase db diff -f {name}         # Generate migration
pnpm dlx supabase db push                   # Push to remote

# Testing
pnpm type-check                              # TypeScript strict check
pnpm vitest run __tests__/...                # Unit tests ciblés (image-compress, invitation-url, ...)
pnpm test:dal:permissions                    # DAL permissions integration (Vitest)
pnpm exec playwright test --project=admin    # E2E par projet (admin, editor, public, cross-*)
pnpm exec tsx scripts/test-admin-access.ts   # Security validation
pnpm test:partners                           # Partners DAL tests (6)
pnpm test:audit-logs:dal                     # Audit logs DAL tests
pnpm test:resend                             # Email integration test

# Scripts
pnpm exec tsx scripts/{script}.ts            # Run any utility script
```

### 6.3 Debugging Entry Points

| Issue Type      | Starting Point                                     |
| --------------- | -------------------------------------------------- |
| Auth/RLS        | `/admin/debug-auth` in browser + `scripts/test-admin-access.ts` |
| Database        | `supabase/schemas/` → check schema files           |
| API errors      | `app/api/{feature}/route.ts` → check handler       |
| Component bugs  | `components/features/{zone}/{feature}/` → check Container |
| DAL issues      | `lib/dal/{feature}.ts` → check Supabase queries    |
| Email problems  | `pnpm test:resend` + `scripts/check-email-logs.ts` |
| Display toggles | `scripts/check-display-toggles.ts`                 |

---

## 7. Build and Output Organization

### 7.1 Build Configuration

```bash
next.config.ts
├── Sentry integration (withSentryConfig wrapper)
├── serverExternalPackages: ["sharp"] (binaire natif, jamais bundlé)
├── outputFileTracingIncludes: workaround Sharp 0.35 / @vercel/nft
│   (force le tracing physique de libvips-cpp.so dans node_modules/.pnpm/ —
│    retrait prévu via TASK200 une fois le correctif upstream validé en prod)
├── Server Actions body size: 6 MB
├── Image remotePatterns: hostname Supabase dérivé dynamiquement de
│   NEXT_PUBLIC_SUPABASE_URL + localhost:54321 + unsplash/pexels/...
├── Security headers (CSP avec domaines Vercel Live conditionnels)
├── Source maps upload to Sentry
└── Turbopack (default in dev)
```

### 7.2 Build Output

```bash
.next/                              # Build output (gitignored)
├── cache/                          # Build cache
├── server/                         # Server bundles
└── static/                         # Client bundles + assets
```

### 7.3 Key Configuration Files

| File                     | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `next.config.ts`         | Next.js + Sentry config                          |
| `tsconfig.json`          | TypeScript strict, `@/*` path alias              |
| `tailwind.config.ts`     | TailwindCSS + custom plugins                     |
| `postcss.config.mjs`     | PostCSS (TailwindCSS integration)                |
| `eslint.config.mjs`      | ESLint flat config                               |
| `components.json`        | shadcn/ui registry config                        |
| `proxy.ts`               | Next.js 16 middleware (auth refresh + routing)    |
| `instrumentation.ts`     | Sentry instrumentation                           |
| `sentry.*.config.ts`     | Sentry runtime configs (client, server, edge)    |
| `lib/env.ts`             | T3 Env type-safe environment variables            |

---

## 8. Technology-Specific Patterns

### 8.1 Next.js 16 Patterns

- **Route Groups** separate admin/public layouts: `(admin)/`, `(marketing)/`
- **Middleware** renamed to `proxy.ts` (Next.js 16 convention)
- **Metadata Routes** à la racine : `sitemap.ts`, `robots.ts`, `manifest.ts` (statiques, sans dépendance DB)
- **`force-dynamic` export** required on pages using Supabase SSR cookies
- **Server Actions** with `"use server"` directive (lowercase, always)
- **`useActionState`** (React 19) for form handling, not `startTransition`
- **Streaming** via `<Suspense>` boundaries with dedicated skeleton components

### 8.2 Supabase Integration Patterns

- **4 client factories**: `server.ts` (SSR), `client.ts` (browser), `middleware.ts`, `admin.ts` (service role)
- **getClaims()** for fast auth checks (~2-5ms), `getUser()` only when full profile needed
- **Cookies**: ONLY `getAll`/`setAll` pattern (never `get`/`set`/`remove`)
- **Declarative schemas** in `supabase/schemas/` — migrations auto-generated
- **RLS on all 36 tables** — public read with conditions, backoffice writes via `has_min_role('editor')`, admin-only via `is_admin()`

### 8.3 DAL/Server Action Data Flow

```bash
┌────────────────────────────────────────────────────────────┐
│  Page (Server Component)                                   │
│  └─ await fetchItems()  ←  lib/dal/{feature}.ts (cache())  │
│              │                                             │
│              ▼                                             │
│  Container (Server Component)                              │
│  └─ <View initialItems={data} />                           │
│              │                                             │
│              ▼                                             │
│  View (Client Component)                                   │
│  ├─ useState + useEffect(sync props)                       │
│  ├─ Calls Server Action → router.refresh()                 │
│              │                                             │
│              ▼                                             │
│  Server Action  (app/{feature}/actions.ts)                 │
│  ├─ Zod validation                                         │
│  ├─ await requireBackofficeAccess()                        │
│  ├─ await dalFunction()  ←  lib/dal/{feature}.ts           │
│  ├─ revalidatePath()                                       │
│  └─ return ActionResult (no BigInt!)                        │
└────────────────────────────────────────────────────────────┘
```

### 8.4 BigInt Three-Layer Serialization

| Layer       | ID Type    | Schema                  | Location                   |
| ----------- | ---------- | ----------------------- | -------------------------- |
| UI          | `number`   | `FeatureFormSchema`     | `lib/schemas/{feature}.ts` |
| Transport   | `string`   | ActionResult (no data)  | Server Action → Client     |
| DAL/Server  | `bigint`   | `FeatureInputSchema`    | `lib/dal/{feature}.ts`     |

### 8.5 Display Toggles Architecture

```bash
configurations_site table → lib/dal/site-config.ts → fetchDisplayToggle()
    ↓
Server Component checks toggle → conditional data fetch + conditional render
    ↓
Admin UI at /admin/site-config → Server Action → revalidatePath()
```

9 toggles across 4 categories: `home_display` (5, hero toggle supprimé en TASK089), `presse_display` (2), `agenda_display` (1), `contact_display` (1).

---

## 9. Extension and Evolution

### 9.1 Adding a New Admin Feature

Follow the established pattern for CRUD admin features:

1. **Database**: Add schema file `supabase/schemas/{NN}_table_{feature}.sql`
2. **Schema**: Add `lib/schemas/{feature}.ts` (Server + UI variants)
3. **DAL**: Add `lib/dal/admin-{feature}.ts` with `cache()` wrapper
4. **Components**: Create `components/features/admin/{feature}/` with Container, List, Card, Form, types.ts
5. **Pages**: Create `app/(admin)/admin/{feature}/` with page.tsx, loading.tsx, actions.ts, new/, [id]/edit/
6. **Skeleton**: Add `components/skeletons/{Feature}Skeleton.tsx`
7. **Navigation**: Update `AdminSidebar.tsx`
8. **Tests**: Add scripts in `scripts/test-{feature}.ts` if needed

### 9.2 Adding a New Public Section

1. **DAL**: Add `lib/dal/{section}.ts` or `lib/dal/home-{section}.ts`
2. **Components**: Create `components/features/public-site/{feature}/` (Container + View + types)
3. **Page**: Import Container in the relevant page file
4. **Toggle** (optional): Add display toggle in `configurations_site`

### 9.3 Adding a New API Endpoint

1. Create `app/api/{feature}/route.ts`
2. Export HTTP verb handlers (`GET`, `POST`, etc.)
3. Add Zod validation, auth checks, rate limiting as needed
4. For admin endpoints: `app/api/admin/{feature}/route.ts`

### 9.4 Folder Growth Rules

- **Max 10 files per feature folder** — split into sub-folders (e.g., `media/details/`, `media/hooks/`)
- **Max 300 lines per file** — split into sub-components (`FormFields.tsx`, `FormImageSection.tsx`)
- **Barrel exports** (`index.ts`) when a folder has 4+ public exports

---

## 10. Structure Templates

### 10.1 New Admin Feature Template

```bash
# Create all directories and starter files
app/(admin)/admin/{feature}/
├── page.tsx                    # export const dynamic = 'force-dynamic'
├── loading.tsx                 # <{Feature}Skeleton />
├── actions.ts                  # "use server" + Server Actions
├── new/
│   ├── page.tsx
│   └── loading.tsx
└── [id]/
    └── edit/
        ├── page.tsx
        └── loading.tsx

components/features/admin/{feature}/
├── {Feature}Container.tsx      # Server Component (Smart)
├── {Feature}List.tsx           # Client Component (Dumb)
├── {Feature}Card.tsx           # Client Component (Dumb)
├── {Feature}Form.tsx           # Client Component (Form)
└── types.ts                    # Props + feature types

lib/dal/admin-{feature}.ts      # DAL with cache()
lib/schemas/{feature}.ts        # Zod (Server + UI schemas + DTOs)
components/skeletons/{Feature}Skeleton.tsx
```

### 10.2 New Public Section Template

```bash
components/features/public-site/{section}/
├── {Section}Container.tsx      # Server Component → DAL call
├── {Section}View.tsx           # Client Component → display
└── types.ts                    # Section types

lib/dal/{section}.ts            # Public DAL with cache()
```

### 10.3 New DAL Module Template

```typescript
// lib/dal/{feature}.ts
"use server";
import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireBackofficeAccess } from "@/lib/auth/roles";
import { dalSuccess, dalError, type DALResult } from "@/lib/dal/helpers";
import type { FeatureDTO } from "@/lib/schemas/{feature}";

export const fetchFeatures = cache(
  async (): Promise<DALResult<FeatureDTO[]>> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("features")
      .select("id, name, active")
      .eq("active", true);

    if (error) return dalError(error.message);
    return dalSuccess(data ?? []);
  }
);
```

### 10.4 New Server Action Template

```typescript
// app/(admin)/admin/{feature}/actions.ts
"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { requireBackofficeAccess } from "@/lib/auth/roles";
import { FeatureInputSchema } from "@/lib/schemas/{feature}";
import { createFeature } from "@/lib/dal/admin-{feature}";
import type { ActionResult } from "@/lib/actions/types";

export async function createFeatureAction(
  input: unknown
): Promise<ActionResult> {
  await requireBackofficeAccess();
  const validated = FeatureInputSchema.parse(input);
  const result = await createFeature(validated);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/admin/{feature}");
  return { success: true };
}
```

### 10.5 New SQL Schema Template

```sql
-- supabase/schemas/XX_table_{feature}.sql

-- {Feature} table for storing {description}
create table if not exists public.{feature} (
  id bigint generated always as identity primary key,
  name text not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.{feature} is '{Description of the table purpose}';

-- Enable RLS
alter table public.{feature} enable row level security;

-- RLS: Public read access (active only)
create policy "Anyone can view active {feature}"
on public.{feature} for select
to anon, authenticated
using (active = true);

-- RLS: Admin full access
create policy "Admins can manage {feature}"
on public.{feature} for all
to authenticated
using ((select public.has_min_role('editor')))
with check ((select public.has_min_role('editor')));

-- Auto-update timestamps
create trigger {feature}_updated_at
before update on public.{feature}
for each row
execute function public.update_updated_at();
```

---

## 11. Structure Enforcement

### 11.1 Automated Checks

- **ESLint**: `pnpm lint` enforces code style and import rules
- **TypeScript strict mode**: Catches type errors at build time
- **T3 Env validation**: Build-time check for missing environment variables
- **Supabase diff**: Schema changes detected via `supabase db diff`

### 11.2 Naming Convention Rules

| Rule                                                    | Enforcement      |
| ------------------------------------------------------- | ---------------- |
| Components use PascalCase                               | Code review / AI |
| Routes use kebab-case                                   | Next.js convention |
| DAL files prefixed with `admin-` for admin modules      | Convention       |
| SQL schemas prefixed with numeric order (`01_`–`99_`)   | Convention       |
| Server-only files include `"use server"` + `import "server-only"` | Code review |
| All tables have RLS enabled                             | `check-rls-policies.ts` |

### 11.3 Anti-Patterns to Avoid

| Anti-Pattern                                         | Correct Approach                                    |
| ---------------------------------------------------- | --------------------------------------------------- |
| Importing DAL in Client Components                   | DAL is server-only — use Server Actions as bridge   |
| `revalidatePath()` in DAL modules                    | Only in Server Actions                              |
| `process.env` direct access                          | Use `env` from `lib/env.ts` (T3 Env)                |
| Returning BigInt in ActionResult                     | Return `{ success: true }` only, refresh via router |
| `getUser()` for simple auth checks                   | Use `getClaims()` (~2-5ms vs ~300ms)                |
| Cookie `get`/`set`/`remove` methods                  | Only `getAll`/`setAll`                              |
| `revalidatePath()` inside API Routes                 | Use Server Actions for mutations                    |
| `next/dynamic` with `{ ssr: false }` in Server Components | Use direct Client Component imports            |
| `any` type in TypeScript                             | Use `unknown` + Zod validation                      |
| Editing `supabase/migrations/` directly              | Edit `supabase/schemas/` and generate via diff      |

### 11.4 File Count Limits

| Directory Level               | Max Items | Action if exceeded                    |
| ----------------------------- | --------- | ------------------------------------- |
| Feature component folder      | 10 files  | Create sub-folders                    |
| Single source file            | 300 lines | Split into sub-components             |
| Function                      | 30 lines  | Extract helper functions              |
| Function parameters           | 5 params  | Use options object                    |
| `lib/dal/` root               | ~40 files | Already at limit — consider grouping  |

---

## Appendix: File Count Summary

| Directory                      | Files | Description                          |
| ------------------------------ | ----- | ------------------------------------ |
| `app/`                         | 125   | Routes, layouts, pages, actions, API |
| `components/`                  | 352   | UI components (all tiers)            |
| `components/features/`         | 262   | Feature-scoped components            |
| `components/ui/`               | 33    | shadcn/ui primitives                 |
| `components/skeletons/`        | 21    | Loading placeholders                 |
| `lib/`                         | 138   | Core library modules                 |
| `lib/dal/`                     | 48    | Data Access Layer                    |
| `lib/schemas/`                 | 26    | Zod validation schemas               |
| `lib/actions/`                 | 13    | Server action utilities              |
| `lib/hooks/`                   | 13    | Client React hooks                   |
| `lib/utils/`                   | 14    | Utility functions                    |
| `supabase/schemas/`            | 48    | Declarative SQL schemas              |
| `supabase/migrations/`         | 165   | Database migrations                  |
| `scripts/`                     | 117   | Maintenance & testing scripts        |
| `e2e/`                         | 112   | Playwright E2E (POM,factories, specs)|
| `emails/`                      | 5     | Email templates                      |
| `.github/workflows/`           | 10    | CI/CD pipelines                      |
| **Total source files**         | ~1 690|                                      |
