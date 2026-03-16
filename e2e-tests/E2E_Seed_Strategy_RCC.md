# E2E Seed Strategy — Rouge Cardinal Company

> Stratégie de seeding des données de test pour les tests E2E Playwright.
> Compagnon du [E2E_Tests_QuickReference_RCC.md](./E2E_Tests_QuickReference_RCC.md).
>
> **Stack** : Next.js 16 + Supabase + Playwright + TypeScript
> **Modèle de rôles** : `user (0) < editor (1) < admin (2)` (TASK076)
> **Version** : 1.0 | **Date** : Mars 2026

---

## Table des matières

1. [Client Supabase de test (service_role)](#1-client-supabase-de-test-service_role)
2. [Patron de base des factories](#2-patron-de-base-des-factories)
3. [Fixture Playwright `seed.fixture.ts`](#3-fixture-playwright-seedfixturets)
4. [Stratégie de nommage et unicité](#4-stratégie-de-nommage-et-unicité)
5. [Gestion des BigInt IDs](#5-gestion-des-bigint-ids)
6. [Factories admin-only](#6-factories-admin-only)
7. [GlobalSetup pour reset en CI](#7-globalsetup-pour-reset-en-ci)
8. [Hiérarchie FK et ordre de cleanup](#8-hiérarchie-fk-et-ordre-de-cleanup)

---

## 1. Client Supabase de test (service_role)

Le client Supabase de test utilise la clé `service_role` pour **bypasser le RLS** (Row Level Security). Cela garantit que toutes les factories peuvent insérer et supprimer des données indépendamment du rôle du test qui s'exécute.

### Fichier : `e2e/helpers/db.ts`

```typescript
/**
 * Supabase service_role client for E2E test data management.
 * Bypasses RLS — used exclusively by test factories.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars for E2E tests',
    );
}

export const supabaseAdmin = createClient<Database>(
    SUPABASE_URL,
    SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
);
```

### Règles clés

| Règle | Détail |
| ------- | -------- |
| **Bypass RLS** | Les factories utilisent `service_role` pour bypasser le RLS. Cela permet aux tests `editorTest` et `adminTest` de disposer des **mêmes données de seed**, y compris pour les tables admin-only (`home_hero_slides`, `membres_equipe`, `partners`). |
| **Jamais côté client** | La clé `SUPABASE_SERVICE_ROLE_KEY` est exclusivement dans `.env.e2e` et n'est jamais exposée au navigateur Playwright. Elle est consommée uniquement dans le contexte Node.js des fixtures et factories. |
| **Pas de session** | `autoRefreshToken: false` et `persistSession: false` évitent toute interférence avec les sessions de test Supabase Auth. |
| **Typage** | Le client est typé avec `Database` depuis `@/lib/database.types` pour bénéficier de l'autocomplétion et du contrôle de types sur toutes les requêtes. |

### Variables `.env.e2e`

```bash
# Supabase local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# ⚠️ Ne JAMAIS utiliser la clé service_role de production dans .env.e2e
# ⚠️ Ne JAMAIS committer .env.e2e (ajouté à .gitignore)
```

---

## 2. Patron de base des factories

Chaque factory suit un patron identique avec 4 méthodes publiques (`build`, `create`, `createMany`, `cleanup`) et des conventions strictes.

### Structure canonique

```
e2e/factories/
├── index.ts                    # Barrel export
├── spectacles.factory.ts       # Editorial (editor-accessible)
├── lieux.factory.ts            # Editorial (editor-accessible)
├── evenements.factory.ts       # Editorial (FK → spectacles, lieux)
├── membres-equipe.factory.ts   # Admin-only
├── partners.factory.ts         # Admin-only
└── home-hero-slides.factory.ts # Admin-only
```

### Template de factory

```typescript
/**
 * Factory for `<table>` table (<access-level>).
 * Uses service_role client to bypass RLS regardless of the test role.
 */
import { supabaseAdmin } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type EntityInsert = Database['public']['Tables']['<table>']['Insert'];
type EntityRow = Database['public']['Tables']['<table>']['Row'];

const TEST_PREFIX = '[TEST]';

const DEFAULT_VALUES: Omit<EntityInsert, '<required_field>'> = {
    // Valeurs réalistes par défaut, préfixées [TEST] si textuel
};

let counter = 0;

function nextId(): number {
    counter += 1;
    return counter;
}

export const EntityFactory = {
    /**
     * Build insert payload without persisting.
     * Retourne un objet prêt à l'insertion — utile pour les assertions.
     */
    build(overrides: Partial<EntityInsert> = {}): EntityInsert {
        const seq = `${Date.now()}_${nextId()}`;
        return {
            ...DEFAULT_VALUES,
            name: `${TEST_PREFIX} Entity ${seq}`,
            ...overrides,
        };
    },

    /**
     * Insert a single row and return the created row.
     */
    async create(overrides: Partial<EntityInsert> = {}): Promise<EntityRow> {
        const payload = EntityFactory.build(overrides);
        const { data, error } = await supabaseAdmin
            .from('<table>')
            .insert(payload)
            .select()
            .single();

        if (error) throw new Error(`EntityFactory.create failed: ${error.message}`);
        return data;
    },

    /**
     * Insert multiple rows.
     */
    async createMany(
        count: number,
        overrides: Partial<EntityInsert> = {},
    ): Promise<EntityRow[]> {
        const payloads = Array.from({ length: count }, () =>
            EntityFactory.build(overrides),
        );
        const { data, error } = await supabaseAdmin
            .from('<table>')
            .insert(payloads)
            .select();

        if (error) throw new Error(`EntityFactory.createMany failed: ${error.message}`);
        return data;
    },

    /**
     * Delete all rows with the [TEST] prefix in the identifying column.
     */
    async cleanup(): Promise<void> {
        const { error } = await supabaseAdmin
            .from('<table>')
            .delete()
            .like('<identifying_column>', `${TEST_PREFIX}%`);

        if (error) throw new Error(`EntityFactory.cleanup failed: ${error.message}`);
    },
};
```

### Les 4 méthodes

| Méthode | Rôle | Persiste ? |
| --------- | ------ | ----------- |
| `build(overrides?)` | Construit le payload d'insertion sans écrire en BDD. Utilisé pour les assertions sur les données attendues. | Non |
| `create(overrides?)` | Insère une seule ligne, retourne la `Row` complète (avec `id`, `created_at`, etc.). | Oui |
| `createMany(count, overrides?)` | Insère `count` lignes en un seul batch. | Oui |
| `cleanup()` | Supprime toutes les lignes dont la colonne identifiante commence par `[TEST]`. | Oui (DELETE) |

### Factories avec dépendances FK

Quand une table a des FK obligatoires, la factory expose une méthode supplémentaire `createWithDependencies()` qui crée automatiquement les entités parentes.

**Exemple : `EvenementFactory`**

```typescript
export interface EvenementWithDeps {
    evenement: EvenementRow;
    spectacle: SpectacleRow;
    lieu: LieuRow | null;
}

export const EvenementFactory = {
    // build() et create() requièrent spectacle_id explicitement :
    build(overrides: Partial<EvenementInsert> & Pick<EvenementInsert, 'spectacle_id'>): EvenementInsert { /* ... */ },
    async create(overrides: Partial<EvenementInsert> & Pick<EvenementInsert, 'spectacle_id'>): Promise<EvenementRow> { /* ... */ },

    /**
     * Create an evenement with auto-generated spectacle (and optional lieu).
     * Évite au test de gérer les FK manuellement.
     */
    async createWithDependencies(
        overrides: Partial<EvenementInsert> = {},
        options: { withLieu?: boolean } = {},
    ): Promise<EvenementWithDeps> {
        const spectacle = await SpectacleFactory.create();
        const lieu = options.withLieu ? await LieuFactory.create() : null;

        const evenement = await EvenementFactory.create({
            spectacle_id: spectacle.id,
            lieu_id: lieu?.id ?? null,
            ...overrides,
        });

        return { evenement, spectacle, lieu };
    },

    /**
     * Cleanup cascade : evenements → spectacles → lieux.
     */
    async cleanup(): Promise<void> {
        // Supprimer les événements d'abord (FK enfant)
        // puis les spectacles et lieux (FK parents)
        await EvenementFactory.cleanupEventsOnly();
        await SpectacleFactory.cleanup();
        await LieuFactory.cleanup();
    },
};
```

---

## 3. Fixture Playwright `seed.fixture.ts`

La fixture de seed compose les factories avec le cycle de vie Playwright (`use()`) pour un **setup/teardown automatique**. Aucun `afterEach` explicite n'est nécessaire.

### Fichier : `e2e/fixtures/seed.fixture.ts`

```typescript
import { test as base } from '@playwright/test';
import {
    SpectacleFactory,
    LieuFactory,
    EvenementFactory,
    MembreEquipeFactory,
    PartnerFactory,
    HeroSlideFactory,
} from '../factories';
import type { Database } from '@/lib/database.types';

type SpectacleRow = Database['public']['Tables']['spectacles']['Row'];
type LieuRow = Database['public']['Tables']['lieux']['Row'];
type EvenementRow = Database['public']['Tables']['evenements']['Row'];
type MembreEquipeRow = Database['public']['Tables']['membres_equipe']['Row'];
type PartnerRow = Database['public']['Tables']['partners']['Row'];
type HeroSlideRow = Database['public']['Tables']['home_hero_slides']['Row'];

// ──────────────────────────────────────────────
// Types des données disponibles dans les tests
// ──────────────────────────────────────────────

export interface SeedSpectacle {
    spectacle: SpectacleRow;
}

export interface SeedEvenement {
    evenement: EvenementRow;
    spectacle: SpectacleRow;
    lieu: LieuRow | null;
}

export interface SeedAdminData {
    heroSlide: HeroSlideRow;
    membre: MembreEquipeRow;
    partner: PartnerRow;
}

// ──────────────────────────────────────────────
// Fixtures de seed (setup/teardown via use())
// ──────────────────────────────────────────────

/**
 * Fixture: un spectacle publié prêt à l'affichage.
 * Cleanup automatique en fin de test.
 */
export const seedSpectacleTest = base.extend<{ seedSpectacle: SeedSpectacle }>({
    seedSpectacle: async ({}, use) => {
        const spectacle = await SpectacleFactory.create({
            status: 'published',
            public: true,
        });

        await use({ spectacle });

        // Teardown : cleanup automatique
        await SpectacleFactory.cleanup();
    },
});

/**
 * Fixture: un événement futur avec spectacle publié et lieu.
 * Cleanup cascade automatique en fin de test.
 */
export const seedEvenementTest = base.extend<{ seedEvenement: SeedEvenement }>({
    seedEvenement: async ({}, use) => {
        const { evenement, spectacle, lieu } = await EvenementFactory.createWithDependencies(
            {
                // Les événements de test sont toujours dans le futur
                date_debut: futureDate(30),
                status: 'planifie',
            },
            { withLieu: true },
        );

        await use({ evenement, spectacle, lieu });

        // Teardown cascade : evenements → spectacles → lieux
        await EvenementFactory.cleanup();
    },
});

/**
 * Fixture: données admin-only (hero slide, membre, partenaire).
 * Utilise service_role donc fonctionne avec editorTest ET adminTest.
 * Cleanup automatique en fin de test.
 */
export const seedAdminDataTest = base.extend<{ seedAdminData: SeedAdminData }>({
    seedAdminData: async ({}, use) => {
        const [heroSlide, membre, partner] = await Promise.all([
            HeroSlideFactory.create({ active: true }),
            MembreEquipeFactory.create({ active: true }),
            PartnerFactory.create({ is_active: true }),
        ]);

        await use({ heroSlide, membre, partner });

        // Teardown en parallèle (pas de FK entre ces tables)
        await Promise.all([
            HeroSlideFactory.cleanup(),
            MembreEquipeFactory.cleanup(),
            PartnerFactory.cleanup(),
        ]);
    },
});

// ──────────────────────────────────────────────
// Helper
// ──────────────────────────────────────────────

function futureDate(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString();
}
```

### Composition avec les fixtures auth

Les fixtures de seed se composent avec les fixtures d'authentification existantes (`adminTest`, `editorTest`, `userTest`) grâce au mergeTests de Playwright.

```typescript
// e2e/tests/admin/spectacles/spectacles.fixtures.ts
import { mergeTests } from '@playwright/test';
import { editorTest, expect } from '../../../fixtures/auth.fixture';
import { seedSpectacleTest } from '../../../fixtures/seed.fixture';
import { SpectaclesPage } from '../../../pages/admin/spectacles.page';

// Compose auth (editorTest) + seed (seedSpectacleTest)
const composedTest = mergeTests(editorTest, seedSpectacleTest);

type SpectaclesFixtures = {
    spectaclesPage: SpectaclesPage;
};

export const test = composedTest.extend<SpectaclesFixtures>({
    spectaclesPage: async ({ editorPage }, use) => {
        await use(new SpectaclesPage(editorPage));
    },
});

export { expect };
```

### Utilisation dans un test

```typescript
// e2e/tests/admin/spectacles/spectacles.spec.ts
import { test, expect } from './spectacles.fixtures';

test.describe('Gestion des spectacles', () => {
    test('affiche le spectacle créé par le seed', async ({
        spectaclesPage,
        seedSpectacle,     // ← données injectées par la fixture
    }) => {
        await spectaclesPage.goto();

        // Vérifier que le spectacle seedé apparaît dans la liste
        await expect(
            spectaclesPage.page.getByRole('cell', { name: seedSpectacle.spectacle.title }),
        ).toBeVisible();
    });
});
```

### Cycle de vie

```
┌─────────────────────────────────────────────────────────────┐
│                  CYCLE DE VIE D'UN TEST                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Setup fixture auth  → Login Supabase (Navigateur)       │
│  2. Setup fixture seed  → Factory.create() (service_role)   │
│  3. Exécution du test   → Page Object + assertions          │
│  4. Teardown seed       → Factory.cleanup() (service_role)  │
│  5. Teardown auth       → Session terminée                  │
│                                                             │
│  Tout est automatique grâce à use().                        │
│  Pas besoin de afterEach/afterAll explicite.                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Stratégie de nommage et unicité

### Convention `[TEST]`

Toutes les données créées par les factories portent le préfixe `[TEST]` dans leur champ textuel identifiant. Ce préfixe sert à :

1. **Identifier visuellement** les données de test dans la base locale
2. **Cibler le cleanup** : `DELETE ... WHERE title LIKE '[TEST]%'`
3. **Éviter les collisions** avec les données réelles (seeds manuels, données de démo)

### Unicité avec `Date.now()` + compteur

Chaque valeur générée est unique grâce à la combinaison `${Date.now()}_${nextId()}` :

```typescript
const seq = `${Date.now()}_${nextId()}`;

// Exemples de valeurs générées :
// title: "[TEST] Spectacle 1710500000000_1"
// slug:  "test-spectacle-1710500000000_1"
// name:  "[TEST] Partenaire 1710500000000_2"
```

| Composant | Rôle |
| ----------- | ------ |
| `[TEST]` | Préfixe de marquage pour le cleanup par `LIKE` |
| `Date.now()` | Unicité inter-runs (évite conflit entre exécutions parallèles) |
| `nextId()` | Compteur incrémental — unicité intra-run (multiple `build()` dans le même ms) |

### Slugs

Les slugs suivent le même pattern sans le préfixe `[TEST]` (qui contient des crochets invalides) :

```typescript
slug: `test-spectacle-${seq}`,        // ✅ URL-safe
slug: `test-hero-slide-${seq}`,       // ✅ URL-safe
```

### Champ identifiant par table

| Table | Champ du préfixe `[TEST]` | Pattern de cleanup |
| ------- | --------------------------- | ------------------- |
| `spectacles` | `title` | `.like('title', '[TEST]%')` |
| `lieux` | `nom` | `.like('nom', '[TEST]%')` |
| `evenements` | — (pas de champ texte propre) | Cascade via `spectacle_id` |
| `membres_equipe` | `name` | `.like('name', '[TEST]%')` |
| `partners` | `name` | `.like('name', '[TEST]%')` |
| `home_hero_slides` | `title` | `.like('title', '[TEST]%')` |

---

## 5. Gestion des BigInt IDs

Supabase utilise `bigint generated always as identity` pour toutes les tables du projet. Les ID sont de type `bigint` en base, retournés comme `number` par le client `@supabase/supabase-js`.

### Règles

```typescript
// ✅ CORRECT : extraire l'ID depuis l'entité retournée
const spectacle = await SpectacleFactory.create();
const evenement = await EvenementFactory.create({
    spectacle_id: spectacle.id,    // ← extrait depuis la Row
});

// ❌ INCORRECT : hard-coder un ID
const evenement = await EvenementFactory.create({
    spectacle_id: 42,              // ← jamais de hard-code
});
```

### Propagation des IDs dans les dépendances FK

```typescript
// Créer un spectacle, puis 3 événements rattachés
const spectacle = await SpectacleFactory.create();
const evenements = await EvenementFactory.createMany(3, {
    spectacle_id: spectacle.id,    // ← propagé depuis le parent
});

// Avec createWithDependencies(), les IDs sont encapsulés
const { evenement, spectacle, lieu } = await EvenementFactory.createWithDependencies(
    {},
    { withLieu: true },
);

// L'objet retourné contient les IDs extraits :
console.log(evenement.id);          // bigint — ID de l'événement
console.log(evenement.spectacle_id); // bigint — FK vers spectacles
console.log(spectacle.id);          // bigint — ID du spectacle
console.log(lieu?.id);               // bigint | undefined — ID du lieu
```

### Dans les assertions

```typescript
test('the event links to its spectacle', async ({ seedEvenement }) => {
    const { evenement, spectacle } = seedEvenement;

    // Comparer des IDs retournés, jamais hard-codés
    expect(evenement.spectacle_id).toBe(spectacle.id);
});
```

---

## 6. Factories admin-only

Certaines tables sont protégées par des policies RLS admin-only :

| Table | Policy RLS (écriture) | Factory |
| ------- | ---------------------- | --------- |
| `home_hero_slides` | `is_admin()` — INSERT/UPDATE/DELETE | `HeroSlideFactory` |
| `membres_equipe` | `is_admin()` — INSERT/UPDATE/DELETE | `MembreEquipeFactory` |
| `partners` | `is_admin()` — INSERT/UPDATE/DELETE | `PartnerFactory` |

### Le problème

Un test `editorTest` (rôle `editor`) qui a besoin de vérifier l'affichage public de hero slides, de membres d'équipe ou de partenaires ne peut pas insérer ces données via le client Supabase de l'éditeur (bloqué par RLS).

### La solution : service_role dans toutes les factories

**Toutes les factories** utilisent `supabaseAdmin` (client `service_role`) pour insérer les données. Le RLS est bypassé côté seed, et le test peut ensuite vérifier le comportement UI avec le rôle approprié.

```
┌──────────────────────────────────────────────────────────────┐
│         SEED (service_role)  ≠  TEST (rôle utilisateur)      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Factory (Node.js)         Test (Navigateur Playwright)      │
│  ────────────────          ─────────────────────────         │
│  supabaseAdmin             editorPage / adminPage            │
│  service_role key          Cookie session Supabase Auth      │
│  Bypass RLS ✅             Soumis au RLS ✅                  │
│                                                              │
│  Insère dans :             Consulte via :                    │
│  - home_hero_slides ✅     - GET /api/... (anon)             │
│  - membres_equipe  ✅     - Page publique (SSR)              │
│  - partners        ✅     - Admin backoffice (auth)          │
│  - spectacles      ✅                                        │
│  - lieux           ✅                                        │
│  - evenements      ✅                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Exemple concret

```typescript
// e2e/tests/public/home/home.fixtures.ts
import { test as base, expect } from '@playwright/test';
import { seedAdminDataTest } from '../../../fixtures/seed.fixture';
import { mergeTests } from '@playwright/test';

// Page publique : pas d'auth nécessaire, mais seed admin-only
const composedTest = mergeTests(base, seedAdminDataTest);

export const test = composedTest.extend({});
export { expect };
```

```typescript
// e2e/tests/public/home/home.spec.ts
import { test, expect } from './home.fixtures';

test.describe('Page d\'accueil publique', () => {
    test('affiche le hero slide actif', async ({ page, seedAdminData }) => {
        await page.goto('/');

        // Le hero slide a été seedé via service_role (admin-only table)
        // mais est visible publiquement (SELECT policy anon: active = true)
        await expect(
            page.getByRole('heading', { name: seedAdminData.heroSlide.title }),
        ).toBeVisible();
    });

    test('affiche les partenaires actifs', async ({ page, seedAdminData }) => {
        await page.goto('/');

        await expect(
            page.getByText(seedAdminData.partner.name),
        ).toBeVisible();
    });
});
```

---

## 7. GlobalSetup pour reset en CI

En CI, le `globalSetup` nettoie toutes les données `[TEST]` avant chaque run pour partir d'un état propre. Cela protège contre les données orphelines de runs précédents échoués.

### Fichier : `e2e/global-setup.ts`

```typescript
/**
 * Global setup for E2E tests.
 * Cleans up all [TEST] data before the test suite runs.
 * Ensures a clean slate in CI environments.
 */
import { supabaseAdmin } from './helpers/db';

const TEST_PREFIX = '[TEST]';

async function globalSetup(): Promise<void> {
    console.log('[E2E Global Setup] Cleaning up stale test data...');

    // Ordre de cleanup respectant les FK (enfants d'abord)
    // Voir §8 pour la hiérarchie complète

    // 1. Tables enfants (FK vers spectacles)
    const { error: evtError } = await supabaseAdmin
        .from('evenements')
        .delete()
        .not('id', 'is', null); // Supprimer les événements liés aux spectacles [TEST]

    // Fallback : suppression sélective si la suppression globale échoue
    if (evtError) {
        const { data: testSpectacles } = await supabaseAdmin
            .from('spectacles')
            .select('id')
            .like('title', `${TEST_PREFIX}%`);

        if (testSpectacles?.length) {
            await supabaseAdmin
                .from('evenements')
                .delete()
                .in('spectacle_id', testSpectacles.map((s) => s.id));
        }
    }

    // 2. Tables parents (editorial)
    await supabaseAdmin.from('spectacles').delete().like('title', `${TEST_PREFIX}%`);
    await supabaseAdmin.from('lieux').delete().like('nom', `${TEST_PREFIX}%`);

    // 3. Tables admin-only (indépendantes)
    await Promise.all([
        supabaseAdmin.from('home_hero_slides').delete().like('title', `${TEST_PREFIX}%`),
        supabaseAdmin.from('membres_equipe').delete().like('name', `${TEST_PREFIX}%`),
        supabaseAdmin.from('partners').delete().like('name', `${TEST_PREFIX}%`),
    ]);

    console.log('[E2E Global Setup] Cleanup complete.');
}

export default globalSetup;
```

### Configuration Playwright

```typescript
// playwright.config.ts (extrait)
import { defineConfig } from '@playwright/test';

export default defineConfig({
    // ...
    globalSetup: require.resolve('./e2e/global-setup'),
    // ...
});
```

### Quand s'exécute le globalSetup ?

| Environnement | Comportement |
| --------------- | ------------- |
| **CI** (`process.env.CI`) | Nettoyage complet avant chaque run. Base propre garantie. |
| **Local** | Optionnel — les fixtures Playwright gèrent le teardown via `use()`. Le globalSetup peut être activé si la base devient "polluée" après des runs interrompus. |

---

## 8. Hiérarchie FK et ordre de cleanup

Le nettoyage des données de test doit respecter l'ordre inverse des dépendances FK (enfants d'abord, parents ensuite).

### Arbre des dépendances

```
                    ┌───────────────┐
                    │    medias     │
                    └──────┬────────┘
                           │ (FK optionnelle)
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐  ┌───────────────┐  ┌──────────┐
     │ membres  │  │  home_hero    │  │ partners │
     │ _equipe  │  │  _slides      │  │          │
     └──────────┘  └───────────────┘  └──────────┘
     (admin-only)    (admin-only)      (admin-only)

     ┌──────────┐
     │  lieux   │
     └────┬─────┘
          │ (FK optionnelle)
          ▼
     ┌──────────────┐         ┌──────────────┐
     │  evenements  │────────→│  spectacles  │
     └──────────────┘ (FK     └──────────────┘
                      obligatoire)
```

### Ordre de cleanup

```
1. evenements           (FK → spectacles, lieux)
2. spectacles           (parent d'evenements)
3. lieux                (parent optionnel d'evenements)
4. home_hero_slides     (indépendant)
5. membres_equipe       (indépendant)
6. partners             (indépendant)
```

> **Règle** : Les tables 4/5/6 n'ont pas de FK entre elles et peuvent être nettoyées en parallèle (`Promise.all`).

---

## Annexe A — Récapitulatif des factories existantes

| Factory | Table | Niveau | Méthodes |
| --------- | ------- | -------- | ---------- |
| `SpectacleFactory` | `spectacles` | Editorial (editor+) | `build`, `create`, `createMany`, `cleanup` |
| `LieuFactory` | `lieux` | Editorial (editor+) | `build`, `create`, `createMany`, `cleanup` |
| `EvenementFactory` | `evenements` | Editorial (editor+) | `build`, `create`, `createMany`, `createWithDependencies`, `cleanup`, `cleanupEventsOnly` |
| `MembreEquipeFactory` | `membres_equipe` | Admin-only | `build`, `create`, `createMany`, `cleanup` |
| `PartnerFactory` | `partners` | Admin-only | `build`, `create`, `createMany`, `cleanup` |
| `HeroSlideFactory` | `home_hero_slides` | Admin-only | `build`, `create`, `createMany`, `cleanup` |

## Annexe B — Checklist nouvelle factory

- [ ] Fichier dans `e2e/factories/<table>.factory.ts`
- [ ] Import `supabaseAdmin` depuis `../helpers/db`
- [ ] Types `Insert` / `Row` depuis `Database['public']['Tables']`
- [ ] Constante `TEST_PREFIX = '[TEST]'`
- [ ] Compteur local (`let counter = 0` + `nextId()`)
- [ ] `DEFAULT_VALUES` réalistes avec `[TEST]` dans les champs texte
- [ ] Unicité : `${Date.now()}_${nextId()}` dans les slugs/noms
- [ ] 4 méthodes : `build`, `create`, `createMany`, `cleanup`
- [ ] Si FK obligatoire : méthode `createWithDependencies()`
- [ ] Export depuis `e2e/factories/index.ts`
- [ ] Dates des événements toujours dans le futur (`futureDate(offset)`)

## Annexe C — Compatibilité avec les fixtures auth

| Fixture auth | Rôle navigateur | Factories autorisées via service_role |
| ------------- | ----------------- | -------------------------------------- |
| `adminTest` | admin | Toutes (admin + editorial) |
| `editorTest` | editor | Toutes (admin + editorial) — le seed bypass RLS |
| `userTest` | user | Toutes — mais l'UI bloquera l'accès backoffice |
| `base` (Playwright) | anonyme | Toutes — pour tester les pages publiques |

> Le seed (service_role) est découplé du rôle du navigateur.
> N'importe quel fixture auth peut disposer de n'importe quelle donnée seedée.
