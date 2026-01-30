# 🔍 Diagnostic: Pourquoi `thumbnail_path` est NULL partout ?

**Date**: 30 janvier 2026  
**Statut**: ✅ RÉSOLU - Système fonctionnel, données de seed à mettre à jour

---

## 📋 Résumé

Les colonnes `thumbnail_path` sont `NULL` car :

1. ✅ **Les 8 médias existants** ont été créés **avant** l'implémentation du système de thumbnails (22 janvier 2026)
2. ✅ **Ces médias sont des entrées de seed** sans fichiers réels dans Supabase Storage
3. ✅ **Le système de thumbnails fonctionne correctement** (tests unitaires passés)

---

## 🔴 Problème initial résolu

### Bug corrigé dans `lib/actions/media-actions.ts`

**Problème** : L'appel à l'API de génération de thumbnails ne vérifiait jamais le statut HTTP.

```typescript
// ❌ AVANT (ligne 164)
await fetch(...);  // Ignore les erreurs HTTP 400/500

// ✅ APRÈS
const response = await fetch(...);
if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`HTTP ${response.status}: ${errorText}`);
}
const responseData = await response.json();
console.log("[uploadMediaImage] Thumbnail generated:", responseData.thumbPath);
```

### Autres corrections appliquées

1. **Conversion du `mediaId`** : `string` → `number` (Zod validation attendait `number`)
2. **Variables d'environnement type-safe** : `process.env.NEXT_PUBLIC_SITE_URL` → `env.NEXT_PUBLIC_SITE_URL`
3. **Vérification du statut HTTP** : Logs détaillés en cas d'erreur

---

## ✅ Validation du système

### Tests passés

```bash
$ pnpm exec tsx scripts/test-thumbnail-generation.ts

🧪 Test 1: Happy Path (successful thumbnail generation)
✅ Thumbnail generated: uploads/test-thumbnail-1769805990882_thumb.jpg
✅ Thumbnail verified: Format jpeg, Dimensions 300x300
✅ thumbnail_path correctly set in database
✅ TEST 1 PASSED

🧪 Test 2: Pattern Warning (non-blocking thumbnail failure)
✅ Pattern Warning validated: thumbnail failed
✅ Original upload still succeeded (non-blocking)
✅ ALL TESTS PASSED
```

### Scripts utilitaires créés

1. **`scripts/check-thumbnails-db.ts`** — Liste tous les médias et leur statut thumbnail
2. **`scripts/regenerate-all-thumbnails.ts`** — Régénère les thumbnails (DATABASE LOCALE uniquement)
3. **`scripts/regenerate-all-thumbnails-remote.ts`** — Régénère les thumbnails (DATABASE REMOTE avec dry-run)
4. **`scripts/check-storage-files.ts`** — Vérifie si les fichiers existent dans Storage

---

## 🎯 Plan d'action

### Pour les nouveaux uploads (production)

✅ **Rien à faire** — Le système fonctionne automatiquement :

1. Utilisateur upload une image via `/admin/media`
2. Server Action appelle DAL → crée l'entrée DB
3. Server Action appelle `/api/admin/media/thumbnail` (POST)
4. API génère thumbnail avec Sharp (300x300, quality 80%)
5. Thumbnail uploadé dans Storage (`uploads/fichier_thumb.jpg`)
6. DB mis à jour avec `thumbnail_path`
7. MediaCard affiche automatiquement la miniature

### Pour les médias existants (seed data)

**Option 1** : Uploader de vrais fichiers via l'interface admin

```bash
# 1. Aller sur http://localhost:3000/admin/media
# 2. Cliquer "Upload Media"
# 3. Sélectionner une image (JPG/PNG/WebP)
# 4. Submit → thumbnail généré automatiquement
```

**Option 2** : Remplacer les seed data

```sql
-- Supprimer les anciennes entrées sans fichiers
DELETE FROM medias WHERE id IN (1,2,3,4,5,6,7,8);

-- Insérer uniquement après upload réel de fichiers
```

**Option 3** : Uploader les fichiers manquants dans Storage puis régénérer

**Base de données LOCALE** :

```bash
# 1. Upload manuel des fichiers dans bucket 'medias'
# 2. Exécuter script de régénération
pnpm exec tsx scripts/regenerate-all-thumbnails.ts
```

**Base de données REMOTE (production)** :

```bash
# 1. Upload manuel des fichiers via l'interface admin
# 2. Dry-run (prévisualisation, aucune modification)
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts

# 3. Application réelle (modifie la production)
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts --apply
```

---

## 📊 État actuel de la base de données

```bash
$ pnpm exec tsx scripts/check-thumbnails-db.ts

📊 Statistics (last 20 media):
   Total: 8
   ✅ With thumbnails: 0
   ❌ Without thumbnails: 8

1. ❌ ID 1 - rouge-cardinal-logo-horizontal.svg (image/svg+xml) ← Non supporté
2. ❌ ID 2 - rouge-cardinal-logo-vertical.png ← Fichier n'existe pas
3. ❌ ID 3 - rouge-cardinal-icon.svg (image/svg+xml) ← Non supporté
4. ❌ ID 4 - spectacle-scene-1.jpg ← Fichier n'existe pas
5. ❌ ID 5 - spectacle-scene-2.jpg ← Fichier n'existe pas
6. ❌ ID 6 - equipe-artistique.jpg ← Fichier n'existe pas
7. ❌ ID 7 - dossier-presse-2025.pdf (application/pdf) ← Non supporté
8. ❌ ID 8 - fiche-technique-spectacle.pdf (application/pdf) ← Non supporté
```

---

## 🔧 Configuration système

### Variables d'environnement requises

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # ✅ Configuré
NEXT_PUBLIC_SUPABASE_URL=...               # ✅ Configuré
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=...  # ✅ Configuré
```

### Formats supportés pour thumbnails

```typescript
const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

// ❌ Non supportés (skip automatique):
// - image/svg+xml (SVG vectoriel)
// - application/pdf (Documents)
// - video/* (Vidéos)
```

---

## 📝 Documentation associée

- [doc/thumbnail-flow.md](./thumbnail-flow.md) — Diagramme Mermaid du flux complet
- [.github/prompts/plan-TASK029-MediaLibrary/phase4.3-implementation-summary.md](../.github/prompts/plan-TASK029-MediaLibrary/phase4.3-implementation-summary.md) — Implémentation Phase 4.3

---

## ✅ Conclusion

Le système de thumbnails est **100% fonctionnel** :

- ✅ Tests unitaires passent (génération + vérification)
- ✅ API endpoint fonctionne (`/api/admin/media/thumbnail`)
- ✅ Server Action appelle correctement l'API
- ✅ Vérification du statut HTTP (correction appliquée)
- ✅ Pattern Warning (non-blocking) implémenté

**Les `thumbnail_path` sont NULL uniquement pour les données de seed** uploadées avant le 22 janvier 2026, et ces fichiers n'existent pas dans Storage.

**Pour tester** : Uploader une nouvelle image via `/admin/media` → thumbnail sera généré automatiquement.
