# Plan — TASK065 : Fix Audit Admin Presse

**Audit source** : `doc-perso/audit-admin-press-discuss.md`
**Score initial** : ~75% conforme → **Objectif** : ≥95%
**Branche** : `fix/admin-press-audit-violations`
**Scope** : 12 violations (3 P0, 6 P1, 3 P2) sur 29 fichiers — ~28 fichiers impactés, 14 étapes

---

## Phase 1 — Violations critiques (P0)

### Étape 1 : Ajouter `import "server-only"` dans actions.ts

**Violation** : `crud-server-actions-pattern.instructions.md` (Règle N°2)
**Fichier** : `app/(admin)/admin/presse/actions.ts` ligne 1

Dans `actions.ts`, ajouter `import "server-only";` juste après `"use server";`. Identique au pattern de tous les autres fichiers Server Actions corrigés (partners, media, etc.)

```diff
 "use server";
+import "server-only";
```

---

### Étape 2 : Migrer les imports DAL hors des Client Components

**Violation** : `dal-solid-principles.instructions.md` (Règle N°1), `copilot-instructions.md` (NEVER import DAL in Client Components)
**Fichiers** :
- `components/features/admin/presse/PressReleaseNewForm.tsx`
- `components/features/admin/presse/PressReleaseEditForm.tsx`
- `app/(admin)/admin/presse/communiques/new/page.tsx`
- `app/(admin)/admin/presse/communiques/[id]/edit/page.tsx`

Le `types.ts` a **déjà** les props `spectacles?` et `evenements?` dans `PressReleaseFormProps` — il suffit de les exploiter.

**2a.** Dans `communiques/new/page.tsx` (Server Component) : importer `fetchSpectaclesForSelect` et `fetchEvenementsForSelect` depuis le DAL, les appeler en parallèle via `Promise.all`, passer les résultats en props à `<PressReleaseNewForm>`.

```typescript
// AVANT (page.tsx) :
return <PressReleaseNewForm />;

// APRÈS (page.tsx) :
const [specRes, eveRes] = await Promise.all([
  fetchSpectaclesForSelect(),
  fetchEvenementsForSelect(),
]);

return (
  <PressReleaseNewForm
    spectacles={specRes.success ? specRes.data : []}
    evenements={eveRes.success ? eveRes.data : []}
  />
);
```

**2b.** Même transformation dans `communiques/[id]/edit/page.tsx` qui fetch déjà `fetchPressReleaseById` — ajouter les 2 fetches des options en parallèle dans le même `Promise.all`.

```typescript
// APRÈS (edit/page.tsx) :
const [releaseRes, specRes, eveRes] = await Promise.all([
  fetchPressReleaseById(BigInt(id)),
  fetchSpectaclesForSelect(),
  fetchEvenementsForSelect(),
]);

return (
  <PressReleaseEditForm
    release={releaseRes.success ? releaseRes.data : null}
    spectacles={specRes.success ? specRes.data : []}
    evenements={eveRes.success ? eveRes.data : []}
  />
);
```

**2c.** Dans `PressReleaseNewForm.tsx` et `PressReleaseEditForm.tsx` :
- Supprimer l'import DAL `import { fetchSpectaclesForSelect, fetchEvenementsForSelect } from "@/lib/dal/admin-press-releases"`
- Supprimer le `useEffect` qui appelle ces fonctions (lignes ~82-89 dans NewForm, ~76-84 dans EditForm)
- Supprimer les `useState` pour `spectacles` et `evenements`
- Utiliser directement les props `spectacles` et `evenements` reçues du Server Component

---

### Étape 3 : Remplacer `any` par un type explicite dans `mapToPressReleaseDTO`

**Violation** : `2-typescript.instructions.md` (Never use `any`)
**Fichier** : `lib/dal/admin-press-releases.ts` ligne 17

Définir une interface `RawPressReleaseRow` qui modélise le type brut retourné par le select Supabase avec joins :

```typescript
// AVANT :
function mapToPressReleaseDTO(release: any): PressReleaseDTO {

// APRÈS :
interface RawPressReleaseRow {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string | null;
  summary: string | null;
  date_publication: string | null;
  published_at: string | null;
  image_url: string | null;
  image_media_id: number | null;
  pdf_url: string | null;
  spectacle_id: number | null;
  evenement_id: number | null;
  created_at: string;
  updated_at: string;
  spectacle: { title: string } | null | Array<unknown>;
  evenement: { spectacles: { title: string } } | null | Array<unknown>;
}

function mapToPressReleaseDTO(release: RawPressReleaseRow): PressReleaseDTO {
```

Le pattern `Array.isArray()` déjà utilisé dans la fonction gère les cas où Supabase retourne un array vide au lieu de `null` sur les joins. Pattern identique à `RawPartnerRow` dans `admin-partners.ts` (TASK064).

---

## Phase 2 — Violations majeures (P1)

### Étape 4 : Split actions.ts (368 → 3 fichiers)

**Violation** : `clean-code.instructions.md` (Max 300 lignes par fichier)
**Fichier source** : `app/(admin)/admin/presse/actions.ts` (368 lignes)

Splitter en 3 fichiers (chacun < 150 lignes) :

| Nouveau fichier | Fonctions | Lignes estimées |
| --- | --- | --- |
| `press-releases-actions.ts` | `createPressReleaseAction`, `updatePressReleaseAction`, `deletePressReleaseAction`, `publishPressReleaseAction`, `unpublishPressReleaseAction` | ~130 |
| `press-articles-actions.ts` | `createArticleAction`, `updateArticleAction`, `deleteArticleAction` | ~80 |
| `press-contacts-actions.ts` | `createPressContactAction`, `updatePressContactAction`, `deletePressContactAction`, `togglePressContactActiveAction` | ~100 |

Chaque fichier aura :
- `"use server";` + `import "server-only";`
- Import du `ActionResult` **partagé** (voir étape 8)
- Import des schémas et DAL respectifs

Supprimer `actions.ts` original. Mettre à jour tous les imports dans les composants View et Form qui référencent l'ancien fichier.

---

### Étape 5 : Split admin-press-releases.ts (341 → 2 fichiers)

**Violation** : `clean-code.instructions.md` (Max 300 lignes par fichier)
**Fichier source** : `lib/dal/admin-press-releases.ts` (341 lignes)

Extraire `fetchSpectaclesForSelect` et `fetchEvenementsForSelect` (~60 lignes) vers un nouveau fichier `lib/dal/admin-press-select-options.ts`. Ce sont des fonctions utilitaires de dropdown, pas intrinsèquement liées aux communiqués de presse.

Résultat : ~280 lignes pour `admin-press-releases.ts` et ~80 lignes pour le nouveau fichier.

Mettre à jour les imports dans les pages routes de l'étape 2.

---

### Étape 6 : Ajouter `cache()` React sur les lectures DAL

**Violation** : `copilot-instructions.md` (React cache() Deduplication Pattern)
**Fichiers** : 4 DAL

Wrapper avec `import { cache } from "react"` toutes les fonctions de lecture :

| Fichier | Fonctions à wrapper |
| --- | --- |
| `admin-press-releases.ts` | `fetchAllPressReleasesAdmin`, `fetchPressReleaseById` |
| `admin-press-articles.ts` | `fetchAllArticlesAdmin`, `fetchArticleById` |
| `admin-press-contacts.ts` | `fetchAllPressContacts`, `fetchPressContactById` |
| `admin-press-select-options.ts` | `fetchSpectaclesForSelect`, `fetchEvenementsForSelect` |

```typescript
// AVANT :
export async function fetchAllPressReleasesAdmin(): Promise<DALResult<PressReleaseDTO[]>> {

// APRÈS :
export const fetchAllPressReleasesAdmin = cache(
  async (): Promise<DALResult<PressReleaseDTO[]>> => {
    // ... body
  }
);
```

---

### Étape 7 : Migrer vers `dalSuccess`/`dalError` helpers

**Violation** : `dal-solid-principles.instructions.md`
**Fichiers** : 4 DAL presse

Remplacer tous les `{ success: true, data }` / `{ success: false, error: ... }` manuels par `dalSuccess(data)` / `dalError(message)`. Importer depuis `@/lib/dal/helpers`. Pattern identique à `admin-partners.ts`.

```typescript
// AVANT :
if (error) return { success: false, error: `[ERR_PRESS_RELEASE_001] ${error.message}` };
return { success: true, data: releases.map(mapToPressReleaseDTO) };

// APRÈS :
if (error) return dalError(`[ERR_PRESS_RELEASE_001] ${error.message}`);
return dalSuccess(releases.map(mapToPressReleaseDTO));
```

---

### Étape 8 : Utiliser `ActionResult<T>` partagé

**Violation** : `crud-server-actions-pattern.instructions.md` (Type `ActionResult` standard)
**Fichier** : les 3 nouveaux fichiers actions (étape 4)

Le type partagé existe dans `lib/actions/types.ts` (ligne 44-46), exporté via barrel `lib/actions/index.ts`.

**Attention** : la version partagée a `data: T` (requis), la version locale presse a `data?: T` (optionnel). Le pattern BigInt Three-Layer impose de NE PAS retourner de data dans les actions.

**Action** : Vérifier/modifier `lib/actions/types.ts` pour rendre `data` optionnel (`data?: T`), puis importer dans les 3 fichiers actions. Supprimer la définition locale.

```typescript
// lib/actions/types.ts — ajuster si nécessaire :
export type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

// Dans chaque fichier actions :
import { type ActionResult } from "@/lib/actions/types";
// Supprimer la définition locale
```

---

### Étape 9 : Ajouter codes erreur manquants sur fonctions fetch

**Violation** : `dal-solid-principles.instructions.md` (Règle N°5 — Error codes tracés)
**Fichiers** : 4 DAL

| Fichier | Fonction | Code proposé |
| --- | --- | --- |
| `admin-press-releases.ts` | `fetchAllPressReleasesAdmin` | `[ERR_PRESS_RELEASE_010]` |
| `admin-press-releases.ts` | `fetchPressReleaseById` | `[ERR_PRESS_RELEASE_011]` |
| `admin-press-articles.ts` | `fetchAllArticlesAdmin` | `[ERR_ARTICLE_010]` |
| `admin-press-articles.ts` | `fetchArticleById` | `[ERR_ARTICLE_011]` |
| `admin-press-contacts.ts` | `fetchAllPressContacts` | `[ERR_PRESS_CONTACT_010]` |
| `admin-press-contacts.ts` | `fetchPressContactById` | `[ERR_PRESS_CONTACT_011]` |
| `admin-press-select-options.ts` | `fetchSpectaclesForSelect` | `[ERR_SELECT_OPT_001]` |
| `admin-press-select-options.ts` | `fetchEvenementsForSelect` | `[ERR_SELECT_OPT_002]` |

Convention : séries 010+ pour les lectures (mutations gardent 001-005).

---

### Étape 10 : Harmoniser `.parseAsync()` dans toutes les actions

**Violation** : `clean-code.instructions.md` (DRY / Cohérence)

Utiliser `.parseAsync()` systématiquement dans les 3 fichiers actions au lieu de `.parse()`. Les schémas articles et contacts n'ont pas de `superRefine` async mais `.parseAsync()` fonctionne aussi en synchrone — la cohérence prime.

Ajouter un commentaire bref sur les press-releases pour documenter le `addImageUrlValidation` async.

```typescript
// AVANT (press-articles-actions.ts) :
const validated = ArticleInputSchema.parse(input);

// APRÈS :
const validated = await ArticleInputSchema.parseAsync(input);
```

---

## Phase 3 — Violations mineures (P2)

### Étape 11 : Unifier le pattern `onSubmit` dans ArticleEditForm

**Violation** : Incohérence de pattern avec les autres formulaires
**Fichier** : `components/features/admin/presse/ArticleEditForm.tsx` ligne 55

```typescript
// AVANT :
const onSubmit: React.FormEventHandler<HTMLFormElement> =
  form.handleSubmit(async (data) => { ... });
// <form onSubmit={onSubmit}>

// APRÈS :
const onSubmit = async (data: ArticleFormValues) => { ... };
// <form onSubmit={form.handleSubmit(onSubmit)}>
```

Aligne avec le pattern standard de tous les autres formulaires du projet.

---

### Étape 12 : Extraire `formatDateFr` dans les helpers

**Violation** : Code utilitaire inline au lieu d'être partagé
**Fichier source** : `app/(admin)/admin/presse/communiques/[id]/preview/page.tsx` lignes 33-39
**Fichier cible** : `lib/dal/helpers/format.ts`

Créer une fonction `formatDateFr` (~10 lignes) qui prend un `string | null`, retourne une chaîne formatée en français (`"28 février 2026"`) ou un fallback `"Non définie"`.

```typescript
// lib/dal/helpers/format.ts — ajouter :
export function formatDateFr(
  dateString: string | null,
  fallback = "Non définie"
): string {
  if (!dateString) return fallback;
  try {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
}
```

Puis dans `preview/page.tsx`, supprimer la fonction `formatDate` inline et importer `formatDateFr` depuis les helpers.

---

### Étape 13 : Corriger `form.watch()` dans les dépendances useEffect

**Violation** : Références instables dans le tableau de dépendances
**Fichier** : `components/features/admin/presse/PressReleaseNewForm.tsx` lignes 76-85

Extraire les valeurs watchées au niveau du composant puis les utiliser dans les dépendances :

```typescript
// AVANT :
useEffect(() => { ... }, [
  ...,
  form.watch("title"),
  form.watch("description"),
  form.watch("date_publication"),
]);

// APRÈS :
const watchedTitle = form.watch("title");
const watchedDescription = form.watch("description");
const watchedDatePublication = form.watch("date_publication");

useEffect(() => { ... }, [
  ...,
  watchedTitle,
  watchedDescription,
  watchedDatePublication,
]);
```

Cela stabilise les références dans le tableau de dépendances.

---

## Phase 4 — Vérification & nettoyage

### Étape 14 : Validation finale

| Commande | Résultat attendu |
| --- | --- |
| `pnpm lint` | 0 erreurs |
| `pnpm build` | Build réussi |
| `grep -r "from.*admin-press-releases" components/` | 0 résultat (plus d'import DAL dans Client Components) |
| `grep -n ": any" lib/dal/admin-press*` | 0 résultat |
| `wc -l app/(admin)/admin/presse/*-actions.ts lib/dal/admin-press*` | Tous < 300 |
| Navigation manuelle `/admin/presse/communiques/new` | Formulaire fonctionnel, dropdowns spectacles/événements chargés |

---

## Décisions

- **Split actions.ts en 3 fichiers** (par entité) plutôt qu'un seul fichier réduit — cohérence avec la séparation DAL existante et meilleure maintenabilité
- **Extraction select-options dans un DAL séparé** plutôt que dans les helpers — ce sont des fonctions serveur avec `requireAdmin()`, pas des utilitaires purs
- **`ActionResult` partagé avec `data?` optionnel** — aligne avec le BigInt Three-Layer pattern où les mutations ne retournent pas de data
- **`.parseAsync()` systématique** — cohérence > micro-optimisation, le coût est négligeable
- **Codes erreur reads en série 010+** — séparation claire mutations (001-005) vs lectures (010+)
