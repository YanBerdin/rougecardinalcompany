---
applyTo: "**"
---

# GitHub Copilot Instructions - Rouge Cardinal Company

Ce fichier est volontairement court. Il sert de boussole globale pour Copilot, pas de duplication des guides projet.

Les règles détaillées vivent dans les sources spécialisées : `.github/instructions/`, `.github/skills/`, `.github/agents/` et `memory-bank/`. Quand une règle métier ou technique existe dans ces sources, elle prime sur ce résumé.

## Posture de Travail

- Comprendre avant de coder : expliciter les hypothèses, demander si l'ambiguïté peut changer la solution.
- Privilégier la simplicité : pas de fonctionnalité spéculative, pas d'abstraction pour un seul usage.
- Faire des changements chirurgicaux : toucher uniquement les fichiers nécessaires et respecter le style existant.
- Vérifier le résultat : transformer chaque demande en critère observable puis exécuter le test, lint, build ou contrôle adapté.
- Ne jamais annuler les changements utilisateur sans demande explicite.

## Sources de Vérité

Lire les documents pertinents avant d'intervenir :

- `memory-bank/projectbrief.md` : objectif produit et contraintes générales.
- `memory-bank/activeContext.md` : état courant du projet et derniers changements.
- `memory-bank/systemPatterns.md` : patterns architecturaux applicables.
- `memory-bank/techContext.md` : stack, versions et commandes utiles.
- `memory-bank/progress.md` et `memory-bank/tasks/_index.md` : historique et tâches récentes.
- `memory-bank/architecture/Project_Architecture_Blueprint.md` : architecture complète si la tâche touche plusieurs couches.
- `memory-bank/architecture/Project_Folders_Structure_Blueprint_v6.md` : organisation des dossiers si un nouvel emplacement est nécessaire.
- `supabase/CLI-Supabase-Cloud.md` et `supabase/CLI-Supabase-Local.md` : pour tout ce qui touche à Supabase, local ou cloud.
- `supabase/README.md` : pour les règles de backup et restauration de la base de données.
- `supabase/schemas/README.md` : pour les changements de schéma, RLS ou fonctions.
- `supabase/migrations/migrations.md` : pour les migrations SQL déclaratives et DML manuelles.

Ne recopier aucun contenu long de ces fichiers dans `copilot-instructions.md`. Mettre à jour le memory-bank quand une décision durable ou un nouveau pattern est découvert.

## Guides Spécialisés

Utiliser le fichier d'instructions le plus précis pour la tâche :

- TypeScript strict : `.github/instructions/2-typescript.instructions.md`.
- Clean Code : `.github/instructions/clean-code.instructions.md`.
- Next.js App Router, Server Components, Server Actions et API Routes : `.github/instructions/nextjs.instructions.md`, `.github/instructions/next-backend.instructions.md`, `.github/instructions/nextjs15-backend-with-supabase.instructions.md`.
- Supabase Auth SSR et `getClaims()` : `.github/instructions/nextjs-supabase-auth-2025.instructions.md`.
- CRUD admin avec Server Actions : `.github/instructions/crud-server-actions-pattern.instructions.md`.
- DAL : `.github/instructions/dal-solid-principles.instructions.md`.
- T3 Env : `.github/instructions/t3_env_guide.instructions.md`.
- SQL, migrations, RLS et fonctions Postgres : `.github/instructions/Postgres_SQL_Style_Guide.instructions.md`, `.github/instructions/Declarative_Database_Schema.instructions.md`, `.github/instructions/Create_migration.instructions.md`, `.github/instructions/Create-RLS-policies.instructions.md`, `.github/instructions/Database_Create_functions.instructions.md`.
- Accessibilité et tailles de cible : `.github/instructions/a11y.instructions.md`, `.github/instructions/touch_hitbox.instructions.md`, `.github/instructions/wcag_target_size.instructions.md`.
- Sécurité OWASP : `.github/instructions/security-and-owasp.instructions.md`.
- Playwright : `.github/instructions/playwright-tests.instructions.md` et `.github/skills/create-e2e-test/SKILL.md`.
- CI/CD, commits, Edge Functions et shadcn : utiliser les instructions dédiées correspondantes.

Utiliser les skills quand la demande correspond clairement à leur domaine, notamment design, tests Playwright, React performance, composition React, SEO, git workflow ou browser automation.

## Architecture en Bref

- Projet : site de compagnie de théâtre avec zone publique `(marketing)` et backoffice `(admin)`.
- Stack : Next.js 16, React 19, TypeScript strict, Supabase PostgreSQL/Auth/Storage, Tailwind, shadcn/ui, Zod, T3 Env, Sentry, Playwright.
- Approche : server-first, feature-based, Clean Architecture légère.
- Lecture de données : Server Components + DAL `lib/dal/*`.
- Mutations internes : Server Actions avec validation, authorization, DAL, puis `revalidatePath()`.
- APIs publiques, webhooks et intégrations externes : Route Handlers `app/api/*`.
- Sécurité : défense en profondeur par GRANT + RLS + guards applicatifs.

## Règles Projet Incontournables

- DAL : `"use server"`, `import "server-only"`, `DALResult<T>`, `dalSuccess()` / `dalError()`, pas de `revalidatePath()`, pas d'email, pas de dépendance client.
- Auth Supabase : utiliser les helpers SSR du projet et le pattern cookies `getAll()` / `setAll()` ; `getClaims()` pour les checks rapides, `getUser()` seulement si les données utilisateur complètes sont nécessaires.
- Variables d'environnement : utiliser `env` depuis `lib/env.ts`. Exception : scripts CLI `scripts/*.ts` avec `dotenv/config` selon le guide T3 Env.
- BigInt : respecter le modèle UI `number` -> transport `string` -> DAL `bigint`; ne pas retourner de `BigInt` via Server Action.
- Schéma DB : modifier d'abord `supabase/schemas/` sauf cas connus non capturés par le diff ; générer ou créer une migration conforme aux guides SQL/Supabase.
- Vues admin : ne jamais accorder un accès large à `authenticated`; combiner grants minimaux, RLS et garde SQL `is_admin()`.
- UI : Server Components par défaut ; Client Components seulement pour état, effets, événements ou APIs navigateur.
- Accessibilité : appliquer WCAG 2.2 AA, labels explicites, focus visible, navigation clavier, alt text et tailles de cible.
- Tests : choisir la validation proportionnée au risque ; au minimum lint/type-check ciblé si du code TS est modifié.

## Commandes Courantes

- Développement : `pnpm dev`.
- Qualité : `pnpm lint`, `pnpm build`, tests Vitest ciblés via `pnpm vitest run <file>`.
- E2E : suivre `.github/instructions/playwright-tests.instructions.md` et les POM sous `e2e/`.
- Supabase : suivre les guides déclaratifs et migrations avant tout `db diff`, `db push` ou changement RLS.

## Ce Qui Ne Doit Pas Être Ici

Ne pas ajouter dans ce fichier :

- Exemples longs de code TypeScript, SQL, React ou Supabase.
- Historique de tâches, changelogs détaillés ou rapports d'audit.
- Détails déjà présents dans `memory-bank/systemPatterns.md` ou les blueprints.
- Règles complètes déjà couvertes par `.github/instructions/*.instructions.md` ou `.github/skills/*/SKILL.md`.

Pour tout nouveau savoir durable : mettre à jour la source spécialisée pertinente, puis garder ici uniquement un lien ou une règle synthétique si nécessaire.
