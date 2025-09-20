# Suivi de Progression

## État Général du Projet

### Progression Globale

- [x] Configuration initiale du projet
- [x] Mise en place de l'architecture de base
- [x] Intégration de Supabase
- [x] Configuration du design system
- [x] Schéma déclaratif consolidé (RLS 24/24)
- [x] Harmonisation knowledge‑base + epics avec le schéma
- [~] Développement des fonctionnalités principales (intégrations front restantes)
- [ ] Tests et optimisation
- [ ] Déploiement en production

## Fonctionnalités Complétées

### Structure de Base

- [x] Layout principal
- [x] Navigation responsive
- [x] Thème personnalisé
- [x] Configuration des routes

### Pages et Composants

- [x] Page d'accueil
- [x] Section Hero (DAL + Server Components + Suspense)
- [x] Section À propos (stats via DAL)
- [x] Footer
- [x] Page Agenda
- [x] Espace Presse
- [ ] Médiathèque professionnelle

### Intégration Backend

- [x] Configuration Supabase
- [x] Authentification de base
- [x] RLS sur 100% des tables (24/24)
- [x] Versioning contenu (valeurs, stats, sections présentation)
- [x] Tables ajoutées: `compagnie_values`, `compagnie_stats`, `compagnie_presentation_sections`, `home_hero_slides`
- [~] Gestion des données spectacles (accueil: listes + dates)

## Fonctionnalités en Cours

### Intégrations Front prioritaires

- En cours: Agenda/Événements (DAL + containers + UI)
- À faire: Stratégie de seeds cloud (sécurisée) et synchronisation
- Option: Modélisation `partners.type` si besoin UI

## Problèmes Connus

### Risques / Points ouverts

1. Synchronisation des fenêtres de visibilité (hero) avec le cache ISR
2. Cohérence des toggles Back‑office ↔ pages publiques (Agenda/Accueil/Contact)
3. Données de démo à prévoir pour prévisualisation
4. PostgREST cache: penser à redémarrer le stack en cas de mismatch pendant seeds

## Tests

### Tests Unitaires

- [ ] Composants UI
- [ ] Utilitaires
- [ ] Hooks personnalisés

### Tests d'Intégration

- [ ] Flux de navigation
- [ ] Authentification

### Tests E2E

- [ ] Parcours utilisateur complet
- [ ] Formulaires

## Déploiement

### Environnement de Développement

- [x] Configuration locale
- [x] Variables d'environnement
- [x] Hot reload

### Environnement de Production

- [ ] Configuration Vercel
- [ ] SSL/HTTPS
- [ ] Monitoring

## Prochaines Étapes

### Court Terme

1. Implémenter Agenda/Événements (DAL + containers + Suspense)
2. Définir la stratégie seeds en environnement cloud (idempotent + safe)
3. Valider les toggles Back‑office (Agenda/Accueil/Contact)
4. Affiner mapping partenaires (type/tiers) si requis par le design

### Moyen Terme

1. Back‑office avancé (CRUD et toggles centralisés)
2. Option: versioning pour `home_hero_slides`
3. Tests automatisés et analytics

## Métriques

### Performance

- First Contentful Paint: 1.2s (local)
- Time to Interactive: 2.5s (local)
- Lighthouse Score: 85 (à améliorer)

### Utilisation

- Taux de rebond: À mesurer
- Temps moyen sur site: À mesurer
- Conversions: À mesurer

## Journal des Mises à Jour

### 20 Septembre 2025

- Migration frontend: Data Access Layer (lib/dal/*) côté serveur + Server Components
- Accueil: Hero, News, À propos (stats), Spectacles (avec dates), Partenaires branchés sur Supabase
- UX: Sections d’accueil enveloppées dans React Suspense avec skeletons (délais artificiels temporaires pour visualisation)
- Dépréciation: anciens hooks mocks conservés en commentaires avec en-têtes [DEPRECATED MOCK]
- Documentation: début de mise à jour knowledge‑base + memory‑bank (patterns, tech context, tasks)

### 20 Septembre 2025 — Ajouts récents

- Base de données (schéma déclaratif): ajout de `home_about_content` (bloc « À propos » de la Home) avec RLS lecture publique et gestion admin, index `(active, position)`, et triggers globaux `updated_at` + `audit`. Ajout de `image_media_id` (prioritaire sur `image_url`).
- DAL `fetchHomeAboutContent()`: priorisation de l’image côté média interne — lecture de `image_media_id` sur `compagnie_presentation_sections`, récupération `medias.storage_path` et génération d’URL publique via Supabase Storage; fallbacks conservés (`image_url`, puis image par défaut).
- Documentation: mise à jour `supabase/schemas/README.md` et knowledge‑base avec la nouvelle table et le flux image prioritaire.

### 17 Septembre 2025

- Harmonisation epics/user‑stories (14.1/14.6/14.7) incluant toggles Newsletter/Partenaires/À la Une
- Mise à jour `supabase/schemas/README.md` (arbre, versioning étendu, métriques RLS 24/24)
- Ajout des tables et RLS: `compagnie_values`, `compagnie_stats`, `compagnie_presentation_sections`, `home_hero_slides`

### 20 Août 2025

- Ajout de la section Hero
- Optimisation des images
- Correction du menu mobile

### 19 Août 2025

- Configuration initiale
- Mise en place du design system
- Intégration Supabase

## Notes Importantes

1. Privilégier les Server Components quand possible
2. Maintenir la cohérence du design system
3. Documenter les nouveaux composants
4. Optimiser les performances en continu

## Dernière Mise à Jour

**Date**: 20 septembre 2025
**Par**: GitHub Copilot
