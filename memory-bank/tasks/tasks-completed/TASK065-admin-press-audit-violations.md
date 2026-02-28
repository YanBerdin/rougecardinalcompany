# TASK065 - Admin Press Audit Violations Fix

**Status:** Completed
**Added:** 2026-02-28
**Updated:** 2026-03-01

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

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1 | Ajouter `import "server-only"` dans actions.ts | Complete | 2026-02-28 | P0 — ajouté dans les 3 nouveaux fichiers actions |
| 2 | Migrer imports DAL → props Server Component | Complete | 2026-02-28 | P0 — pages new/edit passent spectacles/evenements en props |
| 3 | Remplacer `any` par `RawPressReleaseRow` | Complete | 2026-02-28 | P0 — interface typée dans admin-press-releases.ts |
| 4 | Split actions.ts → 3 fichiers | Complete | 2026-02-28 | P1 — press-releases-actions.ts, press-articles-actions.ts, press-contacts-actions.ts |
| 5 | Split admin-press-releases.ts → select-options | Complete | 2026-02-28 | P1 — admin-press-select-options.ts créé |
| 6 | Ajouter `cache()` sur lectures DAL | Complete | 2026-02-28 | P1 — 4 fichiers DAL wrappés |
| 7 | Migrer `dalSuccess`/`dalError` | Complete | 2026-02-28 | P1 — 4 fichiers DAL migrés |
| 8 | Utiliser `ActionResult<T>` partagé | Complete | 2026-02-28 | P1 — définition locale supprimée, import lib/actions/types + fix conditional data |
| 9 | Codes erreur fetch (série 010+) | Complete | 2026-02-28 | P1 — 8 fonctions avec codes [ERR_*_01N] |
| 10 | Harmoniser `.parseAsync()` | Complete | 2026-02-28 | P1 — articles + contacts actions migrés |
| 11 | Unifier pattern onSubmit ArticleEditForm | Complete | 2026-02-28 | P2 — pattern standard appliqué |
| 12 | Extraire formatDateFr dans helpers | Complete | 2026-02-28 | P2 — ajouté dans lib/dal/helpers/format.ts |
| 13 | Corriger form.watch() deps useEffect | Complete | 2026-02-28 | P2 — dépendances stabilisées PressReleaseNewForm |
| 14 | Validation finale (lint + build + grep) | Complete | 2026-02-28 | Gate — 0 erreurs lint, build OK |

## Progress Log

### 2026-02-28

- Task created from audit document `doc-perso/audit-admin-press-discuss.md`
- Discovery phase completed: 29 files analyzed, 12 violations identified
- Plan drafted and reviewed: 14 steps across 4 phases
- Key findings: `actions.ts` is 368 lines (confirmed), shared `ActionResult<T>` exists in `lib/actions/types.ts` but unused, `types.ts` already has optional spectacles/evenements props, 17 other DAL files use `cache()` but press DALs don't

### 2026-02-28 (implémentation complète)

- **Phase 1 (P0)** : `import "server-only"` ajouté dans les 3 nouveaux fichiers actions, imports DAL migrés hors Client Components (spectacles/evenements passés en props depuis Server Components new/edit), `any` remplacé par `RawPressReleaseRow` interface
- **Phase 2 (P1)** : `actions.ts` (368L) splitté en `press-releases-actions.ts` + `press-articles-actions.ts` + `press-contacts-actions.ts`, ancien `actions.ts` supprimé ; `admin-press-releases.ts` (341L) allégé avec extraction `admin-press-select-options.ts` ; `cache()` React ajouté sur toutes les lectures DAL (4 fichiers) ; `dalSuccess`/`dalError` helpers adoptés ; `ActionResult<T>` partagé depuis `lib/actions/types.ts` (fix: `data` conditionnel avec `T extends void`) ; codes erreur `[ERR_PRESS_*]` ajoutés ; `.parseAsync()` harmonisé
- **Phase 3 (P2)** : Pattern `onSubmit` unifié dans `ArticleEditForm.tsx`, `formatDateFr` extrait dans `lib/dal/helpers/format.ts`, dépendances `form.watch()` stabilisées dans `PressReleaseNewForm.tsx`
- **Phase 4** : `pnpm lint` 0 erreurs, `pnpm build` compiled successfully, grep validations OK, `wc -l` tous fichiers < 300 lignes
- **Commit** : `1ff52a3` sur branche `fix/admin-press-audit-violations`, 23 fichiers modifiés
- Score conformité : ~75% → ≥95%
