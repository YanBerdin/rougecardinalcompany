# E2E Seed Strategy — Rouge Cardinal Company

> Stratégie de gestion des données de test pour les tests E2E
> Stack : Next.js 16 + Supabase + Playwright
> Référence : `E2E_Tests_QuickReference_RCC.md`

---

## Principes

- **Isolation** : chaque test part d'un état connu et reproductible
- **Pas de pollution** : les données de test ne survivent pas au-delà du test qui les crée
- **Typage fort** : les factories utilisent les types Supabase générés (`database.types.ts`)
- **Dépendances respectées** : l'ordre d'insertion suit les contraintes FK (lieu → spectacle → événement)
- **Base locale uniquement** : Supabase local sur `http://localhost:54321` — jamais la prod

---

## Structure des fichiers

```bash
e2e/
├── fixtures/
│   ├── auth.fixture.ts          # Auth Supabase (voir E2E_Auth_Setup_RCC.md)
│   └── seed.fixture.ts          # Fixture de seed principale
├── factories/
│   ├── index.ts                 # Export centralisé
│   ├── spectacle.factory.ts
│   ├── lieu.factory.ts
│   ├── event.factory.ts
│   ├── team-member.factory.ts
│   ├── partner.factory.ts
│   └── hero-slide.factory.ts
└── helpers/
    └── db.ts                    # Client Supabase dédié aux tests
```

---

## Client Supabase de test (`e2e/helpers/db.ts`)

Client admin (service_role) pour les opérations de seed — bypass RLS.

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Service role pour bypasser RLS en test
export const testDb = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ jamais exposé côté client
  { auth: { persistSession: false } }
);

// Helper de nettoyage générique
export async function cleanTable(
  table: keyof Database['public']['Tables'],
  where: Record<string, unknown>
) {
  const { error } = await testDb.from(table).delete().match(where);
  if (error) throw new Error(`Clean ${table} failed: ${error.message}`);
}
```

Ajouter dans `.env.e2e` :
```bash
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

---

## Factories

### Patron de base

Chaque factory suit le même contrat :
- `build(overrides?)` → objet en mémoire (pas d'insertion)
- `create(overrides?)` → insère en base et retourne l'entité créée
- `createMany(count, overrides?)` → insère N entités
- Toutes les entités créées ont `_test: true` pour faciliter le nettoyage

> ⚠️ Le champ `_test` n'existe pas en base — utiliser un préfixe dans les données
> (ex: `title: '[TEST] Mon spectacle'`) ou une colonne dédiée si le schéma le permet.

---

### Lieu (`e2e/factories/lieu.factory.ts`)

```ts
import { testDb } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type LieuInsert = Database['public']['Tables']['lieux']['Insert'];
type Lieu = Database['public']['Tables']['lieux']['Row'];

let counter = 0;

export const lieuFactory = {
  build(overrides: Partial<LieuInsert> = {}): LieuInsert {
    counter++;
    return {
      nom: `[TEST] Lieu ${counter}`,
      ville: 'Paris',
      code_postal: '75001',
      adresse: `${counter} rue de la Paix`,
      capacite: 200,
      ...overrides,
    };
  },

  async create(overrides: Partial<LieuInsert> = {}): Promise<Lieu> {
    const data = this.build(overrides);
    const { data: lieu, error } = await testDb
      .from('lieux')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`lieuFactory.create failed: ${error.message}`);
    return lieu;
  },

  async createMany(count: number, overrides: Partial<LieuInsert> = {}): Promise<Lieu[]> {
    return Promise.all(Array.from({ length: count }, () => this.create(overrides)));
  },

  async cleanup() {
    await testDb.from('lieux').delete().like('nom', '[TEST]%');
  },
};
```

---

### Spectacle (`e2e/factories/spectacle.factory.ts`)

```ts
import { testDb } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type SpectacleInsert = Database['public']['Tables']['spectacles']['Insert'];
type Spectacle = Database['public']['Tables']['spectacles']['Row'];

let counter = 0;

export const spectacleFactory = {
  build(overrides: Partial<SpectacleInsert> = {}): SpectacleInsert {
    counter++;
    return {
      titre: `[TEST] Spectacle ${counter}`,
      genre: 'Théâtre',
      duree_minutes: 90,
      description: 'Description de test',
      statut: 'publie',
      is_visible: true,
      slug: `test-spectacle-${counter}-${Date.now()}`,
      ...overrides,
    };
  },

  async create(overrides: Partial<SpectacleInsert> = {}): Promise<Spectacle> {
    const data = this.build(overrides);
    const { data: spectacle, error } = await testDb
      .from('spectacles')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`spectacleFactory.create failed: ${error.message}`);
    return spectacle;
  },

  async createMany(count: number, overrides: Partial<SpectacleInsert> = {}): Promise<Spectacle[]> {
    return Promise.all(Array.from({ length: count }, () => this.create(overrides)));
  },

  async cleanup() {
    await testDb.from('spectacles').delete().like('titre', '[TEST]%');
  },
};
```

---

### Événement (`e2e/factories/event.factory.ts`)

Dépend de `lieuFactory` et `spectacleFactory` — respecter l'ordre de création.

```ts
import { testDb } from '../helpers/db';
import { lieuFactory } from './lieu.factory';
import { spectacleFactory } from './spectacle.factory';
import type { Database } from '@/lib/database.types';

type EventInsert = Database['public']['Tables']['evenements']['Insert'];
type Event = Database['public']['Tables']['evenements']['Row'];

let counter = 0;

export const eventFactory = {
  build(
    spectacleId: bigint,
    lieuId: bigint,
    overrides: Partial<EventInsert> = {}
  ): EventInsert {
    counter++;
    const date = new Date();
    date.setDate(date.getDate() + counter + 7); // toujours dans le futur
    return {
      spectacle_id: spectacleId,
      lieu_id: lieuId,
      date_heure: date.toISOString(),
      statut: 'programme',
      ...overrides,
    };
  },

  // Crée spectacle + lieu + événement en une seule opération
  async createWithDependencies(
    overrides: Partial<EventInsert> = {}
  ): Promise<{ event: Event; spectacle: any; lieu: any }> {
    const spectacle = await spectacleFactory.create();
    const lieu = await lieuFactory.create();
    const data = this.build(spectacle.id, lieu.id, overrides);
    const { data: event, error } = await testDb
      .from('evenements')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`eventFactory.create failed: ${error.message}`);
    return { event, spectacle, lieu };
  },

  async cleanup() {
    // Supprimer dans l'ordre inverse des dépendances FK
    await testDb.from('evenements').delete().in(
      'spectacle_id',
      await testDb
        .from('spectacles')
        .select('id')
        .like('titre', '[TEST]%')
        .then(r => (r.data ?? []).map(s => s.id))
    );
  },
};
```

---

### Membre équipe (`e2e/factories/team-member.factory.ts`)

```ts
import { testDb } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type MemberInsert = Database['public']['Tables']['membres_equipe']['Insert'];
type Member = Database['public']['Tables']['membres_equipe']['Row'];

let counter = 0;

export const teamMemberFactory = {
  build(overrides: Partial<MemberInsert> = {}): MemberInsert {
    counter++;
    return {
      prenom: '[TEST]',
      nom: `Membre ${counter}`,
      role: 'Comédien·ne',
      bio: 'Bio de test',
      is_active: true,
      ordre: counter,
      ...overrides,
    };
  },

  async create(overrides: Partial<MemberInsert> = {}): Promise<Member> {
    const data = this.build(overrides);
    const { data: member, error } = await testDb
      .from('membres_equipe')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`teamMemberFactory.create failed: ${error.message}`);
    return member;
  },

  async cleanup() {
    await testDb.from('membres_equipe').delete().eq('prenom', '[TEST]');
  },
};
```

---

## Fixture de seed (`e2e/fixtures/seed.fixture.ts`)

Compose les factories dans une fixture Playwright réutilisable.

```ts
import { test as base } from '@playwright/test';
import { lieuFactory } from '../factories/lieu.factory';
import { spectacleFactory } from '../factories/spectacle.factory';
import { eventFactory } from '../factories/event.factory';
import { teamMemberFactory } from '../factories/team-member.factory';

type SeedFixtures = {
  seedLieu: Awaited<ReturnType<typeof lieuFactory.create>>;
  seedSpectacle: Awaited<ReturnType<typeof spectacleFactory.create>>;
  seedEvent: Awaited<ReturnType<typeof eventFactory.createWithDependencies>>;
  seedMember: Awaited<ReturnType<typeof teamMemberFactory.create>>;
};

export const seedTest = base.extend<SeedFixtures>({
  seedLieu: async ({}, use) => {
    const lieu = await lieuFactory.create();
    await use(lieu);
    await lieuFactory.cleanup();
  },

  seedSpectacle: async ({}, use) => {
    const spectacle = await spectacleFactory.create();
    await use(spectacle);
    await spectacleFactory.cleanup();
  },

  seedEvent: async ({}, use) => {
    const result = await eventFactory.createWithDependencies();
    await use(result);
    await eventFactory.cleanup();
    await spectacleFactory.cleanup();
    await lieuFactory.cleanup();
  },

  seedMember: async ({}, use) => {
    const member = await teamMemberFactory.create();
    await use(member);
    await teamMemberFactory.cleanup();
  },
});

export { expect } from '@playwright/test';
```

---

## Composition auth + seed

Pour les tests admin nécessitant des données :

```ts
// e2e/tests/admin/agenda/agenda.fixtures.ts
import { authTest } from '../../../fixtures/auth.fixture';
import { seedTest } from '../../../fixtures/seed.fixture';
import { AgendaPage } from '../../../pages/admin/agenda.page';

// Composer les deux fixtures
const test = authTest.extend(seedTest.info().options ?? {});

export const agendaTest = test.extend<{ agendaPage: AgendaPage }>({
  agendaPage: async ({ adminPage }, use) => {
    await use(new AgendaPage(adminPage));
  },
});
```

Utilisation dans la spec :

```ts
// e2e/tests/admin/agenda/agenda.spec.ts
import { agendaTest as test, expect } from './agenda.fixtures';

test('affiche un événement existant', async ({ agendaPage, seedEvent }) => {
  await agendaPage.goto();
  await agendaPage.expectEventVisible(seedEvent.spectacle.titre);
});
```

---

## Reset global en CI

Dans `playwright.config.ts`, ajouter un `globalSetup` pour reset la base locale avant chaque run CI :

```ts
// e2e/global-setup.ts
import { testDb } from './helpers/db';

export default async function globalSetup() {
  if (process.env.CI) {
    // Nettoyer toutes les données [TEST] résiduelles
    await testDb.from('evenements').delete().neq('id', 0);  // adapter selon besoin
    console.log('[E2E] Base de test nettoyée');
  }
}
```

```ts
// playwright.config.ts
export default defineConfig({
  globalSetup: './e2e/global-setup.ts',
  // ...
});
```

---

## Règles critiques

- **Préfixe `[TEST]`** sur toutes les données créées par les factories — facilite le debug et le nettoyage manuel
- **Slugs uniques** — ajouter `Date.now()` pour éviter les collisions entre runs parallèles
- **Dates futures** — les événements doivent toujours être dans le futur pour apparaître dans l'agenda public
- **BigInt IDs** — accéder via `entity.id` depuis le retour de factory, jamais hard-codé
- **Cleanup dans `afterEach` implicite** — les fixtures Playwright appellent le cleanup automatiquement après `use()`
- **Service role key** — uniquement dans `.env.e2e`, jamais commité, jamais dans le code client
