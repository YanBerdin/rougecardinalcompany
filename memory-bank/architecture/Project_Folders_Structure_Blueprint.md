# Project Folders Structure Blueprint

**Last Updated**: 8 octobre 2025  
**Version**: 2.0.0 (avec intégration Resend)  
**Branch**: feat-resend

> ⚠️ **IMPORTANT - Mise à Jour Majeure**
> 
> Ce document a été mis à jour pour refléter :
> - ✅ **Intégration Resend** : Architecture email complète (templates, actions, API)
> - ✅ **Supabase Auth 2025** : Patterns modernes avec `@supabase/ssr` et `getClaims()`
> - ✅ **Scripts de Test** : Infrastructure de test pour emails et webhooks
> - ✅ **Types Email** : Types TypeScript dédiés pour l'email service
> - ✅ **Documentation Email** : `Email_Service_Architecture.md` et `TESTING_RESEND.md`

## 1. Initial Auto-detection Phase

### 1.1 Project Type Detection

- **Detected project type:** Next.js 15.4.5 (React 19, TypeScript 5, App Router)
- **Monorepo:** No (single-app structure)
- **Frontend:** Yes (Next.js/React with Server Components)
- **Backend:** Supabase BaaS (PostgreSQL + Auth + Storage)
- **Email Service:** Resend (transactional emails with React Email templates)
- **Microservices:** No (monolithic with external services)

### 1.2 Technology Signatures Found

```yaml
Core Framework:
  - next.config.ts, package.json (Next.js 15.4.5, React 19)
  - tsconfig.json (TypeScript 5 avec strict mode)
  - app/ (App Router architecture)

Backend & Data:
  - supabase/ (Supabase integration avec schemas et migrations)
  - lib/dal/ (Data Access Layer server-side)
  - types/database.types.ts (Supabase generated types)

Email Infrastructure:
  - lib/resend.ts (Resend client configuration)
  - emails/ (React Email templates)
  - lib/email/ (Email actions et schemas)
  - types/email.d.ts (Email-specific types)

Styling & UI:
  - tailwind.config.ts, postcss.config.mjs (Tailwind CSS 3.4)
  - components/ui/ (shadcn/ui components)
  - app/globals.css (Global styles)

Testing & Scripts:
  - scripts/ (Email integration, logs, webhooks testing)
  - TESTING_RESEND.md (Email testing documentation)

Documentation:
  - memory-bank/ (Architecture, epics, tasks, context)
  - doc/, doc-perso/ (Project-specific documentation)
  - prompts-github/ (AI prompt templates)

## 2. Structural Overview

### 2.1 Organizational Principles

**Architecture Pattern**: Feature-Based avec Container/View (Smart/Dumb) Pattern

#### Core Principles

1. **Separation of Concerns**
   - Features isolées avec structure complète (Container, View, types, hooks)
   - UI components partagés découplés des features
   - DAL (Data Access Layer) server-side pour accès données
   - Email service isolé avec templates React Email

2. **Server/Client Component Strategy**
   - **Server Components** par défaut pour SSR et SEO
   - **Client Components** uniquement pour interactivité
   - Pattern `"use client"` explicite quand nécessaire
   - Hooks personnalisés pour logique client réutilisable

3. **Data Access Pattern**
   - DAL server-only sous `lib/dal/*` avec `"use server"`
   - Pas de hooks client pour data fetching (utiliser Server Components)
   - Supabase client server-side via `@supabase/ssr`
   - Email actions server-side via `lib/email/actions.ts`

4. **Type Safety**
   - Types Supabase générés automatiquement (`types/database.types.ts`)
   - Validation runtime avec Zod (`lib/email/schemas.ts`)
   - Types email dédiés (`types/email.d.ts`)
   - Types feature-specific dans chaque dossier

### 2.2 Repeating Patterns

```typescript
// Pattern Structure de Feature
components/features/[domain]/[feature]/
├── [Feature]Container.tsx      // Server Component (async, data fetching)
├── [Feature]View.tsx           // Client Component (presentation)
├── hooks.ts                    // Custom hooks (client-side logic)
├── types.ts                    // Feature-specific types
└── index.ts                    // Public exports

// Pattern Email Architecture
emails/
├── [template-name].tsx         // React Email template
└── utils/
    ├── email-layout.tsx        // Shared layout
    └── components.utils.tsx    // Reusable components

// Pattern Data Access Layer
lib/dal/
├── [entity].ts                 // "use server" data access
└── [feature]-[sub-entity].ts   // Related data operations

// Pattern API Routes
app/api/[resource]/
└── route.ts                    // Next.js 15 route handler
```

### 2.3 Architecture Rationale

- **Testability**: Components isolés testables indépendamment
- **Maintainability**: Structure claire et prévisible
- **Scalability**: Ajout de features sans toucher au code existant
- **Performance**: Server Components pour initial load, Client Components pour interactivité
- **Consistency**: Patterns répétables à travers tout le projet

---

## 3. Directory Visualization (Complete Structure)

```bash
rougecardinalcompany/
│
├── 📁 app/                                    # Next.js 15 App Router
│   ├── 📁 api/                                # ✨ NEW: API Routes
│   │   ├── 📁 newsletter/                     # Newsletter subscription endpoint
│   │   │   └── route.ts                       # POST /api/newsletter
│   │   ├── 📁 contact/                        # Contact form endpoint
│   │   │   └── route.ts                       # POST /api/contact
│   │   ├── 📁 test-email/                     # Email testing endpoint (dev)
│   │   │   └── route.ts                       # POST/GET /api/test-email
│   │   └── 📁 webhooks/                       # Webhook handlers
│   │       └── 📁 resend/                     # Resend webhook handler
│   │           └── route.ts                   # POST /api/webhooks/resend
│   │
│   ├── 📁 auth/                               # Authentication flows
│   │   ├── 📁 callback/                       # ✨ NEW: OAuth callback
│   │   │   └── route.ts                       # Auth callback handler
│   │   ├── 📁 login/                          # Login page
│   │   │   └── page.tsx
│   │   ├── 📁 sign-up/                        # Sign-up page
│   │   │   └── page.tsx
│   │   ├── 📁 sign-up-success/                # Post-signup page
│   │   │   └── page.tsx
│   │   ├── 📁 forgot-password/                # Password reset
│   │   │   └── page.tsx
│   │   ├── 📁 update-password/                # Password update
│   │   │   └── page.tsx
│   │   ├── 📁 error/                          # Auth error page
│   │   │   └── page.tsx
│   │   └── 📁 confirm/                        # Email confirmation
│   │       └── route.ts
│   │
│   ├── 📁 protected/                          # Protected routes (auth required)
│   │   ├── layout.tsx                         # Protected layout with auth check
│   │   └── page.tsx                           # Protected dashboard
│   │
│   ├── 📁 agenda/                             # Events calendar page
│   │   └── page.tsx
│   ├── 📁 compagnie/                          # Company presentation page
│   │   └── page.tsx
│   ├── 📁 spectacles/                         # Shows listing page
│   │   └── page.tsx
│   ├── 📁 presse/                             # Press space (articles, releases)
│   │   ├── page.tsx
│   │   └── metadata.ts
│   ├── 📁 contact/                            # Contact page
│   │   └── page.tsx
│   ├── 📁 test-connection/                    # Supabase connection test (dev)
│   │   └── page.tsx
│   │
│   ├── page.tsx                               # Homepage
│   ├── layout.tsx                             # Root layout
│   ├── globals.css                            # Global styles
│   ├── favicon.ico                            # Favicon
│   ├── opengraph-image.png                    # OG image
│   └── twitter-image.png                      # Twitter card image
│
├── 📁 components/                             # React Components
│   ├── 📁 auth/                               # ✨ NEW: Auth components
│   │   └── protected-route.tsx                # Protected route wrapper
│   │
│   ├── 📁 features/                           # Feature-based components
│   │   └── 📁 public-site/                    # Public website features
│   │       ├── 📁 home/                       # Homepage sections
│   │       │   ├── 📁 hero/                   # Hero carousel
│   │       │   │   ├── HeroContainer.tsx      # Server: data fetching
│   │       │   │   ├── HeroClient.tsx         # Client: carousel logic
│   │       │   │   ├── HeroView.tsx           # View: presentation
│   │       │   │   ├── hooks.ts               # Custom hooks
│   │       │   │   ├── types.ts               # Types
│   │       │   │   └── index.ts               # Exports
│   │       │   ├── 📁 about/                  # About section
│   │       │   │   ├── AboutContainer.tsx
│   │       │   │   ├── AboutView.tsx
│   │       │   │   ├── hooks.ts
│   │       │   │   ├── types.ts
│   │       │   │   └── index.ts
│   │       │   ├── 📁 news/                   # News/press releases
│   │       │   │   ├── NewsContainer.tsx
│   │       │   │   ├── NewsView.tsx
│   │       │   │   ├── hooks.ts
│   │       │   │   ├── types.ts
│   │       │   │   └── index.ts
│   │       │   ├── 📁 shows/                  # Featured shows
│   │       │   │   ├── ShowsContainer.tsx
│   │       │   │   ├── ShowsView.tsx
│   │       │   │   ├── hooks.ts
│   │       │   │   ├── types.ts
│   │       │   │   └── index.ts
│   │       │   ├── 📁 newsletter/             # Newsletter subscription
│   │       │   │   ├── NewsletterContainer.tsx
│   │       │   │   ├── NewsletterClientContainer.tsx
│   │       │   │   ├── NewsletterView.tsx
│   │       │   │   ├── hooks.ts
│   │       │   │   ├── types.ts
│   │       │   │   └── index.ts
│   │       │   ├── 📁 partners/               # Partners carousel
│   │       │   │   ├── PartnersContainer.tsx
│   │       │   │   ├── PartnersView.tsx
│   │       │   │   ├── hooks.ts
│   │       │   │   ├── types.ts
│   │       │   │   └── index.ts
│   │       │   ├── types.ts                   # Home page types
│   │       │   └── index.ts
│   │       │
│   │       ├── 📁 compagnie/                  # Company page feature
│   │       │   ├── 📁 data/
│   │       │   │   └── presentation.ts        # Static presentation data
│   │       │   ├── CompagnieContainer.tsx
│   │       │   ├── CompagnieView.tsx
│   │       │   ├── hooks.ts
│   │       │   ├── types.ts
│   │       │   └── index.ts
│   │       │
│   │       ├── 📁 spectacles/                 # Shows page feature
│   │       │   ├── SpectaclesContainer.tsx
│   │       │   ├── SpectaclesView.tsx
│   │       │   ├── hooks.ts
│   │       │   ├── types.ts
│   │       │   └── index.ts
│   │       │
│   │       ├── 📁 agenda/                     # Calendar page feature
│   │       │   ├── AgendaContainer.tsx
│   │       │   ├── AgendaClientContainer.tsx
│   │       │   ├── AgendaView.tsx
│   │       │   ├── hooks.ts
│   │       │   ├── types.ts
│   │       │   └── index.ts
│   │       │
│   │       ├── 📁 presse/                     # Press page feature
│   │       │   ├── PresseContainer.tsx
│   │       │   ├── PresseServerGate.tsx
│   │       │   ├── PresseView.tsx
│   │       │   ├── hooks.ts
│   │       │   └── types.ts
│   │       │
│   │       └── 📁 contact/                    # Contact page feature
│   │           ├── ContactPageContainer.tsx
│   │           ├── ContactPageView.tsx
│   │           ├── ContactServerGate.tsx
│   │           ├── actions.ts                 # Contact form actions
│   │           ├── contact-hooks.ts           # useContactForm hook
│   │           └── contact-types.ts
│   │
│   ├── 📁 layout/                             # Layout components
│   │   ├── header.tsx                         # Site header
│   │   └── footer.tsx                         # Site footer
│   │
│   ├── 📁 skeletons/                          # Loading skeletons
│   │   ├── hero-skeleton.tsx
│   │   ├── about-skeleton.tsx
│   │   ├── news-skeleton.tsx
│   │   ├── shows-skeleton.tsx
│   │   ├── newsletter-skeleton.tsx
│   │   ├── partners-skeleton.tsx
│   │   ├── compagnie-skeleton.tsx
│   │   ├── spectacles-skeleton.tsx
│   │   ├── agenda-skeleton.tsx
│   │   ├── presse-skeleton.tsx
│   │   └── contact-skeleton.tsx
│   │
│   ├── 📁 tutorial/                           # Tutorial components (onboarding)
│   │   └── tutorial-step.tsx
│   │
│   ├── 📁 ui/                                 # shadcn/ui components
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   │
│   ├── auth-button.tsx                        # Auth button (login/user menu)
│   ├── logout-button.tsx                      # Logout button
│   ├── login-form.tsx                         # Login form
│   ├── sign-up-form.tsx                       # Sign-up form
│   ├── forgot-password-form.tsx               # Password reset form
│   ├── update-password-form.tsx               # Password update form
│   ├── env-var-warning.tsx                    # Env variable warning
│   ├── deploy-button.tsx                      # Deploy button
│   └── theme-switcher.tsx                     # Dark/light mode switcher
│
├── 📁 emails/                                 # ✨ NEW: React Email templates
│   ├── 📁 utils/
│   │   ├── email-layout.tsx                   # Shared email layout
│   │   └── components.utils.tsx               # Email utility components
│   ├── newsletter-confirmation.tsx            # Newsletter subscription email
│   └── contact-message-notification.tsx       # Contact form notification
│
├── 📁 lib/                                    # Core library code
│   ├── 📁 auth/                               # ✨ NEW: Auth services
│   │   └── service.ts                         # Auth business logic
│   │
│   ├── 📁 dal/                                # Data Access Layer (server-only)
│   │   ├── home-hero.ts                       # Home hero slides
│   │   ├── home-about.ts                      # Home about section
│   │   ├── home-news.ts                       # Home news section
│   │   ├── home-shows.ts                      # Home shows section
│   │   ├── home-newsletter.ts                 # Newsletter settings
│   │   ├── home-partners.ts                   # Partners data
│   │   ├── compagnie.ts                       # Company values + team
│   │   ├── compagnie-presentation.ts          # Company presentation sections
│   │   ├── spectacles.ts                      # Shows listing
│   │   ├── agenda.ts                          # Events calendar
│   │   ├── presse.ts                          # Press articles + releases
│   │   └── contact.ts                         # Contact messages
│   │
│   ├── 📁 email/                              # ✨ NEW: Email service
│   │   ├── actions.ts                         # "use server" email actions
│   │   └── schemas.ts                         # Zod validation schemas
│   │
│   ├── 📁 hooks/                              # ✨ NEW: Custom client hooks
│   │   ├── useAuth.ts                         # Auth hook
│   │   ├── useNewsletterSubscribe.ts          # Newsletter subscription hook
│   │   └── useContactForm.ts                  # Contact form hook
│   │
│   ├── 📁 plugins/                            # Custom plugins
│   │   └── touch-hitbox-plugin.js             # Touch hitbox plugin (carousel)
│   │
│   ├── 📁 supabase/                           # Supabase integration (deprecated structure)
│   │   ├── 📁 schemas/                        # SQL schema files
│   │   │   ├── 01_extensions.sql
│   │   │   ├── 02_table_profiles.sql
│   │   │   ├── 02b_functions_core.sql
│   │   │   ├── 03_table_medias.sql
│   │   │   ├── 04_table_membres_equipe.sql
│   │   │   ├── 05_table_lieux.sql
│   │   │   ├── 06_table_spectacles.sql
│   │   │   ├── 07_table_evenements.sql
│   │   │   ├── 07b_table_compagnie_content.sql
│   │   │   ├── 07c_table_compagnie_presentation.sql
│   │   │   ├── 07d_table_home_hero.sql
│   │   │   ├── 07e_table_home_about.sql
│   │   │   ├── 08_table_articles_presse.sql
│   │   │   ├── 08b_communiques_presse.sql
│   │   │   ├── 09_table_partners.sql
│   │   │   ├── 10_tables_system.sql
│   │   │   ├── 11_tables_relations.sql
│   │   │   ├── 12_evenements_recurrence.sql
│   │   │   ├── 13_analytics_events.sql
│   │   │   ├── 14_categories_tags.sql
│   │   │   ├── 15_content_versioning.sql
│   │   │   ├── 16_seo_metadata.sql
│   │   │   ├── 20_functions_core.sql
│   │   │   ├── 21_functions_auth_sync.sql
│   │   │   ├── 30_triggers.sql
│   │   │   ├── 40_indexes.sql
│   │   │   ├── 41_views_admin_content_versions.sql
│   │   │   ├── 41_views_communiques.sql
│   │   │   ├── 50_constraints.sql
│   │   │   ├── 60_rls_profiles.sql
│   │   │   ├── 61_rls_main_tables.sql
│   │   │   ├── 62_rls_advanced_tables.sql
│   │   │   └── README.md
│   │   ├── client.ts                          # Browser Supabase client
│   │   ├── server.ts                          # Server Supabase client
│   │   └── middleware.ts                      # Auth middleware
│   │
│   ├── resend.ts                              # ✨ NEW: Resend client config
│   ├── site-config.ts                         # ✨ NEW: Site configuration
│   └── utils.ts                               # Shared utilities
│
├── 📁 supabase/                               # Supabase project root
│   ├── 📁 .branches/                          # Branch management
│   │   └── _current_branch
│   ├── 📁 migrations/                         # Database migrations (seeds)
│   │   ├── 20250918000000_fix_spectacles_versioning_trigger.sql
│   │   ├── 20250918031500_seed_home_hero_slides.sql
│   │   ├── 20250918094530_seed_core_content.sql
│   │   ├── 20250918095610_seed_compagnie_values.sql
│   │   ├── 20250918101020_seed_events_press_articles.sql
│   │   ├── 20250918102240_seed_team_and_presentation.sql
│   │   ├── 20250921110000_seed_compagnie_presentation_sections.sql
│   │   ├── 20250921112900_add_home_about_content.sql
│   │   ├── 20250921113000_seed_home_about_content.sql
│   │   ├── 20250926153000_seed_spectacles.sql
│   │   ├── 20250930120000_seed_lieux.sql
│   │   ├── 20250930121000_seed_categories_tags.sql
│   │   ├── 20250930122000_seed_configurations_site.sql
│   │   ├── 20251002120000_seed_communiques_presse_et_media_kit.sql
│   │   ├── sync_existing_profiles.sql
│   │   └── migrations.md
│   ├── 📁 schemas/                            # ⚠️ DEPRECATED: Use migrations/
│   ├── client.ts                              # Browser client
│   ├── server.ts                              # Server client
│   └── middleware.ts                          # Auth middleware
│
├── 📁 types/                                  # ✨ NEW: TypeScript types
│   ├── database.types.ts                      # Supabase generated types
│   └── email.d.ts                             # Email-specific types
│
├── 📁 scripts/                                # ✨ NEW: Testing scripts
│   ├── test-email-integration.ts              # Email integration test
│   ├── check-email-logs.ts                    # Database logs checker
│   └── test-webhooks.ts                       # Webhook configuration test
│
├── 📁 memory-bank/                            # Project documentation
│   ├── 📁 architecture/
│   │   ├── File-Tree.md                       # Project file tree
│   │   ├── Project_Architecture_Blueprint.md  # Architecture documentation
│   │   ├── Project_Folders_Structure_Blueprint.md  # This document
│   │   └── Email_Service_Architecture.md      # ✨ NEW: Email architecture
│   ├── 📁 epics/
│   │   ├── epics-map.yaml                     # Epic mapping
│   │   └── 📁 details/                        # Epic details
│   ├── 📁 tasks/
│   │   ├── _index.md                          # Task index
│   │   └── TASK*.md                           # Individual tasks
│   ├── activeContext.md                       # Current work context
│   ├── productContext.md                      # Product context
│   ├── progress.md                            # Project progress
│   ├── projectbrief.md                        # Project brief
│   ├── systemPatterns.md                      # System patterns
│   └── techContext.md                         # Technical context
│
├── 📁 doc/                                    # Project documentation
├── 📁 doc-perso/                              # Personal documentation
├── 📁 prompts-github/                         # AI prompt templates
├── 📁 public/                                 # Public assets
│   └── logo-florian.png
│
├── 📁 .github/                                # GitHub configuration
│   ├── 📁 copilot/                            # Copilot configuration
│   ├── 📁 instructions/                       # AI instructions
│   │   ├── copilot-instructions.md            # ✨ NEW: Main instructions
│   │   ├── nextjs-supabase-auth-2025.instructions.md  # Auth best practices
│   │   ├── resend_supabase_integration.md     # ✨ NEW: Resend integration
│   │   └── ...
│   └── 📁 workflows/                          # GitHub Actions
│
├── 📁 .vscode/                                # VS Code configuration
│   └── mcp.json                               # MCP server configuration
│
├── middleware.ts                              # Next.js middleware (auth)
├── next.config.ts                             # Next.js configuration
├── tsconfig.json                              # TypeScript configuration
├── tailwind.config.ts                         # Tailwind CSS configuration
├── postcss.config.mjs                         # PostCSS configuration
├── eslint.config.mjs                          # ESLint configuration
├── components.json                            # shadcn/ui configuration
├── package.json                               # NPM dependencies
├── pnpm-lock.yaml                             # pnpm lockfile
├── .env.local                                 # Environment variables (local)
├── .env.example                               # Environment variables template
├── README.md                                  # Project README
├── TESTING_RESEND.md                          # ✨ NEW: Resend testing guide
└── test-email-simple.js                       # ✨ NEW: Simple email test
│   │   ├── client.ts      # Client Supabase
│   │   ├── middleware.ts  # Middleware Supabase
│   │   └──  server.ts     # Serveur Supabase
│   └── utils.ts 
├── memory-bank/           # Documentation structurée
│   ├── architecture/
│   ├── epics/
│   └── tasks/
├── doc/
├── public/
├── prompts-github/
└── [config-files]
```

---

## 4. Key Directory Analysis

- **app/**: Next.js App Router, route-based structure. Each subfolder = route. `page.tsx` = page component, `layout.tsx` = shared layout. Client/server split via "use client".
  - **admin/** : Interface d’administration (gestion du contenu, accès restreint)
  - **agenda/** : Page agenda/calendrier des événements
  - **contact/** : Page de contact (formulaire, infos)
  - **presse/** : Espace presse (articles, communiqués)
  - **spectacles/** : Page dédiée aux spectacles (listing, détails)
  - **test-connection/** : Page de test de connexion (vérification Supabase/API)
- **components/features/**: Feature-based, chaque fonctionnalité/section a son dossier avec Container/View, hooks, types, index. Smart/Dumb appliqué; lecture via DAL côté serveur.
- **components/ui/**: Shared UI components (atomic/molecular), no business logic, reusable across features.
- **lib/**: Utilities and integrations (Supabase config, global utils).
  - `lib/dal/*`: modules server‑only pour l'accès aux données (Next.js Server Components). Exemples: `compagnie.ts`, `compagnie-presentation.ts` (incluant fallback automatique).
    - Nouveaux: `contact.ts` (insert contrôlé avec Zod + Server Action), `presse.ts` (lectures `articles_presse`/`communiques_presse` + vue kit média)
  - `lib/hooks/*`: hooks partagés côté client (ex: `useNewsletterSubscribe.ts`). Éviter les hooks pour la lecture publique; préférer DAL.
- **memory-bank/**: Structured documentation (architecture, epics, tasks, context, rationale).
- **doc/**: Technical documentation (API, architecture, etc).
- **public/**: Static assets (images, icons, etc).
- **prompts-github/**: Copilot prompt blueprints for automation.

---

## 5. File Placement Patterns

- **Smart Components (Container):** `components/features/{feature}/{section}/{Section}Container.tsx` (logic, state, data fetching; par défaut Server Component)
- **Dumb Components (View):** `components/features/{feature}/{section}/{Section}View.tsx` (pure UI, props only)
- **Types:** `components/features/{feature}/{section}/types.ts` (TypeScript interfaces/types)
- **Hooks:** `components/features/{feature}/{section}/hooks.ts` (custom hooks for state/data logic)
- **UI Shared:** `components/ui/` (generic, domain-agnostic components)
- **Pages:** `app/{route}/page.tsx` (page assembly, imports Containers)

---

## 6. Naming and Organization Conventions

- **Files:** PascalCase pour composants React, suffixes explicites (`Container`, `View`), fichiers utilitaires en camelCase/kebab-case. Les skeletons suivent le format `{section}-skeleton.tsx`.
- **Folders:** camelCase for features/sections, kebab-case for routes in `app/`.
- **Exports/Imports:** Named exports, re-exports via `index.ts`, absolute imports with `@/` alias.
- **Internal organization:** Features are isolated, horizontal sharing (UI, utils) vs. vertical (features), circular dependencies avoided.

---

## 7. Navigation and Development Workflow

- **Add new feature:**
  1. Create `components/features/public-site/{feature}/`
  2. Add `types.ts`, `hooks.ts`, `{Feature}Container.tsx`, `{Feature}View.tsx`, `index.ts`
  3. Add page in `app/{feature}/page.tsx`
- **Extend feature:**
  1. Add types/hooks as needed
  2. Update Container/View
- **Add shared UI component:**
  1. Create in `components/ui/`
  2. Ensure domain-agnostic
  3. Import in View as needed
- **Add page:**
  1. Create `app/{route}/`
  2. Add `page.tsx`, `layout.tsx` if needed
  3. Import Containers

---

## 8. Build and Output Organization

- **Build config:** `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- **Build commands:** `next dev --turbopack`, `next build`, `next start`, `next lint`
- **Output:** `.next/` (build output, not versioned), `public/` (static assets)
- **Environment:** `.env.local` for env vars, Supabase config per env

---

## 9. Technology-Specific Organization

- **Next.js:** App Router, Server/Client Components, route/layout structure, image/font optimization
- **React:** Hooks, Container/View, Context API
- **TypeScript:** Strict types, per-feature interfaces, import aliases
- **Tailwind CSS:** Utility-first, config in `tailwind.config.ts`, UI built on Tailwind
- **Supabase:** Client/server config in `supabase/`, SQL schemas, auth middleware

---

## 10. Extension and Evolution

- **Extension points:** Add new features/components by following existing patterns (Container/View, types, hooks, index)
- **Scalability:** Fine-grained features, clear isolation, consistent import/export
- **Refactoring:** Features can be moved/renamed without breaking others, design system evolves in `components/ui/`, changes documented in `memory-bank/`

---

## 11. Structure Templates

### New Feature

```bash
components/features/public-site/{feature}/
├── {Feature}Container.tsx
├── {Feature}View.tsx
├── hooks.ts
├── types.ts
└── index.ts
```

### New Home Section

```bash
components/features/public-site/home/{section}/
├── {Section}Container.tsx
├── {Section}View.tsx
├── hooks.ts
├── types.ts
└── index.ts
```

### New Page

```bash
app/{route}/
├── page.tsx
├── layout.tsx
└── client-page.tsx
```

---

## 12. Structure Enforcement

- **Validation:** ESLint for import/export patterns, code review for consistency
- **Documentation:** Architecture blueprints in `memory-bank/architecture/`, technical docs in `doc/`, product context/epics in `memory-bank/`
- **Evolution:** Blueprint updated on every significant change, architectural decisions tracked

---

> This blueprint was generated on August 27, 2025 and reflects the current state of the architecture. Update it after every significant structural change.
