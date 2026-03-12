# Plan : Refactoring Media Admin — React Composition Patterns

## TL;DR

Corriger les 6 violations identifiées dans l'audit TASK075 en migrant le module `components/features/admin/media/` vers les React Composition Patterns (compound components, context providers, dependency injection). Le refactoring suit le même pattern que `AgendaContext.tsx` déjà implémenté dans le projet. Deux axes principaux : (A) MediaLibrary → provider-based avec contexte partagé, (B) ImageFieldGroup → compound component composable éliminant les 4 booleans.

---

## Phase 1 — Préparation et bug fixes (indépendante)

**Objectif** : Corriger les bugs et violations mineures avant le refactoring structurel.

### Étape 1.1 — Fix bug `availableTags` fantôme dans `useMediaLibraryState`

- **Fichier** : `components/features/admin/media/hooks/useMediaLibraryState.ts`
- **Problème** : `availableTags` est déclaré dans l'interface `MediaLibraryStateProps` mais n'est PAS destructuré dans les paramètres du hook (ligne 18 : seuls `initialMedia` et `availableFolders` sont extraits). Paramètre accepté mais silencieusement ignoré.
- **Action** : Ajouter `availableTags` à la destructuration ET l'exposer dans l'objet retourné, OU le retirer de l'interface si inutile. Vérifier l'usage dans `MediaLibraryView.tsx` qui passe cette prop mais utilise `availableTags` directement depuis ses propres props — confirmer que le hook n'en a pas besoin et nettoyer l'interface.

### Étape 1.2 — Fix lint `useEffect` deps dans `ImageFieldGroup`

- **Fichier** : `components/features/admin/media/ImageFieldGroup.tsx` (lignes 79-99)
- **Problème** : Le `useEffect` dépend de `[imageUrl]` mais appelle `handleValidateUrl()` (closure capturant `imageUrl`, `onValidationChange`, etc.). Le commentaire `// Only depend on imageUrl` reconnaît l'omission volontaire.
- **Action** : Extraire `handleValidateUrl` dans un `useCallback` avec les bonnes dépendances, OU utiliser un ref pour `onValidationChange` afin de stabiliser la closure. Pattern recommandé : `onValidationChangeRef = useRef(onValidationChange)` mis à jour dans un useEffect séparé.

---

## Phase 2 — MediaLibrary Context Provider (violations 2.1, 2.2, 2.3)

**Objectif** : Remplacer `useMediaLibraryState` (hook) par un `MediaLibraryProvider` (context) pour permettre à tous les sous-composants d'accéder à l'état sans prop drilling. Suit le pattern `AgendaContext.tsx`.

### Étape 2.1 — Créer l'interface de contexte `MediaLibraryContext.tsx`

- **Nouveau fichier** : `components/features/admin/media/MediaLibraryContext.tsx`
- **Contenu** :
  - Interface `MediaLibraryState` (les 9 `useState` actuels : `media`, `searchQuery`, `selectedFolder`, `selectedTag`, `selectedMedia`, `selectedIds`, `selectionMode`, `isUploadOpen`, `uploadFolder`)
  - Interface `MediaLibraryActions` (les handlers : `setSearchQuery`, `setSelectedFolder`, `setSelectedTag`, `handleCardClick`, `toggleSelectionMode`, `clearSelection`, `handleBulkSuccess`, `handleDetailUpdate`, `handleUploadSuccess`, `setIsUploadOpen`, `setUploadFolder`)
  - Interface `MediaLibraryMeta` (données statiques injectées : `availableTags`, `availableFolders`)
  - Interface `MediaLibraryContextValue { state, actions, meta }`
  - `createContext<MediaLibraryContextValue | null>(null)`
  - `useMediaLibrary()` hook utilisant React 19 `use(MediaLibraryContext)` (comme `AgendaContext`)
- **Pattern de référence** : `components/features/public-site/agenda/AgendaContext.tsx` (lignes 1-146)

### Étape 2.2 — Créer le `MediaLibraryProvider`

- **Nouveau fichier** : `components/features/admin/media/MediaLibraryProvider.tsx`
- **Contenu** :
  - Accepte `{ initialMedia, availableTags, availableFolders, children }` en props
  - Déplace TOUTE la logique d'état de `useMediaLibraryState.ts` dans ce provider
  - Construit l'objet `{ state, actions, meta }` conforme à l'interface
  - Wrappe `children` dans `<MediaLibraryContext value={contextValue}>`
- **Dépendances** : Étape 2.1

### Étape 2.3 — Migrer `MediaLibraryView.tsx` vers le contexte

- **Fichier modifié** : `components/features/admin/media/MediaLibraryView.tsx`
- **Action** :
  - Supprimer les props `initialMedia`, `availableTags`, `availableFolders`
  - Remplacer `useMediaLibraryState({...})` par `useMediaLibrary()` (context hook)
  - Accéder aux valeurs via `const { state, actions, meta } = useMediaLibrary()`
  - Le composant ne reçoit plus de props — tout vient du contexte
- **Dépendances** : Étape 2.2

### Étape 2.4 — Migrer `MediaCard.tsx` (optionnel — gain marginal)

- **Fichier** : `components/features/admin/media/MediaCard.tsx`
- **Analyse** : Ce composant reçoit `isSelected`, `selectionMode`, `onSelect` en props. Il pourrait accéder à `state.selectionMode` et `actions.handleCardClick` via contexte, mais c'est un composant de liste (rendu N fois) — garder les props pour ce cas est acceptable. **Optionnel** : ne pas migrer si le prop drilling reste raisonnable (3 props).

### Étape 2.5 — Mettre à jour `MediaLibraryViewClient.tsx` et `MediaLibraryContainer.tsx`

- **Fichiers modifiés** :
  - `MediaLibraryContainer.tsx` : Wrapper les données dans `<MediaLibraryProvider>` au lieu de les passer en props à `MediaLibraryViewClient`
  - `MediaLibraryViewClient.tsx` : Mettre à jour le dynamic import si nécessaire
- **Pattern** :

  ```
  MediaLibraryContainer (Server) 
    → <MediaLibraryProvider data={...}>
        → <MediaLibraryViewClient />
            → <MediaLibraryView />  (no props needed, uses context)
      </MediaLibraryProvider>
  ```

- **Dépendances** : Étape 2.3

### Étape 2.6 — Supprimer `useMediaLibraryState.ts`

- **Fichier supprimé** : `components/features/admin/media/hooks/useMediaLibraryState.ts`
- **Action** : Supprimer le fichier et le dossier `hooks/` s'il est vide. Mettre à jour `index.ts`.
- **Dépendances** : Étape 2.5

---

## Phase 3 — MediaDetails Context Provider (violation 2.1)

**Objectif** : Extraire la logique métier de `MediaDetailsPanel.tsx` dans un provider dédié.

### Étape 3.1 — Créer `MediaDetailsContext.tsx`

- **Nouveau fichier** : `components/features/admin/media/details/MediaDetailsContext.tsx`
- **Contenu** :
  - Interface `MediaDetailsState` : `{ isUpdating, isDeleting, isRegenerating, publicUrl, form }`
  - Interface `MediaDetailsActions` : `{ handleUpdate, handleDelete, handleRegenerateThumbnail, onClose }`
  - Interface `MediaDetailsMeta` : `{ media, folders, tags }`
  - `MediaDetailsContextValue { state, actions, meta }`
  - `useMediaDetails()` hook avec React 19 `use()`
  
### Étape 3.2 — Créer `MediaDetailsProvider.tsx`

- **Nouveau fichier** : `components/features/admin/media/details/MediaDetailsProvider.tsx`
- **Contenu** :
  - Accepte `{ media, folders, tags, onClose, onUpdate, children }` en props
  - Déplace toute la logique métier de `MediaDetailsPanel.tsx` : `handleUpdate`, `handleDelete`, `handleRegenerateThumbnail`, `publicUrl` fetch, `form` setup
  - Les sous-composants (`MediaPreview`, `MediaEditForm`, `MediaDetailActions`, `MediaFileInfo`) accèdent au contexte directement

### Étape 3.3 — Migrer `MediaDetailsPanel.tsx` et ses sous-composants

- **Fichiers modifiés** :
  - `MediaDetailsPanel.tsx` : Devient un composant de composition (layout only). Crée le `<MediaDetailsProvider>` et compose les enfants. Plus de logique métier.
  - `details/MediaEditForm.tsx` : Remplace la prop `form` par `useMediaDetails().state.form` et `onSubmit` par `actions.handleUpdate`
  - `details/MediaDetailActions.tsx` : Remplace les 4 props (handlers + loading states) par `useMediaDetails()`
  - `details/MediaPreview.tsx` : Utilise `meta.media` et `state.publicUrl` du contexte
  - `details/MediaFileInfo.tsx` : Utilise `meta.media` du contexte
- **Dépendances** : Étape 3.2

---

## Phase 4 — ImageField Compound Component (violations 1.1, 1.2, 3.1)

**Objectif** : Transformer `ImageFieldGroup` de 4 booleans en compound component composable. Les 8 consommateurs composent explicitement les pièces dont ils ont besoin.

### Étape 4.1 — Créer `ImageFieldContext.tsx`

- **Nouveau fichier** : `components/features/admin/media/image-field/ImageFieldContext.tsx`
- **Contenu** :
  - Interface `ImageFieldState` : `{ imageUrl, altText, isValidating, validationError, validationSuccess, isMediaPickerOpen, isUploadOpen }`
  - Interface `ImageFieldActions` : `{ handleMediaSelect, handleUploadSelect, handleUrlChange, handleClearUrl, setIsMediaPickerOpen, setIsUploadOpen }`
  - Interface `ImageFieldMeta` : `{ form, imageUrlField, imageMediaIdField, altTextField, uploadFolder, imageError }`
  - `ImageFieldContextValue { state, actions, meta }`
  - `useImageField()` hook avec React 19 `use()`

### Étape 4.2 — Créer `ImageFieldProvider.tsx`

- **Nouveau fichier** : `components/features/admin/media/image-field/ImageFieldProvider.tsx`
- **Contenu** :
  - Accepte `{ form, imageUrlField, imageMediaIdField?, altTextField?, uploadFolder?, onValidationChange?, children }` en props (les props de configuration, PAS de booleans)
  - Déplace TOUTE la logique de `ImageFieldGroup.tsx` : state management, validation debounce, handlers
  - Wrappe `children` dans le contexte
- **Pattern d'usage cible** :

  ```tsx
  <ImageField.Provider form={form} imageUrlField="image_url" imageMediaIdField="image_media_id" uploadFolder="team">
    <ImageField.Label label="Photo du membre" />
    <ImageField.Upload />
    <ImageField.Library />
    <ImageField.Preview />
  </ImageField.Provider>
  ```

### Étape 4.3 — Créer les sous-composants compound

- **Fichiers modifiés/créés** dans `image-field/` :
  - `ImageFieldLabel.tsx` (nouveau) : Wraps `FormField` + `FormLabel` + required indicator. Consomme `useImageField().meta.form` et le `imageUrlField`.
  - `ImageFieldUpload.tsx` (nouveau) : Bouton upload + `MediaUploadDialog`. Consomme `useImageField()`. Remplace le boolean `showUpload`.
  - `ImageFieldLibrary.tsx` (nouveau) : Bouton Médiathèque + `MediaLibraryPicker`. Consomme `useImageField()`. Remplace le boolean `showMediaLibrary`.
  - `ImageFieldExternalUrl.tsx` (nouveau) : Input URL externe. Consomme `useImageField()`. Remplace le boolean `showExternalUrl`.
  - `ImageFieldAltText.tsx` (nouveau ou renommer `ImageAltTextField.tsx`) : Champ alt text. Consomme `useImageField()`. Remplace le boolean `showAltText`.
  - `ImageFieldPreview.tsx` (nouveau ou renommer `ImagePreviewSection.tsx`) : Preview + validation feedback. Consomme `useImageField()`.
- **Note** : Les anciens fichiers `ImageSourceActions.tsx`, `ImagePreviewSection.tsx`, `ImageAltTextField.tsx` seront remplacés par les nouveaux sous-composants.

### Étape 4.4 — Créer le barrel export `ImageField`

- **Fichier modifié** : `components/features/admin/media/image-field/index.ts` (nouveau)
- **Contenu** :

  ```ts
  export { ImageFieldProvider as Provider } from "./ImageFieldProvider"
  export { ImageFieldLabel as Label } from "./ImageFieldLabel"
  export { ImageFieldUpload as Upload } from "./ImageFieldUpload"
  export { ImageFieldLibrary as Library } from "./ImageFieldLibrary"
  export { ImageFieldExternalUrl as ExternalUrl } from "./ImageFieldExternalUrl"
  export { ImageFieldAltText as AltText } from "./ImageFieldAltText"
  export { ImageFieldPreview as Preview } from "./ImageFieldPreview"
  ```

- **Import dans le parent** : `import * as ImageField from "./image-field"`

### Étape 4.5 — Migrer les 8 consommateurs

Chaque consommateur remplace `<ImageFieldGroup ...booleans>` par une composition explicite.

**Variante "Full" (Presse New/Edit, Article New/Edit, Présentation)** — Library + ExternalUrl + Upload + AltText + Preview :

```tsx
<ImageField.Provider form={form} imageUrlField="image_url" imageMediaIdField="image_media_id" uploadFolder="presse" onValidationChange={...}>
  <ImageField.Label label="Image du communiqué" required />
  <ImageField.Upload />
  <ImageField.Library />
  <ImageField.ExternalUrl />
  <ImageField.Preview description="..." />
  <ImageField.AltText />
</ImageField.Provider>
```

**Variante "Partner"** — Library + Upload (pas d'ExternalUrl, pas d'AltText) :

```tsx
<ImageField.Provider form={form} imageUrlField="logo_url" imageMediaIdField="logo_media_id" uploadFolder="partners">
  <ImageField.Label label="Logo" />
  <ImageField.Upload />
  <ImageField.Library />
  <ImageField.Preview description="Logo du partenaire..." />
</ImageField.Provider>
```

**Variante "Team"** — Library + ExternalUrl + Upload (pas d'AltText) :

```tsx
<ImageField.Provider form={form} imageUrlField="image_url" imageMediaIdField="photo_media_id" uploadFolder="team">
  <ImageField.Label label="Photo du membre" />
  <ImageField.Upload />
  <ImageField.Library />
  <ImageField.ExternalUrl />
  <ImageField.Preview />
</ImageField.Provider>
```

**Fichiers consommateurs à modifier** (8) :

1. `components/features/admin/presse/PressReleaseEditForm.tsx`
2. `components/features/admin/presse/PressReleaseNewForm.tsx`
3. `components/features/admin/presse/ArticleNewForm.tsx`
4. `components/features/admin/presse/ArticleEditForm.tsx`
5. `components/features/admin/partners/PartnerForm.tsx`
6. `components/features/admin/team/TeamMemberForm.tsx`
7. `components/features/admin/compagnie/PresentationFormFields.tsx`
8. `components/features/admin/spectacles/SpectacleFormImageSection.tsx`

### Étape 4.6 — Supprimer l'ancien `ImageFieldGroup.tsx`

- **Fichier supprimé** : `components/features/admin/media/ImageFieldGroup.tsx`
- **Fichiers supprimés** : `image-field/ImageSourceActions.tsx` (logique intégrée dans les sous-composants)
- **Action** : Mettre à jour `index.ts` pour exporter les nouveaux composants
- **Dépendances** : Étape 4.5

---

## Phase 5 — Nettoyage et validation

### Étape 5.1 — Mise à jour des barrel exports

- **Fichier** : `components/features/admin/media/index.ts`
- **Action** : Ajouter les exports des nouveaux providers et supprimer les exports obsolètes (`ImageFieldGroup`, `useMediaLibraryState`)

### Étape 5.2 — Mise à jour des types

- **Fichier** : `components/features/admin/media/types.ts`
- **Action** : Ajouter/exporter les interfaces de contexte si nécessaire

### Étape 5.3 — Vérification TypeScript

- **Commande** : `pnpm build` — aucune erreur de type
- **Commande** : `pnpm lint` — aucun warning ESLint

### Étape 5.4 — Test manuel de non-régression

- Naviguer `/admin/media/library` : upload, sélection, bulk actions, details panel, filtrage
- Tester chaque formulaire consommateur (8 pages) : sélection depuis la médiathèque, upload, URL externe, validation
- Vérifier que les sous-composants conditionnels (AltText, ExternalUrl) s'affichent/masquent correctement selon la composition

---

## Fichiers concernés

### Nouveaux fichiers (8)

- `components/features/admin/media/MediaLibraryContext.tsx` — Interface + hook du contexte bibliothèque
- `components/features/admin/media/MediaLibraryProvider.tsx` — Provider avec logique d'état
- `components/features/admin/media/details/MediaDetailsContext.tsx` — Interface + hook du contexte détails
- `components/features/admin/media/details/MediaDetailsProvider.tsx` — Provider avec logique métier
- `components/features/admin/media/image-field/ImageFieldContext.tsx` — Interface + hook du contexte ImageField
- `components/features/admin/media/image-field/ImageFieldProvider.tsx` — Provider avec logique validation
- `components/features/admin/media/image-field/ImageFieldLabel.tsx` — Sous-composant label
- `components/features/admin/media/image-field/index.ts` — Barrel export compound

### Fichiers modifiés (16)

- `components/features/admin/media/hooks/useMediaLibraryState.ts` — Bug fix `availableTags` (Phase 1), puis supprimé (Phase 2)
- `components/features/admin/media/MediaLibraryView.tsx` — Migration vers contexte
- `components/features/admin/media/MediaLibraryViewClient.tsx` — Adaptation wrapper
- `components/features/admin/media/MediaLibraryContainer.tsx` — Ajout Provider wrapper
- `components/features/admin/media/MediaDetailsPanel.tsx` — Extraction logique vers provider
- `components/features/admin/media/details/MediaEditForm.tsx` — Migration vers contexte
- `components/features/admin/media/details/MediaDetailActions.tsx` — Migration vers contexte
- `components/features/admin/media/details/MediaPreview.tsx` — Migration vers contexte
- `components/features/admin/media/details/MediaFileInfo.tsx` — Migration vers contexte
- `components/features/admin/media/image-field/ImagePreviewSection.tsx` — Renommé/adapté en compound sub
- `components/features/admin/media/image-field/ImageAltTextField.tsx` — Renommé/adapté en compound sub
- `components/features/admin/media/index.ts` — Barrel exports mis à jour
- `components/features/admin/media/types.ts` — Types mis à jour
- 8 fichiers consommateurs (listés en 4.5)

### Fichiers supprimés (3)

- `components/features/admin/media/hooks/useMediaLibraryState.ts`
- `components/features/admin/media/ImageFieldGroup.tsx`
- `components/features/admin/media/image-field/ImageSourceActions.tsx`

---

## Vérification

1. **TypeScript** : `pnpm build` — 0 erreurs de compilation
2. **Lint** : `pnpm lint` — 0 warnings dans `components/features/admin/media/`
3. **Test fonctionnel Media Library** : `/admin/media/library` — upload, filtrage (folder/tag/search), sélection multiple, bulk actions (move, delete, tag), panneau détail (edit metadata, delete, regen thumbnail)
4. **Test fonctionnel ImageField** (8 formulaires) :
   - Presse : New/Edit communiqué + New/Edit article → library + upload + external URL + alt text
   - Partners : Form → library + upload (pas d'external URL, pas d'alt text)
   - Team : Form → library + upload + external URL (pas d'alt text)
   - Compagnie : Présentation → library + external URL + alt text (pas d'upload)
   - Spectacles : Image section → library + upload + external URL (pas d'alt text)
5. **Vérification composition** : Confirmer qu'omettre `<ImageField.AltText />` dans la composition masque bien le champ (et non un crash)
6. **Vérification contexte** : Confirmer qu'un composant hors du `<Provider>` qui appelle `useMediaLibrary()` lève une erreur explicite

## Décisions

- **Pattern fichiers séparés** (pas de namespace objet `MediaLibrary.Provider`) — cohérent avec AgendaContext et NewsletterContext existants
- **MediaCard garde ses props** (pas de migration contexte) — composant de liste rendu N fois, le prop drilling reste acceptable (3 props)
- **ImageSourceActions.tsx supprimé** — sa logique est distribuée dans les 3 nouveaux sub-components (Upload, Library, ExternalUrl)
- **React 19 `use()`** partout — pas de `useContext()` (aligné avec le projet existant)
- **Bug `availableTags`** : à vérifier si le hook l'utilise réellement. S'il ne l'utilise pas, retirer du type d'interface (nettoyage). À résoudre en Phase 1 avant le refactoring.

## Considérations

1. **Ordre d'exécution** : Phase 1 (bug fixes) est indépendante. Phases 2 et 3 sont parallélisables. Phase 4 est indépendante des phases 2-3. Phase 5 attend la fin de toutes les autres.
2. **Impact sur les tests E2E** : Vérifier si des tests Playwright ciblent les formulaires avec ImageFieldGroup. Si oui, les sélecteurs CSS/ARIA pourraient changer.
3. **Taille du refactoring** : ~16 fichiers modifiés + 8 nouveaux + 3 supprimés. Recommandé de faire en 2-3 PRs (Phase 1, Phase 2+3, Phase 4+5) pour faciliter la review.
