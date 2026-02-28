# TASK062 - Upload Pipeline Security Hardening

**Status:** Completed  
**Added:** 2026-02-18  
**Updated:** 2026-02-18

## Original Request

Audit de sécurité de la validation à l'upload avec 3 questions :

1. Le type MIME est-il vérifié côté serveur (pas seulement l'extension) ?
2. La taille maximale est-elle bien 10Mo (rejetée avant écriture disque) ?
3. Le nom de fichier est-il sanitisé (suppression path, caractères spéciaux) ?

Puis follow-up : "les seuls formats acceptés sont JPEG, PNG, WebP, AVIF ?" → extension des formats acceptés.

## Thought Process

**Constat initial** : La validation reposait sur `file.type` (fourni par le browser, client-contrôlé) sans vérification des magic bytes réels. Cela permettait le MIME spoofing. La limite était 5MB alors que le bucket Supabase autorisait 10MB. Le filename était stocké brut en BDD.

**Approche** : Créer un utilitaire `mime-verify.ts` pur (0 dépendance externe) basé sur les magic bytes des 64 premiers octets. Chaque format a un détecteur isolé → composition séquentielle avec ordre sécurisé (PDF testé avant SVG pour éviter faux positifs).

**Format expansion** : L'analyse a révélé une incohérence entre upload (4 types) et URL externe (5 types, sans AVIF). Décision de tout aligner sur 7 types (+ PDF), avec un système de types séparé images / documents.

## Implementation Plan

- [x] Créer `lib/utils/mime-verify.ts` — magic bytes 7 formats, 64 octets
- [x] Mettre à jour `lib/actions/media-actions.ts` — `validateFile` async, `verifyFileMime`, 10MB
- [x] Mettre à jour `lib/dal/media.ts` — `sanitizeFilename()` dans path ET champ BDD
- [x] Mettre à jour `lib/schemas/media.ts` — 3 constantes, 2 nouveaux types, type guard
- [x] Mettre à jour `lib/schemas/index.ts` — exports étendus
- [x] Mettre à jour `lib/utils/validate-image-url.ts` — AVIF ajouté
- [x] Mettre à jour `components/features/admin/media/types.ts` — re-exports étendus
- [x] Mettre à jour `components/features/admin/media/MediaUploadDialog.tsx` — UI 10MB, 7 formats
- [x] Mettre à jour `lib/actions/actions_readme.md` — documentation Validation

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| ---- | ----------- | ------ | ------- | ----- |
| 62.1 | Magic bytes MIME verification | Complete | 2026-02-18 | 7 formats, 64 octets |
| 62.2 | Taille max 10MB | Complete | 2026-02-18 | Vérifié avant lecture bytes |
| 62.3 | sanitizeFilename() | Complete | 2026-02-18 | path traversal + whitelist + 100 chars |
| 62.4 | Formats GIF + SVG + PDF | Complete | 2026-02-18 | Total 7 types MIME |
| 62.5 | Cohérence validate-image-url.ts | Complete | 2026-02-18 | AVIF ajouté |
| 62.6 | Types TS AllowedUploadMimeType | Complete | 2026-02-18 | 3 constantes, type guard |
| 62.7 | UI MediaUploadDialog | Complete | 2026-02-18 | Labels + accept mis à jour |
| 62.8 | Documentation README | Complete | 2026-02-18 | actions_readme.md |

## Progress Log

### 2026-02-18 — Session 1 : Audit Sécurité

**Problèmes identifiés** :

- `file.type` client-contrôlé sans vérification côté serveur → MIME spoofing
- Limite 5MB vs 10MB autorisé par bucket Supabase
- `input.file.name` stocké brut en BDD

**Fichiers créés/modifiés** :

- `lib/utils/mime-verify.ts` — NOUVEAU : `detectMimeFromBytes()`, `verifyFileMime()`, 7 détecteurs individuels
- `lib/actions/media-actions.ts` — `validateFile` rendu async, `verifyFileMime` appelé, MAX_FILE_SIZE = 10MB
- `lib/dal/media.ts` — `sanitizeFilename()` ajouté, utilisé dans `generateStoragePath()` et `createMediaRecord()`
- `lib/schemas/media.ts` — `MAX_UPLOAD_SIZE_BYTES` passé à 10MB

### 2026-02-18 — Session 2 : Format Expansion

**Déclencheur** : Question "les seuls formats acceptés sont JPEG, PNG, WebP, AVIF ?"

**Incohérence découverte** :

- Upload : JPEG/PNG/WebP/AVIF (4 types)
- URL externe : JPEG/PNG/WebP/SVG/GIF (5 types, AVIF absent)

**Décision** (via multi-select utilisateur) : garder existants + ajouter GIF + SVG + PDF

**Modifications** :

- `lib/schemas/media.ts` : split en `ALLOWED_IMAGE_MIME_TYPES` (6) + `ALLOWED_DOCUMENT_MIME_TYPES` (PDF) + `ALLOWED_UPLOAD_MIME_TYPES` (union), type guard `isAllowedUploadMimeType`
- `lib/utils/mime-verify.ts` : ajout GIF/SVG/PDF, 64 octets, type de retour `AllowedUploadMimeType`
- `lib/utils/validate-image-url.ts` : AVIF ajouté
- `lib/schemas/index.ts` : nouveaux exports

**Notes techniques** :

- SVG : 64 octets nécessaires (déclaration XML peut commencer par BOM UTF-8 `EF BB BF`)
- `<?xml` accepté pour SVG — volontairement large (admin-only)
- PDF testé avant SVG pour éviter faux positifs

### 2026-02-18 — Session 3 : UI + Documentation + Commit

- `components/features/admin/media/types.ts` : exports `ALLOWED_UPLOAD_MIME_TYPES`, `ALLOWED_DOCUMENT_MIME_TYPES`, `isAllowedUploadMimeType`, types `AllowedDocumentMimeType` / `AllowedUploadMimeType`
- `components/features/admin/media/MediaUploadDialog.tsx` : utilise `ALLOWED_UPLOAD_MIME_TYPES` + `isAllowedUploadMimeType`, messages "10MB", "7 formats", title "Téléverser un fichier", TODO supprimé
- `lib/actions/actions_readme.md` : section Validation mise à jour (10MB, 7 MIME types, magic bytes, sanitisation)
- TypeScript : **0 erreurs** confirmé `get_errors`
- Commit : `3a64cdb` — 14 files changed
