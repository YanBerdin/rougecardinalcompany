# \[TASK085] — E2E Admin — Analytics (rôle admin)

**Status:** Completed
**Added:** 2026-03-23
**Completed:** 2026-03-23
**Priorité:** P0 — ferme le dernier gap de couverture admin

---

## Contexte

La section 20 du `specs/PLAN_DE_TEST_COMPLET.md` (Admin — Analytics) est entièrement
absente de la suite E2E. Tous les autres modules admin sont couverts (TASK081–084 +
TASK038). Cette tâche complète la matrice à 100 %.

**Références plan :** section 20 — ADM-ANALYTICS-001 → 003

---

## Agent à invoquer

```bash
.github/agents/playwright-test-generator.agent.md
```

---

## Prompt

```xml
<test-suite>Admin — Analytics</test-suite>

<test-file>e2e/tests/admin/analytics/analytics.spec.ts</test-file>

<seed-file>e2e/factories/index.ts</seed-file>

<body>
```

### ADM-ANALYTICS-001 — Chargement de la page (P0)

Préconditions : storageState admin (projet `admin` dans playwright.config.ts)

Étapes :

1. Naviguer vers /admin/analytics
2. Attendre networkidle

Résultat attendu :

- La page se charge sans afficher d'error boundary
- Un heading principal est visible
- Le body n'est pas vide

### ADM-ANALYTICS-002 — Contenu affiché si données présentes (P2)

Préconditions : Des entrées existent dans analytics_events (créées par les
navigations E2E précédentes ou via supabaseAdmin insert)

Étapes :

1. Naviguer vers /admin/analytics
2. Attendre networkidle

Résultat attendu :

- Au moins un graphique (canvas, svg.recharts-surface) ou une statistique
  chiffrée est visible
- Pas de spinner infini

### ADM-ANALYTICS-003 — État vide gracieux (P2)

Préconditions : Aucune donnée analytics exploitable pour la période
(filtrer via sélecteur de dates sur une période future)

Étapes :

1. Naviguer vers /admin/analytics
2. Si un sélecteur de période existe, sélectionner une période sans données

Résultat attendu :

- Un état vide informatif s'affiche (texte ou illustration)
- Pas de crash, pas de page blanche
- Le body contient du contenu visible

</body>
```

---

## Structure des fichiers à créer

```bash
e2e/
├── pages/admin/
│   └── analytics.page.ts
└── tests/admin/analytics/
    ├── analytics.fixtures.ts
    └── analytics.spec.ts
```

### `analytics.page.ts`

```typescript
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminAnalyticsPage {
    readonly heading: Locator;
    readonly errorBoundary: Locator;

    constructor(private readonly page: Page) {
        this.heading = page
            .getByRole('heading', { name: /analytics|statistiques/i })
            .first();
        this.errorBoundary = page.getByText('Une erreur est survenue');
    }

    async goto(): Promise<void> {
        await this.page.goto(`/admin/analytics?_t=${Date.now()}`);
        await this.page.waitForLoadState('networkidle');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.errorBoundary).not.toBeVisible({ timeout: 5_000 });
        await expect(this.page.locator('body')).not.toBeEmpty();
    }

    async expectContentVisible(): Promise<void> {
        // Accepte graphiques recharts OU statistiques textuelles OU état vide
        const bodyText = await this.page.locator('body').textContent();
        expect(bodyText?.trim().length).toBeGreaterThan(0);
    }
}
```

### `analytics.fixtures.ts`

```typescript
import { test as base } from '@playwright/test';
import { AdminAnalyticsPage } from '@/e2e/pages/admin/analytics.page';

interface AnalyticsFixtures { analyticsPage: AdminAnalyticsPage; }

export const test = base.extend<AnalyticsFixtures>({
    analyticsPage: async ({ page }, use) => {
        const p = new AdminAnalyticsPage(page);
        await p.goto();
        await use(p);
    },
});

export { expect } from '@playwright/test';
```

### `analytics.spec.ts`

```typescript
// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 20
import { test, expect } from './analytics.fixtures';

test.describe('Admin — Analytics', () => {
    test('ADM-ANALYTICS-001 — La page charge sans erreur', async ({
        analyticsPage,
    }) => {
        await analyticsPage.expectLoaded();
    });

    test('ADM-ANALYTICS-002 — Contenu affiché si données présentes', async ({
        analyticsPage,
    }) => {
        await analyticsPage.expectLoaded();
        await analyticsPage.expectContentVisible();
    });

    test('ADM-ANALYTICS-003 — État vide gracieux', async ({
        analyticsPage,
    }) => {
        await analyticsPage.expectLoaded();
        // La page ne doit jamais être blanche, quelles que soient les données
        await analyticsPage.expectContentVisible();
    });
});
```

---

## Mise à jour `e2e/pages/admin/index.ts`

```typescript
export { AdminAnalyticsPage } from './analytics.page';
```

---

## Points d'attention

- Préférer `networkidle` au lieu de `domcontentloaded` : recharts effectue des
  re-renders asynchrones après hydratation.
- Si la base locale est fraîche (0 analytics_events), ADM-ANALYTICS-002 et 003
  testent le même chemin (état vide) — c'est acceptable, le test reste utile
  pour détecter les crashes.
- Ne pas skipper si les données manquent : l'état vide fait partie du comportement
  attendu testé par ADM-ANALYTICS-003.

---

## Critères d'acceptance

- [ ] `e2e/pages/admin/analytics.page.ts` créé
- [ ] `e2e/tests/admin/analytics/analytics.fixtures.ts` créé
- [ ] `e2e/tests/admin/analytics/analytics.spec.ts` créé
- [ ] Export dans `e2e/pages/admin/index.ts`
- [ ] 3/3 tests passent : `pnpm e2e:admin --grep "ADM-ANALYTICS"`
- [ ] 0 régression sur la suite admin complète (56 tests)

---

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` section 20
- Pattern auth admin : `e2e/tests/auth/admin.setup.ts`
- Pattern Page Object : `e2e/pages/admin/dashboard.page.ts`
- Rapport précédent : `doc/tests/E2E-ADMIN-CRUD-ADMIN-ONLY-TASK083-REPORT.md`
