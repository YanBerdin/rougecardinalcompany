# Project Folders Structure Blueprint

## 1. Initial Auto-detection Phase

- **Detected project type:** Next.js 15 (React 19, TypeScript, App Router)
- **Monorepo:** No (single-app structure)
- **Frontend:** Yes (Next.js/React)
- **Backend:** Supabase (external, not in repo)
- **Microservices:** No

**Technology signatures found:**

- `next.config.ts`, `package.json` (Next.js, React, TypeScript)
- `supabase/` (Supabase integration)
- `tailwind.config.ts`, `postcss.config.mjs` (Tailwind CSS)
- `memory-bank/` (custom documentation)

---

## 2. Structural Overview

- **Organization:** Feature-based, modular, Smart/Dumb (Container/View) pattern
- **Main principles:**
  - Clear separation of concerns (features, UI, utils, docs)
  - Each feature is isolated with its own types, hooks, Container, View
  - Shared UI components are decoupled from features
  - Documentation is versioned and structured (memory-bank)
- **Repeating patterns:**
  - `FeatureContainer.tsx` (logic, state; Server Component par défaut)
  - `FeatureView.tsx` (presentation, dumb component)
  - `hooks.ts`, `types.ts`, `index.ts` in each feature/section (éviter hooks côté client pour la lecture; privilégier DAL)
- **Rationale:**
  - Testability, maintainability, scalability, and consistency

---

## 3. Directory Visualization (Markdown List, depth 3)

```bash
/ (root)
├── app/
│   ├── agenda/             # Agenda/calendrier des événements
│   ├── contact/            # Page de contact
│   ├── presse/             # Espace presse (articles, communiqués)
│   ├── spectacles/         # Page spectacles (listing, détails)
│   ├── test-connection/    # Test de connexion Supabase/API
│   ├── auth/            # Authentification (login, signup)
│   ├── protected/       # Routes protégées (authentification requise)
│   ├── compagnie/       # Page de la compagnie (présentation, équipe)
│   ├── page.tsx         # Page principale
│   └── layout.tsx       # Layout principal
├── components/
│   ├── features/        # Composants spécifiques aux fonctionnalités
│   │   └── public-site/ 
│   │       ├── home/
│   │       │   ├── about/            # Sections de la page d'accueil
│   │       │   │   ├── AboutContainer.tsx
│   │       │   │   ├── AboutView.tsx
│   │       │   │   ├── hooks.ts
│   │       │   │   ├── types.ts
│   │       │   │   └── index.ts
│   │       │   ├── news/             # Sections de la page d'accueil
│   │       │   ├── shows/            # Sections de la page d'accueil
│   │       │   ├── newsletter/       # Sections de la page d'accueil
│   │       │   ├── partners/         # Sections de la page d'accueil
│   │       │   ├── types/            # Types spécifiques à la page d'accueil
│   │       │   └── index.ts          
│   │       ├── agenda/
│   │       ├── compagnie/
│   │       │   │   ├── CompagnieContainer.tsx     # Server Component (async)
│   │       │   │   ├── CompagnieView.tsx          # Presentational-only
│   │       │   │   ├── hooks.ts                   # [DEPRECATED MOCK] (transitoire)
│   │       │   │   ├── types.ts
│   │       │   │   └── index.ts
│   │       ├── spectacles/
│   │       │   ├── SpectaclesContainer.tsx     # Server Component (async, DAL)
│   │       │   ├── SpectaclesView.tsx          # Client View (présentation)
│   │       │   ├── hooks.ts                    # [DEPRECATED MOCK]
│   │       │   ├── types.ts
│   │       │   └── index.ts
│   │       └── presse/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── skeletons/
│   │   ├── hero-skeleton.tsx
│   │   ├── news-skeleton.tsx
│   │   ├── shows-skeleton.tsx
│   │   └── ...
│   ├── tutorial/
│   └── ui/                # Composants d'interface utilisateur partagés
├── lib/
│   ├── dal/               # Data Access Layer (server-only)
│   │   ├── compagnie.ts               # valeurs + équipe (lecture publique)
│   │   ├── compagnie-presentation.ts  # sections éditoriales + fallback
│   │   ├── spectacles.ts              # lecture table spectacles (listing)
│   ├── hooks/             # Hooks partagés (client)
│   ├── supabase/
│   │   ├── schemas/       # Schémas de la base de données Supabase
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
