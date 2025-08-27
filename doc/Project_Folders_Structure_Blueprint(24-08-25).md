# Project Folders Structure Blueprint (24 août 2025)

> Généré automatiquement le 24 août 2025

## 1. Vue d'ensemble structurale

- **Type de projet détecté** : Next.js 15 (React 19, TypeScript, App Router)
- **Organisation principale** : Par fonctionnalité (Feature-Based), avec séparation Smart/Dumb Components
- **Principes architecturaux** :
  - Architecture modulaire avec séparation claire des responsabilités
  - Pattern Container/View (Smart/Dumb Components) pour les features
  - Chaque feature possède sa propre structure (types, hooks, Container, View)
  - Composants UI partagés isolés des features spécifiques
  - Documentation structurée (Memory Bank) pour préserver le contexte projet
- **Patterns récurrents** :
  - `HeroContainer.tsx` → logique métier, gestion d'état (Smart)
  - `HeroView.tsx` → présentation pure (Dumb)
  - `hooks.ts` → logique réutilisable, gestion d'état
  - `types.ts` → interfaces et types TypeScript
  - `index.ts` → points d'entrée/exports
- **Rationnel** : L'architecture Feature-Based avec Smart/Dumb Components favorise :
  - Testabilité (séparation UI/logique)
  - Maintenabilité (responsabilités uniques)
  - Évolutivité (modification isolée des features)
  - Cohérence (patterns récurrents)

## 2. Visualisation de la structure

```bash
/ (racine)
├── app/                              # Next.js App Router
│   ├── auth/                         # Authentification
│   │   ├── confirm/
│   │   ├── error/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── sign-up-success/
│   │   └── update-password/
│   ├── protected/                    # Zone protégée
│   ├── compagnie/                    # Page Compagnie
│   │   ├── client-page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── page.tsx                      # Page d'accueil
│   └── layout.tsx                    # Layout global
├── components/
│   ├── features/                     # Organisation par feature
│   │   └── public-site/              # Site public
│   │       ├── home/                 # Sections de la page d'accueil
│   │       │   ├── about/            # Pattern Smart/Dumb pour About
│   │       │   │   ├── AboutContainer.tsx
│   │       │   │   ├── AboutView.tsx
│   │       │   │   ├── hooks.ts
│   │       │   │   ├── types.ts
│   │       │   │   └── index.ts
│   │       │   ├── hero/             # Pattern Smart/Dumb pour Hero
│   │       │   ├── news/             # Pattern Smart/Dumb pour News
│   │       │   ├── shows/            # Pattern Smart/Dumb pour Shows
│   │       │   ├── newsletter/       # Pattern Smart/Dumb pour Newsletter
│   │       │   ├── partners/         # Pattern Smart/Dumb pour Partners
│   │       │   └── index.ts          # Export des Containers
│   │       ├── agenda/               # Feature Agenda
│   │       ├── compagnie/            # Feature Compagnie
│   │       ├── spectacles/           # Feature Spectacles
│   │       └── presse/               # Feature Presse
│   ├── ui/                           # Composants UI partagés
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── skeletons/                    # États de chargement
│   │   ├── hero-skeleton.tsx
│   │   ├── news-skeleton.tsx
│   │   └── ...
│   └── tutorial/                     # Composants tutoriel/démo
├── lib/                              # Code utilitaire et intégrations
│   ├── supabase/                     # Configuration Supabase
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   ├── server.ts
│   │   └── schemas/                  # Schémas SQL
│   └── utils.ts                      # Utilitaires globaux
├── memory-bank/                      # Documentation structurée
│   ├── architecture/                 # Blueprints d'architecture
│   ├── epics/                        # Épopées de développement
│   └── tasks/                        # Tâches spécifiques
├── doc/                              # Documentation technique
├── public/                           # Assets statiques
├── prompts-github/                   # Prompts pour GitHub Copilot
├── [Fichiers-de-configuration]       # Configuration du projet
```

## 3. Analyse des dossiers clés

- **app/** : Point d'entrée Next.js App Router, structure orientée route.
  - Chaque sous-dossier correspond à une route (URL).
  - Les fichiers `page.tsx` définissent les composants de page.
  - Les fichiers `layout.tsx` définissent les layouts partagés.
  - La séparation client/serveur est gérée via les directives `"use client"`.

- **components/features/** : Organisation principale par feature.
  - Le pattern `/home/{section}/` montre la décomposition d'une page en sections distinctes.
  - Chaque feature (home, agenda, compagnie, etc.) a sa propre structure.
  - Le pattern Smart/Dumb (Container/View) est systématiquement appliqué.
  - Chaque feature contient ses propres types, hooks, Container et View.

- **components/ui/** : Composants UI réutilisables.
  - Composants atomiques et moléculaires.
  - Utilisation de shadcn/ui (basé sur Radix UI).
  - Indépendants des features spécifiques.

- **lib/** : Code utilitaire et intégrations.
  - Configuration Supabase pour l'authentification et les données.
  - Utilitaires partagés à travers l'application.

- **memory-bank/** : Documentation structurée.
  - Contexte produit, architecture, tâches, épics.
  - Permet de comprendre le "pourquoi" derrière les décisions.

## 4. Patterns de placement de fichiers

- **Composants Smart (Container)** :
  - Emplacement : `components/features/{feature}/{section}/{Section}Container.tsx`
  - Responsabilités : Logique métier, gestion d'état, récupération de données, gestion d'événements
  - Exemple : `HeroContainer.tsx` gère les données et callbacks pour le carousel

- **Composants Dumb (View)** :
  - Emplacement : `components/features/{feature}/{section}/{Section}View.tsx`
  - Responsabilités : Présentation pure, rendu UI basé sur les props
  - Exemple : `HeroView.tsx` reçoit les slides et callbacks du Container

- **Types** :
  - Emplacement : `components/features/{feature}/{section}/types.ts`
  - Contenu : Interfaces TypeScript pour les données et props des composants
  - Exemple : `HeroSlide`, `HeroProps`

- **Hooks** :
  - Emplacement : `components/features/{feature}/{section}/hooks.ts`
  - Contenu : Hooks React pour la logique réutilisable et la gestion d'état
  - Exemple : `useHero` pour la gestion du carousel

- **UI partagée** :
  - Emplacement : `components/ui/`
  - Contenu : Composants génériques indépendants du domaine
  - Exemple : Button, Card, Badge

- **Pages** :
  - Emplacement : `app/{route}/page.tsx`
  - Contenu : Assemblage des containers de features
  - Exemple : `app/page.tsx` importe tous les containers de la home

## 5. Conventions de nommage et d'organisation

- **Fichiers composants** :
  - PascalCase pour les composants React (`HeroView.tsx`, `NewsletterContainer.tsx`)
  - Suffixes explicites : `Container` (Smart), `View` (Dumb)
  - Fichiers annexes : `hooks.ts`, `types.ts`, `index.ts`

- **Dossiers** :
  - camelCase pour les features et sections (`home`, `newsletter`)
  - kebab-case pour les routes dans `app/` (`sign-up`)

- **Exports/Imports** :
  - Exports nommés privilégiés
  - Re-exports via `index.ts` pour simplifier les imports
  - Alias d'import `@/` pour les imports absolus

- **Organisation interne** :
  - Isolation des features
  - Partage horizontal (UI, utils) vs. vertical (features)
  - Évitement des dépendances circulaires

## 6. Workflow de navigation et développement

- **Création d'une nouvelle feature** :
  1. Créer un dossier `components/features/public-site/{feature}/`
  2. Créer la structure type/hook/Container/View
  3. Créer un index.ts pour exporter les composants
  4. Créer la page dans `app/{feature}/page.tsx`

- **Extension d'une feature existante** :
  1. Ajouter de nouveaux types dans `types.ts`
  2. Étendre les hooks dans `hooks.ts`
  3. Mettre à jour les composants Container et View

- **Ajout d'un composant UI partagé** :
  1. Créer le composant dans `components/ui/`
  2. S'assurer qu'il est indépendant des features
  3. L'importer dans les composants View qui en ont besoin

- **Ajout d'une page** :
  1. Créer un dossier `app/{route}/`
  2. Ajouter `page.tsx` et éventuellement `layout.tsx`
  3. Importer les Containers des features nécessaires

## 7. Build et Output

- **Configuration de build** :
  - `next.config.ts` : Configuration Next.js
  - `tsconfig.json` : Configuration TypeScript
  - `tailwind.config.ts` : Configuration Tailwind CSS
  - `postcss.config.mjs` : Configuration PostCSS
  - `eslint.config.mjs` : Configuration ESLint

- **Commandes de build** :
  - Développement : `next dev --turbopack`
  - Production : `next build`
  - Serveur de production : `next start`
  - Linting : `next lint`

- **Output** :
  - `.next/` : Output de build (non versionné)
  - `public/` : Assets statiques déployés

- **Environnement** :
  - Variables d'environnement dans `.env.local`
  - Configuration Supabase spécifique à l'environnement

## 8. Technology-Specific Organization

- **Next.js** :
  - App Router pour les routes et layouts
  - Server Components par défaut, Client Components avec `"use client"`
  - Séparation claire client/serveur
  - Optimisations automatiques d'images, polices, etc.

- **React** :
  - React 19 avec Hooks (useEffect, useState, useRef, useCallback)
  - Pattern Container/View (Smart/Dumb)
  - Context API pour état global potentiel

- **TypeScript** :
  - Types stricts pour toutes les props et données
  - Interfaces dédiées par feature
  - Alias d'import pour navigation simplifiée

- **Tailwind CSS** :
  - Utilitaires CSS directement dans les composants
  - Configuration étendue dans `tailwind.config.ts`
  - Composants UI construits sur cette base

- **Supabase** :
  - Configuration client/serveur dans `lib/supabase/`
  - Schémas SQL pour la structure de la base de données
  - Middleware pour l'authentification

## 9. Extension et Évolution

- **Ajout de nouvelles fonctionnalités** :
  - Suivre le pattern Container/View existant
  - Créer une structure complète dans `components/features/`
  - Intégrer dans les pages via les Containers

- **Scalabilité** :
  - Granularité fine des features
  - Isolation claire des responsabilités
  - Pattern d'export/import cohérent

- **Refactoring** :
  - Possibilité de déplacer une feature complète sans affecter les autres
  - Évolution du design system dans `components/ui/`
  - Documentation des changements dans `memory-bank/`

## 10. Templates de Structure

### Nouvelle Feature

```bash
components/features/public-site/{feature}/
├── {Feature}Container.tsx       # Smart component avec logique
├── {Feature}View.tsx            # Dumb component pour UI
├── hooks.ts                     # Custom hooks pour la feature
├── types.ts                     # TypeScript interfaces/types
└── index.ts                     # Exports
```

### Nouvelle Section de Home

```bash
components/features/public-site/home/{section}/
├── {Section}Container.tsx       # Smart component avec logique
├── {Section}View.tsx            # Dumb component pour UI
├── hooks.ts                     # Custom hooks pour la section
├── types.ts                     # TypeScript interfaces/types
└── index.ts                     # Exports
```

### Nouvelle Page

```bash
app/{route}/
├── page.tsx                     # Composant de page (Server Component)
├── layout.tsx                   # Layout spécifique (optionnel)
└── client-page.tsx              # Client Component si nécessaire
```

## 11. Enforcement et Documentation

- **Validation de structure** :
  - ESLint pour valider les patterns d'import/export
  - Revues de code pour maintenir la cohérence

- **Documentation** :
  - Blueprints d'architecture dans `memory-bank/architecture/`
  - Documentation technique dans `doc/`
  - Contexte produit et épics dans `memory-bank/`

- **Évolution** :
  - Mise à jour du blueprint à chaque évolution significative
  - Traçabilité des décisions architecturales

---

> Ce blueprint a été généré le 24 août 2025 et reflète l'état actuel de l'architecture. Il doit être mis à jour à chaque évolution significative de la structure du projet.
