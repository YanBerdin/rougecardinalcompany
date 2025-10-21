# Project Folders Structure Blueprint - v2.0.1

**Last Updated**: 20 octobre 2025  
**Version**: 2.0.1 (Resend + Backoffice Admin updates)  
**Branch**: feat-resend

> ⚠️ **VERSION MISE À JOUR - INTÉGRATION RESEND COMPLÈTE + NETTOYAGE AUTH**
>
> Cette version documente :
>
> - ✅ **Architecture Email** : Resend + React Email (templates, actions, API routes, webhooks)
> - ✅ **Supabase Auth 2025** : Patterns modernes `@supabase/ssr` + `getClaims()` (~2-5ms, 100x plus rapide)
> - ✅ **Nettoyage Auth** : Code redondant supprimé (~400 lignes), 100% template officiel
> - ✅ **Custom Hooks** : useNewsletterSubscribe, useContactForm
> - ✅ **Testing Infrastructure** : Scripts de test email, logs, webhooks
> - ✅ **Type System** : Types email dédiés + database types générés
>
> 🆕 20/10/2025 — Mises à jour additionnelles:
>
> - ✅ **Backoffice Admin (TASK022)** : Blueprint d'architecture pour la gestion d'équipe (Team Management) côté admin
> - ✅ **Sécurité** : Rappel des patterns canoniques Supabase Auth 2025 (middleware + `getClaims()`)
>
> 📖 **Documents Complémentaires** :
>
> - `Email_Service_Architecture.md` : Architecture détaillée du service email
> - `TESTING_RESEND.md` : Guide de test de l'intégration Resend
> - `.github/instructions/resend_supabase_integration.md` : Instructions d'intégration

---

## Table des Matières

1. [Initial Auto-detection Phase](#1-initial-auto-detection-phase)
2. [Structural Overview](#2-structural-overview)
3. [Directory Visualization](#3-directory-visualization)
4. [Key Directory Analysis](#4-key-directory-analysis)
5. [File Placement Patterns](#5-file-placement-patterns)
6. [Naming and Organization Conventions](#6-naming-and-organization-conventions)
7. [Navigation and Development Workflow](#7-navigation-and-development-workflow)
8. [Email Service Integration](#8-email-service-integration)
9. [Extension Templates](#9-extension-templates)
10. [Maintenance](#10-maintenance)

---

## 1. Initial Auto-detection Phase

### 1.1 Project Type Detection

**Primary Technology**: Next.js 15.4.5 (App Router) + TypeScript 5 + React 19

**Architecture Type**:

- **Monolithic Application** (single-app, not monorepo)
- **Feature-Based Organization** avec Container/View pattern
- **BaaS Integration** (Supabase for backend + Resend for emails)

**Key Indicators**:

```yaml
Framework Detection:
  ✓ next.config.ts → Next.js 15.4.5
  ✓ tsconfig.json → TypeScript 5 (strict mode)
  ✓ app/ directory → App Router architecture
  ✓ package.json → React 19, Next 15

Backend Services:
  ✓ supabase/ → Supabase integration (schemas, migrations, clients)
  ✓ lib/dal/ → Data Access Layer (server-only functions)
  ✓ types/database.types.ts → Supabase generated types
  ✓ middleware.ts → Authentication middleware
  ✓ supabase/migrations/20251021000001_create_articles_presse_public_view.sql → Hotfix RLS/JWT
  ✓ supabase/schemas/08_table_articles_presse.sql → Vue publique (source de vérité)

Email Infrastructure:
  ✓ lib/resend.ts → Resend client configuration
  ✓ emails/ → React Email templates
  ✓ lib/email/ → Email actions + Zod schemas
  ✓ app/api/newsletter/ → Newsletter subscription endpoint
  ✓ app/api/contact/ → Contact form endpoint
  ✓ app/api/webhooks/resend/ → Webhook handler
  ✓ types/email.d.ts → Email type definitions

UI Framework:
  ✓ tailwind.config.ts → Tailwind CSS 3.4
  ✓ components/ui/ → shadcn/ui components
  ✓ app/globals.css → Global styles

Testing & Scripts:
  ✓ scripts/test-email-integration.ts → Email testing
  ✓ scripts/check-email-logs.ts → Database logs checker
  ✓ scripts/test-webhooks.ts → Webhook testing
  ✓ TESTING_RESEND.md → Testing documentation

Documentation:
  ✓ memory-bank/ → Architecture + context + tasks
  ✓ doc/ → Documentation projet
  ✓ .github/instructions/ → AI instructions + best practices
  ✓ prompts-github/ → AI prompt templates
```

### 1.2 Detected Patterns

**Smart/Dumb Component Pattern**:

- `[Feature]Container.tsx` → Business logic + data fetching (Server Component)
- `[Feature]View.tsx` → Presentation pure (Client Component si interactif)
- `hooks.ts` → Custom hooks pour logique client réutilisable
- `types.ts` → Types feature-specific

**Server/Client Strategy**:

- Server Components par défaut pour SSR + SEO
- Client Components (`"use client"`) uniquement pour interactivité
- Data Access Layer (DAL) server-only avec `"use server"`
- Email actions server-side uniquement

**Email Architecture Pattern**:

- Templates React Email dans `emails/`
- Actions server-side dans `lib/email/actions.ts`
- API endpoints REST dans `app/api/`
- Validation Zod dans `lib/email/schemas.ts`

---

## 2. Structural Overview

### 2.1 Core Architectural Principles

#### 1. Feature-Based Organization

Chaque feature business est encapsulée dans un dossier dédié contenant :

- Container (logique métier + data fetching)
- View (présentation pure)
- Hooks (logique client réutilisable)
- Types (types feature-specific)

```bash
components/features/public-site/[feature]/
├── [Feature]Container.tsx   # Server Component (async)
├── [Feature]View.tsx         # Client Component (présentation)
├── hooks.ts                  # Custom hooks (client-side)
├── types.ts                  # Feature types
└── index.ts                  # Public exports
```

#### 2. Smart/Dumb (Container/View) Pattern

**Smart Components (Containers)**:

- Responsabilité : Business logic, data fetching, state management
- Type : Server Component par défaut (async functions)
- Pattern : Fetch data → Pass props → Render View

**Dumb Components (Views)**:

- Responsabilité : Presentation pure, UI interactions
- Type : Client Component si interactivité nécessaire
- Pattern : Receive props → Render UI → Emit callbacks

#### 3. Data Access Layer (DAL)

**Server-Only Data Access** (`lib/dal/*.ts`):

- Directive `"use server"` obligatoire
- Isolation de la logique d'accès données
- Utilisation du client Supabase server-side
- Typage fort avec types générés

```typescript
// lib/dal/contact.ts
"use server";
import { createClient } from "@/supabase/server";

export async function createContactMessage(data: ContactMessage) {
  const supabase = await createClient();
  const { error } = await supabase.from("messages_contact").insert(data);
  if (error) throw new Error(error.message);
  return { ok: true };
}
```

#### 4. Email Service Architecture

**Layered Email Architecture**:

- **Template Layer** : React Email components (`emails/`)
- **Action Layer** : Server actions (`lib/email/actions.ts`)
- **API Layer** : REST endpoints (`app/api/`)
- **Validation Layer** : Zod schemas (`lib/email/schemas.ts`)

```mermaid
Email Flow:
User → API Endpoint → Validation (Zod) → Action (Server) → 
  Resend API → Database Log (Supabase) → Template Render → Send
```

#### 5. Type Safety Strategy

- **Supabase Types** : Auto-générés (`types/database.types.ts`)
- **Email Types** : Dédiés (`types/email.d.ts`)
- **Runtime Validation** : Zod schemas (`lib/email/schemas.ts`)
- **Feature Types** : Colocalisés dans chaque feature

### 2.2 Project Organization Rationale

**Scalability**:

- Ajout de nouvelles features sans modifier le code existant
- Structure prévisible et répétable
- Isolation des responsabilités

**Maintainability**:

- Code facile à localiser et à modifier
- Séparation claire entre logique et présentation
- Documentation colocalisée avec le code

**Performance**:

- Server Components pour initial load optimisé
- Client Components uniquement pour interactivité
- Data fetching server-side avec cache Next.js

**Testability**:

- Components isolés testables indépendamment
- Mocking facilité grâce à la séparation
- Test scripts dédiés pour intégrations

---

## 3. Directory Visualization

### 3.1 Complete Project Structure (Depth 4)

```bash
rougecardinalcompany/
│
├── 📁 app/                                    # Next.js 15 App Router
│   ├── 📁 api/                                # ✨ NEW: API Routes
│   │   ├── 📁 newsletter/                     # Newsletter subscription
│   │   │   └── route.ts                       # POST /api/newsletter
│   │   ├── 📁 contact/                        # Contact form submission
│   │   │   └── route.ts                       # POST /api/contact
│   │   ├── 📁 test-email/                     # Email testing (dev only)
│   │   │   └── route.ts                       # POST/GET /api/test-email
│   │   └── 📁 webhooks/
│   │       └── 📁 resend/                     # Resend webhooks
│   │           └── route.ts                   # POST /api/webhooks/resend
│   │
│   ├── 📁 auth/                               # Authentication flows
│   │   ├── 📁 login/page.tsx
│   │   ├── 📁 sign-up/page.tsx
│   │   ├── 📁 sign-up-success/page.tsx
│   │   ├── 📁 forgot-password/page.tsx
│   │   ├── 📁 update-password/page.tsx
│   │   ├── 📁 error/page.tsx
│   │   └── 📁 confirm/route.ts
│   │
│   ├── 📁 protected/                          # Protected routes
│   │   ├── layout.tsx                         # Auth-required layout
│   │   └── page.tsx                           # Protected dashboard
│   │
│   ├── 📁 admin/                              # ✨ NEW: Backoffice (admin-only)
│   │   ├── 📁 team/                           # TASK022 - Team management
│   │   │   ├── page.tsx
│   │   │   └── actions.ts                     # Server actions (admin)
│   │   └── layout.tsx                         # Admin layout + guard
│   │
│   ├── 📁 agenda/page.tsx                     # Events calendar
│   ├── 📁 compagnie/page.tsx                  # Company presentation
│   ├── 📁 spectacles/page.tsx                 # Shows listing
│   ├── 📁 presse/                             # Press space
│   │   ├── page.tsx
│   │   └── metadata.ts
│   ├── 📁 contact/page.tsx                    # Contact page
│   ├── 📁 test-connection/page.tsx            # Supabase test (dev)
│   │
│   ├── page.tsx                               # Homepage
│   ├── layout.tsx                             # Root layout
│   ├── globals.css                            # Global styles
│   └── [favicon, og-image, twitter-image]
│
├── 📁 components/                             # React Components
│   ├── 📁 features/public-site/               # Feature-based organization
│   │   ├── 📁 home/                           # Homepage features
│   │   │   ├── 📁 hero/                       # Hero carousel section
│   │   │   │   ├── HeroContainer.tsx          # Server: data fetch
│   │   │   │   ├── HeroClient.tsx             # Client: carousel logic
│   │   │   │   ├── HeroView.tsx               # View: presentation
│   │   │   │   ├── hooks.ts                   # useHeroCarousel
│   │   │   │   ├── types.ts                   # HeroSlide, HeroData
│   │   │   │   └── index.ts                   # Exports
│   │   │   │
│   │   │   ├── 📁 about/                      # About section
│   │   │   │   ├── AboutContainer.tsx
│   │   │   │   ├── AboutView.tsx
│   │   │   │   ├── hooks.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📁 news/                       # News section
│   │   │   │   ├── NewsContainer.tsx
│   │   │   │   ├── NewsView.tsx
│   │   │   │   ├── hooks.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📁 shows/                      # Shows section
│   │   │   │   ├── ShowsContainer.tsx
│   │   │   │   ├── ShowsView.tsx
│   │   │   │   ├── hooks.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📁 newsletter/                 # Newsletter section
│   │   │   │   ├── NewsletterContainer.tsx
│   │   │   │   ├── NewsletterClientContainer.tsx
│   │   │   │   ├── NewsletterView.tsx
│   │   │   │   ├── hooks.ts                   # useNewsletterSubscribe (déprécié)
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📁 partners/                   # Partners section
│   │   │   │   ├── PartnersContainer.tsx
│   │   │   │   ├── PartnersView.tsx
│   │   │   │   ├── hooks.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── types.ts                       # Home shared types
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 compagnie/                      # Company page
│   │   │   ├── 📁 data/presentation.ts        # Static data
│   │   │   ├── CompagnieContainer.tsx
│   │   │   ├── CompagnieView.tsx
│   │   │   ├── hooks.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 spectacles/                     # Shows page
│   │   │   ├── SpectaclesContainer.tsx
│   │   │   ├── SpectaclesView.tsx
│   │   │   ├── hooks.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 agenda/                         # Calendar page
│   │   │   ├── AgendaContainer.tsx
│   │   │   ├── AgendaClientContainer.tsx
│   │   │   ├── AgendaView.tsx
│   │   │   ├── hooks.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 presse/                         # Press page
│   │   │   ├── PresseContainer.tsx
│   │   │   ├── PresseServerGate.tsx
│   │   │   ├── PresseView.tsx
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   │
│   │   └── 📁 contact/                        # Contact page
│   │       ├── ContactPageContainer.tsx
│   │       ├── ContactPageView.tsx
│   │       ├── ContactServerGate.tsx
│   │       ├── actions.ts                     # Contact actions
│   │       ├── contact-hooks.ts               # useContactForm (déprécié)
│   │       └── contact-types.ts
│   │
│   ├── 📁 layout/                             # Layout components
│   │   ├── header.tsx
│   │   └── footer.tsx
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
│   ├── 📁 tutorial/                           # Tutorial components
│   │   ├── code-block.tsx
│   │   ├── connect-supabase-steps.tsx
│   │   ├── fetch-data-steps.tsx
│   │   ├── sign-up-user-steps.tsx
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
│   └── [auth-button, logout-button, forms, etc.]

├── 📁 components/features/admin/              # ✨ NEW: Admin features
│   └── 📁 team/                               # Team management UI
│       ├── TeamContainer.tsx                  # Smart (orchestrates)
│       ├── TeamList.tsx                       # Dumb list
│       ├── TeamCard.tsx                       # Dumb card
│       ├── TeamForm.tsx                       # Dumb form
│       ├── MediaPicker.tsx                    # Dumb media picker
│       ├── hooks.ts                           # Admin UI hooks (client)
│       ├── types.ts                           # Zod types for forms
│       └── index.ts                           # Exports
│
├── 📁 emails/                                 # ✨ NEW: React Email templates
│   ├── 📁 utils/
│   │   ├── email-layout.tsx                   # Shared email layout
│   │   └── components.utils.tsx               # Email utility components
│   ├── newsletter-confirmation.tsx            # Newsletter confirmation email
│   └── contact-message-notification.tsx       # Contact notification to admin
│
├── 📁 lib/                                    # Core library
│   ├── 📁 auth/                               # ✨ NEW: Auth services
│   │   └── service.ts                         # Auth business logic
│   │
│   ├── 📁 dal/                                # Data Access Layer (server-only)
│   │   ├── home-hero.ts                       # Home hero slides
│   │   ├── home-about.ts                      # Home about section
│   │   ├── home-news.ts                       # Home news
│   │   ├── home-shows.ts                      # Home shows
│   │   ├── home-newsletter.ts                 # Newsletter settings
│   │   ├── home-partners.ts                   # Partners
│   │   ├── compagnie.ts                       # Company data
│   │   ├── compagnie-presentation.ts          # Company presentation
│   │   ├── spectacles.ts                      # Shows
│   │   ├── agenda.ts                          # Events
│   │   ├── presse.ts                          # Press
│   │   └── contact.ts                         # Contact messages
│   │
│   │   ├── team.ts                            # ✨ NEW: Team members CRUD (TASK022)
│   │
│   ├── 📁 email/                              # ✨ NEW: Email service
│   │   ├── actions.ts                         # "use server" email actions
│   │   └── schemas.ts                         # Zod validation schemas
│   │
│   ├── 📁 hooks/                              # ✨ NEW: Custom hooks
│   │   ├── useNewsletterSubscribe.ts          # Newsletter hook
│   │   └── useContactForm.ts                  # Contact form hook
│   │
│   ├── 📁 plugins/
│   │   └── touch-hitbox-plugin.js             # Touch hitbox plugin
│   │
│   ├── 📁 supabase/                           # Supabase clients
│   │   ├── client.ts                          # Browser client
│   │   ├── server.ts                          # Server client
│   │   └── middleware.ts                      # Auth middleware
│   │
│   ├── resend.ts                              # ✨ NEW: Resend client
│   ├── site-config.ts                         # ✨ NEW: Site configuration
│   └── utils.ts                               # Shared utilities
│
├── 📁 types/                                  # ✨ NEW: TypeScript types
│   ├── database.types.ts                      # Supabase generated types
│   └── email.d.ts                             # Email-specific types
│
├── 📁 deprecated/                             # Legacy moved files
│   └── types/database.types.legacy.ts         # Legacy DB types (moved)
│
├── 📁 scripts/                                # ✨ NEW: Testing scripts
│   ├── test-email-integration.ts              # Email integration test
│   ├── check-email-logs.ts                    # DB logs checker
│   └── test-webhooks.ts                       # Webhook config test
│
├── 📁 supabase/                               # Supabase project
│   ├── 📁 .branches/_current_branch
│   ├── 📁 migrations/                         # Database migrations (seeds)
│   │   ├── 20250918000000_fix_spectacles_versioning_trigger.sql
│   │   ├── 20250918031500_seed_home_hero_slides.sql
│   │   ├── [... other migrations ...]
│   │   └── migrations.md
│   ├── 📁 schemas/                            # ⚠️ DEPRECATED: use migrations/
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
│
├── 📁 memory-bank/                            # Documentation
│   ├── 📁 architecture/
│   │   ├── File-Tree.md
│   │   ├── Project_Architecture_Blueprint.md
│   │   ├── Project_Folders_Structure_Blueprint.md
│   │   └── Email_Service_Architecture.md      # ✨ NEW: Email docs
│   ├── 📁 epics/[details/, epics-map.yaml]
│   ├── 📁 tasks/[TASK*.md, _index.md]
│   └── [activeContext, productContext, progress, etc.]
│
├── 📁 doc/                                    # Project documentation
│
├── 📁 public/                                 # Public assets (images, fonts)
│   └── [favicons, social images, logos]
│
├── 📁 .github/
│   ├── 📁 instructions/
│   │   ├── copilot-instructions.md            # ✨ NEW: Main instructions
│   │   ├── nextjs-supabase-auth-2025.instructions.md
│   │   ├── resend_supabase_integration.md     # ✨ NEW: Resend guide
│   │   └── [...]
│   └── 📁 workflows/
│
├── middleware.ts                              # Next.js middleware (auth)
├── [configuration files]
├── .env.local                                 # Environment variables
├── README.md
└── TESTING_RESEND.md                          # ✨ NEW: Resend testing
```

---

## 4. Key Directory Analysis

### 4.1 App Router Structure (`app/`)

**Purpose**: Next.js 15 file-based routing avec Server/Client Components

**Key Patterns**:

- `page.tsx` : Route pages (Server Component par défaut)
- `layout.tsx` : Shared layouts avec nested layouts
- `route.ts` : API endpoints (Route Handlers)
- `loading.tsx` : Loading UI (Suspense boundaries)
- `error.tsx` : Error boundaries

**New Routes (Resend Integration)**:

```bash
POST /api/newsletter     → Newsletter subscription
POST /api/contact        → Contact form submission
POST /api/test-email     → Email testing (dev)
POST /api/webhooks/resend → Resend webhook handler
```

### 4.2 Email Architecture (`emails/`, `lib/email/`)

**Template Layer** (`emails/`):

- React Email components avec Tailwind CSS
- `email-layout.tsx` : Layout réutilisable avec header/footer
- `components.utils.tsx` : Composants email réutilisables
- Templates : `newsletter-confirmation.tsx`, `contact-message-notification.tsx`

**Action Layer** (`lib/email/actions.ts`):

- `"use server"` directive obligatoire
- `sendEmail()` : Generic email sending
- `sendNewsletterConfirmation()` : Newsletter confirmation
- `sendContactNotification()` : Contact form notification

**Validation Layer** (`lib/email/schemas.ts`):

- Zod schemas pour validation runtime
- `NewsletterSubscriptionSchema`
- `ContactMessageSchema`
- Types générés automatiquement : `NewsletterSubscription`, `ContactMessage`

### 4.3 Feature Components (`components/features/`)

**Organization Pattern**:

```bash
components/features/[domain]/[feature]/
├── [Feature]Container.tsx   # Server Component (async data fetching)
├── [Feature]View.tsx         # Client Component (presentation)
├── hooks.ts                  # Custom hooks (client-side logic)
├── types.ts                  # Feature-specific types
└── index.ts                  # Public exports
```

**Example - Newsletter Feature**:

```bash
components/features/public-site/home/newsletter/
├── NewsletterContainer.tsx        # Server: fetch settings
├── NewsletterClientContainer.tsx  # Client: form logic
├── NewsletterView.tsx             # View: UI presentation
├── hooks.ts                       # ⚠️ DEPRECATED: use lib/hooks/
├── types.ts                       # NewsletterData types
└── index.ts
```

**Migration Note**: Les hooks de features sont progressivement migrés vers `lib/hooks/` pour réutilisabilité.

### 4.3bis Admin Backoffice (`components/features/admin/` + `app/admin/`)

Purpose: Interfaces d’administration (backoffice) protégées pour la gestion des contenus métiers. Première implémentation: TASK022 — Team Management.

Structure:

```bash
app/admin/
├── layout.tsx                 # Admin layout avec garde d’auth (requireAdmin)
└── team/
    ├── page.tsx               # Page admin Team
    └── actions.ts             # Server actions (create/update/reorder/setActive)

components/features/admin/team/
├── TeamContainer.tsx          # Smart: orchestre data + actions
├── TeamList.tsx               # Dumb: liste des membres
├── TeamCard.tsx               # Dumb: carte membre
├── TeamForm.tsx               # Dumb: formulaire (Zod + UI)
├── MediaPicker.tsx            # Dumb: sélection médias (photos)
├── hooks.ts                   # Hooks client (toast, forms)
├── types.ts                   # Schemas Zod + types form
└── index.ts                   # Exports
```

Data Layer:

```typescript
// lib/dal/team.ts (server-only)
"use server";

// Fonctions clés (exemples)
export async function fetchAllTeamMembers() {}
export async function fetchTeamMemberById(id: string) {}
export async function createTeamMember(input: CreateTeamMemberInput) {}
export async function updateTeamMember(id: string, input: UpdateTeamMemberInput) {}
export async function setTeamMemberActive(id: string, active: boolean) {}
export async function reorderTeamMembers(order: string[]) {}
```

Auth Guard:

```typescript
// lib/auth/is-admin.ts
export async function requireAdmin() {
  // getClaims() + vérif rôle/permissions
}
```

Policies:

- Soft-delete via champ `active=false` (hard-delete réservé)
- RLS activé côté Supabase; actions sensibles protégées par `requireAdmin()`
- Validation d’E/S via Zod au niveau formulaire et DAL

### 4.4 Data Access Layer (`lib/dal/`)

**Purpose**: Server-only data access avec isolation complète

**Pattern**:

```typescript
// lib/dal/[entity].ts
"use server";

import { createClient } from "@/supabase/server";
import type { Database } from "@/types/database.types";

export async function fetch[Entity]() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("[table]")
    .select("*")
    .eq("is_active", true);
    
  if (error) throw new Error(error.message);
  return data;
}
```

**Key Files**:

- `home-hero.ts` : Hero slides
- `home-newsletter.ts` : Newsletter settings
- `contact.ts` : Contact messages (avec email trigger)
- `presse.ts` : Press articles + releases
- `team.ts` : Team members CRUD + reorder + soft delete (TASK022)

### 4.5 Custom Hooks (`lib/hooks/`)

#### **✨ NEW: Centralized Client Hooks**

**Purpose**: Logique client réutilisable à travers features

**Current Hooks**:

```typescript
// lib/hooks/useNewsletterSubscribe.ts
export function useNewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    // API call to /api/newsletter
    // Error handling
    // Success state
  };
  
  return { email, setEmail, handleSubmit, isLoading };
}

// lib/hooks/useContactForm.ts
export function useContactForm() {
  // Form state management
  // Validation
  // Submission logic
}
```

**Migration Strategy**:

- Hooks dans `components/features/*/hooks.ts` sont déprécié
- Nouveau code doit utiliser `lib/hooks/`
- Hooks réutilisables centralisés pour éviter duplication

### 4.6 Type System (`types/`)

**Structure**:

```bash
types/
├── database.types.ts   # ✨ Supabase generated (ne pas éditer)
└── email.d.ts          # ✨ Email-specific types
```

**database.types.ts**:

- Généré automatiquement par Supabase CLI
- Types pour toutes les tables, views, functions
- À regénérer après changements schema : `supabase gen types typescript`

**email.d.ts**:

```typescript
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailSendResult {
  id: string;
  success: boolean;
  error?: string;
}

export type EmailTemplate = 
  | 'newsletter-confirmation'
  | 'contact-notification';
```

### 4.8 Auth & Security Notes

- Auth basé sur Supabase `@supabase/ssr` + `getClaims()` côté serveur (2–5ms)
- Middleware Next.js pour protéger les routes sensibles
- `requireAdmin()` pour les actions admin (server-side) → renvoie 403 sinon
- RLS activé sur toutes les tables; privilégier DAL server-only
- Ne jamais exposer de secrets côté client; pas de service_role dans le code app

### 4.7 Testing Infrastructure (`scripts/`)

#### **✨ NEW: Email Testing Scripts**

**test-email-integration.ts**:

- Tests l'envoi réel d'emails via API
- Vérifie newsletter + contact form
- Logs détaillés pour debugging

**check-email-logs.ts**:

- Vérifie les logs en base de données
- Affiche derniers abonnés newsletter
- Affiche derniers messages contact
- Nécessite `SUPABASE_SERVICE_ROLE_KEY`

**test-webhooks.ts**:

- Vérifie configuration webhooks Resend
- Teste connectivité API Resend
- Affiche webhooks configurés

**Usage**:

```bash
# Test emails (require server running)
pnpm run test:email

# Check database logs
pnpm run test:logs

# Test webhooks
pnpm run test:webhooks

# Run all tests
pnpm run test:resend
```

---

## 5. File Placement Patterns

### 5.1 Configuration Files

| File Type | Location | Purpose |
|-----------|----------|---------|
| Next.js config | `next.config.ts` | Framework configuration |
| TypeScript config | `tsconfig.json` | Type checking rules |
| Tailwind config | `tailwind.config.ts` | Style system config |
| ESLint config | `eslint.config.mjs` | Code quality rules |
| Env variables | `.env.local` | Environment variables |
| shadcn/ui config | `components.json` | UI component config |

### 5.2 Component Placement Rules

**Feature Components**:

```bash
WHERE: components/features/[domain]/[feature]/
WHEN: Business logic specific to one feature
PATTERN: Container + View + hooks + types + index
```

**Shared UI Components**:

```bash
WHERE: components/ui/
WHEN: Reusable across multiple features
EXAMPLES: Button, Input, Card, Alert
SOURCE: shadcn/ui library
```

**Layout Components**:

```bash
WHERE: components/layout/
WHEN: Structural components (Header, Footer, Navigation)
SCOPE: Application-wide
```

**Loading States**:

```bash
WHERE: components/skeletons/
WHEN: Suspense fallback UI
PATTERN: [feature]-skeleton.tsx
```

### 5.3 Logic Placement Rules

**Server-Only Logic**:

```bash
WHERE: lib/dal/*.ts
DIRECTIVE: "use server"
PURPOSE: Database access, business rules
IMPORT: Never import in Client Components
```

**Client-Only Logic**:

```bash
WHERE: lib/hooks/*.ts
DIRECTIVE: "use client" (implicit via useState, useEffect)
PURPOSE: Client-side interactions, form state
SCOPE: Reusable across features
```

**Email Logic**:

```bash
WHERE: lib/email/actions.ts
DIRECTIVE: "use server"
PURPOSE: Email sending operations
VALIDATION: lib/email/schemas.ts (Zod)
```

### 5.4 Type Placement Rules

**Generated Types**:

```bash
WHERE: types/database.types.ts
SOURCE: Supabase CLI (supabase gen types typescript)
WARNING: Never edit manually
REGENERATE: After schema changes
```

**Feature Types**:

```bash
WHERE: components/features/[domain]/[feature]/types.ts
SCOPE: Feature-specific interfaces
EXPORT: Via index.ts
```

**Domain Types**:

```bash
WHERE: types/email.d.ts
SCOPE: Cross-feature domain types
PURPOSE: Shared contracts
```

### 5.5 API Endpoint Placement

**REST API**:

```bash
WHERE: app/api/[resource]/route.ts
METHODS: GET, POST, PUT, DELETE, PATCH
EXPORTS: Named functions per method
```

**Webhooks**:

```bash
WHERE: app/api/webhooks/[service]/route.ts
PURPOSE: External service callbacks
EXAMPLE: app/api/webhooks/resend/route.ts
```

---

## 6. Naming and Organization Conventions

### 6.1 File Naming Conventions

**Components**:

```bash
Pattern: PascalCase.tsx
Examples:
  - HeroContainer.tsx (Smart component)
  - HeroView.tsx (Dumb component)
  - NewsletterClientContainer.tsx (Client logic)
```

**Utilities & Logic**:

```bash
Pattern: camelCase.ts ou kebab-case.ts
Examples:
  - utils.ts (utilities)
  - site-config.ts (configuration)
  - home-hero.ts (DAL)
  - email-layout.tsx (template)
```

**Types**:

```bash
Pattern: camelCase.ts or [domain].d.ts
Examples:
  - types.ts (feature types)
  - database.types.ts (Supabase types)
  - email.d.ts (email domain types)
```

**Tests**:

```bash
Pattern: [name].test.ts
Examples:
  - actions.test.ts
  - utils.test.ts
```

### 6.2 Component Naming Patterns

**Smart Components (Containers)**:

```bash
Pattern: [Feature]Container.tsx
Purpose: Business logic + data fetching
Examples:
  - HeroContainer.tsx
  - NewsletterContainer.tsx
  - ContactPageContainer.tsx
```

**Dumb Components (Views)**:

```bash
Pattern: [Feature]View.tsx
Purpose: Pure presentation
Examples:
  - HeroView.tsx
  - NewsletterView.tsx
  - ContactPageView.tsx
```

**Client Logic Components**:

```bash
Pattern: [Feature]Client.tsx or [Feature]ClientContainer.tsx
Purpose: Client-side interactivity
Examples:
  - HeroClient.tsx (carousel logic)
  - NewsletterClientContainer.tsx (form state)
```

**Server Gate Components**:

```bash
Pattern: [Feature]ServerGate.tsx
Purpose: Server-side data validation before client rendering
Examples:
  - PresseServerGate.tsx
  - ContactServerGate.tsx
```

### 6.3 Function Naming Conventions

**DAL Functions**:

```typescript
Pattern: [action][Entity][Qualifier?]

Examples:
  // Read operations
  fetchActiveHomeHeroSlides()
  fetchCompanyStats()
  fetchNewsletterSettings()
  
  // Create operations
  createContactMessage(data)
  createNewsletterSubscription(email)
  
  // Update operations
  updateSpectacleStatus(id, status)
  
  // Delete operations
  deleteExpiredSessions()
```

**Email Actions**:

```typescript
Pattern: send[EmailType][Purpose?]

Examples:
  sendEmail(params)
  sendNewsletterConfirmation(email)
  sendContactNotification(contactData)
```

**Custom Hooks**:

```typescript
Pattern: use[Feature][Action?]

Examples:
  useNewsletterSubscribe()
  useContactForm()
  useHeroCarousel()
```

### 6.4 Variable Naming Conventions

**Constants**:

```typescript
// SCREAMING_SNAKE_CASE for true constants
const MAX_RETRIES = 3;
const DEFAULT_PAGE_SIZE = 10;

// PascalCase for configuration objects
const SITE_CONFIG = {
  EMAIL: {
    FROM: '...',
    CONTACT: '...'
  }
};
```

**State Variables**:

```typescript
// camelCase with descriptive names
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
const [currentSlide, setCurrentSlide] = useState(0);
```

**Props Interfaces**:

```typescript
// PascalCase with Props suffix
interface HeroViewProps {
  slides: HeroSlide[];
  currentSlide: number;
  onNextSlide: () => void;
}
```

### 6.5 Folder Naming Conventions

**Feature Folders**:

```bash
Pattern: kebab-case
Examples:
  - home/
  - public-site/
  - home-hero/
  - contact-page/
```

**Domain Folders**:

```bash
Pattern: singular noun (camelCase if needed)
Examples:
  - auth/
  - email/
  - hooks/
  - dal/
```

---

## 7. Navigation and Development Workflow

### 7.1 Entry Points for Development

**Starting Points**:

```bash
1. Homepage Implementation:
   → app/page.tsx (route)
   → components/features/public-site/home/ (features)
   → lib/dal/home-*.ts (data access)

2. New Feature Development:
   → components/features/[domain]/[new-feature]/
   → lib/dal/[new-entity].ts
   → app/[route]/page.tsx

3. Email Integration:
   → emails/[new-template].tsx
   → lib/email/actions.ts (add new action)
   → app/api/[endpoint]/route.ts

4. Authentication:
   → app/auth/[flow]/page.tsx
   → middleware.ts (route protection)
   → lib/supabase/server.ts (getClaims() ~2-5ms)
```

### 7.2 Common Development Tasks

#### Adding a New Feature

##### **Step 1: Create Feature Structure**

```bash
mkdir -p components/features/public-site/[feature]
cd components/features/public-site/[feature]

# Create files
touch [Feature]Container.tsx    # Server Component
touch [Feature]View.tsx          # Client Component
touch hooks.ts                   # Custom hooks (if needed)
touch types.ts                   # Types
touch index.ts                   # Exports
```

##### **Step 2: Create Data Access Layer**

```bash
touch lib/dal/[entity].ts
```

##### **Step 3: Add Route**

```bash
mkdir -p app/[route]
touch app/[route]/page.tsx
```

##### **Step 4: Implement**

```typescript
// [Feature]Container.tsx
import { fetch[Entity] } from "@/lib/dal/[entity]";
import { [Feature]View } from "./[Feature]View";

export async function [Feature]Container() {
  const data = await fetch[Entity]();
  return <[Feature]View data={data} />;
}

// [Feature]View.tsx
"use client";

export function [Feature]View({ data }) {
  return <div>{/* UI */}</div>;
}

// types.ts
export interface [Feature]Data {
  // types
}

// index.ts
export { [Feature]Container } from "./[Feature]Container";
export { [Feature]View } from "./[Feature]View";
export type { [Feature]Data } from "./types";
```

#### Adding Email Template

##### **Step 1: Create Template**

```bash
touch emails/[template-name].tsx
```

##### **Step 2: Create Action**

```typescript
// lib/email/actions.ts
export async function send[TemplateName](params) {
  await sendEmail({
    to: params.email,
    subject: "...",
    react: <[TemplateName] {...params} />
  });
}
```

##### **Step 3: Add Validation Schema**

```typescript
// lib/email/schemas.ts
export const [TemplateName]Schema = z.object({
  email: z.string().email(),
  // other fields
});
```

##### **Step 4: Create API Endpoint (Optional)**

```typescript
// app/api/[endpoint]/route.ts
import { [TemplateName]Schema } from "@/lib/email/schemas";
import { send[TemplateName] } from "@/lib/email/actions";

export async function POST(request: NextRequest) {
  const data = await request.json();
  const validated = [TemplateName]Schema.parse(data);
  await send[TemplateName](validated);
  return NextResponse.json({ success: true });
}
```

#### Adding Custom Hook

##### **Step 1: Create Hook**

```bash
touch lib/hooks/use[Feature].ts
```

##### **Step 2: Implement**

```typescript
// lib/hooks/use[Feature].ts
"use client";

import { useState, useCallback } from "react";

export function use[Feature]() {
  const [state, setState] = useState(initialState);
  
  const handleAction = useCallback(async () => {
    // logic
  }, [dependencies]);
  
  return {
    state,
    handleAction,
    // other exports
  };
}
```

##### **Step 3: Use in Component**

```typescript
// components/features/.../[Feature]Client.tsx
"use client";

import { use[Feature] } from "@/lib/hooks/use[Feature]";

export function [Feature]Client() {
  const { state, handleAction } = use[Feature]();
  return <div onClick={handleAction}>{/* UI */}</div>;
}
```

### 7.3 Testing Workflow

**Unit Testing** (Coming Soon):

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

**Integration Testing (Email)**:

```bash
# Start dev server
pnpm dev

# In another terminal
pnpm run test:resend
```

**Manual Testing**:

```bash
# Test email via cURL
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "newsletter", "email": "test@example.com"}'
```

### 7.4 Database Workflow

**Schema Changes**:

```bash
# 1. Create migration
supabase migration new [migration_name]

# 2. Edit migration file
# supabase/migrations/[timestamp]_[migration_name].sql

# 3. Apply migration
supabase db push

# 4. Generate types
supabase gen types typescript --local > types/database.types.ts
```

**Seeds**:

```bash
# Apply seed data
supabase db reset  # Resets + applies migrations + seeds
```

### 7.5 Build & Output Organization

**Build Configuration Files**:

- `next.config.ts` (Next.js config)
- `tsconfig.json` (TypeScript strict config)
- `tailwind.config.ts` (Tailwind CSS config)
- `postcss.config.mjs` (PostCSS config)
- `eslint.config.mjs` (ESLint rules)

**Common Commands**:

```bash
pnpm dev         # Start dev server (Turbopack by default)
pnpm build       # Production build
pnpm start       # Start production server
pnpm lint        # Run ESLint
```

**Outputs & Artifacts**:

- `.next/` (Next.js build output – not versioned)
- `public/` (Static assets served as-is)

**Environment Variables**:

- `.env.local` (local dev)
- `.env.staging` (optional)
- `.env.production` (production)

---

## 8. Email Service Integration

### 8.1 Email Architecture Overview

```bash
┌────────────────────────────────────────────────────────┐
│                  Email Service Stack                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │ React Email  │───▶│   Resend     │                 │
│  │  Templates   │    │     API      │                  │
│  └──────────────┘    └──────────────┘                  │
│         │                    │                         │
│         ▼                    ▼                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │ Email Layout │    │   Supabase   │                  │
│  │   + Utils    │    │   Database   │                  │
│  └──────────────┘    └──────────────┘                  │
│         │                    │                         │
│         └────────┬───────────┘                         │
│                  ▼                                     │
│          ┌──────────────┐                              │
│          │ Zod Schemas  │                              │
│          │  Validation  │                              │
│          └──────────────┘                              │
└────────────────────────────────────────────────────────┘
```

### 8.2 Email Flow Diagram

```bash
User Action
    │
    ▼
┌─────────────────┐
│ Client Component│
│  (Form Submit)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Endpoint   │
│ /api/newsletter │
│  /api/contact   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Zod Validation  │
│    (Schema)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   DAL Insert    │
│   (Supabase)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email Action    │
│  sendEmail()    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Template Render │
│  (React Email)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Resend API     │
│   Send Email    │
└────────┬────────┘
         │
         ▼
    Email Sent
```

### 8.3 Email Components Location Map

| Component | Path | Purpose |
|-----------|------|---------|
| **Templates** | `emails/` | Email templates directory |
| Newsletter Confirmation | `emails/newsletter-confirmation.tsx` | User subscription confirmation |
| Contact Notification | `emails/contact-message-notification.tsx` | Admin notification for contact form |
| Email Layout | `emails/utils/email-layout.tsx` | Shared layout with header/footer |
| Email Utils | `emails/utils/components.utils.tsx` | Reusable email components |
| **Actions** |  |  |
| Email Actions | `lib/email/actions.ts` | Server actions for sending |
| **Validation** |  |  |
| Email Schemas | `lib/email/schemas.ts` | Zod validation schemas |
| **API Endpoints** |  |  |
| Newsletter API | `app/api/newsletter/route.ts` | POST newsletter subscription |
| Contact API | `app/api/contact/route.ts` | POST contact form |
| Test Email API | `app/api/test-email/route.ts` | POST/GET email testing |
| Webhook Handler | `app/api/webhooks/resend/route.ts` | POST webhook reception |
| **Configuration** |  |  |
| Resend Client | `lib/resend.ts` | Resend API client config |
| Site Config | `lib/site-config.ts` | Email addresses + URLs |
| **Types** |  |  |
| Email Types | `types/email.d.ts` | Email-specific TypeScript types |
| **Hooks** |  |  |
| Newsletter Hook | `lib/hooks/useNewsletterSubscribe.ts` | Newsletter subscription logic |
| Contact Hook | `lib/hooks/useContactForm.ts` | Contact form logic |
| **Testing** |  |  |
| Integration Test | `scripts/test-email-integration.ts` | Email sending tests |
| Logs Checker | `scripts/check-email-logs.ts` | Database logs verification |
| Webhook Test | `scripts/test-webhooks.ts` | Webhook config test |
| **Documentation** |  |  |
| Email Architecture | `memory-bank/architecture/Email_Service_Architecture.md` | Detailed architecture doc |
| Testing Guide | `TESTING_RESEND.md` | Testing procedures |
| Integration Guide | `.github/instructions/resend_supabase_integration.md` | Setup instructions |

### 8.4 Email Environment Variables

```bash
# Resend Configuration
RESEND_API_KEY=re_xxx                      # Resend API key (required)
RESEND_AUDIENCE_ID=xxx                     # Resend audience ID (optional)

# Email Addresses
EMAIL_FROM=noreply@rougecardinalcompany.fr  # Default FROM address
EMAIL_CONTACT=contact@rougecardinalcompany.fr # Contact email

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://rougecardinalcompany.fr  # Production URL
# or
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development URL
```

### 8.5 Email Best Practices

**Template Development**:

- Use `EmailLayout` for consistent branding
- Keep HTML simple (email client compatibility)
- Inline styles for better rendering
- Test across multiple email clients
- Preview text for inbox display

**Action Development**:

- Always use `"use server"` directive
- Validate input with Zod schemas
- Handle errors gracefully
- Log important events
- Return clear success/error messages

**API Development**:

- Validate with Zod before processing
- Return appropriate HTTP status codes
- Log errors for debugging
- Rate limit sensitive endpoints
- Use CORS appropriately

**Testing**:

- Test with real email addresses
- Verify database logs
- Check webhook configuration
- Monitor Resend dashboard
- Test error scenarios

---

## 9. Extension Templates

### 9.1 New Feature Template

**Directory Structure**:

```bash
components/features/[domain]/[new-feature]/
├── [NewFeature]Container.tsx    # Server Component
├── [NewFeature]View.tsx          # Client Component  
├── hooks.ts                      # Custom hooks (optional)
├── types.ts                      # Types
└── index.ts                      # Exports

lib/dal/[new-entity].ts           # Data access
app/[route]/page.tsx              # Route page
```

**Container Template**:

```typescript
// [NewFeature]Container.tsx
import { fetch[Entity] } from "@/lib/dal/[entity]";
import { [NewFeature]View } from "./[NewFeature]View";
import type { [NewFeature]Data } from "./types";

export async function [NewFeature]Container() {
  try {
    const data = await fetch[Entity]();
    return <[NewFeature]View data={data} />;
  } catch (error) {
    console.error('[NewFeature] Error:', error);
    return <div>Error loading data</div>;
  }
}
```

**View Template**:

```typescript
// [NewFeature]View.tsx
"use client";

import type { [NewFeature]Data } from "./types";

interface [NewFeature]ViewProps {
  data: [NewFeature]Data;
}

export function [NewFeature]View({ data }: [NewFeature]ViewProps) {
  return (
    <div>
      <h2>{data.title}</h2>
      {/* UI implementation */}
    </div>
  );
}
```

**Types Template**:

```typescript
// types.ts
export interface [NewFeature]Data {
  title: string;
  items: [NewFeature]Item[];
}

export interface [NewFeature]Item {
  id: string;
  name: string;
  // other fields
}
```

**Index Template**:

```typescript
// index.ts
export { [NewFeature]Container } from "./[NewFeature]Container";
export { [NewFeature]View } from "./[NewFeature]View";
export type { [NewFeature]Data, [NewFeature]Item } from "./types";
```

**DAL Template**:

```typescript
// lib/dal/[entity].ts
"use server";

import { createClient } from "@/supabase/server";
import type { Database } from "@/types/database.types";

type [Entity] = Database["public"]["Tables"]["[table_name]"]["Row"];

export async function fetch[Entity]() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("[table_name]")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error('[Entity] Fetch error:', error);
    throw new Error(`Failed to fetch [entity]: ${error.message}`);
  }
  
  return data || [];
}
```

**Page Template**:

```typescript
// app/[route]/page.tsx
import { [NewFeature]Container } from "@/components/features/[domain]/[new-feature]";
import { Suspense } from "react";
import { [NewFeature]Skeleton } from "@/components/skeletons/[new-feature]-skeleton";

export default function [NewFeature]Page() {
  return (
    <main>
      <Suspense fallback={<[NewFeature]Skeleton />}>
        <[NewFeature]Container />
      </Suspense>
    </main>
  );
}
```

### 9.2 New Email Template

**Template File**:

```typescript
// emails/[template-name].tsx
import { SITE_CONFIG } from "@/lib/site-config";
import { Preview, Text } from "@react-email/components";
import { EmailLayout } from "./utils/email-layout";
import { EmailSection, EmailText } from "./utils/components.utils";

interface [TemplateName]Props {
  // props
}

export default function [TemplateName]({ ...props }: [TemplateName]Props) {
  return (
    <EmailLayout>
      <Preview>Preview text for inbox</Preview>
      
      <EmailSection>
        <EmailText>
          Email content here
        </EmailText>
      </EmailSection>
      
      {/* More sections */}
    </EmailLayout>
  );
}
```

**Email Action**:

```typescript
// lib/email/actions.ts
export async function send[TemplateName](params: [TemplateName]Params) {
  await sendEmail({
    to: params.email,
    subject: "Email Subject",
    react: <[TemplateName] {...params} />
  });
}
```

**Validation Schema**:

```typescript
// lib/email/schemas.ts
export const [TemplateName]Schema = z.object({
  email: z.string().email("Email invalide"),
  // other fields
});

export type [TemplateName]Params = z.infer<typeof [TemplateName]Schema>;
```

### 9.3 New API Endpoint Template

```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { [Resource]Schema } from "@/lib/[domain]/schemas";
import { create[Resource] } from "@/lib/dal/[resource]";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const validated = [Resource]Schema.parse(body);
    
    // Process
    const result = await create[Resource](validated);
    
    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Resource] API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Handle GET logic
    
    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('[Resource] GET error:', error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
```

### 9.4 New Custom Hook Template

```typescript
// lib/hooks/use[Feature].ts
"use client";

import { useState, useCallback, useEffect } from "react";

interface Use[Feature]Options {
  // options
}

export function use[Feature](options?: Use[Feature]Options) {
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const handleAction = useCallback(async (params: ActionParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API call or logic
      const result = await fetchData(params);
      setState(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [/* dependencies */]);
  
  useEffect(() => {
    // Side effects
  }, [/* dependencies */]);
  
  return {
    state,
    isLoading,
    error,
    handleAction,
    // other exports
  };
}
```

---

## 10. Maintenance

### 10.1 Document Update Procedures

**When to Update This Document**:

- Major architectural changes
- New feature patterns introduced
- Folder structure reorganization
- New integration added (like Resend)
- Deprecated patterns removed

**How to Update**:

1. Update relevant section(s)
2. Increment version number
3. Update "Last Updated" date
4. Add note in version history
5. Commit with descriptive message

### 10.2 Code Review Checklist

**Architecture Compliance**:

- [ ] Follows feature-based organization?
- [ ] Uses Smart/Dumb pattern correctly?
- [ ] Server Components for data fetching?
- [ ] Client Components only when needed?
- [ ] DAL used for database access?

**Naming Conventions**:

- [ ] Component names follow PascalCase?
- [ ] File names consistent with patterns?
- [ ] Function names descriptive?
- [ ] Types properly defined?

**Email Integration** (if applicable):

- [ ] Template uses EmailLayout?
- [ ] Action has "use server" directive?
- [ ] Validation with Zod schema?
- [ ] Error handling implemented?
- [ ] Database logging included?

**Testing**:

- [ ] Tests written for new features?
- [ ] Manual testing performed?
- [ ] Edge cases considered?

### 10.3 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 2.0.1 | 2025-10-20 | Admin Backoffice (TASK022) blueprint, Tailwind plugin ESM note, Auth & Security notes | AI Assistant |
| 2.0.0 | 2025-10-08 | Complete rewrite with Resend integration, new hooks system, updated patterns | AI Assistant |
| 1.0.0 | 2025-09-XX | Initial document | Previous |

### 10.4 Related Documentation

- `Project_Architecture_Blueprint.md` : Architecture détaillée complète
- `Email_Service_Architecture.md` : Architecture du service email
- `File-Tree.md` : Arborescence complète des fichiers
- `TESTING_RESEND.md` : Guide de test de l'intégration Resend
- `.github/instructions/resend_supabase_integration.md` : Instructions d'intégration
- `.github/instructions/nextjs-supabase-auth-2025.instructions.md` : Best practices auth

### 10.5 Future Improvements

**Planned**:

- [ ] Add unit testing section with examples
- [ ] Document internationalization patterns
- [ ] Add performance optimization guidelines
- [ ] Document deployment procedures
- [ ] Add troubleshooting section

**Under Consideration**:

- [ ] Monorepo migration?
- [ ] GraphQL integration?
- [ ] Micro-frontend architecture?
- [ ] Additional email providers?

---

**Document Maintainers**: Development Team  
**Review Frequency**: After major changes or quarterly  
**Last Review**: 20 octobre 2025
