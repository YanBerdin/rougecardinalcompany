# Plan : Compression des images avant upload Storage

## TL;DR

Ajouter une étape de compression Sharp **côté serveur** dans le pipeline d'upload media, entre la validation et l'appel DAL. Les images raster (JPEG, PNG, WebP, AVIF) seront optimisées en qualité et redimensionnées si elles dépassent une taille max, **avant** d'être stockées sur Supabase Storage. SVG, PDF et GIF sont exclus. Approche : nouvelle fonction utilitaire `lib/utils/image-compress.ts` appelée depuis le Server Action.

---

## Étape actuelle du pipeline (rappel)

```bash
Client → FormData → Server Action (validate) → DAL (upload brut) → Storage
```

## Pipeline cible

```bash
Client → FormData → Server Action (validate → COMPRESS → DAL) → Storage
```

---

## Steps

### Phase 1 — Utilitaire de compression (indépendant)

**1.1** Créer `lib/utils/image-compress.ts`
- Fonction `compressImage(file: File): Promise<CompressedImage>` 
- Type retour : `{ buffer: Buffer; mimeType: string; sizeBytes: number; wasCompressed: boolean }`
- Utilise Sharp (déjà installé `^0.34.5`)
- Logique par format :
  - **JPEG** → `.jpeg({ quality: IMAGE_QUALITY, mozjpeg: true })` 
  - **PNG** → `.png({ quality: IMAGE_QUALITY, effort: 6 })` 
  - **WebP** → `.webp({ quality: IMAGE_QUALITY })`
  - **AVIF** → `.avif({ quality: IMAGE_QUALITY })`
  - **GIF** → skip (animations), retourner `wasCompressed: false`
  - **SVG** → skip (vectoriel), retourner `wasCompressed: false`
  - **PDF** → skip (document), retourner `wasCompressed: false`
- Redimensionnement : si largeur OU hauteur > `MAX_IMAGE_DIMENSION` (ex: 2400px), resize proportionnel avec `fit: "inside"`
- Safety : si la compression produit un fichier PLUS GROS, garder l'original
- Constantes dans le même fichier :
  - `IMAGE_QUALITY = 85`
  - `MAX_IMAGE_DIMENSION = 2400`
  - `COMPRESSIBLE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif"]`

**1.2** Créer les types dans `lib/utils/image-compress.ts` (même fichier, < 300 lignes)

### Phase 2 — Intégration dans le Server Action (**dépend de 1**)

**2.1** Modifier `lib/actions/media-actions.ts` — fonction `uploadMediaImage()`
- Après `validateFile()` (ligne ~89) et avant l'appel DAL `uploadMedia()` (ligne ~154)
- Appeler `compressImage(file)` 
- Si `wasCompressed === true` :
  - Convertir le `Buffer` en `File` (ou `Blob`) pour le DAL
  - Mettre à jour le `file.size` et `file.type` transmis au DAL
- Si `wasCompressed === false` : passer le File original inchangé

**2.2** Modifier `lib/dal/media.ts` — signature `uploadToStorage()`
- Accepter `File | Blob` au lieu de `File` uniquement (pour le Buffer compressé)
- La signature de `MediaUploadInput` devra accepter `file: File | Blob` + un `filename: string` séparé (car Blob n'a pas `.name`)
- Adapter `createMediaRecord()` pour utiliser la taille/mime du fichier compressé

### Phase 3 — Mise à jour du schéma et constantes (**parallel avec Phase 2**)

**3.1** Ajouter les constantes de compression dans `lib/schemas/media.ts`
- `IMAGE_QUALITY`, `MAX_IMAGE_DIMENSION` — exportées pour réutilisation
- OU les garder dans `image-compress.ts` si usage unique (Decision: garder dans image-compress.ts)

### Phase 4 — Vérification

**4.1** Tests unitaires pour `compressImage()`
- Test JPEG : file en entrée > en sortie (taille réduite)
- Test PNG : vérifier compression
- Test GIF/SVG/PDF : vérifier `wasCompressed === false`
- Test dimension > MAX : vérifier resize
- Test safety : si compression augmente la taille, garder l'original

**4.2** Test d'intégration manuel
- Upload une image JPEG de 5MB/4000px → vérifier qu'elle est compressée + redimensionnée
- Upload un SVG → vérifier qu'il passe tel quel
- Upload un PDF → vérifier qu'il passe tel quel
- Vérifier que la détection de doublons fonctionne toujours (hash = original côté client)
- Vérifier que le thumbnail se génère correctement sur l'image compressée

**4.3** Vérifier la cohérence DB
- `size_bytes` reflète la taille compressée
- `mime` reflète le format final
- `file_hash` reste le hash de l'original (détection doublons)

---

## Fichiers concernés

- `lib/utils/image-compress.ts` — **NOUVEAU** : utilitaire de compression Sharp
- `lib/actions/media-actions.ts` — **MODIFIER** : appel compression entre validation et DAL (fonction `uploadMediaImage`, lignes ~89-154)
- `lib/dal/media.ts` — **MODIFIER** : `uploadToStorage()` et `MediaUploadInput` pour accepter `Buffer/Blob` + metadata séparée
- `lib/schemas/media.ts` — **OPTIONNEL** : constantes si partagées

## Fichiers NON modifiés

- `components/features/admin/media/MediaUploadDialog.tsx` — Pas de changement côté client
- `app/api/admin/media/thumbnail/route.ts` — Le thumbnail continue de fonctionner sur l'image (maintenant compressée)
- `lib/utils/file-hash.ts` — Le hash reste sur l'original côté client (correct)
- `lib/utils/mime-verify.ts` — La vérification MIME reste avant compression (correct)

---

## Decisions

- **Pas de conversion de format** : on optimise dans le format source (JPEG→JPEG, PNG→PNG, etc.). Conversion vers WebP serait une optimisation future possible mais complexifie (URL, extensions, MIME mismatch).
- **Hash client-side inchangé** : le hash sert à détecter les doublons source. Deux uploads du même fichier → même hash → réutilisation de la version déjà compressée. Correct sémantiquement.
- **Compression serveur** (pas client) : garantit la compression quels que soient les clients, évite le contournement.
- **Safety guard** : si la compression produit un fichier plus gros (petit JPEG déjà optimisé), on garde l'original.
- **Pas de changement DB schema** : `size_bytes` et `mime` existent déjà et seront simplement remplis avec les valeurs post-compression.

## Further Considerations

1. **Qualité 85 vs 80** : 85 offre un bon compromis qualité/taille pour un site de théâtre (photos de spectacles). Ajustable via constante. Recommandation : 85.
2. **Max dimension 2400px** : suffisant pour un affichage full-width sur un écran 1440p. Les images sources de photographes peuvent faire 6000px+. La réduction à 2400px divise souvent la taille par 4-6x. Alternative : 1920px (HD) ou 3000px. Recommandation : 2400px.
3. **Logging** : ajouter un log `[Media] Compressed: ${originalSize} → ${compressedSize} (${ratio}% reduction)` pour monitoring. Non-bloquant.

---

## ✅ Rapport d'implémentation

**Statut : IMPLÉMENTÉ ET TESTÉ** — Toutes les phases du plan ont été réalisées.

### Fichiers créés / modifiés

| Fichier | Statut | Description |
| ------- | ------ | ----------- |
| `lib/utils/image-compress.ts` | ✅ **CRÉÉ** | Utilitaire Sharp complet (constantes, types, `compressImage()`) |
| `lib/actions/media-actions.ts` | ✅ **MODIFIÉ** | Compression injectée entre validation et appel DAL |
| `lib/dal/media.ts` | ✅ **MODIFIÉ** | `MediaUploadInput.file: File \| Blob` + champ `filename: string` |
| `__tests__/utils/image-compress.test.ts` | ✅ **CRÉÉ** | 11 tests unitaires Vitest — tous passent |
| `package.json` | ✅ **MODIFIÉ** | Script `test:unit:image-compress` ajouté |

### Décisions prises pendant l'implémentation

1. **`File | Blob` dans le DAL** (Phase 2.2) — `Buffer` converti en `Blob` dans la Server Action, `filename` transmis séparément car `Blob` n'a pas `.name`. Solution : champ `filename: string` dans `MediaUploadInput`.
2. **Fix TypeScript `Buffer<ArrayBufferLike>`** — `Buffer` seul n'est pas assignable à `BlobPart` en TypeScript strict. Correction : `Uint8Array.from(buffer)` wrap dans la Server Action ET dans les tests.
3. **Constantes exportées** — `IMAGE_QUALITY`, `MAX_IMAGE_DIMENSION`, `COMPRESSIBLE_MIMES` restent dans `lib/utils/image-compress.ts` (usage unique, pas dans `lib/schemas/media.ts`). Conforme à la décision de Phase 3.
4. **Log de compression** — `console.log('[Media] Compressed: ...')` ajouté dans la Server Action pour monitoring.

### Résultats tests unitaires (11/11)

```bash
pnpm test:unit:image-compress
# → 11/11 tests passent
```

| Test | Statut |
| ---- | ------ |
| Retourne `wasCompressed: false` pour GIF | ✅ |
| Retourne `wasCompressed: false` pour SVG | ✅ |
| Retourne `wasCompressed: false` pour PDF | ✅ |
| Compresse JPEG (wasCompressed: true) | ✅ |
| Compresse PNG (wasCompressed: true) | ✅ |
| Compresse WebP (wasCompressed: true) | ✅ |
| Compresse AVIF (wasCompressed: true) | ✅ |
| Redimensionne si dimension > MAX (2400px) | ✅ |
| Conserve MIME type source (JPEG→JPEG, PNG→PNG) | ✅ |
| Safety guard : garde l'original si compression > original | ✅ |
| Exports des constantes (IMAGE_QUALITY, MAX_IMAGE_DIMENSION, COMPRESSIBLE_MIMES) | ✅ |

### Tests d'intégration recommandés (Phase 4.2)

Ces tests manuels n'ont pas été exécutés dans le cadre du plan d'implémentation :

- Upload JPEG 5MB/4000px → vérifier compression + redimensionnement
- Upload SVG → vérifier passage sans modification
- Upload PDF → vérifier passage sans modification
- Vérifier cohérence `size_bytes` / `mime` en DB post-compression

### Script npm

```bash
pnpm test:unit:image-compress  # Vitest — 11 tests unitaires
```

> **Note CI** : les tests unitaires ne sont pas intégrés dans les workflows GitHub Actions (`.github/workflows/`) — uniquement disponibles en local via le script npm. Les workflows existants (`e2e.yml`, `deploy.yml`) couvrent respectivement les tests E2E et le déploiement.
