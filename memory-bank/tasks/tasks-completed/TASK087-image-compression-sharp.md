# \[TASK087] — Compression d'images Sharp côté serveur

**Status:** Completed
**Added:** 2026-03-24
**Updated:** 2026-03-24
**Priorité:** P1 — optimisation pipeline upload media

---

## Contexte

Les images uploadées via la médiathèque sont stockées sur Supabase Storage sans
compression. Des photos de photographes professionnels peuvent atteindre 6000px
et 15 Mo. Cela augmente les coûts Storage et rallentit les chargements publics.

**Objectif** : Injecter une étape de compression Sharp côté serveur dans le
pipeline d'upload, entre la validation et l'appel DAL. Approche serveur
garantit la compression quels que soient les clients.

---

## Implémentation

### Fichiers créés

| Fichier | Description |
| ------- | ----------- |
| `lib/utils/image-compress.ts` | Utilitaire Sharp : `compressImage()`, constantes, types |
| `__tests__/utils/image-compress.test.ts` | 11 tests unitaires Vitest |

### Fichiers modifiés

| Fichier | Modification |
| ------- | ------------ |
| `lib/actions/media-actions.ts` | Injection compression entre validation et appel DAL |
| `lib/dal/media.ts` | `MediaUploadInput.file: File \| Blob` + champ `filename: string` |
| `package.json` | Script `test:unit:image-compress` ajouté |

### Documentation mise à jour

| Fichier | Modification |
| ------- | ------------ |
| `.github/prompts/plan-imageCompression.prompt.md` | Rapport d'implémentation complet |
| `scripts/README.md` | Section `🧪 Tests Unitaires` avec `test:unit:image-compress` |
| `memory-bank/activeContext.md` | TASK087 en focus courant |
| `memory-bank/progress.md` | Entrée TASK087 ajoutée |
| `memory-bank/tasks/_index.md` | TASK087 en tête des Completed |

---

## Comportement

### Formats compressibles

| Format | Action | Paramètres |
| ------ | ------ | ---------- |
| JPEG | Compression | `{ quality: 85, mozjpeg: true }` |
| PNG | Compression | `{ quality: 85, effort: 6 }` |
| WebP | Compression | `{ quality: 85 }` |
| AVIF | Compression | `{ quality: 85 }` |
| GIF | Bypass | `wasCompressed: false` (animations) |
| SVG | Bypass | `wasCompressed: false` (vectoriel) |
| PDF | Bypass | `wasCompressed: false` (document) |

### Constantes

```typescript
export const IMAGE_QUALITY = 85;
export const MAX_IMAGE_DIMENSION = 2400; // px
export const COMPRESSIBLE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
```

### Safety guard

Si la compression produit un fichier plus lourd, l'original est conservé
(`wasCompressed: false`). Utile pour les petits JPEG déjà optimisés.

### Redimensionnement

Si largeur OU hauteur > 2400px : resize proportionnel avec `fit: "inside"`.

### Log

```bash
[Media] Compressed: 5242880 → 874320 (83% reduction)
```

---

## Décisions techniques

### `File | Blob` dans le DAL

Le `Buffer` retourné par Sharp ne peut pas être directement passé comme
`File` (interface browser). Solution : wrap en `Blob` dans la Server Action
et passage d'un champ `filename: string` séparé dans `MediaUploadInput`
(car `Blob` n'a pas de propriété `.name`).

### Fix TypeScript `Buffer<ArrayBufferLike>`

`Buffer` seul n'est pas assignable à `BlobPart` en TypeScript strict.
Fix : `Uint8Array.from(buffer)` dans la Server Action et dans les tests.

### Constantes dans `lib/utils/image-compress.ts`

Usage unique (pas partagé avec `lib/schemas/media.ts`).
Conforme à la décision de Phase 3 du plan initial.

---

## Tests unitaires (11/11)

```bash
pnpm test:unit:image-compress
```

| Test | Statut |
| ---- | ------ |
| `wasCompressed: false` pour GIF | ✅ |
| `wasCompressed: false` pour SVG | ✅ |
| `wasCompressed: false` pour PDF | ✅ |
| Compression JPEG (`wasCompressed: true`) | ✅ |
| Compression PNG (`wasCompressed: true`) | ✅ |
| Compression WebP (`wasCompressed: true`) | ✅ |
| Compression AVIF (`wasCompressed: true`) | ✅ |
| Redimensionnement si dimension > 2400px | ✅ |
| Conservation du MIME type source | ✅ |
| Safety guard (compression > original → garde original) | ✅ |
| Exports des constantes | ✅ |

> **Note CI** : Les tests unitaires ne sont pas intégrés dans les workflows
> GitHub Actions (`e2e.yml`, `deploy.yml`). Disponibles localement uniquement.

---

## Pipeline résultant

```bash
# Avant
Client → FormData → Server Action (validate) → DAL (upload brut) → Storage

# Après
Client → FormData → Server Action (validate → COMPRESS → DAL) → Storage
```

---

## Commit

**Branche** : `feat/image-compression`
**SHA** : `6df9803`
**Message** : `feat(media): add Sharp server-side image compression`

---

## Subtasks

| ID | Description | Statut |
| ---- | ----------- | ------ |
| 1.1 | Créer `lib/utils/image-compress.ts` | ✅ Complete |
| 1.2 | Types dans le même fichier | ✅ Complete |
| 2.1 | Modifier `lib/actions/media-actions.ts` | ✅ Complete |
| 2.2 | Modifier `lib/dal/media.ts` (`File \| Blob` + `filename`) | ✅ Complete |
| 3.1 | Constantes (décision : garder dans `image-compress.ts`) | ✅ Complete |
| 4.1 | 11 tests unitaires Vitest | ✅ Complete (11/11) |
| 4.2 | Tests d'intégration manuels | ⚠️ Non réalisés (recommandés) |
| 4.3 | Vérification cohérence DB | ⚠️ Non réalisés (recommandés) |
| — | Script npm `test:unit:image-compress` | ✅ Complete |
| — | Documentation `plan-imageCompression.prompt.md` | ✅ Complete |
| — | Documentation `scripts/README.md` | ✅ Complete |
| — | Mise à jour memory-bank | ✅ Complete |
