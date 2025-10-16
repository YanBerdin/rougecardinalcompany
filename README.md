# The Rouge Cardinal Company 🎭

## Vue d'ensemble

**Rouge Cardinal** est un site web vitrine pour une compagnie de théâtre professionnelle. Il s'agit d'un projet **from-scratch** visant à présenter la compagnie, ses productions, et faciliter la gestion de contenu via un back-office sécurisé.

## Architecture Technique

- **Frontend** : Next.js 15.4.5 + Tailwind CSS + TypeScript
- **Backend** : Supabase (PostgreSQL + Auth + Storage + API)
- **Architecture** : App Router avec séparation Server/Client Components
- **Sécurité** : RLS (Row Level Security) sur 100% des tables, validation Zod, Server Actions

## Fonctionnalités Principales

### 1. Présentation Institutionnelle

- Page d'accueil avec hero carousel, statistiques, valeurs
- Page "La Compagnie" avec histoire, équipe, mission
- Partenaires affichés avec logos

### 2. Gestion des Spectacles

- Catalogue de productions (actuelles/archivées)
- Événements avec billetterie externe
- Galerie médias (photos, vidéos)

### 3. Espace Presse

- **Communiqués de presse** : PDFs officiels émis par la compagnie
- **Articles de presse** : Revue de presse (critiques externes)
- Kit média professionnel avec téléchargements

### 4. Communication

- Formulaire de contact avec validation RGPD
- Newsletter avec double opt-in
- Gestion des abonnés et contacts presse

### 5. Back-office

- Authentification admin via Supabase Auth
- CRUD complet pour tous les contenus
- Gestion des médias et documents
- Gestion des utilisateurs et rôles
- Toggle publication/dépublication
- Audit des actions administratives
- Statistiques et analytics

## Patterns Architecturaux

### Data Access Layer (DAL)

- Modules `server-only` dans dal
- Accès base de données centralisé côté serveur
- Validation Zod et types TypeScript stricts

### Composants

- **Server Components** : Par défaut pour les données (SEO, performance)
- **Client Components** : Pour l'interactivité (`'use client'`)
- Pattern Smart/Dumb : Containers (logique) + Views (présentation)

### Sécurité

- RLS activé sur toutes les tables (36/36)
- Politiques granularisées (lecture publique, écriture admin)
- Validation input côté serveur
- Protection XSS/CSRF/IDOR

### Performance & UX

- Suspense + Skeletons pour chargement progressif
- Images optimisées avec Next.js Image
- Accessibilité WCAG 2.5.5 (target size 44px minimum)
- SEO avec meta-tags dynamiques et sitemap

## Base de Données

- **25 tables principales** + **11 tables de liaison**
- Schéma déclaratif dans schemas
- Versioning automatique des contenus
- Triggers et fonctions pour audit et intégrité

## État du Projet

- Architecture mature avec patterns documentés
- Focus sur la sécurité et l'accessibilité
- Intégration email (Resend) et analytics
- Tests et scripts de validation

> [!NOTE]
> L'application suit les meilleures pratiques Next.js 15 avec un emphasis sur la sécurité, la performance et l'expérience utilisateur professionnelle.
> [!NOTE]
> Useful information that users should know, even when skimming content.

-

> [!TIP]
> Helpful advice for doing things better or more easily.

-

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

-

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

-

> [!CAUTION]
> Advises about risks or negative outcomes of certain action.
