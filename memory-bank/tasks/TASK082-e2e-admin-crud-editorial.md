# [TASK082] — E2E Admin CRUD — Éditorial (rôle editor)

**Status:** Pending
**Added:** 2026-03-17
**Updated:** 2026-03-17

## Original Request

Implémenter les tests E2E Playwright couvrant les fonctionnalités CRUD
des sections éditoriales du backoffice, accessibles au rôle `editor` —
définis dans `specs/PLAN_DE_TEST_COMPLET.md` sections 9, 10, 11, 12, 13, 14.

## Thought Process

- Infrastructure Playwright + auth setup editor déjà en place (TASK078)
- Factories E2E pour spectacles, evenements, lieux, medias déjà créées (TASK078)
- Utiliser `editorTest` fixture + `storageState: e2e/.auth/editor.json`
- Les tests CRUD nécessitent des données de seed via factories (service_role)
- Pattern : `mergeTests(editorTest, seedSpectacleTest)` pour combiner auth + seed
- Attention aux toasts `revalidatePath` — attendre confirmation avant assertion

## Périmètre

### Sections couvertes (`specs/PLAN_DE_TEST_COMPLET.md`)

| Section | IDs | Cas | Priorité |
| ------- | --- | --- | -------- |
| 9 — Spectacles | ADM-SPEC-001→010 | 10 | P0/P1 |
| 10 — Agenda | ADM-AGENDA-001→006 | 6 | P0/P1 |
| 11 — Lieux | ADM-LIEU-001→007 | 7 | P0/P1 |
| 12 — Presse | ADM-PRESSE-001→010 | 10 | P0/P1 |
| 13 — Compagnie | ADM-COMP-001→006 | 6 | P1 |
| 14 — Médiathèque | ADM-MEDIA-001→011 | 11 | P0/P1 |

**Total : ~50 cas P0/P1**

### Cas prioritaires P0

- ADM-SPEC-001 : Liste spectacles chargée
- ADM-SPEC-003 : Créer un spectacle
- ADM-SPEC-004 : Modifier un spectacle
- ADM-SPEC-005 : Supprimer un spectacle
- ADM-AGENDA-001 : Liste événements
- ADM-AGENDA-002 : Créer un événement
- ADM-AGENDA-003 : Modifier un événement
- ADM-AGENDA-004 : Supprimer un événement
- ADM-LIEU-001→004 : CRUD lieux
- ADM-PRESSE-001→007 : CRUD communiqués
- ADM-MEDIA-001→003 : Hub + upload média
- ADM-MEDIA-008 : Supprimer un média

## Implementation Plan

### Structure des fichiers à créer

```bash
e2e/
├── pages/admin/
│   ├── spectacles.page.ts
│   ├── agenda.page.ts
│   ├── lieux.page.ts
│   ├── presse.page.ts
│   ├── compagnie.page.ts
│   └── media.page.ts
└── tests/
    └── editor/
        ├── spectacles/
        │   ├── spectacles.fixtures.ts
        │   └── spectacles.spec.ts
        ├── agenda/
        │   ├── agenda.fixtures.ts
        │   └── agenda.spec.ts
        ├── lieux/
        │   ├── lieux.fixtures.ts
        │   └── lieux.spec.ts
        ├── presse/
        │   ├── presse.fixtures.ts
        │   └── presse.spec.ts
        ├── compagnie/
        │   ├── compagnie.fixtures.ts
        │   └── compagnie.spec.ts
        └── media/
            ├── media.fixtures.ts
            └── media.spec.ts
```

### Projet Playwright

Utiliser `chromium-editor` (storageState editor) — déjà configuré dans `playwright.config.ts`.

### Nouvelles factories nécessaires

Les factories existantes (`SpectacleFactory`, `LieuFactory`, `EvenementFactory`, `MembreEquipeFactory`) couvrent la plupart des besoins. À créer si nécessaire :

- `ArticlePresseFactory` — pour tests presse
- `CommuniquePresseFactory` — pour tests presse

### Points d'attention

- **ADM-MEDIA-003** (upload) : nécessite un fichier de test PNG/JPEG dans `e2e/fixtures/assets/`
- **ADM-MEDIA-004/005/006** (upload erreurs) : fichier trop gros, format invalide, magic bytes
- **ADM-SPEC-002** (tri colonnes) : vérifier que l'en-tête est cliquable
- **ADM-PRESSE-006** (publier/dépublier) : vérifier l'impact sur `/presse`
- **Toasts revalidatePath** : attendre `getByText('succès')` avant `goto()` pour re-vérification

## Progress Tracking

**Overall Status:** Not Started — 0%

### Subtasks

| ID  | Description                          | Status      | Updated    | Notes                   |
| --- | ------------------------------------ | ----------- | ---------- | ----------------------- |
| 1.1 | Page Objects admin editorial (6)     | Not Started | 2026-03-17 |                         |
| 1.2 | Factories manquantes si nécessaire   | Not Started | 2026-03-17 |                         |
| 2.1 | Tests spectacles (ADM-SPEC-*)        | Not Started | 2026-03-17 | P0 prioritaire          |
| 2.2 | Tests agenda (ADM-AGENDA-*)          | Not Started | 2026-03-17 | P0 prioritaire          |
| 2.3 | Tests lieux (ADM-LIEU-*)             | Not Started | 2026-03-17 | P0 prioritaire          |
| 2.4 | Tests presse (ADM-PRESSE-*)          | Not Started | 2026-03-17 |                         |
| 2.5 | Tests compagnie (ADM-COMP-*)         | Not Started | 2026-03-17 |                         |
| 2.6 | Tests médiathèque (ADM-MEDIA-*)      | Not Started | 2026-03-17 | Upload nécessite assets |

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 9–14
- Factories existantes : `e2e/factories/`
- Auth fixture editor : `e2e/fixtures/auth.fixture.ts` (`editorTest`)
- Seed strategy : `e2e-tests/E2E_Seed_Strategy_RCC.md`
- Rapport DAL (tables autorisées pour editor) : `doc/tests/DAL-PERMISSIONS-INTEGRATION-REPORT.md`
