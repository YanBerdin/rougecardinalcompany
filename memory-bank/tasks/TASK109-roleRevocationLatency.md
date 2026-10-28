# TASK109 - Gestion des rôles : garde-fou du dernier admin et fenêtre de révocation JWT

**Statut:** Planifiée

**Ajoutée:** 2026-10-15

**Mise à jour:** 2026-10-16

## Demande originale

Documenter le problème détecté (un retrait de rôle ne prend effet qu'à
l'expiration du JWT) et les corrections à implémenter. Le 2026-10-16, le
périmètre a été réduit au contexte réel du site : un seul admin (le
propriétaire) et peu ou pas d'éditeurs. Le système de rôles doit malgré tout
rester opérationnel et sécurisé.

## Contexte d'usage

- Le propriétaire est le seul admin et n'a pas prévu d'en créer d'autres.
- Le rôle `editor` existe (TASK076) mais n'aura probablement pas d'usage. Il
  doit rester fonctionnel et sûr.
- Le rôle `user` n'a aucun accès au backoffice (middleware + layout admin
  exigent `editor`) ; il ne lit que le contenu public. Il n'existe pas de rôle
  « lecture seule du backoffice » (option écartée le 2026-10-18). `AppRole` vaut
  `"user" | "editor" | "admin"` (`lib/auth/role-helpers.ts`), comme le schéma
  Zod et `has_min_role()`.
- Le garde-fou s'applique à tous les rôles : un admin ne peut pas se mettre
  lui-même en `user` ni en `editor`.

## Constat technique (vérifié le 2026-10-16)

Le rôle est stocké dans `auth.users.app_metadata.role` (source de vérité) et
recopié dans `public.profiles.role`. Il est embarqué dans le JWT au moment de
son émission.

1. `updateUserRole()` et `deleteUser()` (`lib/dal/admin-users.ts`) ne
   révoquent aucune session. Un rôle retiré reste actif jusqu'à l'expiration du
   JWT (3600 s par défaut, valeur Cloud à confirmer), et le refresh token reste
   valide.
2. `getCurrentUserRole()` (`lib/auth/roles.ts`) et le middleware
   (`supabase/middleware.ts`) n'appellent `getUser()` que si le claim vaut
   `user`. Conséquences :
   - une rétrogradation (`admin → editor/user`, `editor → user`) n'est jamais
     revérifiée avant l'expiration du JWT ;
   - une promotion `user → editor/admin` est vue immédiatement ;
   - une promotion `editor → admin` n'est **pas** immédiate : le claim
     `editor` ne déclenche pas `getUser()`.
3. **Aucun garde-fou de verrouillage.** Rien n'empêche l'admin de se
   rétrograder ou de se supprimer depuis `/admin/users`, ni de retirer le
   dernier admin. Avec un seul admin, une seule erreur de manipulation bloque
   tout le backoffice. Il faut alors une réparation manuelle via le dashboard
   Supabase ou SQL.
4. `auth.admin.signOut()` n'est pas utilisable pour révoquer un autre
   utilisateur : dans auth-js 2.74.0, la signature est
   `signOut(jwt: string, scope?)`.

## Analyse de pertinence

| Risque | Probabilité (contexte réel) | Gravité | Décision |
| --- | --- | --- | --- |
| Admin unique qui se rétrograde ou se supprime par erreur | Faible mais plausible (un clic) | **Blocage total du backoffice** | **Corriger (Phase 1)** |
| Un admin en rétrograde un autre, accès résiduel | Quasi nulle (un seul admin) | Élevée | Accepter, documenter |
| Éditeur rétrogradé ou supprimé, accès éditorial résiduel | Faible (pas d'éditeur prévu) | Modérée, bornée par `jwt_expiry` | Accepter, documenter. Révocation de sessions différée (Phase 3) |
| Promotion `editor → admin` non immédiate | Faible | Faible (confort) | Accepter, l'utilisateur se reconnecte |
| Compte admin compromis | Faible | Élevée | Hors périmètre : la révocation de rôle ne s'applique pas à l'admin unique. Voir les risques résiduels |

## Décisions

1. **D1 — Garde-fou applicatif obligatoire.** Les opérations suivantes sont
   refusées côté DAL :
   - modifier son propre rôle (auto-rétrogradation) ;
   - supprimer son propre compte depuis le backoffice ;
   - rétrograder ou supprimer un admin quand il est le dernier admin.
2. **D2 — Fenêtre résiduelle JWT acceptée.** Le retrait d'un rôle prend effet
   au plus tard à l'expiration du JWT. Pas de `getUser()` systématique, pas de
   modification de `is_admin()` / `has_min_role()`, `jwt_expiry` inchangé.
3. **D3 — Révocation de sessions différée.** La RPC
   `revoke_user_sessions` n'est implémentée que si des éditeurs ou d'autres
   admins sont effectivement créés.
4. **D4 — Procédure de récupération documentée.** En cas de verrouillage
   malgré le garde-fou (par exemple via le dashboard Supabase), on suit la
   procédure de `memory-bank/procedures/admin-user-registration.md`.

## Plan d'implémentation

### Phase 1 — Garde-fou du dernier admin (priorité haute)

#### 1.1 Fonction de décision pure

Ajouter dans `lib/auth/role-helpers.ts` (fichier sans dépendance serveur,
déjà testé) une fonction pure, testable sans mock :

```typescript
export type RoleChangeDenial =
  | "ERR_ROLE_SELF_CHANGE"
  | "ERR_ROLE_SELF_DELETE"
  | "ERR_ROLE_LAST_ADMIN";

export interface RoleChangeContext {
  actorId: string;
  targetId: string;
  targetCurrentRole: AppRole;
  nextRole: AppRole | null; // null = suppression du compte
  adminCount: number;
}

export function evaluateRoleChange(ctx: RoleChangeContext): RoleChangeDenial | null;
```

Règles, dans cet ordre :

1. `actorId === targetId` et `nextRole === null` → `ERR_ROLE_SELF_DELETE`.
2. `actorId === targetId` et `nextRole !== targetCurrentRole` →
   `ERR_ROLE_SELF_CHANGE`.
3. `targetCurrentRole === "admin"`, `nextRole !== "admin"` et
   `adminCount <= 1` → `ERR_ROLE_LAST_ADMIN`.
4. Sinon → `null` (autorisé).

Constante `MIN_ADMIN_COUNT = 1` plutôt qu'un nombre magique.

#### 1.2 Lecture du contexte côté DAL

Créer `lib/dal/admin-users-guards.ts`, car `admin-users.ts` fait déjà 572
lignes, au-delà de la limite de 300 :

- `"use server"` + `import "server-only"`.
- `fetchRoleChangeContext(targetId, nextRole): Promise<DALResult<RoleChangeContext>>` :
  - `actorId` lu via `getClaims()` (`sub`). On réutilise ou déplace
    `getCurrentAdminIdFromClaims()` de `admin-users.ts` ;
  - `targetCurrentRole` lu via `adminClient.auth.admin.getUserById(targetId)`
    → `app_metadata.role`, normalisé par `normalizeRole()` (source de vérité,
    pas `profiles`) ;
  - `adminCount` calculé avec
    `select count(*) from profiles where role = 'admin'` (head + count exact).
    Ce comptage est fiable grâce à l'invariant `profiles.role` ↔
    `app_metadata.role` vérifié par `check-role-invariant.yml`.
- Si une lecture échoue, l'opération est refusée (fail closed) avec
  `ERR_ROLE_CONTEXT_UNAVAILABLE`.

#### 1.3 Branchement dans le DAL

Dans `lib/dal/admin-users.ts` :

- `updateUserRole()` : après `requireAdminOnly()` et la validation Zod, appeler
  `fetchRoleChangeContext(validated.userId, validated.role)` puis
  `evaluateRoleChange()`. Si un refus est retourné, renvoyer `dalError()` avec un
  message en français et logger le code en anglais, **avant** tout appel à
  `updateUserById`.
- `deleteUser()` : même contrôle avec `nextRole = null`, après la validation
  UUID et **avant** la suppression du profil.

Messages utilisateur (FR) :

| Code | Message |
| --- | --- |
| `ERR_ROLE_SELF_CHANGE` | « Vous ne pouvez pas modifier votre propre rôle. » |
| `ERR_ROLE_SELF_DELETE` | « Vous ne pouvez pas supprimer votre propre compte depuis le backoffice. » |
| `ERR_ROLE_LAST_ADMIN` | « Impossible : ce compte est le dernier administrateur. » |
| `ERR_ROLE_CONTEXT_UNAVAILABLE` | « Vérification impossible, opération annulée. Réessayez. » |

Les Server Actions (`app/(admin)/admin/users/actions.ts`) relaient déjà
`result.error`. Aucune modification n'y est nécessaire.

#### 1.4 UI (défense en profondeur, confort)

Dans `components/features/admin/users/UsersManagementView.tsx`, pour la ligne de
l'utilisateur connecté :

- désactiver le sélecteur de rôle et le bouton de suppression ;
- ajouter un texte visible « (vous) » et un `aria-describedby` qui explique
  pourquoi l'action est indisponible (WCAG : l'état ne doit pas être signalé
  par la seule couleur).

L'identifiant courant est passé par le Container serveur (`getClaims().sub`),
sans fetch client. Ce contrôle UI ne remplace pas le contrôle DAL.

### Phase 2 — Documentation (priorité haute)

- Consigner D1 à D4 et les risques résiduels dans
  `memory-bank/acl-permissions-role.md` (fait le 2026-10-16).
- Vérifier que `memory-bank/procedures/admin-user-registration.md` décrit la
  restauration d'un admin (`app_metadata.role` via le dashboard ou
  `updateUserById`, puis `profiles.role`). Compléter si nécessaire.
- Mettre à jour la section Role-Based Auth Guard de `systemPatterns.md`
  (garde-fou du dernier admin).

### Phase 3 — Révocation de sessions (différée, D3)

À déclencher uniquement si un éditeur ou un second admin est créé :

- fonction `public.revoke_user_sessions(target_user_id uuid)`,
  `SECURITY DEFINER` avec header de rationale, `set search_path = ''`,
  suppression des lignes `auth.sessions` de l'utilisateur ;
  `REVOKE ALL` à `public`, `anon`, `authenticated` ; `GRANT EXECUTE` à
  `service_role` uniquement ;
- schéma déclaratif + migration, audit des GRANTs ;
- appel dans `updateUserRole()` en cas de rétrogradation et dans
  `deleteUser()`, avec échec remonté en `DALResult` d'erreur.

Hors périmètre définitif (sauf changement de contexte) : `getUser()`
systématique dans les gardes, modification de `is_admin()` / `has_min_role()`,
réduction de `jwt_expiry`.

## Fichiers concernés

- `lib/auth/role-helpers.ts` — `evaluateRoleChange()`, types de refus.
- `lib/dal/admin-users-guards.ts` — nouveau, `fetchRoleChangeContext()`.
- `lib/dal/admin-users.ts` — branchement dans `updateUserRole()` et
  `deleteUser()`.
- `components/features/admin/users/UsersManagementView.tsx` (+ Container) —
  désactivation des actions sur soi-même.
- `__tests__/auth/role-helpers.test.ts` — tests de la fonction pure.
- `memory-bank/acl-permissions-role.md`, `systemPatterns.md`,
  `procedures/admin-user-registration.md` — documentation.

## Checklist de validation

### Garde-fou (Phase 1)

- [ ] `evaluateRoleChange()` est couverte par des tests unitaires : auto-suppression,
      auto-rétrogradation, auto-« changement » vers le même rôle (autorisé),
      dernier admin rétrogradé, dernier admin supprimé, admin rétrogradé avec
      `adminCount = 2` (autorisé), éditeur rétrogradé (autorisé),
      promotion `user → editor` (autorisée).
- [ ] `updateUserRole()` refuse l'auto-rétrogradation sans appeler
      `updateUserById` (aucune modification de `app_metadata` ni de `profiles`).
- [ ] `deleteUser()` refuse l'auto-suppression et la suppression du dernier
      admin **avant** la suppression du profil.
- [ ] Une erreur de lecture du contexte (`getUserById` ou comptage) bloque
      l'opération (fail closed).
- [ ] Le message affiché dans le toast est en français et le log serveur
      contient le code `ERR_ROLE_*`.
- [ ] UI : sur sa propre ligne, le sélecteur de rôle et le bouton de suppression
      sont désactivés, avec « (vous) » visible et l'explication accessible au
      clavier et au lecteur d'écran.
- [ ] Non-régression : inviter un utilisateur, le promouvoir `editor`, le
      rétrograder `user`, puis le supprimer fonctionne toujours.

### Documentation (Phase 2)

- [ ] `acl-permissions-role.md` contient les décisions D1 à D4 et les
      risques résiduels.
- [ ] La procédure de restauration d'un admin a été relue et testée en local.
- [ ] `systemPatterns.md` est à jour.

### Qualité

- [ ] `pnpm tsc --noEmit` sans erreur.
- [ ] `pnpm lint` sans erreur.
- [ ] `pnpm vitest run __tests__/auth/role-helpers.test.ts` vert.
- [ ] Parcours manuel en local : depuis le compte admin unique, tenter de se
      rétrograder et de se supprimer → refus dans les deux cas.

## Risques résiduels acceptés

- **Fenêtre JWT** : un éditeur ou un admin rétrogradé ou supprimé garde son accès
  jusqu'à l'expiration du JWT, y compris via PostgREST direct (RLS lit le
  claim). Au plus `jwt_expiry` (3600 s par défaut).
- **Promotion `editor → admin`** visible seulement après refresh du JWT ou une
  reconnexion.
- **Concurrence** : deux admins qui se rétrogradent mutuellement au même
  instant pourraient tous deux passer le contrôle du dernier admin
  (lecture puis écriture non atomique). Ce risque est inexistant avec un seul
  admin et n'est pas traité par un verrou SQL.
- **Contournement hors application** : le garde-fou ne protège pas contre une
  modification via le dashboard Supabase, la clé `service_role` ou SQL direct.
  La procédure de récupération (D4) couvre ce cas.
- **Compte admin compromis** : changer le mot de passe ne révoque pas le JWT
  en cours. La réponse à incident passe par le dashboard Supabase
  (déconnexion des sessions de l'utilisateur, rotation des clés si nécessaire).

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | `evaluateRoleChange()` + tests unitaires | Not Started | 2026-10-16 | Fonction pure dans `role-helpers.ts` |
| 1.2 | `fetchRoleChangeContext()` (fail closed) | Not Started | 2026-10-16 | Nouveau fichier `admin-users-guards.ts` |
| 1.3 | Branchement dans `updateUserRole()` / `deleteUser()` | Not Started | 2026-10-16 | Avant toute écriture |
| 1.4 | UI : actions désactivées sur soi-même | Not Started | 2026-10-16 | Accessibilité incluse |
| 2.1 | Décisions et risques dans `acl-permissions-role.md` | Complete | 2026-10-16 | |
| 2.2 | Procédure de restauration admin relue et testée | Not Started | 2026-10-16 | `procedures/admin-user-registration.md` |
| 2.3 | `systemPatterns.md` à jour | Not Started | 2026-10-16 | |
| 3.1 | RPC `revoke_user_sessions` | Deferred | 2026-10-16 | Seulement si éditeurs ou second admin |

## Progress Log

### 2026-10-15

- TASK109 créée à la suite de l'analyse du comportement d'un retrait de rôle
  admin : effet différé jusqu'à l'expiration du JWT sur le middleware, les
  pages, les Server Actions et le RLS.
- La piste `auth.admin.signOut(userId, "global")` est écartée après
  vérification de la signature (`signOut(jwt, scope)` dans auth-js 2.74.0).

### 2026-10-16

- Revue de pertinence : site à admin unique, rôles `editor` et `user` sans
  usage prévu.

### 2026-10-18

- Libellés de `InviteUserForm.tsx` corrigés : `user` = aucun accès au
  backoffice, `editor` = gestion du contenu éditorial (l'ancien libellé
  « lecture seule, permissions à venir » datait d'avant TASK076).
- Précision ajoutée dans `acl-permissions-role.md`, `systemPatterns.md`,
  `README.md` et `Project_Architecture_Blueprint.md`.

### 2026-10-28

- Type de clés confirmé : asymétriques **ES256**. `getClaims()` vérifie le
  JWT localement (JWKS), sans appel réseau. `jwt_expiry` non surchargé dans
  `supabase/config.toml` (valeur par défaut).
- Correction du constat : la promotion `editor → admin` n'est pas immédiate,
  et le problème concerne aussi les éditeurs, pas seulement les admins.
- Absence de garde-fou contre l'auto-rétrogradation ou la suppression du
  dernier admin identifiée comme le seul risque à forte gravité dans ce
  contexte.
- Périmètre réduit : garde-fou du dernier admin (Phase 1) + documentation
  (Phase 2). Révocation de sessions différée (Phase 3). Revérification
  systématique, modification RLS et `jwt_expiry` abandonnées.
- Décisions et risques consignés dans `memory-bank/acl-permissions-role.md`.
