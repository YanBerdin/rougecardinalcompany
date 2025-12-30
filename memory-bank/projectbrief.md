# Project Brief: Rouge Cardinal Company

Nom du projet: Rouge Cardinal Company (site public et backoffice)

But: fournir un site public présentant les spectacles, la compagnie et les ressources presse, avec une interface d'administration pour gérer le contenu et les médias. Le projet vise un déploiement sécurisé avec Supabase (Postgres + RLS) et Next.js (App Router).

Contrainte principale: garantir que la sécurité des données repose sur une stratégie cohérente GRANT + RLS, tests CI et migrations auditables.

## Vue d'Ensemble du Projet

Rouge Cardinal Company est un site web pour une compagnie de théâtre professionnelle, construit avec Next.js 16 et Supabase.

## Objectifs Principaux

1. Présenter la compagnie et ses spectacles
2. Faciliter les demandes de subventions et partenariats
3. Gérer l'actualité de la compagnie
4. Mettre en avant spectacles et expositions (actuels et passés)
5. Gérer un agenda interactif d'événements
6. Permettre une mise à jour autonome via un back-office
7. Gérer la newsletter et les contacts
8. Fournir un espace presse professionnel

## Exigences Techniques

### Stack Technique

- Frontend: Next.js 15.4.5 avec App Router
- Base de données: Supabase
- UI: Tailwind CSS + shadcn/ui
- Authentification: Supabase Auth
- Déploiement: Vercel

### Fonctionnalités Clés

1. Site vitrine responsive
2. Espace presse professionnel
3. Médiathèque avec médias HD
4. Gestion de contenu via back-office
5. Export calendrier des événements
6. Authentification administrateur
7. Administration des spectacles et du contenu de chaque page/section

## Contraintes et Standards

### Performance

- Score Lighthouse > 90
- Temps de chargement initial < 2s
- First Input Delay < 100ms

### Accessibilité

- Conformité WCAG 2.1 niveau AA
- Support des lecteurs d'écran
- Navigation au clavier

### SEO

- Meta tags dynamiques
- Structure sémantique
- Support des réseaux sociaux

## Échéancier et Jalons

Phase 1: Site Vitrine (En cours)

- Homepage et présentation de la compagnie
- Section spectacles et productions
- Espace presse professionnel
- Intégration des partenaires et mécènes

Phase 2: Gestion de Contenu (À venir)

- Back-office sécurisé
- Médiathèque professionnelle
- Gestion des événements
- Gestion du contenu de chaque section
- Gestion de l'affichage des sections "à la une" et "Partenaires"
- Export calendrier (iCal)

Phase 3: Optimisation et Analytics (À venir)

- SEO et meta-tags dynamiques
- Google Analytics / Matomo
- Monitoring des performances
- Documentation technique
