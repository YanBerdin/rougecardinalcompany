# `TASK056` - Remplacer les données de seed par des fichiers valides

**Status:** En Attente  
**Added:** 2026-01-30  
**Updated:** 2026-01-30  
**Priority:** Low (qualité des données de démonstration)  
**Category:** Data Management

## Contexte

Lors de la régénération des thumbnails pour les médias existants (TASK029), 4 fichiers de seed data ont échoué lors du téléchargement depuis le Storage Supabase car les fichiers physiques n'existent pas dans le bucket.

### Fichiers concernés (IDs 2-5, seed data du 2026-01-10)

| ID | Filename | Storage Path | MIME Type | Issue |
| ---- | ---------- | -------------- | ----------- | ------- |
| 2 | rouge-cardinal-logo-vertical.png | press-kit/logos/rouge-cardinal-logo-vertical.png | image/png | ❌ Download failed |
| 4 | spectacle-scene-1.jpg | photos/spectacle-scene-1.jpg | image/jpeg | ❌ Download failed |
| 5 | spectacle-scene-2.jpg | photos/spectacle-scene-2.jpg | image/jpeg | ❌ Download failed |
| 6 | equipe-artistique.jpg | photos/equipe-artistique.jpg | image/jpeg | ❌ Download failed |

### Logs d'erreur

```bash
Processing rouge-cardinal-logo-vertical.png... ❌ Download failed: {}
Processing spectacle-scene-1.jpg... ❌ Download failed: {}
Processing spectacle-scene-2.jpg... ❌ Download failed: {}
Processing equipe-artistique.jpg... ❌ Download failed: {}
```

## Problème

Les enregistrements existent dans la table `medias` mais les fichiers correspondants ne sont pas présents dans le Storage bucket `media`. Cela pose plusieurs problèmes :

1. **Thumbnails manquantes** : Impossible de générer des thumbnails pour ces images
2. **Liens brisés** : Si ces médias sont utilisés dans d'autres entités (spectacles, équipe, etc.), les images ne s'affichent pas
3. **Expérience utilisateur** : Les médias apparaissent dans la médiathèque mais ne peuvent pas être visualisés
4. **Incohérence** : Discordance entre les données en base et le Storage physique

## Solutions possibles

### Option 1 : Uploader de vrais fichiers (RECOMMANDÉ)

**Avantages** :

- Données complètes et réalistes pour les démonstrations
- Permet de tester le système de thumbnails
- Utilisable pour des screenshots/documentation

**Actions** :

1. Créer ou trouver 4 images appropriées :
   - Logo vertical Rouge Cardinal (PNG, transparent)
   - 2 photos de scène de spectacle (JPEG, HD)
   - 1 photo d'équipe artistique (JPEG, HD)
2. Uploader via l'interface admin `/admin/media`
3. Mettre à jour les références si nécessaire
4. Régénérer les thumbnails avec `scripts/regenerate-all-thumbnails-remote.ts --apply`

### Option 2 : Supprimer les entrées orphelines

**Avantages** :

- Nettoie la base de données
- Supprime l'incohérence

**Inconvénients** :

- Perte des données de seed
- Possibles références cassées si utilisées ailleurs

**Actions** :

1. Vérifier si ces médias sont référencés dans d'autres tables
2. Supprimer les enregistrements via `/admin/media` ou SQL direct
3. Mettre à jour les seeds si nécessaire

### Option 3 : Utiliser des placeholders

**Avantages** :

- Solution rapide
- Maintient la structure de données

**Inconvénients** :

- Pas de vraies images pour les démos
- Peut induire en erreur lors des tests

**Actions** :

1. Créer 4 images placeholder (par exemple avec Text-to-Image ou images génériques)
2. Uploader avec les noms exacts attendus
3. Régénérer les thumbnails

## Tâches détaillées

### Phase 1 : Analyse d'impact (15 min)

- [ ] Vérifier les références dans `spectacles` (colonnes `image_principale_media_id`, `image_secondaire_media_id`)
- [ ] Vérifier les références dans `membres_equipe` (colonne `photo_media_id`)
- [ ] Vérifier les références dans `home_hero_slides` (colonne `image_media_id`)
- [ ] Documenter les impacts dans ce fichier

### Phase 2 : Préparation des fichiers (30 min)

- [ ] Créer ou récupérer 4 images conformes :
  - `rouge-cardinal-logo-vertical.png` : 800x1200px, PNG, transparent
  - `spectacle-scene-1.jpg` : 1920x1080px, JPEG, qualité 85%
  - `spectacle-scene-2.jpg` : 1920x1080px, JPEG, qualité 85%
  - `equipe-artistique.jpg` : 1920x1080px, JPEG, qualité 85%

### Phase 3 : Upload et mise à jour (20 min)

- [ ] Uploader via `/admin/media` avec les noms exacts
- [ ] Vérifier que les fichiers sont bien dans les dossiers appropriés :
  - `press-kit/logos/` pour le logo
  - `photos/` pour les 3 photos
- [ ] Mettre à jour les `media_id` si nécessaire dans les tables référençantes

### Phase 4 : Régénération des thumbnails (5 min)

- [ ] Exécuter `pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts` (dry-run)
- [ ] Vérifier que les 4 fichiers apparaissent dans la liste
- [ ] Exécuter avec `--apply` pour générer les thumbnails
- [ ] Vérifier dans `/admin/media` que les badges ✅ apparaissent

### Phase 5 : Validation (10 min)

- [ ] Vérifier l'affichage des images dans la médiathèque admin
- [ ] Tester les thumbnails dans `MediaCard`
- [ ] Vérifier que les images s'affichent correctement sur le site public
- [ ] Mettre à jour les seeds pour production si nécessaire

## Scripts utiles

```bash
# Vérifier l'état des médias dans la base
pnpm exec tsx scripts/check-thumbnails-db.ts

# Vérifier les fichiers dans le Storage
pnpm exec tsx scripts/check-storage-files.ts

# Régénérer les thumbnails (dry-run)
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts

# Régénérer les thumbnails (apply)
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts --apply
```

## Références

- Documentation thumbnails : `scripts/README-thumbnails.md`
- Diagnostic original : `doc/diagnostic-thumbnails-null.md`
- Flow de génération : `doc/thumbnail-flow.md`
- Médiathèque admin : `/admin/media`

## Notes

- Cette tâche n'est pas bloquante pour les fonctionnalités
- Les nouveaux uploads fonctionnent correctement avec génération automatique de thumbnails
- La priorité peut être ajustée selon les besoins de démonstration du projet

## Acceptance Criteria

- [ ] Les 4 fichiers existent physiquement dans le Storage Supabase
- [ ] Les 4 entrées dans `medias` ont des `thumbnail_path` non NULL
- [ ] Les thumbnails sont affichées dans l'interface admin
- [ ] Aucune référence cassée dans les autres tables
- [ ] Documentation mise à jour si nécessaire

---

**Estimated Time:** 1.5 heures  
**Dependencies:** TASK029 (Media Library Complete)  
**Related Issues:** Seed data quality, Storage consistency
