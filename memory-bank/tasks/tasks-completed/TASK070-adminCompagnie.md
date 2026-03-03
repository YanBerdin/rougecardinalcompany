# TASK070 — Admin Compagnie + Stats → Home (Réorganisation architecturale)

**Status:** Completed  
**Added:** 2026-03-03  
**Updated:** 2026-03-06

## Original Request

Créer la page admin `/admin/compagnie` avec gestion des tables `compagnie_values` et `compagnie_presentation_sections`. Déplacer la gestion des Stats (table `compagnie_stats`) vers `/admin/home/about` car les stats alimentent la **homepage** (`/`), pas la page `/compagnie`.

## Thought Process

- **Plan v1** : `plan-TASK070-adminCompagnie.prompt.md` — 9 étapes, 3 onglets dans admin/compagnie
- **Correction architecturale (v2)** : Les Stats alimentent exclusivement la homepage → déplacement vers admin/home/about
- **Décision clé** : Table `compagnie_stats` conserve son nom en DB. Seuls les identifiants TS changent (`CompagnieStat*` → `HomeStat*`).
- **Plan v2** : 3 parties indépendantes (A, B, C) — voir `plan-TASK070-adminCompagnie.prompt.md`

### Architecture v2

```bash
Partie A — Admin Compagnie (2 onglets : Valeurs + Présentation)
  - Migration alt_text
  - ImageFieldGroup dans PresentationFormFields
  - Suppression Stats de cette page

Partie B — Stats → Admin Home About
  - Schemas HomeStat* dans home-content.ts
  - DAL admin-home-stats.ts (nouveau)
  - Actions home-stats-actions.ts (nouveau)
  - Composants déplacés vers components/features/admin/home/
  - Section Stats dans page admin/home/about

Partie C — Nettoyage + vérification
  - Suppression fichiers obsolètes
  - Vérification sidebar, grep, navigateur
```

### Patterns de référence

- DAL : `lib/dal/admin-partners.ts` (CRUD complet, SOLID)
- Schemas : `lib/schemas/partners.ts` (triple Server/UI/DTO)
- Actions : `app/(admin)/admin/presse/press-articles-actions.ts`
- ImageFieldGroup : `components/features/admin/media/ImageFieldGroup.tsx` (286 lignes, 14 props)

### Décisions architecturales

| # | Décision | Justification |
| --- | ---------- | --------------- |
| 1 | Table `compagnie_stats` garde son nom en DB | Pas de migration de renommage risquée |
| 2 | Stats → `admin/home/about` | Page existante, cible logique |
| 3 | `alt_text` par migration manuelle | Ajout colonne simple, hotfix pattern |
| 4 | ImageFieldGroup pour images Présentation | Pattern standard projet |
| 5 | Missions hors scope | Feature séparée |
| 6 | Parties A/B/C indépendantes | Parallélisables |
| 7 | `ActionResult` sans `data` | BigInt Three-Layer pattern |
| 8 | `kind`/`slug` cachés dans PresentationForm | Fixés à la création, non modifiables |
| 9 | `"history"` dans SHOW_IMAGE_URL | SectionHistory affiche une image, admin doit pouvoir la configurer |

## Implementation Plan

Voir plan détaillé : `.github/prompts/plan-TASK070-adminCompagnie.prompt.md` (v2)

### Partie A — Admin Compagnie (2 onglets)

- A1. Migration DB : ajout `alt_text` sur `compagnie_presentation_sections`
- A2. Schemas : ajout `alt_text`, suppression Stats de `compagnie-admin.ts`
- A3. DAL Presentation : ajout `alt_text`, suppression fonctions Stats
- A4. Actions Compagnie : vérification passage `alt_text`
- A5. Page admin/compagnie : 3 → 2 onglets
- A6a. PresentationForm : kind et slug en hidden fields
- A6b. PresentationFormFields : `"history"` dans SHOW_IMAGE_URL + ImageFieldGroup

### Partie B — Stats → Home

- B1. Schemas : HomeStat* dans `home-content.ts`
- B2. DAL : créer `admin-home-stats.ts` (5 fonctions)
- B3. Actions : créer `home-stats-actions.ts` (4 actions)
- B4. Composants : déplacer + renommer Stats → `admin/home/`
- B5. Page admin/home/about : intégrer section Stats

### Partie C — Nettoyage

- C1. Supprimer fichiers obsolètes
- C2. Vérifier sidebar
- C3. Script test Stats
- C4. Vérification navigateur (5 points)

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID    | Description                                                    | Status    | Updated    | Notes                                                                       |
| ----- | -------------------------------------------------------------- | --------- | ---------- | --------------------------------------------------------------------------- |
| 70.A1 | Migration alt_text sur compagnie_presentation_sections         | Complete  | 2026-03-02 | ✅ `20260302184850` + schéma déclaratif `07c` + 4 hotfix migrations position |
| 70.A2 | Schemas : alt_text + suppression Stats de compagnie-admin.ts   | Complete  | 2026-03-02 | ✅ Stats jamais créés ici (directement dans home-content.ts)                 |
| 70.A3 | DAL Presentation : alt_text + suppression fonctions Stats      | Complete  | 2026-03-02 | ✅ 2 DAL séparés dès le départ : presentation (230L) + values (194L)        |
| 70.A4 | Actions Compagnie : vérification alt_text                      | Complete  | 2026-03-06 | ✅ Presentation = UPDATE-only (42L). Values = CRUD+reorder (129L)           |
| 70.A5 | Page admin/compagnie : 2 onglets (suppression Chiffres clés)   | Complete  | 2026-03-02 | ✅ Ordre : Présentation (défaut) + Valeurs. `sm:grid-cols-2`               |
| 70.A6a| PresentationForm : kind/slug en hidden fields                  | Complete  | 2026-03-05 | ✅ slug hidden, kind affiché en Badge read-only                             |
| 70.A6b| PresentationFormFields : SHOW_IMAGE_URL + ImageFieldGroup      | Complete  | 2026-03-05 | ✅ `"history"` ajouté à SHOW_IMAGE_URL                                     |
| 70.B1 | Schemas HomeStat* dans home-content.ts                         | Complete  | 2026-03-03 | ✅ +46 lignes : Input, Form, DTO, ReorderSchema                            |
| 70.B2 | DAL admin-home-stats.ts (5 fonctions + cache)                  | Complete  | 2026-03-03 | ✅ 196 lignes, CRUD + reorder + cache()                                    |
| 70.B3 | Actions home-stats-actions.ts (4 actions + revalidate)         | Complete  | 2026-03-03 | ✅ 123 lignes dans lib/actions/ (pas colocalisé)                           |
| 70.B4 | Composants Stats déplacés vers admin/home/                     | Complete  | 2026-03-04 | ✅ Créés neufs : StatsContainer, StatsView, StatForm, types.ts             |
| 70.B5 | Page admin/home/about : section Stats                          | Complete  | 2026-03-04 | ✅ Separator + section aria-labelledby="stats-heading"                     |
| 70.C1 | Suppression fichiers Stats obsolètes                           | Complete  | 2026-03-06 | ✅ N/A — Stats jamais construites dans compagnie (architecture correcte dès v2) |
| 70.C2 | Vérification sidebar (aucun changement attendu)                | Complete  | 2026-03-04 | ✅ "Compagnie" ajouté + 3 renommages labels (Contenu→Pages, etc.)          |
| 70.C3 | Script test home-stats                                         | Complete  | 2026-03-05 | ✅ 2 scripts : test-admin-compagnie.ts (257L) + test-home-stats.ts (172L)  |
| 70.C4 | Vérification manuelle navigateur (5 points)                    | Complete  | 2026-03-06 | ✅ Bugs position trouvés et corrigés via 4 hotfix migrations               |
| 70.E1 | Schemas admin Values (inchangé depuis v1)                      | Complete  | 2026-03-02 | ✅ CompagnieValueInput/Form/DTO + ReorderSchema dans compagnie-admin.ts    |
| 70.E2 | DAL admin-compagnie-values.ts (inchangé depuis v1)             | Complete  | 2026-03-02 | ✅ 194 lignes, CRUD + reorder + cache()                                   |
| 70.E3 | Actions Values (inchangé depuis v1)                            | Complete  | 2026-03-02 | ✅ 4 actions (create, update, delete, reorder) en 129 lignes              |
| 70.E4 | UI Onglet Valeurs (Container+View+Form)                        | Complete  | 2026-03-04 | ✅ ValuesContainer, ValuesView, ValueForm + ContentArrayField              |

### Travail supplémentaire (hors plan)

| ID     | Description                          | Status   | Updated    | Notes                                                          |
| ------ | ------------------------------------ | -------- | ---------- | -------------------------------------------------------------- |
| 70.X1  | Reorder Values (schema+DAL+action)   | Complete | 2026-03-03 | Pattern standard CRUD avec position                             |
| 70.X2  | Reorder Home Stats (schema+DAL+action)| Complete | 2026-03-03 | Pattern standard CRUD avec position                             |
| 70.X3  | 2 sous-pages read-only               | Complete | 2026-03-04 | presentation/page.tsx (136L) + valeurs/page.tsx (92L)          |
| 70.X4  | 4 migrations hotfix position         | Complete | 2026-03-05 | hero, mission, history, quote-history — fix Zod `.default(0)`  |
| 70.X5  | Fix Zod `.default(0)` → `.optional()`| Complete | 2026-03-05 | Bug critique : `.partial()` ne neutralise pas `.default()`     |
| 70.X6  | Fix slug `.optional().or(z.literal(""))` | Complete | 2026-03-05 | Sections sans slug (mission) rejetées par validation        |
| 70.X7  | ContentArrayField.tsx                | Complete | 2026-03-04 | 106 lignes — éditeur de champs `text[]`                        |
| 70.X8  | Sidebar renommages labels            | Complete | 2026-03-04 | Contenu→Pages, 2 sous-items renommés                           |

## Progress Log

### 2026-03-03

- Plan v1 créé avec 14 subtasks et 11 corrections d'audit conformité
- TASK070 initialisée

### 2026-03-05

- **Correction architecturale majeure** : Stats (Chiffres clés) alimentent la homepage (/), pas /compagnie
- Plan restructuré en v2 avec 3 parties (A: Compagnie 2 onglets, B: Stats→Home, C: Nettoyage)
- Ajout ImageFieldGroup pour les images Presentation (remplace Input URL)
- Ajout migration alt_text pour l'accessibilité
- Subtasks réorganisées : 15 nouvelles (A1-A6, B1-B5, C1-C4) + 4 existantes (E1-E4)
- Fichier plan prompt mis à jour vers v2

### 2026-03-06

- **Affinement UX formulaire Présentation** : `kind` et `slug` deviennent des champs complètement cachés (hidden fields) dans PresentationForm.tsx
- **Image pour SectionHistory** : ajout de `"history"` dans `SHOW_IMAGE_URL` pour permettre l'édition de l'image via ImageFieldGroup
- Subtask 70.A6 scindée en 70.A6a (hidden kind/slug) et 70.A6b (SHOW_IMAGE_URL + ImageFieldGroup)
- Décisions #8 et #9 ajoutées
- Plan prompt mis à jour vers v2.1

### 2026-03-02 → 2026-03-06 — Implémentation complète

#### Partie A — Admin Compagnie (2 onglets)

- **A1** : Migration `20260302184850_add_alt_text_to_compagnie_presentation.sql` créée et appliquée. Schéma déclaratif `07c` mis à jour.
- **A2** : Schema `compagnie-admin.ts` (142 lignes) créé avec Values + Presentation. Stats **jamais inclus** ici — directement dans `home-content.ts`. Fix Zod : `position` `.default(0)` → `.optional()`, slug `.min(1)` → `.optional().or(z.literal(""))`.
- **A3** : 2 DAL séparés créés : `admin-compagnie-presentation.ts` (230L) et `admin-compagnie-values.ts` (194L) avec CRUD complet + reorder + `cache()`.
- **A4** : Actions Presentation simplifiées à **UPDATE-only** (42 lignes). Actions Values complètes avec 4 actions dont reorder (129 lignes). Create/delete Presentation supprimés car les 6 sections sont fixes en DB.
- **A5** : Page `page.tsx` (67L) avec 2 onglets : Présentation (défaut) + Valeurs. Utilise `sm:grid-cols-2` car 2 onglets.
- **A6a/A6b** : PresentationForm = update-only (guard `if (!item) return`). Kind en Badge read-only, slug hidden. ImageFieldGroup avec `"history"` dans `SHOW_IMAGE_URL`.
- **E1-E4** : Onglet Valeurs complet — ValuesContainer, ValuesView, ValueForm, ContentArrayField (éditeur `text[]`).
- **BONUS** : 2 sous-pages read-only Server Component (`presentation/page.tsx` 136L, `valeurs/page.tsx` 92L).
- **BONUS** : `ContentArrayField.tsx` (106L) — composant custom pour éditer les tableaux de paragraphes.

#### Bug critique — Position Reset (Zod `.partial()` + `.default()`)

- **Découverte** : L'update d'une section réinitialisait `position` à 0 et `active` à false. Cause : Zod `.partial()` ne neutralise PAS `.default()`. Le champ omis reçoit toujours la valeur par défaut.
- **Fix schema** : Remplacé `.default(0)` par `.optional()` sur `position`, `.default(true)` par `.optional()` sur `active`.
- **Fix form** : Ajout du stripping de `position` dans `onSubmit` de ValueForm (ne pas envoyer la position dans les updates pour éviter conflits avec reorder).
- **4 migrations hotfix** pour restaurer les positions corrompues en DB :
  - `20260302200002` — hero positions normalisées (0/10/20/30/40/50)
  - `20260302210000` — mission restaurée position 30
  - `20260303120000` — history restaurée position 20
  - `20260303130000` — quote-history restaurée position 25

#### Partie B — Stats → Admin Home About

- **B1** : Schemas HomeStat ajoutés dans `home-content.ts` (+46 lignes) : Input, Form, DTO, ReorderSchema.
- **B2** : DAL `admin-home-stats.ts` (196L) avec 5 fonctions (fetch, create, update, delete, reorder) + `cache()`. Table DB : `compagnie_stats` (nom conservé).
- **B3** : Actions `home-stats-actions.ts` (123L) dans `lib/actions/` avec 4 actions CRUD + reorder. Revalidation : `/admin/home/about` + `/`.
- **B4** : Composants créés neufs dans `components/features/admin/home/` : StatsContainer (22L), StatsView (151L), StatForm (153L), types.ts (14L).
- **B5** : Page `admin/home/about/page.tsx` modifiée (+16L) : section Stats avec `<Separator />` et `aria-labelledby="stats-heading"`.

#### Partie C — Nettoyage

- **C1** : N/A — `compagnie-stats-actions.ts` n'a jamais existé (architecture correcte dès le départ, Stats construites directement dans home-stats-actions.ts).
- **C2** : Sidebar enrichie : "Compagnie" ajouté avec Building2. Renommages : Contenu→Pages, "Accueil Slides"→"Accueil - Slides", "La compagnie Section"→"Accueil - La compagnie".
- **C3** : 2 scripts de test créés (plan prévoyait 1) : `test-admin-compagnie.ts` (257L), `test-home-stats.ts` (172L). Scripts `package.json` ajoutés.
- **C4** : Vérification navigateur effectuée pendant le développement — 4 bugs position trouvés et corrigés.

#### Nettoyage final

- Suppression des actions inutilisées `createPresentationSectionAction` et `deletePresentationSectionAction` du fichier actions.
- Fix TypeScript dans PresentationForm.tsx (référence à action supprimée).
- Tous les fichiers stagés (`git add .`).

### Bilan

- **39 fichiers** modifiés/créés : 3626 insertions, 622 suppressions
- **20/20 subtasks** du plan complétées + **8 tâches supplémentaires** (70.X1-X8)
- **5 migrations** appliquées (1 feature + 4 hotfix)
- **Leçon clé** : Zod `.partial()` + `.default()` = bug silencieux. Toujours utiliser `.optional()` pour les champs avec position/active dans les schemas server.
