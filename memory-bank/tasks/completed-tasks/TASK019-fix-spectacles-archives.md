# [TASK019] - Fix spectacles archivés (approche public=true)

**Status:** Completed  
**Added:** 1er octobre 2025  
**Updated:** 1er octobre 2025  
**Completed:** 1er octobre 2025

## Original Request

Les spectacles archivés ne sont pas affichés quand l'utilisateur clique sur "Voir toutes nos créations". Seulement 5 spectacles sont récupérés au lieu des 16 attendus (5 courants + 11 archives).

## Thought Process

### Analyse du problème

- La base de données contient 11 spectacles archivés
- Le frontend ne récupérait que 5 spectacles via `fetchAllSpectacles()`
- Cause : Les spectacles archivés avaient `public=false`, donc filtrés par la politique RLS

### Solutions envisagées

1. **Modifier la politique RLS** : Ajouter une politique permettant la lecture des archives
   - ❌ Complexité additionnelle
   - ❌ Maintenance plus difficile

2. **Changer le modèle de données** : Marquer les archives `public=true`
   - ✅ Simplicité (pas de changement RLS)
   - ✅ Logique de filtrage côté application
   - ✅ Sémantique claire : `public=true` + `status='archive'`

### Décision

Approche choisie : Modifier les données pour que les spectacles archivés soient `public=true`, et filtrer par `status='archive'` côté application.

## Implementation Plan

1. Modifier la migration seed des spectacles (20250926153000_seed_spectacles.sql)
2. Mettre à jour le Container pour filtrer par status au lieu de date
3. Nettoyer les logs de debug
4. Documenter l'approche dans les READMEs

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Modifier seed spectacles (public=true pour archives) | Complete | 01-10-2025 | 11 spectacles archivés modifiés |
| 1.2 | Simplifier filtrage dans Container (status au lieu de date) | Complete | 01-10-2025 | Plus de calcul de date |
| 1.3 | Supprimer logs de debug | Complete | 01-10-2025 | SpectaclesContainer et View |
| 1.4 | Documenter approche dans READMEs | Complete | 01-10-2025 | schemas + migrations |

## Progress Log

### 1er octobre 2025

- Identifié le problème : RLS filtrait les spectacles avec `public=false`
- Analysé les alternatives (RLS complexe vs données simples)
- Décision : approche simplifiée avec `public=true` + `status='archive'`
- Modifié la migration seed (11 spectacles archivés → `public=true`)
- Simplifié le filtrage dans SpectaclesContainer (status au lieu de calcul de date)
- Supprimé tous les logs de debug pour production
- Mis à jour documentation (supabase/schemas/README.md + migrations/README-migrations.md)
- Testé : 16 spectacles maintenant récupérés (5 courants + 11 archives)
- Validé : toggle "Voir toutes nos créations" fonctionne correctement
- Commit créé avec message détaillé multi-section

## Résultats

- ✅ 16 spectacles récupérés (au lieu de 5)
- ✅ Toggle "Voir toutes nos créations" fonctionnel
- ✅ 11 spectacles archivés maintenant visibles
- ✅ Approche RLS simplifiée (pas de politique additionnelle)
- ✅ Code production-ready (logs supprimés)
- ✅ Documentation mise à jour

## Lessons Learned

- Parfois, changer le modèle de données est plus simple que modifier les politiques de sécurité
- La sémantique `public=true` + `status='archive'` est claire et maintenable
- Toujours nettoyer les logs de debug avant de commiter pour production
