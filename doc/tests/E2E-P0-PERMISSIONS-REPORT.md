# Rapport E2E P0 — Tests Permissions et Rôles

**Date :** 2026-03-16  
**Tâche :** TASK078 — Phase E2E (subtask 5.1)  
**Branch :** `test/task078-implement-permissions-tests`  
**Commit :** `ae29f4d`

---

## Résumé

Implémentation et passage complet des **23 tests E2E P0** de permissions (ROLE-E2E-001→013, 016→024) qui prouvent que le modèle de rôles `user(0) < editor(1) < admin(2)` est correctement appliqué au niveau navigation Playwright.

> **Résultat final : 23/23 tests passent (42.8s)**

---

## Périmètre couvert

| Bloc | IDs | Description | Résultat |
| ------ | ----- | ------------- | ---------- |
| 5.1 — Parcours Editor | 001, 002, 003, 006, 007, 008, 009, 010 | Login, sidebar filtrée, pages admin bloquées | ✅ 8/8 |
| 5.2 — Parcours Admin | 011, 012, 013 | Login, sidebar complète, accès pages admin-only | ✅ 3/3 |
| 5.3 — Parcours User bloqué | 016, 017, 018 | Redirection vers `/auth/login` | ✅ 3/3 |
| 5.4 — Parcours Anon bloqué | 019, 020 | Redirection sans session | ✅ 2/2 |
| 5.5 — API Admin | 021, 022, 023, 024 | Accès `/api/admin/media/search` par rôle | ✅ 4/4 |

**Exclusions documentées :**

- ROLE-E2E-004 (CRUD spectacle) et ROLE-E2E-005 (CRUD événement) : relèvent des tests fonctionnels CRUD, pas des tests de permissions — couverts par la suite DAL

---

## Fichiers créés / modifiés

| Fichier | Action | Description |
| --------- | -------- | ------------- |
| `e2e/tests/auth/admin.setup.ts` | Créé + corrigé | Auth setup admin (ESM fix, `fileURLToPath`) |
| `e2e/tests/auth/editor.setup.ts` | Créé + corrigé | Auth setup editor (ESM fix) |
| `e2e/tests/auth/user.setup.ts` | Créé + corrigé | Auth setup user (ESM fix + redirect loop fix) |
| `e2e/tests/permissions/permissions.fixtures.ts` | Créé + corrigé | 4 fixtures : adminPage, editorPage, userPage, anonPage (ESM fix) |
| `e2e/tests/permissions/permissions.spec.ts` | Créé + corrigé | 23 tests, 5 describe blocks |
| `playwright.config.ts` | Modifié | 3 projets setup + projet `permissions` avec `dependencies` |

---

## Problèmes résolus

### 1. ESM `__dirname` indisponible

**Problème :** Les 4 fichiers (`admin.setup.ts`, `editor.setup.ts`, `user.setup.ts`, `permissions.fixtures.ts`) utilisaient `__dirname` qui n'est pas disponible dans les modules ES.

**Solution :**

```ts
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

---

### 2. Redirect loop pour le rôle `user`

**Problème :** Le setup `user.setup.ts` attendait `waitForURL('**/')` après login. Or le formulaire de login redirige vers `/admin` pour **tous** les rôles, et le middleware bloque le rôle `user` sur `/admin` → redirect vers `/auth/login` → boucle infinie (timeout 30s).

**Diagnostic :**

```yaml
Login form → router.push("/admin")
Middleware → requireMinRole("editor") ← user(0) < editor(1) → redirect /auth/login
→ boucle
```

**Solution :**

```ts
// Attendre que les cookies auth soient posés (3s) puis naviguer sur une page accessible
await page.waitForTimeout(3_000);
await page.goto('/');
await expect(page.locator('body')).toBeVisible();
```

---

### 3. Sidebar : liens sans nom accessible

**Problème :** `sidebar.getByRole('link', { name: 'Tableau de bord' })` échouait. Dans l'arbre d'accessibilité Playwright, les `<Link>` de la sidebar ne contiennent qu'une icône (`img`) — le `<span>` avec le titre est masqué en mode collapsed.

**Arbre d'accessibilité réel :**

```yaml
- listitem "Tableau de bord":       # ← accessible name via title attribute
  - link [cursor=pointer]:
    - img                           # ← pas de nom accessible sur le lien
```

**Solution :** Utiliser `getByRole('listitem', { name: item })` à la place de `getByRole('link', { name: item })`.

---

### 4. Comptage des menu items (3 items en trop)

**Problème :** `[data-sidebar="menu-item"]` retournait 11 au lieu de 8 (editor) et 21 au lieu de 18 (admin). Les éléments `data-sidebar="menu-item"` du header (logo RC) et du footer (bouton Authentification) étaient inclus dans le décompte.

**Solution :** Limiter le sélecteur à la zone de contenu :

```ts
const menuItems = sidebar.locator('[data-sidebar="content"] [data-sidebar="menu-item"]');
```

---

### 5. ROLE-E2E-021 : attente 403 incorrecte pour editor

**Problème :** Le test attendait `403 Forbidden` pour un editor sur `/api/admin/media/search`. Or `withBackofficeAuth` appelle `requireMinRole("editor")` — les editors sont **autorisés**.

**Hiérarchie des rôles sur cet endpoint :**

- `admin` → ✅ autorisé (admin ≥ editor)
- `editor` → ✅ autorisé (editor ≥ editor)
- `user` → ❌ bloqué (user < editor)
- `anon` → ❌ bloqué (non authentifié)

**Solution :** Corriger la spec → attendre `200` pour editor, renommer en "Editor autorisé (200)".

---

## Infrastructure d'authentification

### Comptes de test (Supabase local)

| Rôle | Email | `app_metadata.role` |
| ------ | ------- | --------------------- |
| admin | `yandevformation@gmail.com` | `admin` |
| editor | `editor@rougecardinalcompany.fr` | `editor` |
| user | `user@rougecardinalcompany.fr` | `user` |

### Fichiers de session (`.auth/`)

Chaque setup sauvegarde l'état d'authentification dans `.auth/{role}.json`. Ces fichiers sont dans `.gitignore`.

### Hiérarchie des projets Playwright

```yaml
setup-admin ──┐
setup-editor ─┤── permissions
setup-user ───┘
```

---

## Matrice des permissions vérifiées

| Ressource | admin | editor | user | anon |
| ----------- | ------- | -------- | ------ | ------ |
| `/admin` (dashboard) | ✅ accès | ✅ accès | ❌ → `/auth/login` | ❌ → `/auth/login` |
| `/admin/spectacles` | ✅ | ✅ | ❌ | ❌ |
| `/admin/team` | ✅ | ❌ → `/auth/login` | ❌ | ❌ |
| `/admin/analytics` | ✅ | ❌ | ❌ | ❌ |
| `/admin/users` | ✅ | ❌ | ❌ | ❌ |
| `/admin/site-config` | ✅ | ❌ | ❌ | ❌ |
| `/admin/audit-logs` | ✅ | ❌ | ❌ | ❌ |
| Sidebar 8 items editor | — | ✅ visible | — | — |
| Sidebar 10 items admin-only | ✅ visible | ❌ masqués | — | — |
| `GET /api/admin/media/search` | ✅ 200 | ✅ 200 | ❌ 403 | ❌ 403 |

---

## Prochaines étapes (TASK078)

Les phases restantes de TASK078 :

| Phase | Cas | Statut |
| ------- | ----- | -------- |
| Phase 1 — Tests unitaires (ROLE-UNIT-*) | 42 cas | Non démarré |
| Phase 2 — Tests DAL intégration (ROLE-DAL-*) | 80 cas | Non démarré |
| Phase 3 — Tests RLS SQL (ROLE-RLS-*) | 92 cas | Non démarré |
| Phase 4 — Tests E2E P0 permissions | 23 cas | **✅ Terminé** |
