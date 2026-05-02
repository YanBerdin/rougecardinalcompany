# Plan: TASK090 — Founder Content Admin Dashboard

## TL;DR

`SectionFounder.tsx` est entièrement hardcodée. Rendre administrable la section fondateur (`SectionFounder`) en l'intégrant comme un
nouveau `kind = 'founder'` dans la table existante `compagnie_presentation_sections`,
avec une colonne `milestones jsonb` pour la liste éditable. Pipeline complet :
DB → DAL → schémas Zod → admin UI (dans `/admin/compagnie`) → rendu public data-driven
via `SECTION_RENDERERS`.

## Décisions verrouillées

- Modèle : **un seul nouveau `kind = 'founder'`** dans `compagnie_presentation_sections` (pas de table dédiée)
- Stockage milestones : **`jsonb`** = `Array<{ year: string, label: string }>` (typé, ordonné, ≤ 20 items)
- Réutilisation des colonnes existantes pour founder :
  - `title` → nom du fondateur
  - `subtitle` → rôle
  - `content[]` → bio (paragraphes)
  - `image_media_id` / `image_url` / `alt_text` → portrait
  - `milestones` (nouvelle colonne) → dates clés
- Aucune nouvelle entrée sidebar : édition via formulaire existant `/admin/compagnie`
- Seed : la migration insère **une row founder unique** (slug=`founder`) avec les valeurs hardcodées actuelles de `SectionFounder.tsx`
- Pas de suppression possible : un seul founder, modification uniquement (cohérent avec le pattern actuel — `PresentationView` n'expose que "Modifier")

---

## Phase 1 — Modèle de données (bloquant pour 2/3/4/5)

### 1.1 Schéma déclaratif

- Modifier `supabase/schemas/07c_table_compagnie_presentation.sql` :
  - Étendre la contrainte CHECK : `kind in ('hero','history','quote','values','team','mission','founder','custom')`
  - Ajouter colonne `milestones jsonb null` (à la fin du `create table`, avant `created_at`)
  - Ajouter `comment on column ... .milestones is 'Liste ordonnée de jalons biographiques (year, label) si kind = founder.'`
  - Pas d'index nécessaire (jsonb consulté uniquement via SELECT par row)
  - Policies RLS inchangées (la table garde le même modèle d'accès)

### 1.2 Génération de la migration

- `pnpm dlx supabase stop`
- `pnpm dlx supabase db diff -f task090_founder_section`
- Vérifier le fichier généré : doit contenir uniquement `ALTER TABLE` (drop+add CHECK, add column milestones)
- Compléter manuellement la migration avec un INSERT idempotent du seed founder :

  ```sql
  insert into public.compagnie_presentation_sections
    (slug, kind, title, subtitle, content, milestones, position, active)
  values ('founder', 'founder', 'Florian Chaillot', 'Metteur en scène & Fondateur',
    array[...], '[{...}]'::jsonb, <next_position>, true)
  on conflict (slug) do nothing;
  ```

- Documenter la migration dans `supabase/migrations/migrations.md`

---

## Phase 2 — Schémas TypeScript et DAL (bloquant pour 3/4/5, dépend de 1)

### 2.1 `lib/schemas/compagnie-admin.ts`

- Étendre `SECTION_KINDS` : ajouter `'founder'`
- Ajouter le sous-schéma `MilestoneSchema = z.object({ year: z.string().min(1).max(10), label: z.string().min(1).max(120) })`
- `PresentationSectionInputSchema` : ajouter `milestones: z.array(MilestoneSchema).max(20).optional().nullable()`
- `PresentationSectionFormSchema` : idem (UI = même structure, pas de bigint à gérer)
- `PresentationSectionDTO` : ajouter `milestones: Array<{ year: string; label: string }> | null`

### 2.2 `lib/dal/admin-compagnie-presentation.ts`

- `RawPresentationRow` : ajouter `milestones: unknown`
- `SECTION_SELECT_FIELDS` : ajouter `milestones`
- `mapToPresentationSectionDTO` : parser milestones défensivement (`Array.isArray` + filter shape `{year, label}`) ou `null`
- `createPresentationSection` & `updatePresentationSection` : propager `milestones` (null si absent ou tableau vide)

### 2.3 `lib/dal/compagnie-presentation.ts` (lecture publique)

- Étendre l'enum `kind` du `PresentationSectionSchema` Zod : ajouter `'founder'`
- Étendre `SectionRecord` avec `milestones`
- Étendre `PresentationSection` (type Zod public) avec un champ optionnel `milestones?: Array<{year, label}>`
- `mapRecordToSection` : si `kind === 'founder'`, inclure `milestones` dans la sortie
- Ajuster la requête SELECT pour inclure `milestones`

### 2.4 Fallback statique

- `lib/dal/fallback/compagnie-presentation-fallback.ts` : ajouter une entrée `founder` reprenant les constantes hardcodées de `SectionFounder.tsx` (bio, milestones, image)

---

## Phase 3 — Rendu public data-driven (dépend de 2)

### 3.1 `components/features/public-site/compagnie/sections/SectionFounder.tsx`

- Refactor en composant **piloté par props** : signature `{ section: PresentationSection }: SectionRendererProps`
- Mapping :
  - `FOUNDER_NAME` ← `section.title ?? ""`
  - `FOUNDER_ROLE` ← `section.subtitle ?? ""`
  - `FOUNDER_BIO` ← `section.content ?? []`
  - `FOUNDER_IMAGE_SRC` ← `section.image ?? ""` (avec fallback ou guard si absent)
  - `MILESTONES` ← `section.milestones ?? []`
- Supprimer les constantes hardcodées
- Préserver intégralement le markup, classes Tailwind, ARIA, structure responsive
- Guards défensifs : si `image` absente → ne pas rendre `FounderPortrait` (ou rendre un placeholder neutre) ; si `milestones` vide → masquer `FounderMilestones`

### 3.2 `components/features/public-site/compagnie/CompagnieView.tsx`

- Ajouter `founder: SectionFounder` dans la map `SECTION_RENDERERS`
- Supprimer le `<SectionFounder />` rendu hardcodé en bas du return
- L'ordre d'affichage est désormais piloté par la colonne `position` en DB

### 3.3 `components/features/public-site/compagnie/sections/types.ts`

- `SectionRendererProps` n'a pas besoin de modification structurelle (founder réutilise `section`) — vérifier que `PresentationSection` du DAL public expose bien `milestones`

---

## Phase 4 — UI Admin (dépend de 2, parallélisable avec 5)

### 4.1 Nouveau sous-composant `MilestonesArrayField.tsx`

- Fichier : `components/features/admin/compagnie/MilestonesArrayField.tsx`
- Calqué sur `ContentArrayField.tsx` mais avec **2 inputs par item** (`year` + `label`)
- Props : `value: Array<{year, label}>`, `onChange`, `label`, MAX 20
- A11y : `<fieldset>`, labels associés, focus management après add/remove (pattern identique)
- Pas de réordonnancement drag-and-drop dans cette phase (déjà hors scope du pattern existant) — gardé pour compat

### 4.2 `PresentationFormFields.tsx`

- Ajouter constantes :
  - `SHOW_TITLE` : ajouter `'founder'`
  - `SHOW_SUBTITLE` : ajouter `'founder'`
  - `SHOW_CONTENT` : ajouter `'founder'`
  - `SHOW_IMAGE_URL` : ajouter `'founder'` (réutilise `ImageField`)
  - Nouveau : `SHOW_MILESTONES = ['founder', 'custom']`
- Ajouter le champ `milestones` conditionnel (FormField + MilestonesArrayField)
- Personnaliser optionnellement les labels visibles si `kind === 'founder'` (ex: "Nom du fondateur" au lieu de "Titre") — décision : garder labels génériques pour MVP, libellés explicités via helper texts ou laissés à v2

### 4.3 `PresentationForm.tsx`

- `KIND_LABELS` : ajouter `founder: "Fondateur"`
- `buildDefaultValues` : ajouter `milestones: item?.milestones ?? []` (et `[]` en branche "no item")
- Aucune autre modification (le pipeline `updatePresentationSectionAction` accepte déjà `unknown`)

### 4.4 `PresentationView.tsx`

- `KIND_LABELS` : ajouter `founder: "Fondateur"`
- Aucune autre modification (la liste affiche déjà toutes les sections, founder apparaîtra naturellement avec son badge)

### 4.5 `components/features/admin/compagnie/index.ts`

- Exporter `MilestonesArrayField` si requis pour cohérence (sinon import direct depuis `PresentationFormFields`)

### 4.6 (optionnel) Visibilité dashboard

- Page `app/(admin)/admin/compagnie/page.tsx` : aucune action — la `PresentationContainer` liste déjà toutes les sections actives + inactives. Founder apparaîtra automatiquement.

---

## Phase 5 — Server Action (dépend de 2, parallélisable avec 4)

### 5.1 `app/(admin)/admin/compagnie/compagnie-presentation-actions.ts`

- **Aucun changement structurel requis** : `updatePresentationSectionAction` valide déjà via `PresentationSectionInputSchema.partial()`, donc `milestones` est validé automatiquement dès Phase 2.1.
- Vérifier : `revalidatePath('/admin/compagnie')` + `revalidatePath('/compagnie')` toujours appelés.
- Décision : pas de Server Action `createFounder` ni `deleteFounder` (single-row seedée, modification uniquement).

---

## Phase 6 — Migration et déploiement (dépend de 1)

- Phase déjà couverte par 1.2.
- Sécurité : vérifier que les policies RLS existantes restent cohérentes (CHECK étendu n'affecte pas RLS) — pas d'action requise.
- Run smoke : `pnpm dev` → `/admin/compagnie` doit afficher la nouvelle section founder dans la liste.

---

## Phase 7 — Vérification

### 7.1 Automatisée

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm build`

### 7.2 Manuelle admin

- `/admin/compagnie` : section "Fondateur" visible avec badge `Fondateur`
- Édition : modifier nom, rôle, bio (ajout/suppression paragraphes), image (via ImageField → upload + médiathèque), alt_text, milestones (ajout/suppression/édition year+label), toggle actif
- Submit → toast succès + `router.refresh()` → données persistées

### 7.3 Manuelle public

- `/compagnie` : section fondateur rendue à la position attendue, image affichée, milestones dans l'ordre saisi, bio paragraphes, responsive (mobile : portrait masqué, milestones rendues sous bio)
- Désactiver section (active=false) → disparition côté public, conservation côté admin
- A11y : navigation clavier dans le formulaire milestones, alt_text appliqué à l'image

### 7.4 Non-régression

- Hero, History, Quote, Values, Team, Mission, Custom : rendu identique côté public et admin
- Ordre des sections inchangé (sauf insertion founder)

---

## Relevant files

- `supabase/schemas/07c_table_compagnie_presentation.sql` — étendre CHECK kind + ajouter colonne `milestones jsonb`
- `supabase/migrations/<timestamp>_task090_founder_section.sql` — généré + INSERT seed manuel
- `supabase/migrations/migrations.md` — documenter la migration
- `lib/schemas/compagnie-admin.ts` — `SECTION_KINDS`, `MilestoneSchema`, `PresentationSectionInputSchema`, `PresentationSectionFormSchema`, `PresentationSectionDTO`
- `lib/dal/admin-compagnie-presentation.ts` — `RawPresentationRow`, `SECTION_SELECT_FIELDS`, `mapToPresentationSectionDTO`, create/update propagation
- `lib/dal/compagnie-presentation.ts` — `PresentationSectionSchema`, `SectionRecord`, `mapRecordToSection`, SELECT
- `lib/dal/fallback/compagnie-presentation-fallback.ts` — entrée founder
- `components/features/public-site/compagnie/sections/SectionFounder.tsx` — refactor data-driven `(section) => JSX`
- `components/features/public-site/compagnie/CompagnieView.tsx` — ajout `founder` dans `SECTION_RENDERERS`, suppression `<SectionFounder />` hardcodé
- `components/features/admin/compagnie/MilestonesArrayField.tsx` — **nouveau** composant (calqué sur `ContentArrayField`)
- `components/features/admin/compagnie/PresentationFormFields.tsx` — constantes `SHOW_*` + champ milestones conditionnel
- `components/features/admin/compagnie/PresentationForm.tsx` — `KIND_LABELS`, `buildDefaultValues` (milestones)
- `components/features/admin/compagnie/PresentationView.tsx` — `KIND_LABELS`
- `app/(admin)/admin/compagnie/compagnie-presentation-actions.ts` — vérifier (aucune modif structurelle attendue)

---

## Scope

**Inclus**

- Édition complète founder dans `/admin/compagnie` (nom, rôle, bio, image, alt_text, milestones, actif)
- Rendu public branché DB
- Seed founder via migration (préserve contenu actuel)
- Fallback statique cohérent

**Exclus**

- Page admin séparée hors `/admin/compagnie`
- Refonte visuelle de la section
- Drag-and-drop reorder des milestones
- Création/suppression de plusieurs fondateurs (single-row)
- Versioning/audit spécifique founder (couvert par audit triggers existants sur la table)
