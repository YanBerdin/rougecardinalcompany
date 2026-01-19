![Rouge Cardinal](public/logo-florian.png)

# Rouge Cardinal Company — Site web

> Plateforme web officielle de la compagnie de théâtre Rouge Cardinal : vitrine publique, médiathèque, espace presse et back‑office d'administration.

## Table des matières

- [Aperçu](#aper%C3%A7u)
- [Fonctionnalités principales](#fonctionnalit%C3%A9s-principales)
- [Architecture & conventions](#architecture--conventions)
- [Démarrage rapide](#d%C3%A9marrage-rapide)
- [Commandes utiles](#commandes-utiles)
- [Déploiement et migrations](#d%C3%A9ploiement-et-migrations)
- [Documentation & ressources](#documentation--ressources)

## Aperçu

Ce dépôt contient le site web de la compagnie Rouge Cardinal construit avec Next.js (app router) et Supabase. Le projet privilégie une approche "server‑first" :

- pages et layouts dans `app/`
- composants UI réutilisables dans `components/`
- accès base de données centralisé dans `lib/dal/` (DAL, server‑only)
- schémas déclaratifs et migrations Supabase sous `supabase/`

## Fonctionnalités principales

- Site public : pages spectacles, presse, partenaires, agenda
- Back‑office : CRUD pour contenus (Server Actions + revalidatePath)
- Médiathèque avancée (tags, dossiers, thumbnails)
- RGPD : automatisation de rétention des données (Edge Function)
- Monitoring & Sentry pour la supervision des erreurs

## Architecture & conventions

- Next.js 16 + React 19 (App Router)
- TypeScript strict, Zod pour validation runtime
- `lib/dal/*` : pattern DAL SOLID (retourne `DALResult<T>`, `"use server"`, `import "server-only"`)
- Auth Supabase optimisée : utiliser `getClaims()` pour checks rapides
- Cookies Supabase : pattern `getAll` / `setAll` via `@supabase/ssr`
- Clean Code : fonctions courtes, fichiers < 300 lignes, pas de commentaires inutiles

> [!note]
> Pour les règles détaillées (migrations, RLS, Server Actions, patterns DAL), consultez le dossier `doc/` et les fichiers sous `.github/instructions/`.

## Démarrage rapide

Prérequis : Node.js 20+, pnpm, Supabase CLI (pour migrations locales)

1. installer les dépendances

```bash
pnpm install
```

2. démarrer l'environnement de développement

```bash
pnpm dev
# ou (si vous utilisez turbopack) : pnpm dev
```

3. valider les variables d'environnement (T3 Env)

```bash
pnpm exec tsx scripts/test-env-validation.ts
```

## Commandes utiles

- Linter : `pnpm lint`
- Tests unitaires / scripts : `pnpm test` ou `pnpm exec tsx scripts/<script>.ts`
- Build : `pnpm build`
- Start production (local) : `pnpm start`

## Déploiement et migrations

- Déploiement recommandé : Vercel (frontend) + Supabase (DB + Storage + Edge Functions)
- Migrations/schéma déclaratif : modifier `supabase/schemas/` puis générer migration avec :

```bash
pnpm dlx supabase db diff -f <migration_name>
pnpm dlx supabase db push
```

- Pour déployer les Edge Functions Supabase :

```bash
pnpm dlx supabase functions deploy <function-name>
```

> [!warning]
> Ne pas modifier directement `supabase/migrations/` sauf pour correctifs d'urgence. Suivre la politique déclarative décrite dans `.github/instructions/Declarative_Database_Schema.instructions.md`.

## Documentation & ressources

- Documentation interne et notes d'architecture : `memory-bank/`
- Guides et consignes opérationnelles : `doc/` (ex. `nextjs.instructions.md`)
- Migrations et SQL : `supabase/schemas/` et `supabase/migrations/`

Si vous avez besoin d'aide pour lancer le projet, exécuter une migration ou préparer un déploiement, dites‑moi ce que vous voulez faire et je vous guide pas à pas.

---

Fichier créé automatiquement par un assistant — modification bienvenue pour adapter le ton ou ajouter des badges.

# The Rouge Cardinal Company 🎭

## Vue d'ensemble

**Rouge Cardinal** est un site web vitrine pour une compagnie de théâtre professionnelle. Il s'agit d'un projet **from-scratch** visant à présenter la compagnie, ses productions, et faciliter la gestion de contenu via un back-office sécurisé.

## Architecture Technique

- **Frontend** : Next.js 16 + Tailwind CSS + TypeScript
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

## 🔒 Corrections de Sécurité Récentes

### Novembre 2024 - Corrections Appliquées

**✅ Vue messages_contact_admin** : Changement de `SECURITY DEFINER` vers `SECURITY INVOKER`

- **Problème** : Risque d'escalade de privilèges et contournement des RLS
- **Solution** : Vue maintenant sécurisée avec `security_invoker = true`
- **Impact** : Protection renforcée des données sensibles

**✅ Fonction restore_content_version** : Correction référence colonne inexistante

- **Problème** : Référence à `published_at` dans table `spectacles` (colonne supprimée)
- **Solution** : Utilisation du champ `public` (boolean) correct
- **Impact** : Restauration de versions fonctionnelle

**Validation** : Toutes les corrections validées par `supabase db lint --linked` ✅

## 📚 Documentation

- [Guide de développement](./doc/guide-developpement.md) - Setup complet et workflow
- [Troubleshooting Admin Auth](./doc/troubleshooting-admin-auth.md) - Résolution problèmes auth
- [Schémas déclaratifs](./supabase/schemas/README.md) - Structure de la base
- [Progress](`./doc/progress.md`) - État d'avancement du projet

> [!NOTE]
> L'application suit les meilleures pratiques Next.js 15 avec un emphasis sur la sécurité, la performance et l'expérience utilisateur professionnelle.

---

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

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/YanBerdin/rougecardinalcompany)
