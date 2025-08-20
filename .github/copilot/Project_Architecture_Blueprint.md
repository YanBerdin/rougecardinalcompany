# Blueprint d'Architecture du Projet Rouge Cardinal Company

## 1. Détection et Analyse de l'Architecture

### Stack Technologique

- **Framework Frontend**: Next.js 15.4.5 avec App Router
- **Langage**: TypeScript
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **UI/Styling**:
  - Tailwind CSS pour le styling
  - shadcn/ui pour les composants
- **State Management**: React Hooks + Context
- **Déploiement**: Vercel

### Pattern Architectural

Le projet suit une architecture hybride combinant :

- **App Router de Next.js** pour le routage et le rendu côté serveur
- **Architecture en couches** avec séparation claire des responsabilités
- **Pattern de composants React** avec une approche "client-first"
- **Principe de Clean Architecture** pour la gestion des données

## 2. Vue d'Ensemble de l'Architecture

### Principes Directeurs

1. **Séparation des Préoccupations**

   - Composants UI isolés
   - Logique métier séparée
   - Gestion d'état centralisée

2. **Approche Server-First**

   - Utilisation maximale du SSR
   - Optimisation des performances
   - SEO-friendly

3. **Composants Réutilisables**

   - Design System cohérent
   - Composants atomiques
   - Patterns de composition

## 3. Structure du Projet

### Structure des Dossiers

```txt
/
├── app/                    # Pages et routes Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   ├── auth/              # Routes d'authentification
│   └── protected/         # Routes protégées
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   ├── sections/         # Sections de page
│   └── layout/           # Composants de layout
├── lib/                  # Utilitaires et services
│   └── supabase/        # Configuration Supabase
└── public/              # Assets statiques
```

## 4. Composants Architecturaux Principaux

### Couche Présentation

#### Components UI (`components/ui/`)

- Composants de base réutilisables
- Styling avec Tailwind CSS
- Accessibilité et responsive design

#### Sections (`components/sections/`)

- Composants de plus haut niveau
- Logique métier spécifique
- Gestion d'état locale

### Couche Application

#### Services Supabase (`lib/supabase/`)

- Configuration du client
- Gestion des sessions
- Middleware d'authentification

#### Utilitaires (`lib/utils.ts`)

- Fonctions utilitaires
- Helpers de style
- Types partagés

### Couche Infrastructure

#### Configuration Next.js

- Routing (App Router)
- Middleware
- Configuration de build

## 5. Couches et Dépendances

### Flux de Données

1. **Requête Client** → **App Router** → **Page/Layout**
2. **Page/Layout** → **Components** → **Services**
3. **Services** → **Supabase** → **Base de Données**

### Règles de Dépendance

- Les composants ne peuvent pas accéder directement à la base de données
- Les services sont la seule interface avec Supabase
- Les composants UI sont indépendants de la logique métier

## 6. Architecture des Données

### Modèle de Données

- Authentification utilisateur
- Gestion des spectacles
- Gestion des actualités
- Système de réservation

### Patterns d'Accès aux Données

- Utilisation de Server Components pour les requêtes
- Cache côté client avec SWR ou React Query
- Validation des données avec Zod

## 7. Implémentation des Préoccupations Transversales

### Authentification

```typescript
// lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  // Middleware pour la gestion des sessions
}
```

### Gestion des Erreurs

- Error Boundaries React
- Pages d'erreur personnalisées
- Logging côté serveur

### Monitoring

- Vercel Analytics
- Supabase Monitoring
- Logs d'application

## 8. Patterns de Communication

### Communication Client-Serveur

- Server Components pour les données statiques
- API Routes pour les actions dynamiques
- WebSockets pour les mises à jour en temps réel

### Communication Inter-composants

- Props Drilling minimisé
- Context API pour l'état global
- Event Emitters pour la communication asynchrone

## 9. Patterns Spécifiques Next.js

### Routing et Navigation

- App Router pour le routage
- Middleware pour l'authentification
- Loading et Error states

### Optimisation des Performances

- Image Optimization
- Font Optimization
- Dynamic Imports

## 10. Patterns d'Implémentation

### Pattern de Page

```typescript
// app/page.tsx
export default async function Page() {
  // 1. Récupération des données
  // 2. Rendu des composants
  // 3. Gestion des erreurs
}
```

### Pattern de Composant

```typescript
// components/sections/Section.tsx
"use client";

export function Section() {
  // 1. État local
  // 2. Effets et logique
  // 3. Rendu
}
```

## 11. Architecture de Test

### Niveaux de Test

1. Tests Unitaires (Jest)
2. Tests d'Intégration (Testing Library)
3. Tests E2E (Cypress/Playwright)

### Patterns de Test

- Arrangement-Action-Assertion
- Page Object Model
- Mocking des services externes

## 12. Architecture de Déploiement

### Pipeline de Déploiement

1. Build (Next.js)
2. Tests
3. Déploiement (Vercel)
4. Monitoring

### Configuration des Environnements

- Development
- Staging
- Production

## 13. Points d'Extension

### Extension des Composants

- Higher-Order Components
- Render Props
- Hooks personnalisés

### Extension des Services

- Adapters pour nouvelles sources de données
- Plugins pour fonctionnalités additionnelles
- Middleware personnalisé

## 14. Gouvernance Architecturale

### Maintenance de la Cohérence

1. ESLint pour le style de code
2. Prettier pour le formatage
3. TypeScript pour le typage strict
4. Revues de code systématiques

### Documentation

- JSDoc pour les composants
- README.md pour chaque dossier
- Storybook pour les composants UI

## 15. Guide de Développement

### Workflow de Développement

1. Créer une nouvelle branche feature/
2. Implémenter les tests
3. Développer la fonctionnalité
4. Revue de code
5. Merge dans main

### Templates d'Implémentation

- Components
- Pages
- Services
- Tests

## Mise à Jour

Ce blueprint a été généré le 19 août 2025. Il doit être mis à jour à chaque changement architectural majeur.
