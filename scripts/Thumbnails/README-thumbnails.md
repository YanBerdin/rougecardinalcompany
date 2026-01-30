# 📸 Scripts de gestion des Thumbnails

Scripts utilitaires pour gérer la génération et la vérification des miniatures (thumbnails) d'images.

---

## 📋 Scripts disponibles

### 1. `check-thumbnails-db.ts` — Vérification de l'état des thumbnails

**Usage** :

```bash
pnpm exec tsx scripts/check-thumbnails-db.ts
```

**Fonction** : Liste tous les médias et indique lesquels ont des thumbnails.

**Sortie** :

```yaml
📊 Statistics (last 20 media):
   Total: 8
   ✅ With thumbnails: 2
   ❌ Without thumbnails: 6

📋 Recent media (newest first):
1. ✅ ID 12 - photo-test.jpg
   Thumb: uploads/photo-test_thumb.jpg
2. ❌ ID 11 - logo.svg
   Thumb: (null)
```

---

### 2. `check-storage-files.ts` — Vérification de l'existence des fichiers

**Usage** :

```bash
pnpm exec tsx scripts/check-storage-files.ts
```

**Fonction** : Vérifie si les fichiers référencés en base existent réellement dans Supabase Storage.

**Sortie** :

```yaml
✅ photos/spectacle-scene-1.jpg - EXISTS (1.2 MB)
❌ photos/missing-file.jpg - NOT FOUND
```

---

### 3. `regenerate-all-thumbnails.ts` — Régénération LOCAL

**⚠️ Base de données LOCALE uniquement** (protection `validateLocalOnly()`)

**Usage** :

```bash
pnpm exec tsx scripts/regenerate-all-thumbnails.ts
```

**Fonction** :

- Trouve tous les médias sans `thumbnail_path`
- Génère les thumbnails (300x300, quality 80%)
- Upload dans Storage (`_thumb.jpg`)
- Met à jour la base de données

**Protection** :

- ✅ Vérifie que l'URL contient "localhost"
- ✅ Utilise `SUPABASE_LOCAL_*` credentials
- ❌ **Ne peut PAS s'exécuter sur la DB remote**

**Sortie** :

```yaml
📊 Found 8 media without thumbnails

Processing spectacle-scene-1.jpg... ✅ uploads/spectacle-scene-1_thumb.jpg
Processing logo.svg... ⏭️  Skipped (image/svg+xml)

📊 Results:
   ✅ Success: 5
   ⏭️  Skipped: 3
   ❌ Errors: 0
```

---

### 4. `regenerate-all-thumbnails-remote.ts` — Régénération REMOTE

**⚠️ Base de données REMOTE (production)** avec dry-run par défaut

**Usage** :

**Mode dry-run** (prévisualisation, aucune modification) :

```bash
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts
```

**Mode apply** (modifie la production) :

```bash
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts --apply
```

**Fonction** :

- Trouve tous les médias sans `thumbnail_path`
- **Dry-run** : Simule l'opération sans modifier la base
- **Apply** : Génère réellement les thumbnails en production
- Traitement par batch de 10 (rate limiting)

**Protection** :

- ✅ Dry-run par défaut (flag `--apply` requis)
- ✅ Confirmation 3 secondes avant exécution
- ✅ Vérifie que l'URL n'est PAS localhost
- ✅ Utilise `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SECRET_KEY`

**Sortie dry-run** :

```yaml
🌍 REMOTE DATABASE Thumbnail Regeneration
📡 Target: https://xxxxx.supabase.co
🔍 Mode: DRY RUN (no changes will be made)

📊 Found 15 media without thumbnails

Processing photo1.jpg... ✅ [DRY RUN] uploads/photo1_thumb.jpg
Processing photo2.jpg... ✅ [DRY RUN] uploads/photo2_thumb.jpg

📊 Results:
   ✅ Success: 15

💡 This was a dry run. To apply changes, run:
   pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts --apply
```

**Sortie apply** :

```yaml
🌍 REMOTE DATABASE Thumbnail Regeneration
📡 Target: https://xxxxx.supabase.co
⚠️  Mode: APPLY (changes WILL be made to production)
   Proceeding in 3 seconds...

📦 Batch 1/2
Processing photo1.jpg... ✅ uploads/photo1_thumb.jpg
Processing photo2.jpg... ✅ uploads/photo2_thumb.jpg

📊 Results:
   ✅ Success: 15
✅ All thumbnails generated successfully!
```

---

## 🎯 Cas d'usage

### Scénario 1 : Vérifier les thumbnails manquants

```bash
pnpm exec tsx scripts/check-thumbnails-db.ts
```

→ Affiche rapidement quels médias n'ont pas de thumbnails

---

### Scénario 2 : Médias uploadés avant l'implémentation des thumbnails (local)

```bash
# 1. Vérifier l'état
pnpm exec tsx scripts/check-thumbnails-db.ts

# 2. Régénérer (local uniquement)
pnpm exec tsx scripts/regenerate-all-thumbnails.ts
```

→ Régénère tous les thumbnails manquants sur la base locale

---

### Scénario 3 : Backfill thumbnails en production

```bash
# 1. Dry-run (simulation)
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts

# 2. Vérifier les logs (aucune erreur ?)

# 3. Appliquer en production
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts --apply
```

→ Régénère tous les thumbnails manquants sur la base remote (production)

---

### Scénario 4 : Debug d'un fichier manquant

```bash
# Vérifier si le fichier existe dans Storage
pnpm exec tsx scripts/check-storage-files.ts
```

→ Identifie les fichiers référencés en base mais absents de Storage

---

## 📊 Formats supportés

### ✅ Supportés (génération thumbnail)

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/jpg`

### ⏭️ Skippés automatiquement

- `image/svg+xml` (vectoriel, pas besoin de thumbnail)
- `application/pdf` (documents)
- `video/*` (vidéos)

---

## 🔒 Sécurité

### Protection LOCAL vs REMOTE

| Script | DB Cible | Protection | Flag apply |
| -------- | ---------- | ------------ | ------------ |
| `regenerate-all-thumbnails.ts` | **LOCAL** | `validateLocalOnly()` | N/A |
| `regenerate-all-thumbnails-remote.ts` | **REMOTE** | Anti-localhost check | `--apply` requis |

### Variables d'environnement

**Local** (`.env.local`) :

```bash
SUPABASE_LOCAL_URL=http://localhost:54321
SUPABASE_LOCAL_PUBLISHABLE_KEY=...
SUPABASE_LOCAL_SERVICE_KEY=...
```

**Remote** (`.env.local`) :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SECRET_KEY=...
```

---

## 📝 Références

- [doc/thumbnail-flow.md](../doc/thumbnail-flow.md) — Diagramme du flux complet
- [doc/diagnostic-thumbnails-null.md](../doc/diagnostic-thumbnails-null.md) — Diagnostic NULL thumbnails
- [Phase 4.3 Summary](../.github/prompts/plan-TASK029-MediaLibrary/phase4.3-implementation-summary.md) — Implémentation

---

## ⚠️ Avertissements

1. **Ne jamais exécuter `regenerate-all-thumbnails-remote.ts --apply` sans dry-run préalable**
2. **Toujours vérifier les logs avant d'appliquer en production**
3. **Les fichiers doivent exister dans Storage avant régénération**
4. **Formats non supportés (SVG, PDF) sont skippés automatiquement**

---

**Dernière mise à jour** : 30 janvier 2026
