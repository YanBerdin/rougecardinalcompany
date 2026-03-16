# \[TASK078] — Implémentation des tests permissions et rôles

**Status:** In Progress
**Added:** 2026-03-14
**Updated:** 2026-03-16 (E2E P0 permissions)

## Original Request

Implémenter les 239 cas de test définis dans `specs/tests-permissions-et-rôles.md` pour prouver que le modèle de permissions `user(0) < editor(1) < admin(2)` fonctionne correctement aux 4 niveaux : unitaire, DAL, RLS SQL et E2E.

## Thought Process

- Le plan de test exhaustif existe déjà (TASK076 deliverable) : `specs/tests-permissions-et-rôles.md`
- 239 cas répartis en 4 niveaux : UNIT=42, DAL=80, RLS=92, E2E=25
- Source de vérité ACL : `memory-bank/acl-permissions-role.md`
- Scripts de référence existants : `scripts/test-editor-access-local.ts`, `scripts/test-editor-access-remote.ts`
- Besoin d'un fichier `.env.e2e` avec credentials de test (déjà dans `.gitignore`)

## Prérequis

1. **Fichier `.env.e2e`** à créer manuellement (secrets, jamais commités) :

   ```bash
   E2E_ADMIN_EMAIL=admin@rougecardinalcompany.fr
   E2E_ADMIN_PASSWORD=...
   E2E_EDITOR_EMAIL=editor@rougecardinalcompany.fr
   E2E_EDITOR_PASSWORD=...
   E2E_USER_EMAIL=user@rougecardinalcompany.fr
   E2E_USER_PASSWORD=...
   PLAYWRIGHT_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. **Comptes de test** créés dans Supabase local avec les rôles appropriés (`app_metadata.role`)
3. **Supabase local** démarré (`supabase start`)
4. **Dépendances Playwright** installées (`pnpm exec playwright install`)

## Implementation Plan

### Phase 1 — Tests unitaires (ROLE-UNIT-001 → 042)

- Fichier : `__tests__/auth/role-helpers.test.ts`
- Fichier : `__tests__/auth/roles.test.ts`
- Framework : Vitest/Jest
- 42 cas couvrant `normalizeRole()`, `isRoleAtLeast()`, `ROLE_HIERARCHY`, guards server

### Phase 2 — Tests DAL intégration (ROLE-DAL-001 → 080)

- Fichier : `__tests__/dal/permissions-integration.test.ts` (ou split par section)
- Nécessite Supabase local + comptes de test
- 80 cas : editor CRUD éditorial, editor bloqué admin-only, admin accès complet, user bloqué

### Phase 3 — Tests RLS SQL (ROLE-RLS-001 → 092)

- Script : `scripts/test-permissions-rls.ts` (extension de `test-editor-access-local.ts`)
- Tests directs SQL via clients Supabase avec différents JWT
- 92 cas : anon public, editor éditorial, admin complet, fonctions SQL, storage buckets, views

### Phase 4 — Tests E2E Playwright (ROLE-E2E-001 → 025)

- Dossier : `e2e/tests/permissions/`
- Nécessite `.env.e2e` + auth setup
- 23 cas P0 implémentés : navigation admin, sidebar filtrage, redirections, API admin
- **EXCLUSION** : ROLE-E2E-004 et 005 (CRUD spectacle/événement) ne sont pas dans ces tests car ils relèvent de tests fonctionnels, pas de tests de permissions — ils seront couverts par la suite de tests CRUD/DAL

## Progress Tracking

**Overall Status:** In Progress — 10%

### Subtasks

| ID  | Description                        | Status      | Updated    | Notes                                                   -------  |
| --- | ---------------------------------- | ----------- | ---------- | ---------------------------------------------------------------- |
| 0.1 | Tests E2E P0 pages publiques       | Complete    | 2026-03-16 | 14/14 tests passent — rapport `doc/E2E-P0-PUBLIC-PAGES-REPORT.md |
| 1.1 | Créer `.env.e2e` (manuel)          | Complete    | 2026-03-16 | Existe, utilisé par Playwright config                            |
| 1.2 | Créer comptes de test Supabase     | Not Started | 2026-03-14 | admin/editor/user                                                |
| 2.1 | Tests unitaires role-helpers.ts    | Not Started | 2026-03-14 | 11 cas normalizeRole + 9 isRoleAtLeast + 4 ROLE_HIERARCHY        |
| 2.2 | Tests unitaires roles.ts guards    | Not Started | 2026-03-14 | 18 cas getCurrentUserRole + requireMinRole + wrappers            |
| 3.1 | Tests DAL editor CRUD éditorial    | Not Started | 2026-03-14 | 32 cas (section 3.1)                                             |
| 3.2 | Tests DAL editor bloqué admin-only | Not Started | 2026-03-14 | 21 cas (section 3.2)                                             |
| 3.3 | Tests DAL admin accès complet      | Not Started | 2026-03-14 | 15 cas (section 3.3)                                             |
| 3.4 | Tests DAL user bloqué              | Not Started | 2026-03-14 | 12 cas (section 3.4)                                             |
| 4.1 | Tests RLS anon lecture publique    | Not Started | 2026-03-14 | Section 4.1                                                      |
| 4.2 | Tests RLS editor éditorial         | Not Started | 2026-03-14 | Section 4.2                                                      |
| 4.3 | Tests RLS admin complet            | Not Started | 2026-03-14 | Section 4.3                                                      |
| 4.4 | Tests RLS user restrictions        | Not Started | 2026-03-14 | Section 4.4                                                      |
| 4.5 | Tests RLS fonctions SQL            | Not Started | 2026-03-14 | Section 4.5                                                      |
| 4.6 | Tests RLS storage buckets          | Not Started | 2026-03-14 | Section 4.6                                                      |
| 4.7 | Tests RLS views service_role       | Not Started | 2026-03-14 | Section 4.7                                                      |
| 5.1 | Tests E2E P0 permissions (23 cas)  | In Progress | 2026-03-16 | ROLE-E2E-001-013, 016-024 — auth setups + fixtures + spec créés. ROLE-E2E-004/005 exclus (fonctionnel, pas permissions) |

## Progress Log

### 2026-03-16 — E2E P0 Permissions

- **Tests E2E P0 permissions : 23 cas créés (ROLE-E2E-001→013, 016→024)**
- Auth setup files créés : `e2e/tests/auth/admin.setup.ts`, `editor.setup.ts`, `user.setup.ts`
- Fixtures créées : `e2e/tests/permissions/permissions.fixtures.ts` (4 fixtures : adminPage, editorPage, userPage, anonPage)
- Spec créée : `e2e/tests/permissions/permissions.spec.ts` (5 describe blocks, 23 tests)
- `playwright.config.ts` mis à jour : 3 projets setup + projet `permissions` avec `dependencies`
- **Exclusion documentée** : ROLE-E2E-004 (CRUD spectacle) et 005 (CRUD événement) exclus car fonctionnels, pas liés aux permissions — à couvrir dans la suite de tests CRUD/DAL
- Subtask 5.1 mise à jour : In Progress

### 2026-03-16 — E2E P0 pages publiques

- **Tests E2E P0 pages publiques terminés : 14/14 passent**
- Infrastructure Playwright : `playwright.config.ts` (ESM, 1 worker, timeout 90 s)
- 6 Page Objects créés dans `e2e/pages/public/` (302 lignes)
- 6 fixtures + 6 specs dans `e2e/tests/public/` (254 lignes)
- Couverture : 6 pages (accueil, spectacles, compagnie, agenda, presse, contact)
- Types de tests : chargement page, navigation, validation formulaire, soumission réussie, newsletter
- Contraintes documentées : rate limiter en mémoire, compilation Turbopack à froid (25-35 s), mémoire limitée
- Rapport complet : `doc/E2E-P0-PUBLIC-PAGES-REPORT.md`
- Subtask 0.1 (E2E P0 pages publiques) marquée Complete
- Subtask 1.1 (`.env.e2e`) marquée Complete (fichier existe et fonctionne)

### 2026-03-14

- Task created
- Test plan finalisé : 239 cas dans `specs/tests-permissions-et-rôles.md`
- `.env.e2e` ajouté au `.gitignore`
- Branch : `test/task078-implement-permissions-tests`
- Commit initial : `e320a9d`

## Références

- Plan de test : `specs/tests-permissions-et-rôles.md`
- Matrice ACL : `memory-bank/acl-permissions-role.md`
- Scripts existants : `scripts/test-editor-access-local.ts`
- Doc E2E auth : `doc/test-prompts/E2E_Auth_Setup_RCC.md`
- Doc E2E quick ref : `e2e-tests/E2E_Tests_QuickReference_RCC.md`
