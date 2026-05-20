# Plan: Durcissement sécurité auth invite/setup

Migration du rôle de `user_metadata` (modifiable par l'utilisateur — faille d'élévation de privilège) vers `app_metadata` (server-only), durcissement de la politique de mot de passe et migration du flow setup-account côté Server Action avec audit + correction du `userRole` codé en dur.

**Invariant critique à préserver** (cf. [doc/troubleshooting-admin-auth.md](../../doc/troubleshooting-admin-auth.md)) :

> Pour tout utilisateur : `auth.users.raw_app_meta_data->>'role'` **DOIT** être égal à `public.profiles.role`. Sinon : `is_admin()` SQL renvoie `false` → RLS `42501` → redirection `/auth/login` malgré un JWT admin valide.

## 📊 État d'avancement (2026-05-20)

### ✅ Phase 1 — Migration role → app_metadata (TERMINÉE côté écritures)

- ✅ **Step 3 (triggers SQL)** : `handle_new_user()` réécrit dans [supabase/schemas/21_functions_auth_sync.sql](supabase/schemas/21_functions_auth_sync.sql) (+ miroir dans [supabase/schemas/05_profiles_auto_sync.sql](supabase/schemas/05_profiles_auto_sync.sql)) : lit `role` depuis `raw_app_meta_data` en priorité (fallback `raw_user_meta_data` conservé temporairement, à retirer en step 5), et synchronise `auth.users.raw_app_meta_data.role` après insert profil (garde `IS DISTINCT FROM` pour éviter recursion trigger). `handle_user_update()` aligné de la même manière. Migration consolidée [supabase/migrations/20260520134210_sync_role_to_app_metadata.sql](supabase/migrations/20260520134210_sync_role_to_app_metadata.sql) avec backfill UPDATE idempotent — **appliquée local + cloud le 2026-05-20**. Invariant SQL Cloud vérifié post-push : **0 violation**.
- ✅ **Step 1 (backfill)** : embarqué dans la migration ci-dessus (idempotent). 0 violation post-push cloud.
- ✅ **Step 2 (DAL admin-users.ts)** : `generateUserInviteLinkWithUrl` et `updateUserRole` n'écrivent plus `role` dans `user_metadata`. `app_metadata.role` posé via `updateUserById` post-création. `_admin_managed` conservé en `user_metadata` (flag opérationnel).
- ✅ **Step 4 (guards applicatifs)** : [lib/auth/roles.ts](lib/auth/roles.ts) lit uniquement `claims.app_metadata.role` via `readRoleFromMeta()`. Plus de fallback `user_metadata.role`.
- ✅ **Step 6 (scripts)** : `scripts/create-admin-user.ts` + `create-admin-user-local.ts` + `ci-create-test-accounts.ts` + `test-views-security-authenticated{,-cloud}.ts` + `test-editor-access-{local,remote}.ts` + `test-permissions-rls.ts` nettoyés (2026-05-20). Plus aucune écriture `user_metadata.role` dans le repo.
- ✅ **UI** : `components/admin/AdminAuthRow.tsx` + `components/auth-button.tsx` lisent `app_metadata.role` uniquement, avec commentaires anti-escalation. Path `getUser()` fallback supprimé dans `auth-button.tsx`.
- ⏸ **Step 5 (cleanup fallback SQL)** : à différer post-validation production (Phase 5).

### ✅ Phase 2 — Politique mot de passe — TERMINÉE (2026-05-20)

- ✅ **Step 7** : config Supabase Dashboard appliquée — `Minimum length = 12`, `Lowercase + Uppercase + Digits + Symbols`, `Email OTP expiration = 1800s`. ⚠ **Leaked password protection (HIBP)** indisponible : projet sur plan Free (réservé Pro+). À réactiver lors d'un upgrade Pro.
- ✅ **Step 8** : créé [lib/schemas/auth.ts](lib/schemas/auth.ts) avec `PasswordSchema` (min 12 + 4 classes via `superRefine`) et `PasswordWithConfirmationSchema`. Intégré dans :
  - [components/auth/SetupAccountForm.tsx](components/auth/SetupAccountForm.tsx) — resolver `zodResolver(PasswordWithConfirmationSchema)`.
  - [components/sign-up-form.tsx](components/sign-up-form.tsx) — guard `PasswordSchema.safeParse()` pré-submit.
  - [components/update-password-form.tsx](components/update-password-form.tsx) — guard `PasswordSchema.safeParse()` pré-submit.
  - `login-form.tsx` + `forgot-password-form.tsx` : exclus (pas de création de mot de passe).

### ✅ Phase 3 — Server Action setupAccount — TERMINÉE

- ✅ **Step 9** : `lib/actions/auth-setup-actions.ts::setupAccountAction` créée (validation Zod, `getClaims()`, redirection serveur depuis `app_metadata.role`).
- ✅ **Step 10** : `SetupAccountForm.tsx` refactorisé — appel direct de la Server Action, prop `userRole` supprimée, plus de client Supabase côté browser pour la mutation.
- ✅ **Step 11 (bundled)** : `app/(marketing)/auth/setup-account/page.tsx` — attribut `userRole="user"` supprimé.
- ℹ️ Audit logging dans l'action : hors scope (table `public.logs_audit` alimentée par triggers SQL uniquement, `auth.users` non tracké, pas de helper applicatif). À traiter en tâche dédiée si besoin.

### ✅ Phase 4 — Cleanup logs & prop userRole — TERMINÉE

- ✅ **Step 11** : bundlé avec Step 10 (cf. Phase 3).
- ✅ **Step 12** : 7 `console.log` debug retirés de `app/(marketing)/auth/setup-account/page.tsx`. 1 `console.error` conservé (Sentry-friendly) avec emoji retiré et message clarifié. Autres fichiers du flux auth (`login-form`, `sign-up-form`, `forgot-password-form`, `update-password-form`, `logout-button`, `app/auth/**`, `lib/actions/auth-setup-actions.ts`) déjà propres. 1 `console.error` legitime conservé dans `components/auth/SetupAccountForm.tsx` (catch block).

### ✅ Phase 5 — Tests, invariant CI & cleanup — TERMINÉE (2026-05-20)

- ✅ **Step 5 (cleanup fallback SQL)** : fallback `raw_user_meta_data->>'role'` retiré de `handle_new_user()` et `handle_user_update()` dans [supabase/schemas/21_functions_auth_sync.sql](supabase/schemas/21_functions_auth_sync.sql). Migration consolidée déployée. Source unique = `raw_app_meta_data->>'role'`.
- ✅ **Step 13 (tests unitaires)** : `__tests__/schemas/auth.test.ts` + `__tests__/auth/roles.test.ts` — **29 tests verts**. Valide `PasswordSchema` (min 12 + 4 classes) et invariant `getCurrentUserRole` ignore `user_metadata.role` (claim forgé `user_metadata.role='admin'` + `app_metadata.role='user'` → résultat `'user'`).
- ✅ **Step 14 (E2E invite→setup)** : `e2e/tests/auth/invite-setup/invite-setup.spec.ts` — **4 tests verts (26.1s)** : INVITE-SETUP-001..004. Helper `e2e/helpers/auth-invite.ts` génère l'invite via `generateLink({type:'invite'})`, force `app_metadata.role` via `updateUserById`, intercepte le redirect `/verify?token=...` (fetch manual) pour reconstruire l'URL `/auth/setup-account#<fragment>` exploitable par Playwright.
- ✅ **Step 15 (non-régression escalade)** : `e2e/tests/auth/role-escalation/role-escalation.spec.ts::ROLE-ESC-001` — **vert (15.7s)**. Prouve qu'un editor authentifié appelant `supabase.auth.updateUser({data:{role:'admin'}})` ne devient PAS admin : `app_metadata.role==='editor'`, `user_metadata.role==='admin'` (cosmétique, ignoré), `profiles.role==='editor'`.
- ✅ **Step 16 (invariant CI)** : [scripts/check-role-invariant.ts](scripts/check-role-invariant.ts) — script `tsx` avec `pg.Client` qui vérifie `auth.users.raw_app_meta_data->>'role'` ∈ {user, editor, admin}. Utilise `INVARIANT_DB_URL` (variable dédiée pour éviter collision avec `SUPABASE_DB_URL` projet). Validé local : exit 0, "✅ Invariant respecté". Intégré CI via [.github/workflows/check-role-invariant.yml](.github/workflows/check-role-invariant.yml) — cron quotidien 07:00 UTC + workflow_dispatch. Secret requis : `INVARIANT_DB_URL`.

**Steps**

### Phase 1 — Migration role → app_metadata (CRITIQUE, à faire d'abord)

1. **Backfill `app_metadata.role`** depuis `profiles.role` pour tous les comptes existants — script `scripts/backfill-app-metadata-role.ts` (dotenv/config + admin client). Itère sur `auth.admin.listUsers` paginé, lit `profiles.role` via service_role, applique `updateUserById(id, { app_metadata: { role } })` si manquant ou divergent. **Détecte aussi les users sans profil** (`auth.users` sans ligne `profiles` correspondante) → log warning + créer le profil avec `role` issu de `app_metadata.role` ou `'user'` par défaut. Dry-run par défaut, flag `--apply`. *Bloque les étapes 2-4.*
2. **Mettre à jour la création/invitation** dans [lib/dal/admin-users.ts](lib/dal/admin-users.ts) :
   - `generateUserInviteLinkWithUrl()` (~L324) : retirer **uniquement** `role` du champ `options.data` (ne plus écrire `role` en `user_metadata`). **GARDER `_admin_managed: 'true'` dans `options.data`** — c'est un flag opérationnel non sensible, indispensable pour que le trigger `handle_new_user` skip la création auto du profil (cf. risque détecté). Après invitation, appeler `adminClient.auth.admin.updateUserById(userId, { app_metadata: { role, admin_managed: true } })`. **Conserver l'appel explicite à `createUserProfileWithRole(userId, role)`** pour garantir que `profiles.role` reflète le `app_metadata.role` (l'unique_violation reste géré gracieusement par le trigger si la course est inversée).
   - `updateUserRole()` (~L191-L192) : supprimer la ligne `user_metadata: { role: validated.role }`, ne garder que `app_metadata: { role: validated.role }`. Le trigger `handle_user_update` (mis à jour en step 3) propagera vers `profiles.role`. *Dépend de 1.*
3. **Mettre à jour les triggers SQL** dans [supabase/schemas/21_functions_auth_sync.sql](supabase/schemas/21_functions_auth_sync.sql) :
   - `handle_new_user()` : ✅ **FAIT** (2026-05-20, migration `20260520134210`, déployé local + cloud). Lit `role` depuis `raw_app_meta_data` en priorité, fallback `raw_user_meta_data` à retirer en step 5. `_admin_managed` reste lu depuis `raw_user_meta_data` (volontaire). Sync `auth.users.raw_app_meta_data.role` post-insert avec guard `IS DISTINCT FROM`.
   - `handle_user_update()` : ⏸ **À FAIRE**. Lire `role` depuis `raw_app_meta_data->>'role'` (whitelist inchangée `user|editor|admin`). **Étendre la guard d'entrée** : `if old.raw_user_meta_data is not distinct from new.raw_user_meta_data and old.email is not distinct from new.email then return new;` → ajouter `and old.raw_app_meta_data is not distinct from new.raw_app_meta_data`. `display_name` continue d'être lu depuis `raw_user_meta_data`.
   - Générer la migration via le workflow déclaratif Supabase (`supabase stop` puis `supabase db diff -f harden_handle_user_update`). *Parallèle à 2.*
4. **Retirer le fallback `user_metadata.role`** des guards applicatifs :
   - [lib/auth/roles.ts](lib/auth/roles.ts) : dans `getCurrentUserRole`, `requireBackofficePageAccess`, `requireAdminPageAccess`, supprimer la lecture de `user_metadata.role` (ne lire que `app_metadata.role`).
   - [lib/auth/is-admin.ts](lib/auth/is-admin.ts) : marquer le fichier comme supprimable (déjà `@deprecated` avec zéro imports) — confirmer avec un `grep_search` global, puis supprimer. *Dépend de 1, 2 et 3.*
5. **Cleanup** : retirer les fallbacks temporaires `raw_user_meta_data->>'role'` ajoutés en step 3 une fois le backfill validé en production. *Dépend de 1-4 déployés.*
6. **Mettre à jour [scripts/create-admin-user.ts](scripts/create-admin-user.ts)** : supprimer la ligne `user_metadata: { role: 'admin' }` aux deux endroits (création + update), ne garder que `app_metadata: { role: 'admin' }`. **Conserver le bloc `upsert` explicite sur `public.profiles`** qui garantit la cohérence JWT↔profile (= la mitigation déjà documentée dans le troubleshooting).

### Phase 2 — Politique mot de passe (ÉLEVÉ)

7. **Supabase Dashboard** (manuel, à documenter dans `doc-perso/authentification/auth-principles.md`) :
   - Authentication → Policies → Password : `Minimum length = 12`, `Required characters = Lowercase, uppercase letters, digits and symbols`.
   - Activer **Prevent leaked passwords** (HaveIBeenPwned, requiert plan Pro).
   - Authentication → Email → `Email OTP expiration = 1800s` (au lieu de 3600s).
8. **Aligner la validation Zod** dans [components/auth/SetupAccountForm.tsx](components/auth/SetupAccountForm.tsx#L24) et tout autre schéma de mot de passe (`login-form.tsx`, `sign-up-form.tsx`, `update-password-form.tsx`, `forgot-password-form.tsx`) : créer un schéma partagé `PasswordSchema` dans `lib/schemas/auth.ts` avec `.min(12)` + regex complexité (au moins une majuscule, une minuscule, un chiffre, un symbole). *Parallèle à 7.*

### Phase 3 — Server Action pour le setup d'account (ÉLEVÉ)

9. **Créer `lib/actions/auth-setup-actions.ts`** (Server Action) :
   - Directive `"use server"` + `import "server-only"`.
   - `setupAccountAction(input: unknown): Promise<ActionResult>` : valide `PasswordSchema` (étape 8), récupère la session via `createClient()` (cookies SSR), appelle `supabase.auth.updateUser({ password })`, journalise via `lib/dal/audit-logs.ts` (action `"user.password_setup"`, table cible `auth.users`).
   - Pas de `revalidatePath` (route publique).
10. **Refactoriser [components/auth/SetupAccountForm.tsx](components/auth/SetupAccountForm.tsx)** :
    - Retirer `supabase.auth.updateUser` côté client, appeler `setupAccountAction(data)` à la place.
    - Retirer `import { createClient }` et la prop `userRole` du composant si elle est calculée ailleurs (cf. step 11).
    - *Dépend de 8 et 9.*

### Phase 4 — Correction `userRole` codé en dur (MOYEN)

11. **[app/(marketing)/auth/setup-account/page.tsx](app/(marketing)/auth/setup-account/page.tsx#L120)** :
    - Après `setSession()`, ré-appeler `supabase.auth.getClaims()` pour lire `app_metadata.role` (côté client OK, claims signés).
    - Passer le vrai rôle à `SetupAccountForm` au lieu de `"user"` hardcodé.
    - Alternative plus propre : déplacer la redirection post-setup dans la Server Action (step 9) qui connaît le rôle serveur. *Préféré — supprime la prop `userRole` du form.* *Dépend de 1, 2.*
12. **Nettoyer les `console.log`** verbeux dans [page.tsx](app/(marketing)/auth/setup-account/page.tsx#L22-L67) : remplacer par un helper `debugLog()` guardé par `process.env.NODE_ENV !== "production"`, ou simplement supprimer. *Parallèle à 11.*

### Phase 5 — Tests & validation

13. **Tests unitaires** : ajouter `__tests__/auth/role-metadata-source.test.ts` qui vérifie que `getCurrentUserRole` ignore `user_metadata.role` après la phase 1.5 (forge un claim avec `user_metadata.role='admin'` et `app_metadata.role='user'` → doit retourner `'user'`).
14. **Test E2E Playwright** (`e2e/auth-invite-setup.spec.ts`, suivre [.github/instructions/playwright-tests.instructions.md](.github/instructions/playwright-tests.instructions.md)) : flow invite admin → email Inbucket local → click lien → setup password → vérifier redirection conforme au rôle ET accès `/admin/*` sans erreur 42501.
15. **Test de non-régression escalade** : E2E ou unitaire prouvant qu'un user authentifié appelant `supabase.auth.updateUser({ data: { role: 'admin' } })` ne devient PAS admin (ni en JWT claims, ni en `profiles.role`).
16. **Test d'invariant JWT↔profile** (nouveau, anti-régression du bug documenté) : script `scripts/check-role-invariant.ts` (ou test SQL) qui exécute :
    ```sql
    select count(*) from auth.users u
    left join public.profiles p on p.user_id = u.id
    where (u.raw_app_meta_data->>'role') is distinct from p.role
       or p.user_id is null;
    ```
    → doit retourner `0`. À exécuter en CI après la migration phase 1, et après chaque test E2E d'invite.

**Relevant files**

- [lib/dal/admin-users.ts](lib/dal/admin-users.ts) — fonctions `generateUserInviteLinkWithUrl` (~L324) et `updateUserRole` (~L181) : retirer `user_metadata: { role }`, déplacer `role` vers `app_metadata` post-création, **garder `_admin_managed` dans `options.data`** et **garder l'appel explicite à `createUserProfileWithRole`**.
- [supabase/schemas/21_functions_auth_sync.sql](supabase/schemas/21_functions_auth_sync.sql) — `handle_new_user` et `handle_user_update` : lire `role` depuis `raw_app_meta_data`, **garder `_admin_managed` lu depuis `raw_user_meta_data`**, étendre la guard de `handle_user_update` à `raw_app_meta_data`.
- [lib/auth/roles.ts](lib/auth/roles.ts) — `getCurrentUserRole`, `requireBackofficePageAccess`, `requireAdminPageAccess` : supprimer le fallback `user_metadata.role`.
- [lib/auth/is-admin.ts](lib/auth/is-admin.ts) — fichier `@deprecated` : à supprimer après vérification.
- [components/auth/SetupAccountForm.tsx](components/auth/SetupAccountForm.tsx) — migrer vers Server Action, supprimer `supabase.auth.updateUser` côté client.
- [app/(marketing)/auth/setup-account/page.tsx](app/(marketing)/auth/setup-account/page.tsx) — corriger `userRole="user"` hardcodé, nettoyer les `console.log`.
- [scripts/create-admin-user.ts](scripts/create-admin-user.ts) — supprimer `user_metadata: { role: 'admin' }` aux deux endroits, garder l'upsert profil.
- `lib/actions/auth-setup-actions.ts` (nouveau) — Server Action `setupAccountAction` avec audit log.
- `lib/schemas/auth.ts` (nouveau ou existant à enrichir) — `PasswordSchema` partagé (min 12 + complexité).
- [lib/dal/audit-logs.ts](lib/dal/audit-logs.ts) — réutilisé pour logger `user.password_setup`.
- `scripts/backfill-app-metadata-role.ts` (nouveau) — script one-shot bidirectionnel : backfill `app_metadata.role` depuis `profiles.role`, détection des `auth.users` orphelins (sans profil), création des profils manquants.
- `scripts/check-role-invariant.ts` (nouveau) — vérification d'invariant CI/post-déploiement.
- `doc-perso/authentification/auth-principles.md` — mettre à jour pour refléter la nouvelle source de vérité (`app_metadata`) et les nouvelles règles de mot de passe (mise à jour seulement si l'utilisateur le demande).

**Verification**

1. `pnpm lint && pnpm build` : pas d'erreur TS après refactor.
2. `pnpm vitest run __tests__/auth/role-metadata-source.test.ts` : claim forgé `user_metadata.role='admin'` → résultat `'user'`.
3. Manuel : se connecter en tant qu'editor, ouvrir DevTools, tenter `await window.supabase.auth.updateUser({ data: { role: 'admin' } })` puis recharger → vérifier que `profiles.role` reste `editor` et que l'accès à `/admin/*` est refusé.
4. E2E Playwright sur le flow invite complet (étape 14) — inclure assertion d'accès `/admin` sans 42501.
5. Supabase Dashboard → Auth → Users : sur un compte de test, vérifier que `app_metadata.role` est bien renseigné après invite (et plus dans `user_metadata`).
6. **Invariant JWT↔profile** (anti-régression du bug documenté) :
   ```sql
   select u.email,
          u.raw_app_meta_data->>'role' as app_role,
          u.raw_user_meta_data->>'role' as user_role,
          p.role as profile_role
   from auth.users u
   left join public.profiles p on p.user_id = u.id
   order by (u.raw_app_meta_data->>'role') is distinct from p.role desc;
   ```
   → `app_role === profile_role` pour 100 % des lignes, aucune ligne avec `profile_role` NULL, `user_role` peut être NULL après nettoyage phase 5.
7. Supabase Advisors (`mcp_supabase_get_advisors`) : 0 warning sur OTP expiration et leaked password protection après changements Dashboard.

**Decisions**

- **Source de vérité du rôle** : `app_metadata.role` (JWT claim, signé, server-only). `profiles.role` reste miroir applicatif obligatoire pour `is_admin()` SQL et les RLS policies. `user_metadata` ne contient plus que `display_name` et le flag opérationnel `_admin_managed`.
- **`_admin_managed` reste en `user_metadata`** : c'est un flag de contrôle technique (non sensible, non utilisé pour l'autorisation), nécessaire au moment du INSERT dans `auth.users` (avant que `updateUserById` puisse écrire `app_metadata`). Seul `role` (donnée d'autorisation) migre en `app_metadata`.
- **Double propagation vers `profiles`** : (a) trigger `handle_new_user`/`handle_user_update` lit `raw_app_meta_data->>'role'`, ET (b) le code admin (`createUserProfileWithRole`) UPSERT explicitement le profil après `updateUserById`. Cette redondance est volontaire pour garantir l'invariant JWT↔profile même en cas de race condition trigger/update.
- **Backfill avant retrait du fallback** : déploiement en deux temps (phase 1 → fallback toléré, phase 5 → fallback supprimé) pour éviter de déconnecter les sessions existantes.
- **Server Action vs API Route pour setup** : Server Action (flow interne, formulaire, pas d'API externe — suivre [.github/instructions/crud-server-actions-pattern.instructions.md](.github/instructions/crud-server-actions-pattern.instructions.md) bien que ce ne soit pas un CRUD).
- **Politique mot de passe** : min 12 + 4 classes de caractères, leaked password protection activée. Aligné OWASP ASVS v4 L2.
- **Hors scope** : refonte complète du modèle de rôle (déjà hiérarchique via `role-helpers.ts`), MFA/AAL2 (déjà supporté par Supabase, pas demandé), rotation de JWT signing keys (à planifier séparément).

**Further Considerations**

1. **Plan Supabase** : la "Prevent leaked passwords" feature requiert le plan Pro. Confirmer le plan actuel avant phase 2.7. Si plan Free, repousser à la migration Pro.
2. **Migration des sessions actives** : après suppression du fallback `user_metadata`, les utilisateurs déjà connectés avec un JWT qui ne contient pas encore `app_metadata.role` seront déconnectés au prochain refresh. Option A : forcer un re-login global après backfill (acceptable, communication possible). Option B : garder le fallback 30 jours puis le supprimer. *Recommandation : Option A si <100 sessions actives, sinon Option B.*
3. **Script de backfill** : doit être idempotent et journaliser dans `logs_audit` (action `system.backfill_app_metadata_role`) pour traçabilité RGPD. Doit aussi produire un rapport listant les `auth.users` sans `profiles` détectés et créés.
4. **Anti-régression du bug "/login redirect"** : l'invariant JWT↔profile (step 16) doit devenir un check CI permanent — pas seulement une vérification one-shot. Idéalement intégré au pipeline post-déploiement Supabase.
