# Plan : Correction des violations audit admin media

**TL;DR** : 9 corrections sur ~17 fichiers (6 modifiés, 11 créés), organisées en 3 phases. Élimine les 6 dépassements de 300 lignes, la duplication ×8 dans `MediaBulkActions`, les violations SRP/DRY/a11y, et introduit un `MediaLibraryContext` pour supprimer le prop drilling. La violation API Route search est reclassée comme légitime. ~2-3 jours d'effort.

**Source de l'audit** : `doc-perso/audit-admin-media-discuss.md`

---

## Phase 1 — Quick wins (faible risque)

### Étape 1 — Extraire `formatFileSize` dans `lib/utils/format.ts`

**Problème** : `formatFileSize` est défini privément dans [MediaCard.tsx L308-L312](../../components/features/admin/media/MediaCard.tsx) #L308 et dupliqué inline dans [MediaDetailsPanel.tsx L199](../../components/features/admin/media/MediaDetailsPanel.tsx) #L199 avec un format différent (`.toFixed(2) MB` sans switchs KB/B).

**Implémentation** :

1. Créer `lib/utils/format.ts` avec une fonction unique exportée :

```ts
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

2. Dans [MediaCard.tsx](../../components/features/admin/media/MediaCard.tsx) : supprimer la fonction locale L308-L312, ajouter `import { formatFileSize } from "@/lib/utils/format"`
3. Dans [MediaDetailsPanel.tsx L199](../../components/features/admin/media/MediaDetailsPanel.tsx) #L199 : remplacer le calcul inline par `formatFileSize(media.size_bytes ?? 0)`, ajouter le même import

**Fichiers** : 1 créé, 2 modifiés

---

### Étape 2 — Extraire `MediaFolderFormDialog` (SRP)

**Problème** : [MediaFoldersView.tsx](../../components/features/admin/media/MediaFoldersView.tsx) contient deux composants (456 lignes). Le `MediaFolderFormDialog` commence à la L271 avec son interface `MediaFolderFormDialogProps` (7 props : `open`, `onClose`, `onSuccess`, `folder`, `allFolders`, `isSubmitting`, `setIsSubmitting`).

**Implémentation** :

1. Créer `components/features/admin/media/MediaFolderFormDialog.tsx`
2. Déplacer :
   - L'interface `MediaFolderFormDialogProps` (L271-279)
   - Le composant `MediaFolderFormDialog` (L281-456) avec ses 4 `useState` internes (`name`, `slug`, `description`, `parentId`), le `useEffect` de reset (L294-305), le helper `generateSlug` (L307-314), et le `handleSubmit` (L321-341)
   - Les imports nécessaires : `useState, useEffect` de react, `Dialog/*` de shadcn, `Input`, `Label`, `Button`, `Textarea`, `Select/*`, `toast` de sonner, les Server Actions `createMediaFolderAction`/`updateMediaFolderAction`
3. Dans [MediaFoldersView.tsx](../../components/features/admin/media/MediaFoldersView.tsx) : ajouter `import { MediaFolderFormDialog } from "./MediaFolderFormDialog"`, supprimer les lignes L271-456

**Résultat** : `MediaFoldersView` passe de 456 → ~270 lignes ✅

**Fichiers** : 1 créé, 1 modifié

---

### Étape 3 — Extraire `MediaTagFormDialog` (SRP)

**Problème** : [MediaTagsView.tsx](../../components/features/admin/media/MediaTagsView.tsx) contient deux composants (406 lignes). Le `MediaTagFormDialog` commence à la L273 avec `MediaTagFormDialogProps` (6 props : `open`, `onClose`, `onSuccess`, `tag`, `isSubmitting`, `setIsSubmitting`).

**Implémentation** :

1. Créer `components/features/admin/media/MediaTagFormDialog.tsx`
2. Déplacer :
   - L'interface `MediaTagFormDialogProps` (L273-279)
   - Le composant `MediaTagFormDialog` (L281-406) avec ses 3 `useState` internes (`name`, `description`, `color`), le `useEffect` de reset (L293-302), le `handleSubmit` (L304-324)
   - Les imports nécessaires
3. Dans [MediaTagsView.tsx](../../components/features/admin/media/MediaTagsView.tsx) : ajouter l'import, supprimer les lignes L273-406

**Résultat** : `MediaTagsView` passe de 406 → ~272 lignes ✅

**Fichiers** : 1 créé, 1 modifié

---

### Étape 4 — Dédupliquer `MediaBulkActions` (DRY — critique)

**Problème** : [MediaBulkActions.tsx](../../components/features/admin/media/MediaBulkActions.tsx) (487 lignes) contient le même pattern try/catch/toast **8 fois** : 4 handlers nommés (`handleBulkDelete` L90-106, `handleBulkMove` L108-132, `handleBulkTag` L134-156, `handleBulkUntag` L158-180) + 4 copies inline dans les badges `onClick`/`onKeyDown` (L317-410). De plus, chaque badge a un `onClick` et un `onKeyDown` identiques.

**Implémentation en 3 sous-étapes** :

#### 4a — Créer le helper `executeBulkAction`

Dans le même fichier (ou dans un `utils/` local) :

```ts
type BulkActionResult = { success: boolean; error?: string };

async function executeBulkAction(
  actionFn: () => Promise<BulkActionResult>,
  options: {
    setIsPending: (v: boolean) => void;
    successMessage: string;
    onSuccess: () => void;
    onClearSelection: () => void;
    resetState?: () => void;
  }
): Promise<void> {
  options.setIsPending(true);
  try {
    const result = await actionFn();
    if (!result.success) throw new Error(result.error);
    toast.success(options.successMessage);
    options.resetState?.();
    options.onSuccess();
    options.onClearSelection();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : "Erreur lors de l'opération");
  } finally {
    options.setIsPending(false);
  }
}
```

Les 4 handlers deviennent des one-liners :

```ts
const handleBulkDelete = () => executeBulkAction(
  () => bulkDeleteMediaAction(selectedIds),
  { setIsPending, successMessage: `${selectedIds.length} média(s) supprimé(s)`, onSuccess, onClearSelection }
);
```

#### 4b — Créer le composant `TagActionBadge`

Extraire dans `components/features/admin/media/TagActionBadge.tsx` :

```tsx
interface TagActionBadgeProps {
  tag: MediaTagDTO;
  variant: "default" | "destructive";
  icon: React.ReactNode;
  isPending: boolean;
  onAction: (tagId: number) => Promise<void>;
}

export function TagActionBadge({ tag, variant, icon, isPending, onAction }: TagActionBadgeProps) {
  const handleAction = async () => {
    await onAction(tag.id);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      await onAction(tag.id);
    }
  };

  return (
    <Badge
      variant={variant}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`${variant === "destructive" ? "Retirer" : "Ajouter"} le tag ${tag.name}`}
      aria-disabled={isPending}
      onClick={isPending ? undefined : handleAction}
      onKeyDown={isPending ? undefined : handleKeyDown}
    >
      {icon} {tag.name}
    </Badge>
  );
}
```

Élimine les 8 duplications `onClick`/`onKeyDown` (4 paires) en les remplaçant par :

```tsx
<TagActionBadge
  tag={tag}
  variant="default"
  icon={<Plus className="mr-1 h-3 w-3" />}
  isPending={isPending}
  onAction={(tagId) => executeBulkAction(
    () => bulkTagMediaAction(selectedIds, [tagId]),
    { setIsPending, successMessage: `Tag '${tag.name}' ajouté`, onSuccess, onClearSelection }
  )}
/>
```

#### 4c — Extraire `BulkTagSelector`

Extraire la section JSX des tags (L290-410, ~120 lignes) vers `components/features/admin/media/BulkTagSelector.tsx` :

```tsx
interface BulkTagSelectorProps {
  tags: MediaTagDTO[];
  selectedMedia: MediaItemExtendedDTO[];
  isPending: boolean;
  onTagAction: (tagIds: number[], action: "add" | "remove") => Promise<void>;
}
```

**Résultat** : `MediaBulkActions` passe de 487 → ~180 lignes ✅

**Fichiers** : 2 créés (`TagActionBadge.tsx`, `BulkTagSelector.tsx`), 1 modifié

---

### Étape 5 — Ajouter `aria-required` / `aria-invalid` aux FormDialogs (a11y)

**Problème** : Les FormDialogs (étapes 2-3) n'ont pas d'attributs ARIA sur les champs. Seul un `*` visuel indique les champs obligatoires.

**Implémentation** :

1. Dans `MediaFolderFormDialog.tsx` : ajouter `aria-required="true"` sur les `<Input>` des champs `name` et `slug` (obligatoires). Ajouter `aria-invalid={!!validationError}` si un état d'erreur est ajouté (actuellement les erreurs passent par `toast` — considérer un inline error).
2. Dans `MediaTagFormDialog.tsx` : ajouter `aria-required="true"` sur le `<Input>` du champ `name`.
3. Dans [MediaUploadDialog.tsx](../../components/features/admin/media/MediaUploadDialog.tsx) : vérifier que le champ fichier a `aria-required="true"`.

**Si les dialogs utilisent des `<Input>` shadcn avec `<FormField>`** : les attributs ARIA sont gérés automatiquement par le `FormField` context. Vérifier — sinon les ajouter manuellement car ces dialogs n'utilisent PAS `react-hook-form` / `FormField` mais des `useState` directs.

**Fichiers** : 3 modifiés

---

### Étape 6 — Constantes nommées + fix export (hardcoded values)

**Problème** : Valeurs magiques dispersées (`slice(0, 3)`, debounce `300`/`1000`, etc.) et double export dans `MediaLibraryPicker`.

**Implémentation** :

1. Ajouter dans [types.ts](../../components/features/admin/media/types.ts) ou créer `components/features/admin/media/constants.ts` :

```ts
export const MAX_VISIBLE_TAGS = 3;
export const SEARCH_DEBOUNCE_MS = 300;
export const URL_VALIDATION_DEBOUNCE_MS = 1000;
export const INTERSECTION_OBSERVER_MARGIN = "50px";
```

2. Remplacer les usages dans :
   - [MediaCard.tsx](../../components/features/admin/media/MediaCard.tsx) : `slice(0, 3)` → `slice(0, MAX_VISIBLE_TAGS)`, `rootMargin: "50px"` → `rootMargin: INTERSECTION_OBSERVER_MARGIN`
   - [ImageFieldGroup.tsx](../../components/features/admin/media/ImageFieldGroup.tsx) : debounce `1000` → `URL_VALIDATION_DEBOUNCE_MS`
   - [MediaLibraryPicker.tsx](../../components/features/admin/media/MediaLibraryPicker.tsx) : debounce `300` → `SEARCH_DEBOUNCE_MS`

3. Dans [MediaLibraryPicker.tsx L230](../../components/features/admin/media/MediaLibraryPicker.tsx) : supprimer le `export default MediaLibraryPicker` redondant (le named export `export function MediaLibraryPicker` existe déjà).

**Fichiers** : 1 créé (`constants.ts`), 3 modifiés

---

## Phase 2 — Splits internes (risque moyen)

### Étape 7 — Splitter `MediaDetailsPanel` en sous-composants

**Problème** : [MediaDetailsPanel.tsx](../../components/features/admin/media/MediaDetailsPanel.tsx) fait 445 lignes — responsabilité monolithique avec 6 sections JSX identifiables et 3 handlers au pattern similaire.

**Implémentation** :

1. **Créer `components/features/admin/media/details/MediaPreview.tsx`** (~30 lignes)
   - Extraire L222-237 : l'image `next/image` avec fallback
   - Props : `{ media: MediaItemExtendedDTO }`

2. **Créer `components/features/admin/media/details/MediaFileInfo.tsx`** (~50 lignes)
   - Extraire L239-278 : filename, type, taille, date, URL publique (copier)
   - Props : `{ media: MediaItemExtendedDTO; fileSize: string; publicUrl: string | null }`
   - Utilise `formatFileSize` de `lib/utils/format.ts`

3. **Créer `components/features/admin/media/details/MediaEditForm.tsx`** (~120 lignes)
   - Extraire L282-381 : formulaire alt_text + sélecteur dossier + section tags
   - Props : `{ form: UseFormReturn<MetadataFormValues>; folders: MediaFolderDTO[]; tags: MediaTagDTO[]; media: MediaItemExtendedDTO; onSubmit: (data: MetadataFormValues) => Promise<void>; isUpdating: boolean }`
   - Contient les tags assignés/disponibles en interne

4. **Créer `components/features/admin/media/details/MediaDetailActions.tsx`** (~80 lignes)
   - Extraire L383-445 : boutons regenerate + delete + AlertDialog de confirmation
   - Props : `{ onDelete: () => Promise<void>; onRegenerate: () => Promise<void>; isDeleting: boolean; isRegenerating: boolean; hasThumbnail: boolean }`

5. **Le fichier principal `MediaDetailsPanel.tsx`** (~120 lignes) devient un orchestrateur :
   - Garde les 3 handlers (`handleUpdate`, `handleDelete`, `handleRegenerateThumbnail`)
   - Garde les states (`isUpdating`, `isDeleting`, etc.)
   - Compose les sous-composants

**Fichiers** : 4 créés (sous-dossier `details/`), 1 modifié

---

### Étape 8 — Splitter `ImageFieldGroup` en sous-composants internes

**Problème** : [ImageFieldGroup.tsx](../../components/features/admin/media/ImageFieldGroup.tsx) fait 438 lignes avec 14 props (dont 5 booléens `show*`). L'API publique est conservée (14 props) — ticket dédié pour la migration compound components.

**Implémentation** :

1. **Créer `components/features/admin/media/image-field/ImageSourceActions.tsx`** (~40 lignes)
   - Extraire L262-285 : boutons « Téléverser » + « Médiathèque » contrôlés par `showUpload`/`showMediaLibrary`
   - Props : `{ showUpload: boolean; showMediaLibrary: boolean; onUploadClick: () => void; onLibraryClick: () => void; isPending?: boolean }`

2. **Créer `components/features/admin/media/image-field/ImagePreviewSection.tsx`** (~60 lignes)
   - Extraire L344-413 : preview image avec 4 états (validating/success/error/pending) + messages de validation
   - Props : `{ imageUrl: string; isValidating: boolean; validationError: string | null; validationSuccess: string | null }`

3. **Créer `components/features/admin/media/image-field/ImageAltTextField.tsx`** (~40 lignes)
   - Extraire L418-438 : champ alt text avec label + maxLength counter
   - Props génériques : `{ form: UseFormReturn<TForm>; field: Path<TForm>; label: string; maxLength: number }`

4. **Le fichier principal `ImageFieldGroup.tsx`** (~150 lignes) garde :
   - L'interface publique (14 props inchangées)
   - La logique de coordination : states, debounce timer, `handleValidateUrl`, `handleMediaSelect`, `handleUploadSelect`
   - L'assemblage conditionnel des sous-composants basé sur les booléens `show*`
   - Les dialogues `MediaLibraryPicker` et `MediaUploadDialog` (déjà des composants séparés)

5. La section URL externe (L288-341) utilise déjà `MediaExternalUrlInput` — pas d'extraction supplémentaire.

**Important** : la section `External URL + clear button` (L288-341) pourrait être absorbée dans `MediaExternalUrlInput` existant si celui-ci est enrichi. Vérifier si le bouton « clear » et le statut validating sont déjà gérés par `MediaExternalUrlInput` ou s'ils sont ajoutés ici par `ImageFieldGroup`. Si c'est `ImageFieldGroup` qui ajoute ces contrôles, les intégrer dans `ImagePreviewSection`.

**Ticket dédié à créer** : « Migration ImageFieldGroup vers compound components (`ImageField.Root/Upload/Library/AltText`) — 9 consommateurs à migrer : `SpectacleFormImageSection`, `PressReleaseEditForm`, `PressReleaseNewForm`, `ArticleNewForm`, `ArticleEditForm`, `AboutContentForm`, `HeroSlideForm`, `TeamMemberForm`, `PartnerForm` »

**Résultat** : `ImageFieldGroup` passe de 438 → ~150 lignes ✅

**Fichiers** : 3 créés (sous-dossier `image-field/`), 1 modifié

---

### Étape 9 — Alléger `MediaCard`

**Problème** : [MediaCard.tsx](../../components/features/admin/media/MediaCard.tsx) fait 313 lignes (+4%). Marginalement au-dessus de la limite, mais contient des sections clairement séparables.

**Implémentation** :

1. **Extraire `MediaCardThumbnail.tsx`** (~80 lignes)
   - Extraire L51-227 : IntersectionObserver setup + container image avec Skeleton/lazy Image/error fallback + selection checkbox overlay + badge « Optimized »
   - Props : `{ media: MediaItemExtendedDTO; isSelected: boolean; selectionMode: boolean; isVisible: boolean }`
   - Le `useRef` + `useEffect` avec `IntersectionObserver` (L51-70) reste dans ce composant

2. **Extraire `MediaCardFooter.tsx`** (~80 lignes)
   - Extraire L230-303 : metadata (filename, size, tags `slice(0, MAX_VISIBLE_TAGS)`, folder badge, usage count)
   - Props : `{ media: MediaItemExtendedDTO }`
   - Utilise `formatFileSize` de `lib/utils/format.ts`

3. Le `MediaCard` principal (~110 lignes) garde :
   - Le `useRef` pour le container + `useCallback` pour le keyboard handler
   - La composition du wrapper `role="button"` + `tabIndex` + `aria-pressed`
   - Les états `isVisible`/`imageLoaded`/`imageError` (si non déplacés dans `MediaCardThumbnail`)

**Note** : si les états d'image (`isVisible`, `imageLoaded`, `imageError`) sont couplés au `IntersectionObserver`, les garder dans `MediaCardThumbnail` pour qu'il soit autonome.

**Résultat** : `MediaCard` passe de 313 → ~110 lignes ✅

**Fichiers** : 2 créés, 1 modifié

---

## Phase 3 — Architecture (effort élevé)

### Étape 10 — Créer `MediaLibraryContext` (prop drilling → context)

**Problème** : [MediaLibraryView.tsx](../../components/features/admin/media/MediaLibraryView.tsx) (293 lignes) porte 9 `useState` et distribue les données via prop drilling sur 3 niveaux vers `MediaCard` (4 props), `MediaBulkActions` (5 props), `MediaDetailsPanel` (5 props), `MediaUploadDialog` (3 props).

**Implémentation en 3 sous-étapes** :

#### 10a — Créer le hook `useMediaLibraryState`

Fichier : `components/features/admin/media/hooks/useMediaLibraryState.ts`

```ts
interface MediaLibraryState {
  // Data
  media: MediaItemExtendedDTO[];
  filteredMedia: MediaItemExtendedDTO[];
  availableTags: MediaTagDTO[];
  availableFolders: MediaFolderDTO[];
  // Filters
  searchQuery: string;
  selectedFolder: string;
  selectedTag: string;
  // Selection
  selectedMedia: MediaItemExtendedDTO | null;
  selectedIds: number[];
  selectionMode: boolean;
  // UI
  isUploadOpen: boolean;
  uploadFolder: string;
}

interface MediaLibraryActions {
  setSearchQuery: (q: string) => void;
  setSelectedFolder: (f: string) => void;
  setSelectedTag: (t: string) => void;
  setSelectedMedia: (m: MediaItemExtendedDTO | null) => void;
  toggleSelection: (id: number) => void;
  toggleSelectionMode: () => void;
  clearSelection: () => void;
  openUpload: (folder?: string) => void;
  closeUpload: () => void;
  handleCardClick: (media: MediaItemExtendedDTO) => void;
  handleUploadSuccess: () => void;
  refresh: () => void;
}

export function useMediaLibraryState(
  initialMedia: MediaItemExtendedDTO[],
  availableTags: MediaTagDTO[],
  availableFolders: MediaFolderDTO[]
): { state: MediaLibraryState; actions: MediaLibraryActions }
```

Déplace les 9 `useState` de `MediaLibraryView` (L44-52), le `useMemo` `filteredMedia` (L55-72), et tous les handlers (L80-107) dans ce hook.

#### 10b — Créer le context `MediaLibraryProvider`

Fichier : `components/features/admin/media/MediaLibraryProvider.tsx`

```tsx
const MediaLibraryContext = createContext<{
  state: MediaLibraryState;
  actions: MediaLibraryActions;
} | null>(null);

export function MediaLibraryProvider({
  initialMedia, availableTags, availableFolders, children
}: MediaLibraryViewProps & { children: React.ReactNode }) {
  const value = useMediaLibraryState(initialMedia, availableTags, availableFolders);
  return (
    <MediaLibraryContext.Provider value={value}>
      {children}
    </MediaLibraryContext.Provider>
  );
}

export function useMediaLibrary() {
  const context = useContext(MediaLibraryContext);
  if (!context) throw new Error("useMediaLibrary must be used within MediaLibraryProvider");
  return context;
}
```

#### 10c — Refactorer `MediaLibraryView` en composition

`MediaLibraryView` (~80 lignes) devient :

```tsx
export function MediaLibraryView(props: MediaLibraryViewProps) {
  return (
    <MediaLibraryProvider {...props}>
      <MediaLibraryHeader />
      <MediaLibraryFilters />
      <MediaLibraryGrid />
      <MediaBulkActionsConnected />
      <MediaDetailsPanelConnected />
      <MediaUploadDialogConnected />
    </MediaLibraryProvider>
  );
}
```

Les composants `*Connected` (ou les composants existants mis à jour) appellent `useMediaLibrary()` au lieu de recevoir des props. Par exemple, `MediaCard` appelle `const { state, actions } = useMediaLibrary()` pour accéder à `selectionMode`, `selectedIds`, et `actions.handleCardClick`.

**Alternative plus graduelle** : ne pas créer de composants `*Connected` — modifier directement `MediaBulkActions`, `MediaDetailsPanel`, et `MediaCard` pour consommer le contexte, en gardant les props comme fallback optionnel pendant la transition.

**Résultat** : `MediaLibraryView` passe de 293 → ~80 lignes ✅, le prop drilling est éliminé

**Fichiers** : 2 créés, 4 modifiés (`MediaLibraryView`, `MediaCard`, `MediaBulkActions`, `MediaDetailsPanel`)

---

## Hors scope

### API Route search (`MediaLibraryPicker`)

**Reclassée : non-violation.** Le `fetch('/api/admin/media/search')` dans [MediaLibraryPicker.tsx](../../components/features/admin/media/MediaLibraryPicker.tsx) est conforme aux instructions [next-backend.instructions.md](../instructions/next-backend.instructions.md) qui recommandent les Server Actions pour les **mutations** et les API Routes pour les lectures paginées interactives client-side. Le commentaire dans [route.ts L40-42](../../app/api/admin/media/search/route.ts) documente ce choix intentionnel.

### Duplication structurelle FoldersView / TagsView

Après extraction des FormDialogs (étapes 2-3), les deux Views passent sous 300 lignes. La duplication structurelle restante (~80% de pattern CRUD commun : table desktop + cards mobile + handlers) est **acceptable** à ce stade. Une généricisation en composant CRUD abstrait serait une abstraction prématurée — les deux vues divergeront probablement (ex : arborescence de dossiers, couleur de tags). Optionnel en follow-up : extraire un hook `useCrudHandlers<T>()` partagé.

### Compound components `ImageFieldGroup`

**Ticket dédié** : la migration vers l'API compound (`ImageField.Root/Upload/Library/AltText`) impacterait 9 consommateurs et nécessite une coordination plus large. Le split interne (étape 8) résout le dépassement de 300 lignes immédiatement.

---

## Mise à jour du barrel `index.ts`

Après toutes les étapes, mettre à jour [index.ts](../../components/features/admin/media/index.ts) pour exporter les nouveaux composants publics :
- `TagActionBadge`
- `MediaFolderFormDialog`
- `MediaTagFormDialog`
- `MediaLibraryProvider` + `useMediaLibrary`

Les sous-composants internes (`details/*`, `image-field/*`, `MediaCardThumbnail`, `MediaCardFooter`, `BulkTagSelector`) restent des imports relatifs privés — ne pas les exporter du barrel.

---

## Arbre de fichiers final

```bash
components/features/admin/media/
├── constants.ts                    ← NOUVEAU (étape 6)
├── types.ts                        ← existant
├── index.ts                        ← modifié (nouveaux exports)
├── MediaLibraryContainer.tsx        ← inchangé
├── MediaLibraryViewClient.tsx       ← inchangé
├── MediaLibraryView.tsx             ← modifié (étape 10: ~80 lignes)
├── MediaLibraryProvider.tsx         ← NOUVEAU (étape 10)
├── MediaCard.tsx                    ← modifié (étape 9: ~110 lignes)
├── MediaCardThumbnail.tsx           ← NOUVEAU (étape 9)
├── MediaCardFooter.tsx              ← NOUVEAU (étape 9)
├── MediaBulkActions.tsx             ← modifié (étape 4: ~180 lignes)
├── TagActionBadge.tsx               ← NOUVEAU (étape 4b)
├── BulkTagSelector.tsx              ← NOUVEAU (étape 4c)
├── MediaDetailsPanel.tsx            ← modifié (étape 7: ~120 lignes)
├── details/
│   ├── MediaPreview.tsx             ← NOUVEAU (étape 7)
│   ├── MediaFileInfo.tsx            ← NOUVEAU (étape 7)
│   ├── MediaEditForm.tsx            ← NOUVEAU (étape 7)
│   └── MediaDetailActions.tsx       ← NOUVEAU (étape 7)
├── ImageFieldGroup.tsx              ← modifié (étape 8: ~150 lignes)
├── image-field/
│   ├── ImageSourceActions.tsx       ← NOUVEAU (étape 8)
│   ├── ImagePreviewSection.tsx      ← NOUVEAU (étape 8)
│   └── ImageAltTextField.tsx        ← NOUVEAU (étape 8)
├── MediaFoldersContainer.tsx        ← inchangé
├── MediaFoldersView.tsx             ← modifié (étape 2: ~270 lignes)
├── MediaFolderFormDialog.tsx        ← NOUVEAU (étape 2)
├── MediaTagsContainer.tsx           ← inchangé
├── MediaTagsView.tsx                ← modifié (étape 3: ~272 lignes)
├── MediaTagFormDialog.tsx           ← NOUVEAU (étape 3)
├── MediaUploadDialog.tsx            ← inchangé
├── MediaLibraryPicker.tsx           ← modifié (étape 6: suppression export default)
├── MediaExternalUrlInput.tsx        ← inchangé
├── hooks/
│   └── useMediaLibraryState.ts      ← NOUVEAU (étape 10a)
```

**Total** : 15 fichiers nouveaux, 10 fichiers modifiés, 6 inchangés

---

## Vérification

### Automatisée
- `pnpm lint` — aucune régression ESLint
- `pnpm build` — build production réussie
- Vérifier : `find components/features/admin/media -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn` — aucun fichier > 300 lignes

### Manuelle
- **Upload** : téléverser une image, vérifier toast succès + apparition dans la grille
- **Bulk actions** : sélectionner 3+ médias, tester tag/untag/move/delete via badges et selects
- **Details panel** : cliquer une image, modifier alt_text, changer dossier, ajouter/retirer tags, sauvegarder
- **Folders CRUD** : créer/éditer/supprimer un dossier via le dialog
- **Tags CRUD** : créer/éditer/supprimer un tag via le dialog
- **ImageFieldGroup** : dans un formulaire admin (ex: `/admin/team/new`), tester upload + médiathèque + URL externe + alt text
- **A11y** : naviguer au clavier dans les dialogs FormFolder/FormTag, vérifier `aria-required` visible dans l'inspecteur

---

## Décisions

- **API Route search maintenue** — conforme aux instructions next-backend (SA = mutations, API = lectures paginées interactives)
- **`ImageFieldGroup` : split interne, API publique préservée** — les 9 consommateurs ne sont pas impactés. Ticket compound components en follow-up
- **`formatFileSize` centralisé dans `lib/utils/format.ts`** — unification des 2 implémentations divergentes
- **Sous-dossiers `details/` et `image-field/`** — groupent les sous-composants privés par domaine, sans polluer l'index.ts
- **`MediaLibraryContext` en Phase 3** — livrable indépendamment des Phases 1-2, le plus gros changement architectural
- **Duplication FoldersView/TagsView tolérée** — les Views passent sous 300 lignes après extraction FormDialogs, la généricisation est reportée
