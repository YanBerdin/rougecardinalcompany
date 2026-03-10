# E2E Auth Setup — Rouge Cardinal Company

> Configuration de l'authentification Supabase pour les tests E2E Playwright
> Stack : Next.js 16 + Supabase Auth + Playwright
> Référence : `E2E_Tests_QuickReference_RCC.md`

---

## Principes

- **Login une seule fois** par run — état sauvegardé dans `.auth/admin.json`
- **Réutilisation entre tests** — pas de re-login à chaque spec
- **Séparation setup/tests** — `auth.setup.ts` s'exécute avant tous les projets Playwright
- **Credentials isolés** — via `.env.e2e`, jamais dans le code source

---

## Structure des fichiers

```bash
e2e/
├── .auth/
│   └── admin.json           # État de session (gitignored)
├── fixtures/
│   └── auth.fixture.ts      # Fixture adminPage réutilisable
└── tests/
    └── admin/
        └── auth.setup.ts    # Script de login (exécuté une fois avant les tests)
```

Ajouter dans `.gitignore` :

```bash
e2e/.auth/
```

---

## Script de setup (`e2e/tests/admin/auth.setup.ts`)

S'exécute une seule fois avant tous les tests admin. Sauvegarde l'état de session Supabase dans `.auth/admin.json`.

```ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

// Chemin vers le fichier d'état d'authentification
export const ADMIN_AUTH_FILE = path.join(__dirname, '../../.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  // Naviguer vers la page de login
  await page.goto('/auth/login');

  // Remplir les credentials depuis .env.e2e
  await page.getByLabel('Email').fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_ADMIN_PASSWORD!);

  // Soumettre
  await page.getByRole('button', { name: 'Login' }).click();

  // Attendre la redirection vers le dashboard admin
  await page.waitForURL('/admin', { timeout: 10000 });

  // Vérifier qu'on est bien connecté
  await expect(page).toHaveURL('/admin');

  // Sauvegarder l'état (cookies + localStorage Supabase)
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
```

---

## Configuration Playwright (`playwright.config.ts`)

Le projet `setup` s'exécute en premier. Les projets `chromium`, `firefox`, `webkit` en dépendent et chargent l'état sauvegardé.

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    // 1. Setup : login admin une seule fois
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // 2. Tests admin : chargent l'état de session sauvegardé
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      testMatch: /.*\/admin\/.*\.spec\.ts/,
      dependencies: ['setup'],
    },

    // 3. Tests publics : sans état d'authentification
    {
      name: 'chromium-public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\/public\/.*\.spec\.ts/,
    },

    // 4. Cross-browser pour les tests publics critiques (P0)
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\/public\/.*\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\/public\/.*\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Fixture auth (`e2e/fixtures/auth.fixture.ts`)

Fournit `adminPage` — une page déjà authentifiée, réutilisable dans toutes les fixtures de features admin.

```ts
import { test as base, type Page } from '@playwright/test';

// Ré-export de expect pour usage dans les fixtures enfants
export { expect } from '@playwright/test';

// Type de la fixture
type AuthFixtures = {
  adminPage: Page;
};

/**
 * authTest — étend base avec adminPage
 * La storageState est chargée via playwright.config.ts (projet chromium-admin)
 * adminPage est donc déjà authentifié sans re-login
 */
export const authTest = base.extend<AuthFixtures>({
  adminPage: async ({ page }, use) => {
    // La session est déjà active grâce à storageState dans la config
    // Naviguer vers /admin pour vérifier
    await page.goto('/admin');

    // Si redirigé vers login (session expirée), on échoue explicitement
    if (page.url().includes('/auth/login')) {
      throw new Error(
        'Session admin expirée. Supprimer e2e/.auth/admin.json et relancer.'
      );
    }

    await use(page);
  },
});
```

---

## Vérification de session expirée

Supabase Auth JWT expire par défaut après 1 heure. En CI ou lors de runs longs, gérer l'expiration :

```ts
// e2e/helpers/session.ts
import { testDb } from './db';

/**
 * Vérifie que la session admin est toujours valide
 * À appeler dans globalSetup si nécessaire
 */
export async function validateAdminSession(email: string): Promise<boolean> {
  const { data, error } = await testDb.auth.admin.listUsers();
  if (error) return false;
  return data.users.some(u => u.email === email);
}
```

---

## Variables d'environnement (`.env.e2e`)

```bash
# ── Auth admin ──────────────────────────────────────────────
E2E_ADMIN_EMAIL=admin@rougecardinalcompany.fr
E2E_ADMIN_PASSWORD=your_test_password_here

# ── Supabase local ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# ── Playwright ──────────────────────────────────────────────
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

> ⚠️ `.env.e2e` doit être dans `.gitignore`. Ne jamais commiter des credentials.

---

## Scripts `package.json`

```json
{
  "scripts": {
    "test:e2e": "dotenv -e .env.e2e -- playwright test",
    "test:e2e:headed": "dotenv -e .env.e2e -- playwright test --headed",
    "test:e2e:ui": "dotenv -e .env.e2e -- playwright test --ui",
    "test:e2e:debug": "dotenv -e .env.e2e -- playwright test --debug",
    "test:e2e:admin": "dotenv -e .env.e2e -- playwright test --project=chromium-admin",
    "test:e2e:public": "dotenv -e .env.e2e -- playwright test --project=chromium-public",
    "test:e2e:reset-auth": "rm -f e2e/.auth/admin.json"
  }
}
```

---

## Ordre d'exécution complet

```bash
pnpm test:e2e
│
├── [setup] auth.setup.ts
│   └── Login → sauvegarde e2e/.auth/admin.json
│
├── [chromium-admin] tests/admin/**/*.spec.ts
│   └── Charge storageState → adminPage déjà connecté
│
└── [chromium-public] tests/public/**/*.spec.ts
    └── Pas de storageState → page anonyme
```

---

## Dépannage

| Problème | Cause | Solution |
| --- | --- | --- |
| `Session admin expirée` | `.auth/admin.json` périmé | `pnpm test:e2e:reset-auth` puis relancer |
| `E2E_ADMIN_EMAIL is not defined` | `.env.e2e` absent ou non chargé | Vérifier le script `dotenv -e .env.e2e` |
| Redirect vers `/auth/login` sur page admin | Supabase JWT expiré | Augmenter `JWT expiry` dans Supabase Auth settings (local) |
| Tests admin passent en local, échouent en CI | `workers: 1` non respecté | Vérifier `process.env.CI` dans la config |
| `storageState file not found` | Setup non exécuté | S'assurer que le projet `setup` est dans `dependencies` |

---

## Règles critiques

- **Ne jamais appeler `loginAsAdmin()` dans les specs** — c'est le rôle de `auth.setup.ts`
- **`adminPage` ≠ re-login** — c'est simplement la page avec la session chargée
- **Tests admin → `authTest.extend()`**, tests publics → `base.extend()`
- **`.auth/admin.json` gitignored** — contient des tokens de session
- **Toujours `waitForURL('/admin')` dans le setup** — valide que le login a réellement fonctionné
