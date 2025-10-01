# Contexte Technique

## Stack Technologique

### Frontend

- **Framework**: Next.js 15.4.5
- **Langage**: TypeScript
- **UI Framework**:
  - Tailwind CSS pour le styling
  - shadcn/ui pour les composants
- **State Management**: React Hooks + Context API ou Redux (si nécessaire)

### Backend

- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **API**: Server Components + DAL `lib/dal/*` (server-only) via Supabase Client

### Déploiement

- **Plateforme**: Vercel
- **CI/CD**: GitHub Actions
- **Environnements**: Development, Staging, Production

## Configuration du Projet

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

### Configuration Supabase

```typescript
// supabase/server.ts (extrait)
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    { cookies: { get: cookieStore.get, set: cookieStore.set, remove: cookieStore.delete } }
  );
}
```

### Middleware Configuration

```typescript
// middleware.ts
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## Dépendances Clés

### Production

- next: 15.4.5
- react: ^19
- @supabase/ssr: latest
- tailwindcss: ^3
- shadcn/ui: latest

### Développement

- typescript: ^5
- eslint: latest
- prettier: latest

## Standards de Développement

### Code Style

- ESLint pour le linting
- Prettier pour le formatage
- TypeScript strict mode activé

### Conventions de Nommage

- Components: PascalCase (ex: `Button.tsx`)
- Utilitaires: camelCase (ex: `utils.ts`)
- Pages: kebab-case (URLs)

### Pattern de Composants

```typescript
// Pattern de composant standard
"use client";

export function ComponentName() {
  // 1. Hooks et état
  // 2. Side effects
  // 3. Handlers
  // 4. Render
}
```

## Sécurité

### Authentification

- Supabase Auth pour la gestion des sessions
- Middleware pour la protection des routes
- CORS configuré pour les domaines autorisés

### Protection des Données

- Row Level Security (RLS) dans Supabase
- Validation des entrées avec TypeScript
- Sanitization des données

## Performance

### Optimisations

- Images optimisées via Next/Image
- Server Components par défaut pour l’accès données (pas de surcoût hydratation)
- React Suspense pour loading states contrôlés (skeletons)

### Monitoring

- Vercel Analytics
- Supabase Dashboard
- Logs d'erreur

## Workflow de Développement

1. Développement local avec hot reload
2. Tests automatisés (à implémenter)
3. Review des pull requests
4. Déploiement automatique sur Vercel

### Docker et Supabase Local

- **Docker** : Utilisé pour Supabase Local (Postgres, Auth, Storage, etc.)
- **Volumes Docker** : Inspection avec `docker volume ls --filter name=supabase` et `docker run --rm -v <volume>:/volume alpine du -sh /volume`
- **Disk Space** : Gestion avec `docker system df` et `docker system prune -a` (⚠️ supprime TOUTES les images inutilisées)
- **Supabase CLI** : `pnpm dlx supabase start/stop/status/db reset`
- **Workflow déclaratif** : `db diff` pour générer migrations, `db push` pour appliquer

### Documentation opérationnelle

- `doc-perso/lancement-supabase-local/CLI-Supabase-Local.md` : Commandes Supabase CLI détaillées
- `doc-perso/lancement-supabase-local/docker-install.md` : Installation Docker et gestion espace disque
- `supabase/migrations/README-migrations.md` : Conventions migrations et ordre d'exécution
