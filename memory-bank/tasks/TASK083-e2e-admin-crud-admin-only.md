# [TASK083] — E2E Admin CRUD — Admin-only (rôle admin)

**Status:** Pending
**Added:** 2026-03-17
**Updated:** 2026-03-19

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

**Total : ~55 cas P0/P1**

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

**Overall Status:** Not Started — 0%

### Subtasks

| ID  | Description                              | Status      | Updated    | Notes |
| --- | ---------------------------------------- | ----------- | ---------- | ----- |
| 1.1 | Page Objects admin-only (7)              | Not Started | 2026-03-17 |       |
| 1.2 | Factory `HomeAboutStatFactory` si besoin | Not Started | 2026-03-17 |       |
| 2.1 | Tests dashboard (ADM-DASH-*)             | Not Started | 2026-03-17 | Court, prioritaire |
| 2.2 | Tests équipe (ADM-TEAM-*)                | Not Started | 2026-03-17 | Serial mode |
| 2.3 | Tests hero slides (ADM-HERO-*)           | Not Started | 2026-03-17 | DnD en dernier |
| 2.4 | Tests about/chiffres (ADM-ABOUT-*)       | Not Started | 2026-03-17 |       |
| 2.5 | Tests partenaires (ADM-PART-*)           | Not Started | 2026-03-17 | DnD en dernier |
| 2.6 | Tests site config/toggles (ADM-CONFIG-*) | Not Started | 2026-03-17 | Impact public = 2 contextes |
| 2.7 | Tests audit logs (ADM-AUDIT-*)           | Not Started | 2026-03-17 | Délai log après action |

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 7, 8, 15–19
- Factories admin-only : `e2e/factories/membres-equipe.factory.ts`, `partners.factory.ts`, `home-hero-slides.factory.ts`
- Auth fixture admin : `e2e/fixtures/auth.fixture.ts` (`adminTest`)
- Rapport DAL (tables admin-only) : `doc/tests/DAL-PERMISSIONS-INTEGRATION-REPORT.md`
- RLS Policy Failures Report : `doc/tests/RLS-POLICY-FAILURES-REPORT.md`
