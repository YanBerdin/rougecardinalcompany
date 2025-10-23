# Project Architecture Blueprint — v2 (Implementation-Ready)

Last Updated: 20 octobre 2025
Project: Rouge Cardinal Company — Next.js 15 + Supabase + Resend
Detail Level: Implementation-Ready
Diagram Type: C4 (Context, Container, Component)

Note importante — Supabase Auth (2025):

- Utiliser @supabase/ssr exclusivement
- Cookies: getAll/setAll uniquement (jamais get/set/remove)
- Auth check: supabase.auth.getClaims() (rapide) et getUser() seulement si nécessaire
- Nouvelles clés: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY / secret côté serveur
Référence canonique: .github/instructions/nextjs-supabase-auth-2025.instructions.md

---

## 1. Architecture detection and analysis

- Project type: Next.js 15.4.5 (App Router), React 19, TypeScript 5, Node 20
- Styling: Tailwind CSS 3.4, shadcn/ui (Radix primitives)
- Backend/BaaS: Supabase (PostgreSQL, Auth, Storage, Realtime)
- Email: Resend + React Email templates
- QA: ESLint 9, TypeScript strict; doc in memory-bank/
- Patterns dominants: Feature-based + Layered + Smart/Dumb, DAL server-only

Guiding principles:

- Security by default (RLS partout, auth SSR optimisée)
- Separation of concerns (Présentation vs Logique vs Accès données)
- Type safety et validation runtime (TypeScript + Zod)
- Server-first (Server Components pour reads, Server Actions pour mutations)

---

## 2. Architectural overview (Layered + Feature-based)

- Presentation: pages/layouts (Server), vues interactives (Client)
- Domain/Business: containers, hooks, validation
- Data Access Layer: modules server-only (lib/dal/*) avec Supabase server client
- Infrastructure: Next runtime, middleware auth, email service

Boundaries:

- Views ne parlent jamais directement au DAL
- Containers orchestrent hooks et actions; DAL encapsule Supabase
- Secrets et cookies manipulés uniquement côté serveur

---

## 3. Architecture visualization (C4)

### 3.1 C4-Context

```mermaid
flowchart LR
  User[Visiteur/Administrateur] -->|HTTP(S)| WebApp[Next.js 15 App]
  WebApp -->|SDK| Supabase[(Supabase: Auth, DB, Storage)]
  WebApp -->|API| Resend[(Resend Email Service)]
```

### 3.2 C4-Container

```mermaid
flowchart TD
  subgraph Next.js App
    AppRouter[App Router (app/*)]
    UI[UI Components (components/ui/*)]
    Features[Features (components/features/*)]
    DAL[Data Access Layer (lib/dal/*)]
    Email[Email Layer (emails/*, lib/email/*)]
    Middleware[middleware.ts]
  end

  User --> AppRouter
  AppRouter --> Features
  Features --> UI
  Features --> DAL
  DAL --> SupabaseDB[(Supabase DB/Auth)]
  Email --> ResendAPI[(Resend API)]
  Middleware --> SupabaseDB
```

### 3.3 C4-Component (Admin Team Management — exemple)

```mermaid
flowchart TD
  AdminPage[app/admin/team/page.tsx (Server)] --> TeamContainer[TeamContainer (Client)]
  TeamContainer --> TeamHooks[useTeam (hooks)]
  TeamContainer --> TeamView[TeamList/TeamForm (Views)]
  TeamHooks --> TeamActions[Server Actions app/admin/team/actions.ts]
  TeamActions --> TeamDAL[lib/dal/team.ts (server-only)]
  TeamDAL --> Supabase[(DB membres_equipe + RLS)]
```

---

## 4. Core architectural components

### 4.1 App Router (app/*)

- Server Components par défaut (SEO, perf)
- Groupes: auth/, protected/, admin/, api/
- Middleware pour auth (getClaims) et protection des segments

### 4.2 Features (components/features/*)

- Pattern Smart/Dumb: `FeatureContainer` (orchestration) + `FeatureView` (présentation)
- `hooks.ts` (logique client), `types.ts` (types dédiés)

### 4.3 UI (components/ui/*)

- shadcn/ui consolidé, accessible, theming

### 4.4 DAL (lib/dal/*)

- "use server" et import "server-only" recommandé
- Utilise createServerClient (@supabase/ssr) et Zod pour inputs/outputs
- RLS appliquée; DTO minimal retourné

### 4.5 Auth & middleware

- middleware.ts: client serveur Supabase + cookies getAll/setAll + getClaims()
- lib/supabase/server.ts, lib/supabase/client.ts: implémentations canoniques

### 4.6 Email (emails/, lib/email/*)

- Templates React Email; actions d’envoi via Resend
- API de test/webhooks sous app/api/

---

## 5. Layers and dependencies

Presentation → Business → DAL → Infrastructure

Règles:

1) Views ne consomment pas directement Supabase
2) Containers valident les entrées côté client; Zod côté serveur pour toute mutation
3) DAL est la seule couche avec accès DB/Secrets
4) Toute mutation invalide le cache (revalidatePath/tag) au bon scope

---

## 6. Data architecture

- Schéma déclaratif: supabase/schemas/* (RLS co‑localisée)
- Entités clés: membres_equipe, partners, spectacles, événements, presse, newsletter, contact, media
- Politiques RLS: lecture publique limitée, écriture admin via is_admin() / claims
- Index partiels pour contenu publié/actif
- **Vues publiques** : contournement RLS pour JWT Signing Keys (`articles_presse_public` pour articles publiés)

### 6.1 Fix Articles de Presse - RLS Policies & SECURITY INVOKER

**Problème identifié (22 oct. 2025)** :

- Vue `articles_presse_public` renvoyait un tableau vide côté client (`[]`)
- DAL `fetchMediaArticles()` retournait `[]` alors que 3 articles publiés existaient en base
- Requête SQL directe (role postgres) montrait bien 3 articles

**Root Cause Analysis** :

Le problème provenait de **deux causes combinées** :

1. **RLS activé sans policies appliquées**
   - RLS était activé sur la table `articles_presse`
   - AUCUNE policy n'existait pour autoriser l'accès
   - **Comportement PostgreSQL** : RLS activé sans policies = deny-all par défaut (sécurité)

2. **SECURITY INVOKER sans permissions base table**
   - Vue définie avec `WITH (security_invoker = true)` (bonne pratique)
   - Avec SECURITY INVOKER, la vue s'exécute avec les privilèges de l'utilisateur (`anon`)
   - Le role `anon` n'avait pas de `GRANT SELECT` sur la table `articles_presse`

**Solutions appliquées** :

1. **Application des RLS policies** (Migration `20251022150000`)
   - 5 policies créées (lecture publique, admin CRUD complet)
   - Principe: "Public press articles are viewable by everyone" avec `published_at IS NOT NULL`

2. **GRANT permissions sur table base** (Migration `20251022140000`)
   - `GRANT SELECT ON public.articles_presse TO anon, authenticated;`
   - Requis pour que SECURITY INVOKER fonctionne avec role anon

**Modèle de sécurité (Defense in Depth)** :

```
┌─────────────────────────────────────────┐
│ Layer 1: VIEW (articles_presse_public)  │
│ ↓ Filtre: published_at IS NOT NULL      │
├─────────────────────────────────────────┤
│ Layer 2: GRANT SELECT                   │
│ ↓ Permissions base table                │
├─────────────────────────────────────────┤
│ Layer 3: RLS Policies                   │
│ ↓ published_at IS NOT NULL (users)      │
│ ↓ Full access (admins)                  │
└─────────────────────────────────────────┘
```

**Impact** :

- 🔒 Sécurité : Defense in Depth (VIEW + GRANT + RLS)
- ⚡ Performance : Optimal avec indexes partiels
- ✅ Validation : 3 articles affichés correctement après fix

**Fichiers concernés** :

- Migrations : `20251022140000_grant_select_articles_presse_anon.sql`, `20251022150000_apply_articles_presse_rls_policies.sql`
- Schéma déclaratif : `supabase/schemas/08_table_articles_presse.sql` (source de vérité avec GRANT + RLS)
- DAL : `lib/dal/presse.ts` (requête sur vue `articles_presse_public`)
- Documentation : `doc/rls-policies-troubleshooting.md` (guide complet 202 lignes)

---

## 7. Cross-cutting concerns

Authentication & Authorization:
Authentication & Authorization:

- SSR getClaims() pour check rapide; RBAC via claims/DB

Error Handling & Resilience:
Error Handling & Resilience:

- Error boundaries, messages utilisateur clairs
- Retrys ciblés côté client; éviter effets de bord pendant le rendu

Logging & Monitoring:
Logging & Monitoring:

- Logs Vercel + Supabase; Sentry optionnel

Validation:
Validation:

- Zod sur toutes entrées utilisateur et payloads API/Actions

Configuration:
Configuration:

- Variables env typées; secrets jamais côté client

---

## 8. Service communication patterns

- Interne: Server Components (reads), Server Actions (mutations)
- Externe: Supabase SDK (DB/Auth/Storage), Resend API (emails)
- Formats: JSON; webhooks Resend vérifiés

---

## 9. Technology-specific architectural patterns

Next.js 15:

- App Router, streaming via Suspense, séparation Server/Client stricte
- middleware.ts avec @supabase/ssr, cookies getAll/setAll, getClaims()

Supabase:

- Clients: createBrowserClient / createServerClient (@supabase/ssr)
- RLS activée, fonctions helpers (is_admin), vues tardives (41_*)

Tailwind/shadcn:

- UI cohérente, accessible; plugin ESM only

---

## 10. Architectural Decision Records (ADRs)

1) Auth SSR via JWT Signing Keys + getClaims()

- Contexte: performance et fiabilité des checks auth
- Décision: remplacer getUser() par getClaims() pour le middleware et checks simples
- Conséquences: ~2–5ms local; moins de dépendance réseau

2) DAL server-only avec Zod

- Contexte: centraliser sécurité et validation
- Décision: toutes lectures sensibles et mutations via lib/dal/*
- Conséquences: surface d’attaque réduite; DTO minimaux

3) Smart/Dumb Components

- Contexte: réutilisabilité, testabilité
- Décision: Containers orchestrent; Views présentent
- Conséquences: UI testable, logique isolée

4) Emails via Resend + React Email

- Contexte: transactional, templating moderne
- Décision: templates React; actions serveur pour envoi
- Conséquences: séparation claire; tests par endpoints et scripts

5) Déclaratif Supabase Schema

- Contexte: source de vérité DB
- Décision: un fichier par entité, RLS co‑localisée
- Conséquences: migrations diff, audit facile

6) Cookies getAll/setAll only

- Contexte: compat Next.js 15
- Décision: interdire get/set/remove individuels
- Conséquences: sessions stables; compat assurée

---

## 11. Extensibility blueprint

Points d’extension:

- Nouvelle feature: components/features/<domain>/<feature> avec Container/View/hooks/types
- Nouveau module DAL: lib/dal/<domain>.ts (server-only) + schéma Zod
- Nouvelles routes API: app/api/<name>/route.ts (validate + return JSON)
- Nouveaux emails: emails/<template>.tsx + lib/email/actions.ts

Checklist ajout de feature:

1) Créer schémas Zod (types.ts) et DTO
2) Implémenter DAL sécurisé (server-only)
3) Construire Container/View + hooks
4) Ajouter Server Actions pour mutations
5) Écrire tests rapides (au moins unit + 1 intégration)

---

## 12. Implementation patterns (code-ready)

Auth middleware (extrait):

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      supabaseResponse = NextResponse.next({ request })
      cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
    } } }
  )
  const claims = await supabase.auth.getClaims()
  if (!claims && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  return supabaseResponse
}
```

DAL server-only (extrait):

```ts
import 'server-only'
import { z } from 'zod'
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
