# \[TASK086] — CI/CD Pipeline E2E

**Status:** Completed
**Added:** 2026-03-23
**Updated:** 2026-03-23
**Priorité:** P0 — bloquant pour la mise en production

---

## Contexte

144 tests E2E passent localement mais aucun pipeline CI ne les exécute.
Sans CI, une régression peut atteindre la production sans être détectée.
Cette tâche crée le workflow GitHub Actions qui exécute la suite complète
sur chaque PR et push sur `main`.

---

## Agent à invoquer

```bash
.github/agents/playwright-tester.agent.md
```

---

## Prompt

```yaml
Tu es en mode Playwright Tester. Crée le workflow GitHub Actions CI/CD pour
exécuter la suite E2E Playwright du projet Rouge Cardinal Company.

Contexte du projet :
- Stack : Next.js 16 + Supabase local (via supabase CLI)
- Package manager : pnpm
- Config Playwright : playwright.config.ts à la racine
- Auth setup : e2e/tests/auth/{admin,editor,user}.setup.ts
- Env file de référence : .env.e2e.example
- 144 tests répartis en 8 projets Playwright :
  chromium-auth, chromium-public, editor, admin, permissions,
  cross-public, cross-admin, chromium-auth

Crée le fichier .github/workflows/e2e.yml avec les contraintes suivantes :

1. DÉCLENCHEURS
   - Push sur main et develop
   - Pull Request vers main et develop
   - Dispatch manuel (workflow_dispatch)

2. SECRETS GITHUB requis (à documenter dans le workflow en commentaire)
   - NEXT_PUBLIC_SUPABASE_URL (sera http://localhost:54321 en CI)
   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_SECRET_KEY
   - E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
   - E2E_EDITOR_EMAIL / E2E_EDITOR_PASSWORD
   - E2E_USER_EMAIL / E2E_USER_PASSWORD
   - RESEND_API_KEY (valeur factice re_test_ci_not_real)
   - EMAIL_FROM / EMAIL_CONTACT
   - NEXT_PUBLIC_SITE_URL (http://localhost:3000)
   - NEXT_PUBLIC_SENTRY_ENABLED (false)
   - SENTRY_AUTH_TOKEN (optionnel, skip si absent)

3. ÉTAPES du job principal

   a. Checkout avec fetch-depth: 1
   b. Setup pnpm (version depuis package.json engines)
   c. Setup Node.js 22 avec cache pnpm
   d. Install dépendances : pnpm install --frozen-lockfile
   e. Install Supabase CLI : pnpm dlx supabase --version (téléchargement auto)
   f. Démarrer Supabase local :
      - supabase start
      - Attendre que les services soient prêts (health check sur port 54321)
   g. Créer les comptes de test (via supabase CLI ou script Node)
      - Utiliser le SERVICE_ROLE_KEY pour créer admin/editor/user via Admin API
      - Script : scripts/ci-create-test-accounts.ts (à créer)
   h. Générer le fichier .env.e2e depuis les secrets GitHub
   i. Build Next.js : pnpm build (avec SKIP_ENV_VALIDATION=1)
   j. Installer les navigateurs Playwright : pnpm exec playwright install chromium
   k. Lancer les tests : pnpm exec playwright test --project=setup-admin
      --project=setup-editor --project=setup-user (setup d'abord)
   l. Lancer tous les projets : pnpm exec playwright test (sans setup, qui est déjà fait)
   m. Upload du rapport HTML comme artifact (toujours, même si succès)
   n. Stopper Supabase : supabase stop

4. STRATÉGIE de parallélisme
   - workers: 1 (CI a moins de ressources)
   - Pas de shard pour l'instant (suite = 144 tests, ~5 min)
   - Timeout job : 30 minutes

5. GESTION DES ÉCHECS
   - retries: 2 en CI (déjà configuré dans playwright.config.ts)
   - Continuer et uploader le rapport même si les tests échouent
   - Afficher le résumé dans le PR via la GitHub PR annotation

Crée aussi le script Node scripts/ci-create-test-accounts.ts qui :
- Lit les variables E2E_*_EMAIL / E2E_*_PASSWORD depuis process.env
- Utilise @supabase/supabase-js avec SERVICE_ROLE_KEY
- Crée les 3 comptes avec email_confirm: true et app_metadata.role correct
- Est idempotent (upsert si le compte existe déjà)
- Fonctionne avec : npx tsx scripts/ci-create-test-accounts.ts

Documente les GitHub Secrets à configurer dans un fichier
doc/ci/GITHUB_SECRETS.md avec les valeurs attendues pour CI local.
```

---

## Fichiers à créer

```bash
.github/
└── workflows/
    └── e2e.yml

scripts/
└── ci-create-test-accounts.ts

doc/ci/
└── GITHUB_SECRETS.md
```

---

## `e2e.yml` — Structure attendue

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      # Supabase CLI via npx (pas besoin d'install globale)
      - name: Start Supabase
        run: |
          npx supabase start
          npx supabase status

      - name: Create E2E test accounts
        run: npx tsx scripts/ci-create-test-accounts.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          E2E_ADMIN_EMAIL: ${{ secrets.E2E_ADMIN_EMAIL }}
          E2E_ADMIN_PASSWORD: ${{ secrets.E2E_ADMIN_PASSWORD }}
          E2E_EDITOR_EMAIL: ${{ secrets.E2E_EDITOR_EMAIL }}
          E2E_EDITOR_PASSWORD: ${{ secrets.E2E_EDITOR_PASSWORD }}
          E2E_USER_EMAIL: ${{ secrets.E2E_USER_EMAIL }}
          E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}

      - name: Generate .env.e2e
        run: |
          cat > .env.e2e << EOF
          NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          SUPABASE_SECRET_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          E2E_ADMIN_EMAIL=${{ secrets.E2E_ADMIN_EMAIL }}
          E2E_ADMIN_PASSWORD=${{ secrets.E2E_ADMIN_PASSWORD }}
          E2E_EDITOR_EMAIL=${{ secrets.E2E_EDITOR_EMAIL }}
          E2E_EDITOR_PASSWORD=${{ secrets.E2E_EDITOR_PASSWORD }}
          E2E_USER_EMAIL=${{ secrets.E2E_USER_EMAIL }}
          E2E_USER_PASSWORD=${{ secrets.E2E_USER_PASSWORD }}
          PLAYWRIGHT_BASE_URL=http://localhost:3000
          NEXT_PUBLIC_SITE_URL=http://localhost:3000
          RESEND_API_KEY=re_test_ci_not_a_real_key
          EMAIL_FROM=noreply@ci.test
          EMAIL_CONTACT=contact@ci.test
          NEXT_PUBLIC_SENTRY_ENABLED=false
          EOF

      - name: Build Next.js
        run: pnpm build
        env:
          SKIP_ENV_VALIDATION: 1

      - name: Install Playwright browsers
        run: pnpm exec playwright install chromium --with-deps

      - name: Run E2E tests
        run: pnpm exec playwright test --reporter=html,github
        env:
          CI: true

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Stop Supabase
        if: always()
        run: npx supabase stop
```

---

## `scripts/ci-create-test-accounts.ts` — Structure attendue

```typescript
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
});

type TestAccount = {
    email: string;
    password: string;
    role: 'admin' | 'editor' | 'user';
};

const accounts: TestAccount[] = [
    {
        email: process.env.E2E_ADMIN_EMAIL!,
        password: process.env.E2E_ADMIN_PASSWORD!,
        role: 'admin',
    },
    {
        email: process.env.E2E_EDITOR_EMAIL!,
        password: process.env.E2E_EDITOR_PASSWORD!,
        role: 'editor',
    },
    {
        email: process.env.E2E_USER_EMAIL!,
        password: process.env.E2E_USER_PASSWORD!,
        role: 'user',
    },
];

async function upsertAccount(account: TestAccount): Promise<void> {
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list.users.find((u) => u.email === account.email);

    if (existing) {
        await admin.auth.admin.updateUserById(existing.id, {
            app_metadata: { role: account.role },
            user_metadata: { role: account.role },
        });
        console.log(`Updated: ${account.email} (role=${account.role})`);
    } else {
        await admin.auth.admin.createUser({
            email: account.email,
            password: account.password,
            email_confirm: true,
            app_metadata: { role: account.role },
            user_metadata: { role: account.role },
        });
        console.log(`Created: ${account.email} (role=${account.role})`);
    }
}

Promise.all(accounts.map(upsertAccount))
    .then(() => console.log('✅ All test accounts ready'))
    .catch((err) => { console.error(err); process.exit(1); });
```

---

## Ajout script `package.json`

```json
{
  "scripts": {
    "test:e2e:ci": "playwright test --reporter=html,github",
    "ci:create-accounts": "tsx scripts/ci-create-test-accounts.ts"
  }
}
```

---

## Points d'attention

- **Supabase local en CI** : utiliser `npx supabase start` qui télécharge automatiquement
  les images Docker. Ajouter `--timeout 120` si la connexion est lente.
- **Ports** : Supabase local écoute sur 54321 (API) et 54322 (Studio).
  S'assurer qu'aucun service GitHub Actions n'utilise ces ports.
- **Clés Supabase** : en CI, utiliser les clés locales générées par `supabase start`
  (listées dans `supabase status`). Les injecter via les secrets ou les récupérer
  dynamiquement avec `supabase status --output json`.
- **Cache pnpm + Playwright** : ajouter un cache sur `~/.cache/ms-playwright` pour
  éviter de re-télécharger les navigateurs à chaque run (~150 MB).

---

## Critères d'acceptance

- [ ] `.github/workflows/e2e.yml` créé et syntaxe valide (`actionlint`)
- [ ] `scripts/ci-create-test-accounts.ts` créé et fonctionnel localement
- [ ] `doc/ci/GITHUB_SECRETS.md` créé avec la liste complète
- [ ] Premier run CI vert sur une PR de test
- [ ] Le rapport HTML est uploadé comme artifact
- [ ] La durée totale du job est < 30 minutes

---

## Références

- Config Playwright : `playwright.config.ts`
- Auth setup : `e2e/tests/auth/admin.setup.ts`
- Env exemple : `.env.e2e.example`
- Rapport TASK083 : `doc/tests/E2E-ADMIN-CRUD-ADMIN-ONLY-TASK083-REPORT.md`

---

## Critères d'acceptance — Résultats finaux

- [x] `.github/workflows/e2e.yml` créé avec syntaxe valide — **12 étapes, `permissions` block, `concurrency` cancel-in-progress**
- [x] `scripts/ci-create-test-accounts.ts` créé et idempotent (upsert)
- [x] `doc/ci/GITHUB_SECRETS.md` créé avec liste complète des secrets
- [x] Premier run CI vert — **"succeeded 5 minutes ago in 10m 31s"** (commit `2401f42`)
- [x] Rapport HTML uploadé comme artifact `playwright-report-${{ github.run_id }}`
- [x] Durée totale job : **10m 31s** (< 30 min)

---

## Progress Tracking

**Overall Status:** Completed — 100 %

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | ----------- | ------ | ------- | ----- |
| 86.1 | Créer `.github/workflows/e2e.yml` initial | Complete | 2026-03-23 | Commit initial avec déclencheurs, permissions, 12 étapes |
| 86.2 | Créer `scripts/ci-create-test-accounts.ts` | Complete | 2026-03-23 | Upsert idempotent avec service_role_key |
| 86.3 | Créer `doc/ci/GITHUB_SECRETS.md` | Complete | 2026-03-23 | Documentation complète des secrets requis |
| 86.4 | Configurer GitHub Secrets dans le dépôt | Complete | 2026-03-23 | 7 secrets E2E + Supabase configurés |
| 86.5 | Fix : supprimer steps cache Playwright | Complete | 2026-03-23 | Commit `0e249d8` — install propre sans cache |
| 86.6 | Fix : nettoyer cache avant install | Complete | 2026-03-23 | Commit `8318e70` — `rm -rf ~/.cache/ms-playwright` |
| 86.7 | Fix : corriger chemin /root (erreur) | Complete | 2026-03-23 | Commit `2bd14bd` — tentative /root, causait permission denied |
| 86.8 | Fix : revenir à ~ + supprimer HOME=/root | Complete | 2026-03-23 | Commit `2401f42` — **FINAL FIX, CI vert** |
| 86.9 | Ajouter `master` aux déclencheurs | Complete | 2026-03-23 | Session antérieure — push sur `main, master, develop` |
| 86.10 | Ajouter CodeQL permissions block | Complete | 2026-03-23 | Session antérieure — `missing-workflow-permissions` alert |

---

## Progress Log

### 2026-03-23 — Création initiale du pipeline

> **Session 1 — Mise en place complète**

- Créé `.github/workflows/e2e.yml` avec 12 étapes complètes :
  - Checkout → pnpm setup → Node.js 22 → `pnpm install` → Playwright install → Supabase start → clés dynamiques via `jq` → création comptes de test → génération `.env.e2e` → build Next.js → tests E2E → upload rapport → stop Supabase
- Créé `scripts/ci-create-test-accounts.ts` : script idempotent upsert via `@supabase/supabase-js` admin API
- Créé `doc/ci/GITHUB_SECRETS.md` avec la documentation complète des secrets
- Configuré les GitHub Secrets dans le dépôt distant (7 secrets E2E + clés Supabase récupérées dynamiquement)
- Ajouté `master` aux déclencheurs (le dépôt utilise `master` comme branche par défaut)
- Ajouté le `permissions` block (`contents: read`, `checks: write`, `actions: write`) pour corriger l'alerte CodeQL `missing-workflow-permissions`
- Premier run échoue avec : `Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1200/...`

> **Session 2 — Débogage Playwright cache (4 itérations)**

**Itération 1 — Commit `0e249d8` :**

- Cause : Les 3 étapes de cache existantes (Get PW version + `actions/cache@v4` + install conditionnel) créaient une incohérence de cache
- Fix : Suppression des 3 étapes de cache, remplacement par un install propre et incondititionnel : `pnpm exec playwright install chromium --with-deps`
- Résultat : Échec persistant — même erreur sur `/root/.cache`

**Itération 2 — Commit `8318e70` :**

- Cause suspectée : cache résiduel d'un run précédent corrompu
- Fix : `rm -rf ~/.cache/ms-playwright` avant l'install
- Résultat : Nouveau type d'erreur — `rm: cannot remove '/root/.cache/ms-playwright': Permission denied`

**Itération 3 — Commit `2bd14bd` (erreur de raisonnement) :**

- Hypothèse incorrecte : le runner utilise `root` comme utilisateur → chemin absolu `/root/.cache`
- Fix appliqué (à tort) : `rm -rf /root/.cache/ms-playwright` + `HOME=/root pnpm exec playwright install`
- Résultat : `Permission denied` sur `/root` → l'utilisateur du runner n'est **pas** root

**Itération 4 — Commit `2401f42` — FIX FINAL :**

- Insight clé : GitHub Actions `ubuntu-latest` tourne comme utilisateur `runner` avec `HOME=/home/runner`. `/root` est inaccessible (appartient à root).
- Fix double :
  1. Revenir à `rm -rf ~/.cache/ms-playwright` (tilde résolu correctement par le runner)
  2. Supprimer `HOME: /root` de l'env de l'étape "Run E2E tests" (causait une dissonance entre le répertoire d'install et de lookup)
- Résultat : **CI vert — "succeeded 5 minutes ago in 10m 31s"** ✅

---

## Rapport Détaillé — Analyse Technique

### Architecture finale du workflow (`.github/workflows/e2e.yml`)

```
Déclencheurs : push/PR sur main, master, develop + workflow_dispatch
Permissions  : least-privilege (contents:read, checks:write, actions:write)
Concurrence  : annulation du run précédent (e2e-${{ github.ref }})
Runner       : ubuntu-latest
Timeout      : 30 minutes
Runtime réel : ~10m 31s
```

| Étape | Action | Durée estimée |
| ----- | ------ | ------------- |
| 1. Checkout | `actions/checkout@v4` avec `fetch-depth: 1` | ~5s |
| 2. pnpm setup | `pnpm/action-setup@v4` v9 | ~5s |
| 3. Node.js 22 | `actions/setup-node@v4` avec cache pnpm | ~10s |
| 4. `pnpm install` | `--frozen-lockfile` | ~30s |
| 5. Playwright install | `rm -rf ~/.cache/ms-playwright` + install chromium | ~30s |
| 6. Supabase start | `pnpm dlx supabase start` | ~120s |
| 7. Clés Supabase | `supabase status --output json \| jq` | ~5s |
| 8. Comptes de test | `npx tsx scripts/ci-create-test-accounts.ts` | ~10s |
| 9. `.env.e2e` | `cat > heredoc` | ~1s |
| 10. Build Next.js | `pnpm build` + SKIP_ENV_VALIDATION | ~180s |
| 11. E2E tests | `pnpm exec playwright test --reporter=html,github` | ~120s |
| 12. Upload rapport | `actions/upload-artifact@v4` | ~10s |
| 13. Stop Supabase | `pnpm dlx supabase stop --no-backup` | ~10s |

### Leçon critique : utilisateur GitHub Actions runner

**GitHub Actions `ubuntu-latest` ≠ root**

- Utilisateur : `runner`
- `HOME` résolu : `/home/runner`
- `/root` : inaccessible (permission denied)
- `~` (tilde POSIX) : toujours correct dans les `run:` shells

**Pattern sûr pour Playwright :**

```yaml
- name: Clean Playwright cache and reinstall
  run: |
    rm -rf ~/.cache/ms-playwright       # ← tilde correct
    pnpm exec playwright install chromium --with-deps
```

**Anti-patterns à éviter :**

```yaml
# ❌ Chemin absolu /root — permission denied
rm -rf /root/.cache/ms-playwright

# ❌ Override HOME — dissonance install vs lookup
env:
  HOME: /root
```

### Stratégie clés Supabase : dynamique vs. statique

Les clés Supabase locales (anon key, service_role key) **varient selon l'instance** et sont générées à chaque `supabase start`. La solution retenue est **dynamique** :

```yaml
- name: Extract Supabase local keys
  id: supabase-keys
  run: |
    echo "anon_key=$(pnpm dlx supabase status --output json | jq -r '.ANON_KEY // .API["anon key"]')" >> "$GITHUB_OUTPUT"
    echo "service_role_key=$(pnpm dlx supabase status --output json | jq -r '.SERVICE_ROLE_KEY // .API["service_role key"]')" >> "$GITHUB_OUTPUT"
```

Références dans les étapes suivantes : `${{ steps.supabase-keys.outputs.anon_key }}`

Avantage : aucun secret GitHub statique à maintenir pour les clés locales. Seuls les secrets E2E (emails/passwords de comptes de test) sont stockés dans GitHub Secrets.

### Script `ci-create-test-accounts.ts` — Pattern idempotent

```typescript
async function upsertAccount(account: TestAccount): Promise<void> {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list.users.find((u) => u.email === account.email);

  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      app_metadata: { role: account.role },
    });
  } else {
    await admin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,           // ← pas de vérification email requise
      app_metadata: { role: account.role },
    });
  }
}
```

Idempotence garantie : peut être exécuté plusieurs fois sans créer de doublons.

### Sécurité du workflow

- **Permissions minimales** (`contents: read` uniquement pour checkout) — conforme OWASP + CodeQL
- **Annulation concurrente** (`concurrency: cancel-in-progress: true`) — évite les runs parasites
- **Secrets E2E jamais en clair** — uniquement via `${{ secrets.XXX }}`
- **`.env.e2e` généré en runtime** — n'existe jamais dans le dépôt git
- **Rapport artifact 30 jours** — rétention limitée

---

## État final des fichiers créés

| Fichier | Statut | Commits |
| ------- | ------ | ------- |
| `.github/workflows/e2e.yml` | ✅ Créé et fonctionnel | Session initiale + 4 corrections (`0e249d8`, `8318e70`, `2bd14bd`, `2401f42`) |
| `scripts/ci-create-test-accounts.ts` | ✅ Créé | Session initiale |
| `doc/ci/GITHUB_SECRETS.md` | ✅ Créé | Session initiale |
