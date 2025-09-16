# Contexte Actif

## État Actuel du Projet

### Phase en cours

Phase 1 — Vitrine + Schéma déclaratif finalisé. Documentation (knowledge‑base, epics) harmonisée avec le schéma.

### Avancées récentes

- Schéma Supabase consolidé avec RLS sur toutes les tables (24/24)
- Versioning de contenu étendu (valeurs, statistiques, sections de présentation)
- Nouvelles tables: `compagnie_values`, `compagnie_stats`, `compagnie_presentation_sections`, `home_hero_slides`
- Harmonisation des user‑stories/epics (toggles Newsletter/Partenaires/À la Une) et mise à jour du README des schémas

### En cours / à intégrer côté front

- Récupération et affichage des `home_hero_slides` (fenêtre de visibilité)
- Utilisation de `compagnie_stats` dans l’UI
- Seed initial des données (valeurs, stats, sections présentation, hero slides)

## Focus Actuel

### Priorités immédiates

1. Implémenter les hooks/data fetching pour `home_hero_slides`
2. Intégrer `compagnie_stats` dans les composants de la page Compagnie/Accueil
3. Écrire les scripts de seed (SQL/TS) pour les nouvelles tables
4. Vérifier l’UX Back‑office autour des toggles (Agenda, Accueil, Contact)

### Problèmes / risques

- Synchronisation des dates de visibilité du hero et du cache ISR
- Cohérence des états de toggles entre back‑office et pages publiques
- Données initiales insuffisantes pour prévisualiser toutes les sections

## Décisions Récentes

### Architecture & données

- RLS 100% coverage (24/24) confirmé et documenté
- Stratégie de versioning via `content_versions` et triggers appliquée à plusieurs entités clés
- `home_hero_slides`: RLS publique (lecture fenêtre) + admin CRUD; versioning futur (option)

### Documentation

- Knowledge‑base et epics synchronisés (14.1, 14.6, 14.7)
- README schémas mis à jour (arbre des fichiers, métriques, versioning étendu)

## Prochaines Étapes

### Court terme (1 semaines)

1. Intégrer `home_hero_slides` côté front
2. Intégrer `compagnie_stats` dans l’UI
3. Rédiger/Exécuter seeds initiaux

### Moyen terme (2 semaines)

1. Back‑office avancé (toggles centralisés, CRUD étendus)
2. Intégration du systeme d'emailing (inscription, newsletter, contacts)
3. Option: versioning pour `home_hero_slides`
4. Tests automatisés (unitaires/intégration) et monitoring

## Notes Techniques

### Optimisations prévues

- Utiliser `@supabase/ssr` pour le fetching côté serveur
- Appliquer filtrage de fenêtre de visibilité côté requête pour le hero
- Ajuster les revalidations ISR en fonction des toggles/hero

### Points d’attention

1. Cohérence IDs/renvois (Accueil‑10, Agenda‑08, Newsletter‑05)
2. Garder la parité docs ⇄ schéma
3. Ne pas exposer d’API non protégée hors RLS

## Dernière Mise à Jour

**Date**: 17 septembre 2025  
**Par**: GitHub Copilot
