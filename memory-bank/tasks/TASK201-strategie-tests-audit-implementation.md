# TASK201 - Stratégie de tests : audit, implémentation, validation

**Status:** In Progress
**Added:** 2026-09-01
**Updated:** 2026-09-01

## Original Request

Auditer l'organisation des tests du projet puis mettre en place une stratégie
de tests cohérente avec l'architecture (`doc-perso/TASK201-organisation-et- mise-en-plac-des-tests.md`) :
unitaires, intégration RLS/audit, E2E, CI, scripts npm, couverture.

## Résumé de l'audit initial

| Constat | Détail |
| --- | --- |
| Outils déjà en place | Vitest 4, Playwright 1.57, Supabase local |
| Tests unitaires | 9 fichiers seulement, `.tsx` jamais exécuté (glob manquant) |
| Test d'intégration RLS | 78 cas, mais rangé dans `__tests__/dal/` (mélangé aux unitaires) |
| CI | `unit-tests.yml` limité à `main/master/develop`, aucun job `lint`/`type-check` |
| `pnpm lint` | Échouait (1 erreur, faux positif ESLint sur fixture Playwright) |
| Section 7 du brief (triggers/audit) | Non couverte |
| Scripts npm | Pas de `test`, `test:unit`, `test:integration`, `test:e2e`, `test:coverage` |

## Ce qui a été fait

### 1. Correction bloquante

- [e2e/tests/auth/invite-setup/invite-setup.fixtures.ts](../../e2e/tests/auth/invite-setup/invite-setup.fixtures.ts) —
  faux positif `react-hooks/rules-of-hooks` sur `use()` Playwright corrigé.
  `pnpm lint` passe de rouge à vert.

### 2. Réorganisation des tests

- `__tests__/dal/permissions-integration.test.ts` → [__tests__/integration/rls-permissions.test.ts](../../__tests__/integration/rls-permissions.test.ts)
  (78 cas RLS, séparé des unitaires).
- Helpers factorisés dans [__tests__/integration/helpers/supabase.ts](../../__tests__/integration/helpers/supabase.ts)
  (`signInAndCreateClient`, `ensureTestAccount`, `syncProfileRole`, `isRlsBlock`,
  `assertLocalSupabase` — garde-fou anti-production).
- [vitest.config.ts](../../vitest.config.ts) réécrit avec `test.projects`:
  - `unit` — `__tests__/**/*.test.{ts,tsx}` hors `integration/`, env déterministe
    (`SKIP_ENV_VALIDATION=1`), jamais dépendant du `.env` du développeur.
  - `integration` — `fileParallelism: false` (état DB partagé), opt-in via
    `RUN_DAL_INTEGRATION_TESTS=1`.
  - `coverage` (v8) scopée aux couches unit-testables (`lib/auth|schemas|utils|tables|forms|i18n|constants`, `emails`).

### 3. Nouveaux tests

- [__tests__/integration/audit-triggers.test.ts](../../__tests__/integration/audit-triggers.test.ts) —
  9 cas (section 7 du brief) : audit trail INSERT/UPDATE/DELETE sur `partners`
  et `medias`, intégrité `logs_audit` (INSERT direct bloqué pour admin ET user),
  ownership (`created_by`, `uploaded_by` protégés contre prise de contrôle).
- 6 fichiers unitaires ajoutés : [format.test.ts](../../__tests__/utils/format.test.ts),
  [rate-limit.test.ts](../../__tests__/utils/rate-limit.test.ts),
  [audit-log-filters.test.ts](../../__tests__/utils/audit-log-filters.test.ts),
  [press-utils.test.ts](../../__tests__/utils/press-utils.test.ts),
  [contact.test.ts](../../__tests__/schemas/contact.test.ts),
  [newsletter.test.ts](../../__tests__/schemas/newsletter.test.ts).
- [__tests__/emails/invitation-email.test.tsx](../../__tests__/emails/invitation-email.test.tsx)
  converti d'un script `main()`/`process.exit` en vrai test Vitest (il n'était
  jamais exécuté auparavant, glob `.test.ts` uniquement).

### 4. Scripts npm ([package.json](../../package.json))

```yml
test              → alias de test:unit
test:unit         → vitest run --project unit
test:unit:watch   → vitest --project unit
test:integration  → RUN_DAL_INTEGRATION_TESTS=1 vitest run --project integration
test:e2e          → playwright test
test:coverage     → vitest run --project unit --coverage
```

Suppression de 3 scripts redondants/cassés (`test:dal:permissions`,
`test:unit:image-compress`, `test:unit:invitation-url` — remplacés par les
scripts génériques ci-dessus).

### 5. CI ([.github/workflows/](../../.github/workflows/))

- `unit-tests.yml` renommé en interne « Quality » : 3 jobs séquentiels
  `lint` → `type-check` → `unit-tests`, déclenchés sur **tous les push**
  (toutes branches) + PR vers `main/master/develop`.
- `e2e.yml` : ajout de l'étape `pnpm test:integration` entre le démarrage de
  Supabase local et Playwright (réutilise l'instance déjà démarrée).

### 6. Hygiène repo

- `.gitignore` : exclusion de `coverage/`, `playwright-report/`,
  `test-results/`, `blob-report/`, et surtout **`/e2e/.auth/`** — ce dossier
  contient les `storageState` Playwright (JWT de session des comptes de test).
  `e2e/.auth/editor.json` était suivi par Git ; retiré du suivi
  (`git rm --cached`), les 3 fichiers restent générés localement par les
  projets `setup-*`.
- `eslint.config.mjs` : mêmes dossiers ajoutés aux `ignores`.
- Dépendance ajoutée : `@vitest/coverage-v8@4.1.11` (+ alignement `vitest` sur
  la même version pour le peer dependency).

### 7. Corrections de dérive E2E (app ↔ tests désynchronisés)

Ces bugs préexistaient et n'ont pas été introduits par ce travail — ils ont
été découverts en exécutant réellement les projets Playwright :

| Fichier | Dérive corrigée |
| --- | --- |
| [e2e/pages/public/agenda.page.ts](../../e2e/pages/public/agenda.page.ts) | `h1` attendu "agenda" → app rend "Evénements" |
| [e2e/pages/public/contact.page.ts](../../e2e/pages/public/contact.page.ts) | carte "Contacts Spécialisés" supprimée de l'UI ; bouton newsletter re-scopé sur le `<form>` (libellé "S'inscrire" → "Je la veux !") |
| [e2e/pages/auth/forgot-password.page.ts](../../e2e/pages/auth/forgot-password.page.ts) | "Check Your Email" → "Vérifiez votre email" (copie FR) |
| [e2e/tests/auth/login/login.spec.ts](../../e2e/tests/auth/login/login.spec.ts) | `AUTH-LOGIN-005` testait un lien d'inscription publique désactivé ; réécrit pour affirmer son absence (modèle sur invitation) |
| [e2e/tests/permissions/permissions.spec.ts](../../e2e/tests/permissions/permissions.spec.ts) | sidebar admin : 18 → 19 items réels ; "Utilisateurs" renommé "Administrateurs" (**faux vert** — le test vérifiait un libellé qui n'existait plus) |
| `__tests__/integration/audit-triggers.test.ts` | `AUDIT-002` supposait `old_values` rempli sur `UPDATE` ; `public.audit_trigger()` ne le fait que sur `DELETE` (limitation métier documentée, pas un bug de test) |

### 8. Base de données locale

- Découverte : 7 migrations non appliquées en local (157/159), dont
  `20260801134257_restore_service_role_baseline_grants` → `service_role` sans
  aucun grant → tout seeding échouait (`permission denied for table ...`).
  Corrigé via `pnpm dlx supabase migration up --local`.
- Suite à plusieurs interruptions de Docker/WSL pendant les runs E2E, la base
  locale a fini dégradée (table `evenements` vidée). **`pnpm db:reset` a été
  exécuté par l'utilisateur** — la base locale est de nouveau propre et à jour.

## Résultats réellement exécutés (vérifiés, pas supposés)

| Commande | Résultat |
| --- | --- |
| `pnpm lint` | ✅ 0 erreur (2 warnings préexistants, sans rapport) |
| `pnpm type-check` | ✅ 0 erreur |
| `pnpm test:unit` | ✅ **159/159** (contre 113/113 avant, dont 1 fichier jamais exécuté) |
| `pnpm test:integration` | ✅ **81/81** (72 RLS + 9 audit/ownership) |
| E2E `chromium-public` | ✅ 15/15 |
| E2E `chromium-auth` | ✅ 19/19 |
| E2E `permissions` | ✅ 23/23 |
| E2E `editor` | ⚠️ 38/51 passés — 13 échecs en cascade après crash serveur (voir limitation ci-dessous) |
| E2E `admin`, `cross-public`, `cross-admin` | ❌ non exécutés avec succès (même limitation) |

## Limitation environnement constatée (non corrigible par le code)

Le serveur `next dev` utilisé par le `webServer` Playwright est **tué par
manque de mémoire (OOM)** lors d'une exécution complète de la suite E2E sur
cette machine (7.4 Gi RAM, ~1.5 Gi de swap déjà consommé avant le run). Le
point de crash est reproductible sur `ADM-SPEC-007 — Galerie photos`
(editor/spectacles), le test le plus lourd (upload d'images).

**Contournement validé** : exécuter un seul projet Playwright par invocation
(`pnpm exec playwright test --project=<nom>`), ce qui force un redémarrage du
`webServer` à chaque run. Documenté dans la mémoire repo
(`/memories/repo/test-strategy.md`).

## Progress Tracking

**Overall Status:** In Progress — 85%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Audit complet (outils, CI, lacunes) | Complete | 2026-09-01 | Voir section "Résumé de l'audit initial" |
| 1.2 | Fix lint bloquant (fixture Playwright) | Complete | 2026-09-01 | |
| 1.3 | Réorganisation unit/integration + helpers partagés | Complete | 2026-09-01 | |
| 1.4 | Tests d'intégration triggers/audit (section 7) | Complete | 2026-09-01 | 81/81 exécutés avec succès |
| 1.5 | Tests unitaires manquants (utils, schemas) | Complete | 2026-09-01 | 6 fichiers, 159/159 |
| 1.6 | Scripts npm harmonisés | Complete | 2026-09-01 | |
| 1.7 | CI : job lint/type-check + déclenchement sur push | Complete | 2026-09-01 | Non testé sur GitHub (pas de push effectué) |
| 1.8 | CI : intégration des tests d'intégration dans e2e.yml | Complete | 2026-09-01 | Non testé sur GitHub |
| 1.9 | Retrait secret `e2e/.auth/editor.json` du suivi Git | Complete | 2026-09-01 | `git rm --cached` + `.gitignore` |
| 1.10 | Correction dérives E2E découvertes en exécutant les projets | Complete | 2026-09-01 | 6 corrections, voir tableau |
| 2.1 | **Protection de `main` sur GitHub** | Not Started | 2026-09-01 | Checks requis à activer à distance — voir section dédiée |
| 2.2 | **Valider projet E2E `admin` en CI ou machine dédiée** | Not Started | 2026-09-01 | Bloqué localement par OOM |
| 2.3 | **Valider projets E2E `cross-public` / `cross-admin` en CI ou machine dédiée** | Not Started | 2026-09-01 | Bloqué localement par OOM |
| 2.4 | **Vérifier le premier run réel du workflow `unit-tests.yml` / `e2e.yml` sur GitHub Actions** | Not Started | 2026-09-01 | Nécessite un push ou une PR |

## Progress Log

### 2026-09-01

- Audit complet du repository (package.json, vitest.config.ts,
  playwright.config.ts, workflows, `__tests__/`, `e2e/`, `supabase/schemas/`).
- Implémenté la réorganisation, les scripts npm, la CI, les nouveaux tests
  (unitaires + intégration audit/triggers).
- Exécuté réellement `test:unit` (159/159) et `test:integration` (81/81)
  après avoir corrigé un défaut de grants sur la base locale
  (`supabase migration up --local`).
- Exécuté la suite E2E complète deux fois : la première interrompue par une
  coupure Docker/WSL, la seconde par un OOM du serveur dev. Diagnostiqué la
  cause (mémoire, pas un bug), validé projet par projet ce qui est possible
  sur cette machine (`public`, `auth`, `permissions` : 100%).
- Découvert et corrigé 6 dérives de tests E2E préexistantes (app modifiée
  sans mise à jour des Page Objects/specs), dont un faux vert sur le nombre
  d'items de la sidebar admin.
- Retiré `e2e/.auth/editor.json` (JWT de session) du suivi Git, ajouté
  `/e2e/.auth/` au `.gitignore`.
- `pnpm db:reset` exécuté par l'utilisateur pour restaurer une base locale
  propre après les interruptions de run.

## Prochaines étapes (4 tâches restantes)

### 1. Protection de la branche `main` (GitHub, action manuelle)

Non modifiable par l'agent sans confirmation explicite (action à distance
sur la configuration du repository). À faire par le mainteneur sur
`github.com/YanBerdin/rougecardinalcompany` :

1. **Settings → Branches → Branch protection rules → Add rule**
2. Branch name pattern : `main`
3. Cocher **Require status checks to pass before merging**
4. Rechercher et sélectionner les checks suivants (apparaissent seulement
   après au moins un run des workflows sur une PR) :
   - `lint` (job du workflow `unit-tests.yml`)
   - `type-check` (job du workflow `unit-tests.yml`)
   - `unit-tests` (job du workflow `unit-tests.yml`)
   - `e2e` (job du workflow `e2e.yml`)
5. Cocher **Require branches to be up to date before merging**
6. Sauvegarder.

Prérequis : les workflows doivent avoir tourné au moins une fois sur une PR
pour que GitHub propose ces noms de check dans la liste.

### 2. Valider le projet E2E `admin` (56 tests)

Bloqué localement par l'OOM du serveur dev décrit ci-dessus. Deux options :

- **Recommandé** : laisser tourner via `.github/workflows/e2e.yml` sur une
  PR — les runners GitHub Actions disposent de 16 Gi de RAM, largement
  suffisant.
- **Alternative locale** : sur une machine avec plus de RAM disponible (ou
  après avoir fermé les autres applications), exécuter :

```bash
  pnpm exec playwright test --project=admin --reporter=list
```

### 3. Valider les projets E2E `cross-public` et `cross-admin` (11 tests)

Même blocage et même remède que ci-dessus :

```bash
pnpm exec playwright test --project=cross-public --project=cross-admin --reporter=list
```

### 4. Vérifier le premier run réel des workflows sur GitHub Actions

Les workflows `unit-tests.yml` et `e2e.yml` ont été modifiés et validés
**localement** (commandes équivalentes exécutées avec succès), mais jamais
exécutés par GitHub Actions lui-même. À faire :

1. Pousser une branche (ou ouvrir une PR) contenant ces changements.
2. Observer l'onglet **Actions** du repository pour confirmer que :
   - `unit-tests.yml` déclenche bien `lint` → `type-check` → `unit-tests`
     et que les 3 jobs passent au vert ;
   - `e2e.yml` démarre Supabase local, exécute `pnpm test:integration` puis
     Playwright, et que le rapport est bien uploadé en artefact.
3. Une fois verts, les noms de ces jobs deviennent sélectionnables dans la
   protection de branche (étape 1).

## Secrets GitHub requis (déjà existants, aucun nouveau)

| Secret | Utilisé par |
| --- | --- |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | `e2e.yml` (comptes de test + `test:integration`) |
| `E2E_EDITOR_EMAIL` / `E2E_EDITOR_PASSWORD` | idem |
| `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` | idem |
| `SENTRY_AUTH_TOKEN` | `e2e.yml` (optionnel, skip si absent) |

Aucun secret supplémentaire n'est nécessaire pour `pnpm test:integration` :
il réutilise les variables déjà injectées par `e2e.yml` dans `.env.e2e`.
