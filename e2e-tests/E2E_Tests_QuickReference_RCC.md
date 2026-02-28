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
# Auth admin pour les tests E2E
E2E_ADMIN_EMAIL=admin@rougecardinalcompany.fr
E2E_ADMIN_PASSWORD=your_test_password

# URL de test (optionnel, sinon localhost:3000 par défaut)
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Supabase local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_local_anon_key
```

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

Utilise les credentials Supabase stockés dans `.env.e2e`. L'état d'authentification est sauvegardé dans `.auth/admin.json` pour être réutilisé entre les tests.

```ts
import { test as base, type Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/admin');
}

export const authTest = base.extend<{ adminPage: Page }>({
  adminPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
});

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

Compose les Page Objects dans les fixtures. Étend `authTest` pour les zones admin, `base` pour les pages publiques.

```ts
// e2e/tests/admin/team/team.fixtures.ts
import { authTest, expect } from '../../../fixtures/auth.fixture';
import { TeamPage } from '../../../pages/admin/team.page';

type TeamFixtures = {
  teamPage: TeamPage;
};

export const test = authTest.extend<TeamFixtures>({
  teamPage: async ({ adminPage }, use) => {
    const teamPage = new TeamPage(adminPage);
    await use(teamPage);
  },
});

export { expect };
```

```ts
// e2e/tests/public/contact/contact.fixtures.ts
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
└── admin/
    ├── auth.setup.ts        # Setup auth (state stocké dans .auth/)
    ├── team/
    ├── lieux/
    ├── spectacles/
    ├── presse/
    └── media/
```

---

## Règles critiques

- **Toujours utiliser les Page Objects** — zéro sélecteur direct dans les fichiers `.spec.ts`
- **Sélecteurs accessibilité-first** — `getByRole()` avant tout (shadcn/Radix expose nativement les rôles)
- **Un fichier fixture par feature** — compose les Page Objects dedans
- **Importer les types depuis `@/lib/schemas/`** — ex: `import type { ContactMessage } from '@/lib/schemas/contact'`
- **Tests admin** → étendre `authTest`, **tests publics** → étendre `base`
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
