# TASK096 — Durcissement sécurité auth invite/setup

**Status:** Completed  
**Added:** 2026-05-20  
**Updated:** 2026-05-20

## Original Request

Migration du rôle de `user_metadata` (modifiable par l'utilisateur — faille d'élévation de privilège) vers `app_metadata` (server-only), durcissement de la politique de mot de passe, migration du flow setup-account côté Server Action avec audit + correction du `userRole` codé en dur.

## Thought Process

L'invariant critique du projet : `auth.users.raw_app_meta_data->>'role'` DOIT être égal à `public.profiles.role`. Sans cela, `is_admin()` renvoie `false` → RLS `42501` → redirection `/auth/login` même pour un JWT admin valide.

Le problème initial : le rôle était écrit dans `raw_user_meta_data`, qui est modifiable par l'utilisateur via `supabase.auth.updateUser()`. Un editor pouvait donc s'élever en admin en forgeant ce champ côté client. La solution : migrer toutes les lectures/écritures vers `raw_app_meta_data` (server-only, non modifiable par l'utilisateur).

## Implementation Plan

### Phase 1 — Migration role → app_metadata ✅

- Step 1 : Backfill idempotent `app_metadata.role` depuis `profiles.role`
- Step 2 : DAL `admin-users.ts` — n'écrit plus `role` en `user_metadata`
- Step 3 : Triggers SQL `handle_new_user` + `handle_user_update` — lisent `raw_app_meta_data`
- Step 4 : Guards applicatifs `lib/auth/roles.ts` — plus de fallback `user_metadata.role`
- Step 5 : Cleanup fallback SQL (différé puis fait)
- Step 6 : Scripts CI/admin nettoyés

### Phase 2 — Politique mot de passe ✅

- Step 7 : Dashboard Supabase — min 12 chars, 4 classes, OTP 1800s
- Step 8 : `lib/schemas/auth.ts` `PasswordSchema` + `PasswordWithConfirmationSchema`

### Phase 3 — Server Action setupAccount ✅

- Step 9 : `lib/actions/auth-setup-actions.ts::setupAccountAction`
- Step 10 : `SetupAccountForm.tsx` refactorisé — appel SA direct, plus de client Supabase browser
- Step 11 : Suppression prop `userRole` hardcodée dans `page.tsx`

### Phase 4 — Cleanup ✅

- Step 12 : 7 `console.log` debug retirés de `setup-account/page.tsx`

### Phase 5 — Tests & invariant CI ✅

- Step 5 : Cleanup fallback SQL dans triggers
- Step 13 : 29 tests unitaires (`__tests__/schemas/auth.test.ts` + `__tests__/auth/roles.test.ts`)
- Step 14 : 4 tests E2E invite→setup (INVITE-SETUP-001→004)
- Step 15 : Test non-régression escalade (ROLE-ESC-001)
- Step 16 : Script `check-role-invariant.ts` + workflow CI cron quotidien

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID   | Description                                     | Status   | Updated    | Notes                                                      |
| ---- | ----------------------------------------------- | -------- | ---------- | ---------------------------------------------------------- |
| 1.1  | Backfill app_metadata.role (migration)          | Complete | 2026-05-20 | Embarqué dans `20260520134210_sync_role_to_app_metadata.sql` |
| 1.2  | DAL admin-users.ts — retrait user_metadata.role | Complete | 2026-05-20 | `generateUserInviteLinkWithUrl` + `updateUserRole` nettoyés |
| 1.3  | Triggers handle_new_user + handle_user_update   | Complete | 2026-05-20 | 3 migrations déployées local + cloud                       |
| 1.4  | Guards applicatifs roles.ts                     | Complete | 2026-05-20 | Lecture unique `app_metadata.role`                         |
| 1.5  | Cleanup fallback SQL                            | Complete | 2026-05-20 | Migration `20260520160650`                                 |
| 1.6  | Scripts CI/admin nettoyés                       | Complete | 2026-05-20 | 9 scripts modifiés                                         |
| 2.1  | Dashboard Supabase config mot de passe          | Complete | 2026-05-20 | min 12, 4 classes, OTP 1800s                               |
| 2.2  | PasswordSchema lib/schemas/auth.ts              | Complete | 2026-05-20 | `superRefine` 4 classes                                    |
| 3.1  | Server Action setupAccountAction                | Complete | 2026-05-20 | `lib/actions/auth-setup-actions.ts`                        |
| 3.2  | SetupAccountForm refactorisé                    | Complete | 2026-05-20 | Plus de `createClient` browser                             |
| 4.1  | Cleanup console.log debug                       | Complete | 2026-05-20 | 7 logs retirés                                             |
| 4.2  | Suppression lib/auth/is-admin.ts                | Complete | 2026-05-20 | Fichier `@deprecated` sans import — supprimé               |
| 5.1  | 29 tests unitaires                              | Complete | 2026-05-20 | `__tests__/schemas/auth.test.ts` + `roles.test.ts`         |
| 5.2  | 4 tests E2E invite→setup                        | Complete | 2026-05-20 | `invite-setup.spec.ts` — INVITE-SETUP-001→004              |
| 5.3  | Test non-régression escalade                    | Complete | 2026-05-20 | `role-escalation.spec.ts` — ROLE-ESC-001 vert              |
| 5.4  | Script check-role-invariant.ts + CI             | Complete | 2026-05-20 | `scripts/check-role-invariant.ts` + `.github/workflows/check-role-invariant.yml` |

## Progress Log

### 2026-05-20

> **Phase 1 — Migration role → app_metadata**

- Migration `20260520134210_sync_role_to_app_metadata.sql` : `handle_new_user()` lit `raw_app_meta_data` en priorité + backfill idempotent — déployée local + cloud. 0 violation invariant post-push.
- `lib/dal/admin-users.ts` : `generateUserInviteLinkWithUrl` ne pose plus `role` en `user_metadata`. `updateUserRole` supprime `user_metadata: { role }`. `_admin_managed` conservé en `user_metadata` (flag opérationnel, non sensible).
- Migration `20260520153000_refactor_handle_user_update_app_metadata.sql` : `handle_user_update()` lit `raw_app_meta_data->>'role'`, guard étendue à `old.raw_app_meta_data IS DISTINCT FROM new.raw_app_meta_data`.
- `lib/auth/roles.ts` : `readRoleFromMeta()` lit uniquement `claims.app_metadata.role`. Plus aucun fallback `user_metadata.role`.
- Migration `20260520160650_remove_user_metadata_role_fallback.sql` : fallbacks temporaires retirés de `handle_new_user()` et `handle_user_update()`.
- 9 scripts nettoyés (`create-admin-user.ts`, `create-admin-user-local.ts`, `ci-create-test-accounts.ts`, `test-views-security-authenticated{,-cloud}.ts`, `test-editor-access-{local,remote}.ts`, `test-permissions-rls.ts`).
- `components/admin/AdminAuthRow.tsx` + `components/auth-button.tsx` lisent `app_metadata.role` uniquement.
- `lib/auth/is-admin.ts` supprimé (aucun import, `@deprecated`).

> **Phase 2 — Mot de passe**

- Dashboard Supabase configuré : min 12 chars, Lowercase + Uppercase + Digits + Symbols, OTP 1800s. HIBP non disponible sur plan Free.
- `lib/schemas/auth.ts` : `PasswordSchema` (`min(12)` + `superRefine` 4 classes) + `PasswordWithConfirmationSchema`.
- Intégré dans `SetupAccountForm.tsx`, `sign-up-form.tsx`, `update-password-form.tsx`.

> **Phase 3 — Server Action setupAccount**

- `lib/actions/auth-setup-actions.ts` : `setupAccountAction` — validation Zod, `getClaims()`, `supabase.auth.updateUser({ password })`, redirection serveur depuis `app_metadata.role`.
- `SetupAccountForm.tsx` : appel direct SA, prop `userRole` supprimée, plus de `createClient` browser.
- `app/(marketing)/auth/setup-account/page.tsx` : attribut `userRole="user"` supprimé, 7 console.log debug retirés.

> **Phase 5 — Tests**

- 29 tests unitaires verts : `PasswordSchema` (min 12 + 4 classes) + invariant `getCurrentUserRole` ignore `user_metadata.role` forgé.
- 4 tests E2E INVITE-SETUP-001→004 verts (26.1s) : helper `auth-invite.ts` génère invite via `generateLink({type:'invite'})`, force `app_metadata.role` via `updateUserById`, intercepte redirect Inbucket → reconstruit URL `/auth/setup-account#fragment`.
- ROLE-ESC-001 vert (15.7s) : editor appelant `supabase.auth.updateUser({data:{role:'admin'}})` ne devient PAS admin — `app_metadata.role==='editor'` confirmé.
- `scripts/check-role-invariant.ts` : vérifie l'invariant sur toute la table `auth.users` via `pg.Client`. Variable dédiée `INVARIANT_DB_URL`.
- `.github/workflows/check-role-invariant.yml` : cron quotidien 07:00 UTC + `workflow_dispatch`.

## Fichiers créés / modifiés

| Fichier | Action |
| ------- | ------ |
| `supabase/migrations/20260520134210_sync_role_to_app_metadata.sql` | CRÉÉ |
| `supabase/migrations/20260520153000_refactor_handle_user_update_app_metadata.sql` | CRÉÉ |
| `supabase/migrations/20260520160650_remove_user_metadata_role_fallback.sql` | CRÉÉ |
| `supabase/migrations/migrations.md` | MODIFIÉ |
| `supabase/schemas/05_profiles_auto_sync.sql` | MODIFIÉ |
| `supabase/schemas/21_functions_auth_sync.sql` | MODIFIÉ |
| `lib/dal/admin-users.ts` | MODIFIÉ |
| `lib/auth/roles.ts` | MODIFIÉ |
| `lib/auth/is-admin.ts` | SUPPRIMÉ |
| `lib/actions/auth-setup-actions.ts` | CRÉÉ |
| `lib/schemas/auth.ts` | CRÉÉ |
| `components/auth/SetupAccountForm.tsx` | MODIFIÉ |
| `components/admin/AdminAuthRow.tsx` | MODIFIÉ |
| `components/auth-button.tsx` | MODIFIÉ |
| `components/sign-up-form.tsx` | MODIFIÉ |
| `components/update-password-form.tsx` | MODIFIÉ |
| `app/(marketing)/auth/setup-account/page.tsx` | MODIFIÉ |
| `__tests__/schemas/auth.test.ts` | CRÉÉ |
| `__tests__/auth/roles.test.ts` | MODIFIÉ |
| `e2e/helpers/auth-invite.ts` | CRÉÉ |
| `e2e/pages/auth/setup-account.page.ts` | CRÉÉ |
| `e2e/tests/auth/invite-setup/invite-setup.fixtures.ts` | CRÉÉ |
| `e2e/tests/auth/invite-setup/invite-setup.spec.ts` | CRÉÉ |
| `e2e/tests/auth/role-escalation/role-escalation.spec.ts` | CRÉÉ |
| `scripts/backfill-app-metadata-role.ts` | CRÉÉ |
| `scripts/check-role-invariant.ts` | CRÉÉ |
| `scripts/ci-create-test-accounts.ts` | MODIFIÉ |
| `scripts/create-admin-user-local.ts` | MODIFIÉ |
| `scripts/create-admin-user.ts` | MODIFIÉ |
| `scripts/test-editor-access-local.ts` | MODIFIÉ |
| `scripts/test-editor-access-remote.ts` | MODIFIÉ |
| `scripts/test-permissions-rls.ts` | MODIFIÉ |
| `scripts/test-views-security-authenticated-cloud.ts` | MODIFIÉ |
| `scripts/test-views-security-authenticated.ts` | MODIFIÉ |
| `.github/workflows/check-role-invariant.yml` | CRÉÉ |
| `.github/prompts/plan-TASK096-hardenAuthRoleSecurity.prompt.md` | MODIFIÉ |

## Notes de Sécurité

- **HIBP (leaked password protection)** : indisponible sur plan Free Supabase — à activer lors d'un upgrade Pro.
- **Step 5 cleanup SQL** : déjà fait dans cette tâche (migration `20260520160650`). Plus de fallback `user_metadata` dans les triggers.
- **Secret CI requis** : `INVARIANT_DB_URL` doit être configuré dans les GitHub Actions secrets pour que le workflow quotidien fonctionne.
- **Audit logging** `setupAccountAction` : hors scope (table `public.logs_audit` alimentée par triggers SQL, `auth.users` non tracké par la couche applicative). À traiter en tâche dédiée si requis.
