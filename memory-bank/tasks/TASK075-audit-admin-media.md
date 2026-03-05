# Audit de conformité — media

**29 fichiers analysés** (21 racine + 4 details/ + 3 image-field/ + 1 hooks/)

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
