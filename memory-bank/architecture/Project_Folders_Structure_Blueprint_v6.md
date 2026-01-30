# Project Folders Structure Blueprint v6

**Généré le:** 2026-01-26  
**Racine du projet:** `/home/yandev/projets/rougecardinalcompany`  
**Version Next.js:** 16.0.10  
**Version React:** 19.2  

**Résumé:** Ce document décrit l'organisation complète du projet Rouge Cardinal Company (application web théâtrale), une application Next.js 16 + Supabase avec architecture feature-based, DAL SOLID, et optimisations d'authentification JWT. Il sert de référence définitive pour maintenir la cohérence structurelle du code.

---

## 1. Auto-Détection et Contexte du Projet

### 1.1 Technologies Détectées

**Type de projet:** Application web full-stack TypeScript/Next.js  
**Architecture:** App Router + Server Components + Supabase Backend

**Technologies principales identifiées:**

- ✅ **Next.js 16.0.10** (fichiers: `next.config.ts`, `app/`, App Router)
- ✅ **React 19.2** (Server Components, Server Actions, `use cache`)
- ✅ **TypeScript 5.x** (mode strict, `tsconfig.json`)
- ✅ **Supabase** (Auth, Database, RLS, Storage - `supabase/`)
- ✅ **Turbopack** (bundler par défaut en dev)
- ✅ **Tailwind CSS + shadcn/ui** (`tailwind.config.ts`, `components/ui/`)
- ✅ **Zod** (validation runtime - `lib/schemas/`)
- ✅ **Resend** (emails - `lib/email/`)
- ✅ **Sentry** (monitoring - `sentry.*.config.ts`)

**Indicateurs d'architecture:**

- 📁 Route groups: `(admin)`, `(marketing)` → Multi-layout application
- 📁 Feature-based organization: `components/features/`, `lib/dal/`
- 📁 Data Access Layer: 29 modules DAL (~7,310 lignes de code)
- 📁 Schemas Zod: 23 fichiers de validation
- 📁 Memory Bank: Documentation vivante dans `memory-bank/`

### 1.2 Patterns Architecturaux Observés

**Monorepo:** Non (projet unique)  
**Microservices:** Non (monolithe modulaire)  
**Frontend:** Oui (Server Components + Client Components)  
**API Routes:** Oui (webhooks, endpoints publics dans `app/api/`)  
**SSR/SSG:** Mixte (Server Components + ISR patterns)

**Organisation dominante:** Par feature/domaine métier (home, spectacles, presse, team, media, agenda, etc.)

**Organisation dominante:** Par feature/domaine métier (home, spectacles, presse, team, media, agenda, etc.)

---

## 2. Vue d'Ensemble Structurelle

### 2.1 Principes d'Organisation

**1. Séparation Server vs Client:**

- **Par défaut:** Server Components (rendering côté serveur, accès DB direct)
- **Interactivité:** Client Components marqués `'use client'` (state, events, hooks)
- **Règle:** Minimiser les Client Components, maximiser Server Components

**2. Architecture en couches:**

```bash
┌─────────────────────────────────────────┐
│  UI Layer (app/, components/)          │  ← Pages, layouts, composants
├─────────────────────────────────────────┤
│  Actions Layer (lib/actions/)          │  ← Server Actions, orchestration
├─────────────────────────────────────────┤
│  DAL (lib/dal/)                        │  ← Accès DB pur, SOLID principles
├─────────────────────────────────────────┤
│  Services (lib/email/, lib/services/)  │  ← APIs externes, email, SMS
├─────────────────────────────────────────┤
│  Supabase (auth, database, storage)    │  ← Backend-as-a-Service
└─────────────────────────────────────────┘
```

**3. Feature-based organization:**

- Chaque domaine métier (spectacles, presse, team, media) a:
  - DAL: `lib/dal/<feature>.ts`
  - Schemas: `lib/schemas/<feature>.ts`
  - Admin UI: `app/(admin)/admin/<feature>/`
  - Public UI: `app/(marketing)/<feature>/` ou `components/features/public-site/<feature>/`
  - Components: `components/features/admin/<feature>/`

**4. Route Groups (Next.js 16):**

- `(admin)/` → Zone admin avec `AppSidebar`, authentification requise
- `(marketing)/` → Site public avec `Header` + `Footer`
- Layouts différenciés sans affecter les URLs

**5. Data flow pattern:**

```bash
User → Page (Server Component) → DAL → Database
                ↓
     View (Client Component) ← State sync via useEffect
                ↓
     Form → Server Action → DAL → revalidatePath()
```

### 2.2 Rationale Architectural

**Pourquoi cette structure ?**

- **Performance:** Server Components réduisent le JS client (~40% bundle size)
- **Sécurité:** DAL server-only empêche exposition des secrets
- **Maintenabilité:** SOLID principles (90%+ compliance), fonctions < 30 lignes
- **Scalabilité:** Features indépendantes, ajout sans régressions
- **SEO:** SSR par défaut, streaming avec Suspense

---

## 3. Visualisation de la Structure

### 3.1 Arborescence Complète (Profondeur 4)

```bash
/home/yandev/projets/rougecardinalcompany/
│
├── app/                                    # Next.js App Router (routes + pages)
│   ├── layout.tsx                          # Root layout (HTML shell, ThemeProvider)
│   ├── page.tsx                            # Redirect vers (marketing)
│   ├── globals.css                         # Styles globaux Tailwind
│   ├── error.tsx                           # Error boundary global
│   ├── global-error.tsx                    # Global error handler
│   │
│   ├── (admin)/                            # Route group admin
│   │   └── admin/
│   │       ├── layout.tsx                  # Admin layout (AppSidebar + auth)
│   │       ├── page.tsx                    # Dashboard admin
│   │       ├── loading.tsx                 # Loading state global
│   │       ├── home/                       # Gestion page d'accueil
│   │       │   ├── about/
│   │       │   ├── hero/
│   │       │   ├── news/
│   │       │   ├── partners/
│   │       │   └── shows/
│   │       ├── spectacles/                 # CRUD spectacles
│   │       ├── presse/                     # CRUD presse (articles, releases, contacts)
│   │       ├── team/                       # CRUD équipe
│   │       ├── media/                      # Media library
│   │       ├── agenda/                     # CRUD événements
│   │       ├── lieux/                      # CRUD lieux (TASK055)
│   │       ├── partners/                   # CRUD partenaires
│   │       ├── users/                      # Gestion utilisateurs
│   │       ├── site-config/                # Display toggles
│   │       ├── analytics/                  # Analytics admin
│   │       └── audit-logs/                 # Logs d'audit
│   │
│   ├── (marketing)/                        # Route group public
│   │   ├── layout.tsx                      # Public layout (Header + Footer)
│   │   ├── page.tsx                        # Homepage (/)
│   │   ├── spectacles/                     # Liste spectacles publique
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── presse/                         # Presse publique
│   │   ├── agenda/                         # Agenda événements
│   │   ├── compagnie/                      # À propos
│   │   ├── contact/                        # Contact
│   │   ├── auth/                           # Auth redirects
│   │   └── protected/                      # Page protégée exemple
│   │
│   ├── api/                                # API Routes (webhooks, public endpoints)
│   │   ├── contact/route.ts                # Contact form API
│   │   ├── newsletter/route.ts             # Newsletter subscription
│   │   ├── webhooks/                       # Webhooks Supabase/Stripe
│   │   ├── admin/route.ts                  # Admin API
│   │   └── test-*/                         # Routes de test
│   │
│   ├── auth/                               # Auth UI pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   ├── update-password/
│   │   └── confirm/
│   │
│   └── debug-auth/                         # Outils debug auth (dev only)
│
├── components/                             # Composants React
│   ├── ui/                                 # shadcn/ui primitives (45 composants)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── sidebar.tsx
│   │   └── ...
│   │
│   ├── features/                           # Composants par feature
│   │   ├── admin/                          # Composants admin
│   │   │   ├── home/                       # Hero, About, Partners, etc.
│   │   │   ├── spectacles/                 # CRUD spectacles UI
│   │   │   ├── presse/                     # CRUD presse UI
│   │   │   ├── team/                       # CRUD team UI
│   │   │   ├── media/                      # Media library UI
│   │   │   ├── agenda/                     # CRUD agenda UI
│   │   │   ├── lieux/                      # CRUD lieux UI
│   │   │   ├── partners/                   # CRUD partners UI
│   │   │   ├── site-config/                # Display toggles UI
│   │   │   ├── analytics/                  # Analytics UI
│   │   │   └── audit-logs/                 # Audit logs UI
│   │   │
│   │   └── public-site/                    # Composants public
│   │       ├── home/                       # Homepage components
│   │       ├── spectacles/                 # Spectacles publics
│   │       ├── presse/                     # Presse publique
│   │       ├── agenda/                     # Agenda public
│   │       └── compagnie/                  # À propos
│   │
│   ├── layout/                             # Layouts globaux
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── AppSidebar.tsx
│   │
│   ├── auth/                               # Auth components
│   ├── admin/dashboard/                    # Dashboard widgets
│   ├── error-boundaries/                   # Error boundaries
│   └── skeletons/                          # Loading skeletons
│
├── lib/                                    # Bibliothèques métier
│   ├── dal/                                # Data Access Layer (29 modules)
│   │   ├── helpers/                        # Helpers DAL centralisés
│   │   │   ├── error.ts                    # DALResult<T> type
│   │   │   ├── format.ts                   # Formatage dates/strings
│   │   │   ├── slug.ts                     # Génération slugs
│   │   │   └── index.ts                    # Barrel exports
│   │   ├── admin-home-hero.ts              # Hero slides CRUD
│   │   ├── admin-home-about.ts             # About sections CRUD
│   │   ├── admin-lieux.ts                  # Lieux CRUD (TASK055)
│   │   ├── admin-partners.ts               # Partners CRUD
│   │   ├── admin-press-*.ts                # Presse CRUD
│   │   ├── admin-users.ts                  # Users CRUD
│   │   ├── spectacles.ts                   # Spectacles data access
│   │   ├── team.ts                         # Team data access
│   │   ├── media.ts                        # Media library
│   │   ├── site-config.ts                  # Display toggles
│   │   └── ...                             # 29 modules au total
│   │
│   ├── schemas/                            # Validation Zod (23 schémas)
│   │   ├── index.ts                        # Barrel exports
│   │   ├── admin-lieux.ts                  # Lieux schemas (Server + UI)
│   │   ├── home.ts                         # Home schemas
│   │   ├── spectacles.ts                   # Spectacles schemas
│   │   ├── team.ts                         # Team schemas
│   │   ├── media.ts                        # Media schemas
│   │   └── ...
│   │
│   ├── actions/                            # Server Actions groupées
│   │   ├── admin-home-hero-actions.ts
│   │   ├── admin-lieux-actions.ts
│   │   └── ...
│   │
│   ├── email/                              # Intégration Resend
│   │   ├── actions.ts                      # Email Server Actions
│   │   └── client.ts                       # Resend client
│   │
│   ├── auth/                               # Auth utilities
│   │   ├── is-admin.ts                     # requireAdmin() guard
│   │   └── guards.ts                       # Auth guards
│   │
│   ├── services/                           # Services externes
│   ├── hooks/                              # Custom React hooks
│   ├── utils/                              # Utilitaires purs
│   ├── constants/                          # Constantes app
│   ├── types/                              # Types TypeScript globaux
│   └── env.ts                              # T3 Env (type-safe env vars)
│
├── supabase/                               # Configuration Supabase
│   ├── schemas/                            # Schémas déclaratifs (source of truth)
│   │   ├── 01_auth_extensions.sql
│   │   ├── 10_users_profiles.sql
│   │   ├── 15_content_versioning.sql
│   │   ├── 20_spectacles.sql
│   │   ├── 25_media.sql
│   │   ├── 30_presse.sql
│   │   └── ...
│   │
│   ├── migrations/                         # Migrations générées
│   │   └── YYYYMMDDHHMMSS_*.sql            # Timestamped migrations
│   │
│   ├── functions/                          # Edge Functions
│   │   └── scheduled-cleanup/
│   │
│   ├── config.toml                         # Config Supabase CLI
│   ├── server.ts                           # Server Client (optimisé)
│   ├── client.ts                           # Browser Client
│   ├── admin.ts                            # Admin Client (service role)
│   └── middleware.ts                       # Middleware Client
│
├── memory-bank/                            # Documentation vivante
│   ├── projectbrief.md                     # Brief projet
│   ├── productContext.md                   # Contexte produit
│   ├── activeContext.md                    # Contexte actif (CRITICAL)
│   ├── systemPatterns.md                   # Patterns architecture
│   ├── techContext.md                      # Stack technique
│   ├── progress.md                         # État avancement
│   ├── architecture/                       # Docs architecture
│   │   ├── Project_Architecture_Blueprint.md
│   │   ├── Project_Folders_Structure_Blueprint_v6.md (ce fichier)
│   │   └── file-tree.md
│   ├── tasks/                              # Tâches détaillées
│   │   ├── _index.md
│   │   ├── tasks-completed/
│   │   └── TASK*.md
│   └── epics/                              # Epics projet
│
├── scripts/                                # Scripts utilitaires
│   ├── test-admin-access.ts               # Test RLS admin
│   ├── check-email-logs.ts                # Audit emails
│   ├── test-invitation-email/             # Tests emails
│   └── utils/
│
├── emails/                                 # Templates emails (React Email)
│   └── utils/
│
├── public/                                 # Assets statiques
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
├── doc/                                    # Documentation technique
│   ├── prompts-github/                     # Prompts AI
│   ├── resend_integration/                 # Intégration Resend
│   └── *.md                                # Guides divers
│
├── .github/                                # Config GitHub
│   ├── instructions/                       # Instructions AI (17 fichiers)
│   │   ├── nextjs.instructions.md
│   │   ├── dal-solid-principles.instructions.md
│   │   ├── crud-server-actions-pattern.instructions.md
│   │   └── ...
│   ├── prompts/                            # Prompts migration
│   └── copilot-instructions.md             # GitHub Copilot config
│
├── __tests__/                              # Tests
│   └── emails/
│
├── proxy.ts                                # Middleware (renamed from middleware.ts)
├── next.config.ts                          # Config Next.js 16
├── tsconfig.json                           # Config TypeScript
├── tailwind.config.ts                      # Config Tailwind
├── package.json                            # Dependencies
├── pnpm-lock.yaml                          # Lock file
├── components.json                         # shadcn/ui config
└── instrumentation.ts                      # Next.js instrumentation
```

### 3.2 Statistiques de Structure

**Métriques de code:**

- **DAL:** 29 modules, ~7,310 lignes de code TypeScript
- **Schemas Zod:** 23 fichiers de validation
- **Composants UI:** 45+ composants shadcn/ui
- **Features admin:** 15 sections (home, spectacles, presse, team, media, agenda, lieux, partners, users, site-config, analytics, audit-logs, debug-auth)
- **Migrations Supabase:** 100+ migrations SQL
- **Tables BDD:** 36+ tables avec RLS

**Métriques de code:**

- **DAL:** 29 modules, ~7,310 lignes de code TypeScript
- **Schemas Zod:** 23 fichiers de validation
- **Composants UI:** 45+ composants shadcn/ui
- **Features admin:** 15 sections (home, spectacles, presse, team, media, agenda, lieux, partners, users, site-config, analytics, audit-logs, debug-auth)
- **Migrations Supabase:** 100+ migrations SQL
- **Tables BDD:** 36+ tables avec RLS

---

## 4. Analyse Détaillée par Répertoire

### 4.1 `app/` - Application Router (Next.js 16)

**Rôle:** Définition des routes, pages, layouts, et API routes. Architecture App Router avec Server Components par défaut.

**Patterns observés:**

#### Route Groups

- `(admin)/` → Zone administrateur
  - Layout: `AppSidebar` (navigation latérale)
  - Auth: Middleware vérifie `is_admin()` via RLS
  - Pages: CRUD interfaces avec Server Actions
  
- `(marketing)/` → Site public
  - Layout: `Header` + `Footer` responsive
  - Auth: Optionnel (pages publiques)
  - Pages: Contenu SSR avec Suspense streaming

#### Server Components Pattern

```typescript
// app/(admin)/admin/lieux/page.tsx
export const metadata = { title: "Lieux | Admin" };

// ✅ CRITICAL: Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LieuxPage() {
  // Direct DAL call (Server Component)
  const lieux = await fetchAllLieuxAdmin();
  
  return (
    <Suspense fallback={<LieuxSkeleton />}>
      <LieuxContainer initialData={lieux} />
    </Suspense>
  );
}
```

#### API Routes Pattern

```typescript
// app/api/contact/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = ContactSchema.parse(body);
  
  // Primary operation
  const messageId = await createContactMessage(validated);
  
  // Secondary (graceful degradation)
  try {
    await sendContactNotification(validated);
  } catch (emailError) {
    console.error('[Contact] Email failed:', emailError);
  }
  
  return NextResponse.json({ status: 'sent' });
}
```

**Conventions de fichiers:**

- `page.tsx` → Route accessible
- `layout.tsx` → Layout partagé
- `loading.tsx` → Loading state (Suspense fallback)
- `error.tsx` → Error boundary
- `route.ts` → API Route Handler
- `actions.ts` → Server Actions co-localisées (admin features)

**Recommandations:**

- ✅ Toujours `export const dynamic = 'force-dynamic'` sur pages lisant cookies Supabase
- ✅ Utiliser Suspense boundaries pour streaming
- ✅ Co-localiser Server Actions dans `app/(admin)/admin/<feature>/actions.ts`
- ❌ Éviter logique métier complexe dans pages (déléguer au DAL)

---

### 4.2 `components/` - Composants React

**Rôle:** Composants UI réutilisables, organisés par type et feature.

**Structure:**

#### `components/ui/` - Primitives shadcn/ui

- 45+ composants base (Button, Card, Dialog, Form, Table, etc.)
- Source: [shadcn/ui](https://ui.shadcn.com/)
- Customisés avec Tailwind CSS variants
- **Règle:** NE PAS modifier directement, utiliser composition

#### `components/features/` - Composants par feature

**Pattern Smart/Dumb:**

**Smart Components (Containers):**

```typescript
// Server Smart Component (préféré)
// components/features/admin/lieux/Container.tsx
export async function LieuxContainer() {
  const result = await fetchAllLieuxAdmin(); // DAL call
  
  if (!result.success) {
    return <ErrorDisplay error={result.error} />;
  }
  
  return <LieuxView initialData={result.data} />;
}

// Client Smart Component (si interactivité nécessaire)
'use client'
export function LieuxViewContainer({ initialData }) {
  const [lieux, setLieux] = useState(initialData);
  
  // State management, handlers...
  
  return <LieuxList lieux={lieux} onEdit={handleEdit} />;
}
```

**Dumb Components (Presentational):**

```typescript
// components/features/admin/lieux/LieuxList.tsx
interface LieuxListProps {
  lieux: LieuDTO[];
  onEdit?: (lieu: LieuDTO) => void;
  onDelete?: (id: string) => void;
}

export function LieuxList({ lieux, onEdit, onDelete }: LieuxListProps) {
  // Pure presentation, no business logic
  return (
    <div className="grid gap-4">
      {lieux.map(lieu => (
        <LieuCard key={lieu.id} lieu={lieu} onEdit={onEdit} />
      ))}
    </div>
  );
}
```

**Conventions:**

- Max 300 lignes par fichier → split en sous-composants si dépassement
- Suffixes: `Container`, `View`, `Form`, `List`, `Card`, `Fields`, `Section`
- Props interfaces: co-localisées dans `types.ts` ou au top du fichier

**Structure feature typique:**

```bash
components/features/admin/lieux/
├── Container.tsx           # Server Component (data fetching)
├── View.tsx                # Client Component (state + handlers)
├── Form.tsx                # Form principal (<300 lignes)
├── FormFields.tsx          # Sub-component: champs texte
├── FormImageSection.tsx    # Sub-component: sélection image
├── LieuxList.tsx           # List display
├── LieuCard.tsx            # Card display
└── types.ts                # Props interfaces
```

---

### 4.3 `lib/dal/` - Data Access Layer (CRITIQUE)

**Rôle:** Unique point d'accès à la base de données. Toutes les opérations DB passent par ces modules.

**Architecture SOLID (92% compliance):**

- **S**ingle Responsibility: 1 fichier = 1 table/entité
- **O**pen/Closed: Extensible via validation, pas de logique hard-codée
- **L**iskov Substitution: Interface `DALResult<T>` cohérente
- **I**nterface Segregation: Dépendances minimales (Supabase + Auth uniquement)
- **D**ependency Inversion: AUCUNE dépendance Next.js/email/SMS

**Pattern DAL Standard:**

```typescript
// lib/dal/admin-lieux.ts
"use server";
import "server-only"; // MANDATORY - empêche exécution client

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { LieuInputSchema, type LieuDTO } from "@/lib/schemas/admin-lieux";
import type { DALResult } from "./helpers/error";

/**
 * Fetch all lieux (admin view)
 * @returns All lieux or error
 */
export const fetchAllLieuxAdmin = cache(async (): Promise<DALResult<LieuDTO[]>> => {
  try {
    await requireAdmin(); // Authorization check
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lieux")
      .select("*")
      .order("nom", { ascending: true });
    
    if (error) {
      return {
        success: false,
        error: `[ERR_LIEUX_001] Failed to fetch lieux: ${error.message}`,
      };
    }
    
    return { success: true, data: data ?? [] };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
});

/**
 * Create new lieu
 * @param input - Lieu data (validated)
 * @returns Created lieu or error
 */
export async function createLieu(
  input: LieuInput
): Promise<DALResult<LieuDTO>> {
  try {
    await requireAdmin();
    
    // Validation (Zod schema)
    const validated = LieuInputSchema.parse(input);
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lieux")
      .insert(validated)
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: `[ERR_LIEUX_002] Failed to create lieu: ${error.message}`,
      };
    }
    
    // ✅ NO revalidatePath() here - that's in Server Actions
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
```

**Règles DAL CRITIQUES:**

❌ **FORBIDDEN IMPORTS (violations DIP):**

```typescript
// ❌ NEVER import these in DAL files
import { revalidatePath } from "next/cache";     // Violates DIP
import { revalidateTag } from "next/cache";      // Violates DIP
import { sendEmail } from "@/lib/services/email"; // Violates SRP
import { sendSMS } from "@/lib/services/sms";     // Violates SRP
```

✅ **ALLOWED IMPORTS:**

```typescript
// ✅ Required imports only
import "server-only";                            // MANDATORY
import { cache } from "react";                   // Caching
import { createClient } from "@/supabase/server"; // DB client
import { requireAdmin } from "@/lib/auth/is-admin"; // Auth guard
import { z } from "zod";                         // Validation
import type { Database } from "@/lib/database.types"; // Types
```

**DAL Helpers (`lib/dal/helpers/`):**

```typescript
// lib/dal/helpers/error.ts
export interface DALResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string; // Optional (Warning Pattern)
}

export function toDALResult<T>(
  data: T | null,
  error: Error | null
): DALResult<T> {
  if (error) {
    return { success: false, error: error.message };
  }
  if (!data) {
    return { success: false, error: "Data not found" };
  }
  return { success: true, data };
}
```

**29 Modules DAL:**

1. `admin-agenda.ts` - Événements agenda
2. `admin-home-about.ts` - Sections About
3. `admin-home-hero.ts` - Hero slides
4. `admin-lieux.ts` - Lieux (TASK055)
5. `admin-partners.ts` - Partenaires
6. `admin-press-articles.ts` - Articles presse
7. `admin-press-contacts.ts` - Contacts presse
8. `admin-press-releases.ts` - Communiqués presse
9. `admin-users.ts` - Utilisateurs
10. `agenda.ts` - Agenda public
11. `analytics.ts` - Analytics
12. `audit-logs.ts` - Logs d'audit
13. `compagnie-presentation.ts` - Présentation compagnie
14. `compagnie.ts` - Compagnie
15. `contact.ts` - Messages contact
16. `dashboard.ts` - Dashboard admin
17. `data-retention.ts` - Rétention données RGPD
18. `home-about.ts` - About public
19. `home-hero.ts` - Hero public
20. `home-news.ts` - Actualités
21. `home-newsletter.ts` - Newsletter
22. `home-partners.ts` - Partenaires public
23. `home-shows.ts` - Spectacles homepage
24. `media-usage.ts` - Usage médias
25. `media.ts` - Media library
26. `newsletter-subscriber.ts` - Subscribers newsletter
27. `presse.ts` - Presse public
28. `site-config.ts` - Display toggles
29. `spectacles.ts` - Spectacles public
30. `team.ts` - Équipe

**Recommandations:**

- ✅ Fonctions < 30 lignes (extraire helpers si dépassement)
- ✅ Return `DALResult<T>`, JAMAIS throw errors
- ✅ Utiliser `cache()` pour opérations read fréquentes
- ✅ Error codes: `[ERR_ENTITY_NNN]` format
- ✅ Validation Zod AVANT insertion DB

- ✅ Validation Zod AVANT insertion DB

---

### 4.4 `lib/actions/` - Server Actions

**Rôle:** Orchestration des mutations (validation + DAL + revalidation + services externes).

**Pattern Server Action Standard:**

```typescript
// lib/actions/admin-lieux-actions.ts
"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { createLieu, updateLieu, deleteLieu } from "@/lib/dal/admin-lieux";
import { sendAdminNotification } from "@/lib/email/actions";
import type { LieuInput } from "@/lib/schemas/admin-lieux";

export type ActionResult<T = unknown> =
  | { success: true; data?: T; warning?: string }
  | { success: false; error: string };

/**
 * Create lieu with admin notification
 * @param input - Lieu data (unknown for validation)
 * @returns Action result with optional warning
 */
export async function createLieuAction(input: unknown): Promise<ActionResult> {
  try {
    // 1. DAL operation (critical)
    const result = await createLieu(input as LieuInput);
    
    if (!result.success) {
      return { success: false, error: result.error ?? "Failed to create lieu" };
    }
    
    // 2. Email notification (non-critical, silent catch - Warning Pattern)
    let emailSent = true;
    try {
      await sendAdminNotification({
        type: "lieu_created",
        data: result.data,
      });
    } catch (error) {
      console.error("[Email] Failed to send notification:", error);
      emailSent = false;
    }
    
    // 3. Cache revalidation (ONLY in Server Actions, NEVER in DAL)
    revalidatePath("/admin/lieux");
    revalidatePath("/agenda"); // Affected public pages
    
    // 4. Return with warning if email failed
    return {
      success: true,
      data: result.data,
      ...(!emailSent && {
        warning: "Lieu created but admin notification email could not be sent",
      }),
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
```

**Warning Pattern (Graceful Degradation):**

- **Problème:** Échec email ne doit PAS rollback opération DB
- **Solution:** Silent catch + warning dans response

```typescript
// ✅ CORRECT: DB operation succeeds even if email fails
const dbResult = await createRecord(data);
try {
  await sendEmail(data); // Non-critical
} catch (emailError) {
  console.error("[Email] Failed:", emailError);
  // Don't throw - log and continue
}
return { success: true, warning: "Email failed" };

// ❌ WRONG: Email failure breaks entire operation
const dbResult = await createRecord(data);
await sendEmail(data); // If this fails, entire operation fails
```

**Recommandations:**

- ✅ Toujours valider input avec Zod avant appel DAL
- ✅ `revalidatePath()` UNIQUEMENT dans Server Actions
- ✅ Return `ActionResult<T>` avec optional `warning`
- ✅ Appel DAL en premier (critique), services externes après (non-critiques)
- ❌ Jamais de logique DB directe (déléguer au DAL)

---

### 4.5 `lib/schemas/` - Validation Zod

**Rôle:** Schémas de validation runtime avec TypeScript inference.

**Pattern Dual Schema (Server vs UI):**

**Problème:** `bigint` (PostgreSQL) incompatible avec JSON serialization (React Hook Form)

**Solution:** Créer 2 schémas séparés

```typescript
// lib/schemas/admin-lieux.ts
import { z } from "zod";

/**
 * SERVER SCHEMA (pour DAL/Database)
 * Uses bigint for PostgreSQL compatibility
 */
export const LieuInputSchema = z.object({
  nom: z.string().min(1, "Nom requis").max(100),
  adresse: z.string().min(1, "Adresse requise").max(255),
  ville: z.string().min(1, "Ville requise").max(100),
  code_postal: z.string().regex(/^\d{5}$/, "Code postal invalide"),
  pays: z.string().length(2, "Code pays ISO 2 lettres"),
  capacite: z.number().int().positive().optional(),
  site_web: z.string().url().optional(),
  // ✅ bigint pour database IDs
  image_media_id: z.coerce.bigint().optional(),
});

export type LieuInput = z.infer<typeof LieuInputSchema>;

/**
 * UI SCHEMA (pour React Hook Form)
 * Uses number for form compatibility
 */
export const LieuFormSchema = z.object({
  nom: z.string().min(1, "Nom requis").max(100),
  adresse: z.string().min(1, "Adresse requise").max(255),
  ville: z.string().min(1, "Ville requise").max(100),
  code_postal: z.string().regex(/^\d{5}$/, "Code postal invalide"),
  pays: z.string().length(2, "Code pays ISO 2 lettres"),
  capacite: z.number().int().positive().optional(),
  site_web: z.string().url().optional(),
  // ✅ number pour forms (sera converti en bigint dans Server Action)
  image_media_id: z.number().int().positive().optional(),
});

export type LieuFormValues = z.infer<typeof LieuFormSchema>;

/**
 * DTO (returned by DAL)
 */
export interface LieuDTO {
  id: bigint;
  nom: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  capacite: number | null;
  site_web: string | null;
  image_media_id: bigint | null;
  created_at: string;
  updated_at: string;
}
```

**Utilisation dans Forms:**

```typescript
// components/features/admin/lieux/Form.tsx
'use client'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LieuFormSchema, type LieuFormValues } from "@/lib/schemas/admin-lieux";

export function LieuForm({ lieu }: FormProps) {
  // ✅ Use UI schema (no type casting needed)
  const form = useForm<LieuFormValues>({
    resolver: zodResolver(LieuFormSchema),
    defaultValues: lieu ? {
      nom: lieu.nom,
      ville: lieu.ville,
      pays: lieu.pays || "FR", // Default handled in defaultValues
      // Convert bigint → number for UI
      image_media_id: lieu.image_media_id !== null 
        ? Number(lieu.image_media_id) 
        : undefined,
    } : {
      nom: "",
      ville: "",
      pays: "FR", // UI default
      image_media_id: undefined,
    },
  });
  
  // Type is LieuFormValues (UI with number)
  const onSubmit = async (data: LieuFormValues) => {
    // Server Action converts number → bigint automatically
    const result = await createLieuAction(data);
    // ...
  };
}
```

**23 Fichiers de Schémas:**

1. `admin-lieux.ts` - Lieux validation
2. `agenda.ts` - Agenda events
3. `contact.ts` - Contact form
4. `home.ts` - Homepage sections
5. `media.ts` - Media library
6. `newsletter.ts` - Newsletter
7. `partners.ts` - Partners
8. `presse.ts` - Press articles/releases
9. `site-config.ts` - Display toggles
10. `spectacles.ts` - Shows
11. `team.ts` - Team members
12. ... (23 total)

**Conventions:**

- Suffixes: `InputSchema` (server), `FormSchema` (UI), `DTO` (interface)
- Exports: `export type X = z.infer<typeof XSchema>`
- Barrel export: `lib/schemas/index.ts` re-exports tous les schémas
- Validation errors: Messages en français côté client

---

### 4.6 `supabase/` - Backend Configuration

**Rôle:** Configuration backend Supabase (auth, database, storage, RLS).

**Structure:**

#### `supabase/schemas/` - Source of Truth (Declarative Schema)

- Schémas SQL déclaratifs (état final souhaité)
- Générer migrations avec `supabase db diff -f <name>`
- Organisation par domaine:
  - `01_auth_extensions.sql` - Auth config
  - `10_users_profiles.sql` - Users/profiles
  - `15_content_versioning.sql` - Versioning
  - `20_spectacles.sql` - Shows
  - `25_media.sql` - Media library
  - `30_presse.sql` - Press
  - `40_lieux.sql` - Lieux (TASK055)
  - `90_rls_policies.sql` - RLS policies

#### `supabase/migrations/` - Generated Migrations

- Format: `YYYYMMDDHHMMSS_description.sql`
- Générées automatiquement avec `supabase db diff`
- **RÈGLE:** NE JAMAIS éditer directement (modifier `schemas/` à la place)
- **Exception:** Hotfixes urgents (puis synchroniser `schemas/`)

**Workflow Declarative Schema:**

```bash
# 1. Stop local database
pnpm dlx supabase stop

# 2. Edit schema file
# supabase/schemas/40_lieux.sql

# 3. Generate migration
pnpm dlx supabase db diff -f add_lieux_table

# 4. Review generated migration
# supabase/migrations/20260126120000_add_lieux_table.sql

# 5. Start database
pnpm dlx supabase start

# 6. Push to remote (production)
pnpm dlx supabase db push
```

**Hotfix Workflow (Emergency):**

```bash
# 1. Create timestamped migration manually
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_fix_critical_bug.sql

# 2. Apply to production
pnpm dlx supabase db push

# 3. MANDATORY: Update declarative schema to match
# Edit supabase/schemas/XX_affected_entity.sql

# 4. Document in migrations.md
echo "YYYYMMDDHHMMSS_fix_critical_bug.sql - Integrated in schemas/XX_affected_entity.sql" >> supabase/migrations/migrations.md
```

**RLS (Row Level Security):**

- **36/36 tables** ont RLS activé
- Pattern public: `published_at IS NOT NULL` OR `active = true` (read-only)
- Pattern admin: `(select public.is_admin()) = true`
- **Security Invoker Views:** Require GRANT sur tables de base

**Supabase Clients:**

```typescript
// supabase/server.ts - Server Client (optimisé JWT)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!, // New publishable key
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// supabase/client.ts - Browser Client
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )
}

// supabase/admin.ts - Admin Client (service role)
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!, // Service role key
    {
      auth: { persistSession: false }
    }
  )
}
```

**Auth Optimization (JWT Signing Keys):**

- **Performance:** ~2-5ms local JWT verification vs ~300ms network call
- **Migration:** Supabase Dashboard → JWT Keys → Migrate to Signing Keys
- **Usage:** `getClaims()` pour auth checks, `getUser()` uniquement si besoin full profile

---

### 4.7 `memory-bank/` - Documentation Vivante

**Rôle:** Documentation structurée et maintenue à jour (architecture, tâches, décisions).

**Structure:**

```bash
memory-bank/
├── projectbrief.md          # Brief projet (vision globale)
├── productContext.md        # Pourquoi ce projet existe
├── activeContext.md         # ⚠️ CRITIQUE: Contexte actif, changements récents
├── systemPatterns.md        # Patterns architecture documentés
├── techContext.md           # Stack technique détaillée
├── progress.md              # État avancement global
├── architecture/            # Docs architecture
│   ├── Project_Architecture_Blueprint.md
│   ├── Project_Folders_Structure_Blueprint_v6.md (ce fichier)
│   └── file-tree.md         # Arborescence complète
├── tasks/                   # Tâches détaillées (TASK001-TASK055+)
│   ├── _index.md            # Index des tâches par statut
│   ├── tasks-completed/     # Tâches complétées archivées
│   └── TASK*.md             # Fichiers individuels par tâche
├── epics/                   # Epics projet (features majeures)
│   ├── details/
│   └── epic-*.md
├── procedures/              # Procédures opérationnelles
└── changes/                 # Logs de changements importants
```

**Memory Bank Update Triggers:**

- Changements d'architecture significatifs
- Implémentation de nouveaux patterns
- User request "update memory bank"
- Avant développement de feature majeure
- Après complétion de tasks

**`activeContext.md` - CRITICAL:**

- Document le plus important pour comprendre le contexte actuel
- Mis à jour à chaque changement majeur
- Contient: recent changes, current focus, ongoing work, blockers

**Task File Template:**

```markdown
# TASK055 - Implement Lieux Management

**Status:** Completed
**Added:** 2026-01-20
**Updated:** 2026-01-26

## Progress Tracking

**Overall Status:** Complete - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 55.1 | Create DAL functions | Complete | 2026-01-26 | ✅ |
| 55.2 | Build Server Actions | Complete | 2026-01-26 | ✅ |
| 55.3 | Create UI Components | Complete | 2026-01-26 | ✅ |

## Progress Log

### 2026-01-26
- Completed Phase 2: CRUD interface
- Fixed TypeScript resolver error (removed z.coerce)
- Implemented dual schema pattern (Server + UI)
```

---

### 4.8 `scripts/` - Utilitaires & Tests

**Rôle:** Scripts Node.js/TypeScript pour tests, maintenance, diagnostics.

**Catégories:**

#### Tests & Validation

```bash
scripts/
├── test-admin-access.ts          # Validate RLS admin policies
├── check-email-logs.ts            # Email audit logs
├── test-invitation-email/         # Email template testing
├── check-presse-toggles.ts        # Display toggles status
└── toggle-presse.ts               # Enable/disable toggles
```

#### Diagnostic & Debugging

```bash
scripts/
├── utils/
│   └── supabase-client.ts         # Shared Supabase client
└── Archived-tests/                # Old test scripts
```

**Pattern Script Standard:**

```typescript
// scripts/test-admin-access.ts
import { createAdminClient } from '@/supabase/admin'
import { createClient } from '@/lib/supabase/anon'

async function testAdminAccess() {
  console.log('🧪 Testing admin access controls...')
  
  // Test 1: Anon user should be blocked
  const anonClient = createClient()
  const { data: anonData, error: anonError } = await anonClient
    .from('membres_equipe')
    .select('*')
  
  if (anonError) {
    console.log('✅ Anon properly blocked from admin table')
  } else {
    console.error('❌ SECURITY ISSUE: Anon can access admin data!')
    process.exit(1)
  }
  
  // Test 2: Admin client should succeed
  const adminClient = createAdminClient()
  const { data: adminData, error: adminError } = await adminClient
    .from('membres_equipe')
    .select('*')
  
  if (!adminError && adminData) {
    console.log('✅ Admin client has proper access')
  }
}

testAdminAccess()
```

**Exécution:**

```bash
pnpm exec tsx scripts/test-admin-access.ts
```

---

## 5. Patterns de Placement de Fichiers

### 5.1 Où Mettre Quoi ?

**Pages & Routes:**

- Pages publiques: `app/(marketing)/<route>/page.tsx`
- Pages admin: `app/(admin)/admin/<feature>/page.tsx`
- API publiques: `app/api/<endpoint>/route.ts`
- Auth pages: `app/auth/<action>/page.tsx`

**Data Access:**

- DAL: `lib/dal/<feature>.ts` (toutes opérations DB)
- Schemas: `lib/schemas/<feature>.ts` (validation Zod Server + UI)
- Server Actions: `lib/actions/<feature>-actions.ts` OU `app/(admin)/admin/<feature>/actions.ts`

**Components:**

- Primitives UI: `components/ui/<primitive>.tsx`
- Admin features: `components/features/admin/<feature>/`
- Public features: `components/features/public-site/<feature>/`
- Layouts: `components/layout/`
- Shared: `components/<type>/`

**Configuration:**

- Env vars: `.env.local` (dev), `.env.production` (prod)
- Type-safe env: `lib/env.ts` (T3 Env)
- Supabase schemas: `supabase/schemas/*.sql`
- Supabase migrations: `supabase/migrations/*.sql` (generated)

**Documentation:**

- Architecture: `memory-bank/architecture/`
- Tasks: `memory-bank/tasks/`
- Instructions AI: `.github/instructions/`
- Prompts: `.github/prompts/`
- Guides techniques: `doc/`

**Tests:**

- Unit tests: `__tests__/`
- Integration scripts: `scripts/`
- Email tests: `scripts/test-invitation-email/`

---

## 6. Conventions de Nommage et Organisation

### 6.1 Conventions de Fichiers

**Composants React:**

- Format: `PascalCase.tsx`
- Exemples: `HeroView.tsx`, `LieuxContainer.tsx`, `TeamCard.tsx`
- Pattern: `<Entity><Type>.tsx` (ex: `LieuForm.tsx`)

**Hooks:**

- Format: `camelCase` avec préfixe `use`
- Exemples: `useHeroSlidesDnd.ts`, `useNewsletterSubscribe.ts`
- Location: `lib/hooks/`

**DAL & Libs:**

- Format: `kebab-case`
- Exemples: `admin-home-hero.ts`, `admin-lieux.ts`, `site-config.ts`
- Location: `lib/dal/`, `lib/actions/`, `lib/schemas/`

**SQL (Tables PostgreSQL):**

- Format: `snake_case` pluriel
- Exemples: `membres_equipe`, `spectacles`, `communiques_presse`
- Colonnes: `snake_case` singulier (ex: `user_id`, `photo_url`)

**Types & Interfaces TypeScript:**

- Format: `PascalCase`
- Exemples: `LieuDTO`, `TeamMemberInput`, `ActionResult<T>`
- Suffixes: `DTO`, `Input`, `FormValues`, `Props`

### 6.2 Patterns de Nommage Spécifiques

**Server Actions:**

- Suffix: `Action`
- Exemples: `createLieuAction`, `updateTeamMemberAction`, `deletePartnerAction`

**DAL Functions:**

- Prefixes: `fetch`, `create`, `update`, `delete`, `upsert`
- Exemples: `fetchAllLieuxAdmin`, `createLieu`, `updateLieu`

**Schemas Zod:**

- Server: `<Entity>InputSchema`
- UI: `<Entity>FormSchema`
- Exemples: `LieuInputSchema`, `LieuFormSchema`

**Components:**

- Containers: `<Entity>Container`
- Views: `<Entity>View`
- Forms: `<Entity>Form`
- Lists: `<Entity>List`
- Cards: `<Entity>Card`
- Fields: `<Entity>FormFields`

---

## 7. Navigation et Workflows de Développement

### 7.1 Points d'Entrée pour Développeurs

**Root Entry Points:**

- Config Next.js: `next.config.ts`
- Root layout: `app/layout.tsx`
- Middleware: `proxy.ts` (renamed from middleware.ts in Next.js 16)
- Env vars: `lib/env.ts` (T3 Env - type-safe)

---

## 5. File placement patterns (où mettre quoi)

- Pages / routes: `app/<route>/page.tsx` (Server Component) ; actions de mutation → `app/.../actions.ts`.
- DAL: `lib/dal/<feature>.ts` — toutes opérations DB, retourne `DALResult<T>`.
- Server Actions helpers/orchestrations: `lib/actions/*` ou `app/.../actions.ts` co-localisés pour features admin.
- UI primitives: `components/ui/*`.
- Feature components: `components/features/<feature>/*`.
- Zod schemas: `lib/schemas/<feature>.ts` (exporter server vs form schemas).
- Scripts & tests: `scripts/` et `__tests__/`.
- Supabase declarative schema: `supabase/schemas/*.sql` (source of truth).

---

## 6. Conventions de nommage et organisation

- Fichiers components: `PascalCase.tsx` (ex: `HeroView.tsx`).
- Hooks utilitaires: `camelCase` (ex: `useHeroSlidesDnd.ts`).
- DAL et libs: `kebab-case` ou `snake_case` en filenames? Observé: `lib/dal/admin-home-hero.ts` (kebab). Garder cohérence: `lib/dal/<feature>.ts` (kebab).
- Tables SQL / Postgres: `snake_case` pluriel (ex: `membres_equipe`, `spectacles`).
- Types / interfaces: `PascalCase` (TypeScript).

---

## 7. Entrées principales & workflows de développement

Points d'entrée pour les devs:

- Page d'accueil / layout: `app/layout.tsx` et `app/(marketing)/page.tsx`.
- Admin root: `app/(admin)/admin/layout.tsx` puis `app/(admin)/admin/*`.
- DAL: `lib/dal/index` (barrel) et modules individuels.

Ajout d'une nouvelle feature (résumé):

1. Créer DAL `lib/dal/<feature>.ts` (server-only, DALResult<T>).  
2. Ajouter Zod schemas `lib/schemas/<feature>.ts` (server + ui).  
3. Ajouter Server Actions `app/(admin)/admin/<feature>/actions.ts` (validation + revalidatePath).  
4. Créer Server Component `app/(admin)/admin/<feature>/page.tsx` + composants client dans `components/features/<feature>/`.
5. Ajouter tests et documentation dans `memory-bank/`.

---

## 8. Build, déploiement et fichiers de configuration

- Next config: `next.config.ts` présent; respecter les exports `dynamic = 'force-dynamic'` si pages lisent cookies Supabase.
- Scripts: `package.json` avec commandes `pnpm dev`, `pnpm build`, `pnpm lint`.
- Supabase: utiliser `supabase/schemas/` pour déclaratif et `supabase/migrations/` pour hotfix uniquement.

---

## 9. Templates et exemples (quick-start)

### Template: nouvelle feature minimal

```bash
lib/dal/<feature>.ts           # DAL server-only
lib/schemas/<feature>.ts       # zod server + ui
app/(admin)/admin/<feature>/actions.ts   # server actions + revalidatePath
app/(admin)/admin/<feature>/page.tsx      # Server Component
components/features/<feature>/...         # UI components
```

### Template: schéma Zod (server / ui)

- `FeatureInputSchema` (server) — utilise `z.coerce.bigint()` pour ids
- `FeatureFormSchema` (ui) — utilise `z.number()` pour forms

---

## 10. Enforce & validation

- Linting et CI: exécuter `pnpm lint` et tests. Utiliser les règles du dépôt (ESLint, TypeScript strict).
- Contrôles manuels recommandés: vérifier `supabase/schemas/` après toute migration, valider RLS policies, s'assurer qu'aucune `revalidatePath()` n'est dans DAL.

---

## Historique & maintenance

- Dernière mise à jour: 2026-01-16
- Responsable recommandé: mettre à jour `memory-bank/activeContext.md` lors d'un changement structurel.

---

## Remarques finales et actions recommandées

- Conserver cette version dans `memory-bank/architecture/Project_Folders_Structure_Blueprint.md` comme source documentaire.
- Lors d'un hotfix DB: créer migration timestamped puis synchroniser `supabase/schemas/` (workflow d'urgence documenté).
- Relecture: vérifier que chaque nouvelle feature suit le pattern DAL → Actions → Server Component → Client View.

---

## 11. Historique des Versions

| Version | Date | Changements Majeurs |
| --------- | ------ | --------------------- |
| v6.0 | 2026-01-26 | Mise à jour complète: Next.js 16.0.10, React 19.2, TASK055 (Lieux), 29 modules DAL, 23 schémas Zod, structure détaillée avec arborescence profondeur 4, patterns complets |
| v5.0 | 2026-01-16 | Ajout Display Toggles (TASK030), DAL helpers, Media Library (TASK029) |
| v4.0 | 2025-12-31 | RLS security hardening, admin views isolation |
| v3.0 | 2025-11-27 | Route groups migration, dual schema pattern |
| v2.0 | 2025-11-12 | DAL SOLID refactoring (17 modules → 21 modules) |
| v1.0 | 2025-10-13 | Version initiale |

---

## 12. Contacts & Responsabilités

**Mainteneur principal:** Memory Bank System  
**Dernière mise à jour:** 2026-01-26  
**Prochaine révision recommandée:** 2026-04-26 (3 mois)

**En cas de doute:**

1. Consulter `memory-bank/activeContext.md` pour contexte actuel
2. Vérifier `.github/instructions/` pour règles spécifiques
3. Examiner features existantes similaires comme template
4. Tester localement avec `pnpm dev` et `pnpm build`
5. Valider RLS avec `scripts/test-admin-access.ts`

---

>**Fin du Blueprint v6 - Généré le 2026-01-26**
