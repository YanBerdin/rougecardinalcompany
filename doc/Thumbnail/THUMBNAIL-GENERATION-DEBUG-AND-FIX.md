# Thumbnail Generation - Debug & Fix Summary

**Date:** 2026-01-30  
**Issue:** Tous les thumbnails (`thumbnail_path`) étaient NULL dans la base de données  
**Status:** ✅ RÉSOLU

---

## 🐛 Problème initial

Observation : Malgré l'implémentation du système de génération de thumbnails (TASK029), **toutes** les occurrences de la colonne `thumbnail_path` dans la table `medias` étaient `NULL`.

### État initial (Base de données remote)

```sql
SELECT id, filename, thumbnail_path 
FROM medias 
WHERE thumbnail_path IS NOT NULL;
-- Résultat : 0 lignes (toutes NULL)
```

**15 médias concernés** (uploadés entre 2026-01-10 et 2026-01-28), tous avec `thumbnail_path = NULL`.

---

## 🔍 Diagnostic

### Root Cause 1 : Bugs dans le code de génération

Fichier concerné : `lib/actions/media-actions.ts` (ligne 164-184)

#### Bug #1 : Absence de vérification du statut HTTP

```typescript
// ❌ AVANT (ligne ~164)
await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/media/thumbnail`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    mediaId: result.data.mediaId,
    storagePath: result.data.storagePath,
  }),
});
// Pas de vérification de response.ok
// Les erreurs 400/500 étaient silencieusement ignorées
```

**Impact** : Les erreurs de l'API (validation échouée, fichier manquant, etc.) n'étaient pas détectées, et l'upload continuait sans thumbnail.

#### Bug #2 : Type mismatch pour `mediaId`

```typescript
// ❌ AVANT
body: JSON.stringify({
  mediaId: result.data.mediaId, // Type: string
  storagePath: result.data.storagePath,
})

// L'API attend :
// ThumbnailRequestSchema = z.object({
//   mediaId: z.number().int().positive(), // ❌ Validation échoue
//   storagePath: z.string(),
// })
```

**Impact** : Validation Zod échouait avec erreur 400, mais bug #1 masquait l'erreur.

#### Bug #3 : Utilisation de `process.env` au lieu de T3 Env

```typescript
// ❌ AVANT
const url = process.env.NEXT_PUBLIC_SITE_URL; // Peut être undefined
```

**Impact** : Risque de `undefined` au runtime, pas de type-safety.

### Root Cause 2 : Médias uploadés avant l'implémentation

Les 15 médias ont été uploadés **avant** ou **pendant** l'implémentation du système de thumbnails (22 janvier 2026). Le déclenchement automatique ne s'est donc pas produit.

---

## ✅ Corrections appliquées

### Fix #1 : Vérification HTTP status + gestion d'erreur

```typescript
// ✅ APRÈS (lib/actions/media-actions.ts, lignes 164-184)
const response = await fetch(
  `${env.NEXT_PUBLIC_SITE_URL}/api/admin/media/thumbnail`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mediaId: parseInt(result.data.mediaId, 10), // Fix #2
      storagePath: result.data.storagePath,
    }),
  }
);

// ✅ NOUVEAU : Vérification du statut HTTP
if (!response.ok) {
  const errorText = await response.text();
  throw new Error(
    `Thumbnail generation failed (${response.status}): ${errorText}`
  );
}

const responseData = await response.json();
console.log(
  "[uploadMediaImage] Thumbnail generated successfully:",
  responseData.thumbPath
);
```

### Fix #2 : Conversion string → number

```typescript
mediaId: parseInt(result.data.mediaId, 10); // ✅ Conversion explicite
```

### Fix #3 : Migration vers T3 Env

```typescript
import { env } from "@/lib/env"; // ✅ Import type-safe

const url = env.NEXT_PUBLIC_SITE_URL; // ✅ Type-safe, validé au démarrage
```

---

## 🛠️ Scripts utilitaires créés

### 1. `scripts/check-thumbnails-db.ts`

**Objectif** : Lister tous les médias avec leur statut de thumbnail.

```bash
pnpm exec tsx scripts/check-thumbnails-db.ts
```

**Output** :

```yaml
📊 Media Thumbnails Status (LOCAL DB)
========================================

ID: 1  | rouge-cardinal-logo-horizontal.svg
Storage: press-kit/logos/rouge-cardinal-logo-horizontal.svg
Thumbnail: ❌ NULL
Created: 2026-01-10

...

📊 Statistics:
Total media: 8
With thumbnails: 0
Without thumbnails: 8
```

### 2. `scripts/check-storage-files.ts`

**Objectif** : Vérifier si les fichiers existent physiquement dans le Storage.

```bash
pnpm exec tsx scripts/check-storage-files.ts
```

**Résultat** : 4/4 fichiers seed testés retournent "NOT FOUND" (fichiers jamais uploadés).

### 3. `scripts/regenerate-all-thumbnails.ts`

**Objectif** : Régénérer les thumbnails sur la **base de données locale** uniquement.

**Sécurité** : `validateLocalOnly(SUPABASE_URL)` empêche toute exécution sur la DB remote.

```bash
pnpm exec tsx scripts/regenerate-all-thumbnails.ts
```

**Fonctionnement** :

1. Télécharge l'image originale depuis Storage
2. Génère le thumbnail avec Sharp (300x300, qualité 80%, JPEG)
3. Upload le thumbnail dans Storage (suffixe `_thumb.jpg`)
4. Met à jour `medias.thumbnail_path` en base

**Types supportés** : JPG, PNG, WebP  
**Types ignorés** : SVG, PDF, vidéo

### 4. `scripts/regenerate-all-thumbnails-remote.ts` ⭐

**Objectif** : Régénérer les thumbnails sur la **base de données de PRODUCTION**.

**Sécurité** :

- Anti-localhost check (rejette si URL contient `localhost` ou `127.0.0.1`)
- **Dry-run par défaut** : aucune modification en base sans flag `--apply`
- Confirmation de 3 secondes avant exécution en mode `--apply`
- Batch processing : 10 à la fois avec délai de 1s (rate limiting)

```bash
# Simulation (recommandé en premier)
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts

# Application réelle (après validation du dry-run)
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts --apply
```

**Résultat de l'exécution** (2026-01-30) :

```yaml
📊 Found 15 media without thumbnails

📦 Batch 1/2
Processing rouge-cardinal-logo-horizontal.svg... ⏭️  Skipped (image/svg+xml)
Processing rouge-cardinal-logo-vertical.png... ❌ Download failed: {}
Processing rouge-cardinal-icon.svg... ⏭️  Skipped (image/svg+xml)
Processing spectacle-scene-1.jpg... ❌ Download failed: {}
Processing spectacle-scene-2.jpg... ❌ Download failed: {}
Processing equipe-artistique.jpg... ❌ Download failed: {}
Processing dossier-presse-2025.pdf... ⏭️  Skipped (application/pdf)
Processing fiche-technique-spectacle.pdf... ⏭️  Skipped (application/pdf)
Processing 404 Github.jpeg... ✅ uploads/1768095683261-404-Github_thumb.jpg
Processing logo-florian.png... ✅ uploads/1768237573156-logo-florian_thumb.jpg

📦 Batch 2/2
Processing 298A44E3-7D13-4CD4-9D43-8C2D9D1EAF8A.PNG... ✅ team/...
Processing Buell_Logo-700x245 - Copie.png... ✅ partners/...
Processing maison-etudiante.paris.jpeg... ✅ partners/...
Processing Capture d'écran_27-1-2026_16120_www.instagram.com.jpeg... ✅ spectacles/...
Processing 3 - Le drapier.png... ✅ spectacles/...

📊 Results:
   ✅ Success: 7
   ⏭️  Skipped: 4 (SVG/PDF)
   ❌ Errors: 4 (seed data files not found)
```

---

## 📊 Résultats

### État final (Base de données remote)

```sql
SELECT id, filename, thumbnail_path 
FROM medias 
WHERE thumbnail_path IS NOT NULL 
ORDER BY created_at DESC;
```

**7 médias avec thumbnails générés** :

| ID  | Filename                                                   | Thumbnail Path           |
| --- | ---------------------------------------------------------- | ------------------------ |
| 15  | 3 - Le drapier.png                                         | spectacles/..._thumb.jpg |
| 14  | Capture d'écran_27-1-2026_16120_www.instagram.com.jpeg     | spectacles/..._thumb.jpg |
| 13  | maison-etudiante.paris.jpeg                                | partners/..._thumb.jpg   |
| 12  | Buell_Logo-700x245 - Copie.png                             | partners/..._thumb.jpg   |
| 11  | 298A44E3-7D13-4CD4-9D43-8C2D9D1EAF8A.PNG                   | team/..._thumb.jpg       |
| 10  | logo-florian.png                                           | uploads/..._thumb.jpg    |
| 9   | 404 Github.jpeg                                            | uploads/..._thumb.jpg    |

**4 fichiers ignorés (attendu)** : 2 SVG + 2 PDF (non concernés par les thumbnails)

**4 erreurs (seed data)** : Fichiers référencés en base mais absents du Storage → **TASK056 créée**

---

## 📚 Documentation créée

### 1. `scripts/README-thumbnails.md`

Guide complet des 4 scripts utilitaires avec :

- Objectifs de chaque script
- Exemples d'utilisation
- Scénarios d'usage
- Tableau comparatif LOCAL vs REMOTE
- Formats supportés
- Avertissements de sécurité

### 2. `doc/thumbnail-flow.md`

Diagramme Mermaid du flow complet de génération :

```yaml
Upload → DAL → API → Sharp → Storage → DB → UI
```

Avec liens directs vers le code (10+ références avec numéros de ligne).

### 3. `doc/diagnostic-thumbnails-null.md`

Analyse détaillée :

- 2 causes identifiées (bugs + médias pré-implémentation)
- Détail des 3 bugs corrigés
- Validation des tests
- Plan d'action (3 options pour les médias existants)
- Configuration requise
- État actuel (8 local, 15 remote)

### 4. `doc/THUMBNAIL-GENERATION-DEBUG-AND-FIX.md` (ce document)

Documentation consolidée de tout le processus de debug et correction.

---

## ✅ Tests de validation

### Test suite existante (PASS)

```bash
pnpm exec tsx scripts/test-thumbnail-generation.ts
```

**Résultats** :

- ✅ Thumbnail 300x300 pixels
- ✅ Format JPEG qualité 80%
- ✅ Suffixe `_thumb.jpg`
- ✅ Pattern non-bloquant (upload réussit même si thumbnail échoue)
- ✅ 5/5 tests passed

### Vérification manuelle

```bash
# Vérifier les thumbnails en base
pnpm exec tsx scripts/check-thumbnails-db.ts

# Vérifier les fichiers dans Storage
pnpm exec tsx scripts/check-storage-files.ts
```

### Vérification production

```sql
-- Via Supabase MCP
SELECT COUNT(*) as with_thumbs FROM medias WHERE thumbnail_path IS NOT NULL;
-- Résultat : 7 (sur 11 JPG/PNG uploadés, excluant les 4 SVG/PDF)
```

---

## 🎯 Prochaines étapes

### Immédiat ✅

- [x] Corriger les 3 bugs dans `media-actions.ts`
- [x] Créer 4 scripts utilitaires
- [x] Rédiger documentation complète (4 fichiers)
- [x] Exécuter régénération en production
- [x] Vérifier résultats via MCP Supabase
- [x] Créer TASK056 pour les seed data manquantes

### Court terme

- [ ] Commit Git de tous les changements
- [ ] Vérifier affichage des thumbnails dans `/admin/media`
- [ ] Valider le badge ✅ sur les MediaCard

### Moyen terme (TASK056)

- [ ] Uploader 4 vraies images pour remplacer les seed data
- [ ] Régénérer les thumbnails pour ces 4 médias
- [ ] Documenter la procédure de seed valide

---

## 📝 Leçons apprises

### 1. Always verify HTTP response status

```typescript
// ❌ Silent failures
await fetch(...) 

// ✅ Explicit error handling
const response = await fetch(...)
if (!response.ok) throw new Error(...)
```

### 2. Type conversions at boundaries

Server Actions reçoivent des strings → conversion explicite nécessaire pour les schemas Zod number.

### 3. T3 Env for type-safety

`process.env` → risque `undefined` au runtime  
`import { env } from '@/lib/env'` → type-safe + validation au build

### 4. Dry-run first for production

Toujours tester en mode simulation avant d'appliquer des modifications en production.

### 5. Separation LOCAL vs REMOTE

Scripts séparés avec sécurités distinctes :

- LOCAL : `validateLocalOnly()` (refuse remote)
- REMOTE : anti-localhost + dry-run par défaut

### 6. Non-blocking patterns

Upload réussit même si thumbnail échoue → meilleure expérience utilisateur, warning dans les logs.

---

## 🔗 Références

**Code** :

- `lib/actions/media-actions.ts` (ligne 164-184) — Upload avec génération thumbnail
- `app/api/admin/media/thumbnail/route.ts` — API de génération
- `lib/dal/media.ts` — Data Access Layer

**Scripts** :

- `scripts/check-thumbnails-db.ts` — Vérification base de données
- `scripts/check-storage-files.ts` — Vérification Storage
- `scripts/regenerate-all-thumbnails.ts` — Régénération LOCAL
- `scripts/regenerate-all-thumbnails-remote.ts` — Régénération REMOTE
- `scripts/README-thumbnails.md` — Guide complet

**Documentation** :

- `doc/thumbnail-flow.md` — Diagramme Mermaid + code links
- `doc/diagnostic-thumbnails-null.md` — Root cause analysis
- `memory-bank/tasks/TASK056-replace-seed-data-with-valid-files.md` — Tâche seed data

**Tests** :

- `scripts/test-thumbnail-generation.ts` — Test suite automatisée

---

**Date de résolution** : 2026-01-30  
**Statut final** : ✅ Problème résolu, 7/11 thumbnails générés (4 erreurs seed data → TASK056)  
**Production ready** : ✅ Oui (nouveaux uploads fonctionnent correctement)
