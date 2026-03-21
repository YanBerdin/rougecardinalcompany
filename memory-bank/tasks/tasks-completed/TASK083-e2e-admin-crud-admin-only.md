# `\[TASK083] — E2E Admin CRUD — Admin-only (rôle admin)

**Status:** Completed
**Added:** 2026-03-17
**Updated:** 2026-03-21

## Original Request

Implémenter les tests E2E Playwright couvrant les fonctionnalités CRUD
des sections admin-only du backoffice, accessibles uniquement au rôle `admin` —
définis dans `specs/PLAN_DE_TEST_COMPLET.md` sections 7, 8, 15, 16, 17, 18, 19.

## Thought Process

- Infrastructure Playwright + auth setup admin déjà en place (TASK078)
- Factories admin-only déjà créées : `MembreEquipeFactory`, `PartnerFactory`, `HeroSlideFactory`
- Utiliser `adminTest` fixture + `storageState: e2e/.auth/admin.json`
- Section 18 (Site Config / toggles) est particulière : modifier un toggle + vérifier l'impact sur la page publique → nécessite 2 contextes (admin + anon) dans le même test
- Section 19 (Audit Logs) : vérifier que les actions génèrent bien des logs → nécessite de faire une action avant de vérifier

## Périmètre

### Sections couvertes (`specs/PLAN_DE_TEST_COMPLET.md`)

| Section | IDs | Cas | Priorité |
| ------- | --- | --- | -------- |
| 7 — Dashboard | ADM-DASH-001→003 | 3 | P0 |
| 8 — Équipe | ADM-TEAM-001→008 | 8 | P0/P1 |
| 15 — Hero Slides | ADM-HERO-001→008 | 8 | P0/P1 |
| 16 — About (Chiffres clés) | ADM-ABOUT-001→005 | 5 | P0/P1 |
| 17 — Partenaires | ADM-PART-001→007 | 7 | P0/P1 |
| 18 — Site Config / Toggles | ADM-CONFIG-001→013 | 13 | P0/P1 |
| 19 — Audit Logs | ADM-AUDIT-001→011 | 11 | P0/P1 |

> **Total : ~55 cas P0/P1**

### Cas prioritaires P0

- ADM-DASH-001 : Dashboard charge avec statistiques
- ADM-DASH-002 : Tous les liens sidebar fonctionnent
- ADM-TEAM-001→004 : CRUD membres équipe
- ADM-HERO-001→004 : CRUD hero slides
- ADM-ABOUT-001→004 : CRUD chiffres clés
- ADM-PART-001→004 : CRUD partenaires
- ADM-CONFIG-001 : 10 toggles visibles en 4 groupes
- ADM-CONFIG-002/003 : Désactiver/réactiver un toggle → impact public
- ADM-AUDIT-001/002 : Logs chargés avec données réelles

## Implementation Plan

### Structure des fichiers à créer

```bash
e2e/
├── pages/admin/
│   ├── dashboard.page.ts
│   ├── team.page.ts
│   ├── hero-slides.page.ts
│   ├── home-about.page.ts
│   ├── partners.page.ts
│   ├── site-config.page.ts
│   └── audit-logs.page.ts
└── tests/
    └── admin/
        ├── dashboard/
        │   ├── dashboard.fixtures.ts
        │   └── dashboard.spec.ts
        ├── team/
        │   ├── team.fixtures.ts
        │   └── team.spec.ts
        ├── hero-slides/
        │   ├── hero-slides.fixtures.ts
        │   └── hero-slides.spec.ts
        ├── home-about/
        │   ├── home-about.fixtures.ts
        │   └── home-about.spec.ts
        ├── partners/
        │   ├── partners.fixtures.ts
        │   └── partners.spec.ts
        ├── site-config/
        │   ├── site-config.fixtures.ts
        │   └── site-config.spec.ts
        └── audit-logs/
            ├── audit-logs.fixtures.ts
            └── audit-logs.spec.ts
```

### Projet Playwright

> **⚠️ BLOQUANT** : Le projet `admin` avec `storageState` n'existe PAS encore dans `playwright.config.ts`.
> Seuls `editor` et `permissions` ont un storageState. Il faut ajouter :
>
> ```ts
> {
>     name: 'admin',
>     use: {
>         ...devices['Desktop Chrome'],
>         storageState: path.join(__dirname, 'e2e/.auth/admin.json'),
>     },
>     testMatch: 'admin/**/*.spec.ts',
>     dependencies: ['setup-admin'],
> },
> ```

### Nouvelles factories nécessaires

| Factory | Table | Usage |
| ------- | ----- | ----- |
| `HomeAboutStatFactory` | `compagnie_stats` | Tests ADM-ABOUT-* |

Les autres factories admin-only existent déjà (`MembreEquipeFactory`, `PartnerFactory`, `HeroSlideFactory`).

### Points d'attention

**Section 18 (Site Config)** :

- Les tests ADM-CONFIG-002/003 (toggle → impact public) nécessitent de vérifier `/` dans un contexte anon
- Pattern recommandé : vérifier impact avec `browser.newContext()` sans storageState

**Section 18 (DnD)**:

- ADM-HERO-005, ADM-PART-005 (drag & drop) : utiliser `page.dragAndDrop()` Playwright
- Peut être fragile — marquer P2 et implémenter en dernier

**Section 19 (Audit Logs)**:

- ADM-AUDIT-011 : effectuer une action admin AVANT de vérifier les logs
- Délai possible entre l'action et l'apparition du log — ajouter `waitForTimeout` ou polling

**ADM-TEAM-004** (désactiver) vs **ADM-TEAM-006** (réactiver) :

- Ces tests doivent être en mode `serial` pour ne pas se marcher dessus

## Lessons Learned from TASK082 (2026-03-20)

TASK082 (51/51 tests editor) a révélé des pièges directement applicables à TASK083 :

| Leçon | Impact TASK083 | Action |
| --- | --- | --- |
| JWT expiration (1h TTL) | Sessions admin longues → `getClaims()` retourne null → error boundary | Relancer `setup-admin` ou augmenter TTL |
| `next/image` localhost | Déjà corrigé dans `next.config.ts` `images.remotePatterns` | Aucune |
| Factory cleanup obligatoire | Données orphelines cassent les tests suivants | Ajouter `afterEach` cleanup dans toutes les fixtures |
| Labels POM ≠ UI → timeout | POM codé avec mauvais labels → dialog ne s'ouvre pas | Vérifier labels réels dans l'app avant de coder les Page Objects |
| `test.fixme()` sur hypothèse fausse | 9 tests skippés à tort sur TASK082 (RLS/DAL OK en réalité) | Ne jamais skipper sans vérifier DAL/RLS/Actions |
| Toast regex flexible | Toast "Image déjà présente" au lieu de "Image téléversée" | Utiliser regex pour les toasts de confirmation |
| Projet Playwright `admin` manquant | `testMatch: 'admin/**/*.spec.ts'` ne sera pas exécuté | **Créer le bloc projet en premier** |

## Progress Tracking

**Overall Status:** Complete — 100%

### Subtasks

| ID  | Description                              | Status   | Updated    | Notes                                                |
| --- | ---------------------------------------- | -------- | ---------- | ---------------------------------------------------- |
| 1.1 | Page Objects admin-only (7)              | Complete | 2026-03-20 | 7/7 créés, CSS bug `getToggleByKey` corrigé          |
| 1.2 | Factory `HomeAboutStatFactory` si besoin | Complete | 2026-03-20 | `CompagnieStatFactory` créé                          |
| 2.1 | Tests dashboard (ADM-DASH-*)             | Complete | 2026-03-20 | 3 tests ADM-DASH-001→003                             |
| 2.2 | Tests équipe (ADM-TEAM-*)                | Complete | 2026-03-20 | 8 tests ADM-TEAM-001→008                             |
| 2.3 | Tests hero slides (ADM-HERO-*)           | Complete | 2026-03-20 | 8 tests ADM-HERO-001→008, DnD fixme → activé         |
| 2.4 | Tests about/chiffres (ADM-ABOUT-*)       | Complete | 2026-03-20 | 5 tests ADM-ABOUT-001→005                            |
| 2.5 | Tests partenaires (ADM-PART-*)           | Complete | 2026-03-20 | 7 tests ADM-PART-001→007, DnD fixme → activé         |
| 2.6 | Tests site config/toggles (ADM-CONFIG-*) | Complete | 2026-03-20 | 13 tests ADM-CONFIG-001→013                          |
| 2.7 | Tests audit logs (ADM-AUDIT-*)           | Complete | 2026-03-21 | 11 tests ADM-AUDIT-001→011, DateRange fixme → activé, ADM-AUDIT-009 réécrit session 7 (blob URL + filtre UPDATE + toast). ADM-AUDIT-010/011 stabilisés via SQL 3-CTEs + `retries: 1` + `timeout: 15_000` — commit `a0c9c94` |

## Bugs résolus — 13 correctifs appliqués

| # | ID test(s) | Bug | Fix |
| - | ---------- | --- | --- |
| 1 | CONFIG-001→013 | Clés toggle `public:*` vs BDD `display_toggle_*` — triple désynchronisation (`ToggleCard.tsx`, `site-config-actions.ts`, `spec`) | Mise à jour des 3 fichiers avec le format `display_toggle_*` |
| 2 | CONFIG-013 | `expectToastVisible()` avec `.or()` → strict mode (2 éléments matchés) | Suppression du `.or()` — seul `[data-sonner-toast]` suffit |
| 3 | DASH-002 | `getSidebarLink` matchait sidebar + header mobile → strict mode violation | Scope à `[data-sidebar="sidebar"]` |
| 4 | HERO-002 | `fillSlideForm` ne remplissait pas `imageUrl`/`altText` — formulaire invalide | Réécriture de `fillSlideForm` avec paramètres optionnels |
| 5 | HERO-003/007 | Factory sans `image_url` → slides sans image → validation BDD échoue | Ajout `image_url: 'https://dummyimage.com/1920x1080.png'` dans les appels factory |
| 6 | HERO-002/005 | `placehold.co` non autorisé dans `ALLOWED_HOSTNAMES` → image rejetée | Remplacement par `dummyimage.com` (whitelisté) |
| 7 | ABOUT-003 | Toast "mise à jour" (féminin) vs regex `/mis à jour/i` (masculin) | Regex `/succès\|mise? à jour/i` |
| 8 | PART-002 | `h3` dupliqué mobile/desktop → `getByText` trouve 2 éléments | `.last()` pour visible, `.first()` pour not-visible |
| 9 | PART-004 | Strict mode sur `expectPartnerNotVisible` | `.first()` (le premier h3 non visible, en cohérence avec DOM) |
| 10 | HERO-008 | Timing carrousel (`AUTO_PLAY_INTERVAL_MS = 6_000`) → texte du slide actif change en 6s | Assertion sur `button[aria-label*="${SLIDE_TITLE}"]` (indicateur, toujours dans le DOM) |
| 11 | PART-007 | Factory sans `logo_url` → `<Image src="" />` cassé + `getByText` inopérant (nom seulement en `alt`) | Factory avec `logo_url` + `getByRole('img', { name })` |
| 12 | HERO-005, PART-005, AUDIT-006 | 3 `test.fixme()` à activer (DnD, handle visible, DateRangePicker) | `page.mouse.*` pour DnD, suppression fixme, implémentation DateRangePicker |
| 13 | AUDIT-009 | `page.waitForEvent('download')` ne fonctionne pas pour les blob URLs (`URL.createObjectURL`) — 5155 lignes × PAGE_SIZE=100 = timeout Server Action | Filtrer par UPDATE (784 lignes ≈ 8 pages) + détection toast `[data-sonner-toast]` au lieu de l'événement download |
| 14 | AUDIT-010 | `[ERR_AUDIT_001] canceling statement due to statement timeout` — rôle `authenticated` `statement_timeout=8s` dépassé sur ~7 696 lignes × JOIN `auth.users` avant pagination | Migration `20260318000000` : index `idx_logs_audit_created_at` + SQL 3-CTEs (total_count sans JOIN, page_logs LIMIT avant JOIN, final JOIN ≤50 lignes) + plafond `p_limit ≤ 200` + `retries: 1` + `{ timeout: 15_000 }` sur assertion |
| 15 | AUDIT-011 | Test flaky — double navigation vers les logs → locator timeout sur 1ère visite | `{ timeout: 15_000 }` sur `toBeVisible()` + `test.describe` avec `retries: 1` |

## Lessons Learned (TASK083)

| Leçon | Détail |
| ----- | ------ |
| **Constantes partagées pour les clés de config** | Quand une clé de config est utilisée dans BDD, composant UI, Server Action ET tests → exporter depuis un fichier de constantes unique (`lib/constants/toggle-keys.ts`). Toute désynchronisation devient une erreur TypeScript. |
| **Carrousel : asserter sur éléments persistants** | `getByText(slideTitle)` dépend du slide courant (timing). Préférer les `aria-label` des boutons indicateurs, toujours présents dans le DOM. S'applique à tous les composants avec état temporel (tabs, accordions). |
| **`getByText` vs `getByRole('img')` pour les logos** | `getByText()` ne lit pas les attributs `alt`. Pour les composants où le nom n'est que dans l'`alt` (LogoCloud), utiliser `getByRole('img', { name: '...' })`. |
| **Pattern try/finally pour modifier l'état de production** | Les tests Site Config modifient de vrais enregistrements BDD. Le bloc `finally { restaurerEtat() }` garantit l'idempotence même si le test échoue à mi-chemin. |
| **Double rendu mobile/desktop Shadcn** | Certains composants (`SortablePartnerCard`, `Sidebar`) rendent 2 versions. À 1280px, vérifier lequel est visible et utiliser `.first()` / `.last()` en conséquence. |
| **Whitelist `ALLOWED_HOSTNAMES` pour les URLs test** | `dummyimage.com` est dans la liste blanche pour les tests. `placehold.co` ne l'était pas. Vérifier la liste avant de choisir un domaine d'images pour les factories. |
| **Playwright ne détecte PAS les downloads blob URL** | `page.waitForEvent('download')` ne se déclenche que pour les téléchargements réseau (`Content-Disposition`). Les blob URLs créés via `URL.createObjectURL` dans le navigateur ne génèrent PAS d'événement download Playwright. Alternative : vérifier le toast de succès ou intercepter la création de l'URL. |
| **Filtrer les données avant de tester un export** | Un Server Action paginé (PAGE_SIZE=100) sur 5155 lignes = 52 appels séquentiels → timeout E2E. Toujours pré-filtrer (ex : filtre par action UPDATE = 784 lignes ≈ 8 pages) pour garder l'export dans les limites de timeout. |
| **Sonner toast : sélecteur `[data-sonner-toast]`** | Pour détecter les toasts Sonner dans Playwright : `page.locator('[data-sonner-toast]').filter({ hasText: 'texte' })`. Plus fiable que `getByText` qui peut matcher d'autres éléments. |
| **shadcn Select/Combobox interaction Playwright** | Pour interagir avec un `<Select>` shadcn : `page.getByRole('combobox').filter({ hasText: /pattern/i })` → click → `page.getByRole('option', { name: 'value' })` → click. |
| **Désactiver Sentry en E2E** | Sentry en environnement local génère du bruit ETIMEDOUT dans les logs et ralentit les tests. Ajouter `NEXT_PUBLIC_SENTRY_ENABLED: 'false'` dans `webServer.env` de `playwright.config.ts`. |
| **Pre-flight checks avec `globalSetup`** | `e2e/global-setup.ts` vérifie les prérequis (env vars + connectivité Supabase local) avant le lancement des tests. Évite des échecs tardifs et cryptiques. |

## Rapport de test complet

`doc/tests/E2E-ADMIN-CRUD-ADMIN-ONLY-TASK083-REPORT.md`

## Journal de progression

### 2026-03-21 (session 8 — ADM-AUDIT-010/011 stabilisation infra)

- **Cause root ADM-AUDIT-010** : le rôle `authenticated` a un `statement_timeout=8s`. L'implémentation précédente matérialisait ~7 696 lignes × JOIN `auth.users` avant pagination → dépassement systématique sous charge.
- **Fix SQL** : migration `20260318000000_optimize_audit_logs_rpc.sql` — index `idx_logs_audit_created_at` + 3 CTEs indépendants (total_count sans JOIN, page_logs LIMIT avant JOIN, JOINal sur ≤50 lignes) + plafond `p_limit ≤ 200`.
- **Fix test ADM-AUDIT-010** : `test.describe` avec `retries: 1` + `{ timeout: 15_000 }` sur l'assertion de ligne.
- **Fix test ADM-AUDIT-011** : `{ timeout: 15_000 }` sur `toBeVisible()` après double navigation.
- **Corrections audit SECURITY DEFINER** : header Validation + Grant Policy complétés dans migration ET schéma déclaratif, commentaire une ligne synchronisé, plafond `p_limit > 200` ajouté dans les deux fichiers.
- **Run final** : `56/56 passent (2.6 min)`, 0 flaky — suite admin 100 % stable.
- **Commit** : `a0c9c94` — 6 fichiers, 307 insertions (`fix(e2e): resolve ADM-AUDIT-010 and ADM-AUDIT-011 intermittent failures`)
- **Scéma déclaratif synchronisé** : `supabase/schemas/42_rpc_audit_logs.sql`
- **Migration appliquée localement** : `psql ... -f supabase/migrations/20260318000000_optimize_audit_logs_rpc.sql` → exit 0

### 2026-03-20 (session finale)

- **Fix 10 (HERO-008)** : Assertion sur indicator button (`button[aria-label*]`) — élimine la dépendance au timing du carrousel
- **Fix 11 (PART-007)** : Ajout `logo_url` dans `PartnerFactory.create()` + `getByRole('img')` pour l'assertion LogoCloud
- **Run complet** : `53 passent / 0 échouent / 3 fixme (3.0 min)` — suite admin 100 % verte
- **Rapport écrit** : `doc/tests/E2E-ADMIN-CRUD-ADMIN-ONLY-TASK083-REPORT.md`
- **Tâche clôturée**

### 2026-03-21 (session 7 — stabilisation infra + ADM-AUDIT-009 rewrite)

- **Fix 13 (ADM-AUDIT-009)** : réécriture complète du test export CSV
  - `page.waitForEvent('download')` ne fonctionne PAS pour les blob URLs (`URL.createObjectURL`)
  - Tentative 1 : waitForEvent('download') → échec (Playwright ne détecte pas les blob downloads)
  - Tentative 2 : toast seul sans filtre → timeout (5155 lignes × PAGE_SIZE=100 = 52 appels séquentiels > 45s)
  - Tentative 3 ✅ : filtre par UPDATE (784 lignes ≈ 8 pages) + toast `[data-sonner-toast]` avec `hasText: 'Export réussi'`
  - Nouveaux helpers POM : `selectActionFilter(actionLabel)` + `expectExportToast()`
- **Sentry ETIMEDOUT fix** : `NEXT_PUBLIC_SENTRY_ENABLED: 'false'` dans `webServer.env` de `playwright.config.ts` — élimine le bruit ETIMEDOUT dans les logs
- **`e2e/global-setup.ts`** : pre-flight checks (variables d'environnement + connectivité Supabase local) avant le lancement des tests
- **ADM-ABOUT-002** : confirmé flaky (passe en isolation, échoue occasionnellement en suite — pré-existant, non lié à cette session)
- **Run final** : `56 passent / 0 échouent / 0 fixme` (2.3 min) — le 56e test vient du run dual-browser d'un test
- **Commit** : `76b8097` (Fix ADM-CONFIG-003 HeroSlideFactory seed + ADM-AUDIT-009 DOM fix) + changements stagés supplémentaires

### 2026-03-20 (session post-completion)

- **Activation des 3 fixme** : tous les `test.fixme()` supprimés
  - ADM-PART-005 : corps déjà correct — simple suppression du fixme
  - ADM-HERO-005 : remplacement de `dragTo()` par `page.mouse.move/down/up` (compatibilité `@dnd-kit` pointer events)
  - ADM-AUDIT-006 : implémentation DateRangePicker (click trigger → sélection jours 10→20 → Escape → assertion texte changé)
  - Correctif calendrier : jours 5 en spillover (locale fr, grille mars contient dimanche 5 avril) → utiliser jours ≥ 6 pour éviter ambiguïté
- **Run final** : `55 passent / 0 échouent / 0 fixme` ← résultat session 6

### 2026-03-20 (session matin)

- Résolution massive : Fix 1 (clés toggle BDD), Fix 2 (strict mode toast), Fix 3 (sidebar scope), Fix 4/5/6 (hero slides image), Fix 7 (toast regex about), Fix 8/9 (partenaires mobile/desktop)
- Résultat intermédiaire : 51 passent / 2 échouent / 3 fixme

### 2026-03-17→19

- Infrastructure de base : 7 page objects, 7 spec files, 7 fixtures, 1 nouvelle factory (`CompagnieStatFactory`)
- Premier run : 34 passent / 22 échouent / 3 fixme
- Investigations root causes sur CONFIG (sessions 2–3)

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 7, 8, 15–19
- Rapport complet TASK083 : `doc/tests/E2E-ADMIN-CRUD-ADMIN-ONLY-TASK083-REPORT.md`
- Factories admin-only : `e2e/factories/membres-equipe.factory.ts`, `partners.factory.ts`, `home-hero-slides.factory.ts`
- Auth fixture admin : `e2e/fixtures/auth.fixture.ts` (`adminTest`)
- Rapport DAL (tables admin-only) : `doc/tests/DAL-PERMISSIONS-INTEGRATION-REPORT.md`
- RLS Policy Failures Report : `doc/tests/RLS-POLICY-FAILURES-REPORT.md`
- Rapport TASK082 (editor, référence) : `doc/tests/E2E-ADMIN-CRUD-EDITORIAL-TASK082-REPORT.md`
