# Plan : Corriger les 14 violations de l'audit Admin Spectacles

**TL;DR** — Ce plan corrige les 14 violations détectées sur 16 fichiers de la feature admin spectacles. Il adresse en priorité les 2 violations critiques de sécurité (defense-in-depth `requireAdmin()` manquant), puis les violations hautes (console logs, fichiers >300 lignes, exports manquants), et enfin les violations moyennes et basses (code mort, a11y, DRY, types). Le `buildMediaPublicUrl` centralisé dans `lib/dal/helpers/media-url.ts` existe déjà et sera réutilisé. Le pattern `types.ts` sera calqué sur `components/features/admin/partners/types.ts`. Effort total estimé : ~2h30.

---

**Étapes**

## Étape 1 — SEC-01 : Ajouter `requireAdmin()` dans les 6 actions manquantes

**Fichier** : `app/(admin)/admin/spectacles/actions.ts`

Dans chaque action, ajouter `await requireAdmin()` comme première instruction du bloc `try`, **avant** l'appel DAL. L'import `requireAdmin` est déjà présent L6.

Actions à modifier (6) :
- `createSpectacleAction` (~L57) — ajouter `await requireAdmin();` avant `const result = await createSpectacle(input);`
- `updateSpectacleAction` (~L91) — idem avant `await updateSpectacle(input)`
- `deleteSpectacleAction` (~L118) — idem avant `await deleteSpectacle(id)`
- `addPhotoAction` (~L158) — idem avant le parsing Zod (ou juste après, avant l'appel DAL)
- `deletePhotoAction` (~L203) — idem
- `addGalleryPhotoAction` (~L254) — idem

Exemple concret pour `createSpectacleAction` :

```ts
// AVANT
try {
    const result = await createSpectacle(input);

// APRÈS
try {
    await requireAdmin();
    const result = await createSpectacle(input);
```

Les 2 actions déjà conformes (`deleteGalleryPhotoAction` L300, `reorderGalleryPhotosAction` L337) ne changent pas.

---

## Étape 2 — SEC-02 : Remplacer l'auth manuelle par `requireAdmin()` dans les 4 pages

**Fichiers** :
- `app/(admin)/admin/spectacles/page.tsx` (~L14-17)
- `app/(admin)/admin/spectacles/new/page.tsx` (~L12-15)
- `app/(admin)/admin/spectacles/[id]/page.tsx` (~L29-32)
- `app/(admin)/admin/spectacles/[id]/edit/page.tsx` (~L20-23)

Dans chaque page, remplacer le bloc :

```ts
const supabase = await createClient();
const { data, error } = await supabase.auth.getClaims();
if (error || !data?.claims || data.claims.user_metadata.role !== "admin") {
  redirect("/auth/login");
}
```

Par un simple :

```ts
await requireAdmin();
```

Et ajouter l'import `import { requireAdmin } from "@/lib/auth/is-admin";`. Supprimer les imports `createClient` et `redirect` s'ils ne sont plus utilisés ailleurs dans le fichier. Note : `requireAdmin()` de `lib/auth/is-admin.ts` (L44) throw une erreur si non-admin — le middleware existant redirigera vers `/auth/login`.

---

## Étape 3 — NEXT-01 : Ajouter `dynamic`/`revalidate` sur les 2 pages manquantes

**Fichiers** :
- `app/(admin)/admin/spectacles/new/page.tsx` — ajouter avant l'export default :
  ```ts
  export const dynamic = "force-dynamic";
  export const revalidate = 0;
  ```
- `app/(admin)/admin/spectacles/[id]/edit/page.tsx` — idem

Ces pages utilisent `await createClient()` (cookies SSR) et nécessitent ces exports pour éviter des erreurs de build static en Next.js 16.

---

## Étape 4 — CLEAN-01 : Supprimer les 8 `console.error`/`console.log`

Remplacer chaque `console.error` client par un traitement via `toast.error` (déjà utilisé dans ces composants). Supprimer le `console.log` debug.

| Fichier | Ligne | Action |
|---|---|---|
| `SpectacleGalleryManager.tsx` | L198 | Supprimer — l'erreur est déjà gérée par `toast.error` juste après |
| `SpectacleGalleryManager.tsx` | L280 | Supprimer — edge case rare (drag item not found), ajouter un `return` early |
| `SpectacleGalleryManager.tsx` | L290 | **Supprimer** — `console.log` debug oublié |
| `SpectacleGalleryManager.tsx` | L298 | Supprimer — `toast.error` suit déjà |
| `SpectacleGalleryManager.tsx` | L307 | Supprimer — le `catch` peut directement appeler `toast.error` |
| `SpectaclePhotoManager.tsx` | L79 | Supprimer — `toast.error` suit déjà |
| `SpectaclesManagementContainer.tsx` | L109 | Supprimer — `toast.error` suit déjà |
| `SpectacleForm.tsx` | L168 | Supprimer — `toast.error` avec description suit immédiatement |

---

## Étape 5 — CLEAN-02a : Scinder `actions.ts` (361 lignes → 2 fichiers)

Créer `app/(admin)/admin/spectacles/spectacle-photo-actions.ts` contenant :
- `addPhotoAction`
- `deletePhotoAction`
- `addGalleryPhotoAction`
- `deleteGalleryPhotoAction`
- `reorderGalleryPhotosAction`

Garder dans `actions.ts` :
- `ActionResult<T>` type
- `createSpectacleAction`
- `updateSpectacleAction`
- `deleteSpectacleAction`

Mettre à jour les imports dans les composants consommateurs :
- `SpectacleGalleryManager.tsx` — importer depuis `spectacle-photo-actions`
- `SpectaclePhotoManager.tsx` — idem
- Le type `ActionResult` peut être réexporté depuis `spectacle-photo-actions.ts` via `export type { ActionResult } from "./actions";`

---

## Étape 6 — CLEAN-02b : Scinder `SpectacleGalleryManager.tsx` (470 → ~2×235 lignes)

Extraire de `SpectacleGalleryManager.tsx` :

1. **`SortableGalleryCard.tsx`** (~80 lignes) — le composant `SortablePhotoCard` (L88-161) dans un fichier dédié. Il reçoit les props `photo`, `isPending`, `onDelete`.

2. **Factoriser `getMediaPublicUrl`** — Remplacer les 2 fonctions locales identiques (Gallery L79-81, Photo L41-42) par l'import du helper partagé `buildMediaPublicUrl` depuis `lib/dal/helpers/media-url.ts`. Ce helper a la même logique mais gère aussi les `null`. Adapter l'appel : `buildMediaPublicUrl(storagePath) ?? ""` (car le helper retourne `string | null`).

Le fichier principal `SpectacleGalleryManager.tsx` devrait passer sous les 300 lignes après extraction du `SortablePhotoCard` + suppression des console.log.

---

## Étape 7 — UX-01 : Remplacer `confirm()` par `AlertDialog` dans `SpectaclePhotoManager`

**Fichier** : `SpectaclePhotoManager.tsx` (L136)

S'inspirer du pattern existant dans `SpectacleGalleryManager.tsx` (L410-440) :
- Ajouter un state `const [deleteTarget, setDeleteTarget] = useState<{ordre: number} | null>(null);`
- Remplacer `if (!confirm(...)) return;` par `setDeleteTarget({ ordre });`
- Ajouter un `AlertDialog` en bas du JSX avec :
  - `open={deleteTarget !== null}`
  - `onOpenChange` qui remet `deleteTarget` à `null`
  - `AlertDialogAction` qui appelle `handleDeleteConfirm()` avec l'ordre sauvé dans le state
- Supprimer le TODO L151

---

## Étape 8 — CLEAN-03 : Supprimer le code commenté

**Fichier** : `SpectaclesManagementContainer.tsx` — Supprimer le bloc commenté L52-60 (ancien pattern `openDeleteDialog`).

---

## Étape 9 — TS-01 : Supprimer la prop inutilisée `currentStatus`

**Fichier** : `SpectacleFormMetadata.tsx`

Supprimer `currentStatus: string;` de l'interface `SpectacleFormMetadataProps` (L36) et retirer le paramètre de la déstructuration (L44). Mettre à jour l'appelant `SpectacleForm.tsx` pour ne plus passer `currentStatus`.

---

## Étape 10 — DRY-01 : Factoriser `formatDate()` locale

**Fichier** : `app/(admin)/admin/spectacles/[id]/page.tsx` (L49-61)

La `formatDate()` locale (L49-61) a un format `day/month-long/year` différent de `formatSpectacleDate()` (`month-short/year`). Deux options :
- **Option recommandée** : Ajouter une fonction `formatSpectacleDetailDate(dateString: string | null): string` dans `lib/tables/spectacle-table-helpers.ts` avec le format `day/month-long/year`, puis l'importer dans la page. Supprimer aussi `getStatusLabel()` (L63-66) et utiliser directement `translateStatus()` déjà importé via `lib/i18n/status.ts`.

---

## Étape 11 — ARCH-01 : Créer `types.ts` colocalisé

Créer `components/features/admin/spectacles/types.ts` sur le modèle de `components/features/admin/partners/types.ts`.

Extraire vers ce fichier les interfaces de props :
- `SpectacleGalleryManagerProps` (depuis `SpectacleGalleryManager.tsx`)
- `SortablePhotoCardProps` (depuis `SpectacleGalleryManager.tsx` / nouveau `SortableGalleryCard.tsx`)
- `SpectaclePhotoManagerProps` (depuis `SpectaclePhotoManager.tsx`)
- `SpectacleFormMetadataProps` (depuis `SpectacleFormMetadata.tsx`)
- `SpectaclesManagementContainerProps` (depuis `SpectaclesManagementContainer.tsx`)
- `SpectaclesTableProps` (depuis `SpectaclesTable.tsx`)

Importer les types DTO nécessaires depuis `@/lib/schemas/spectacles`.

---

## Étape 12 — CLEAN-04 : Nettoyer les entrées legacy STATUS

**Fichier** : `lib/tables/spectacle-table-helpers.ts` (L8-42)

Réduire `STATUS_VARIANTS` et `STATUS_LABELS` aux 3 statuts canoniques (`draft`, `published`, `archived`) + un fallback. Vérifier que `translateStatus()` de `lib/i18n/status.ts` couvre les 3 statuts. Supprimer les 9 entrées legacy ("en cours", "terminé", "projet", "brouillon", "a l'affiche", "en preparation", "annulé", "actuellement", "archive").

---

## Étape 13 — ARCH-02 + CLEAN-05 + PERF-01 : Corrections basses

1. **ARCH-02** — `spectacle-table-helpers.ts` (L159, L173) : Renommer le fichier en `.tsx` pour utiliser du JSX natif au lieu de `React.createElement(Badge, ...)` dans `getStatusBadge()` et `getVisibilityBadge()`. Mettre à jour les imports dans les fichiers consommateurs.

2. **CLEAN-05** — `SpectacleForm.tsx` (L154-159) : Simplifier `getSpectacleSuccessMessage()` — ne retourner que `{ description }` ou inliner directement la description dans le `toast.success`.

3. **PERF-01** — `SpectacleForm.tsx` (L109-112) : Remplacer les 4 `form.watch("field")` dans le tableau de dépendances du `useEffect` par un `useWatch({ control: form.control, name: ["genre", "premiere", "short_description", "description"] })` de react-hook-form, qui est conçu pour cet usage et évite les re-renders excessifs.

---

## Vérification

1. `pnpm build` — Vérifier zéro erreur TypeScript (les imports cassés seront détectés)
2. `pnpm lint` — Vérifier zéro warning ESLint
3. Tester manuellement les 4 pages admin spectacles (`/admin/spectacles`, `/new`, `/[id]`, `/[id]/edit`) : navigation, CRUD, gestion photos, galerie drag & drop
4. Vérifier la suppression photo avec le nouveau `AlertDialog` (confirmation modale au lieu de `confirm()`)
5. `grep -r "console.log\|console.error" components/features/admin/spectacles/` — doit retourner zéro résultat
6. `grep -r "getClaims" app/\(admin\)/admin/spectacles/` — doit retourner zéro résultat (tout migré vers `requireAdmin()`)
7. Vérifier qu'aucun fichier dans `components/features/admin/spectacles/` ne dépasse 300 lignes : `wc -l components/features/admin/spectacles/*.tsx`

## Décisions

- `getMediaPublicUrl` local → réutiliser `buildMediaPublicUrl` de `lib/dal/helpers/media-url.ts` (déjà utilisé par admin-partners)
- `formatDate` locale → nouvelle fonction `formatSpectacleDetailDate` dans le helper partagé (format différent → pas un pur duplicata)
- Split actions : CRUD dans `actions.ts`, photos dans `spectacle-photo-actions.ts` (séparation logique responsabilité)
- Split GalleryManager : extraction du `SortableGalleryCard` en composant autonome (plus lisible, réutilisable)
- `spectacle-table-helpers.ts` → renommer en `.tsx` pour supporter le JSX natif
