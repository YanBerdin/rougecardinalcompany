# Phase 4.3d - Diagnostic Thumbnails Manquants

**Date**: 5 Février 2026  
**Status**: 🔍 **DIAGNOSTIC EN COURS**  
**Problème**: L'indicateur "Optimized" (badge vert avec checkmark) n'apparaît pas dans la bibliothèque média pour les images uploadées via `SpectaclePhotoManager`

---

## 🔍 Analyse du Problème

### Architecture du Système de Thumbnails (Phase 3)

Le système de génération automatique de thumbnails est **correctement implémenté** :

```typescript
// lib/actions/media-actions.ts (lignes 162-196)
export async function uploadMediaImage(formData: FormData, uploadFolder?: string) {
  // ... upload de l'image originale ...

  // ✅ Génération automatique du thumbnail (Pattern Warning - non-bloquant)
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_SITE_URL}/api/admin/media/thumbnail`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: result.data.mediaId,
          storagePath: result.data.storagePath,
        }),
      }
    );

    // Vérification du status HTTP
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log("[uploadMediaImage] Thumbnail generated:", responseData.thumbPath);
  } catch (thumbnailError) {
    console.warn("[uploadMediaImage] Thumbnail generation failed (non-critical):", thumbnailError);
  }
}
```

### API Route Thumbnail (Sharp)

```typescript
// app/api/admin/media/thumbnail/route.ts
export async function POST(request: NextRequest) {
  // 1. Télécharger l'image originale depuis Supabase Storage
  const { data: originalFile } = await supabase.storage
    .from("medias")
    .download(storagePath);

  // 2. Générer thumbnail 300x300 JPEG 80%
  const thumbnail = await sharp(buffer)
    .resize(300, 300, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();

  // 3. Upload du thumbnail avec suffix "_thumb.jpg"
  const thumbPath = storagePath.replace(/\.(jpg|jpeg|png|webp)$/i, "_thumb.jpg");
  await supabase.storage.from("medias").upload(thumbPath, thumbnail);

  // 4. Mise à jour du record dans la table medias
  await supabase
    .from("medias")
    .update({ thumbnail_path: thumbPath })
    .eq("id", mediaId);
}
```

### Affichage dans MediaCard

```tsx
// components/features/admin/media/MediaCard.tsx (lignes 145-158)
{media.thumbnail_path && (
  <Badge
    variant="outline"
    className="gap-1 border-green-600/50 bg-green-50 text-green-700 hover:bg-green-100"
  >
    <CheckCircle2 className="h-3 w-3" />
    Optimized
  </Badge>
)}
```

---

## 🚦 Flux d'Upload dans SpectaclePhotoManager

Le `SpectaclePhotoManager` propose **2 méthodes** pour ajouter des photos :

### Méthode 1 : Upload Direct (MediaUploadDialog)

```tsx
// Bouton "Upload" → MediaUploadDialog
<Button onClick={() => handleUpload(slot.ordre)}>
  <Upload /> Upload
</Button>

// MediaUploadDialog.tsx (ligne 47)
const performUpload = uploadAction || ((formData: FormData) => uploadMediaImage(formData, uploadFolder));
```

**Résultat** :

- ✅ Appelle `uploadMediaImage()` Server Action
- ✅ **Génère automatiquement le thumbnail** via API route
- ✅ Colonne `thumbnail_path` remplie dans la table `medias`
- ✅ Badge "Optimized" affiché dans MediaCard

### Méthode 2 : Sélection depuis Bibliothèque (MediaLibraryPicker)

```tsx
// Bouton "Bibliothèque" → MediaLibraryPicker
<Button onClick={() => handleSelectFromLibrary(slot.ordre)}>
  <ImagePlus /> Bibliothèque
</Button>

// handleMediaSelected() → addPhotoAction()
const actionResult = await addPhotoAction({
  spectacle_id: spectacleId,
  media_id: result.id,  // ✅ Image existante de la bibliothèque
  ordre: selectedSlot,
  type: "landscape",
});
```

**Résultat** :

- ✅ Ajoute la relation dans `spectacles_medias`
- ❌ **NE génère PAS de thumbnail** (image déjà en bibliothèque)
- ❌ Si l'image n'a pas de `thumbnail_path` → Badge "Optimized" manquant

---

## 🐛 Causes Possibles du Problème

### Cause 1 : Images uploadées AVANT Phase 3 (Thumbnails)

**Scénario** :

```bash
1. Utilisateur uploade 10 images via /admin/media AVANT décembre 2025
2. À cette époque, le système de thumbnails n'existait pas
3. Les colonnes thumbnail_path sont NULL
4. Les images restent sans thumbnail même après Phase 3
```

**Diagnostic** :

```sql
-- Vérifier combien de médias n'ont pas de thumbnail
SELECT COUNT(*) AS medias_sans_thumbnail
FROM medias
WHERE thumbnail_path IS NULL
  AND mime_type IN ('image/jpeg', 'image/png', 'image/webp');
```

**Solution** :

- Créer un script de migration pour générer les thumbnails des images existantes
- OU ajouter un bouton "Régénérer les thumbnails manquants" dans `/admin/media`

### Cause 2 : Sélection depuis MediaLibraryPicker

**Scénario** :

```bash
1. Utilisateur uploade une image via /admin/media (thumbnail généré)
2. Utilisateur supprime la relation dans spectacles_medias
3. Utilisateur re-sélectionne la même image via "Bibliothèque" dans SpectaclePhotoManager
4. ✅ Le thumbnail existe déjà (pas de problème)

OU

1. Utilisateur ajoute une image via "Bibliothèque" qui n'a JAMAIS eu de thumbnail
2. ❌ Badge "Optimized" manquant
```

**Diagnostic** :

```sql
-- Vérifier les médias utilisés dans spectacles_medias sans thumbnail
SELECT 
  m.id,
  m.filename,
  m.thumbnail_path,
  COUNT(sm.id) AS spectacle_usages
FROM medias m
INNER JOIN spectacles_medias sm ON sm.media_id = m.id
WHERE m.thumbnail_path IS NULL
  AND m.mime_type IN ('image/jpeg', 'image/png', 'image/webp')
GROUP BY m.id, m.filename, m.thumbnail_path;
```

### Cause 3 : Échec Silencieux de l'API Thumbnail

**Scénario** :

```bash
1. Utilisateur uploade via MediaUploadDialog
2. uploadMediaImage() réussit
3. Appel à /api/admin/media/thumbnail échoue (Pattern Warning - non-bloquant)
4. L'upload continue mais thumbnail_path reste NULL
```

**Diagnostic** :

```bash
# Vérifier les logs serveur (console.warn)
# Rechercher : "[uploadMediaImage] Thumbnail generation failed"
docker logs supabase-studio | grep "Thumbnail generation failed"

# OU consulter les logs Next.js
pnpm dev  # Observer la console lors d'un upload
```

**Causes possibles d'échec** :

- `NEXT_PUBLIC_SITE_URL` mal configuré
- API route `/api/admin/media/thumbnail` inaccessible
- Problème Sharp (dépendances natives, mémoire)
- Timeout sur l'upload du thumbnail vers Storage

---

## 🧪 Tests de Diagnostic

### Test 1 : Vérifier les Médias sans Thumbnail

```sql
-- Exécuter dans Supabase SQL Editor
SELECT 
  id,
  filename,
  storage_path,
  thumbnail_path,
  created_at,
  mime_type
FROM medias
WHERE thumbnail_path IS NULL
  AND mime_type LIKE 'image/%'
ORDER BY created_at DESC
LIMIT 20;
```

**Résultat attendu** :

- Si **0 lignes** → Tous les médias ont des thumbnails ✅
- Si **N lignes** → Ces médias n'ont pas de thumbnail ❌

### Test 2 : Upload via MediaUploadDialog

**Procédure** :

1. Aller dans `/admin/spectacles`
2. Modifier un spectacle
3. Dans SpectaclePhotoManager, cliquer sur "Upload" (pas "Bibliothèque")
4. Sélectionner une image JPEG/PNG
5. Attendre la fin de l'upload

**Résultat attendu** :

```bash
Console Browser :
✅ "Image uploaded successfully"

Console Serveur :
✅ "[uploadMediaImage] Thumbnail generated: spectacles/XXX_thumb.jpg"

Base de données :
✅ SELECT thumbnail_path FROM medias WHERE id = XXX;
   → "spectacles/XXX_thumb.jpg"

UI (/admin/media) :
✅ Badge vert "Optimized" avec checkmark visible
```

**Si échec** :

```bash
Console Serveur :
❌ "[uploadMediaImage] Thumbnail generation failed (non-critical): HTTP 500"

→ Vérifier les logs de l'API thumbnail route
→ Vérifier que Sharp fonctionne correctement
→ Vérifier NEXT_PUBLIC_SITE_URL = http://localhost:3000
```

### Test 3 : Sélection depuis Bibliothèque

**Procédure** :

1. Vérifier qu'une image avec thumbnail existe dans `/admin/media`
2. Dans SpectaclePhotoManager, cliquer sur "Bibliothèque"
3. Sélectionner cette image
4. Vérifier dans `/admin/media`

**Résultat attendu** :

```bash
✅ Badge "Optimized" reste affiché (thumbnail existe déjà)
✅ Badge "Utilisé sur le site" apparaît (grâce au fix spectacles_medias)
```

### Test 4 : Vérifier Variables d'Environnement

```bash
# .env.local
cat .env.local | grep NEXT_PUBLIC_SITE_URL

# Attendu :
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# lib/env.ts
pnpm exec tsx -e "import { env } from './lib/env'; console.log(env.NEXT_PUBLIC_SITE_URL)"

# Attendu :
http://localhost:3000
```

---

## 🛠️ Solutions Proposées

### Solution 1 : Script de Migration pour Thumbnails Manquants

**Créer** : `scripts/generate-missing-thumbnails.ts`

```typescript
/**
 * Generate thumbnails for all medias without thumbnail_path
 */
import { createClient } from "@/supabase/server";
import { env } from "@/lib/env";

async function generateMissingThumbnails() {
  const supabase = await createClient();

  // 1. Fetch all medias without thumbnail
  const { data: medias, error } = await supabase
    .from("medias")
    .select("id, storage_path")
    .is("thumbnail_path", null)
    .like("mime_type", "image/%");

  if (error) {
    console.error("[Migration] Error fetching medias:", error);
    return;
  }

  console.log(`[Migration] Found ${medias.length} medias without thumbnail`);

  // 2. Generate thumbnails in batches of 5 (avoid overload)
  for (let i = 0; i < medias.length; i += 5) {
    const batch = medias.slice(i, i + 5);

    await Promise.all(
      batch.map(async (media) => {
        try {
          const response = await fetch(
            `${env.NEXT_PUBLIC_SITE_URL}/api/admin/media/thumbnail`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mediaId: media.id,
                storagePath: media.storage_path,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          console.log(`✅ [${media.id}] Thumbnail generated: ${data.thumbPath}`);
        } catch (error) {
          console.error(`❌ [${media.id}] Failed:`, error);
        }
      })
    );

    // Wait 1s between batches
    if (i + 5 < medias.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("[Migration] Migration complete");
}

generateMissingThumbnails();
```

**Usage** :

```bash
pnpm exec tsx scripts/generate-missing-thumbnails.ts
```

### Solution 2 : Bouton Admin "Régénérer Thumbnails"

**Créer** : Server Action dans `lib/actions/media-actions.ts`

```typescript
/**
 * Regenerate thumbnail for existing media
 * @param mediaId - Media ID
 * @returns Success status
 */
export async function regenerateThumbnailAction(
  mediaId: bigint
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const supabase = await createClient();

    // Fetch media info
    const { data: media, error } = await supabase
      .from("medias")
      .select("id, storage_path")
      .eq("id", mediaId)
      .single();

    if (error) {
      return { success: false, error: "Media not found" };
    }

    // Call thumbnail API
    const response = await fetch(
      `${env.NEXT_PUBLIC_SITE_URL}/api/admin/media/thumbnail`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: media.id,
          storagePath: media.storage_path,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Thumbnail generation failed: ${errorText}`,
      };
    }

    revalidatePath("/admin/media");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

**Ajouter dans MediaCard** : Bouton "Régénérer thumbnail"

```tsx
// components/features/admin/media/MediaCard.tsx

// Dans le menu dropdown (après "Télécharger")
{!media.thumbnail_path && (
  <DropdownMenuItem
    onClick={() => handleRegenerateThumbnail(media.id)}
    className="gap-2"
  >
    <RefreshCw className="h-4 w-4" />
    Générer thumbnail
  </DropdownMenuItem>
)}
```

### Solution 3 : Amélioration MediaLibraryPicker

**Option** : Générer automatiquement le thumbnail lors de la sélection si manquant

```tsx
// components/features/admin/media/MediaLibraryPicker.tsx

const handleSelect = async (media: MediaItemDTO) => {
  // ✅ Vérifier si thumbnail manquant
  if (!media.thumbnail_path && media.mime_type.startsWith("image/")) {
    console.log("[MediaLibraryPicker] Generating missing thumbnail for", media.id);
    
    // Appeler l'API thumbnail de manière non-bloquante
    fetch(`${env.NEXT_PUBLIC_SITE_URL}/api/admin/media/thumbnail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mediaId: media.id,
        storagePath: media.storage_path,
      }),
    }).catch((error) => {
      console.warn("[MediaLibraryPicker] Thumbnail generation failed:", error);
    });
  }

  onSelect({
    id: media.id,
    url: getMediaPublicUrl(media.storage_path),
  });
};
```

---

## 📋 Plan d'Action Recommandé

### Phase 1 : Diagnostic (10 min)

1. ✅ Exécuter **Test 1** (SQL) pour vérifier combien de médias n'ont pas de thumbnail
2. ✅ Exécuter **Test 2** (Upload via MediaUploadDialog) pour vérifier que le système fonctionne pour les nouveaux uploads
3. ✅ Exécuter **Test 4** (Env vars) pour vérifier la configuration

### Phase 2 : Migration (si médias existants sans thumbnail)

**Option A** : Script de migration (rapide, 1 exécution)

```bash
pnpm exec tsx scripts/generate-missing-thumbnails.ts
```

**Option B** : Bouton admin (permanent, utilisable à tout moment)

- Implémenter `regenerateThumbnailAction()` Server Action
- Ajouter bouton "Régénérer thumbnail" dans MediaCard

**Recommandation** : **Option A + Option B**

- Script pour migration initiale des ~50-100 médias existants
- Bouton pour régénérations ponctuelles futures

### Phase 3 : Prévention Future

**Option** : Améliorer MediaLibraryPicker pour génération automatique

- Avantage : Transparent pour l'utilisateur
- Inconvénient : Requête API supplémentaire lors de la sélection

**Recommandation** : **NE PAS implémenter pour l'instant**

- Le système actuel fonctionne bien pour les nouveaux uploads
- La migration unique résout le problème des médias existants
- Évite la complexité et les requêtes API inutiles

---

## ✅ Validation Post-Migration

Après exécution du script de migration :

```sql
-- Vérifier qu'il ne reste plus de médias image sans thumbnail
SELECT COUNT(*) 
FROM medias
WHERE thumbnail_path IS NULL
  AND mime_type LIKE 'image/%';
-- Attendu : 0

-- Vérifier que tous les spectacles_medias ont des thumbnails
SELECT 
  m.id,
  m.filename,
  m.thumbnail_path
FROM medias m
INNER JOIN spectacles_medias sm ON sm.media_id = m.id
WHERE m.thumbnail_path IS NULL;
-- Attendu : 0 lignes
```

**UI (/admin/media)** :

- ✅ Tous les médias images affichent le badge vert "Optimized"
- ✅ Les médias utilisés dans spectacles affichent aussi le badge "Utilisé sur le site"

---

## 📖 Documentation Connexe

- [Phase 3 - Thumbnails Implementation](./phase3-thumbnails-implementation.md)
- [Phase 4.3 - Usage Tracking](./phase4.3-usage-tracking.md)
- [Pattern Warning - Non-Blocking Operations](../../instructions/crud-server-actions-pattern.instructions.md)

---

**Date de création** : 5 Février 2026  
**Auteur** : System Agent  
**Status** : 🔍 **DIAGNOSTIC COMPLET - PRÊT POUR MIGRATION**
