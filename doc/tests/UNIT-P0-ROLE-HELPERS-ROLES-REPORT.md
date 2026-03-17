# Rapport — Tests Unitaires Phase 1 : ROLE-UNIT-001 à 042

> **Date** : 2026-03-16
> **Task** : TASK078 — Implémentation tests permissions et rôles
> **Statut** : ✅ 42/42 tests passent

---

## Résumé

Suite de tests unitaires Vitest couvrant les 42 cas P0/P1/P2 de la section 2 de `specs/tests-permissions-et-rôles.md`. Les tests valident le modèle de permissions hiérarchique `user(0) < editor(1) < admin(2)` au niveau des fonctions pures et des guards server.

**Résultat** : **42/42 tests passent** (100 %) en < 600 ms (transform + exécution).

---

## Résultats par section

### 2.1 — `normalizeRole()` — `role-helpers.ts`

| ID             | Scénario                       | Input        | Attendu   | Résultat |
| -------------- | ------------------------------ | ------------ | --------- | -------- |
| ROLE-UNIT-001  | Rôle valide "admin"            | `"admin"`    | `"admin"` | ✅       |
| ROLE-UNIT-002  | Rôle valide "editor"           | `"editor"`   | `"editor"`| ✅       |
| ROLE-UNIT-003  | Rôle valide "user"             | `"user"`     | `"user"`  | ✅       |
| ROLE-UNIT-004  | Rôle en majuscules             | `"ADMIN"`    | `"admin"` | ✅       |
| ROLE-UNIT-005  | Rôle en casse mixte            | `"Editor"`   | `"editor"`| ✅       |
| ROLE-UNIT-006  | Rôle inconnu → fallback        | `"superadmin"`| `"user"` | ✅       |
| ROLE-UNIT-007  | Chaîne vide → fallback         | `""`         | `"user"`  | ✅       |
| ROLE-UNIT-008  | `null` → fallback              | `null`       | `"user"`  | ✅       |
| ROLE-UNIT-009  | `undefined` → fallback         | `undefined`  | `"user"`  | ✅       |
| ROLE-UNIT-010  | Nombre → fallback              | `42`         | `"user"`  | ✅       |
| ROLE-UNIT-011  | Objet → fallback               | `{}`         | `"user"`  | ✅       |

> **11/11 ✅**

---

### 2.2 — `isRoleAtLeast()` — `role-helpers.ts`

| ID             | Scénario             | `userRole`  | `requiredRole` | Attendu | Résultat |
| -------------- | -------------------- | ----------- | -------------- | ------- | -------- |
| ROLE-UNIT-012  | admin >= admin       | `"admin"`   | `"admin"`      | `true`  | ✅       |
| ROLE-UNIT-013  | admin >= editor      | `"admin"`   | `"editor"`     | `true`  | ✅       |
| ROLE-UNIT-014  | admin >= user        | `"admin"`   | `"user"`       | `true`  | ✅       |
| ROLE-UNIT-015  | editor >= editor     | `"editor"`  | `"editor"`     | `true`  | ✅       |
| ROLE-UNIT-016  | editor >= user       | `"editor"`  | `"user"`       | `true`  | ✅       |
| ROLE-UNIT-017  | editor < admin       | `"editor"`  | `"admin"`      | `false` | ✅       |
| ROLE-UNIT-018  | user >= user         | `"user"`    | `"user"`       | `true`  | ✅       |
| ROLE-UNIT-019  | user < editor        | `"user"`    | `"editor"`     | `false` | ✅       |
| ROLE-UNIT-020  | user < admin         | `"user"`    | `"admin"`      | `false` | ✅       |

> **9/9 ✅**

---

### 2.3 — `ROLE_HIERARCHY` — `role-helpers.ts`

| ID             | Scénario                        | Attendu                             | Résultat |
| -------------- | ------------------------------- | ----------------------------------- | -------- |
| ROLE-UNIT-021  | user = 0                        | `ROLE_HIERARCHY["user"] === 0`      | ✅       |
| ROLE-UNIT-022  | editor = 1                      | `ROLE_HIERARCHY["editor"] === 1`    | ✅       |
| ROLE-UNIT-023  | admin = 2                       | `ROLE_HIERARCHY["admin"] === 2`     | ✅       |
| ROLE-UNIT-024  | Ordre strict user < editor < admin | `0 < 1 < 2`                      | ✅       |

> **4/4 ✅**

---

### 2.4 — `getCurrentUserRole()` — `roles.ts`

| ID             | Scénario                           | Préconditions JWT                                | Attendu    | Résultat |
| -------------- | ---------------------------------- | ------------------------------------------------ | ---------- | -------- |
| ROLE-UNIT-025  | Rôle depuis `app_metadata`         | `app_metadata.role = "editor"`                   | `"editor"` | ✅       |
| ROLE-UNIT-026  | Rôle admin depuis `app_metadata`   | `app_metadata.role = "admin"`                    | `"admin"`  | ✅       |
| ROLE-UNIT-027  | Fallback `user_metadata`           | `app_metadata` vide, `user_metadata.role = "editor"` | `"editor"` | ✅   |
| ROLE-UNIT-028  | Aucun rôle défini → fallback       | JWT sans `role` dans les metadata               | `"user"`   | ✅       |
| ROLE-UNIT-029  | Erreur `getClaims()` → pas de crash | `getClaims()` rejette                           | `"user"`   | ✅       |

> **5/5 ✅**

---

### 2.5 — `requireMinRole()` — `roles.ts`

| ID             | Scénario               | Rôle courant | Rôle requis | Attendu              | Résultat |
| -------------- | ---------------------- | ------------ | ----------- | -------------------- | -------- |
| ROLE-UNIT-030  | Admin passe admin      | `admin`      | `admin`     | Résout `undefined`   | ✅       |
| ROLE-UNIT-031  | Editor passe editor    | `editor`     | `editor`    | Résout `undefined`   | ✅       |
| ROLE-UNIT-032  | Editor échoue admin    | `editor`     | `admin`     | Throw `Unauthorized` | ✅       |
| ROLE-UNIT-033  | User échoue editor     | `user`       | `editor`    | Throw `Unauthorized` | ✅       |

> **4/4 ✅**

---

### 2.6 — Wrappers `requireBackofficeAccess()` et `requireAdminOnly()` — `roles.ts`

| ID             | Scénario                        | Rôle courant | Fonction                    | Attendu              | Résultat |
| -------------- | ------------------------------- | ------------ | --------------------------- | -------------------- | -------- |
| ROLE-UNIT-034  | Editor a accès backoffice       | `editor`     | `requireBackofficeAccess()` | Résout `undefined`   | ✅       |
| ROLE-UNIT-035  | User n'a pas accès backoffice   | `user`       | `requireBackofficeAccess()` | Throw `Unauthorized` | ✅       |
| ROLE-UNIT-036  | Admin a accès admin-only        | `admin`      | `requireAdminOnly()`        | Résout `undefined`   | ✅       |
| ROLE-UNIT-037  | Editor n'a pas accès admin-only | `editor`     | `requireAdminOnly()`        | Throw `Unauthorized` | ✅       |

> **4/4 ✅**

---

### 2.7 — `requireBackofficePageAccess()` et `requireAdminPageAccess()` — `roles.ts`

| ID             | Scénario                         | Rôle courant | Fonction                          | Attendu                           | Résultat |
| -------------- | -------------------------------- | ------------ | --------------------------------- | --------------------------------- | -------- |
| ROLE-UNIT-038  | Editor passe page backoffice     | `editor`     | `requireBackofficePageAccess()`   | Résout `undefined`                | ✅       |
| ROLE-UNIT-039  | User → redirect page backoffice  | `user`       | `requireBackofficePageAccess()`   | `redirect("/auth/login")` appelé  | ✅       |
| ROLE-UNIT-040  | Pas de session → redirect login  | (aucun)      | `requireBackofficePageAccess()`   | `redirect("/auth/login")` appelé  | ✅       |
| ROLE-UNIT-041  | Admin passe page admin           | `admin`      | `requireAdminPageAccess()`        | Résout `undefined`                | ✅       |
| ROLE-UNIT-042  | Editor → redirect page admin     | `editor`     | `requireAdminPageAccess()`        | `redirect("/auth/login")` appelé  | ✅       |

> **5/5 ✅**

---

## Infrastructure mise en place

| Fichier                                    | Rôle                                                      |
| ------------------------------------------ | --------------------------------------------------------- |
| `vitest.config.ts`                         | Configuration Vitest — alias `@/`, env `node`             |
| `__tests__/auth/role-helpers.test.ts`      | 24 cas : `normalizeRole`, `isRoleAtLeast`, `ROLE_HIERARCHY` |
| `__tests__/auth/roles.test.ts`             | 18 cas : guards server `getCurrentUserRole` → `requireAdminPageAccess` |

### Stratégie de mocking (`roles.test.ts`)

- **`server-only`** → mock vide (évite le crash hors contexte Next.js)
- **`next/navigation.redirect`** → mock qui throw `NEXT_REDIRECT:<url>` (reproduit le comportement Next.js — `redirect()` interrompt le flux en levant une exception interne)
- **`@/supabase/server.createClient`** → mock retournant `{ auth: { getClaims: mockGetClaims } }` ; chaque test configure `mockGetClaims` via des helpers (`claimsWithAppRole`, `claimsWithUserMetaOnly`, `claimsEmpty`, `claimsError`)

### Commande d'exécution

```bash
npx vitest run __tests__/auth/
```

---

## Observations

1. **`normalizeRole` robustesse** : La fonction gère correctement tous les types non-string (null, undefined, number, object) grâce au garde `typeof raw !== "string"`.
2. **Priorité `app_metadata`** : `getCurrentUserRole()` lit `app_metadata` en priorité (source sécurisée, non modifiable par l'utilisateur) avant `user_metadata`. Confirmé par ROLE-UNIT-025/026 vs ROLE-UNIT-027.
3. **Résilience aux erreurs réseau** : ROLE-UNIT-029 confirme que `getClaims()` qui rejette retourne `"user"` (fallback sûr) sans propager l'exception. Le message d'erreur est logué via `console.error` (visible dans stderr des tests, comportement attendu).
4. **Pattern `redirect` testable** : Le mock de `next/navigation.redirect` permet de tester les fonctions page-access sans dépendance au runtime Next.js.

---

## Prochaines étapes (TASK078)

| Phase | Description                           | Cas    | Fichier cible                                  |
| ----- | ------------------------------------- | ------ | ---------------------------------------------- |
| 2     | Tests DAL intégration Supabase local  | 80 cas | `__tests__/dal/permissions-integration.test.ts` |
| 3     | Tests RLS SQL via clients Supabase    | 92 cas | `scripts/test-permissions-rls.ts`               |
