# Project Architecture Blueprint — v3 (Multiple Layout Routes)

**Dernière mise à jour** : 11 novembre 2025
**Projet** : Rouge Cardinal Company — Next.js 15 + TypeScript + Supabase + Resend
**Niveau de détail** : Implementation-Ready
**Diagramme** : C4 / diagrammes de flux (mermaid)

Résumé rapide

Ce document synthétise l'architecture actuelle du dépôt, les patterns observés, les règles d'extension et les décisions d'architecture. Il est destiné aux développeurs qui ajoutent des features ou maintiennent l'application (backoffice & site public).

1) Détection et synthèse

- Framework principal : Next.js 15 (App Router) avec Server/Client Components
- Langage : TypeScript (strict)
- UI : React 19, Tailwind CSS 3.4, shadcn/ui (Radix primitives)
- Backend : Supabase (Postgres) — migrations, RLS, fonctions, storage
- Email : Resend + React Email templates
- Structure : application monolithique feature-based (pas de monorepo détecté)

Indicateurs clés : `app/`, `components/`, `lib/dal/`, `supabase/`, `emails/`, `memory-bank/`.

2) Vue d'ensemble architecturale

---

Principes directeurs

- Security by default : RLS sur les tables, validations Zod, gardes serveur pour actions sensibles
- Séparation forte des responsabilités : Présentation (components) / Orchestration (Containers) / DAL (lib/dal)
- Server-first : Server Components pour lecture/SEO ; Server Actions ou API routes pour mutations

Flux de dépendances
Presentation → Business (Containers) → DAL → Supabase/Third-parties

3) Visualisation (C4 simplifié)

--

Contexte (high-level) :

```mermaid
flowchart LR
  User[Visiteur / Admin] -->|HTTP(S)| WebApp[Next.js App (app/*)]
  WebApp -->|SDK| Supabase[(Supabase: Auth, DB, Storage)]
  WebApp -->|API| Resend[(Resend Email Service)]
```

Container-level :

```mermaid
flowchart TD
  subgraph Nextjs
    Router[App Router (app/*)]
    UI[components/ui/*]
    Features[components/features/*]
    DAL[lib/dal/*]
    Email[emails/ + lib/email/*]
    Middleware[middleware.ts]
  end
  User --> Router
  Router --> Features
  Features --> UI
  Features --> DAL
  DAL --> Supabase
  Email --> Resend
  Middleware --> Supabase
```

4) Composants architecturaux principaux

- App Router (`app/`) : layouts, nested routes, route handlers (`route.ts`), loading/error boundaries
- Features (`components/features/`) : pattern Container (server)/View (client) + hooks + types
- UI (`components/ui/`) : wrappers shadcn, composants accessibles
- DAL (`lib/dal/`) : server-only, gère accès DB et règles d'autorisation (utiliser createServerClient)
- Email (`emails/`, `lib/email/`) : templates React Email, actions serveur, webhooks
- Auth & Middleware : `@supabase/ssr`, cookies via getAll/setAll, `supabase.auth.getClaims()` pour checks rapides

Best practice récurrente :

- Ne pas importer le DAL depuis des composants clients.
- Toutes les mutations passent par Server Actions / API routes et valident via Zod.

4.1) Multiple Layout Routes — recommandations et exemples

Cette application utilise le pattern "multiple layout routes" (groupes de routes + layouts imbriqués) pour séparer les zones fonctionnelles (par ex. `(admin)` vs `(public)`) et appliquer des comportements distincts (auth, navigation, mise en page). La couche App Router de Next.js 15 facilite cette organisation. Ci‑dessous : recommandations pratiques, exemples de structure et checklist de migration.

- Principe : chaque zone principale de l'app possède son propre `layout.tsx` (server component lorsque possible). Les éléments fortement liés au serveur (vérification d'auth, fetchs initiaux SEO) vont dans le layout serveur ; les éléments interactifs (menus avec état, commutateurs de thème) sont des Client Components importés dans le layout.

Structure recommandée (exemple)

```
app/
  (public)/
    layout.tsx        # layout public (header, footer, SEO)
    page.tsx
  (admin)/
    layout.tsx        # layout admin (sidebar, requireAdmin()) - server component
    dashboard/
      page.tsx
    settings/
      page.tsx
  layout.tsx          # root layout commun (html/head)
```

Exemple minimal — layout serveur protégé (app/(admin)/layout.tsx)

```ts
// app/(admin)/layout.tsx
import "server-only"
import { createServerClient } from '@/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const claims = await supabase.auth.getClaims()

  if (!claims) {
    redirect('/login')
  }

  return (
    <div className="admin-root flex">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

Exemple minimal — composant client pour header (interactivité)

```tsx
// components/admin/AdminHeader.tsx
"use client"
import { ThemeSwitcher } from '@/components/theme-switcher'
export default function AdminHeader() {
  return (
    <header className="flex items-center gap-4">
      <h1 className="sr-only">Admin</h1>
      <div className="ml-auto"><ThemeSwitcher /></div>
    </header>
  )
}
```

Bonnes pratiques et pièges à éviter

- Ne pas mettre de fetchs lourds ou mutations dans le root `layout.tsx` si cela force le rendu server-side de tous les enfants — préférez les Server Components ciblés ou le fetch côté page.
- Si un layout a besoin d'effectuer des mutations (ex : déconnexion), exposez une Server Action ou une API route — ne faites pas de side-effects pendant le rendu.
- Séparer clairement la responsabilité : le layout applique la sécurité (requiert l'utilisateur), les composants enfants affichent les données.
- Extraire tout état local ou UI control en Client Components (menus, dropdowns, tooltips, theme switchers).

Checklist de migration vers Multiple Layout Routes

1. Identifier les zones (admin/public) et créer des route groups `(admin)`/`(public)`.
2. Extraire la logique d'auth/server dans `app/(admin)/layout.tsx` (utiliser `getClaims()` pour checks rapides).
3. Extraire la navigation interactive vers des Client Components importés par le layout.
4. Vérifier que le DAL (lib/dal) reste server-only ; ne pas l'importer dans des composants client.
5. Après migrations de mutations, appeler `revalidatePath()` ou `revalidateTag()` depuis les Server Actions pour invalider le cache.
6. Lancer un test manuel : naviguer dans les deux zones, vérifier que les sessions et redirections fonctionnent, et exécuter `pnpm run lint` / `pnpm run build`.

Notes Next.js 15 & Supabase

- Toujours await `cookies()` / `headers()` dans Server Components si vous en avez besoin pour créer le client Supabase.
- Utiliser `createServerClient` avec l'interface cookies `{ getAll, setAll }` lorsque le layout manipule la session.
- Favoriser `getClaims()` pour vérifications de session dans les layouts/middleware (performances).

---

5) Architecture des données---

- Schéma source : `supabase/migrations/` (fichiers SQL) — garder migrations déclaratives
- Entités importantes : `membres_equipe`, `spectacles`, `evenements`, `articles_presse`, `medias`, `abonnes_newsletter`, `messages_contact`
- RLS : politiques de lecture publique + règles admin (is_admin()) — vérifier après chaque migration

Recommandation : indexer les colonnes `published_at` / `is_active` pour requêtes publiques.

6) Cross-cutting concerns-

Authentication & Authorization

- Pattern : middleware + requireAdmin() côté serveur.
- Use-case : pages admin protégées et Server Actions validées côté serveur.

Validation

- Zod pour toutes les entrées API/Actions/DAL.

Observabilité

- Logs applicatifs + audit DB; possibilité d'ajouter Sentry (optionnel).

Configuration & Secrets

- Variables env via `.env.local` et secrets côté CI/CD; ne pas exposer de service_role en client.

7) Communication & intégration externe

---

- Supabase : SDK server/browser ; DAL doit utiliser createServerClient
- Resend : client singleton `lib/resend.ts`; webhooks traités via `app/api/webhooks/resend/route.ts`
- Format : JSON ; validations strictes à l'entrée

8) Patterns d'implémentation (extraits)

Auth middleware (pattern recommandé) — résumé : utiliser `createServerClient` avec cookies getAll/setAll et `getClaims()` pour décisions de redirection.

DAL (pattern recommandé) :

- directive `"use server"`
- valider avec Zod puis appeler Supabase
- retourner DTOs simples aux containers

Exemple court (pseudocode) :

```ts
// lib/dal/team.ts (server-only)
"use server"
import { z } from 'zod'
import { createClient } from '@/supabase/server'

const TeamMember = z.object({ id: z.string(), name: z.string(), role: z.string(), active: z.boolean()})

export async function listTeamMembers(){
  const supabase = await createClient()
  const { data, error } = await supabase.from('membres_equipe').select('*').order('position')
  if (error) throw error
  return data.map(d => TeamMember.parse(d))
}
```

9) Tests, qualité et gates--

- Typecheck strict requis (tsc)
- ESLint : règles strictes (pas d'`any` non justifié)
- markdownlint pour docs (corriger crochets non échappés)
- Ajouter tests d'intégration pour email (scripts existants)

10) Déploiement & runtime-

- Build pipeline : `pnpm build` → artifacts Next
- Environnements : `.env.local` / staging / production
- Recommandation : CI exécute `tsc --noEmit`, `pnpm lint`, et tests d'intégration (optionnel)

11) Extensibilité et modèles d'évolution

Ajouter une nouvelle feature :

1. Créer schéma Zod + migrations si DB required
2. Implémenter `lib/dal/<entity>.ts` (server-only)
3. Créer `components/features/<domain>/<feature>` avec Container/View/hooks/types
4. Ajouter route page dans `app/` et tests rapides

12) Decision Records (résumé)

- ADR: Utiliser `getClaims()` vs `getUser()` dans middleware (performance)
- ADR: DAL server-only + Zod (sécurité & centralisation)
- ADR: Email via Resend + templates React (testabilité)

13) Gouvernance & maintenabilité

- Maintenir les schemas dans `supabase/migrations/` et regénérer `types/database.types.ts` après chaque migration
- Versionner les docs `memory-bank/architecture/` et mettre à jour la date/version à chaque changement majeur

14) Actions proposées (next steps)

1. Corriger les warnings markdown (crochets / listes) signalés par markdownlint
2. Lancer `pnpm run lint` & `pnpm run lint:md` et corriger les erreurs
3. Si vous souhaitez, je peux committer ce fichier avec le message :
   `docs(architecture): update Project_Architecture_Blueprint_v2.md — 2025-11-11`

---

Fait le : 11 novembre 2025

import { createClient } from '@/supabase/server'

const TeamMemberSchema = z.object({ id: z.string().uuid(), name: z.string().min(1), role: z.string().min(1), active: z.boolean() })

export async function listTeamMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('membres_equipe').select('id,name,role,active').order('position')
  if (error) throw error
  return data.map(d => TeamMemberSchema.parse(d))
}

```

Client/browser Supabase (extrait):

```ts
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!)
}
```

---

## 13. Quality gates & conventions

- Typecheck: PASS requis (tsc strict)
- ESLint: PASS requis (no any, pas d’APIs dépréciées)
- Docs: markdownlint OK
- Security: vérif RLS et cookies patterns canoniques

---

## 14. Risks & mitigations

- Risque: appels getUser() coûteux dans middleware → Mitigation: centraliser sur getClaims()
- Risque: fuite de secrets côté client → Mitigation: server-only + taint APIs
- Risque: vues consommant des données sensibles → Mitigation: DTO minimaux du DAL

---

## 15. References

- .github/instructions/nextjs-supabase-auth-2025.instructions.md
- .github/copilot-instructions.md
- memory-bank/architecture/Email_Service_Architecture.md
- supabase/schemas/README.md
