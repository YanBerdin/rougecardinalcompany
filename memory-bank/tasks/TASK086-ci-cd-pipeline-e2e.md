# \[TASK086] — CI/CD Pipeline E2E

**Status:** Pending
**Added:** 2026-03-23
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

```
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
