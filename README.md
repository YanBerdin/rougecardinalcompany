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

### Installation

```bash
# cloner et installer
git clone https://github.com/YanBerdin/rougecardinalcompany.git
cd rougecardinalcompany
pnpm install
```

# configurer les variables d'environnement

```bash
cp .env.example .env.local
# éditez .env.local avec vos credentials Supabase
```

> **Note (dev only)**: si vous testez les invitations localement et que votre fournisseur d'email (ex. Resend en test-mode) limite les destinataires, activez la redirection d'email de développement dans `.env.local`.

```bash
EMAIL_DEV_REDIRECT=true
EMAIL_DEV_REDIRECT_TO=your-dev-email@example.com
```

Lorsque `EMAIL_DEV_REDIRECT` est `true`, les emails d'invitation seront envoyés à l'adresse définie par `EMAIL_DEV_REDIRECT_TO` (utile pour tests locaux). Assurez-vous de désactiver cette option en production.

## Créer l'utilisateur admin initial

```bash
pnpm exec tsx scripts/create-admin-user.ts
```

## Démarrer le serveur dev

```bash
pnpm dev
```

L'application sera accessible sur http://localhost:3000

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

## 🚀 Quick Start

### Prérequis

- Node.js 20+
- pnpm 8+
- Compte Supabase (projet remote configuré)

### Installation

```bash
# Cloner et installer
git clone https://github.com/YanBerdin/rougecardinalcompany.git
cd rougecardinalcompany
pnpm install
```

### Configuration des variables d'environnement

```bash
cp .env.example .env.local
# Éditez .env.local avec vos credentials Supabase
```

> **Note (dev only)**: si vous testez les invitations localement et que votre fournisseur d'email (ex. Resend en test-mode) limite les destinataires, activez la redirection d'email de développement dans `.env.local`.

```bash
EMAIL_DEV_REDIRECT=true
EMAIL_DEV_REDIRECT_TO=your-dev-email@example.com
```

Lorsque `EMAIL_DEV_REDIRECT` est `true`, les emails d'invitation seront envoyés à l'adresse définie par `EMAIL_DEV_REDIRECT_TO` (utile pour tests locaux). Assurez-vous de désactiver cette option en production.

### Créer l'utilisateur admin initial

```bash
pnpm exec tsx scripts/create-admin-user.ts
```

### Démarrer le serveur dev

```bash
pnpm dev
```

L'application sera accessible sur http://localhost:3000

**⚠️ IMPORTANT** : Ce projet utilise une **base Supabase remote** (pas de Supabase local).

### Gestion de la base de données

```bash
# Linker le projet remote
pnpm dlx supabase link --project-ref YOUR_PROJECT_ID

# Modifier le schéma déclaratif
code supabase/schemas/02a_policies_tables.sql

# Générer une migration
pnpm dlx supabase db diff --linked -f nom_migration

# Pousser vers remote
pnpm dlx supabase db push
```

### Authentification Admin

Si vous ne pouvez pas accéder aux pages `/admin` :

```bash
# Vérifier/créer l'utilisateur admin
pnpm exec tsx scripts/create-admin-user.ts
```

**Architecture à double couche** :

1. **JWT claims** : `app_metadata.role = 'admin'` (vérifié par middleware)
2. **Profil DB** : `public.profiles.role = 'admin'` (vérifié par RLS)

**Les deux doivent être synchronisés** pour que l'authentification fonctionne.

## 📚 Documentation

- [Guide de développement](./doc/guide-developpement.md) - Setup complet et workflow
- [Troubleshooting Admin Auth](./doc/troubleshooting-admin-auth.md) - Résolution problèmes auth
- [Schémas déclaratifs](./supabase/schemas/README.md) - Structure de la base
- [Progress](`./doc/progress.md`) - État d'avancement du projet
