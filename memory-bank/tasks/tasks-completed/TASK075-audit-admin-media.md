# TASK075 — Refactoring Media Admin : React Composition Patterns

**Status:** Completed  
**Added:** 2026-03-05  
**Updated:** 2026-03-05

---

## Original Request

Auditer le module `components/features/admin/media/` contre les React Composition Patterns (`.github/skills/react-best-practices/SKILL.md`), puis implémenter les corrections selon le plan `.github/prompts/plan-TASK075-refactoringMediaAdminCompositionPatterns.prompt.md`.

---

## Thought Process

Le module media admin était bien découpé en petits fichiers (Clean Code respecté), mais n'utilisait **aucun** pattern de composition React : pas de compound components, pas de contexts, tout passait par prop drilling plat. Le refactoring a été structuré en 4 phases pour minimiser le risque de régression :

1. **Phase 1 — Bug fixes** : corriger les anomalies détectées lors de l'audit (paramètre fantôme `availableTags`, dépendances `useEffect`, `AlertDialog` manquants sur folders/tags)
2. **Phase 2 — MediaLibrary Context** : transformer `useMediaLibraryState` en `MediaLibraryProvider` avec context partagé pour éliminer 9 props de prop drilling
3. **Phase 3 — MediaDetails Context** : créer `MediaDetailsProvider` pour regrouper l'état et la logique de la vue détail (8+ props transmises manuellement)
4. **Phase 4 — ImageField Compound Component** : remplacer `ImageFieldGroup` (4 booleans = 16 variantes implicites) par une API composable `ImageField.{ Provider, SourceActions, Preview, AltText }` et migrer les 10 consommateurs

---

## Audit de conformité initial

**29 fichiers analysés** (21 racine + 4 details/ + 3 image-field/ + 1 hooks/)

**Score global : 2/8 règles conformes, 2 partielles, 4 violations.**

| Règle | Statut initial | Impact |
| --- | --- | --- |
| 1.1 Boolean Prop Proliferation | **❌ VIOLATION** | CRITIQUE |
| 1.2 Compound Components | **❌ VIOLATION** | HAUTE |
| 2.1 Decouple State from UI | **⚠️ PARTIEL** | MOYENNE |
| 2.2 Generic Context Interfaces | **❌ NON IMPLÉMENTÉ** | HAUTE |
| 2.3 Lift State into Providers | **❌ NON IMPLÉMENTÉ** | HAUTE |
| 3.1 Explicit Variants | **⚠️ PARTIEL** | MOYENNE |
| 3.2 Children over Render Props | **✅ CONFORME** | — |
| 4.1 React 19 APIs | **✅ CONFORME** | — |

Violations détaillées notables :

- `ImageFieldGroup.tsx` : **4 booleans** (`showAltText`, `showMediaLibrary`, `showExternalUrl`, `showUpload`) = 2⁴ = 16 variantes implicites. Prop drilling vers `ImageSourceActions.tsx`.
- `MediaLibraryView` : 9 valeurs d'état passées individuellement (pas de context). Aucun composant frère ne peut lire l'état sans restructuration.
- `MediaDetailsPanel` : 8+ props transmises manuellement aux sous-composants (MediaPreview, MediaFileInfo, MediaEditForm, MediaDetailActions).
- Bugs : `availableTags` fantôme dans `useMediaLibraryState`, `AlertDialog` JSX absent de `MediaFoldersView` et `MediaTagsView` (bouton delete non fonctionnel).

---

## Implementation Plan

- [x] **Phase 1 — Bug fixes**
  - [x] 1.1 Supprimer `availableTags` fantôme de `useMediaLibraryState`
  - [x] 1.2 Corriger dépendances `useEffect` manquantes
  - [x] 1.3 Ajouter `AlertDialog` manquant dans `MediaFoldersView`
  - [x] 1.4 Ajouter `AlertDialog` manquant dans `MediaTagsView`
- [x] **Phase 2 — MediaLibrary Context**
  - [x] 2.1 Créer `MediaLibraryContext.tsx` (interface `{ state, actions, meta }`)
  - [x] 2.2 Créer `MediaLibraryProvider.tsx` (logique de `useMediaLibraryState`)
  - [x] 2.3 Migrer `MediaLibraryContainer` → `MediaLibraryProvider`
  - [x] 2.4 Migrer `MediaLibraryView` → `useMediaLibrary()` hook
- [x] **Phase 3 — MediaDetails Context**
  - [x] 3.1 Créer `MediaDetailsContext.tsx`
  - [x] 3.2 Créer `MediaDetailsProvider.tsx`
  - [x] 3.3 Migrer `MediaDetailsPanel` et 4 sous-composants (`details/`)
- [x] **Phase 4 — ImageField Compound Component**
  - [x] 4.1 Créer `image-field/ImageFieldContext.tsx`
  - [x] 4.2 Créer `image-field/ImageFieldProvider.tsx`
  - [x] 4.3 Renommer `ImageAltTextField` → `ImageFieldAltText`
  - [x] 4.4 Renommer `ImagePreviewSection` → `ImageFieldPreview`
  - [x] 4.5 Renommer `ImageSourceActions` → `ImageFieldSourceActions`
  - [x] 4.6 Créer `image-field/index.ts` (barrel)
  - [x] 4.7 Créer `ImageField.tsx` (API compound `{ Provider, SourceActions, Preview, AltText }`)
  - [x] 4.8 Migrer 10 consommateurs (`HeroSlideForm`, `AboutContentForm`, `PresentationFormFields`, `PartnerForm`, `TeamMemberForm`, `ArticleEditForm`, `ArticleNewForm`, `PressReleaseEditForm`, `PressReleaseNewForm`, `SpectacleFormImageSection`)
  - [x] 4.9 Supprimer `ImageFieldGroup.tsx`
  - [x] 4.10 Mettre à jour `index.ts` barrel (`ImageField` au lieu de `ImageFieldGroup`)
- [x] **Quality gates** : `pnpm build`, `pnpm lint`, `pnpm run type-check` → 0 erreurs
- [x] **Commit** : branche `refactor/task075-media-admin-composition-patterns`, commit `55f21ce`

---

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Bug `availableTags` fantôme | Complete | 2026-03-05 | useMediaLibraryState nettoyé |
| 1.2 | Fix dépendances useEffect | Complete | 2026-03-05 | ImageFieldGroup |
| 1.3 | AlertDialog MediaFoldersView | Complete | 2026-03-05 | Bouton delete fonctionnel |
| 1.4 | AlertDialog MediaTagsView | Complete | 2026-03-05 | Bug identique phases 1.3 |
| 2.1-2.4 | MediaLibrary Context+Provider | Complete | 2026-03-05 | 9 props éliminées |
| 3.1-3.3 | MediaDetails Context+Provider | Complete | 2026-03-05 | 8+ props éliminées |
| 4.1-4.6 | ImageField sous-composants | Complete | 2026-03-05 | 3 renames + barrel |
| 4.7 | ImageField compound API | Complete | 2026-03-05 | `{ Provider, SourceActions, Preview, AltText }` |
| 4.8 | Migration 10 consommateurs | Complete | 2026-03-05 | 0 import ImageFieldGroup restant |
| 4.9-4.10 | Nettoyage barrel | Complete | 2026-03-05 | ImageFieldGroup.tsx supprimé |
| QG | pnpm build/lint/type-check | Complete | 2026-03-05 | 0 erreurs, 2 warnings pré-existants |
| GIT | Commit + push branch | Complete | 2026-03-05 | `55f21ce`, 36 fichiers +1542/-636L |

---

## Progress Log

### 2026-03-05

**Phase 1 — Bug fixes** :

- Supprimé le paramètre fantôme `availableTags` de l'interface et de l'appel dans `useMediaLibraryState.ts`
- Corrigé les dépendances `useEffect` dans `ImageFieldGroup.tsx`
- Découvert que `MediaFoldersView.tsx` avait l'état `openDeleteDialog` + `deleteCandidate` + la callback `requestDelete()` mais **aucun `<AlertDialog>` dans le JSX** → bouton "Supprimer" ne produisait aucun effet. Ajouté import + `<AlertDialog>` complet avec `AlertDialogAction` destructive.
- Même bug identique dans `MediaTagsView.tsx` → identique correction.

**Phase 2 — MediaLibrary Context** :

- Créé `MediaLibraryContext.tsx` avec interface typée `{ state: MediaLibraryState, actions: MediaLibraryActions, meta: MediaLibraryMeta }`
- Créé `MediaLibraryProvider.tsx` : extraction de toute la logique de `useMediaLibraryState` dans un Provider React 19 (`<MediaLibraryContext value={...}>`)
- `MediaLibraryContainer` migré pour envelopper avec `<MediaLibraryProvider>`
- `MediaLibraryView` migré pour consommer `useMediaLibrary()` au lieu de recevoir 9 props

**Phase 3 — MediaDetails Context** :

- Créé `MediaDetailsContext.tsx` + `MediaDetailsProvider.tsx`
- `MediaDetailsPanel.tsx` migré pour utiliser le Provider
- Tous les sous-composants `details/` (`MediaDetailActions`, `MediaEditForm`, `MediaFileInfo`, `MediaPreview`) migrés vers `useMediaDetails()`

**Phase 4 — ImageField Compound Component** :

- Créé `image-field/ImageFieldContext.tsx` et `image-field/ImageFieldProvider.tsx` gérant l'état form field + validation URL SSRF
- Renommé : `ImageAltTextField` → `ImageFieldAltText`, `ImagePreviewSection` → `ImageFieldPreview`, `ImageSourceActions` → `ImageFieldSourceActions`
- Créé `image-field/index.ts` (barrel)
- Créé `ImageField.tsx` exposant l'API compound : `ImageField.Provider`, `ImageField.SourceActions` , `ImageField.Preview`, `ImageField.AltText`
- Migré 10 consommateurs : `HeroSlideForm`, `AboutContentForm`, `PresentationFormFields`, `PartnerForm`, `TeamMemberForm`, `ArticleEditForm`, `ArticleNewForm`, `PressReleaseEditForm`, `PressReleaseNewForm`, `SpectacleFormImageSection`
- Supprimé `ImageFieldGroup.tsx`, mis à jour `index.ts` barrel

**Quality gates** :

- `pnpm build` → ✅ 0 erreurs
- `pnpm lint` → ✅ 0 erreurs (2 warnings pré-existants non liés)
- `pnpm run type-check` → ✅ 0 erreurs

**Commit** :

- Branche : `refactor/task075-media-admin-composition-patterns`
- Commit : `55f21ce` — `refactor(media): migrate admin media module to React Composition Patterns (TASK075)`
- 36 fichiers modifiés, +1542 insertions / −636 suppressions
- Pusshé sur origin

---

## Fichiers livrés

### Nouveaux fichiers créés

| Fichier | Description |
| --- | --- |
| `components/features/admin/media/MediaLibraryContext.tsx` | Context typé `{ state, actions, meta }` |
| `components/features/admin/media/MediaLibraryProvider.tsx` | Provider avec toute la logique MediaLibrary |
| `components/features/admin/media/MediaDetailsContext.tsx` | Context pour le panneau de détail |
| `components/features/admin/media/MediaDetailsProvider.tsx` | Provider wrappant MediaDetailsPanel |
| `components/features/admin/media/ImageField.tsx` | API compound `{ Provider, SourceActions, Preview, AltText }` |
| `components/features/admin/media/image-field/ImageFieldContext.tsx` | Context form field state |
| `components/features/admin/media/image-field/ImageFieldProvider.tsx` | Remplace ImageFieldGroup |
| `components/features/admin/media/image-field/ImageFieldAltText.tsx` | Renommé depuis ImageAltTextField |
| `components/features/admin/media/image-field/ImageFieldPreview.tsx` | Renommé depuis ImagePreviewSection |
| `components/features/admin/media/image-field/ImageFieldSourceActions.tsx` | Renommé depuis ImageSourceActions |
| `components/features/admin/media/image-field/index.ts` | Barrel export |
| `.github/prompts/plan-TASK075-refactoringMediaAdminCompositionPatterns.prompt.md` | Plan d'implémentation |

### Fichiers supprimés

| Fichier | Raison |
| --- | --- |
| `components/features/admin/media/ImageFieldGroup.tsx` | Remplacé par `ImageField` compound component |

### Fichiers modifiés principaux

| Fichier | Changement |
| --- | --- |
| `MediaLibraryContainer.tsx` | Utilise `MediaLibraryProvider` |
| `MediaLibraryView.tsx` | Consomme `useMediaLibrary()` |
| `MediaDetailsPanel.tsx` | Utilise `MediaDetailsProvider` |
| `details/MediaDetailActions.tsx` | Consomme `useMediaDetails()` |
| `details/MediaEditForm.tsx` | Consomme `useMediaDetails()` |
| `details/MediaFileInfo.tsx` | Consomme `useMediaDetails()` |
| `details/MediaPreview.tsx` | Consomme `useMediaDetails()` |
| `hooks/useMediaLibraryState.ts` | Nettoyage fantôme `availableTags` |
| `MediaFolderFormDialog.tsx` | Mise à jour consommateur |
| `index.ts` | Export `ImageField` au lieu de `ImageFieldGroup` |
| `MediaFoldersView.tsx` | **Bug fix** : `AlertDialog` ajouté |
| `MediaTagsView.tsx` | **Bug fix** : `AlertDialog` ajouté |
| 10 consommateurs formulaires | API compound `ImageField` |

---

## 1. Component Architecture

### 1.1 Avoid Boolean Prop Proliferation — **VIOLATION CRITIQUE**

ImageFieldGroup.tsx utilise **4 booléens conditionnels** :

```tsx
showAltText = true,
showMediaLibrary = true,
showExternalUrl = true,
showUpload = false,
```

Chaque booléen double les états possibles (2^4 = 16 variantes implicites). Ces booleans sont ensuite transmis par prop drilling à ImageSourceActions.tsx :

```tsx
showUpload?: boolean;
showMediaLibrary?: boolean;
showExternalUrl?: boolean;
```

**Recommandation** : Refactorer en compound components. Le consommateur compose ce qu'il veut :

```tsx
// Au lieu de :
<ImageFieldGroup showUpload showMediaLibrary showExternalUrl={false} />

// Composer explicitement :
<ImageField.Provider form={form} imageUrlField="image_url">
  <ImageField.Label>Image</ImageField.Label>
  <ImageField.Upload folder="team" />
  <ImageField.Library />
  <ImageField.Preview />
  <ImageField.AltText field="alt_text" />
</ImageField.Provider>
```

---

### 1.2 Use Compound Components — **VIOLATION HAUTE**

Aucun composite component n'utilise le pattern compound + context. Tous utilisent du **prop drilling plat** :

| Composant parent | Enfants composés | Pattern utilisé |
| --- | --- | --- |
| MediaLibraryView | MediaCard, MediaBulkActions, MediaDetailsPanel, MediaUploadDialog | Hook + props individuelles |
| MediaDetailsPanel | MediaPreview, MediaFileInfo, MediaEditForm, MediaDetailActions | Props distribuées manuellement |
| MediaBulkActions | BulkTagSelector, BulkDeleteDialog | Props distribuées |
| ImageFieldGroup | ImageSourceActions, ImagePreviewSection, ImageAltTextField | Props individuelles |

La décomposition en sous-composants est bonne. Mais **l'absence de contexte partagé** signifie :

- Ajouter un sous-composant exige de modifier le parent pour ajouter les props
- Les composants frères ne peuvent pas accéder à l'état partagé sans remonter
- Aucune flexibilité de composition pour les consommateurs

---

## 2. State Management

### 2.1 Decouple State from UI — **CONFORMITÉ PARTIELLE**

**Bon** : useMediaLibraryState extrait correctement l'état de `MediaLibraryView`. Structure `state + handlers + computed` claire.

**Violation** : MediaDetailsPanel.tsx mélange gestion d'état **et** logique métier :

```tsx
// État UI ✅
const [isUpdating, setIsUpdating] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

// Logique métier dans le composant UI ❌
const handleUpdate = async (data, tagsToAdd, tagsToRemove) => {
  // calcul de tag IDs, appel server action, toast, callback...
};
const handleDelete = async () => { /* idem */ };
const handleRegenerateThumbnail = async () => { /* idem */ };
```

Cette logique devrait être dans un hook ou provider dédié (`useMediaDetailActions`).

---

### 2.2 Generic Context Interfaces — **NON IMPLÉMENTÉ**

Aucune interface de contexte générique n'existe. Pas de `MediaLibraryContextValue` ni de `MediaDetailContextValue` permettant le dependency injection via providers.

---

### 2.3 Lift State into Provider Components — **NON IMPLÉMENTÉ**

`useMediaLibraryState` est un **hook**, pas un **provider**. Conséquence : seul le composant direct qui appelle le hook peut accéder à l'état. Un composant externe (bouton d'action dans un `Dialog`, indicateur de statut dans une sidebar) ne peut pas lire/écrire l'état de la bibliothèque sans prop drilling.

**Exemple concret du problème** : Si on voulait ajouter un compteur de sélection dans le header du layout admin (en dehors de `MediaLibraryView`), c'est impossible sans restructuration.

---

## 3. Implementation Patterns

### 3.1 Explicit Component Variants — **VIOLATION MOYENNE**

`ImageFieldGroup` a des variantes implicites via booleans. Devrait être :

```tsx
// ✅ Explicite
<TeamImageField />     // library + upload + alt text
<ExternalImageField /> // external URL seulement
<SimpleImageField />   // library seulement
```

---

### 3.2 Prefer Children Over Render Props — **CONFORME** ✅

Aucun render prop trouvé. Tous les composants utilisent des `children` directs ou du JSX explicite.

---

## 4. React 19 APIs

### 4.1 API Changes — **CONFORME** ✅

- Aucun `forwardRef` (correct pour React 19)
- Aucun `useContext` (parce qu'aucun contexte n'est utilisé — ce qui est lui-même un symptôme de la violation 1.2)

---

## 5. Problèmes supplémentaires détectés

| Sévérité | Fichier | Problème |
| --- | --- | --- |
| **BUG** | useMediaLibraryState.ts | `availableTags` déclaré dans l'interface mais **non destructuré** — paramètre fantôme |
| **LINT** | ImageFieldGroup.tsx | `useEffect` dépend de `[imageUrl]` mais appelle `handleValidateUrl` (closure non listée dans deps). Le commentaire `// Only depend on imageUrl` reconnaît l'omission |
| **BONNE PRATIQUE** ✅ | MediaEditForm.tsx | Pattern "derived state reset" (`if (lastMediaId !== media.id)`) — recommandé par React |
| **A11Y** ✅ | MediaCard.tsx | `role="button"`, `tabIndex`, `aria-label`, `aria-pressed`, keyboard handling — excellent |
| **A11Y** ✅ | TagActionBadge.tsx | `role="button"`, `tabIndex={0}`, `aria-label`, `aria-disabled`, keyboard Enter/Space |

---

## Résumé de conformité

| Règle | Statut | Impact |
| --- | --- | --- |
| 1.1 Boolean Prop Proliferation | **❌ VIOLATION** | CRITIQUE |
| 1.2 Compound Components | **❌ VIOLATION** | HAUTE |
| 2.1 Decouple State from UI | **⚠️ PARTIEL** | MOYENNE |
| 2.2 Generic Context Interfaces | **❌ NON IMPLÉMENTÉ** | HAUTE |
| 2.3 Lift State into Providers | **❌ NON IMPLÉMENTÉ** | HAUTE |
| 3.1 Explicit Variants | **⚠️ PARTIEL** | MOYENNE |
| 3.2 Children over Render Props | **✅ CONFORME** | — |
| 4.1 React 19 APIs | **✅ CONFORME** | — |

**Score global : 2/8 règles conformes, 2 partielles, 4 violations.**

---

Le module est **bien décomposé en petits fichiers** (Clean Code respecté pour les limites de lignes et la responsabilité unique). Mais il n'utilise **aucun** des patterns de composition recommandés (compound components, context providers, dependency injection). Le refactoring principal serait de convertir `useMediaLibraryState` en `MediaLibraryProvider` avec un contexte partagé, et de transformer `ImageFieldGroup` en compound component.
