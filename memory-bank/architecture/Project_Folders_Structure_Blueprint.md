# Project Folders Structure Blueprint

Dernière mise à jour : 21 août 2025

## 1. Vue d'ensemble structurale

Ce projet est un site web Next.js (TypeScript, React 19, Supabase, Tailwind CSS) organisé par type et par feature. L'architecture sépare clairement l'UI, la logique métier, l'intégration, et la documentation. La documentation structurée (Memory Bank) est centrale pour la cohérence et la transmission du contexte projet.

- **Organisation principale :**
  - Par type (app, components, lib, public, doc)
  - Par feature (sections, ui, auth, etc.)
  - Documentation centralisée dans `memory-bank/`

## 2. Visualisation de la structure (Markdown List, profondeur 3)

- /
  - app/
    - auth/
      - confirm/
      - error/
      - forgot-password/
      - login/
      - sign-up/
      - sign-up-success/
      - update-password/
    - protected/
      - layout.tsx
      - page.tsx
    - compagnie/
      - client-page.tsx
      - layout.tsx
      - page.tsx
    - layout.tsx
    - page.tsx
    - globals.css
  - components/
    - ui/
      - badge.tsx
      - button.tsx
      - card.tsx
      - checkbox.tsx
      - dropdown-menu.tsx
      - input.tsx
      - label.tsx
      - skeleton.tsx
    - sections/
      - about-preview.tsx
      - featured-news.tsx
      - hero.tsx
      - upcoming-shows.tsx
    - layout/
      - footer.tsx
      - header.tsx
    - tutorial/
      - code-block.tsx
      - connect-supabase-steps.tsx
      - fetch-data-steps.tsx
      - sign-up-user-steps.tsx
      - tutorial-step.tsx
    - skeletons/
      - ShowsSkeleton.tsx
      - about-skeleton.tsx
      - hero-skeleton.tsx
      - news-skeleton.tsx
      - page-skeleton.tsx
    - ...
  - lib/
    - supabase/
      - client.ts
      - middleware.ts
      - schemas/
        - 00_extensions.sql
        - 01_tables_core.sql
        - 02_tables_joins.sql
        - 03_functions_triggers.sql
        - 04_indexes_fulltext.sql
        - 05_rls_policies.sql
        - 06_comments_and_metadata.sql
        - 07_seed.sql
      - server.ts
    - utils.ts
  - memory-bank/
    - activeContext.md
    - architecture/
      - Project_Architecture_Blueprint.md
      - Project_Folders_Structure_Blueprint.md
    - epics/
      - epics-map.yaml
      - details/
        - 14.1-page-accueil(Home).md
        - 14.2-page-presentation-companie.md
        - 14.3-page-spectacles-(événements).md
        - 14.4-page-agenda.md
        - 14.5-page-presse.md
        - 14.6-contact-newsletter.md
        - 14.7-back‑office.md
    - productContext.md
    - progress.md
    - projectbrief.md
    - systemPatterns.md
    - tasks/
    - techContext.md
  - doc/
    - progress.md
    - update-node-18to-22.md
  - public/
    - favicon.ico
    - opengraph-image.png
    - twitter-image.png
  - .github/
    - copilot/
      - copilot-instructions.md
  - .vscode/
  - package.json
  - tsconfig.json
  - next.config.ts
  - tailwind.config.ts
  - postcss.config.mjs
  - eslint.config.mjs
  - README.md

## 3. Analyse des dossiers clés

- **app/** : Pages, layouts, entrypoints Next.js (App Router). Organisation par route et par fonctionnalité.
- **components/** : Composants UI réutilisables, organisés par type (`ui/`, `sections/`, etc.) ou par feature.
- **lib/** : Intégrations (ex : Supabase), utilitaires, logique partagée.
- **memory-bank/** : Documentation structurée, contextes, tâches, épics, historique des décisions.
- **doc/** : Documentation technique, guides de migration, notes de progression.
- **public/** : Assets statiques accessibles côté client.
- **.github/copilot/** : Instructions Copilot personnalisées pour la génération de code assistée.

## 4. Patterns de placement de fichiers

- **Composants UI** : `components/ui/`, `components/sections/`
- **Pages et routes** : `app/`
- **Intégration API/DB** : `lib/supabase/`
- **Utilitaires** : `lib/utils.ts`
- **Documentation projet** : `memory-bank/`
- **Tests** (si présents) : à placer dans `__tests__/` ou à côté des fichiers testés

## 5. Conventions de nommage et d'organisation

- **Fichiers composants** : PascalCase (`Hero.tsx`)
- **Fonctions, hooks, variables** : camelCase
- **Routes Next.js** : kebab-case
- **Suffixes** : `.tsx` pour composants, `.ts` pour utilitaires/services
- **Groupement** : par type ou par feature selon la granularité

## 6. Workflow de navigation et développement

- **Ajouter une page** : créer un dossier/fichier dans `app/`
- **Ajouter un composant** : dans `components/` (sous-dossier par type ou feature)
- **Ajouter une intégration** : dans `lib/`
- **Ajouter une tâche ou documentation** : dans `memory-bank/`
- **Modifier la configuration** : fichiers racine (`tsconfig.json`, `next.config.ts`, etc.)

## 7. Organisation du build et des outputs

- **Build Next.js** : `.next/` (généré, non versionné)
- **Assets publics** : `public/`
- **Dossiers générés** : à exclure de la documentation (type `node_modules/`, `.next/`)

## 8. Templates d’extension

### Nouveau composant

```md
components/
  [type|feature]/
    MyComponent.tsx
    MyComponent.test.tsx (optionnel)
    index.ts (optionnel)
```

### Nouvelle page

```md
app/
  [route]/
    page.tsx
    layout.tsx (optionnel)
```

### Nouvelle intégration

```md
lib/
  [service]/
    client.ts
    server.ts
```

### Nouvelle tâche

```md
memory-bank/tasks/
  TASKXXX-nom-tache.md
```

## 9. Enforcement et documentation

- Structure validée par convention, linter (eslint), et documentation dans `memory-bank/`.
- Les changements majeurs de structure sont documentés dans `memory-bank/progress.md` et `README.md`.

---

> Ce blueprint doit être mis à jour à chaque évolution majeure de la structure ou de la stack.
