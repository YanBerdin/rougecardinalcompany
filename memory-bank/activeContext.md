# Active Context

**Current Focus (2025-12-06)**: Hero Slides Clean Code Refactoring - COMPLETED ✅

## Architecture Updates (2025-12-06)

### Hero Slides Clean Code Refactoring - COMPLETED ✅

**Refactoring complet du code Hero Slides selon les principes Clean Code.**

#### Changements réalisés

| Composant | Avant | Après |
|-----------|-------|-------|
| `HeroSlideForm.tsx` | 232 lignes | 117 lignes (-49%) |
| `HeroSlideFormFields.tsx` | 237 lignes | 127 lignes (-46%) |
| `HeroSlidesView.tsx` | 315 lignes | 241 lignes (-23%) |
| Constants | Magic numbers inline | `lib/constants/hero-slides.ts` |
| Form logic | Dans le composant | `useHeroSlideForm` hook |
| DnD logic | Dans le composant | `useHeroSlidesDnd` hook |
| CTA fields | Duplication | `CtaFieldGroup` component DRY |

#### Nouveaux fichiers créés

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `lib/constants/hero-slides.ts` | 30 | HERO_SLIDE_LIMITS, HERO_SLIDE_DEFAULTS, ANIMATION_CONFIG, DRAG_CONFIG |
| `lib/hooks/useHeroSlideForm.ts` | 53 | Form state + submission logic |
| `lib/hooks/useHeroSlideFormSync.ts` | 38 | Props/form sync via useEffect |
| `lib/hooks/useHeroSlidesDnd.ts` | 73 | Drag & drop avec @dnd-kit |
| `lib/hooks/useHeroSlidesDelete.ts` | 61 | Delete confirmation dialog logic |
| `components/.../CtaFieldGroup.tsx` | 130 | Composant DRY pour CTA Primary/Secondary |

#### Conformité Clean Code atteinte

- ✅ Tous les fichiers < 300 lignes
- ✅ Fonctions < 30 lignes (via extraction hooks)
- ✅ Aucun commentaire (supprimés)
- ✅ Aucun magic number (constantes centralisées)
- ✅ DRY respecté (CtaFieldGroup élimine duplication)
- ✅ Aucun console.log (supprimés)

#### Commits

- `81a8899` — refactor(hero-slides): apply clean code principles
- `aabfdf5` — docs(blueprint): update to v5.2 with Clean Code refactoring changes
- `18c43f8` — docs(architecture): update to v2.2 with Clean Code refactoring

#### Documentation mise à jour

- `memory-bank/architecture/Project_Folders_Structure_Blueprint_v5.md` (v5.1 → v5.2)
- `memory-bank/architecture/Project_Architecture_Blueprint.md` (v2.1 → v2.2)
- `.github/prompts/refactor_hero_slides_cta_clean_code.prompt.md` (statut COMPLÉTÉ)
- `.github/prompts/refactor_hero_slides_cta_with_toggles.prompt.md` (feature CTA avec toggles - exécuté préalablement)

---

## Previous Focus (2025-12-02): Next.js 16 Migration - COMPLETED ✅

**Migration complète de Next.js 15.4.5 vers 16.0.6 avec corrections de sécurité.**

### Changements réalisés

| Composant | Avant | Après |
|-----------|-------|-------|
| Next.js | 15.4.5 | 16.0.6 |
| eslint-config-next | 15.x | 16.0.6 |
| Middleware | `middleware.ts` | `proxy.ts` (renommé) |
| Bundler | Webpack | Turbopack (défaut) |
| Pages Supabase | Static generation | `dynamic = 'force-dynamic'` |

#### Fichiers modifiés

| Fichier | Changement |
|---------|------------|
| `package.json` | Next.js 16.0.6, pnpm.overrides `js-yaml: >=4.1.1` |
| `pnpm-lock.yaml` | Dépendances mises à jour |
| `tsconfig.json` | Ajout `.next/dev/types/**/*.ts` |
| `middleware.ts` → `proxy.ts` | Renommé (convention Next.js 16) |
| `app/(marketing)/page.tsx` | `export const dynamic = 'force-dynamic'` |
| `app/(marketing)/agenda/page.tsx` | `export const dynamic = 'force-dynamic'` |
| `app/(marketing)/presse/page.tsx` | `export const dynamic = 'force-dynamic'` |
| `app/(marketing)/spectacles/page.tsx` | `export const dynamic = 'force-dynamic'` |
| `app/(marketing)/compagnie/page.tsx` | `export const dynamic = 'force-dynamic'` |
| `app/(admin)/admin/home/about/page.tsx` | `export const dynamic = 'force-dynamic'` |

#### Vulnérabilités corrigées

| CVE | Sévérité | Package | Solution |
|-----|----------|---------|----------|
| CVE-2025-57822 | High | next <16.0.4 | Upgrade Next.js 16.0.6 |
| CVE-2025-64718 | Moderate | js-yaml <4.1.1 | pnpm override `>=4.1.1` |

**Audit final** : `0 vulnerabilities found`

#### Codemod appliqué

```bash
pnpx @next/codemod@canary upgrade latest
# 3 transformations : app-dir-runtime-config-experimental-edge, next-async-request-api, next-og-import
```

#### Commits

- `00cec7b` — chore(deps): upgrade Next.js 15.4.5 → 16.0.6, fix CVE-2025-57822 and CVE-2025-64718

---

## Previous Focus (2025-12-02): Team CRUD Migration to Server Actions Pattern - COMPLETED ✅

**Objectif atteint** : Migration complète du formulaire Team vers le pattern Server Actions avec pages CRUD dédiées.

### Changements réalisés

| Composant | Avant | Après |
|-----------|-------|-------|
| Affichage form | Inline dans TeamManagementContainer | Pages dédiées `/admin/team/new` et `/admin/team/[id]/edit` |
| API Routes | 3 fichiers dans `app/api/admin/team/` | **Supprimés** (0 fichiers) |
| Mutations | fetch() vers API Routes | Server Actions directes |
| Validation form | 6 useState | react-hook-form + zodResolver |
| Schémas Zod | Schéma unique | Dual schemas (Server + UI) + `optionalUrlSchema` |

#### Fichiers créés

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `app/(admin)/admin/team/new/page.tsx` | 55 | Page création membre |
| `app/(admin)/admin/team/new/loading.tsx` | 36 | Skeleton loading |
| `app/(admin)/admin/team/[id]/edit/page.tsx` | 82 | Page édition membre |
| `app/(admin)/admin/team/[id]/edit/loading.tsx` | 65 | Skeleton loading |
| `components/features/admin/team/TeamMemberFormWrapper.tsx` | 65 | Bridge avec sanitizePayload() |

#### Fichiers modifiés

| Fichier | Changement |
|---------|------------|
| `lib/schemas/team.ts` | Ajout `optionalUrlSchema`, `TeamMemberFormSchema`, `TeamMemberFormValues` |
| `components/features/admin/team/TeamMemberForm.tsx` | Refactoring vers react-hook-form + zodResolver |
| `components/features/admin/team/TeamManagementContainer.tsx` | Simplification (retrait form inline, Link/router.push) |
| `app/(admin)/admin/team/page.tsx` | Ajout `dynamic = 'force-dynamic'`, `revalidate = 0`, `fetchAllTeamMembers(true)` |
| `app/(admin)/admin/team/actions.ts` | Ajout `hardDeleteTeamMemberAction` |

#### Fichiers supprimés (API Routes obsolètes)

- `app/api/admin/team/route.ts`
- `app/api/admin/team/[id]/active/route.ts`
- `app/api/admin/team/[id]/hard-delete/route.ts`
- `app/api/admin/team/[id]/` (répertoire)
- `app/api/admin/team/` (répertoire)

#### Bugs corrigés pendant la migration

1. **"Afficher inactifs" ne fonctionnait plus** → `fetchAllTeamMembers(true)` pour charger tous les membres
2. **"Validation failed" sans image** → `optionalUrlSchema` pour accepter chaînes vides
3. **Contrainte DB `membres_equipe_image_url_format`** → `sanitizePayload()` convertit `""` → `null`

#### Documentation mise à jour

- ✅ `memory-bank/architecture/file-tree.md`
- ✅ `memory-bank/architecture/Project_Architecture_Blueprint.md`
- ✅ `memory-bank/architecture/Project_Folders_Structure_Blueprint_v5.md`
- ✅ `.github/prompts/plan-teamMemberFormMigration.prompt.md` → 7/7 steps FAIT

---

## Previous Focus (2025-11-30): DAL SOLID Refactoring - COMPLETED ✅

**Score final : 92% SOLID compliance** (target: 90%)

### Métriques finales

| Critère | Avant | Après | Cible |
|---------|-------|-------|-------|
| DAL avec DALResult<T> | 0/17 | 17/17 | 100% |
| revalidatePath dans DAL | ~12 | 0 | 0 |
| Imports email dans DAL | 3 | 0 | 0 |
| Schemas centralisés | ~8 | 11 | 100% |
| **Score SOLID global** | ~60% | **92%** | 90% |

#### Changements architecturaux majeurs

1. **DAL Helpers centralisés** (`lib/dal/helpers/`)
   - `error.ts` : Type `DALResult<T>` unifié + helper `toDALResult()`
   - `format.ts` : Helpers formatage (dates, etc.)
   - `slug.ts` : Génération slugs
   - `index.ts` : Barrel exports

2. **Pattern DALResult<T>** appliqué aux 17 modules DAL :

   ```typescript
   export type DALResult<T> = 
     | { success: true; data: T }
     | { success: false; error: string };
   ```

3. **Server Actions colocalisées** :
   - Location : `app/(admin)/admin/<feature>/actions.ts`
   - Responsabilité : validation Zod + DAL call + `revalidatePath()`
   - Pattern : `ActionResult<T>` avec codes HTTP

4. **Schemas centralisés** (`lib/schemas/`) :
   - 11 fichiers : admin-users, agenda, compagnie, contact, dashboard, home-content, index, media, presse, spectacles, team
   - Pattern dual : Server schemas (`bigint`) + UI schemas (`number`)
   - Barrel export via `index.ts`

5. **Colocation des props** :
   - Props composants dans `components/features/admin/<feature>/types.ts`
   - Re-exports des constantes depuis `lib/schemas/`

#### Fichiers clés créés/modifiés

| Fichier | Action | Rôle |
|---------|--------|------|
| `lib/dal/helpers/error.ts` | Créé | DALResult<T> + toDALResult() |
| `lib/dal/helpers/format.ts` | Créé | Helpers formatage |
| `lib/dal/helpers/slug.ts` | Créé | Génération slugs |
| `lib/dal/helpers/index.ts` | Créé | Barrel exports |
| `components/features/admin/media/types.ts` | Créé | Props colocalisées |
| `lib/types/` | Supprimé | Contenu migré vers colocation |

#### Documentation mise à jour

- ✅ `.github/prompts/plan.dalSolidRefactoring.prompt.md` → COMPLETE
- ✅ `memory-bank/architecture/Project_Folders_Structure_Blueprint_v5.md`
- ✅ `memory-bank/architecture/Project_Architecture_Blueprint.md` (v2)
- ✅ `memory-bank/architecture/Email_Service_Architecture.md` (v1.3.0)

#### Commits (branche `feature/backoffice`)

- `f002844` — refactor(media): colocate component props with media feature
- `dec0ecf` — docs(plan): mark DAL SOLID refactoring as complete (92%)
- `5180884` — docs(architecture): update blueprint to v5 after SOLID refactoring
- `066990d` — docs(architecture): update Architecture and Email blueprints after SOLID refactoring

---

## Architecture Updates (2025-11-27)

### Clean Code & TypeScript Conformity - TASK026 Refinement COMPLETED ✅

**8-step plan fully executed** (commit `8aaefe1`):

1. ✅ **Server Actions créées** : `app/(admin)/admin/home/about/home-about-actions.ts`, `app/(admin)/admin/home/hero/home-hero-actions.ts`
   - Pattern `ActionResult<T>` unifié
   - Validation Zod avec schémas serveur
   - `revalidatePath()` après DAL calls

2. ✅ **DAL refactorisé** : `lib/dal/admin-home-hero.ts`, `lib/dal/admin-home-about.ts`
   - Suppression de tous les `revalidatePath()` (déplacés vers Server Actions)
   - Pattern `DALResult<T>` unifié
   - Codes d'erreur systématiques `[ERR_*]`

3. ✅ **Migration fetch() → Server Actions** : `AboutContentForm.tsx`
   - Remplacement API Routes par appels Server Actions directs
   - useEffect sync pattern pour re-render immédiat

4. ✅ **Splitting composants** : `HeroSlideForm.tsx` (316→200 lignes)
   - Extraction `HeroSlideFormImageSection.tsx` (91 lignes)
   - Respect règle Clean Code < 300 lignes/fichier

5. ✅ **Schémas UI créés** : `lib/schemas/home-content.ts`
   - `HeroSlideInputSchema` (server) avec `z.coerce.bigint()`
   - `HeroSlideFormSchema` (UI) avec `z.number().int().positive()`
   - Évite type casting `as unknown as Resolver<>`

6. ✅ **API Routes obsolètes supprimées** :
   - `app/api/admin/home/hero/route.ts`
   - `app/api/admin/home/hero/[id]/route.ts`
   - `app/api/admin/home/about/route.ts`

7. ✅ **Documentation mise à jour** :
   - `.github/instructions/crud-server-actions-pattern.instructions.md` v1.1
   - Ajout règles schémas UI, split composants, erreurs 5-6

8. ✅ **Commit** : `8aaefe1` - "refactor: Clean Code & TypeScript conformity for TASK026"
   - 16 files changed, +504/-307 lines

### Architecture Pattern - 4 Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  Presentation (Client Components)                               │
│  └── Form.tsx uses UI schema (number for IDs)                  │
├─────────────────────────────────────────────────────────────────┤
│  Server Actions (lib/actions/)                                  │
│  └── Validation + DAL call + revalidatePath() ← SEUL ENDROIT   │
├─────────────────────────────────────────────────────────────────┤
│  Data Access Layer (lib/dal/)                                   │
│  └── Database ops + DALResult<T> + error codes [ERR_*]         │
├─────────────────────────────────────────────────────────────────┤
│  Database (Supabase)                                            │
│  └── RLS policies + is_admin() checks                          │
└─────────────────────────────────────────────────────────────────┘
```

### Blueprints Updated (2025-11-27)

- ✅ `memory-bank/architecture/Project_Folders_Structure_Blueprint_v3.md`
  - Date: Nov 22 → Nov 27
  - Section `lib/actions/` avec Server Actions pattern
  - Section `lib/schemas/` avec dual schemas (Server vs UI)
  - Extension template CRUD Feature (6 étapes)
  - Naming conventions détaillées

- ✅ `memory-bank/architecture/Project_Architecture_Blueprint.md`
  - Date: Nov 22 → Nov 27
  - 15+ sections mises à jour
  - ASCII diagrams (layer hierarchy, data flow)
  - useEffect sync pattern documenté
  - ADR entries pour décisions Nov 2025
  - Common Pitfalls table

### Key Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| `lib/actions/home-hero-actions.ts` | 77 | Server Actions CRUD Hero Slides |
| `lib/actions/home-about-actions.ts` | 33 | Server Actions About Content |
| `lib/schemas/home-content.ts` | 127 | Dual schemas (Server + UI) |
| `lib/dal/admin-home-hero.ts` | 265 | DAL Hero avec helpers <30L |
| `HeroSlideForm.tsx` | 200 | Form principal (splitté) |
| `HeroSlideFormImageSection.tsx` | 91 | Sous-composant image |

---

## TASK026 - Homepage Content Management `[FULLY IMPLEMENTED & COMMITTED]`

**Status**: Complete (14 groups, 27 files, 100% implementation, commit f5d0ffe, GitHub pushed)

### What Was Done

- **Backend Infrastructure** (10 files): Database RPC reorder function, Zod schemas with refinements, DAL with 8 functions, 9 API route handlers
- **React UI Components** (11 files): DnD Kit drag-drop with optimistic updates, form components with character counters, loading skeletons with Suspense, admin page routes
- **Infrastructure** (4 files): Error boundary, debounce hook, API test script, sidebar navigation update

### Key Technical Achievements

1. **Database**: RPC with SECURITY DEFINER + advisory lock for atomic reordering
2. **Security**: requireAdmin() on all mutations, RLS policies on all operations, server-only DAL with error codes
3. **UX**: Optimistic UI with rollback, drag-drop keyboard accessibility, character counters for accessibility
4. **Architecture**: Server/Client component split with Suspense boundaries, Zod validation at multiple layers

### Files Created

- Backend: supabase/schemas/63b_reorder_hero_slides.sql, lib/schemas/home-content.ts, lib/utils/validate-image-url.ts, lib/dal/admin-home-hero.ts, lib/dal/admin-home-about.ts, app/api/admin/home/* (5 route files)
- UI: `components/skeletons/*(2)`, `components/features/admin/home/*(7)`, `app/(admin)/admin/home/* (2)`
- Infrastructure: lib/hooks/use-debounce.ts, scripts/test-home-hero-api.ts, components/admin/AdminSidebar.tsx (updated), package.json (updated)

### Next Steps

- Manual testing checklist (TASK026 Group 11 specifications)
- Future enhancements: scheduled publishing, content versioning, A/B testing, multi-language support

---

Contexte précédent (au 2025-10-27):

- Incident de sécurité / outage (2025-10-25 → 2025-10-27) causé par une campagne de migrations REVOKE (Rounds 1-17) qui a supprimé des GRANTs table-level sur ~73 objets. Conséquence: erreurs PostgreSQL 42501 et indisponibilité de la homepage.
- Actions réalisées depuis l'incident:
  - Migrations d'urgence ajoutées pour restaurer les GRANTs critiques et EXECUTE sur fonctions (20251027020000 → 20251027022500).
  - CI: ajout d'un workflow de monitoring `monitor-detect-revoke` (cron daily) pour surveiller les runs et créer une issue si des échecs sont détectés.

Prochaines étapes immédiates:

- Surveiller `detect-revoke` pendant 7 jours; affiner les règles et régler les faux positifs.
- Documenter la procédure d'ajout à l'allowlist (PR + justification + approbation DB/infra).
- Ajouter tests d'intégration CI pour vérifier accès DAL (anon/authenticated) après modifications de migrations.

## Références (commits & migrations)

Commits récents pertinents (branche `feature/backoffice`):

- ci(monitor): add scheduled monitor for detect-revoke workflow — https://github.com/YanBerdin/rougecardinalcompany/commit/c74115e4ea9c847d8748411372b841c8f1e294b4 (YanBerdin)
- ci(security): fail CI when changed migrations contain REVOKE — https://github.com/YanBerdin/rougecardinalcompany/commit/e6b5249686a2482dd3bfd1e94f15270e6b865edf (YanBerdin)
- chore(ci): add README for allowed_exposed_objects and warn-only workflow — https://github.com/YanBerdin/rougecardinalcompany/commit/e0f09163b1ca075d1b5c0e9e8391b0620b46a70e (YanBerdin)
- add detected exposed DB objects to allowlist — https://github.com/YanBerdin/rougecardinalcompany/commit/3e160a842fba05c637c64237421b71cd90cd3aa0 (YanBerdin)
- chore(ci): allowlist known restored DB objects in audit — https://github.com/YanBerdin/rougecardinalcompany/commit/d1cfaadc8a5b776eea3867faeb7a842296e68360 (YanBerdin)
- chore(migrations): add warning headers & move dangerous revoke\_\* to legacy — https://github.com/YanBerdin/rougecardinalcompany/commit/8b9df198de4716ec7e9f45820c8141f3142e356a (YanBerdin)

Migrations d'urgence (résolution GRANTs & RLS) :

- `supabase/migrations/20251026180000_apply_spectacles_partners_rls_policies.sql`
- `supabase/migrations/20251026181000_apply_missing_rls_policies_home_content.sql`
- `supabase/migrations/20251026183000_restore_grants_critical_anon_tables.sql`
- `supabase/migrations/20251027020000_restore_grants_membres_equipe_spectacles.sql`
- `supabase/migrations/20251027021000_restore_grants_critical_functions.sql`
- `supabase/migrations/20251027022000_restore_grants_critical_anon_tables_final.sql`
- `supabase/migrations/20251027022500_restore_execute_grant_get_media_simple.sql`

## Phase 1 — Vitrine + Schéma déclaratif

Phase 1 — Vitrine + Schéma déclaratif finalisé. Documentation technique complète (24 instructions + memory-bank).

## Travaux novembre 2025

- ✅ **24-25 novembre — Clean Code Compliance Refactoring COMPLÉTÉ** :
  - **Issue** : Code quality audit identifie violation critique dans `lib/dal/admin-users.ts`
  - **Violation** : Fonction `inviteUser()` ~200 lignes (max 30 lignes requis par clean code standards)
  - **Actions** :
    - Plan de refactoring complet créé (`.github/prompts/plan-refactorInviteUserFunction.prompt.md`)
    - Extraction de 9 helper functions depuis monolithe 200 lignes
    - Ajout codes d'erreur systématiques `[ERR_INVITE_001]` à `[ERR_INVITE_007]`
    - Suppression de tous les commentaires (self-documenting function names)
    - Fonction principale réduite à 31 lignes (conforme < 30)
  - **Helper Functions créées** :
    1. `getCurrentAdminIdFromClaims()` - Extract admin ID from JWT (7 lignes)
    2. `checkInvitationRateLimit()` - Validate 10/day limit (15 lignes) + `ERR_INVITE_001`
    3. `verifyUserDoesNotExist()` - Check user existence (13 lignes) + `ERR_INVITE_002`
    4. `generateUserInviteLinkWithUrl()` - Create invite link (40 lignes) + `ERR_INVITE_003`, `ERR_INVITE_004`
    5. `waitForAuthUserCreation()` - Retry loop for user creation (17 lignes) + `ERR_INVITE_005`
    6. `createUserProfileWithRole()` - Upsert profile (25 lignes) + `ERR_INVITE_006`
    7. `rollbackProfileAndAuthUser()` - Cleanup helper (17 lignes)
    8. `sendInvitationEmailWithRollback()` - Email + rollback (24 lignes) + `ERR_INVITE_007`
    9. `logInvitationAuditRecord()` - Audit trail (12 lignes)
  - **Validation** : TypeScript 0 errors, ESLint clean, toutes fonctionnalités préservées
  - **Commit** : `24df375` - "refactor(dal): split inviteUser into helper functions per clean code standards"
  - **Impact** : Code maintenable, debuggable (error codes), testable (fonctions unitaires), conforme standards projet

- ✅ **24 novembre — CardsDashboard & Skeleton Centralization COMPLÉTÉ** :
  - **Issue** : Améliorer UX admin dashboard avec cards réutilisables et loading states cohérents
  - **Résultat** : Interface administrative modernisée avec grille de cartes et skeletons centralisés
  - **Composants créés** :
    - `components/admin/CardsDashboard.tsx` : Grille responsive de cards admin (6 liens rapides : équipe, spectacles, événements, médias, utilisateurs, réglages)
    - `components/skeletons/AdminDashboardSkeleton.tsx` : Skeleton full-page admin dashboard
    - `components/skeletons/AdminTeamSkeleton.tsx` : Skeleton grille de cards équipe (md:2, lg:3)
    - `components/skeletons/AdminSpectaclesSkeleton.tsx` : Skeleton table 7 colonnes (6 rows)
  - **Pages modifiées** :
    - `app/(admin)/admin/page.tsx` : Remplacement section "Actions rapides" par CardsDashboard
    - `app/(admin)/admin/loading.tsx` : Utilise AdminDashboardSkeleton directement
    - `app/(admin)/admin/team/loading.tsx` : Utilise AdminTeamSkeleton
    - `app/(admin)/admin/spectacles/loading.tsx` : Nouvelle page loading avec AdminSpectaclesSkeleton
    - `app/(admin)/admin/users/loading.tsx` : Utilise UsersManagementSkeleton
  - **Architecture** :
    - Suspense limité aux Server Components async (DashboardStatsContainer)
    - Loading states via `loading.tsx` Next.js convention (pas de Suspense wrapper)
    - Pattern Smart/Dumb : CardsDashboard (dumb) consommé par page admin (smart)
    - Responsive design : gap-4 md:grid-cols-2 lg:grid-cols-3
    - Icons : lucide-react (Users, Film, Calendar, Image, Settings, UserCog)
  - **Commit** : `feat(admin): add CardsDashboard and integrate into admin page`
  - **Push** : ✅ branch `feature/backoffice` mise à jour
  - **Impact** : Admin dashboard cohérent, réutilisable, loading states améliorés

- ✅ **21-23 novembre — TASK032 Admin User Invitation System COMPLÉTÉ** :
  - **Issue** : #32 - Système d'invitation admin end-to-end pour onboarder de nouveaux utilisateurs avec rôles (admin/editor/user)
  
  - **Fonctionnalités implémentées** :
    - ✅ **Liste utilisateurs** : Tableau shadcn/ui (email, nom, rôle, statut, date création, actions)
    - ✅ **Changement rôle** : Select interactif user/editor/admin avec Server Action
    - ✅ **Badges statut** : Vérifié (CheckCircle2), Invité (Mail), Non vérifié (AlertCircle) avec lucide-react
    - ✅ **Formatage dates** : date-fns locale fr ("il y a 2 jours")
    - ✅ **Suppression** : AlertDialog confirmation + Server Action
    - ✅ **Toast notifications** : Feedback sonner pour toutes actions
    - ✅ **Loading states** : Disabled pendant mutations
    - ✅ **Empty state** : Message si aucun utilisateur
    - ✅ **Formulaire invitation** : Validation Zod client (react-hook-form) + serveur
    - ✅ **Pattern Container/View** : Smart/Dumb components avec Suspense + Skeleton

  - **Architecture technique** :
    - **Migrations** :
      - `20251121185458_allow_admin_update_profiles.sql` : Fix RLS pour UPSERT (résout 42501)
      - `20251120231121_create_user_invitations.sql` : Table audit invitations
      - `20251120231146_create_pending_invitations.sql` : Table tracking pending
    - **DAL** : `lib/dal/admin-users.ts`
      - `inviteUser()` : Orchestration complète (rate-limit, création user, génération link, UPSERT profil avec `onConflict: 'user_id'`, audit, email, rollback complet si échec)
      - `findUserByEmail()` : Typage strict AuthUser | null
      - `listAllUsers()` : JOIN profiles avec UserWithProfile[]
      - `updateUserRole()`, `deleteUser()` : Server Actions avec validation Zod
      - Performance : `getClaims()` utilisé plutôt que `getUser()` quand ID suffisant
    - **Admin Client** : `supabase/admin.ts`
      - `createAdminClient()` : Wrapper service_role key, pattern cookies getAll/setAll
      - Import server-only pour protection client-side
    - **Email** : Templates React Email
      - `emails/invitation-email.tsx` : Template avec design Rouge Cardinal, unique Tailwind wrapper, CTA inline styles (indigo bg, white text)
      - `emails/utils/email-layout.tsx` : Layout réutilisable header/footer
      - `emails/utils/components.utils.tsx` : Composants Button/Section/Text
      - Validation render : Test unitaire vérifie HTML non vide + CTA/URL/recipient
    - **Email Service** : `lib/email/actions.ts`
      - `sendInvitationEmail()` : Server Action avec render React Email via Resend
      - Dev redirect : Gate EMAIL_DEV_REDIRECT + EMAIL_DEV_REDIRECT_TO env vars
      - Logging RGPD : sanitizeEmailForLogs() masque emails (y***@gmail.com)
    - **Client-Side Token** : `app/auth/setup-account/page.tsx`
      - Problème résolu : Tokens Supabase en URL hash invisible serveur
      - Solution : Client Component avec extraction window.location.hash
      - Session establishment via setSession() + cleanup sécurisé token

  - **Corrections critiques appliquées** :
    - 🔴 **Rollback Incomplet** : Ajout rollback complet dans inviteUser() si email échoue (delete profil + auth user)
    - 🔴 **Logs RGPD** : sanitizeEmailForLogs() pour masquer emails dans logs applicatifs
    - 🔴 **Test Email** : 4 assertions critiques ajoutées (styles inline CTA, conversion Tailwind, labels FR)
    - 🔴 **Doc .env** : Section CRITICAL WARNING ajoutée + deployment checklist + guide troubleshooting
    - 🔴 **CI pnpm** : Migration vers pnpm/action-setup@v4 + cache manuel actions/cache (résout path validation errors)
    - 🔴 **404 Setup** : Conversion page Client Component pour hash token processing (résout invitation flow)

  - **Tests & CI** :
    - Unit test : `__tests__/emails/invitation-email.test.tsx` (HTML render, CTA styles, Tailwind conversion, labels FR)
    - GitHub Actions : Workflow CI avec pnpm/action-setup@v4, cache manuel pnpm store, build + typecheck + tests
    - Scripts locaux : test-full-invitation.js, test-profile-insertion.js, find-auth-user.js, delete-test-user.js, generate-invite-link.js, check-existing-profile.js, seed-admin.ts

  - **Documentation & Commits** :
    - `.env.example` : Variables EMAIL_DEV_REDIRECT avec warnings production
    - `doc/dev-email-redirect.md` : Guide troubleshooting complet
    - `supabase/migrations/migrations.md` : Documentation migrations RLS
    - `memory-bank/activeContext.md` : Entry complète système invitation
    - Commits clés : feat(admin/invite), fix(admin-invitation), fix(auth), fix(ci) (5+ commits nov. 21-23)

  - **Respect Instructions** :
    - ✅ Clean Code : Fonctions ≤ 30 lignes, early returns, variables explicites
    - ✅ TypeScript Strict : Typage explicite partout, pas de any, type guards, Zod validation
    - ✅ RLS Policies : Une policy par opération, SELECT/USING, INSERT/WITH CHECK, UPDATE/USING+WITH CHECK, DELETE/USING
    - ✅ Migrations : Nommage YYYYMMDDHHmmss_description.sql, headers metadata, commentaires, SQL lowercase
    - ✅ Declarative Schema : Modifications dans supabase/schemas/, migrations générées via supabase db diff
    - ✅ Next.js 15 Backend : await headers()/cookies(), Server Components, Client Components pour interactivité, Server Actions 'use server'
    - ✅ Supabase Auth : @supabase/ssr, pattern cookies getAll/setAll, getClaims() pour checks rapides

  - **Workflow Invitation Complet** :
    1. Admin → /admin/users → Clic "Inviter"
    2. Formulaire → email, prénom, nom, rôle → Submit
    3. Server Action submitInvitation() → DAL inviteUser()
    4. Création auth user → Génération invite link → UPSERT profil (résilient trigger) → Audit → Email
    5. Si échec email → Rollback complet (delete profil + auth user)
    6. Utilisateur reçoit email → Clic lien
    7. Redirection /auth/setup-account#access_token=...
    8. Client Component → Extraction token hash → setSession() → Cleanup → Redirect
    9. Utilisateur connecté → Accès selon rôle

  - **Validation complète** :
    - TypeScript : ✅ 0 errors (pnpm tsc --noEmit)
    - ESLint : ✅ Clean
    - Tests : ✅ Unit test email passing, scripts locaux validés
    - CI : ✅ GitHub Actions build + typecheck + tests passing
    - Production-ready : ✅ Rollback complet, logging RGPD, dev-redirect documenté

  - **Impact** : Admin backoffice complet avec gestion utilisateurs end-to-end, invitations sécurisées, audit trail, templates email professionnels, flux invitation fonctionnel, documentation complète
  - **Issue** : Mise à jour documentation architecture email avec dev-redirect et render test/CI
  - **Actions** :
    - Version bump : 1.1.0 → 1.2.0 (date 22-11-2025)
    - Ajout section dev-redirect : logique `EMAIL_DEV_REDIRECT`/`EMAIL_DEV_REDIRECT_TO` avec code snippet
    - Documentation render test : `__tests__/emails/invitation-email.test.tsx` et CI workflow
    - Commit : `61643e7` - "docs(email): update Email Service Architecture with dev-redirect and render test"
    - Push : ✅ Poussé vers `feature/backoffice`
  - **Impact** : Documentation à jour, dev-redirect documenté, tests CI couverts

- ✅ **22 novembre — Project Architecture & Folder Blueprint v3 Generated** :
  - **Issue** : Régénération blueprints architecture avec generator prompt
  - **Actions** :
    - Utilisation prompt `architecture-blueprint-generator.prompt.md`
    - Génération `doc/architecture/Project_Architecture_Blueprint.md`
    - Génération `memory-bank/architecture/Project_Folders_Structure_Blueprint_v3.md`
    - Commit : `8a34f8e` - "docs(doc): generate project architecture and project folder blueprint"
    - Push : ✅ Poussé vers `feature/backoffice`
  - **Impact** : Blueprints v3 publiés, architecture documentée

- ✅ **22 novembre — Invitation Email Render Test + CI** :
  - **Issue** : Test unitaire pour `InvitationEmail` + CI workflow
  - **Actions** :
    - Test standalone : `__tests__/emails/invitation-email.test.tsx` (renderToStaticMarkup)
    - Fix runtime error : `globalThis.React = React` avant dynamic import
    - CI workflow : `.github/workflows/invitation-email-test.yml` (runs on push/PR)
    - Validation : Test passe localement, CI workflow créé
  - **Impact** : Email rendering testable, CI coverage ajoutée

- ✅ **22 novembre — Admin User Invitation Flow Restored** :
  - **Issue** : RLS 42501 bloquant admin invite (UPSERT UPDATE policy violation)
  - **Root Cause** : UPDATE policy manquait sur `public.profiles` pour admin operations
  - **Solution** :
    - Migration : `20251121185458_allow_admin_update_profiles.sql`
    - DAL update : `upsert(..., { onConflict: 'user_id' })` pour resilience
    - DB push : ✅ Appliqué sur remote Supabase
  - **Validation** : Invite flow fonctionnel, admin profile creation possible
  - **Impact** : Admin backoffice opérationnel

- ✅ **22 novembre — Critical Fix: Invitation Setup 404 Resolution** :
  - **Issue** : 404 error on `/auth/setup-account` preventing invited users from completing registration
  - **Root Cause** : Supabase invitation tokens in URL hash (`#access_token=...`) invisible to server-side middleware
  - **Solution** :
    - Converted `app/(marketing)/auth/setup-account/page.tsx` to client component (`'use client'`)
    - Added `useEffect` to extract tokens from `window.location.hash`
    - Implemented `supabase.auth.setSession()` with extracted tokens
    - Added error handling and loading states
    - Maintained server-side validation for security
  - **Technical Details** :
    - Client-side token processing required because hash fragments not sent to server
    - Pattern: `useEffect(() => { const hash = window.location.hash; ... })`
    - Security: Server-side validation still enforced after client-side session establishment
  - **Validation** : End-to-end invitation flow tested successfully
  - **Impact** : Complete admin user invitation system now functional

- ✅ **22 novembre — Admin Sidebar Updated** :
  - **Issue** : Ajout menu "Utilisateurs" dans admin dashboard
  - **Actions** :
    - `components/admin/AdminSidebar.tsx` : Ajout `UserCog` icon + "Utilisateurs" link
    - Navigation : `/admin/users` ajouté
  - **Impact** : Accès direct à gestion utilisateurs depuis sidebar

- ✅ **16 novembre — TASK021 Admin Backoffice Spectacles CRUD COMPLÉTÉ (Phases 1+2+3)** :
  - **Issue** : #1 - Content Management CRUD avec gestion spectacles complète
  - **Phases complétées** :
    - ✅ **Phase 1 - DAL Spectacles** : Toutes fonctions Clean Code compliant (≤ 30 lignes)
    - ✅ **Phase 2 - API Routes** : 5 endpoints (GET list, POST create, GET detail, PATCH update, DELETE)
    - ✅ **Phase 3 - Admin UI** : 7 composants (SpectacleForm, SpectaclesTable, SpectacleCard, etc.)
  - **Bug découvert & résolu** : Erreur RLS 42501 "row-level security policy violation"
    - **Root Cause** : Missing profile entry in `profiles` table with `role='admin'`
    - **Investigation** : Debug logs → Discovered user authenticated but `is_admin()` returns false
    - **Solution** : Created admin profile via SQL Editor: `INSERT INTO profiles (user_id, role) VALUES (...)`
  - **Refactoring clé** : `insertSpectacle()` preserve Supabase client context throughout operation
    - Helper function `performAuthenticatedInsert()` with client parameter passing
    - Single client instance prevents auth context loss
  - **Migration créée** : `20251116160000_fix_spectacles_insert_policy.sql`
    - Documents RLS policy fix (use `is_admin()` instead of `auth.uid()`)
    - Hotfix migration (Cloud already has correct policy via declarative schema)
  - **Procédure documentée** : `memory-bank/procedures/admin-user-registration.md`
    - Complete step-by-step guide for registering new admin users
    - Troubleshooting section with common issues
    - Security notes and architecture documentation
  - **Validation complète** :
    - CREATE: ✅ Spectacle créé avec succès
    - READ: ✅ Liste et détails fonctionnels
    - UPDATE: ✅ Modifications enregistrées
    - DELETE: ✅ Suppression opérationnelle
  - **Code quality** :
    - TypeScript: ✅ 0 errors (`pnpm tsc --noEmit`)
    - Clean Code: ✅ All functions ≤ 30 lignes
    - Production-ready: ✅ Debug logs removed
  - **Commit** : `96c32f3` - "fix(dal): preserve Supabase client auth context + add RLS policy migration"
    - 4 files changed, 77 insertions(+), 45 deletions(-)

  - **Push GitHub** : ✅ Commits poussés vers `feature/backoffice` (Everything up-to-date)
  - **Impact** : Admin backoffice spectacles fully functional, ready for production use

- ✅ **15 novembre — TASK027B SECURITY DEFINER Rationale Headers COMPLÉTÉ** :
  - **Issue** : #27 - Require explicit SECURITY DEFINER justification in function headers
  - **Résultat** : 6 fonctions documentées avec headers de justification explicites
  - **Fonctions modifiées** :
    - Auth/Profiles sync triggers : `handle_new_user()`, `handle_user_deletion()`, `handle_user_update()`
    - Core helpers : `is_admin()`, `get_current_timestamp()`
    - Admin RPC : `reorder_team_members(jsonb)`
  - **Template header** : Rationale, Risks Evaluated, Validation, Grant Policy
  - **Documentation** : `.github/instructions/Database_Create_functions.instructions.md` mis à jour
  - **Issue GitHub** : #27 fermée avec rapport complet (15 nov 2025)
  - **Impact** : Traçabilité améliorée, code reviews facilités, aucun impact runtime

- ✅ **15 novembre — TASK028B Cleanup Scripts Obsolètes COMPLÉTÉ** :
  - **Issue** : #28 - Suppression de 3 scripts d'audit temporaires Round 7
  - **Résultat** : Fichiers déjà supprimés le 26 oct 2025 (commit `20ecfbb`)
  - **Fichiers supprimés** :
    - `supabase/scripts/quick_audit_test.sql` (version simplifiée redondante)
    - `supabase/scripts/check_round7b_grants.sh` (script bash Round 7b)
    - `supabase/migrations/verify_round7_grants.sql` (vérification ponctuelle)
  - **Outils conservés** : `audit_grants.sql`, `quick_check_all_grants.sql`, `audit_grants_filtered.sql`
  - **Documentation** : Section "Cleanup Post-Audit" ajoutée dans `migrations.md`
  - **Issue GitHub** : #28 fermée avec rapport complet (15 nov 2025)
  - **Impact** : Repository nettoyé, maintenance simplifiée, scripts archivés dans Git

- ✅ **15 novembre — TASK026B Database Functions Compliance COMPLÉTÉ** :
  - **Résultat final** : 100% compliance (28/28 fonctions avec `SET search_path = ''`)
  - **Fonction corrigée** : `public.reorder_team_members(jsonb)` dans `63_reorder_team_members.sql`
  - **Méthode** : Hotfix SQL Editor direct (Section 5.5 "Hotfix Migrations and Schema Synchronization")
  - **Justification** : 32 migrations Cloud manquantes (incident RLS 27 oct - campagne erronée déjà annulée)
  - **Migration locale** : `20251115150000_fix_reorder_team_members_search_path.sql` créée et documentée
  - **Schéma déclaratif** : `supabase/schemas/63_reorder_team_members.sql` synchronisé
  - **Documentation** :
    - `supabase/migrations/migrations.md` : Section "Corrections et fixes critiques" ajoutée
    - `memory-bank/tasks/TASK026B-db-functions-compliance.md` : Progress log complet
    - `doc-perso/TASK026B-cloud-fix-procedure.md` : Procédure hotfix validée
  - **Validation** : `SELECT proconfig FROM pg_proc WHERE proname = 'reorder_team_members'` → `{search_path=}` ✅
  - **Issue #26** : Commentaire complet (audit results + correction details + documentation) + closed with "completed"
  - **Impact sécurité** : Protection contre injection schéma sur fonction SECURITY DEFINER admin
  - **Performance** : Zero downtime (remplacement à chaud)

- ✅ **14 novembre — API Code Quality Refactoring + Newsletter Migration** :
  - **Documentation** : Plan d'analyse et refactoring complet créé (`.github/prompts/plan-apiRefactoringReview.prompt.md`)
    - 10 fichiers analysés (8 API routes + 1 DAL + 1 helpers)
    - Score global : 9.4/10 (production-ready)
    - 22 issues identifiées (priorities 1-5)
    - Plan structuré en 3 phases avec checklists
  - **Phase 1 - ApiResponse Pattern Unification** :
    - `contact/route.ts` : Full ApiResponse migration (validationError, success, error)
    - `team/route.ts` : Hybrid approach pour backward compatibility (NextResponse.json pour arrays, ApiResponse.error pour erreurs)
    - `newsletter/route.ts` : Full ApiResponse migration (4 replacements - validation, DB error, success, catch)
    - Import cleanup : Suppression des imports inutilisés (NextResponse, PostgresError)
    - Fix import path : `@/types/contact.types` → `@/lib/email/schemas`
  - **Phase 2 - DAL Type Naming Consistency** :
    - Suppression du type `DalResponse<T>` (duplication)
    - Unification sur `DALResult<null>` pour 4 fonctions (hardDelete, validate, perform, handleError)
    - Mise à jour des return statements : `{ success: true }` → `{ success: true, data: null }`
    - Type system 100% cohérent
  - **Phase 3 - JSDoc Comprehensive Documentation** :
    - 8 fonctions DAL documentées avec JSDoc complet
    - Tags ajoutés : `@param`, `@returns`, `@example`
    - ~69 lignes de documentation inline
    - IntelliSense IDE pleinement fonctionnel
  - **Validation Complète** :
    - TypeScript : `pnpm tsc --noEmit` ✅ (0 errors)
    - ESLint : `pnpm eslint --quiet` ✅ (0 warnings après fix 2 erreurs scripts)
    - Runtime : Tests browser ✅ (backward compatibility OK)
    - Tests DAL : `test-team-active-dal.ts` ✅ (5/5 passed - 1073ms total)
    - Tests API : `test-active-endpoint.ts` ✅ (17/17 passed avec auth admin)
      -Tests Newsletter : `test-newsletter-endpoint.ts` ✅ (6/6 passed - 1452ms total)
  - **Score improvement** : 9.4/10 → 9.8/10 (avec newsletter + validation complète)

- ✅ **13 novembre — Dashboard Refactoring COMPLET (3 phases)** :
  - **Phase 1 - Foundation** : ErrorBoundary réutilisable, types Zod, test script (100% pass)
  - **Phase 2 - Component Extraction** : StatsCard (29L), DAL dashboard.ts (54L), DashboardStatsContainer (45L)
    - admin/page.tsx : 133 → 69 lignes (-48%)
    - StatsCardsSkeleton extrait dans components/skeletons/
    - Pattern Smart/Dumb components respecté
    - Suspense + ErrorBoundary pour UX optimale
  - **Phase 3 - API Routes** : Contact + Newsletter refactored
    - parseFullName() helper (plus de parsing manuel)
    - isUniqueViolation() type guard (exit magic string '23505')
    - HttpStatus constants partout (400, 500 → HttpStatus.BAD_REQUEST, etc.)
    - 0 TypeScript errors, code DRY, maintainability++
  - **Tests** : 4/4 passing (800ms fetch, 524ms validation, 781ms parallel)
  - **Success Criteria** : 9/9 atteints ✨

- ✅ **13 novembre — Refactoring complet API /active + suite de tests automatisés** :
  - **Endpoint refactorisé** : `/api/admin/team/[id]/active` avec validation Zod complète
    - Schema de transformation : accept boolean | "true"/"false" | 0/1
    - Transforme en boolean canonique avant DAL
    - Retours structurés avec status HTTP appropriés (200, 400, 422, 500)
    - Tests TypeScript intégrés : 4 scénarios (success, 404, 422, 500)
  - **Helpers API créés** : `lib/api/helpers.ts` (135 lignes)
    - HttpStatus constants (OK, BAD_REQUEST, NOT_FOUND, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR)
    - PostgresError constants (UNIQUE_VIOLATION, FOREIGN_KEY_VIOLATION, NOT_NULL_VIOLATION)
    - parseFullName() function (split firstName + lastName)
    - isUniqueViolation() type guard pour Supabase errors
    - ApiResponse helpers (success/error/validationError)
    - withAdminAuth wrapper pour protected routes
  - **Scripts de tests** : 5 nouveaux fichiers dans `scripts/`
    - `test-active-endpoint.ts` (client-like HTTP test)
    - `test-active-endpoint-admin.ts` (admin auth test)
    - `test-active-endpoint-comprehensive.ts` (4 scénarios complets)
    - `test-active-roundtrip-full.ts` (test E2E GET → PATCH → GET)
    - `test-email-integration.ts` (validation Resend)
  - **DAL team optimisé** : `lib/dal/team.ts` (42 lignes → 4 helpers < 30 lignes chacun)
    - getTeamMemberById() : fetch avec select minimal
    - updateTeamMemberActive() : PATCH avec revalidatePath
    - handleTeamMemberNotFound() : error helper
    - validateUpdateTeamMemberInput() : Zod validation + transformation
  - **Documentation mise à jour** :
    - Changelog avec architecture patterns (Smart/Dumb, DAL, ApiResponse)
    - Guide extraction cookie auth
    - Section admin management
    - Changelog 2025-11-13
  - **Commit créé** : c9a9ee7 "refactor(api): Complete refactoring of `/api/admin/team/[id]/active`"
    - 12 fichiers modifiés, 1186 lignes ajoutées, 63 supprimées
    - 6 nouveaux fichiers (helpers.ts + 5 scripts)
    - Qualité code : 10/10 (TypeScript + Clean Code)

- ✅ **13 novembre — Hard-delete endpoint pour membres d'équipe inactifs** :
  - **Nouveau endpoint** : `DELETE /api/admin/team/[id]/hard-delete`
    - Protection admin via `withAdminAuth` wrapper
    - Validation : membre doit exister + active=false
    - Test script TypeScript : 5 scénarios (inactive OK, active KO, 404, auth, errors)
    - Erreurs structurées avec status HTTP appropriés (200, 400, 403, 404, 422, 500)
  - **DAL team étendu** : `lib/dal/team.ts`
    - Nouvelle fonction `deleteTeamMember(id: bigint)` server-only
    - Gestion d'erreur avec PostgresError types
    - revalidatePath('/admin/team') après delete
  - **Documentation** :
    - README endpoint avec exemples curl
    - Guide de test avec `pnpm exec tsx scripts/test-hard-delete-endpoint.ts`
    - Instructions rollback (soft-delete = `UPDATE active = false`)
  - **Commit créé** : 61e9e6c "feat(api): Add hard-delete endpoint for inactive team members"
    - 147 lignes ajoutées, 38 supprimées
    - Production-ready avec garde-fous RGPD

- ✅ **11 novembre — Migration route groups** : refactor des pages `/admin/*` et homepage `/` pour utiliser route groups (`(admin)` et `(marketing)`) conformément à l'architecture Next.js 15
  - **Commit** : 6a2c7d8 "refactor: migrate admin and marketing routes to route groups"
  - **Fichiers modifiés** :
    - `app/(admin)/admin/` : tous les fichiers déplacés depuis `app/admin/`
    - `app/(marketing)/page.tsx` : homepage (vitrine)
    - `app/(admin)/layout.tsx` : layout admin avec AppSidebar + ThemeProvider
    - `app/(marketing)/layout.tsx` : layout public (Header + Footer)
  - **Bénéfices** :
    - Séparation claire des layouts (admin vs marketing)
    - Respect des conventions Next.js 15 App Router
    - Meilleure organisation du code
    - Protection auth isolée au layout admin
  - **Notes** :
    - Route groups (`(nom)`) n'affectent pas l'URL
    - `/admin/team` reste `/admin/team` (pas de `/(admin)` dans l'URL)
    - Middleware adapté pour matcher les deux zones

- ✅ **20 novembre — Sécurité Database : Déplacement extensions vers schéma dédié** :
  - **Issue** : Warning Supabase MCP "Extension in public schema" (unaccent, pg_trgm, citext)
  - **Action** : Création schéma `extensions` et déplacement des extensions
  - **Migration** : `20251120120000_move_extensions_to_schema.sql`
    - Création schéma `extensions`
    - Grant usage à `postgres`, `anon`, `authenticated`, `service_role`
    - `ALTER EXTENSION ... SET SCHEMA extensions`
    - `ALTER DATABASE ... SET search_path TO public, extensions`
  - **Schéma déclaratif** :
    - `supabase/schemas/01_extensions.sql` : Ajout `WITH SCHEMA extensions`
    - `supabase/schemas/16_seo_metadata.sql` : Qualification `extensions.unaccent()`
  - **Impact** : Schéma `public` nettoyé, conformité recommandations sécurité Supabase
  - **Issue** : #1 - Content Management CRUD avec gestion spectacles complète
  - **Phases complétées** :
    - ✅ **Phase 1 - DAL Spectacles** : Toutes fonctions Clean Code compliant (≤ 30 lignes)
    - ✅ **Phase 2 - API Routes** : 5 endpoints (GET list, POST create, GET detail, PATCH update, DELETE)
    - ✅ **Phase 3 - Admin UI** : 7 composants (SpectacleForm, SpectaclesTable, SpectacleCard, etc.)
  - **Bug découvert & résolu** : Erreur RLS 42501 "row-level security policy violation"
    - **Root Cause** : Missing profile entry in `profiles` table with `role='admin'`
    - **Investigation** : Debug logs → Discovered user authenticated but `is_admin()` returns false
    - **Solution** : Created admin profile via SQL Editor: `INSERT INTO profiles (user_id, role) VALUES (...)`
  - **Refactoring clé** : `insertSpectacle()` preserve Supabase client context throughout operation
    - Helper function `performAuthenticatedInsert()` with client parameter passing
    - Single client instance prevents auth context loss
  - **Migration créée** : `20251116160000_fix_spectacles_insert_policy.sql`
    - Documents RLS policy fix (use `is_admin()` instead of `auth.uid()`)
    - Hotfix migration (Cloud already has correct policy via declarative schema)
  - **Procédure documentée** : `memory-bank/procedures/admin-user-registration.md`
    - Complete step-by-step guide for registering new admin users
    - Troubleshooting section with common issues
    - Security notes and architecture documentation
  - **Validation complète** :
    - CREATE: ✅ Spectacle créé avec succès
    - READ: ✅ Liste et détails fonctionnels
    - UPDATE: ✅ Modifications enregistrées
    - DELETE: ✅ Suppression opérationnelle
  - **Code quality** :
    - TypeScript: ✅ 0 errors (`pnpm tsc --noEmit`)
    - Clean Code: ✅ All functions ≤ 30 lines
    - Production-ready: ✅ Debug logs removed
  - **Commit** : `96c32f3` - "fix(dal): preserve Supabase client auth context + add RLS policy migration"
    - 4 files changed, 77 insertions(+), 45 deletions(-)

  - **Push GitHub** : ✅ Commits poussés vers `feature/backoffice` (Everything up-to-date)
  - **Impact** : Admin backoffice spectacles fully functional, ready for production use

- ✅ **15 novembre — TASK027B SECURITY DEFINER Rationale Headers COMPLÉTÉ** :
  - **Issue** : #27 - Require explicit SECURITY DEFINER justification in function headers
  - **Résultat** : 6 fonctions documentées avec headers de justification explicites
  - **Fonctions modifiées** :
    - Auth/Profiles sync triggers : `handle_new_user()`, `handle_user_deletion()`, `handle_user_update()`
    - Core helpers : `is_admin()`, `get_current_timestamp()`
    - Admin RPC : `reorder_team_members(jsonb)`
  - **Template header** : Rationale, Risks Evaluated, Validation, Grant Policy
  - **Documentation** : `.github/instructions/Database_Create_functions.instructions.md` mis à jour
  - **Checklist sécurité** : 10 items pour code review
  - **Issue GitHub** : #27 fermée avec rapport complet (15 nov 2025)
  - **Impact** : Traçabilité améliorée, code reviews facilités, aucun impact runtime

- ✅ **15 novembre — TASK028B Cleanup Scripts Obsolètes COMPLÉTÉ** :
  - **Issue** : #28 - Suppression de 3 scripts d'audit temporaires Round 7
  - **Résultat** : Fichiers déjà supprimés le 26 oct 2025 (commit `20ecfbb`)
  - **Fichiers supprimés** :
    - `supabase/scripts/quick_audit_test.sql` (version simplifiée redondante)
    - `supabase/scripts/check_round7b_grants.sh` (script bash Round 7b)
    - `supabase/migrations/verify_round7_grants.sql` (vérification ponctuelle)
  - **Outils conservés** : `audit_grants.sql`, `quick_check_all_grants.sql`, `audit_grants_filtered.sql`
  - **Documentation** : Section "Cleanup Post-Audit" ajoutée dans `migrations.md`
  - **Issue GitHub** : #28 fermée avec rapport complet (15 nov 2025)
  - **Impact** : Repository nettoyé, maintenance simplifiée, scripts archivés dans Git

- ✅ **15 novembre — TASK026B Database Functions Compliance COMPLÉTÉ** :
  - **Résultat final** : 100% compliance (28/28 fonctions avec `SET search_path = ''`)
  - **Fonction corrigée** : `public.reorder_team_members(jsonb)` dans `63_reorder_team_members.sql`
  - **Méthode** : Hotfix SQL Editor direct (Section 5.5 "Hotfix Migrations and Schema Synchronization")
  - **Justification** : 32 migrations Cloud manquantes (incident RLS 27 oct - campagne erronée déjà annulée)
  - **Migration locale** : `20251115150000_fix_reorder_team_members_search_path.sql` créée et documentée
  - **Schéma déclaratif** : `supabase/schemas/63_reorder_team_members.sql` synchronisé
  - **Documentation** :
    - `supabase/migrations/migrations.md` : Section "Corrections et fixes critiques" ajoutée
    - `memory-bank/tasks/TASK026B-db-functions-compliance.md` : Progress log complet
    - `doc-perso/TASK026B-cloud-fix-procedure.md` : Procédure hotfix validée
  - **Validation** : `SELECT proconfig FROM pg_proc WHERE proname = 'reorder_team_members'` → `{search_path=}` ✅
  - **Issue #26** : Commentaire complet (audit results + correction details + documentation) + closed with "completed"
  - **Commits** : 5 fichiers modifiés (`migrations.md, _index.md, _preview, TASK026B.md, GitHub comment/close`)
  - **Impact sécurité** : Protection contre injection schéma sur fonction SECURITY DEFINER admin
  - **Performance** : Zero downtime (remplacement à chaud)

- ✅ **14 novembre — API Code Quality Refactoring + Newsletter Migration** :
  - **Documentation** : Plan d'analyse et refactoring complet créé (`.github/prompts/plan-apiRefactoringReview.prompt.md`)
    - 10 fichiers analysés (8 API routes + 1 DAL + 1 helpers)
    - Score global : 9.4/10 (production-ready)
    - 22 issues identifiées (priorities 1-5)
    - Plan structuré en 3 phases avec checklists
  - **Phase 1 - ApiResponse Pattern Unification** :
    - `contact/route.ts` : Full ApiResponse migration (validationError, success, error)
    - `team/route.ts` : Hybrid approach pour backward compatibility (NextResponse.json pour arrays, ApiResponse.error pour erreurs)
    - `newsletter/route.ts` : Full ApiResponse migration (4 replacements - validation, DB error, success, catch)
    - Import cleanup : Suppression des imports inutilisés (NextResponse, PostgresError)
    - Fix import path : `@/types/contact.types` → `@/lib/email/schemas`
  - **Phase - DAL Type Naming Consistency** :
    - Suppression du type `DalResponse<T>` (duplication)
    - Unification sur `DALResult<null>` pour 4 fonctions (hardDelete, validate, perform, handleError)
    - Mise à jour des return statements : `{ success: true }` → `{ success: true, data: null }`
    - Type system 100% cohérent
  - **Phase 3 - JSDoc Comprehensive Documentation** :
    - 8 fonctions DAL documentées avec JSDoc complet
    - Tags ajoutés : `@param`, `@returns`, `@example`
    - ~69 lignes de documentation inline
    - IntelliSense IDE pleinement fonctionnel
  - **Validation Complète** :
    - TypeScript : `pnpm tsc --noEmit` ✅ (0 errors)
    - ESLint : `pnpm eslint --quiet` ✅ (0 warnings après fix 2 erreurs scripts)
    - Runtime : Tests browser ✅ (backward compatibility OK)
    - Tests DAL : `test-team-active-dal.ts` ✅ (5/5 passed - 1073ms total)
    - Tests API : `test-active-endpoint.ts` ✅ (17/17 passed avec auth admin)
      -Tests Newsletter : `test-newsletter-endpoint.ts` ✅ (6/6 passed - 1452ms total)
  - **Score improvement** : 9.4/10 → 9.8/10 (avec newsletter + validation complète)

- ✅ **13 novembre — Dashboard Refactoring COMPLET (3 phases)** :
  - **Phase 1 - Foundation** : ErrorBoundary réutilisable, types Zod, test script (100% pass)
  - **Phase 2 - Component Extraction** : StatsCard (29L), DAL dashboard.ts (54L), DashboardStatsContainer (45L)
    - admin/page.tsx : 133 → 69 lignes (-48%)
    - StatsCardsSkeleton extrait dans components/skeletons/
    - Pattern Smart/Dumb components respecté
    - Suspense + ErrorBoundary pour UX optimale
  - **Phase 3 - API Routes** : Contact + Newsletter refactored
    - parseFullName() helper (plus de parsing manuel)
    - isUniqueViolation() type guard (exit magic string '23505')
    - HttpStatus constants partout (400, 500 → HttpStatus.BAD_REQUEST, etc.)
    - 0 TypeScript errors, code DRY, maintainability++
  - **Tests** : 4/4 passing (800ms fetch, 524ms validation, 781ms parallel)
  - **Success Criteria** : 9/9 atteints ✨

- ✅ **13 novembre — Refactoring complet API /active + suite de tests automatisés** :
  - **Endpoint refactorisé** : `/api/admin/team/[id]/active` avec validation Zod complète
    - Schema de transformation : accept boolean | "true"/"false" | 0/1
    - Transforme en boolean canonique avant DAL
    - Retours structurés avec status HTTP appropriés (200, 400, 422, 500)
    - Tests TypeScript intégrés : 4 scénarios (success, 404, 422, 500)
  - **Helpers API créés** : `lib/api/helpers.ts` (135 lignes)
    - HttpStatus constants (OK, BAD_REQUEST, NOT_FOUND, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR)
    - PostgresError constants (UNIQUE_VIOLATION, FOREIGN_KEY_VIOLATION, NOT_NULL_VIOLATION)
    - parseFullName() function (split firstName + lastName)
    - isUniqueViolation() type guard pour Supabase errors
    - ApiResponse helpers (success/error/validationError)
    - withAdminAuth wrapper pour protected routes
  - **Scripts de tests** : 5 nouveaux fichiers dans `scripts/`
    - `test-active-endpoint.ts` (client-like HTTP test)
    - `test-active-endpoint-admin.ts` (admin auth test)
    - `test-active-endpoint-comprehensive.ts` (4 scénarios complets)
    - `test-active-roundtrip-full.ts` (test E2E GET → PATCH → GET)
    - `test-email-integration.ts` (validation Resend)
  - **DAL team optimisé** : `lib/dal/team.ts` (42 lignes → 4 helpers < 30 lignes chacun)
    - getTeamMemberById() : fetch avec select minimal
    - updateTeamMemberActive() : PATCH avec revalidatePath
    - handleTeamMemberNotFound() : error helper
    - validateUpdateTeamMemberInput() : Zod validation + transformation
  - **Documentation mise à jour** :
    - Changelog avec architecture patterns (Smart/Dumb, DAL, ApiResponse)
    - Guide extraction cookie auth
    - Section admin management
    - Changelog 2025-11-13
  - **Commit créé** : c9a9ee7 "refactor(api): Complete refactoring of `/api/admin/team/[id]/active`"
    - 12 fichiers modifiés, 1186 lignes ajoutées, 63 supprimées
    - 6 nouveaux fichiers (helpers.ts + 5 scripts)
    - Qualité code : 10/10 (TypeScript + Clean Code)

- ✅ **13 novembre — Hard-delete endpoint pour membres d'équipe inactifs** :
  - **Nouveau endpoint** : `DELETE /api/admin/team/[id]/hard-delete`
    - Protection admin via `withAdminAuth` wrapper
    - Validation : membre doit exister + active=false
    - Test script TypeScript : 5 scénarios (inactive OK, active KO, 404, auth, errors)
    - Erreurs structurées avec status HTTP appropriés (200, 400, 403, 404, 422, 500)
  - **Sécurité RLS** :
    - Politique PostgreSQL sur `membres_equipe` : `is_admin()` requis pour DELETE
    - Double protection : API-level (withAdminAuth) + DB-level (RLS)
    - Logs serveur pour traçabilité des suppressions
  - **DAL team étendu** : `lib/dal/team.ts`
    - Nouvelle fonction `deleteTeamMember(id: bigint)` server-only
    - Gestion d'erreur avec PostgresError types
    - revalidatePath('/admin/team') après delete
  - **Documentation** :
    - README endpoint avec exemples curl
    - Guide de test avec `pnpm exec tsx scripts/test-hard-delete-endpoint.ts`
    - Instructions rollback (soft-delete = `UPDATE active = false`)
  - **Commit créé** : 61e9e6c "feat(api): Add hard-delete endpoint for inactive team members"
    - 147 lignes ajoutées, 38 supprimées
    - Production-ready avec garde-fous RGPD

- ✅ **11 novembre — Migration route groups** : refactor des pages `/admin/*` et homepage `/` pour utiliser route groups (`(admin)` et `(marketing)`) conformément à l'architecture Next.js 15
  - **Commit** : 6a2c7d8 "refactor: migrate admin and marketing routes to route groups"
  - **Fichiers modifiés** :
    - `app/(admin)/admin/` : tous les fichiers déplacés depuis `app/admin/`
    - `app/(marketing)/page.tsx` : homepage (vitrine)
    - `app/(admin)/layout.tsx` : layout admin avec AppSidebar + ThemeProvider
    - `app/(marketing)/layout.tsx` : layout public (Header + Footer)
  - **Bénéfices** :
    - Séparation claire des layouts (admin vs marketing)
    - Respect des conventions Next.js 15 App Router
    - Meilleure organisation du code
    - Protection auth isolée au layout admin
  - **Notes** :
    - Route groups (`(nom)`) n'affectent pas l'URL
    - `/admin/team` reste `/admin/team` (pas de `/(admin)` dans l'URL)
    - Middleware adapté pour matcher les deux zones

- ✅ **20 novembre — Sécurité Database : Déplacement extensions vers schéma dédié** :
  - **Issue** : Warning Supabase MCP "Extension in public schema" (unaccent, pg_trgm, citext)
  - **Action** : Création schéma `extensions` et déplacement des extensions
  - **Migration** : `20251120120000_move_extensions_to_schema.sql`
    - Création schéma `extensions`
    - Grant usage à `postgres`, `anon`, `authenticated`, `service_role`
    - `ALTER EXTENSION ... SET SCHEMA extensions`
    - `ALTER DATABASE ... SET search_path TO public, extensions`
  - **Schéma déclaratif** :
    - `supabase/schemas/01_extensions.sql` : Ajout `WITH SCHEMA extensions`
    - `supabase/schemas/16_seo_metadata.sql` : Qualification `extensions.unaccent()`
  - **Impact** : Schéma `public` nettoyé, conformité recommandations sécurité Supabase

## Architecture actuelle

### Smart/Dumb Components (Dashboard)

- **Smart Components** : Containers qui fetch data (async Server Components)
  - Exemple : `DashboardStatsContainer.tsx` (45 lignes)
  - Rôle : appeler DAL, gérer ErrorBoundary, passer data aux dumb components
  - Pattern : `export async function ComponentContainer() { const data = await fetchFromDAL(); return <DumbComponent data={data} /> }`

- **Dumb Components** : Présentation pure (props → UI)
  - Exemple : `StatsCard.tsx` (29 lignes)
  - Rôle : afficher data reçue en props, pas de fetch, pas de state
  - Pattern : `export function StatsCard({ title, value, icon, href }: Props) { return <Card>...</Card> }`

- **Skeletons** : Loading states dans `components/skeletons/`
  - Exemple : `StatsCardsSkeleton.tsx` (27 lignes)
  - Utilisé avec Suspense : `<Suspense fallback={<Skeleton />}><Container /></Suspense>`

### Data Access Layer (DAL)

- **Localisation** : `lib/dal/*.ts` (server-only)
- **Directives** : `"use server"` + `import "server-only"`
- **Rôle** : centraliser accès BDD, validation Zod, error handling
- **Pattern** :

```typescript
export async function fetchData(): Promise<ValidatedType> {
  const supabase = await createClient();
  const [result1, result2] = await Promise.all([query1, query2]);
  // Error handling
  const errors = [result1.error, result2.error].filter(e => e !== null);
  if (errors.length > 0) throw new Error(...);
  // Validation
  return Schema.parse(data);
}
```

### API Routes Patterns

- **Helpers** : `lib/api/helpers.ts` (135 lignes)
  - HttpStatus constants (200, 400, 403, 404, 422, 500)
  - PostgresError constants ("23505", "23503", "23502")
  - Type guards : `isUniqueViolation()`, `isForeignKeyViolation()`
  - Parsers : `parseFullName()` (firstName + lastName)
  - ApiResponse : `success()`, `error()`, `validationError()`
  - Auth : `withAdminAuth()` wrapper

- **Route Handler Pattern** :

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = Schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error },
        { status: HttpStatus.BAD_REQUEST }
      );
    }
    // Business logic with DAL
    const result = await dalFunction(validated.data);
    return NextResponse.json(result, { status: HttpStatus.OK });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
```

### Admin Authorization Pattern

**CRITICAL REQUIREMENT** : Admin users MUST have profile entry with `role='admin'`

**Architecture** :

- RLS policies use `public.is_admin()` function (SECURITY DEFINER)
- Function checks `profiles.role = 'admin'` for `auth.uid()`
- Without profile entry → `is_admin()` returns false → RLS blocks operations

**Profile Creation** :

```sql
INSERT INTO public.profiles (user_id, role, display_name)
VALUES (
  'UUID_FROM_AUTH_USERS',
  'admin',
  'Display Name'
)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

**Complete Procedure** : See `memory-bank/procedures/admin-user-registration.md`

**Common Pitfall** : Authenticated user ≠ Authorized admin

- User exists in `auth.users` (Supabase Auth)
- User has session and JWT token
- BUT: No profile entry → `is_admin()` returns false → RLS error 42501

**Troubleshooting** :

```sql
-- Check if profile exists
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Test is_admin() (from application, NOT SQL Editor)
SELECT public.is_admin();
```

### Protected Routes (Admin)

- **Pattern 1 : withAdminAuth wrapper** (API routes)

```typescript
export const DELETE = withAdminAuth(async (req, { params }) => {
  // Already authenticated + admin verified
  // params.id is validated
});
```

- **Pattern 2 : Explicit check** (Server Components)

```typescript
export default async function AdminPage() {
  const supabase = await createClient();
  const claims = await supabase.auth.getClaims();
  if (!claims) redirect("/auth/login");
  const isAdmin = await checkAdminStatus(claims.sub);
  if (!isAdmin) redirect("/unauthorized");
  // Admin content
}
```

### Error Handling

- **ErrorBoundary** : `components/admin/ErrorBoundary.tsx` (105 lignes)
  - Usage : `<ErrorBoundary><Component /></ErrorBoundary>`
  - Custom fallback : `<ErrorBoundary fallback={(error, reset) => <Custom />}>`
  - Logs : `console.error("[ErrorBoundary] Caught error:", error)`

- **DAL Errors** : Throw errors, catch at boundary

```typescript
if (error) throw new Error(`Failed to fetch: ${error.message}`);
```

- **API Errors** : Return structured responses

```typescript
return NextResponse.json(
  { error: "Message", details: {...} },
  { status: HttpStatus.BAD_REQUEST }
);
```

### Testing Strategy

- **Scripts TypeScript** : `scripts/test-*.ts` (exécutés avec `pnpm exec tsx`)
- **Pattern** :

```typescript
interface TestResult {
  name: string;
  success: boolean;
  duration: number;
}

async function runTest(
  name: string,
  testFn: () => Promise<unknown>
): Promise<TestResult> {
  const start = Date.now();
  try {
    const data = await testFn();
    return { name, success: true, duration: Date.now() - start, data };
  } catch (error) {
    return {
      name,
      success: false,
      duration: Date.now() - start,
      error: error.message,
    };
  }
}
```

- **Scénarios testés** :
  - Fetch data (200 OK)
  - Validation Zod (input invalides → 400)
  - Not found (404)
  - Auth (401/403)
  - Server errors (500)
  - Parallel execution (performance)

### Performance

- **Parallel queries** : `Promise.all([query1, query2, ...])`
- **Caching** : React `cache()` pour DAL functions (à venir)
- **Suspense streaming** : `<Suspense fallback={<Skeleton />}>`
- **Revalidation** : `revalidatePath('/route')` après mutations

### Code Quality Metrics

- **Dashboard refactoring** :
  - admin/page.tsx : 133 → 69 lignes (-48%)
  - Tests : 4/4 passing (800ms fetch, 524ms validation)
  - Success criteria : 9/9 met

- **API /active refactoring** :
  - lib/dal/team.ts : 42 lignes → 4 helpers < 30 lignes each
  - Scripts de tests : 5 nouveaux fichiers
  - 0 TypeScript errors, 100% type safety

### Documentation

- **Instructions** : `.github/instructions/*.instructions.md` (24 fichiers)
  - Clean code, TypeScript, Next.js, Supabase, Security, Testing
- **Memory Bank** : `memory-bank/*.md`
  - activeContext.md (ce fichier)
  - systemPatterns.md (architecture)
  - techContext.md (stack)
  - progress.md (roadmap)
- **Copilot Instructions** : `.github/copilot-instructions.md`
  - Architectural knowledge
  - Coding patterns
  - Security rules

## Prochaines étapes (Phase 2 — Backoffice)

**Issues GitHub ouvertes (18 total)** :

**Priorité Haute** :

- Issue #3 : Partners Management (TASK023) - Prochaine tâche
- Issue #6 : Homepage Content Management (TASK026) - Haute priorité

**Back-office Tasks (Issues #1-20)** :

- ✅ #1 : TASK021 - Content Management CRUD (TERMINÉ 16 nov 2025)
- #3 : TASK023 - Partners Management
- #4 : TASK024 - Press Management
- #6 : TASK026 - Homepage Content Management
- #7 : TASK027 - Company Content Management
- #8 : TASK028 - Content Versioning UI
- #9 : TASK029 - Media Library
- #10 : TASK030 - Display Toggles
- #11 : TASK031 - Access Controls for Content
- #12 : TASK032 - Audit Log and Activity
- #13 : TASK033 - Bulk Import/Export
- #14 : TASK034 - Editorial Workflow
- #15 : TASK035 - UI Localization
- #16 : TASK036 - Notifications & Email Templates
- #17 : TASK037 - Data Retention & Purge
- #18 : TASK038 - Performance Optimisation
- #19 : TASK039 - Tests & QA
- #20 : TASK040 - Documentation

**Issues Fermées Récemment** :

- ✅ Issue #5 : TASK025 - RLS Security & Performance Fixes (23 oct 2025)
- ✅ Issue #24 : TASK025B - Security Audit Campaign (26 oct 2025 - fermée 15 nov 2025)
- ✅ Issue #26 : TASK026B - Database Functions Compliance (15 nov 2025)
- ✅ Issue #27 : TASK027B - SECURITY DEFINER Rationale Headers (fermée 15 nov 2025)
- ✅ Issue #28 : TASK028B - Cleanup Obsolete Scripts (26 oct 2025 - fermée 15 nov 2025)

1. **Gestion d'équipe** :
   - ✅ Hard-delete endpoint (fait)
   - ✅ Active/inactive toggle (fait)
   - ✅ Database functions compliance (TASK026B - fait)
   - TODO : UI React pour CRUD membres
   - TODO : Upload photos membres (Supabase Storage)

2. **Gestion spectacles** :
   - TODO : CRUD spectacles (titre, description, dates)
   - TODO : Relations spectacles ↔ membres (rôles)
   - TODO : Upload médias spectacles

3. **Gestion événements** :
   - TODO : CRUD événements (dates, lieux, statuts)
   - TODO : Relations événements ↔ spectacles

4. **Dashboard admin** :
   - ✅ Stats cards (fait)
   - TODO : Graphiques activité (Chart.js / Recharts)
   - TODO : Logs récents

5. **Testing & CI/CD** :
   - ✅ Scripts TypeScript pour endpoints (fait)
   - TODO : Playwright E2E tests
   - TODO : GitHub Actions CI (lint + tests)

6. **Performance** :
   - TODO : React cache() sur DAL functions
   - TODO : Image optimization (next/image)
   - TODO : Bundle analysis (next-bundle-analyzer)

## Notes techniques importantes

### Next.js 15 Breaking Changes

- **cookies() et headers()** : doivent être awaited

```typescript
const cookieStore = await cookies(); // Next.js 15
const headersList = await headers(); // Next.js 15
```

- **Route groups** : organisation recommandée

```bash
app/
  (admin)/
    layout.tsx        # Admin layout
    admin/page.tsx    # /admin
  (marketing)/
    layout.tsx        # Public layout
    page.tsx          # /
```

### Supabase Auth Optimized

- **getClaims()** : ~2-5ms (JWT local verification)
- **getUser()** : ~300ms (network call)
- **Règle** : Use getClaims() for auth checks, getUser() only when need full user data

### TypeScript Strict Mode

- **No `any`** : Use `unknown` for external data
- **Type guards** : `if (error instanceof Error)`, `isUniqueViolation(error)`
- **Zod validation** : Runtime type safety at boundaries

### Security Layers

1. **API-level** : `withAdminAuth()` wrapper
2. **DB-level** : RLS policies avec `is_admin()`
3. **Input validation** : Zod schemas
4. **Output sanitization** : Minimal DTOs, no sensitive data

### Git Workflow

- **Branche actuelle** : `feature/backoffice`
- **Commits récents** :
  - 61e9e6c : Hard-delete endpoint
  - c9a9ee7 : API /active refactoring
  - 6a2c7d8 : Route groups migration

---

**Dernière mise à jour** : 2025-11-27  
**Responsable** : YanBerdin  
**Statut** : Clean Code Conformity complété, Blueprints v4 mis à jour, documentation synchronisée
