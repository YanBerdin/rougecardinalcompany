# TASK070 — Admin Compagnie CRUD (Valeurs, Stats, Présentation)

**Status:** Pending  
**Added:** 2026-03-03  
**Updated:** 2026-03-03

## Original Request

Créer la page admin `/admin/compagnie` avec 3 onglets tabulés (Valeurs, Chiffres clés, Présentation) pour gérer les tables `compagnie_values`, `compagnie_stats` et `compagnie_presentation_sections`. Le DAL existant est public-only — les DAL admin avec `requireAdmin()` sont à créer. Les RLS sont déjà configurées pour l'admin.

## Thought Process

- **Plan initial** : `plan-TASK070-adminCompagnie.prompt.md` — 9 étapes, page unique tabulée
- **Audit conformité** : 11 corrections identifiées et appliquées au plan :
  - CRITIQUE (3) : Split actions 3 fichiers (limite 300 lignes), `cache()` sur lectures DAL, `dalSuccess()`/`dalError()` helpers
  - HAUTE (4) : Fonctions reorder dans DAL, `buildMediaPublicUrl()` pour sections, `SELECT_FIELDS` constantes, `getNextPosition()` helper, conversion bigint→string dans Container
  - MOYENNE (2) : ReorderSchemas dans fichier schemas, classes responsive TabsList
  - BASSE (1) : Clarification sidebar "Compagnie" vs "La compagnie Section"
- **Patterns de référence** :
  - DAL : `lib/dal/admin-partners.ts` (CRUD+reorder complet, SOLID)
  - Schemas : `lib/schemas/partners.ts` (triple Server/UI/DTO + Reorder)
  - Actions : `app/(admin)/admin/presse/press-articles-actions.ts` (un fichier par entité)
  - Page : `app/(admin)/admin/presse/page.tsx` (Tabs responsive + Suspense)
  - Container : `components/features/admin/presse/PressReleasesContainer.tsx` (bigint→string)
- **Décisions architecturales** :
  - Page unique tabulée (pas de sous-routes) — centralise la gestion
  - 3 fichiers DAL séparés (SRP : 1 fichier = 1 table)
  - 3 fichiers d'actions séparés (limite 300 lignes)
  - 1 fichier de schémas partagé (~200 lignes, sous la limite)
  - `ContentArrayField` custom pour édition `text[]` (multi-textareas dynamiques)
  - Position numérique (pas de DnD) — simplicité

## Implementation Plan

1. Créer `lib/schemas/compagnie-admin.ts` — Server/UI/DTO schemas + Reorder schemas pour les 3 entités
2. Créer 3 DAL admin :
   - `lib/dal/admin-compagnie-values.ts` (6 fonctions + helpers)
   - `lib/dal/admin-compagnie-stats.ts` (6 fonctions + helpers)
   - `lib/dal/admin-compagnie-presentation.ts` (6 fonctions + helpers, media join)
3. Créer 3 fichiers Server Actions dans `app/(admin)/admin/compagnie/` (4 actions chacun)
4. Créer composants UI dans `components/features/admin/compagnie/` :
   - 4a. ValuesContainer + ValuesView + ValueForm
   - 4b. StatsContainer + StatsView + StatForm
   - 4c. PresentationContainer + PresentationView + PresentationForm + PresentationFormFields + ContentArrayField
   - types.ts + index.ts
5. Créer `app/(admin)/admin/compagnie/page.tsx` (Tabs + Suspense)
6. Modifier `AdminSidebar.tsx` — ajouter "Compagnie" dans `contentItems`
7. Créer skeleton (inline dans page.tsx, pattern presse)
8. Créer `scripts/test-admin-compagnie.ts` + entrée `package.json`
9. Vérification manuelle navigateur (7 points)

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID   | Description                                    | Status      | Updated | Notes |
| ---- | ---------------------------------------------- | ----------- | ------- | ----- |
| 70.1 | Schemas admin (Server/UI/DTO + Reorder × 3)   | Not Started | -       | ⏳    |
| 70.2 | DAL admin-compagnie-values.ts                  | Not Started | -       | ⏳    |
| 70.3 | DAL admin-compagnie-stats.ts                   | Not Started | -       | ⏳    |
| 70.4 | DAL admin-compagnie-presentation.ts            | Not Started | -       | ⏳    |
| 70.5 | Server Actions valeurs (4 actions)             | Not Started | -       | ⏳    |
| 70.6 | Server Actions stats (4 actions)               | Not Started | -       | ⏳    |
| 70.7 | Server Actions présentation (4 actions)        | Not Started | -       | ⏳    |
| 70.8 | UI Onglet Valeurs (Container+View+Form)        | Not Started | -       | ⏳    |
| 70.9 | UI Onglet Stats (Container+View+Form)          | Not Started | -       | ⏳    |
| 70.10| UI Onglet Présentation (Container+View+Form+Fields+ContentArrayField) | Not Started | - | ⏳ |
| 70.11| Page admin + route                             | Not Started | -       | ⏳    |
| 70.12| Sidebar navigation                             | Not Started | -       | ⏳    |
| 70.13| Script test DAL                                | Not Started | -       | ⏳    |
| 70.14| Vérification manuelle navigateur               | Not Started | -       | ⏳    |

## Progress Log

### 2026-03-03

- Plan initial audité contre toutes les instructions projet
- 11 corrections de conformité identifiées et intégrées au plan enrichi
- TASK070 créée avec plan d'implémentation détaillé en 14 subtasks
