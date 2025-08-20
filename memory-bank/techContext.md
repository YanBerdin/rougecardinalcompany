# Contexte Technique

## Stack Technologique

### Frontend

- **Framework**: Next.js 15.4.5
- **Langage**: TypeScript
- **UI Framework**:
  - Tailwind CSS pour le styling
  - shadcn/ui pour les composants
- **State Management**: React Hooks + Context API

### Backend

- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **API**: Server Components + Supabase Client

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
// lib/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        // Configuration des cookies pour l'authentification
      }
    }
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
- react: ^18
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
- Route pré-rendering où possible
- Lazy loading des composants lourds

### Monitoring

- Vercel Analytics
- Supabase Dashboard
- Logs d'erreur

## Workflow de Développement

1. Développement local avec hot reload
2. Tests automatisés (à implémenter)
3. Review des pull requests
4. Déploiement automatique sur Vercel

<!-- MB:EPICS_SYNC:BEGIN -->
(ce bloc est généré depuis memory-bank/epics/epics-map.yaml)
<!-- MB:EPICS_SYNC:END -->
