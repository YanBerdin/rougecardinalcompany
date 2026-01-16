# Tech Context

**Last Updated**: 2026-01-16

Versions et dépendances clés observées dans le dépôt:

- Node.js: ^20 (devDeps)
- Next.js: **16.0.10** (security update 2025-12-13)
- TypeScript: ^5
- Tailwind CSS: ^3.4.x
- Supabase: client/server integration via `@supabase/ssr` and `@supabase/supabase-js` patterns
- **@t3-oss/env-nextjs**: **0.13.10** (type-safe env validation, added 2025-12-20)
- **@sentry/nextjs**: **8.47.0** (error monitoring & alerting, added 2026-01-13)
- **Sharp**: Image processing for thumbnails (300x300 JPEG)
- **Zod**: **4.1.12** (runtime validation)

Structure principale:

- `app/` — App Router, pages et layouts
- `components/` — composants réutilisables (ui/, features/, LogoCloud/, LogoCloudModel/)
- `lib/` — utilitaires, DAL, schemas, constants, hooks, actions, **env.ts**, **sentry/**
- `supabase/` — scripts, migrations, server client helpers

## Mises à jour récentes

| Date | Changement | Impact |
| ------ | ------------ | -------- |
| 2026-01-16 | Architecture Blueprints v6 | Documentation complète TASK029-TASK051, patterns documentés |
| 2026-01-16 | LogoCloud Refactoring | Animation marquee CSS-only, component générique réutilisable |
| 2026-01-14 | Database Backup & Recovery (TASK050) | pg_dump automation, GitHub Actions workflow, PITR runbook |
| 2026-01-14 | Error Monitoring & Alerting (TASK051) | Sentry integration, 3-level boundaries, P0/P1 alerts |
| 2026-01-10 | Audit Trigger JSON Operator Fix | Support tables hétérogènes (id/key/uuid) |
| 2026-01-08 | Postgres Upgrade | 17.4.1.069 → 17.6.1.063 (correctifs sécurité) |
| 2026-01-07 | Performance Optimization | 24 FK indexes + RLS initPlan + policies merge |
| 2025-12-30 | Storage/Folders Sync | `getFolderIdFromPath()`, 9 base folders, dynamic stats |
| 2025-12-29 | TASK029 Media Library Complete | 7 phases, 4 DAL modules, 15 RLS policies |
| 2025-12-20 | T3 Env Implementation | Type-safe env vars, ~100 lignes code supprimées |
| 2025-12-13 | Next.js 16.0.7 → 16.0.10 | Security fix (Dependabot) |
| 2025-12-13 | Handler Contact/Newsletter factorisés | `lib/actions/*-server.ts` |
| 2025-12-13 | ImageFieldGroup v2 | Composant réutilisable SSRF-safe |
| 2025-12-13 | Upload générique | `uploadMediaImage(formData, folder)` |
| 2025-12-06 | Bfcache Handler | Prévention erreurs hydratation |
| 2025-12-06 | Clean Code Refactoring | Hooks + constants extraits |

Outils et commandes utiles:

- Supabase CLI: `supabase db push`, `supabase link`
- Scripts locaux: `supabase/scripts/*` pour audit et diagnostics
- CI: GitHub Actions (workflows ajoutés pour audit, détection REVOKE, monitoring)
- **Env validation**: `pnpm tsx scripts/test-env-validation.ts`

## Stack Technologique

### Backend / Database

| Technologie | Version | Dernière MAJ |
| ------------- | --------- | -------------- |
| PostgreSQL (Supabase) | **17.6.1.063** | 2026-01-08 |
| Supabase JS Client | @supabase/supabase-js | - |
| Supabase SSR | @supabase/ssr | - |

**Historique versions Postgres** :

- 2026-01-08 : Upgrade vers 17.6.1.063 (correctifs sécurité)
- Précédent : 17.4.1.069

**Extensions actives** :

- pgcrypto (cryptographic functions)
- pg_trgm (trigram indexing for fuzzy search)
- unaccent (remove accents for search)
- citext (case-insensitive text)

### Frontend

- **Framework**: Next.js **16.0.10** (App Router, Turbopack default) — security update 2025-12-13
- **Langage**: TypeScript
- **UI Framework**:
  - Tailwind CSS pour le styling
  - shadcn/ui pour les composants
- **State Management**: React Hooks + Context API

### Backend / Services

- **Base de données**: Supabase (PostgreSQL **17.6.1.063**)
- **Authentification**: Supabase Auth (avec `@supabase/ssr` + `getClaims()`)
- **API**: Server Components + DAL `lib/dal/*` (server-only) via Supabase Client
- **Email Service**: Resend API avec React Email templates
- **Validation**: Zod schemas pour runtime validation
- **Environment Variables**: T3 Env (@t3-oss/env-nextjs) pour type-safety et validation au démarrage

### Architecture Clean Code (Dec 2025)

- **Constants**: `lib/constants/<feature>.ts` (LIMITS, DEFAULTS, CONFIG)
- **Hooks**: `lib/hooks/use<Feature><Action>.ts` (extracted logic)
- **DRY Components**: Config-driven components (CtaFieldGroup, ImageFieldGroup patterns)

### Handler Factorization Pattern (Dec 2025)

- **Contact**: `lib/actions/contact-server.ts` → `handleContactSubmission()`
- **Newsletter**: `lib/actions/newsletter-server.ts` → `handleNewsletterSubscription()`
- **DAL Newsletter**: `lib/dal/newsletter-subscriber.ts` (idempotent unique_violation)
- **Server Actions**: `app/actions/contact.actions.ts`, `app/actions/newsletter.actions.ts`

### Upload Générique Pattern (Dec 2025)

- **Actions**: `lib/actions/media-actions.ts` → `uploadMediaImage(formData, folder)`
- **Types**: `lib/actions/types.ts` → `ActionResult<T>` discriminated union
- **Delete**: `deleteMediaImage(mediaId)` avec cleanup Storage

### LogoCloud Marquee Pattern (Jan 2026)

**Composant générique réutilisable** pour affichage de logos avec animation marquee infinie.

- **Generic Component**: `components/LogoCloud/` — Logique d'affichage réutilisable
  - `LogoCloud.tsx` — Main component with two-row marquee
  - `types.ts` — TypeScript types for logos
  - `README.md` — Component documentation
  - `index.ts` — Barrel exports

- **Model Component**: `components/LogoCloudModel/` — Partners-specific model
  - `LogoCloudModel.tsx` — Consumes LogoCloud with BrandLogos data
  - `BrandLogos.tsx` — Partners logos static data

**Features**:

- ✅ Pure CSS animation (no JavaScript overhead)
- ✅ Two-row infinite scroll (opposite directions)
- ✅ Accessibility: `prefers-reduced-motion` support, alt text required
- ✅ Performance: smooth on all devices, no lag
- ✅ Reusable: works for sponsors, clients, tech stack, awards, etc.

**Migration**: Replaced heavy 3D flip cards with lightweight marquee

### Déploiement

- **Plateforme**: Vercel
- **CI/CD**: GitHub Actions
- **Environnements**: Development, Staging, Production

## Configuration du Projet

### Structure des Dossiers

```bash
/
├── app/                    # Pages et routes Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   ├── auth/              # Routes d'authentification
│   ├── protected/         # Routes protégées
│   ├── admin/             # 🆕 Backoffice administration
│   │   ├── layout.tsx     # Admin layout avec sidebar
│   │   ├── page.tsx       # Dashboard avec statistiques
│   │   └── team/          # Team management
│   │       ├── page.tsx   # Liste membres équipe
│   │       └── actions.ts # Server Actions (upload, CRUD)
│   └── api/               # API Routes
│       ├── newsletter/    # Newsletter subscription
│       ├── contact/       # Contact form
│       ├── test-email/    # Email testing (dev)
│       └── webhooks/      # Webhook handlers
│           └── resend/    # Resend webhooks
├── components/            # Composants React
│   ├── ui/               # Composants UI de base (shadcn/ui)
│   ├── features/         # Features (Smart/Dumb pattern)
│   │   ├── public-site/  # Public website features
│   │   └── admin/        # 🆕 Admin features
│   │       └── team/     # Team management UI
│   │           ├── TeamContainer.tsx
│   │           ├── TeamView.tsx
│   │           ├── TeamForm.tsx
│   │           ├── TeamList.tsx
│   │           ├── TeamCard.tsx
│   │           └── MediaPickerDialog.tsx
│   ├── skeletons/        # Loading skeletons
│   └── layout/           # Composants de layout
├── emails/               # React Email templates
│   ├── utils/            # Email layout & components
│   ├── newsletter-confirmation.tsx
│   └── contact-message-notification.tsx
├── lib/                  # Utilitaires et services
│   ├── supabase/        # Configuration Supabase
│   ├── dal/             # Data Access Layer (server-only) — 18 modules
│   │   ├── helpers/     # DAL utilities (error, format, slug)
│   │   │   ├── error.ts # DALResult<T> + toDALResult()
│   │   │   ├── format.ts
│   │   │   ├── slug.ts
│   │   │   └── index.ts # Barrel exports
│   │   ├── team.ts
│   │   ├── newsletter-subscriber.ts  # 🆕 Idempotent unique_violation
│   │   └── ...          # Other DAL modules
│   ├── schemas/         # Zod schemas centralisés (11 files)
│   │   ├── team.ts      # Server + UI schemas
│   │   ├── media.ts
│   │   └── index.ts     # Barrel exports
│   ├── actions/         # 🆕 Shared server handlers (Dec 2025)
│   │   ├── contact-server.ts      # handleContactSubmission()
│   │   ├── newsletter-server.ts   # handleNewsletterSubscription()
│   │   ├── media-actions.ts       # uploadMediaImage(), deleteMediaImage()
│   │   ├── types.ts               # ActionResult<T>
│   │   └── index.ts               # Barrel exports
│   ├── email/           # Email actions & schemas
│   ├── hooks/           # Custom React hooks
│   ├── constants/       # Feature constants (LIMITS, DEFAULTS, CONFIG)
│   ├── resend.ts        # Resend client config
│   └── site-config.ts   # Site configuration
├── types/                # TypeScript types
│   ├── database.types.ts # Supabase generated types
│   └── email.d.ts       # Email types
├── scripts/              # Testing scripts
│   ├── test-email-integration.ts
│   ├── check-email-logs.ts
│   └── test-webhooks.ts
├── supabase/            # Supabase project
│   ├── migrations/      # Database migrations
│   │   └── 20251022000001_create_medias_storage_bucket.sql  # 🆕 Storage bucket
│   └── schemas/         # Declarative schema (source of truth)
│       └── 02c_storage_buckets.sql  # 🆕 Storage bucket schema
└── public/              # Assets statiques
```

### Configuration Supabase

```typescript
// supabase/server.ts (extrait)
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    { cookies: { get: cookieStore.get, set: cookieStore.set, remove: cookieStore.delete } }
  );
}
```

### Configuration Resend

```typescript
// lib/resend.ts
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined");
}

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### Variables d'Environnement

**Supabase:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ...  # Admin only (scripts)
```

**Resend:**

```bash
RESEND_API_KEY=re_xxx                      # Required
RESEND_AUDIENCE_ID=xxx                     # Optional
EMAIL_FROM=noreply@rougecardinalcompany.fr # Default FROM
EMAIL_CONTACT=contact@rougecardinalcompany.fr # Contact email
```

**Next.js Image Configuration:**

```env
# In next.config.ts remotePatterns
# Supabase Storage hostname configured for Image optimization
# yvtrlvmbofklefxcxrzv.supabase.co/storage/v1/object/public/**
```

**Site:**

```env
NEXT_PUBLIC_SITE_URL=https://rougecardinalcompany.fr # Production
# or
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Development
```

### Middleware Configuration

```typescript
// middleware.ts
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## Dépendances Clés

### Production

- next: **16.0.10** (security update 2025-12-13)
- react: ^19
- @supabase/ssr: latest (Supabase Auth 2025)
- tailwindcss: ^3.4
- shadcn/ui: latest
- **resend**: ^4.0.1 (Email service)
- **@react-email/components**: ^0.0.30 (Email templates)
- **zod**: ^3.24.1 (Runtime validation)
- date-fns: ^4.1.0 (Date formatting)
- react-icons: ^5.3.0 (Icon library)

### Développement

- typescript: ^5
- eslint: latest
- prettier: latest
- @types/node: latest
- tsx: ^4.19.2 (TypeScript execution for scripts)

## Standards de Développement

### Code Style

- ESLint pour le linting
- Prettier pour le formatage
- TypeScript strict mode activé

### Conventions de Nommage

- Components: PascalCase (ex: `Button.tsx`)
- Utilitaires: camelCase (ex: `utils.ts`)
- Pages: kebab-case (URLs)

### Database Conventions

- **SQL Functions** : `SET search_path = ''` obligatoire (prévention SQL injection)
- **SECURITY DEFINER** : Justification explicite requise (issue #27)
- **Views** : `WITH (security_invoker = true)` par défaut
- **RLS** : Activé sur 100% des tables (36/36), aucun table-level grant
- **Migrations** : Idempotentes avec DO blocks + exception handling
- **Audit** : audit_grants_filtered.sql (whitelist objets système)

### Pattern de Composants

```typescript
// Pattern de composant standard
"use client";

export function ComponentName() {
  // 1. Hooks et état
  // 2. Side effects
  // 3. Handlers
  // 4. Render
}
```

## Sécurité

### Database Security

- **RLS-only model** : Aucun table-level grant, contrôle d'accès 100% via RLS policies
- **SECURITY INVOKER views** : 10 vues converties pour éliminer escalade privilèges
- **Storage RLS** : Bucket "medias" avec policies (public read, auth upload, admin delete)
- **Function security** : `SET search_path = ''` + SECURITY INVOKER par défaut
- **Audit automation** : CI security check avec audit_grants_filtered.sql

### Authentification

- Supabase Auth pour la gestion des sessions
- Middleware pour la protection des routes
- CORS configuré pour les domaines autorisés

### Protection des Données

- Row Level Security (RLS) dans Supabase
- Validation des entrées avec TypeScript
- Sanitization des données

## Performance

### Optimisations

- Images optimisées via Next/Image
- Server Components par défaut pour l’accès données (pas de surcoût hydratation)
- React Suspense pour loading states contrôlés (skeletons)

### Monitoring

- Vercel Analytics
- Supabase Dashboard
- Logs d'erreur

## Workflow de Développement

1. Développement local avec hot reload
2. Tests automatisés (à implémenter)
3. Review des pull requests
4. Déploiement automatique sur Vercel

### Docker et Supabase Local

- **Docker** : Utilisé pour Supabase Local (Postgres, Auth, Storage, etc.)
- **Volumes Docker** : Inspection avec `docker volume ls --filter name=supabase` et `docker run --rm -v <volume>:/volume alpine du -sh /volume`
- **Disk Space** : Gestion avec `docker system df` et `docker system prune -a` (⚠️ supprime TOUTES les images inutilisées)
- **Supabase CLI** : `pnpm dlx supabase start/stop/status/db reset`
- **Workflow déclaratif** : `db diff` pour générer migrations, `db push` pour appliquer

### Security Audit Tools

- **CI automation** : `.github/workflows/security-audit.yml` avec audit_grants_filtered.sql
- **Manual check** : `scripts/check-security-audit.sh` (requires DB URL extraction fix)
- **Detailed inspection** : `supabase/scripts/quick_check_all_grants.sql`
- **Whitelist strategy** : Exclusion objets système (`information_schema, realtime.*, storage.*, extensions.*`)
- **Verification** : Après chaque migration, CI check pour détecter expositions

### Documentation opérationnelle

**Supabase Local:**

- `doc-perso/lancement-supabase-local/CLI-Supabase-Local.md` : Commandes Supabase CLI détaillées
- `doc-perso/lancement-supabase-local/docker-install.md` : Installation Docker et gestion espace disque
- `supabase/migrations/README-migrations.md` : Conventions migrations et ordre d'exécution

**Email Service:**

- `memory-bank/architecture/Email_Service_Architecture.md` : Architecture email complète
- `TESTING_RESEND.md` : Guide de test de l'intégration Resend
- `.github/instructions/resend_supabase_integration.md` : Instructions d'intégration

**Architecture:**

- `memory-bank/architecture/Project_Architecture_Blueprint.md` : Architecture détaillée du projet
- `memory-bank/architecture/Project_Folders_Structure_Blueprint.md` : Guide de structure des dossiers

**Security Audit:**

- `supabase/migrations/SECURITY_AUDIT_SUMMARY.md` : Campagne complète 17 rounds (73 objets)
- `supabase/migrations/ROUND_7B_ANALYSIS.md` : Analyse pivot whitelist
- `doc/rls-policies-troubleshooting.md` : Guide troubleshooting RLS (202 lignes)
- `supabase/scripts/audit_grants_filtered.sql` : Script audit production
- `scripts/check-security-audit.sh` : Runner CI/manuel

## Évolutions Technologiques Récentes (Novembre 2025)

### Client-Side Token Processing Pattern

**Contexte**: Résolution critique du système d'invitation admin (22 novembre 2025)

**Problème résolu**:

- Erreurs 404 sur `/auth/setup-account` lors de l'acceptation d'invitations
- Tokens Supabase passés dans URL hash (`#access_token=...`) invisibles côté serveur
- Middleware Next.js ne peut pas lire `window.location.hash`

**Solution technique**:

- Conversion de `app/(marketing)/auth/setup-account/page.tsx` en Client Component
- Extraction de tokens depuis `window.location.hash` côté client
- Établissement de session Supabase avec `setSession()`
- Nettoyage sécurisé de l'URL après traitement

**Technologies impliquées**:

```typescript
// Pattern Client Component pour auth
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";

// Extraction tokens hash URL
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = hashParams.get("access_token");

// Établissement session
const { data, error } = await supabase.auth.setSession({
  access_token: accessToken,
  refresh_token: refreshToken || "",
});

// Nettoyage sécurité
window.history.replaceState(null, "", window.location.pathname);
```

**Impact performance**:

- **Avant**: 404 erreurs, expérience utilisateur cassée
- **Après**: Acceptation d'invitation fluide, ~2-5ms traitement tokens
- **Optimisation JWT**: Utilisation `getClaims()` au lieu de `getUser()` (100x plus rapide)

**Standards appliqués**:

- Client Components uniquement pour logique nécessitant `window` API
- Server Components par défaut pour tout le reste
- Validation TypeScript stricte et gestion d'erreurs robuste
- Sécurité: tokens nettoyés après utilisation, sessions établies correctement

**Références**:

- Implementation: `app/(marketing)/auth/setup-account/page.tsx`
- Pattern documenté: `memory-bank/systemPatterns.md` (section "Client-Side Token Processing")
- Tests: `scripts/test-invitation-flow.ts`

### DAL SOLID Refactoring (30 novembre 2025)

**Contexte**: Refactoring complet du Data Access Layer pour atteindre 92% de conformité SOLID.

**Métriques finales**:

| Critère | Avant | Après | Cible |
| --------- | ------- | ------- | ------- |
| DAL avec DALResult | 0/17 | 17/17 | 100% |
| revalidatePath dans DAL | ~12 | 0 | 0 |
| Imports email dans DAL | 3 | 0 | 0 |
| Schemas centralisés | ~8 | 11 | 100% |
| **Score SOLID global** | ~60% | **92%** | 90% |

**Pattern DALResult** (Standard):

```typescript
// lib/dal/helpers/error.ts
export type DALResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Usage dans tous les modules DAL
export async function fetchTeamMembers(): Promise<DALResult<TeamMemberDTO[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("membres_equipe").select("*");

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}
```

**Dual Schemas Pattern** (Server vs UI):

```typescript
// lib/schemas/feature.ts

// Server schema (bigint pour database IDs)
export const FeatureInputSchema = z.object({
  id: z.coerce.bigint(),
  // ...
});

// UI schema (number pour formulaires)
export const FeatureFormSchema = z.object({
  id: z.number().int().positive(),
  // ...
});
```

**Règles critiques**:

- ✅ DAL retourne `DALResult<T>` — JAMAIS throw
- ✅ `revalidatePath()` dans Server Actions UNIQUEMENT — JAMAIS dans DAL
- ✅ Imports email dans service email UNIQUEMENT — JAMAIS dans DAL
- ✅ Props colocalisées avec composants dans `types.ts`
- ✅ Server Actions colocalisées dans `app/(admin)/admin/<feature>/actions.ts`

**Structure DAL Helpers**:

```bash
lib/dal/helpers/
├── error.ts      # DALResult<T> + toDALResult()
├── format.ts     # formatDate(), formatPrice(), etc.
├── slug.ts       # generateSlug()
└── index.ts      # Barrel exports
```

**Références**:

- Instructions: `.github/instructions/dal-solid-principles.instructions.md`
- Pattern CRUD: `.github/instructions/crud-server-actions-pattern.instructions.md`
- Architecture: `memory-bank/architecture/Project_Architecture_Blueprint.md`
