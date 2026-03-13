# E2E Tests - Quick Reference (Rouge Cardinal Company)
>
> Playwright end-to-end tests with Page Object pattern
> Adapté pour projet monolithique Next.js 16 + Supabase

---

## Structure

```bash
e2e/
├── pages/               # Page Objects (un par page/écran)
├── fixtures/            # Fixtures de base (auth Supabase, etc.)
└── tests/
    └── [feature]/
        ├── [feature].fixtures.ts   # Fixtures spécifiques à la feature
        └── [feature].spec.ts       # Spécifications des tests
```

> 📁 Le fichier de référence (`E2E_Tests_QuickReference_RCC.md`) est dans `./e2e-tests/`. Le code des tests E2E se trouve dans `./e2e-tests/` à la racine.

---

## Setup

### Installation

```bash
pnpm add -D @playwright/test
npx playwright install
```

### Configuration `playwright.config.ts` (racine du projet)

> ⚠️ Ce projet utilise `proxy.ts` au lieu de `middleware.ts` (migration Next.js 16). Aucun impact sur Playwright, mais ne pas s'étonner de l'absence de `middleware.ts`.

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
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Variables d'environnement `.env.e2e`

```bash
# Auth — 3 rôles hiérarchiques (user < editor < admin)
# Chaque compte doit avoir app_metadata.role défini dans Supabase
E2E_ADMIN_EMAIL=admin@rougecardinalcompany.fr
E2E_ADMIN_PASSWORD=your_test_password
E2E_EDITOR_EMAIL=editor@rougecardinalcompany.fr
E2E_EDITOR_PASSWORD=your_test_password
E2E_USER_EMAIL=user@rougecardinalcompany.fr
E2E_USER_PASSWORD=your_test_password

# URL de test (optionnel, sinon localhost:3000 par défaut)
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Supabase local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_local_anon_key
```

> **Provisionnement des comptes** : les comptes de test doivent avoir `app_metadata: { role: "admin" | "editor" | "user" }` défini via le Dashboard Supabase ou le service_role client. Voir `scripts/test-editor-access-local.ts` pour un exemple de provisionnement automatique.

### Scripts `package.json`

Ajouter dans `package.json` (ces scripts **ne sont pas encore présents**) :

```json
{
  "scripts": {
    "test:e2e": "dotenv -e .env.e2e -- playwright test",
    "test:e2e:headed": "dotenv -e .env.e2e -- playwright test --headed",
    "test:e2e:ui": "dotenv -e .env.e2e -- playwright test --ui",
    "test:e2e:debug": "dotenv -e .env.e2e -- playwright test --debug"
  }
}
```

> ⚠️ `playwright.config.ts` n'existe pas encore non plus — le créer à la racine.

---

## Commandes

```bash
# Lancer les tests (headless)
pnpm test:e2e

# Feature spécifique
pnpm test:e2e e2e/tests/contact/

# Avec navigateur visible
pnpm test:e2e:headed e2e/tests/admin/team/

# Interface graphique Playwright
pnpm test:e2e:ui

# Debug interactif
pnpm test:e2e:debug
```

---

## Patterns clés

### Fixture d'authentification (`e2e/fixtures/auth.fixture.ts`)

Utilise les credentials Supabase stockés dans `.env.e2e`. L'état d'authentification est sauvegardé dans `.auth/{role}.json` pour être réutilisé entre les tests.

Le projet utilise un modèle hiérarchique à 3 rôles : `user < editor < admin` (cf. TASK076). La fixture expose un `Page` pré-authentifié par rôle.

```ts
import { test as base, type Page } from '@playwright/test';

type AppRole = 'admin' | 'editor' | 'user';

async function loginWithRole(page: Page, role: AppRole) {
  const emailKey = `E2E_${role.toUpperCase()}_EMAIL`;
  const passwordKey = `E2E_${role.toUpperCase()}_PASSWORD`;

  await page.goto('/auth/login');
  await page.getByLabel('Email').fill(process.env[emailKey]!);
  await page.getByLabel('Password').fill(process.env[passwordKey]!);
  await page.getByRole('button', { name: 'Login' }).click();

  // Admin et editor sont redirigés vers /admin (sidebar filtrée pour editor)
  // User est redirigé vers / (backoffice interdit)
  if (role === 'user') {
    await page.waitForURL('/');
  } else {
    await page.waitForURL('/admin');
  }
}

// Fixture admin — accès complet au backoffice
export const adminTest = base.extend<{ adminPage: Page }>({
  adminPage: async ({ page }, use) => {
    await loginWithRole(page, 'admin');
    await use(page);
  },
});

// Fixture editor — accès éditorial uniquement (spectacles, événements, média, etc.)
export const editorTest = base.extend<{ editorPage: Page }>({
  editorPage: async ({ page }, use) => {
    await loginWithRole(page, 'editor');
    await use(page);
  },
});

// Fixture user — authentifié mais sans accès backoffice
export const userTest = base.extend<{ userPage: Page }>({
  userPage: async ({ page }, use) => {
    await loginWithRole(page, 'user');
    await use(page);
  },
});

// Alias rétrocompatible
export const authTest = adminTest;

export { expect } from '@playwright/test';
```

### Page Objects (`e2e/pages/*.ts`)

Un fichier par page/écran. Exemples adaptés aux routes du projet :

```ts
// e2e/pages/admin/team.page.ts
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class TeamPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/admin/team');
  }

  // Assertions (préfixe expect*)
  async expectMemberVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async expectEmptyState() {
    await expect(
      this.page.getByText('Aucun membre')
    ).toBeVisible();
  }

  // Actions (verbes: click*, fill*, select*)
  async clickNewMember() {
    await this.page.getByRole('link', { name: 'Ajouter un membre' }).click();
  }

  async fillMemberForm(data: { firstName: string; lastName: string; role: string }) {
    await this.page.getByLabel('Prénom').fill(data.firstName);
    await this.page.getByLabel('Nom').fill(data.lastName);
    await this.page.getByLabel('Rôle').fill(data.role);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: 'Enregistrer' }).click();
  }
}
```

```ts
// e2e/pages/public/contact.page.ts
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class ContactPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/contact');
  }

  async expectFormVisible() {
    await expect(
      this.page.getByRole('form', { name: /contact/i })
    ).toBeVisible();
  }

  async fillContactForm(data: {
    name: string;
    email: string;
    message: string;
    reason?: string;
  }) {
    await this.page.getByLabel('Nom').fill(data.name);
    await this.page.getByLabel('Email').fill(data.email);
    await this.page.getByLabel('Message').fill(data.message);
    if (data.reason) {
      await this.page.getByLabel('Motif').selectOption(data.reason);
    }
  }

  async submitForm() {
    await this.page.getByRole('button', { name: 'Envoyer' }).click();
  }

  async expectSuccessMessage() {
    await expect(
      this.page.getByText(/message.*envoyé|merci/i)
    ).toBeVisible();
  }
}
```

### Fixtures de feature (`e2e/tests/[feature]/[feature].fixtures.ts`)

Compose les Page Objects dans les fixtures. Choisir la fixture de base selon le rôle requis :

| Contexte | Fixture de base | Page fournie |
| -------- | --------------- | ------------ |
| Pages admin-only (team, config, contacts presse) | `adminTest` | `adminPage` |
| Pages éditoriales (spectacles, événements, média, lieux, presse) | `editorTest` | `editorPage` |
| Tests de blocage backoffice par rôle insuffisant | `userTest` | `userPage` |
| Pages publiques (contact, spectacles publics, agenda) | `base` (Playwright) | `page` |

```ts
// e2e/tests/admin/team/team.fixtures.ts — Admin-only feature
import { adminTest, expect } from '../../../fixtures/auth.fixture';
import { TeamPage } from '../../../pages/admin/team.page';

type TeamFixtures = {
  teamPage: TeamPage;
};

export const test = adminTest.extend<TeamFixtures>({
  teamPage: async ({ adminPage }, use) => {
    const teamPage = new TeamPage(adminPage);
    await use(teamPage);
  },
});

export { expect };
```

```ts
// e2e/tests/admin/spectacles/spectacles.fixtures.ts — Editorial feature (editor OK)
import { editorTest, expect } from '../../../fixtures/auth.fixture';
import { SpectaclesPage } from '../../../pages/admin/spectacles.page';

type SpectaclesFixtures = {
  spectaclesPage: SpectaclesPage;
};

export const test = editorTest.extend<SpectaclesFixtures>({
  spectaclesPage: async ({ editorPage }, use) => {
    const spectaclesPage = new SpectaclesPage(editorPage);
    await use(spectaclesPage);
  },
});

export { expect };
```

```ts
// e2e/tests/public/contact/contact.fixtures.ts — Public page (no auth)
import { test as base, expect } from '@playwright/test';
import { ContactPage } from '../../../pages/public/contact.page';

type ContactFixtures = {
  contactPage: ContactPage;
};

export const test = base.extend<ContactFixtures>({
  contactPage: async ({ page }, use) => {
    const contactPage = new ContactPage(page);
    await use(contactPage);
  },
});

export { expect };
```

### Fichiers de test (`e2e/tests/[feature]/[feature].spec.ts`)

Importer `test` depuis les fixtures locales. Noms descriptifs en français ou anglais.

```ts
// e2e/tests/admin/team/team.spec.ts
import { test, expect } from './team.fixtures';

test.describe('Gestion de l\'équipe', () => {
  test('affiche la liste des membres', async ({ teamPage }) => {
    await teamPage.goto();
    await teamPage.expectMemberVisible('Jean Dupont');
  });

  test('allows user to create a new team member', async ({ teamPage }) => {
    await teamPage.goto();
    await teamPage.clickNewMember();
    await teamPage.fillMemberForm({
      firstName: 'Marie',
      lastName: 'Martin',
      role: 'Comédienne',
    });
    await teamPage.submitForm();
    await teamPage.expectMemberVisible('Marie Martin');
  });

  test('shows error when form is submitted empty', async ({ teamPage }) => {
    await teamPage.goto();
    await teamPage.clickNewMember();
    await teamPage.submitForm();
    // Validation Zod côté client
    await expect(teamPage['page'].getByText(/requis/i).first()).toBeVisible();
  });
});
```

---

## Sélecteurs — priorités

Ordre de préférence pour les sélecteurs (cohérent avec shadcn/ui + Radix UI) :

```bash
getByRole()       → buttons, links, headings, forms (Radix expose les rôles ARIA)
getByLabel()      → inputs associés à un <label> (shadcn Form)
getByText()       → contenu textuel visible
getByPlaceholder() → champs sans label visible
locator('[data-testid]') → en dernier recours, ajouter data-testid dans le composant
```

> ⚠️ Éviter les sélecteurs CSS (`.btn-primary`, `#form-submit`). Les classes Tailwind changent.

---

## Organisation des tests par zone du projet

```bash
e2e/tests/
├── public/
│   ├── contact/
│   │   ├── contact.fixtures.ts
│   │   └── contact.spec.ts
│   ├── newsletter/
│   ├── spectacles/
│   └── agenda/
├── admin/                   # Tests fonctionnels backoffice
│   ├── auth.setup.ts        # Setup auth multi-rôles (state stocké dans .auth/)
│   ├── team/                # admin-only → adminTest
│   ├── lieux/               # editorial → editorTest
│   ├── spectacles/          # editorial → editorTest
│   ├── presse/              # editorial → editorTest
│   └── media/               # editorial → editorTest
└── permissions/             # Tests d'accès par rôle (TASK076)
    ├── permissions.fixtures.ts
    └── permissions.spec.ts  # Editor blocked on admin-only, User blocked on backoffice
```

> **`permissions/`** : dossier dédié aux tests de contrôle d'accès multi-rôles. Vérifie la sidebar filtrée, le blocage de pages admin-only pour editor, et la redirection complète pour user. Voir `specs/tests-permissions-et-rôles.md` pour le plan de cas détaillé.

---

## Règles critiques

- **Toujours utiliser les Page Objects** — zéro sélecteur direct dans les fichiers `.spec.ts`
- **Sélecteurs accessibilité-first** — `getByRole()` avant tout (shadcn/Radix expose nativement les rôles)
- **Un fichier fixture par feature** — compose les Page Objects dedans
- **Importer les types depuis `@/lib/schemas/`** — ex: `import type { ContactMessage } from '@/lib/schemas/contact'`
- **Choisir la fixture selon le rôle requis** :
  - Pages admin-only (team, contacts presse, config) → étendre `adminTest`
  - Pages éditoriales (spectacles, événements, média, lieux, presse) → étendre `editorTest`
  - Tests de blocage/redirection → étendre `userTest`
  - Pages publiques → étendre `base`
- **Jamais tester la logique métier** — tester le comportement visible (ce que l'utilisateur voit/fait)
- **Données de test isolées** — utiliser la base Supabase locale (ne pas polluer la prod)

---

## Bonnes pratiques spécifiques au projet

### Server Actions & revalidatePath

Après une mutation (create/update/delete), attendre la navigation ou le toast de confirmation avant de vérifier l'état — les Server Actions appellent `revalidatePath()` qui peut induire un délai de re-rendu.

```ts
await teamPage.submitForm();
// Attendre le toast de succès avant de vérifier la liste
await expect(page.getByText('Membre créé')).toBeVisible();
await teamPage.goto(); // re-fetch via Server Component
await teamPage.expectMemberVisible('Marie Martin');
```

### Modèle de rôles hiérarchique (TASK076)

Le projet utilise 3 rôles hiérarchiques : `user (0) < editor (1) < admin (2)`.

- **Sidebar filtrée** : chaque item du sidebar admin a un `minRole`. L'editor ne voit que les items éditoriaux (~11 items), l'admin voit tout (~20+ items). Utiliser `filterByRole()` côté TypeScript (`lib/auth/role-helpers.ts`).
- **Pages protégées** : le middleware (`proxy.ts`) résout le rôle depuis `app_metadata.role` du JWT (fallback `user_metadata.role`). Un editor accédant à `/admin/team` est redirigé vers `/admin`. Un user accédant à `/admin` est redirigé vers `/`.
- **RLS** : les tables éditoriales utilisent `has_min_role('editor')`, les tables admin-only utilisent `is_admin()`. Les tests E2E ne testent pas directement le RLS (voir scripts `test-editor-access-local.ts`), mais vérifient les effets visibles (données absentes, erreurs).

### Display Toggles (TASK030)

Certaines sections publiques sont conditionnelles. Tester avec et sans toggle activé si la feature est couverte.

### BigInt IDs

Les IDs dans les URLs sont des `bigint` côté DB. Dans les Page Objects, les extraire depuis l'URL avec `page.url()` si nécessaire — ne pas hard-coder d'IDs.

---

## Qualité

```bash
# TypeCheck des fichiers e2e
pnpm tsc --project e2e/tsconfig.json --noEmit

# Lint
pnpm eslint e2e/
```

`e2e/tsconfig.json` minimal :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "baseUrl": "..",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts"]
}
```
