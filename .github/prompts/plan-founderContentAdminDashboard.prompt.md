## Plan : `SectionFounder` → pipeline admin DB

**TL;DR** : `SectionFounder.tsx` est entièrement hardcodée et rendue **hors** du pipeline `SECTION_RENDERERS`. On ajoute `kind = "founder"` + colonne `milestones jsonb` dans `compagnie_presentation_sections`, on branche le composant sur les données DB, et on expose l'édition dans l'onglet Présentation existant de `/admin/compagnie`. Aucune nouvelle page ni entrée sidebar.

### Cartographie des données hardcodées → colonnes DB

| Constante actuelle | Colonne DB | Type |
|---|---|---|
| `FOUNDER_NAME = "Florian Chaillot"` | `title` | `text` |
| `FOUNDER_ROLE = "Metteur en scène..."` | `subtitle` | `text` |
| `FOUNDER_IMAGE_SRC = "https://..."` | `image_url` | `text` |
| `FOUNDER_BIO` (4 paragraphes) | `content` | `text[]` |
| `MILESTONES` (4 × `{year, label}`) | `milestones` | `jsonb` **(nouveau)** |

---

### Phase 1 — Base de données **(bloquant pour tout le reste)**

**Étape 1.1** — Schéma déclaratif `supabase/schemas/07c_table_compagnie_presentation.sql`
- Modifier le CHECK : `kind in ('hero','history','quote','values','team','mission','custom','founder')`
- Ajouter : `milestones jsonb null` avec `COMMENT ON COLUMN`

**Étape 1.2** — Migration `supabase/migrations/20260427140000_add_founder_section.sql`
- `ALTER TABLE ... DROP CONSTRAINT compagnie_presentation_sections_kind_check`
- `ALTER TABLE ... ADD CONSTRAINT ...` avec `'founder'` inclus
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS milestones jsonb`
- `INSERT` seed : slug=`founder`, kind=`founder`, + les 4 paragraphes bio, 4 milestones, image_url — toutes les données actuellement hardcodées dans `SectionFounder.tsx`

---

### Phase 2 — Schemas Zod `lib/schemas/compagnie-admin.ts` **(dépend de Phase 1)**

**Étape 2.1** Nouveau type `MilestoneItem` :
```bash
MilestoneItemSchema = z.object({ year: z.string(), label: z.string() })
```

**Étape 2.2** Ajouter `"founder"` au tableau `SECTION_KINDS`

**Étape 2.3** Étendre les 3 types existants (input/form/DTO) avec `milestones`

---

### Phase 3 — DAL public `lib/dal/compagnie-presentation.ts` **(dépend de Phase 2)**

- Ajouter `"founder"` à l'enum kind du Zod schema + champ `milestones`
- Étendre `SectionRecord` + `mapRecordToSection`

### Phase 4 — DAL admin `lib/dal/admin-compagnie-presentation.ts` **(parallel avec Phase 3)**

- `RawPresentationRow` : ajouter `milestones`
- `SECTION_SELECT_FIELDS` : ajouter `milestones`
- `mapToPresentationSectionDTO` : mapper `milestones`

---

### Phase 5 — Composants admin **(dépend de Phase 2)**

**Étape 5.1** Créer `components/features/admin/compagnie/MilestonesField.tsx` **(< 80 lignes)**
- Props : `{ value: MilestoneItem[], onChange: (items: MilestoneItem[]) => void }`
- UI : liste year + label, bouton Ajouter, bouton Supprimer par item, aria-labels

**Étape 5.2** Modifier `PresentationFormFields.tsx`
- Ajouter `"founder"` dans `SHOW_TITLE`, `SHOW_SUBTITLE`, `SHOW_CONTENT`, `SHOW_IMAGE_URL`
- Nouveau : `const SHOW_MILESTONES = ["founder"]` + rendu conditionnel `<MilestonesField />`
- `ImageField.Provider` pour founder : folder `"team"` (pas `"about"`)

**Étape 5.3** Modifier `PresentationForm.tsx`
- `KIND_LABELS` : `founder: "Fondateur"`
- `buildDefaultValues` : `milestones: item?.milestones ?? []` (et `[]` pour les defaults vides)

---

### Phase 6 — `SectionFounder.tsx` **(dépend de Phase 3)**

- Nouvelle signature : `function SectionFounder({ section }: SectionRendererProps)`
- Supprimer toutes les constantes hardcodées (`FOUNDER_NAME`, `FOUNDER_ROLE`, `FOUNDER_IMAGE_SRC`, `FOUNDER_BIO`, `MILESTONES`)
- Utiliser : `section.title`, `section.subtitle`, `section.image`, `section.content`, `section.milestones`
- Guards défensifs sur null
- Refactoring des sous-fonctions avec props explicites :
  - `FounderPortrait({ imageSrc, name })`
  - `FounderBio({ name, role, bio })`
  - `FounderMilestones({ milestones })`

---

### Phase 7 — `CompagnieView.tsx` **(dépend de Phase 6)**

- Ajouter `founder: SectionFounder` dans `SECTION_RENDERERS`
- **Supprimer** `<SectionFounder />` hardcodé en bas du `return`

---

### Phase 8 — Fallback **(parallel avec Phase 7)**

`lib/dal/fallback/compagnie-presentation-fallback.ts` : ajouter une entrée `founder` avec les données actuelles comme valeurs de fallback statique.

---

### Fichiers impactés (11)

| Fichier | Changement |
|---|---|
| `supabase/schemas/07c_table_compagnie_presentation.sql` | Modifier |
| `supabase/migrations/20260427140000_add_founder_section.sql` | **Créer** |
| `lib/schemas/compagnie-admin.ts` | Modifier |
| `lib/dal/compagnie-presentation.ts` | Modifier |
| `lib/dal/admin-compagnie-presentation.ts` | Modifier |
| `components/features/admin/compagnie/PresentationForm.tsx` | Modifier |
| `components/features/admin/compagnie/MilestonesField.tsx` | **Créer** |
| `components/features/admin/compagnie/PresentationFormFields.tsx` | Modifier |
| `components/features/public-site/compagnie/sections/SectionFounder.tsx` | Modifier |
| `components/features/public-site/compagnie/CompagnieView.tsx` | Modifier |
| `lib/dal/fallback/compagnie-presentation-fallback.ts` | Modifier |

---

### Vérification

1. `/compagnie` affiche la section fondateur avec les données DB (titre, bio, portrait, milestones)
2. `/admin/compagnie` onglet Présentation liste une ligne `founder` éditable
3. Modifier un milestone (year + label) dans le formulaire → sauvegarde en DB → rafraîchissement visible
4. Désactiver la section founder depuis l'admin → section masquée sur `/compagnie`
5. Si DB indisponible → fallback affiche les données statiques
6. `pnpm build` passe sans erreur TypeScript
7. `pnpm lint` passe sans erreur ESLint
