## Plan v2 : Admin Compagnie + Stats → Home — Réorganisation architecturale

> **TASK070** — Ce plan corrige l'architecture initiale (v1) qui plaçait les Stats (Chiffres clés) sous `admin/compagnie` alors qu'elles alimentent exclusivement la **homepage** (`/`). Le plan est découpé en 3 parties indépendantes : **A** — Admin Compagnie (2 onglets), **B** — Stats → Admin Home, **C** — Nettoyage et vérification.
>
> **Décision clé** : La table `compagnie_stats` conserve son nom en base. Seuls les identifiants TypeScript changent (`CompagnieStat*` → `HomeStat*`). Aucune migration de renommage de table n'est nécessaire.

---

## Bilan d'implémentation (post-mortem)

> **Statut final** : Implémenté — 39 fichiers (3626 insertions, 622 suppressions)
> **Date** : 2026-03-02 → 2026-03-06

### Déviations par rapport au plan

| # | Étape plan | Déviation | Raison |
|---|-----------|-----------|--------|
| 1 | A4 — Actions Presentation CRUD | **UPDATE-ONLY** : `createPresentationSectionAction` et `deletePresentationSectionAction` supprimés | Les sections présentation sont fixées en DB (6 sections), pas d'ajout/suppression en admin |
| 2 | A5 — Onglets | Ordre inversé : **Présentation** (défaut) + Valeurs | UX : la présentation est consultée plus souvent |
| 3 | C2 — Sidebar "aucun changement" | **3 renommages** : "Contenu"→"Pages", "Accueil Slides"→"Accueil - Slides", "La compagnie Section"→"Accueil - La compagnie" | Meilleure lisibilité du menu |

### Travail supplémentaire (hors plan)

| # | Ajout | Fichiers | Raison |
|---|-------|----------|--------|
| 1 | **Reorder Values** | `ReorderCompagnieValuesSchema` + `reorderCompagnieValues` DAL + `reorderCompagnieValuesAction` | Fonctionnalité Standard CRUD du projet |
| 2 | **Reorder Home Stats** | `ReorderHomeStatsSchema` + `reorderHomeStats` DAL + `reorderHomeStatsAction` | Fonctionnalité Standard CRUD du projet |
| 3 | **2 sous-pages lecture seule** | `compagnie/presentation/page.tsx` (136L) + `compagnie/valeurs/page.tsx` (92L) | Pages Server Component pour consultation rapide |
| 4 | **4 migrations hotfix position** | `20260302200002`, `20260302210000`, `20260303120000`, `20260303130000` | Bug Zod `.default(0)` + `.partial()` qui réinitialisait les positions |
| 5 | **Fix Zod position** | `.default(0)` → `.optional()` dans schemas server | `.partial()` ne neutralise pas `.default()` — valeur 0 toujours générée |
| 6 | **Fix Zod slug** | `.min(1)` → `.optional().or(z.literal(""))` | Sections sans slug (ex: mission) rejetées par la validation |
| 7 | **2 scripts de test** | `test-admin-compagnie.ts` (257L) + `test-home-stats.ts` (172L) | Plan prévoyait 1 seul script |
| 8 | **ContentArrayField.tsx** | 106 lignes — éditeur de champs `text[]` | Nécessaire pour `content` (tableau de paragraphes) |

### Leçons apprises

1. **Zod `.partial()` + `.default()`** : Ne JAMAIS combiner. `.partial()` rend le champ optionnel mais `.default()` fournit toujours une valeur → le champ n'est jamais absent. Utiliser `.optional()` à la place.
2. **Présentation = edit-only** : Les sections de présentation étant fixées en base (6 sections avec kind+slug prédéfinis), le CRUD complet n'est pas nécessaire. Un simple UPDATE suffit.
3. **Reorder systématique** : Tout CRUD avec position devrait inclure le reorder dès le départ.

---

## Partie A — Admin Compagnie : Valeurs + Présentation (2 onglets)

### Étape A1 — Migration DB : ajout `alt_text` sur `compagnie_presentation_sections`

Créer une migration manuelle dans `supabase/migrations/` (hotfix pattern car `alt_text` est un ajout de colonne simple).

```sql
-- YYYYMMDDHHmmss_add_alt_text_to_compagnie_presentation.sql
alter table public.compagnie_presentation_sections
  add column alt_text text;

comment on column public.compagnie_presentation_sections.alt_text
  is 'Texte alternatif pour l''image de la section (accessibilité WCAG 2.2)';
```

Mettre à jour le schéma déclaratif correspondant dans [supabase/schemas/07c_table_compagnie_presentation.sql](supabase/schemas/07c_table_compagnie_presentation.sql) pour y ajouter la colonne `alt_text text` en fin de table.

**Fichiers impactés** :

- `supabase/migrations/YYYYMMDDHHmmss_add_alt_text_to_compagnie_presentation.sql` (nouveau)
- `supabase/schemas/07c_table_compagnie_presentation.sql` (ajout colonne)

---

### Étape A2 — Schemas : ajout `alt_text` dans les schemas Presentation

Modifier [lib/schemas/compagnie-admin.ts](lib/schemas/compagnie-admin.ts) :

1. **Supprimer** tous les schemas Stats (`CompagnieStatInputSchema`, `CompagnieStatFormSchema`, `CompagnieStatDTO`, etc.) — ils seront recréés dans `home-content.ts` à l'étape B1.
2. **Ajouter** `alt_text` au `PresentationSectionInputSchema` (server : `z.string().nullable().optional()`).
3. **Ajouter** `alt_text` au `PresentationSectionFormSchema` (UI : `z.string().optional()`).
4. **Ajouter** `alt_text` au type `PresentationSectionDTO`.

**Fichiers impactés** :

- [lib/schemas/compagnie-admin.ts](lib/schemas/compagnie-admin.ts) (modification)

---

### Étape A3 — DAL Presentation : ajouter `alt_text` dans les requêtes

Modifier [lib/dal/admin-compagnie.ts](lib/dal/admin-compagnie.ts) :

1. **Supprimer** les fonctions relatives aux Stats (`fetchCompagnieStats`, `createCompagnieStat`, `updateCompagnieStat`, `deleteCompagnieStat`, `reorderCompagnieStats`) — elles seront recréées dans un nouveau DAL à l'étape B2.
2. **Ajouter** `alt_text` dans les `select()` des fonctions Presentation (`fetchPresentationSections`, `createPresentationSection`, `updatePresentationSection`).
3. **Ajouter** `alt_text` dans les `insert()` / `update()` des mutations Presentation.

**Fichiers impactés** :

- [lib/dal/admin-compagnie.ts](lib/dal/admin-compagnie.ts) (modification)

---

### Étape A4 — Actions Compagnie : supprimer les actions Stats

Modifier [lib/actions/compagnie-stats-actions.ts](lib/actions/compagnie-stats-actions.ts) :

Ce fichier sera **supprimé en entier** à l'étape C1. Pour l'instant, ne rien modifier — les actions Stats continuent de fonctionner tant que la partie B n'est pas terminée.

Modifier [lib/actions/compagnie-admin-actions.ts](lib/actions/compagnie-admin-actions.ts) (si existant) :

- Vérifier que les actions Presentation passent bien `alt_text` au DAL.

**Fichiers impactés** :

- Actions Compagnie existantes (vérification uniquement)

---

### Étape A5 — Page admin/compagnie : passer de 3 à 2 onglets

Modifier [app/(admin)/admin/compagnie/page.tsx](app/(admin)/admin/compagnie/page.tsx) :

1. **Supprimer** l'onglet "Chiffres clés" du composant `Tabs`.
2. Garder uniquement les 2 onglets : **Valeurs** et **Présentation**.
3. **Supprimer** l'import de `StatsContainer` (ou composant Stats équivalent).

**Fichiers impactés** :

- [app/(admin)/admin/compagnie/page.tsx](app/(admin)/admin/compagnie/page.tsx) (modification)

---

### Étape A6 — PresentationForm : champs cachés + ImageFieldGroup pour images

#### A6a — PresentationForm.tsx : `kind` et `slug` en hidden fields

Modifier [components/features/admin/compagnie/PresentationForm.tsx](components/features/admin/compagnie/PresentationForm.tsx) :

1. **Supprimer** le `<Select>` pour `kind` et le `<Input>` pour `slug` du rendu visible.
2. **Conserver** les valeurs dans le state du formulaire (elles sont transmises au Server Action via `form.getValues()`).
3. Le formulaire ne doit plus afficher ni permettre la modification de `kind` et `slug`. Ces valeurs sont fixées à la création et ne changent jamais.
4. Optionnel : afficher le `kind` en lecture seule (badge ou texte) pour contexte visuel, si pertinent UX.

#### A6b — PresentationFormFields.tsx : ImageFieldGroup + `"history"` dans SHOW_IMAGE_URL

Modifier [components/features/admin/compagnie/PresentationFormFields.tsx](components/features/admin/compagnie/PresentationFormFields.tsx) :

1. **Modifier** la constante `SHOW_IMAGE_URL` : `["hero", "custom"]` → `["hero", "history", "custom"]`.
   Cela permet au kind `"history"` d'afficher le champ image dans le formulaire admin, aligné avec le rendu public `SectionHistory.tsx` qui affiche déjà `section.image`.
2. **Supprimer** le champ `<Input type="url">` pour `image_url` (lignes ~130-145).
3. **Ajouter** le composant `ImageFieldGroup` avec les props :
   - `form={form}`
   - `imageUrlField="image_url"`
   - `imageMediaIdField="image_media_id"`
   - `altTextField="alt_text"`
   - `uploadFolder="about"`
   - `label="Image de section"`
   - `description="Sélectionnez une image depuis la médiathèque"`
4. Importer `ImageFieldGroup` depuis `@/components/features/admin/media/ImageFieldGroup`.

**Fichiers impactés** :

- [components/features/admin/compagnie/PresentationForm.tsx](components/features/admin/compagnie/PresentationForm.tsx) (suppression kind/slug visibles)
- [components/features/admin/compagnie/PresentationFormFields.tsx](components/features/admin/compagnie/PresentationFormFields.tsx) (SHOW_IMAGE_URL + ImageFieldGroup)

---

## Partie B — Stats (Chiffres clés) → Admin Home About

### Étape B1 — Schemas : créer HomeStat* dans home-content.ts

Modifier [lib/schemas/home-content.ts](lib/schemas/home-content.ts) :

1. **Ajouter** `HomeStatInputSchema` (server) — identique à l'ancien `CompagnieStatInputSchema` mais avec le préfixe `HomeStat`. Champs : `label` (string), `value` (string), `icon` (string nullable optional), `position` (bigint coerce), `active` (boolean).
2. **Ajouter** `HomeStatFormSchema` (UI) — `position` en `z.number().int().positive()`.
3. **Ajouter** type `HomeStatDTO` — `id: bigint`, `label: string`, `value: string`, `icon: string | null`, `position: number`, `active: boolean`, `created_at: string`, `updated_at: string`.
4. **Exporter** les 3 (`HomeStatInputSchema`, `HomeStatFormSchema`, `HomeStatDTO`).

**Fichiers impactés** :

- [lib/schemas/home-content.ts](lib/schemas/home-content.ts) (ajout)

---

### Étape B2 — DAL : créer admin-home-stats.ts

Créer [lib/dal/admin-home-stats.ts](lib/dal/admin-home-stats.ts) :

1. Header : `"use server"` + `import "server-only"`.
2. Imports : `createClient`, `requireAdmin`, `cache`, `dalSuccess`, `dalError` depuis les helpers DAL.
3. **Fonctions** (toutes wrappées dans `cache()` pour les lectures) :
   - `fetchHomeStats()` → `select('id, label, value, icon, position, active')` depuis `compagnie_stats` → `order('position')` → retourne `DALResult<HomeStatDTO[]>`.
   - `createHomeStat(input: HomeStatInput)` → `insert()` + `select().single()` → `DALResult<HomeStatDTO>`.
   - `updateHomeStat(id: bigint, input: Partial<HomeStatInput>)` → `update().eq('id', id)` + `select().single()` → `DALResult<HomeStatDTO>`.
   - `deleteHomeStat(id: bigint)` → `delete().eq('id', id)` → `DALResult<null>`.
   - `reorderHomeStats(orderedIds: bigint[])` → boucle `update().eq('id', id).set({ position })` → `DALResult<null>`.
4. **Codes d'erreur** : `[ERR_HOME_S01]` fetch, `[ERR_HOME_S02]` create, `[ERR_HOME_S03]` update, `[ERR_HOME_S04]` delete, `[ERR_HOME_S05]` reorder.
5. **Table DB** : `compagnie_stats` (nom inchangé en base).

**Fichiers impactés** :

- [lib/dal/admin-home-stats.ts](lib/dal/admin-home-stats.ts) (nouveau)

---

### Étape B3 — Actions : créer home-stats-actions.ts

Créer [lib/actions/home-stats-actions.ts](lib/actions/home-stats-actions.ts) :

1. Header : `"use server"` + `import "server-only"`.
2. Import des fonctions DAL depuis `@/lib/dal/admin-home-stats`.
3. Import `HomeStatInputSchema` depuis `@/lib/schemas/home-content`.
4. **4 actions** (pattern `ActionResult` sans `data` — BigInt Three-Layer) :
   - `createHomeStatAction(input: unknown): Promise<ActionResult>` — parse + create + `revalidatePath("/admin/home/about")` + `revalidatePath("/")`.
   - `updateHomeStatAction(id: string, input: unknown): Promise<ActionResult>` — parse + `BigInt(id)` + update + revalidate.
   - `deleteHomeStatAction(id: string): Promise<ActionResult>` — `BigInt(id)` + delete + revalidate.
   - `reorderHomeStatsAction(orderedIds: string[]): Promise<ActionResult>` — `orderedIds.map(BigInt)` + reorder + revalidate.
5. **Revalidation paths** : `/admin/home/about` + `/` (homepage consomme les stats).

**Fichiers impactés** :

- [lib/actions/home-stats-actions.ts](lib/actions/home-stats-actions.ts) (nouveau)

---

### Étape B4 — Composants : déplacer et renommer Stats

Déplacer les composants Stats de `components/features/admin/compagnie/` vers `components/features/admin/home/` :

1. **Déplacer** `StatsContainer.tsx` → `components/features/admin/home/StatsContainer.tsx`.
   - Mettre à jour les imports DAL : `@/lib/dal/admin-compagnie` → `@/lib/dal/admin-home-stats`.
   - Mettre à jour les imports schemas : `CompagnieStat*` → `HomeStat*`.
   - Mettre à jour les imports actions : `@/lib/actions/compagnie-stats-actions` → `@/lib/actions/home-stats-actions`.
2. **Déplacer** `StatsView.tsx` → `components/features/admin/home/StatsView.tsx`.
   - Renommer types props : `CompagnieStatDTO` → `HomeStatDTO`.
   - Mettre à jour les imports actions.
3. **Déplacer** `StatForm.tsx` → `components/features/admin/home/StatForm.tsx`.
   - Renommer schema : `CompagnieStatFormSchema` → `HomeStatFormSchema`.
   - Renommer type : `CompagnieStatFormValues` → `HomeStatFormValues`.
   - Mettre à jour les imports actions.
4. Si un fichier `types.ts` existe dans le dossier compagnie pour les Stats, le migrer aussi.

**Fichiers impactés** :

- `components/features/admin/compagnie/StatsContainer.tsx` → supprimé
- `components/features/admin/compagnie/StatsView.tsx` → supprimé
- `components/features/admin/compagnie/StatForm.tsx` → supprimé
- `components/features/admin/home/StatsContainer.tsx` (nouveau)
- `components/features/admin/home/StatsView.tsx` (nouveau)
- `components/features/admin/home/StatForm.tsx` (nouveau)

---

### Étape B5 — Page admin/home/about : intégrer la section Stats

Modifier [app/(admin)/admin/home/about/page.tsx](app/(admin)/admin/home/about/page.tsx) :

1. **Ajouter** une deuxième `<section>` après le contenu "À propos" existant.
2. Séparer avec `<Separator />` (shadcn/ui).
3. Titre `<h2>` : "Chiffres clés" ou "Statistiques".
4. **Importer** et rendre `<StatsContainer />` depuis `@/components/features/admin/home/StatsContainer`.
5. Wraper dans `<Suspense fallback={<StatsSkeletonLoader />}>` si nécessaire.

**Structure résultante** :

```bash
<main>
  <h1>Page d'accueil — À propos</h1>

  <section>
    <h2>Contenu À propos</h2>
    <AboutContainer />  <!-- existant -->
  </section>

  <Separator />

  <section>
    <h2>Chiffres clés</h2>
    <StatsContainer />  <!-- nouveau -->
  </section>
</main>
```

**Fichiers impactés** :

- [app/(admin)/admin/home/about/page.tsx](app/(admin)/admin/home/about/page.tsx) (modification)

---

## Partie C — Nettoyage et vérification

### Étape C1 — Suppression des fichiers obsolètes

Supprimer les fichiers Stats devenus obsolètes après les parties A et B :

1. `lib/actions/compagnie-stats-actions.ts` — remplacé par `home-stats-actions.ts`.
2. Anciens composants Stats dans `components/features/admin/compagnie/` (StatsContainer, StatsView, StatForm) — s'ils n'ont pas été déplacés proprement (git mv).
3. Vérifier qu'aucun import cassé ne subsiste (`grep -r "compagnie-stats" lib/` + `grep -r "CompagnieStat" components/`).

**Commandes de vérification** :

```bash
grep -rn "compagnie-stats-actions" lib/ components/ app/
grep -rn "CompagnieStat" lib/ components/ app/
grep -rn "StatsContainer" components/features/admin/compagnie/
```

---

### Étape C2 — Sidebar : vérification (aucun changement attendu)

Vérifier que la sidebar admin contient bien les deux entrées distinctes :

- **"Compagnie"** → `/admin/compagnie` (2 onglets : Valeurs + Présentation)
- **"À propos"** ou **"Accueil - À propos"** → `/admin/home/about` (contenu About + Stats)

Aucune modification de sidebar n'est nécessaire — les deux routes existent déjà.

**Fichier à vérifier** : `components/admin/sidebar.tsx` ou équivalent.

---

### Étape C3 — Scripts de test

Créer ou adapter un script de validation :

```bash
# scripts/test-home-stats.ts
# 1. Vérifie que fetchHomeStats() retourne des données
# 2. Vérifie les types HomeStatDTO
# 3. Teste CRUD create/read/update/delete
```

Commande : `pnpm exec tsx scripts/test-home-stats.ts`

---

### Étape C4 — Vérification manuelle navigateur

1. `/admin/compagnie` → 2 onglets seulement (Valeurs, Présentation).
2. `/admin/compagnie` → Onglet Présentation → `kind` et `slug` **non visibles** dans le formulaire d'édition.
3. `/admin/compagnie` → Onglet Présentation → `ImageFieldGroup` visible pour kinds `hero`, `history`, `custom` avec sélecteur médiathèque + champ alt_text.
4. `/admin/home/about` → Section "Chiffres clés" visible avec CRUD Stats fonctionnel.
4. `/` (homepage) → Les stats s'affichent correctement (aucune régression).
5. Tester le reorder des Stats dans `/admin/home/about`.

---

## Vérification — Checklist globale

### Partie A (Compagnie)

- [x] Migration `alt_text` appliquée (`20260302184850`)
- [x] Schéma déclaratif mis à jour (`07c_table_compagnie_presentation.sql`)
- [x] Schemas Presentation incluent `alt_text`
- [x] Schemas Stats supprimés de `compagnie-admin.ts` (jamais créés ici — Stats directement dans `home-content.ts`)
- [x] DAL Presentation inclut `alt_text` dans select/insert/update (`admin-compagnie-presentation.ts`)
- [x] DAL Stats supprimé de `admin-compagnie.ts` (N/A — Stats jamais dans ce fichier, DAL séparés dès le départ)
- [x] Page admin/compagnie : 2 onglets seulement (Présentation + Valeurs)
- [x] PresentationForm : `kind` et `slug` cachés (slug hidden, kind en Badge read-only)
- [x] PresentationFormFields : `SHOW_IMAGE_URL` inclut `"history"`
- [x] PresentationFormFields utilise `ImageFieldGroup`
- [x] Champ `alt_text` visible dans le formulaire Presentation
- [x] **BONUS** : Presentation simplifiée en UPDATE-only (pas de create/delete)
- [x] **BONUS** : Reorder Values (schema + DAL + action)
- [x] **BONUS** : 4 migrations hotfix position + fix Zod `.optional()`
- [x] **BONUS** : ContentArrayField.tsx pour édition `text[]`
- [x] **BONUS** : 2 sous-pages lecture seule (presentation/ + valeurs/)

### Partie B (Stats → Home)

- [x] Schemas `HomeStat*` dans `home-content.ts` (+ `ReorderHomeStatsSchema`)
- [x] DAL `admin-home-stats.ts` créé avec 5 fonctions + `cache()`
- [x] Actions `home-stats-actions.ts` créé avec 4 actions (CRUD + reorder)
- [x] Revalidation paths : `/admin/home/about` + `/`
- [x] Composants Stats créés dans `components/features/admin/home/` (créés neufs, pas déplacés)
- [x] Imports corrects (DAL, schemas, actions)
- [x] Page `admin/home/about` affiche la section Stats avec `<Separator />`
- [x] `<Suspense>` boundary sur StatsContainer
- [x] **BONUS** : Reorder Home Stats (schema + DAL + action)

### Partie C (Nettoyage)

- [x] `compagnie-stats-actions.ts` supprimé (N/A — jamais créé, Stats construites directement dans home-stats-actions.ts)
- [x] Aucun import orphelin (vérifié à la compilation)
- [x] Sidebar vérifiée (Compagnie + Accueil - La compagnie) + 3 renommages labels
- [x] Scripts test : 2 scripts créés (`test-admin-compagnie.ts` + `test-home-stats.ts`)
- [x] Vérification navigateur effectuée (bugs trouvés et corrigés pendant le développement)

---

## Decisions

| # | Décision | Justification |
|---|----------|---------------|
| 1 | Table `compagnie_stats` conserve son nom en DB | Évite une migration de renommage risquée. Seuls les identifiants TS changent. |
| 2 | Stats → `admin/home/about` (pas nouvelle route) | La page existe déjà et gère le contenu About de la homepage. Stats complète logiquement cette page. |
| 3 | `alt_text` ajouté par migration manuelle (hotfix pattern) | Ajout de colonne simple, compatible avec le workflow déclaratif (schéma mis à jour en parallèle). |
| 4 | ImageFieldGroup remplace Input URL | Pattern standard du projet pour toutes les images admin. Le composant gère médiathèque + upload + alt_text. |
| 5 | Missions non incluses dans ce plan | Les missions ont leur propre route/feature. Hors scope TASK070. |
| 6 | Partie A, B, C sont indépendantes | Peuvent être implémentées dans n'importe quel ordre ou en parallèle par branches séparées. |
| 7 | `ActionResult` sans `data` (BigInt Three-Layer) | Pattern obligatoire du projet — `router.refresh()` après mutation pour rafraîchir les données. |
| 8 | Codes erreur `[ERR_HOME_S0x]` | Convention DAL SOLID du projet — chaque module a son propre préfixe d'erreur. |
| 9 | `kind` et `slug` cachés dans PresentationForm | Ces champs sont fixés à la création et ne doivent jamais être modifiés par l'admin. Retirés du rendu visible. |
| 10 | `"history"` ajouté à `SHOW_IMAGE_URL` | `SectionHistory.tsx` affiche une image — l'admin doit pouvoir la configurer via `ImageFieldGroup`. |
| 11 | **Presentation = UPDATE-only** (ajout implémentation) | Les 6 sections sont fixées en DB avec kind+slug prédéfinis. Pas de create/delete en admin. |
| 12 | **Reorder systématique** (ajout implémentation) | Tout CRUD avec `position` inclut reorder pour cohérence avec le pattern du projet. |
| 13 | **`.default(0)` → `.optional()`** (ajout implémentation) | Bug critique : Zod `.partial()` ne neutralise pas `.default()`. Appliqué à `position` et `active`. |
| 14 | **Slug `.optional().or(z.literal(""))`** (ajout implémentation) | Certaines sections (mission) n'ont pas de slug. La validation `.min(1)` les rejetait. |
| 15 | **Ordre Présentation > Valeurs** (ajout implémentation) | Onglet Présentation en défaut car consulté plus fréquemment par l'admin. |
