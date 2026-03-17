# E2E Auth Setup — Rouge Cardinal Company (TASK076 — 3 rôles)

> Configuration de l'authentification multi-rôles Supabase pour les tests E2E Playwright
> Stack : Next.js 16 + Supabase Auth + Playwright
> Modèle : `user (0) < editor (1) < admin (2)` — hiérarchique
> **Version** : 2.0 (TASK076) | **Date** : Mars 2026
> Référence : `E2E_Tests_QuickReference_RCC.md`, `specs/tests-permissions-et-rôles.md`

---

## Table des matières

1. [Principes](#1-principes)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [Variables d'environnement `.env.e2e`](#3-variables-denvironnement-enve2e)
4. [Scripts de setup d'authentification](#4-scripts-de-setup-dauthentification)
   - [auth.setup.ts — Admin](#41-authsetupts--admin)
   - [editor.setup.ts — Editor](#42-editorsetupts--editor)
   - [user.setup.ts — User](#43-usersetupts--user)
5. [Configuration Playwright (`playwright.config.ts`)](#5-configuration-playwright-playwrightconfigts)
6. [Fixture `auth.fixture.ts`](#6-fixture-authfixturets)
7. [Tableau des redirections post-login par rôle](#7-tableau-des-redirections-post-login-par-rôle)
8. [Scripts `package.json`](#8-scripts-packagejson)
9. [Ordre d'exécution](#9-ordre-dexécution)
10. [Dépannage](#10-dépannage)

---

## 1. Principes

- **Login une seule fois par rôle par run** — état sauvegardé dans `.auth/{role}.json`
- **3 fichiers de setup séparés** — un par rôle (`auth.setup.ts`, `editor.setup.ts`, `user.setup.ts`)
- **Ne jamais appeler `loginWith*()` dans les specs** — uniquement dans les setups
- **6 projets Playwright** — setup + admin + editor + user + public + permissions
- **`proxy.ts` au lieu de `middleware.ts`** — spécificité Next.js 16 (le routage middleware est dans `supabase/middleware.ts`, appelé via `proxy.ts`)
- **`app_metadata.role`** est la source de vérité ; `user_metadata.role` en fallback
- **`.auth/`** est gitignored — contient des tokens de session (3 fichiers)

---

## 2. Structure des fichiers

```bash
e2e/
├── .auth/                          # ⚠️ GITIGNORED — tokens de session
│   ├── admin.json                  # storageState admin
│   ├── editor.json                 # storageState editor
│   └── user.json                   # storageState user
├── fixtures/
│   └── auth.fixture.ts             # Fixtures adminPage, editorPage, userPage
├── pages/                          # Page Objects
│   ├── admin/
│   │   └── ...
│   └── public/
│       └── ...
└── tests/
    ├── admin/
    │   ├── auth.setup.ts           # Setup admin → .auth/admin.json
    │   ├── editor.setup.ts         # Setup editor → .auth/editor.json
    │   ├── user.setup.ts           # Setup user → .auth/user.json
    │   └── team/
    │       └── team.spec.ts        # Exemple test admin-only
    ├── editor/
    │   └── spectacles/
    │       └── spectacles.spec.ts  # Exemple test éditorial
    ├── user/
    │   └── blocked/
    │       └── blocked.spec.ts     # Exemple test blocage
    ├── public/
    │   └── contact/
    │       └── contact.spec.ts     # Exemple test public
    └── permissions/
        ├── permissions.fixtures.ts # Fixture multi-rôles
        └── permissions.spec.ts     # Tests contrôle d'accès
```

Ajouter dans `.gitignore` (s'il n'est pas déjà présent) :

```bash
# Playwright auth state (tokens de session — ne jamais commiter)
e2e/.auth/
```

---

## 3. Variables d'environnement `.env.e2e`

Fichier **jamais commité** (déjà dans `.gitignore`). Contient les credentials des 3 comptes de test et la config Supabase locale.

```bash
# ── Auth — 3 rôles hiérarchiques ────────────────────────────
# Chaque compte DOIT avoir app_metadata.role défini dans Supabase
E2E_ADMIN_EMAIL=admin@rougecardinalcompany.fr
E2E_ADMIN_PASSWORD=your_admin_password_here

E2E_EDITOR_EMAIL=editor@rougecardinalcompany.fr
E2E_EDITOR_PASSWORD=your_editor_password_here

E2E_USER_EMAIL=user@rougecardinalcompany.fr
E2E_USER_PASSWORD=your_user_password_here

# ── Supabase local ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# ── Playwright ──────────────────────────────────────────────
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

### Provisionnement des comptes de test

Les comptes doivent exister dans Supabase local avec `app_metadata.role` configuré :

```bash
# Via le script existant (adapté au rôle)
pnpm admin:set-role    # Pour vérifier/définir le rôle admin

# Ou via Supabase Dashboard local → Authentication → Users → Edit user
# Ajouter dans Raw App Meta Data : { "role": "admin" | "editor" | "user" }
```

| Compte | `app_metadata.role` | Accès backoffice |
| --- | --- | --- |
| `E2E_ADMIN_EMAIL` | `admin` | Complet |
| `E2E_EDITOR_EMAIL` | `editor` | Éditorial uniquement |
| `E2E_USER_EMAIL` | `user` | Aucun |

---

## 4. Scripts de setup d'authentification

Chaque script se connecte à `/auth/login`, remplit les credentials depuis `.env.e2e`, vérifie la redirection attendue, et sauvegarde la session.

### Sélecteurs du formulaire de login

Le formulaire (`components/login-form.tsx`) expose :

| Élément | Sélecteur Playwright |
| --- | --- |
| Champ email | `page.getByLabel('Email')` |
| Champ password | `page.getByLabel('Password')` |
| Bouton submit | `page.getByRole('button', { name: /login/i })` |
| Message d'erreur | `page.getByRole('alert')` |

### 4.1 `auth.setup.ts` — Admin

```ts
// e2e/tests/admin/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

export const ADMIN_AUTH_FILE = path.join(__dirname, '../../.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  // 1. Naviguer vers la page de login
  await page.goto('/auth/login');

  // 2. Remplir les credentials depuis .env.e2e
  await page.getByLabel('Email').fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_ADMIN_PASSWORD!);

  // 3. Soumettre le formulaire
  await page.getByRole('button', { name: /login/i }).click();

  // 4. Vérifier la redirection vers le dashboard admin
  //    Le middleware (proxy.ts → supabase/middleware.ts) autorise admin → /admin
  await page.waitForURL('/admin', { timeout: 15_000 });
  await expect(page).toHaveURL('/admin');

  // 5. Sauvegarder l'état de session (cookies + localStorage Supabase)
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
```

**Flux** : Login → `router.push('/admin')` → middleware autorise (admin ≥ editor) → atterrit sur `/admin` ✅

### 4.2 `editor.setup.ts` — Editor

```ts
// e2e/tests/admin/editor.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

export const EDITOR_AUTH_FILE = path.join(__dirname, '../../.auth/editor.json');

setup('authenticate as editor', async ({ page }) => {
  // 1. Naviguer vers la page de login
  await page.goto('/auth/login');

  // 2. Remplir les credentials éditeur depuis .env.e2e
  await page.getByLabel('Email').fill(process.env.E2E_EDITOR_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_EDITOR_PASSWORD!);

  // 3. Soumettre le formulaire
  await page.getByRole('button', { name: /login/i }).click();

  // 4. Vérifier la redirection vers le dashboard admin
  //    Le middleware autorise editor → /admin (sidebar filtrée côté client)
  await page.waitForURL('/admin', { timeout: 15_000 });
  await expect(page).toHaveURL('/admin');

  // 5. Sauvegarder la session editor
  await page.context().storageState({ path: EDITOR_AUTH_FILE });
});
```

**Flux** : Login → `router.push('/admin')` → middleware autorise (editor ≥ editor) → atterrit sur `/admin` ✅
La sidebar est filtrée côté client par `isRoleAtLeast(userRole, item.minRole)` dans `AdminSidebar.tsx`.

### 4.3 `user.setup.ts` — User

```ts
// e2e/tests/admin/user.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

export const USER_AUTH_FILE = path.join(__dirname, '../../.auth/user.json');

setup('authenticate as user', async ({ page }) => {
  // 1. Naviguer vers la page de login
  await page.goto('/auth/login');

  // 2. Remplir les credentials utilisateur depuis .env.e2e
  await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD!);

  // 3. Soumettre le formulaire
  await page.getByRole('button', { name: /login/i }).click();

  // 4. Vérifier le comportement attendu :
  //    Le login Supabase réussit, le composant appelle router.push('/admin'),
  //    mais le middleware bloque (user < editor) et redirige vers /auth/login.
  //    On attend cette redirection retour comme preuve que :
  //    a) L'authentification Supabase a réussi (cookies JWT posés)
  //    b) Le middleware a correctement bloqué l'accès backoffice
  await page.waitForURL('**/auth/login', { timeout: 15_000 });

  // 5. Confirmer que l'utilisateur est bien authentifié
  //    en naviguant vers la page publique (pas de blocage middleware sur /)
  await page.goto('/');
  await page.waitForURL('/');

  // 6. Sauvegarder la session user (cookies Supabase valides)
  await page.context().storageState({ path: USER_AUTH_FILE });
});
```

**Flux** : Login → `router.push('/admin')` → middleware bloque (user < editor) → redirige `/auth/login` → on navigue vers `/` pour confirmer l'auth ✅

> **Note** : Le middleware (`supabase/middleware.ts`) redirige vers `/auth/login` quand un utilisateur sans rôle `editor` tente d'accéder à `/admin`. Les cookies JWT Supabase sont néanmoins posés après le `signInWithPassword` réussi.

---

## 5. Configuration Playwright (`playwright.config.ts`)

6 projets : setup + 4 rôles + permissions multi-rôles.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Charger .env.e2e pour les credentials de test
dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // ──────────────────────────────────────────────
    // 1. SETUP : Login des 3 rôles (exécuté en premier)
    // ──────────────────────────────────────────────
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // ──────────────────────────────────────────────
    // 2. ADMIN : Tests admin-only (storageState admin)
    //    Routes : /admin/team, /admin/users, /admin/home/*, /admin/partners, etc.
    // ──────────────────────────────────────────────
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      testMatch: /admin\/.*\.spec\.ts/,
      testIgnore: /editor\/|user\/|public\/|permissions\//,
      dependencies: ['setup'],
    },

    // ──────────────────────────────────────────────
    // 3. EDITOR : Tests éditoriaux (storageState editor)
    //    Routes : /admin/spectacles, /admin/agenda, /admin/lieux, etc.
    // ──────────────────────────────────────────────
    {
      name: 'chromium-editor',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/editor.json',
      },
      testMatch: /editor\/.*\.spec\.ts/,
      dependencies: ['setup'],
    },

    // ──────────────────────────────────────────────
    // 4. USER : Tests blocage backoffice (storageState user)
    //    Vérifie que le rôle "user" ne peut PAS accéder au backoffice
    // ──────────────────────────────────────────────
    {
      name: 'chromium-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      testMatch: /user\/.*\.spec\.ts/,
      dependencies: ['setup'],
    },

    // ──────────────────────────────────────────────
    // 5. PUBLIC : Tests publics (pas de storageState)
    //    Routes : /, /spectacles, /contact, /agenda, etc.
    // ──────────────────────────────────────────────
    {
      name: 'chromium-public',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /public\/.*\.spec\.ts/,
      // Pas de dépendance au setup — pas besoin d'auth
    },

    // ──────────────────────────────────────────────
    // 6. PERMISSIONS : Tests contrôle d'accès multi-rôles
    //    Charge les 3 storageState selon le test via fixtures
    //    Voir : permissions.fixtures.ts
    // ──────────────────────────────────────────────
    {
      name: 'chromium-permissions',
      use: {
        ...devices['Desktop Chrome'],
        // Pas de storageState au niveau projet —
        // chaque test charge le rôle nécessaire via fixtures
      },
      testMatch: /permissions\/.*\.spec\.ts/,
      dependencies: ['setup'],
    },
  ],

  // Serveur de développement Next.js
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### Matrice des projets

| Projet | `storageState` | `testMatch` | Dépend de `setup` | Rôle simulé |
| --- | --- | --- | --- | --- |
| `setup` | — | `*.setup.ts` | Non (premier) | Login 3 rôles |
| `chromium-admin` | `admin.json` | `admin/**/*.spec.ts` | Oui | `admin` |
| `chromium-editor` | `editor.json` | `editor/**/*.spec.ts` | Oui | `editor` |
| `chromium-user` | `user.json` | `user/**/*.spec.ts` | Oui | `user` |
| `chromium-public` | — | `public/**/*.spec.ts` | Non | anon |
| `chromium-permissions` | via fixtures | `permissions/**/*.spec.ts` | Oui | admin/editor/user |

---

## 6. Fixture `auth.fixture.ts`

Version complète TASK076 avec 3 rôles + détection session expirée + alias rétrocompatible.

```ts
// e2e/fixtures/auth.fixture.ts
import { test as base, type Page } from '@playwright/test';

// Ré-export pour usage dans les fixtures enfants
export { expect } from '@playwright/test';

// ── Types ────────────────────────────────────────────────────

type AdminFixtures = {
  adminPage: Page;
};

type EditorFixtures = {
  editorPage: Page;
};

type UserFixtures = {
  userPage: Page;
};

// ── Helpers ──────────────────────────────────────────────────

const SESSION_EXPIRED_MSG = (role: string) =>
  `Session ${role} expirée. Supprimer e2e/.auth/${role}.json et relancer :\n` +
  `pnpm test:e2e:reset-auth`;

/**
 * Vérifie que la session est active en naviguant vers l'URL attendue.
 * Throw une erreur explicite si la session est expirée.
 */
async function assertSessionActive(
  page: Page,
  targetUrl: string,
  role: string,
): Promise<void> {
  await page.goto(targetUrl);

  // Si redirigé vers /auth/login → session expirée
  if (page.url().includes('/auth/login')) {
    throw new Error(SESSION_EXPIRED_MSG(role));
  }
}

// ── adminTest ────────────────────────────────────────────────

/**
 * Fixture admin — storageState chargé via playwright.config.ts (projet chromium-admin).
 * adminPage est déjà authentifié en tant qu'admin sans re-login.
 */
export const adminTest = base.extend<AdminFixtures>({
  adminPage: async ({ page }, use) => {
    await assertSessionActive(page, '/admin', 'admin');
    await use(page);
  },
});

// ── editorTest ───────────────────────────────────────────────

/**
 * Fixture editor — storageState chargé via playwright.config.ts (projet chromium-editor).
 * editorPage est déjà authentifié en tant qu'editor.
 * La sidebar sera filtrée automatiquement (pas de pages admin-only).
 */
export const editorTest = base.extend<EditorFixtures>({
  editorPage: async ({ page }, use) => {
    await assertSessionActive(page, '/admin', 'editor');
    await use(page);
  },
});

// ── userTest ─────────────────────────────────────────────────

/**
 * Fixture user — storageState chargé via playwright.config.ts (projet chromium-user).
 * Le user est authentifié mais N'A PAS accès au backoffice.
 * userPage est sur la page d'accueil publique.
 */
export const userTest = base.extend<UserFixtures>({
  userPage: async ({ page }, use) => {
    // Le user est authentifié mais redirigé vers /auth/login par le middleware
    // quand il tente d'accéder à /admin (user < editor).
    // On vérifie qu'il peut accéder au site public.
    await page.goto('/');

    // Si la page publique redirige vers login → la session a expiré
    if (page.url().includes('/auth/login')) {
      throw new Error(SESSION_EXPIRED_MSG('user'));
    }

    await use(page);
  },
});

// ── Alias rétrocompatible ────────────────────────────────────

/** @deprecated Utiliser adminTest directement */
export const authTest = adminTest;
```

### Fixture permissions multi-rôles

Pour les tests de contrôle d'accès qui vérifient les 3 rôles dans un même fichier :

```ts
// e2e/tests/permissions/permissions.fixtures.ts
import { test as base, type Page, type BrowserContext } from '@playwright/test';

export { expect } from '@playwright/test';

type PermissionsFixtures = {
  adminPage: Page;
  editorPage: Page;
  userPage: Page;
};

/**
 * Fixture multi-rôles — crée 3 contextes de navigateur distincts
 * avec les storageStates des 3 rôles.
 * Usage : tests qui vérifient l'accès/blocage par rôle.
 */
export const test = base.extend<PermissionsFixtures>({
  adminPage: async ({ browser }, use) => {
    const ctx: BrowserContext = await browser.newContext({
      storageState: 'e2e/.auth/admin.json',
    });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },

  editorPage: async ({ browser }, use) => {
    const ctx: BrowserContext = await browser.newContext({
      storageState: 'e2e/.auth/editor.json',
    });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },

  userPage: async ({ browser }, use) => {
    const ctx: BrowserContext = await browser.newContext({
      storageState: 'e2e/.auth/user.json',
    });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
});
```

### Utilisation des fixtures

| Contexte | Fixture de base | Page fournie | Import |
| --- | --- | --- | --- |
| Pages admin-only (team, config, partners) | `adminTest` | `adminPage` | `auth.fixture.ts` |
| Pages éditoriales (spectacles, agenda, lieux) | `editorTest` | `editorPage` | `auth.fixture.ts` |
| Tests blocage backoffice par rôle user | `userTest` | `userPage` | `auth.fixture.ts` |
| Pages publiques (contact, agenda public) | `base` (Playwright) | `page` | `@playwright/test` |
| Tests permissions multi-rôles | `test` | `adminPage`, `editorPage`, `userPage` | `permissions.fixtures.ts` |

---

## 7. Tableau des redirections post-login par rôle

Comportement attendu après soumission du formulaire de login :

| Rôle | `app_metadata.role` | Login réussit | Redirection | Sidebar | Middleware |
| --- | --- | --- | --- | --- | --- |
| `admin` | `admin` | ✅ | `/admin` | Complète (18 items) | Autorise (admin ≥ editor) |
| `editor` | `editor` | ✅ | `/admin` | Filtrée (8 items) | Autorise (editor ≥ editor) |
| `user` | `user` | ✅ | `/auth/login` → `/` | N/A | Bloque (user < editor) |

### Détail de la sidebar par rôle

#### Admin (18 items — toutes les sections)

| Groupe | Items visibles |
| --- | --- |
| Général | Tableau de bord, Équipe, Utilisateurs |
| Contenu | Spectacles, Agenda, Lieux, Presse, Compagnie, Médiathèque |
| Accueil | Accueil - Slides, Accueil - La compagnie, Partenaires |
| Autres | Analytics, Affichage Sections, Audit Logs, Paramètres, Debug Auth, Retour au site |

#### Editor (8 items — éditorial uniquement)

| Groupe | Items visibles |
| --- | --- |
| Général | Tableau de bord |
| Contenu | Spectacles, Agenda, Lieux, Presse, Compagnie, Médiathèque |
| Accueil | _(aucun)_ |
| Autres | Retour au site |

#### User (0 items — pas d'accès backoffice)

Le middleware redirige avant l'affichage de la sidebar.

### Flux d'authentification détaillé

```
                    ┌──────────────┐
                    │ /auth/login  │
                    └──────┬───────┘
                           │ signInWithPassword()
                           │ (Supabase pose les cookies JWT)
                           ▼
                    ┌──────────────┐
                    │ router.push  │
                    │  ('/admin')  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  admin   │ │  editor  │ │   user   │
        │ ≥ editor │ │ ≥ editor │ │ < editor │
        │    ✅    │ │    ✅    │ │    ❌    │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
             ▼             ▼             ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  /admin  │ │  /admin  │ │/auth/login│
        │(complète)│ │(filtrée) │ │(redirigé) │
        └──────────┘ └──────────┘ └──────────┘
```

> **Middleware** (`supabase/middleware.ts` appelé via `proxy.ts`) :
>
> - Résout le rôle : `app_metadata.role` → `user_metadata.role` (fallback) → `normalizeRole()`
> - Vérifie : `isRoleAtLeast(effectiveRole, 'editor')`
> - Si insuffisant : redirige vers `/auth/login` (UI) ou retourne `403 JSON` (API)

---

## 8. Scripts `package.json`

```json
{
  "scripts": {
    "test:e2e": "dotenv -e .env.e2e -- playwright test",
    "test:e2e:headed": "dotenv -e .env.e2e -- playwright test --headed",
    "test:e2e:ui": "dotenv -e .env.e2e -- playwright test --ui",
    "test:e2e:debug": "dotenv -e .env.e2e -- playwright test --debug",
    "test:e2e:admin": "dotenv -e .env.e2e -- playwright test --project=chromium-admin",
    "test:e2e:editor": "dotenv -e .env.e2e -- playwright test --project=chromium-editor",
    "test:e2e:user": "dotenv -e .env.e2e -- playwright test --project=chromium-user",
    "test:e2e:public": "dotenv -e .env.e2e -- playwright test --project=chromium-public",
    "test:e2e:permissions": "dotenv -e .env.e2e -- playwright test --project=chromium-permissions",
    "test:e2e:reset-auth": "rm -f e2e/.auth/admin.json e2e/.auth/editor.json e2e/.auth/user.json"
  }
}
```

### Détail

| Script | Projets exécutés | Usage |
| --- | --- | --- |
| `test:e2e` | Tous (setup → admin, editor, user, public, permissions) | Run complet |
| `test:e2e:admin` | setup → chromium-admin | Tests admin-only |
| `test:e2e:editor` | setup → chromium-editor | Tests éditoriaux |
| `test:e2e:user` | setup → chromium-user | Tests blocage user |
| `test:e2e:public` | chromium-public | Tests publics (pas de setup) |
| `test:e2e:permissions` | setup → chromium-permissions | Tests contrôle d'accès |
| `test:e2e:reset-auth` | — | Supprime les 3 fichiers `.auth/*.json` |
| `test:e2e:headed` | Tous | Mode navigateur visible |
| `test:e2e:ui` | Tous | Interface graphique Playwright |
| `test:e2e:debug` | Tous | Playwright Inspector |

> **Prérequis `dotenv`** : le package `dotenv-cli` doit être installé (`pnpm add -D dotenv-cli`).

---

## 9. Ordre d'exécution

```bash
pnpm test:e2e
│
├── [setup] auth.setup.ts
│   ├── Login admin → sauvegarde e2e/.auth/admin.json
│   ├── Login editor → sauvegarde e2e/.auth/editor.json
│   └── Login user → sauvegarde e2e/.auth/user.json
│
├── [chromium-admin] tests/admin/**/*.spec.ts
│   └── Charge storageState admin.json → adminPage déjà connecté (rôle admin)
│
├── [chromium-editor] tests/editor/**/*.spec.ts
│   └── Charge storageState editor.json → editorPage déjà connecté (rôle editor)
│
├── [chromium-user] tests/user/**/*.spec.ts
│   └── Charge storageState user.json → userPage authentifié mais sans accès backoffice
│
├── [chromium-public] tests/public/**/*.spec.ts  (parallèle, pas de dépendance setup)
│   └── Pas de storageState → page anonyme
│
└── [chromium-permissions] tests/permissions/**/*.spec.ts
    └── Fixture crée 3 contextes avec les 3 storageStates
```

### Dépendances entre projets

```
   setup
   ├───► chromium-admin
   ├───► chromium-editor
   ├───► chromium-user
   └───► chromium-permissions

   chromium-public  (indépendant)
```

---

## 10. Dépannage

### Problèmes courants

| Problème | Cause probable | Solution |
| --- | --- | --- |
| `Session admin expirée` | `.auth/admin.json` périmé (JWT expire après 1h par défaut) | `pnpm test:e2e:reset-auth` puis relancer |
| `Session editor expirée` | `.auth/editor.json` périmé | `pnpm test:e2e:reset-auth` puis relancer |
| `Session user expirée` | `.auth/user.json` périmé | `pnpm test:e2e:reset-auth` puis relancer |
| `E2E_ADMIN_EMAIL is not defined` | `.env.e2e` absent ou `dotenv-cli` pas installé | Vérifier `pnpm add -D dotenv-cli` et que `.env.e2e` existe |
| `E2E_EDITOR_EMAIL is not defined` | Variable manquante dans `.env.e2e` | Ajouter les 3 paires email/password dans `.env.e2e` |
| Redirect en boucle `/admin → /auth/login` pour editor | `app_metadata.role` absent ou ≠ `editor` | Vérifier le rôle dans Supabase Dashboard → Authentication → Users |
| Editor voit des pages admin-only | `isRoleAtLeast()` défaillant ou `minRole` mal configuré | Vérifier `AdminSidebar.tsx` et `lib/auth/role-helpers.ts` |
| User accède au backoffice | Middleware ne bloque pas | Vérifier `supabase/middleware.ts` : contrôle `isRoleAtLeast(effectiveRole, 'editor')` |
| `storageState file not found` | Setup non exécuté | S'assurer que le projet dépend de `'setup'` dans `playwright.config.ts` |
| Tests admin OK local, fail en CI | Workers parallèles ou race condition | Vérifier `workers: 1` en CI et `reuseExistingServer: false` |
| `proxy.ts` introuvable par le middleware | Confusion Next.js 16 `proxy.ts` vs `middleware.ts` | Le projet utilise `proxy.ts` (Next.js 16), qui appelle `supabase/middleware.ts` |
| Admin setup passe mais editor échoue | Compte editor non créé ou mauvais mot de passe | Vérifier les credentials dans `.env.e2e` et le compte dans Supabase |
| `getByLabel('Email')` ne trouve rien | Login form non chargé / JS désactivé | Ajouter `await page.waitForLoadState('networkidle')` avant le fill |
| Rôle résolu comme `user` pour tout le monde | `app_metadata.role` non défini | Mettre le rôle dans `app_metadata` (pas seulement `user_metadata`) |
| Sidebar identique pour admin et editor | `userRole` non passé à `AdminSidebar` | Vérifier que le layout admin transmet le rôle depuis `getCurrentUserRole()` |

### Procédure de diagnostic

```bash
# 1. Vérifier que Supabase local tourne
pnpm dlx supabase status

# 2. Vérifier les comptes de test
# Ouvrir http://localhost:54323 → Authentication → Users
# Vérifier que les 3 comptes existent avec le bon app_metadata.role

# 3. Reset complet des sessions
pnpm test:e2e:reset-auth

# 4. Relancer en mode debug pour un rôle spécifique
pnpm test:e2e:debug -- --project=setup

# 5. Vérifier les cookies sauvegardés
cat e2e/.auth/admin.json | jq '.cookies[] | .name'
# Doit contenir des cookies sb-* (Supabase auth tokens)
```

### Augmenter la durée du JWT (local uniquement)

Si les sessions expirent trop vite pendant le développement :

```bash
# Dans supabase/config.toml
[auth]
jwt_expiry = 7200  # 2 heures au lieu de 1 heure par défaut
```

Puis redémarrer : `pnpm dlx supabase stop && pnpm dlx supabase start`

---

## Règles critiques

1. **Ne JAMAIS appeler `loginWith*()` dans les specs** — c'est le rôle exclusif des fichiers `*.setup.ts`
2. **`adminPage` / `editorPage` / `userPage` ≠ re-login** — c'est la page avec la session chargée depuis `storageState`
3. **Tests admin → `adminTest.extend()`**, tests editor → `editorTest.extend()`, tests public → `base.extend()`
4. **`.auth/*.json` gitignored** — contient des tokens JWT de session
5. **Toujours `waitForURL` dans les setups** — valide que le login + middleware ont fonctionné
6. **`app_metadata.role`** est la source de vérité (non modifiable par l'utilisateur) ; `user_metadata.role` n'est qu'un fallback
7. **`proxy.ts`** est le point d'entrée middleware Next.js 16 — il délègue à `supabase/middleware.ts`
8. **Le projet `setup` est une dépendance obligatoire** pour admin, editor, user, et permissions (pas pour public)

---

## Références

| Document | Chemin | Rôle |
| --- | --- | --- |
| Quick Reference E2E | `e2e-tests/E2E_Tests_QuickReference_RCC.md` | Patterns et structure globale |
| Plan de tests permissions | `specs/tests-permissions-et-rôles.md` | 239 cas de test (section 5 = E2E) |
| Matrice ACL | `memory-bank/acl-permissions-role.md` | Source de vérité permissions |
| TASK078 | `memory-bank/tasks/TASK078-implement-permissions-tests.md` | Suivi d'implémentation |
| Role helpers | `lib/auth/role-helpers.ts` | `normalizeRole()`, `isRoleAtLeast()`, `ROLE_HIERARCHY` |
| Server guards | `lib/auth/roles.ts` | `requireMinRole()`, `requireBackofficeAccess()`, etc. |
| Sidebar | `components/admin/AdminSidebar.tsx` | Filtrage par `minRole` via `isRoleAtLeast()` |
| Middleware | `supabase/middleware.ts` (via `proxy.ts`) | Protection routes `/admin` et `/api/admin` |
| Login form | `components/login-form.tsx` | Sélecteurs Playwright (Email, Password, Login) |
| Seed strategy | `e2e-tests/E2E_Seed_Strategy_RCC.md` | Factories et données de test |
