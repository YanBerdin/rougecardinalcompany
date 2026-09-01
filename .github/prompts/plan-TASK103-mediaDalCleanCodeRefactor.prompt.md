# Plan: Audit clean-code + remédiation lib/dal/media.ts

## Contexte
Fichier analysé: lib/dal/media.ts (~989 lignes). Instructions de référence:
.github/instructions/clean-code.instructions.md + .github/skills/clean-code/SKILL.md.
Portée validée par l'utilisateur: audit + plan de remédiation complet,
découpage en dossier lib/dal/media/ + index.ts barrel (pattern déjà existant
dans lib/dal/helpers/), inclure corrections DRY (dalSuccess/dalError,
bytesToHuman, types partagés).

## Violations constatées (clean-code.instructions.md)

1. Max 300 lignes/fichier — VIOLÉ: ~989 lignes (3.3x la limite). Le fichier
   contient lui-même un commentaire `//TODO: Split into smaller files` (ligne 11).
2. Une responsabilité par fichier — VIOLÉ: 6 responsabilités mélangées
   (upload/delete media, Media Tags CRUD, Media Folders CRUD, jonction
   Media Item Tags, listing agrégé complexe, statistiques).
3. Max 30 lignes/fonction — VIOLÉ à plusieurs endroits:
   - listMediaItems(): ~142 lignes (fetch medias + fetch tags + fetch folders
     + fetch usage + 2 Map builders + combine) — fait 6 choses différentes.
   - deleteMedia(): 40 lignes.
   - updateMediaFolder(): signature gonflée par types inline dupliqués (~35 lignes).
   - fetchMediaStats(): ~30 lignes, borderline.
4. DRY (Eliminate duplication) — VIOLÉ:
   - Type littéral `{id: bigint; name; slug; description; color;
     created_at; updated_at}` (media tag) répété tel quel dans 4 signatures
     (listMediaTags, getMediaTagById, createMediaTag, updateMediaTag).
   - Type littéral équivalent pour media folder répété dans 5 signatures.
   - formatStorageSize() réimplémente exactement bytesToHuman() qui existe
     déjà dans lib/dal/helpers/format.ts (déjà exporté via lib/dal/helpers).
   - Construction manuelle de `{ success: false, error: ... }` partout au lieu
     d'utiliser dalError()/dalSuccess() déjà exportés par lib/dal/helpers
     (lib/dal/helpers/error.ts) — précédent déjà établi dans le repo.
5. Magic numbers mineurs: 1024*1024, 1024*1024*1024 répétés dans
   formatStorageSize (à supprimer avec l'adoption de bytesToHuman).

## Points conformes (à ne pas casser)
- Noms intention-revealing partout (sanitizeFilename, generateStoragePath,
  createMediaRecord, getFolderIdFromPath...).
- Pas de `any`, typage strict correct.
- Pas de flag parameters.
- "use server" + "server-only" présents, pas de revalidatePath/email
  (conforme dal-solid-principles.instructions.md).

## Consommateurs de @/lib/dal/media (à ne PAS casser)
- app/(admin)/admin/media/page.tsx (fetchMediaStats)
- lib/actions/media-actions.ts (uploadMedia, deleteMedia, findMediaByHash,
  getMediaPublicUrl, listMediaItems)
- lib/actions/media-folders-actions.ts
- lib/actions/media-tags-actions.ts
- components/features/admin/media/MediaDetailsProvider.tsx (getMediaPublicUrl)

## Découpage proposé (mirroring lib/dal/helpers/ pattern)
lib/dal/media/
  - types.ts — MediaTagRecord, MediaFolderRecord, MediaUploadInput,
    MediaUploadData, MediaRecord, MediaItemExtended (types partagés,
    élimine la duplication de littéraux)
  - upload.ts — helpers privés (sanitizeFilename, generateStoragePath,
    uploadToStorage, getPublicUrl, getFolderIdFromPath, createMediaRecord,
    cleanupStorage) + uploadMedia, deleteMedia, getMediaById,
    findMediaByHash, getMediaPublicUrl (~250 lignes)
  - tags.ts — listMediaTags, getMediaTagById, createMediaTag, updateMediaTag,
    deleteMediaTag (~120 lignes)
  - folders.ts — listMediaFolders, getMediaFolderById, createMediaFolder,
    updateMediaFolder (avec helper buildFolderUpdatePayload pour rester
    <30 lignes), deleteMediaFolder (~130 lignes)
  - item-tags.ts — addMediaItemTags, removeMediaItemTags, getMediaItemTags
    (~70 lignes)
  - list.ts — listMediaItems décomposé en petites fonctions <30 lignes
    (fetchMediaRows, fetchTagsForMediaIds, fetchFoldersForIds, buildTagsMap,
    buildFoldersMap, combineMediaWithRelations) + import statique de
    bulkCheckMediaUsagePublic (au lieu du import() dynamique actuel)
  - stats.ts — fetchMediaStats utilisant bytesToHuman (supprime
    formatStorageSize dupliqué)
  - index.ts — barrel re-export complet, préserve l'import `@/lib/dal/media`
    pour tous les consommateurs listés ci-dessus (zéro changement requis
    côté appelants)

Remplacer partout les `{ success: false, error: ... }` / `{ success: true,
data }` manuels par dalError()/dalSuccess() de lib/dal/helpers.

## Vérification prévue
1. pnpm lint sur lib/dal/media/**
2. pnpm tsc --noEmit (ou next build) pour valider que les 5 fichiers
   consommateurs compilent sans changement d'import
3. Vérifier manuellement les pages admin média (upload, tags, folders,
   stats) après refactor
4. get_errors sur les fichiers modifiés/créés

## Statut
Plan présenté à l'utilisateur, en attente de validation/handoff pour
implémentation (mode Plan — aucune édition de fichier autorisée ici).
