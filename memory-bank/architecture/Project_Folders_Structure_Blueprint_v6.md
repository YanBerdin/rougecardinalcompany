# Project Folders Structure Blueprint

Généré le: 2026-01-16
Racine: `memory-bank/architecture`

Résumé: ce document décrit l'organisation du dépôt Next.js + Supabase « rougecardinalcompany », les conventions observées, les points d'entrée principaux, et des templates pour ajouter de nouvelles fonctionnalités en respectant les standards du projet.

---

## 1. Détection et Contexte du Projet

Type détecté: application web TypeScript utilisant Next.js (App Router), Supabase (RLS, migrations), et une architecture feature-based (par fonctionnalité). Le dépôt contient:

- une app Next.js dans `app/` (groupes `(admin)` et `(marketing)`),
- une couche métier et DAL dans `lib/` (notamment `lib/dal/*` et `lib/actions`),
- gestion Declarative Supabase (`supabase/`),
- composants UI réutilisables dans `components/`,
- documentation, scripts et une memory-bank.

Raisons: présence de `app/`, `lib/dal/`, `supabase/`, `next.config.ts`, `tsconfig.json`, et multiples conventions Next.js (Server Components, Server Actions, revalidatePath patterns) décrites dans les fichiers `.github/instructions`.

---

## 2. Vue d'ensemble de la structure (Principes)

- Organisation par feature: la majorité des dossiers `app/` et `components/features` sont organisés par fonctionnalité (ex: `home`, `presse`, `spectacles`, `team`, `media`).
- Séparation claire Server vs Client: Server Components par défaut (app/), Client Components dans `components/` ou spécifiés par `'use client'`.
- DAL centralisé: `lib/dal/*` regroupe accès DB et renvoie `DALResult<T>` (pattern SOLID).
- Server Actions + revalidation: mutations via `lib/actions` et Server Actions co-localisées dans `app/(admin)/.../actions.ts`.
- RLS et migrations: schéma Supabase et politiques RLS gérées dans `supabase/` et fichiers SQL.

---

## 3. Visualisation (arborescence synthétique, profondeur 3)

- app/
  - (admin)/admin/
    - home/
    - media/
    - site-config/
    - spectacles/
    - team/
    - users/
  - (marketing)/
    - presse/
    - spectacles/
    - agenda/
  - api/
  - actions/
  - auth/

- components/
  - features/
    - admin/
    - public-site/
  - ui/

- lib/
  - dal/
  - actions/
  - schemas/
  - utils/

- supabase/
  - migrations/
  - schemas/

- memory-bank/

- scripts/

(voir `memory-bank/architecture/file-tree.md` pour arborescence complète)

---

## 4. Analyse par répertoire clé

**`app/`**

- Rôle: définition des routes, Server Components, pages admin et marketing.
- Patterns observés:
  - Route groups `(admin)` et `(marketing)` pour zones distinctes.
  - Chaque fonctionnalité admin possède `actions.ts` co-localisé (Server Actions) et pages `page.tsx` server-first.
  - `api/` contient route handlers pour les endpoints publics et webhooks.
- Recommandation: garder `export const dynamic = 'force-dynamic'` sur pages qui lisent cookies Supabase.

**`components/`**

- Rôle: UI réutilisable et composants par feature.
- Patterns: `components/features/*` pour composants liés à une feature; `components/ui/*` pour primitives (shadcn/ui).
- Recommandation: respecter la limite 300 lignes par fichier et split en sous-composants quand nécessaire.

**`lib/dal/`**

- Rôle: unique point d'accès DB, doit être `"use server"` et `import "server-only"`.
- Patterns: fonctions retournant `DALResult<T>` (ne pas throw), validations Zod côté Server Actions / DAL.
- Recommandation: pas de `revalidatePath()` dans DAL; revalidate dans Server Actions uniquement.

**`lib/actions/`**

- Rôle: Server Actions et orchestration (validation, appel DAL, revalidatePath())
- Patterns: `ActionResult` type, validation Zod, `requireAdmin()` guard.

**`lib/schemas/`**

- Rôle: schémas Zod serveur/UI séparés (bigint vs number pour forms).
- Recommandation: conserver `FeatureInputSchema` (server) et `FeatureFormSchema` (UI).

**`supabase/`**

- Rôle: migrations et schéma déclaratif. Important: follow Declarative Schema instructions.
- Patterns: `supabase/migrations/` existant; `supabase/schemas/` attendu pour source-of-truth.
- Recommandation: pour hotfixes, créer migration timestamped, puis synchroniser `supabase/schemas/`.

**`memory-bank/`**

- Rôle: documentation vivante du projet (architecture, tâches, décisions).
- Recommandation: mettre à jour `Project_Folders_Structure_Blueprint.md` ici pour l'historique.

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
