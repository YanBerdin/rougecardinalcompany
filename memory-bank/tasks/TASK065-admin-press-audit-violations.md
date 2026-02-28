# TASK065 - Admin Press Audit Violations Fix

**Status:** Pending
**Added:** 2026-02-28
**Updated:** 2026-02-28

## Original Request

Corriger les 12 violations détectées lors de l'audit de conformité de la feature admin presse (`doc-perso/audit-admin-press-discuss.md`). Score initial : ~75% conforme. Objectif : ≥95% conforme.

## Thought Process

L'audit suit le pattern des TASK063 (Media Admin) et TASK064 (Admin Partners) — séries de refactorings qualité alignés sur les patterns DAL SOLID, Clean Code et WCAG.

Les violations sont classées en 3 niveaux :

- **P0 (3 critiques)** : `import "server-only"` manquant, imports DAL dans Client Components, `any` dans mapToDTO
- **P1 (6 majeures)** : fichiers > 300 lignes (actions.ts 368L, admin-press-releases.ts 341L), `cache()` absent, `dalSuccess`/`dalError` non utilisés, codes erreur manquants sur reads, `ActionResult` dupliqué, `parseAsync` incohérent
- **P2 (3 mineures)** : pattern `onSubmit` atypique, `formatDate` inline, `form.watch()` instable dans dépendances useEffect

Branche : `fix/admin-press-audit-violations`

### Décisions clés

- Split actions.ts en 3 fichiers (par entité) — cohérence avec la séparation DAL
- Extraction `fetchSpectaclesForSelect`/`fetchEvenementsForSelect` dans un DAL dédié `admin-press-select-options.ts`
- Utilisation du `ActionResult<T>` partagé depuis `lib/actions/types.ts` (avec `data?` optionnel)
- Codes erreur reads en série 010+ (mutations gardent 001-005)
- `parseAsync()` systématique pour cohérence

## Implementation Plan

### Phase 1 — Violations critiques (P0)

1. Ajouter `import "server-only"` dans `actions.ts`
2. Migrer imports DAL hors Client Components → passer spectacles/evenements en props depuis Server Components
3. Remplacer `any` par `RawPressReleaseRow` interface dans `mapToPressReleaseDTO`

### Phase 2 — Violations majeures (P1)

4. Split `actions.ts` (368L) → 3 fichiers par entité
5. Split `admin-press-releases.ts` (341L) → extraire select-options dans nouveau DAL
6. Ajouter `cache()` React sur toutes les lectures DAL (3 fichiers + select-options)
7. Migrer vers `dalSuccess`/`dalError` helpers
8. Utiliser `ActionResult<T>` partagé depuis `lib/actions/types.ts`
9. Ajouter codes erreur `[ERR_XXX_NNN]` sur fonctions fetch (série 010+)
10. Harmoniser `.parseAsync()` dans toutes les actions

### Phase 3 — Violations mineures (P2)

11. Unifier pattern `onSubmit` dans `ArticleEditForm.tsx`
12. Extraire `formatDateFr` dans `lib/dal/helpers/format.ts`
13. Corriger `form.watch()` dans dépendances useEffect de `PressReleaseNewForm.tsx`

### Phase 4 — Vérification

14. `pnpm lint` + `pnpm build` + grep validations + `wc -l` checks

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1 | Ajouter `import "server-only"` dans actions.ts | Not Started | - | P0 |
| 2 | Migrer imports DAL → props Server Component | Not Started | - | P0 — pages new/edit + 2 forms |
| 3 | Remplacer `any` par `RawPressReleaseRow` | Not Started | - | P0 |
| 4 | Split actions.ts → 3 fichiers | Not Started | - | P1 — 368→3×~120L |
| 5 | Split admin-press-releases.ts → select-options | Not Started | - | P1 — 341→~280 + ~80 |
| 6 | Ajouter `cache()` sur lectures DAL | Not Started | - | P1 — 4 fichiers |
| 7 | Migrer `dalSuccess`/`dalError` | Not Started | - | P1 — 4 fichiers DAL |
| 8 | Utiliser `ActionResult<T>` partagé | Not Started | - | P1 — supprimer définition locale |
| 9 | Codes erreur fetch (série 010+) | Not Started | - | P1 — 8 fonctions |
| 10 | Harmoniser `.parseAsync()` | Not Started | - | P1 — articles + contacts actions |
| 11 | Unifier pattern onSubmit ArticleEditForm | Not Started | - | P2 |
| 12 | Extraire formatDateFr dans helpers | Not Started | - | P2 |
| 13 | Corriger form.watch() deps useEffect | Not Started | - | P2 |
| 14 | Validation finale (lint + build + grep) | Not Started | - | Gate |

## Progress Log

### 2026-02-28

- Task created from audit document `doc-perso/audit-admin-press-discuss.md`
- Discovery phase completed: 29 files analyzed, 12 violations identified
- Plan drafted and reviewed: 14 steps across 4 phases
- Key findings: `actions.ts` is 368 lines (confirmed), shared `ActionResult<T>` exists in `lib/actions/types.ts` but unused, `types.ts` already has optional spectacles/evenements props, 17 other DAL files use `cache()` but press DALs don't
