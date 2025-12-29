# Phase 4.2d - Améliorations Barre de Sélection & Dossiers ✅

**Date**: 28 Décembre 2025  
**Status**: ✅ TERMINÉ  
**Composants modifiés**:

- `components/features/admin/media/MediaBulkActions.tsx`
- `components/features/admin/media/MediaCard.tsx`
- `components/features/admin/media/MediaLibraryView.tsx`
- `lib/actions/media-bulk-actions.ts`

## 🎯 Objectifs

1. ✅ Afficher le dossier source des médias sélectionnés dans la barre d'actions
2. ✅ Permettre de retirer des tags (pas seulement ajouter)
3. ✅ Afficher le dossier de chaque image sur les MediaCards
4. 🔄 Préparer l'indicateur d'usage public (Phase 4.3+)

## 📋 Fonctionnalités Implémentées

### 1. MediaCard - Affichage du Dossier ✅

**Ajout** : Section "Folder & Usage Info" sous les tags

```tsx
{/* Folder & Usage Info */}
<div className="mt-2 flex flex-col gap-1">
  {/* Folder location */}
  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
    <Folder className="h-3 w-3 flex-shrink-0" />
    <span className="truncate">
      {media.folder?.name ?? "Racine"}
    </span>
  </div>
  
  {/* TODO Phase 4.3: Usage tracking */}
</div>
```

**Visuellement** :

- 📁 Icône Folder + nom du dossier
- Texte tronqué avec tooltip complet
- Style muted-foreground (discret)
- "Racine" si pas de dossier

### 2. MediaBulkActions - Affichage Dossiers Sources ✅

**Modifié** : Interface pour recevoir médias complets

```typescript
interface MediaBulkActionsProps {
    selectedMedia: MediaItemExtendedDTO[]; // ✅ Médias complets (vs selectedIds)
    folders: MediaFolderDTO[];
    tags: MediaTagDTO[];
    onClearSelection: () => void;
    onSuccess: () => void;
}
```

**Ajout** : Calcul des dossiers sources uniques

```typescript
const sourceFolders = Array.from(
    new Set(
        selectedMedia.map(m => m.folder?.name ?? "Racine")
    )
);
```

**Ajout** : Affichage sous le compteur de sélection

```tsx
{/* Source folders info */}
{sourceFolders.length > 0 && (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Folder className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">
            {sourceFolders.length === 1 
                ? sourceFolders[0]
                : `${sourceFolders.length} dossiers différents`
            }
        </span>
    </div>
)}
```

**Comportement** :

- 1 dossier : "Nom du dossier"
- Plusieurs : "3 dossiers différents"
- Tooltip avec liste complète

### 3. MediaBulkActions - Retrait de Tags ✅

**Nouvelle Server Action** : `bulkUntagMediaAction`

```typescript
// lib/actions/media-bulk-actions.ts
export async function bulkUntagMediaAction(
    mediaIds: number[],
    tagIds: number[]
): Promise<BulkActionResult> {
    // Validation Zod (max 50 items)
    // DELETE from media_item_tags WHERE media_id IN (...) AND tag_id IN (...)
    // revalidatePath après succès
}
```

**Nouvelle UI** : Deux sections de tags (ajouter + retirer)

```tsx
{/* Add & Remove tags */}
<div className="hidden lg:flex flex-col gap-2">
    {/* Add tags section */}
    <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Ajouter:</span>
        <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
                <Badge
                    variant={selectedTagsToAdd.includes(tag.id) ? "default" : "outline"}
                    onClick={() => toggleTagToAdd(tag.id)}
                    role="checkbox"
                    aria-checked={selectedTagsToAdd.includes(tag.id)}
                />
            ))}
        </div>
        <Button onClick={handleBulkTag}>
            <Tag className="mr-1.5 h-3.5 w-3.5" />
            +
        </Button>
    </div>

    {/* Remove tags section */}
    <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Retirer:</span>
        <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
                <Badge
                    variant={selectedTagsToRemove.includes(tag.id) ? "destructive" : "outline"}
                    onClick={() => toggleTagToRemove(tag.id)}
                    role="checkbox"
                    aria-checked={selectedTagsToRemove.includes(tag.id)}
                />
            ))}
        </div>
        <Button variant="destructive" onClick={handleBulkUntag}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            -
        </Button>
    </div>
</div>
```

**États séparés** :

- `selectedTagsToAdd`: Tags à ajouter
- `selectedTagsToRemove`: Tags à retirer
- Boutons distincts (+) et (-)
- Variant "destructive" pour retrait (rouge)

### 4. MediaLibraryView - Passage Médias Complets ✅

**Modifié** : Appel MediaBulkActions

```tsx
<MediaBulkActions
    selectedMedia={media.filter(m => selectedIds.includes(m.id))} // ✅ Médias complets
    folders={availableFolders}
    tags={availableTags}
    onClearSelection={() => setSelectedIds([])}
    onSuccess={() => {
        router.refresh();
        setSelectedIds([]);
    }}
/>
```

**Avantage** :

- Accès aux informations complètes (folder, tags)
- Pas besoin de fetch supplémentaire
- Cohérence avec pattern existant

## 🎨 Design & UX

### Codes Couleur

| Élément | Couleur | Raison |
| --------- | --------- | -------- |
| **Dossiers** | `text-muted-foreground` | Information contextuelle, non prioritaire |
| **Ajouter tags** | `variant="default"` (primary) | Action positive |
| **Retirer tags** | `variant="destructive"` (rouge) | Action de suppression |
| **Badge sélectionné (ajout)** | `bg-primary` | Feedback visuel positif |
| **Badge sélectionné (retrait)** | `bg-destructive` | Feedback visuel warning |

### Icônes

- 📁 `Folder` : Dossiers (h-3 w-3)
- 👁️ `Eye` : Usage public (prévu Phase 4.3)
- 🏷️ `Tag` : Ajouter tags
- ❌ `X` : Retirer tags

### Responsive

- **Dossiers sources** : Toujours visibles (essentiels)
- **Tags** : `hidden lg:flex` (desktop uniquement)
- **Tailles** : text-xs pour informations secondaires

## 🔧 Modifications Techniques

### Fichiers Modifiés

| Fichier | Lignes | Changements |
| --------- | -------- | ------------- |
| **MediaCard.tsx** | +35 | Import Folder/Eye, section dossier+usage |
| **MediaBulkActions.tsx** | +85 | Interface, dossiers sources, dual tags UI |
| **MediaLibraryView.tsx** | 1 ligne | Filter médias au lieu de passer IDs |
| **media-bulk-actions.ts** | +45 | bulkUntagMediaAction function |

### Nouveaux Imports

```typescript
// MediaCard.tsx
import { Folder, Eye } from "lucide-react";

// MediaBulkActions.tsx
import { Folder } from "lucide-react";
import { bulkUntagMediaAction } from "@/lib/actions/media-bulk-actions";
import type { MediaItemExtendedDTO } from "@/lib/schemas/media";
```

### Nouveaux Types/Interfaces

```typescript
// MediaBulkActionsProps.selectedMedia
selectedMedia: MediaItemExtendedDTO[];  // Au lieu de selectedIds: number[]
```

## ✅ Validation

### TypeScript

```bash
pnpm tsc --noEmit
# ✅ Aucune erreur
```

### Build Next.js 16

```bash
pnpm build
# ✅ Build successful
# Routes: /admin/media (Dynamic)
```

### Tests Manuels Recommandés

- [ ] Sélectionner médias d'un même dossier → Affiche "Nom dossier"
- [ ] Sélectionner médias de 3 dossiers → Affiche "3 dossiers différents"
- [ ] Sélectionner médias sans dossier → Affiche "Racine"
- [ ] Ajouter 2 tags → Vérifier ajout en base
- [ ] Retirer 1 tag → Vérifier suppression en base
- [ ] Médias ont icône dossier sur cards
- [ ] Hover sur dossier → Tooltip nom complet

## 🔮 Prochaines Étapes (Phase 4.3+)

### Usage Public Tracking

**TODO** : Implémenter vérification usage marketing

```typescript
// Fonction DAL à créer
async function isMediaUsedPublic(mediaId: bigint): Promise<boolean> {
    // Checker si media_id est utilisé dans:
    // - spectacles.image_principale_id
    // - spectacles.image_secondaire_id
    // - home_hero_slides.image_media_id
    // - membres_equipe.photo_media_id
    // - etc.
}
```

**Ajout schema** :

```typescript
// MediaItemExtendedDTOSchema
is_used_public: z.boolean().optional(),
```

**UI** (décommenter dans MediaCard) :

```tsx
{media.is_used_public && (
    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <Eye className="h-3 w-3 flex-shrink-0" />
        <span>Utilisé sur le site</span>
    </div>
)}
```

**Avantages** :

- ⚠️ Avertir avant suppression média utilisé
- 📊 Statistiques d'usage
- 🔍 Filter "médias utilisés/non utilisés"

## 📚 Références

- **Schema Media**: `lib/schemas/media.ts` (MediaItemExtendedDTO)
- **DAL Media**: `lib/dal/media.ts` (fetchMediaListWithDetails)
- **Server Actions**: `lib/actions/media-bulk-actions.ts`
- **Pattern SOLID DAL**: `.github/instructions/dal-solid-principles.instructions.md`

---

**Phase suivante**: Phase 4.3 - Usage Tracking & Statistics
