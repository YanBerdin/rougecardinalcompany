# Project Architecture Blueprint — Rouge Cardinal Company

Generated: 22 November 2025
Source: `doc/prompts-github/architecture-blueprint-generator.prompt.md`
Repository branch: `feature/backoffice`

Résumé: ce document analyse la base de code existante et formalise le modèle d'architecture, les patterns observés et les recommandations pour l'évolution et l'extensibilité. Il s'appuie sur l'organisation actuelle (Next.js 15, TypeScript strict, Supabase, React 19) et couvre les composantes clés, la sécurité RLS, les modèles d'accès aux données, les tests et le déploiement.

## 1. Détection et analyse du projet

- Principaux frameworks et technologies détectés:
  - Next.js 15 (app/ router, Server Components, Server Actions)
  - React 19
  - TypeScript (mode strict)
  - Supabase (Postgres) avec RLS, schémas déclaratifs et migrations
  - React Email + Tailwind pour templates d'email
  - pnpm / tsx pour scripts de développement/test
  - GitHub Actions pour CI légère (workflows ajoutés)

- Organisation observable:
  - Structure feature-based: `components/features/*`, `lib/dal/*`, `app/(admin)` et `app/(marketing)`.
  - DAL (Data Access Layer) centralisé dans `lib/dal` et marqué `server-only`.
  - Emails centralisés sous `emails/` avec utilitaires dans `emails/utils`.
  - Migrations et schémas Supabase sous `supabase/schemas` et `supabase/migrations`.

## 2. Vue d'ensemble de l'architecture

Approche principale: application monolithique modulée (feature-based) servant des Server Components par défaut et utilisant un DAL server-only comme frontière de sécurité pour toutes les opérations DB.

Principes directeurs:

- Server Components par défaut; Client Components uniquement pour l'interactivité.
- Toutes les opérations DB passent par `lib/dal/*` (sécurité, validation, DTO minimal).
- Validation runtime à chaque frontière (Zod) + typage TypeScript strict.
- RLS (Row-Level Security) activé et considéré premier mécanisme de sécurité côté DB.

Boundaries:

- Frontend public (app/(marketing)) vs backoffice (app/(admin)).
- Boundary serveur/DB: `lib/dal` exécute `createServerClient()`/`createAdminClient()` et utilise `import "server-only"`.

## 3. Visualisation architecturale (textuelle)

- High-level:
  - Browser -> Next.js app (Server Components) -> DAL -> Supabase (Postgres)
  - Email sending: Server Action -> `lib/email/actions.ts` -> provider (Resend) or dev-redirect

- Composants principaux:
  - UI (components/, app/ pages) — rendu côté serveur et client
  - DAL (`lib/dal/*`) — logique DB, validation Zod, DTOs
  - Emails (`emails/`) — templates (React Email) + layout utils
  - Infra (supabase/*) — schemas/migrations, RLS policies

## 4. Composants architecturaux détaillés

4.1 DAL (`lib/dal`)

- Responsabilité: centraliser accès DB, appliquer règles RLS, valider/transformer et retourner DTOs minimaux.
- Structure interne: modules par domaine (e.g., `admin-users.ts`, `team.ts`). Chaque module contient fonctions `fetch`, `upsert`, `delete` et lève des erreurs domain-specific.
- Patterns: `import "server-only"` + `createServerClient()`; Zod pour validation; revalidation via `revalidatePath()` après mutations.

4.2 Server Actions

- Usage: mutations initiées depuis formulaires internes; pattern: 'use server', Zod validation, auth guard, DAL call, revalidatePath.
- Sécurité: auth check explicite (`requireAdmin()` ou `auth.getClaims()`), revalidation, ActionResponse pattern.

4.3 Emails (`emails/`)

- Templates: React Email components; wrapper unique `<Tailwind>` pour compatibilité Tailwind; CTA en styles inline lorsque nécessaire.
- Envoi: `lib/email/actions.ts` contient gate `EMAIL_DEV_REDIRECT` pour redirection en environnement dev/test.

4.4 Admin UI

- Structure: `app/(admin)/admin/*` pages + `components/features/admin/users/*`.
- Composants: Invitation form (client), management views (client), containers server pour fetch.

## 5. Couches et dépendances

- Couche présentation (app/, components/)
- Couche application / service (Server Actions, containers)
- Couche données (lib/dal/*)
- Couche infrastructure (supabase schemas, migrations)

Règles de dépendance: couche supérieure dépend de couche inférieure (presentation -> application -> data -> infra). DAL ne dépend pas des composants UI.

## 6. Architecture des données

- Modèle de données principal: tables Postgres avec RLS; exemples: `profiles`, `membres_equipe`, `spectacles`.
- Accès: DAL retourne DTOs minimalistes; éviter d'exposer colonnes sensibles.
- Transactions & upserts: pattern `upsert(..., { onConflict: 'user_id' })` pour gérer trigger `on_auth_user_created`.
- Indexation: recommander index sur colonnes utilisées dans policies (e.g., `user_id` dans `profiles`).

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

- Server Components pour data fetching, Client Components pour interactivité. Ne pas utiliser `next/dynamic` avec `{ ssr: false }` dans Server Components.
- DAL modules `import "server-only"`.
- Server Actions: `'use server'` (lowercase), validation + auth + DAL + revalidate.

## 10. Patterns d'implémentation

- Interfaces et services: small, single-responsibility functions; pas plus de 30 lignes par fonction idéalement.
- Repository / DAL: encapsuler queries et remonter DTOs sobres.

## 11. Tests

- Stratégie actuelle: tests isolés pour rendu d'email (`__tests__/emails/invitation-email.test.tsx`) exécutés via `tsx` in script.
- Recommandation: intégrer Vitest/Jest et exécuter `pnpm tsc --noEmit`, lint, et tests dans CI matrix; ajouter tests d'intégration pour DAL via un environnement Postgres (Supabase local) ou mocks.

## 12. Déploiement

- Environnements: dev/local (supabase local), staging, production (Supabase Cloud).
- Migrations: workflow declarative schema -> stop supabase local -> `supabase db diff -f name` -> push migrations. Ne pas modifier migrations manuellement sauf hotfix.

## 13. Extensibilité

- Pour ajouter une nouvelle feature:
  1. Créer DAL `lib/dal/<feature>.ts` (server-only)
  2. Créer Server Container `components/features/<feature>/FeatureContainer.tsx` (async)
  3. Créer Client Views sous `components/features/<feature>/` si nécessaire
  4. Ajouter route sous `app/` (respecter groups `(admin)` / `(marketing)`) et tests.

## 14. Exemples de code (patterns)

- Server Action pattern (pseudo):

```ts
"use server";
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/guards';
import { upsertProfile } from '@/lib/dal/admin-users';

const Payload = z.object({ email: z.string().email() });

export async function inviteUserAction(formData: FormData) {
  const validated = Payload.parse({ email: formData.get('email') });
  await requireAdmin();
  const result = await upsertProfile(validated);
  revalidatePath('/admin/users');
  return { success: true, data: result };
}
```

## 15. Records de décisions architecturales (ADR) — aperçu

- Choix d'utiliser Next.js 15 App Router et Server Components pour prioriser SSR et sécurité.
- Migration vers JWT Signing Keys pour Supabase (`getClaims()` central) afin d'améliorer latence d'auth.

## 16. Governance & qualité

- Recommandations automatiques:
  - CI: ajouter `pnpm tsc --noEmit`, `pnpm lint` et `pnpm test` au workflow principal.
  - PR template: checklist RLS/DB/migrations, tests, types.

## 17. Guide pratique pour nouveaux développements

- Workflow recommandé:
  1. Écrire DAL (server-only) + tests unitaires
  2. Écrire Server Container (fetch + pass DTO)
  3. Écrire Client View (interactivité)
  4. Ajouter Server Action pour mutations et revalidation
  5. Ajouter tests et mettre à jour CI

## Annexes & références

- Fichiers clefs:
  - `lib/dal/*` — DAL
  - `emails/*` — templates
  - `supabase/schemas/*` — schéma déclaratif
  - `supabase/migrations/*` — migrations
  - `.github/workflows/*` — CI

---

Maintenir ce document à jour: exécuter le générateur chaque fois qu'une refonte structurelle (nouveau route group, changement DAL majeur, migration de provider critique) est effectuée.

End of file
