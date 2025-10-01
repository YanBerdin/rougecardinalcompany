# Suivi de Progression

## État Général du Projet

### Progression Globale

- [x] Configuration initiale du projet
- [x] Mise en place de l'architecture de base
- [x] Intégration de Supabase
- [x] Configuration du design system
- [x] Schéma déclaratif consolidé (RLS 36/36 : 25 principales + 11 liaison)
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
- [x] RLS sur 100% des tables (36/36 : 25 principales + 11 liaison)
- [x] Versioning contenu (valeurs, stats, sections présentation)
- [x] Tables ajoutées: `compagnie_values`, `compagnie_stats`, `compagnie_presentation_sections`, `home_hero_slides`
- [~] Gestion des données spectacles (accueil: listes + dates)

## Fonctionnalités en Cours

### Intégrations Front prioritaires

- En cours: Back-office (toggles centralisés, CRUD étendus)
- En attente: Système d'emailing (newsletter, contacts)
- En attente: Agenda/Événements (DAL + containers + UI)
- Option: Modélisation `partners.type` si besoin UI

## Problèmes Résolus (Octobre 2025)

### Fixes majeurs

1. ✅ Spectacles archivés : 11 spectacles maintenant visibles avec `public=true` + `status='archive'`
2. ✅ UI Press releases : alignement des boutons PDF avec flexbox pattern
3. ✅ Production cleanup : suppression des logs de debug
4. ✅ Documentation Docker : volumes, disk space, prune behavior
5. ✅ Documentation Supabase CLI : workflow déclaratif complet

## Problèmes Connus

### Points d'attention restants

1. Délais artificiels (1200-1500ms) dans les containers à retirer avant production
2. Synchronisation des fenêtres de visibilité (hero) avec le cache ISR
3. Cohérence des toggles Back‑office ↔ pages publiques (Agenda/Accueil/Contact)
4. PostgREST cache: penser à redémarrer le stack en cas de mismatch pendant seeds
5. Docker disk usage monitoring à mettre en place

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
- Lighthouse Score: 85 (à améliorer après retrait des délais artificiels)

### Qualité du code

- RLS Coverage: 36/36 tables protégées (100%) - 25 principales + 11 liaison
- Documentation: 3 fichiers techniques majeurs mis à jour (Docker, Supabase CLI, migrations)
- Debug logs: Nettoyés pour production

### Utilisation

- Taux de rebond: À mesurer
- Temps moyen sur site: À mesurer
- Conversions: À mesurer

## Journal des Mises à Jour

### 1er Octobre 2025

- **Spectacles archivés** : Fix majeur avec changement de stratégie - 11 spectacles archivés maintenant `public=true` pour affichage via toggle "Voir toutes nos créations"
- **UI Press releases** : Alignement des boutons "Télécharger PDF" avec pattern flexbox (`flex flex-col` + `flex-1` + `mt-auto`)
- **Production cleanup** : Suppression des logs de debug dans SpectaclesContainer et SpectaclesView
- **Documentation Docker** : Section complète sur inspection volumes (`docker volume ls`, `du -sh`), gestion espace disque, et comportement `docker system prune -a`
- **Documentation Supabase CLI** : Commandes détaillées pour `db reset`, workflow déclaratif, et notes sur les conteneurs
- **Documentation migrations** : Mise à jour conventions et notes sur spectacles archivés (`public=true` approach)
- **Knowledge base** : Revue complète du fichier (4554 lignes) couvrant architecture, schéma DB, RLS, versioning

### 23 Septembre 2025

- Compagnie: migration complète vers DAL server-only pour valeurs et équipe (`lib/dal/compagnie.ts`).
- Compagnie: sections éditoriales branchées sur `public.compagnie_presentation_sections` via `lib/dal/compagnie-presentation.ts` (Zod + mapping quotes).
- Page `app/compagnie/page.tsx`: enveloppée dans `<Suspense>` avec `CompagnieSkeleton`; délai artificiel 1500 ms dans le conteneur pour validation UX (à retirer avant prod).
- Fallback automatique: si la table des sections est vide ou en erreur, retour du contenu local `compagniePresentationFallback` [DEPRECATED FALLBACK] pour éviter une page vide.
- Dépréciation: anciens hooks/données mocks de la Compagnie annotés `[DEPRECATED MOCK]` et non utilisés par le rendu.

### 22 Septembre 2025

- Newsletter: unification derrière une API route `app/api/newsletter/route.ts` (POST validé Zod, upsert `onConflict: 'email'`, metadata `{ consent, source }`)
- Hook partagé: `lib/hooks/useNewsletterSubscribe.ts` utilisé par Home et Contact; gestion unifiée des erreurs/chargement/succès
- DAL: `lib/dal/home-newsletter.ts` pour gating via `configurations_site` (Zod + valeurs par défaut)
- UI: Home/Contact affichent `errorMessage` explicite; Suspense 1500 ms pour la section Home Newsletter pendant validation UX (à retirer avant prod)
- Nettoyage: suppression des bannières `[DEPRECATED MOCK]`; renommage en `useNewsletterSubscription`; factorisation de `contact-hooks` vers le hook partagé

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

1. ✅ Privilégier les Server Components quand possible (pattern appliqué)
2. Maintenir la cohérence du design system (flexbox patterns documentés)
3. Documenter les nouveaux composants et décisions architecturales
4. Optimiser les performances en continu
5. ⚠️ Retirer les délais artificiels avant production (1200-1500ms dans containers)
6. ⚠️ Docker: `prune -a` supprime TOUTES les images inutilisées, pas seulement les anciennes versions

## Dernière Mise à Jour

**Date**: 1er octobre 2025
**Par**: GitHub Copilot
