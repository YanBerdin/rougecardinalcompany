# Contexte Actif

## État Actuel du Projet

### Phase en cours

Phase 1 — Vitrine + Schéma déclaratif finalisé. Documentation technique complète (Docker, Supabase, migrations).

### Avancées récentes (Octobre 2025)

- ✅ Fix spectacles archivés : 11 spectacles archivés maintenant `public=true` pour visibilité via toggle "Voir toutes nos créations"
- ✅ UI Press releases : alignement des boutons "Télécharger PDF" avec flexbox (`flex flex-col` + `mt-auto`)
- ✅ Production cleanup : suppression des logs de debug dans SpectaclesContainer et SpectaclesView
- ✅ Documentation Docker complète : inspection volumes, gestion espace disque, comportement `prune`
- ✅ Documentation Supabase CLI : commandes détaillées, db reset, workflow déclaratif
- ✅ Knowledge base revue : architecture complète, schéma DB, RLS, versioning

### Architecture actuelle

- Schéma Supabase consolidé avec RLS sur toutes les tables (36/36 protégées : 25 principales + 11 liaison)
- Versioning de contenu étendu (valeurs, statistiques, sections de présentation)
- Tables principales: `spectacles`, `compagnie_values`, `compagnie_stats`, `compagnie_presentation_sections`, `home_hero_slides`, `articles_presse`, `communiques_presse`
- Pattern Server Components + DAL (lib/dal/*) avec Suspense/Skeletons

## Focus Actuel

### Priorités immédiates

1. ~~Implémenter les hooks/data fetching pour `home_hero_slides`~~ (FAIT)
2. ~~Intégrer `compagnie_stats` dans l'UI~~ (FAIT)
3. ~~Écrire les scripts de seed pour les nouvelles tables~~ (FAIT)
4. Finaliser Back‑office : toggles centralisés, CRUD étendus
5. Intégration système d'emailing (newsletter, contacts)

### Problèmes résolus

- ✅ Spectacles archivés : changement de stratégie (public=true au lieu de RLS complexe)
- ✅ Alignement UI press releases : flexbox pattern appliqué
- ✅ Docker/Supabase : documentation complète des commandes et workflows
- ✅ Seeds initiaux exécutés pour toutes les nouvelles tables

### Points d'attention restants

- Cohérence des états de toggles entre back‑office et pages publiques
- Retirer les délais artificiels (1200-1500ms) des containers avant production
- Monitoring Docker disk usage en croissance
- Synchronisation des dates de visibilité du hero et du cache ISR

## Décisions Récentes

### Octobre 2025 - Architecture & données

- **Spectacles archivés** : Approche simplifiée avec `public=true` + `status='archive'` au lieu de modifier les RLS
- **UI patterns** : Adoption du pattern `flex flex-col` + `flex-1` + `mt-auto` pour alignement cohérent des boutons
- **Documentation** : Priorisation de la documentation opérationnelle (Docker, Supabase CLI, migrations)
- **Production readiness** : Suppression systématique des logs de debug

### Septembre 2025 - Base technique

- RLS 100% coverage (36/36 tables : 25 principales + 11 liaison) confirmé et documenté
- Stratégie de versioning via `content_versions` et triggers appliquée à plusieurs entités clés
- Pattern Server Components + DAL server-only consolidé
- Fallback automatique pour contenu manquant (robustesse)
- `home_hero_slides`: RLS publique (lecture fenêtre) + admin CRUD; versioning futur (option)

### Documentation technique

- Knowledge‑base et epics synchronisés (14.1, 14.6, 14.7)
- README schémas mis à jour (arbre des fichiers, métriques, versioning étendu)
- Documentation Docker : volumes, disk space, prune behavior
- Documentation Supabase CLI : workflow déclaratif complet, db reset
- Documentation migrations : conventions, ordre d'exécution, spectacles archivés

## Prochaines Étapes

### Court terme (1-2 semaines)

1. ✅ ~~Intégrer `home_hero_slides` côté front~~ (FAIT)
2. ✅ ~~Intégrer `compagnie_stats` dans l'UI~~ (FAIT)
3. ✅ ~~Rédiger/Exécuter seeds initiaux~~ (FAIT)
4. Retirer délais artificiels (1200-1500ms) des containers
5. Finaliser validation toggles Back‑office

### Moyen terme (2-4 semaines)

1. Back‑office avancé (toggles centralisés, CRUD étendus)
2. Intégration du système d'emailing (inscription, newsletter, contacts)
3. Tests automatisés (unitaires/intégration) et monitoring
4. Option: versioning pour `home_hero_slides` si nécessaire

## Notes Techniques

### Optimisations prévues

- ✅ Utiliser `@supabase/ssr` pour le fetching côté serveur (FAIT)
- Ajuster les revalidations ISR en fonction des toggles/hero
- Supprimer délais artificiels avant production
- Implémenter filtrage côté requête pour fenêtre de visibilité hero

### Points d'attention

1. Cohérence IDs/renvois (Accueil‑10, Agenda‑08, Newsletter‑05)
2. Garder la parité docs ⇄ schéma
3. Ne pas exposer d'API non protégée hors RLS
4. Docker: attention au comportement de `prune -a` qui supprime TOUTES les images inutilisées

## Dernière Mise à Jour

**Date**: 1er octobre 2025  
**Par**: GitHub Copilot
