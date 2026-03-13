# 🎯 PLAN: MediaPickerDialog Refactoring & Unification

> **Statut** : ✅ **IMPLÉMENTÉ** (2025-11-25)

## 📊 Situation Initiale (Avant Refactoring)

### Fichiers Existants (Dupliqués)

1. **`components/features/admin/media/MediaPickerDialog.tsx`** (TASK026)
   - **Fonction**: Recherche dans une bibliothèque média existante
   - **Mode**: Sélection uniquement (pas d'upload)
   - **Backend**: API `/api/admin/media/search` (stub vide)
   - **Interface**: `onSelect: (media: { id: bigint; url: string }) => void`

2. **`components/features/admin/team/MediaPickerDialog.tsx`** (TASK021)
   - **Fonction**: Upload direct de photos
   - **Mode**: Upload vers Supabase Storage
   - **Backend**: Server Action `uploadTeamMemberPhoto()`
   - **Interface**: `onSelect: (mediaId: number, imageUrl: string) => void`

### Problèmes Identifiés

❌ **Duplication de code** : 2 composants avec des noms identiques
❌ **Incohérence de types** : `bigint` vs `number` pour `mediaId`
❌ **Fonctionnalités différentes** : Search vs Upload
❌ **Imports ambigus** : Chemin non explicite pour différencier les 2
❌ **API non implémentée** : `/api/admin/media/search` retournait `[]`

---

## 🎯 Objectifs Atteints

### Système Unifié avec 3 Modes

1. **MediaUploadDialog** : Upload direct de fichiers vers Supabase Storage
2. **MediaLibraryPicker** : Recherche et sélection dans la médiathèque existante
3. **MediaExternalUrlInput** : Saisie d'URL externe avec validation

### Objectifs Secondaires

✅ Types harmonisés (`number` conforme à `lib/database.types.ts`)
✅ Duplication éliminée (2 fichiers → 1 système modulaire)
✅ DX améliorée (imports centralisés via `index.ts`)
✅ API search complètement implémentée avec pagination

---

## 📋 Implémentation Réalisée

### Phase 1: Types Partagés ✅

**Fichier créé** : `lib/types/media.ts`

```typescript
export interface MediaSelectResult {
  id: number;
  url: string;
}

export interface MediaItem {
  id: number;
  storage_path: string;
  filename: string | null;
  mime: string | null;
  size_bytes: number | null;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaSearchItem {
  id: number;
  url: string;
  name: string;
  mime: string | null;
  alt_text: string | null;
}

export type MediaPickerMode = "upload" | "library" | "external-url";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png", 
  "image/webp",
  "image/avif",
] as const;

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
```

---

### Phase 2: API Search Implémentée ✅

**Fichier modifié** : `app/api/admin/media/search/route.ts`

Fonctionnalités implémentées :

- ✅ Query sur table `medias` Supabase
- ✅ Recherche par `filename` et `alt_text` (ilike)
- ✅ Filtrage automatique par images (`mime LIKE 'image/%'`)
- ✅ Pagination complète (`page`, `limit`, `total`, `totalPages`)
- ✅ Protection admin via `withAdminAuth()`
- ✅ Construction URL publique Supabase Storage

---

### Phase 3: Composants Créés ✅

**Structure finale** :

```bash
components/features/admin/media/
├── MediaUploadDialog.tsx       # Mode 1: Upload vers Storage
├── MediaLibraryPicker.tsx      # Mode 2: Recherche médiathèque
├── MediaExternalUrlInput.tsx   # Mode 3: URL externe
├── index.ts                    # Exports centralisés
```

#### MediaUploadDialog.tsx

- Upload vers Supabase Storage via `uploadTeamMemberPhoto()`
- Validation MIME (JPEG, PNG, WebP, AVIF) et taille (5MB max)
- Preview avant upload avec next/image
- États de chargement (Loader2)
- Interface : `onSelect: (result: MediaSelectResult) => void`

#### MediaLibraryPicker.tsx

- Recherche via `/api/admin/media/search`
- Grille responsive (3-4 colonnes) avec sélection visuelle
- Pagination avec boutons Précédent/Suivant
- Debounce 300ms sur la recherche
- Interface : `onSelect: (result: MediaSelectResult) => void`

#### MediaExternalUrlInput.tsx

- Input URL avec validation format (http/https)
- Vérification accessibilité image (test de chargement)
- Preview après validation réussie
- États visuels : idle, validating, valid, invalid
- Interface : `value: string, onChange: (url: string) => void`

---

### Phase 4: Migration des Imports ✅

| Fichier | Ancien Import | Nouveau Import |
|---------|---------------|----------------|
| `HeroSlideForm.tsx` | `media/MediaPickerDialog` | `MediaLibraryPicker` |
| `AboutContentForm.tsx` | `media/MediaPickerDialog` | `MediaLibraryPicker` |
| `TeamMemberForm.tsx` | `./MediaPickerDialog` | `MediaUploadDialog` |
| `TeamManagementContainer.tsx` | `./MediaPickerDialog` | `MediaUploadDialog` |

**Nouveau pattern d'import** :

```typescript
import { MediaLibraryPicker, type MediaSelectResult } from "@/components/features/admin/media";
import { MediaUploadDialog, type MediaSelectResult } from "@/components/features/admin/media";
import { MediaExternalUrlInput } from "@/components/features/admin/media";
```

---

### Phase 5: Nettoyage ✅

Fichiers supprimés :

1. ✅ `components/features/admin/media/MediaPickerDialog.tsx`
2. ✅ `components/features/admin/team/MediaPickerDialog.tsx`

---

## ✅ Checklist Finale

### Phase 1: Préparation

- [x] Créer `lib/types/media.ts` avec types partagés
- [x] Type `number` pour tous les IDs (conforme à `database.types.ts`)

### Phase 2: API

- [x] Implémenter `/api/admin/media/search` (requête Supabase réelle)
- [x] Pagination (`page`, `limit`, `total`, `totalPages`)
- [x] Filtrage par images uniquement

### Phase 3: Composants

- [x] Créer `MediaUploadDialog.tsx`
- [x] Créer `MediaLibraryPicker.tsx`
- [x] Créer `MediaExternalUrlInput.tsx` (3ème mode ajouté)
- [x] Créer `index.ts` avec exports centralisés
- [x] Harmoniser interface : `onSelect: (result: MediaSelectResult) => void`

### Phase 4: Migration

- [x] Mettre à jour `HeroSlideForm.tsx`
- [x] Mettre à jour `AboutContentForm.tsx`
- [x] Mettre à jour `TeamMemberForm.tsx`
- [x] Mettre à jour `TeamManagementContainer.tsx`

### Phase 5: Nettoyage

- [x] Supprimer anciens fichiers MediaPickerDialog
- [x] Vérifier qu'aucun import cassé ne subsiste

### Phase 6: Validation

- [x] TypeScript compile sans erreurs (`pnpm tsc --noEmit`)
- [ ] Tests manuels des 3 composants
- [ ] Formulaires (Hero, About, Team) fonctionnent

---

## 📊 Bilan Final

### Fichiers Créés (5)

1. `lib/types/media.ts`
2. `components/features/admin/media/MediaUploadDialog.tsx`
3. `components/features/admin/media/MediaLibraryPicker.tsx`
4. `components/features/admin/media/MediaExternalUrlInput.tsx`
5. `components/features/admin/media/index.ts`

### Fichiers Modifiés (5)

1. `app/api/admin/media/search/route.ts` (implémentation complète)
2. `components/features/admin/home/HeroSlideForm.tsx` (import migré)
3. `components/features/admin/home/AboutContentForm.tsx` (import migré)
4. `components/features/admin/team/TeamMemberForm.tsx` (import migré)
5. `components/features/admin/team/TeamManagementContainer.tsx` (import migré)

### Fichiers Supprimés (2)

1. `components/features/admin/media/MediaPickerDialog.tsx`
2. `components/features/admin/team/MediaPickerDialog.tsx`

---

## 🔧 Décisions Techniques

### Type d'ID : `number` ✅

- Conforme à `lib/database.types.ts` (table `medias.id` = `number`)
- Compatible avec Server Action `uploadTeamMemberPhoto()`
- Évite conversions `BigInt()` inutiles

### 3 Modes Séparés ✅

- Composants spécialisés plutôt qu'un composant monolithique
- Réutilisabilité maximale
- Import uniquement ce qui est nécessaire

### Interface Unifiée

```typescript
// Pour Upload et Library
onSelect: (result: MediaSelectResult) => void
// où MediaSelectResult = { id: number; url: string }

// Pour External URL (inline, pas dialog)
value: string
onChange: (url: string) => void
```

---

## 📖 Guide d'Utilisation

### Mode 1: Upload Direct

```tsx
import { MediaUploadDialog } from "@/components/features/admin/media";

<MediaUploadDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSelect={(result) => {
    setMediaId(result.id);
    setImageUrl(result.url);
  }}
/>
```

### Mode 2: Sélection Médiathèque

```tsx
import { MediaLibraryPicker } from "@/components/features/admin/media";

<MediaLibraryPicker
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSelect={(result) => {
    setMediaId(result.id);
    setImageUrl(result.url);
  }}
/>
```

### Mode 3: URL Externe

```tsx
import { MediaExternalUrlInput } from "@/components/features/admin/media";

<MediaExternalUrlInput
  value={imageUrl}
  onChange={setImageUrl}
  label="URL de l'image"
  description="Utilisé si aucune photo n'est téléversée"
/>
```

---

## 🎓 Leçons Apprises (Post-Mortem)

### Problème de re-render avec API Routes

Lors de l'implémentation initiale des formulaires Hero/About, l'architecture utilisait des **API Routes** pour les mutations CRUD. Cela a causé un bug critique :

**Symptôme** : Après création/modification/suppression, l'UI ne se mettait pas à jour immédiatement.

**Cause** : `revalidatePath()` appelé depuis le DAL via une API Route ne déclenche pas de re-render côté client.

**Solution** : Remplacer les API Routes par des **Server Actions** pour les mutations, en suivant le pattern documenté dans `.github/instructions/crud-server-actions-pattern.instructions.md`.

### Impact sur ce refactoring

Les composants `MediaLibraryPicker` et `MediaUploadDialog` sont correctement intégrés dans les formulaires, mais les formulaires eux-mêmes ont dû être refactorisés pour utiliser des Server Actions au lieu de `fetch()` vers des API Routes.

**Documentation de référence** :

- `.github/instructions/crud-server-actions-pattern.instructions.md`
- `doc/fix-rerender-homeHeroSlide.md`

---

**Date d'implémentation** : 2025-11-25
**Date de mise à jour** : 2025-11-26 (ajout leçons apprises)
**Statut** : ✅ TERMINÉ

````
