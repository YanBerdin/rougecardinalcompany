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
- **Authentification**: Supabase Auth (avec `@supabase/ssr` + `getClaims()`)
- **API**: Server Components + DAL `lib/dal/*` (server-only) via Supabase Client
- **Email Service**: Resend API avec React Email templates
- **Validation**: Zod schemas pour runtime validation

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
│   ├── protected/         # Routes protégées
│   ├── admin/             # 🆕 Backoffice administration
│   │   ├── layout.tsx     # Admin layout avec sidebar
│   │   ├── page.tsx       # Dashboard avec statistiques
│   │   └── team/          # Team management
│   │       ├── page.tsx   # Liste membres équipe
│   │       └── actions.ts # Server Actions (upload, CRUD)
│   └── api/               # API Routes
│       ├── newsletter/    # Newsletter subscription
│       ├── contact/       # Contact form
│       ├── test-email/    # Email testing (dev)
│       └── webhooks/      # Webhook handlers
│           └── resend/    # Resend webhooks
├── components/            # Composants React
│   ├── ui/               # Composants UI de base (shadcn/ui)
│   ├── features/         # Features (Smart/Dumb pattern)
│   │   ├── public-site/  # Public website features
│   │   └── admin/        # 🆕 Admin features
│   │       └── team/     # Team management UI
│   │           ├── TeamContainer.tsx
│   │           ├── TeamView.tsx
│   │           ├── TeamForm.tsx
│   │           ├── TeamList.tsx
│   │           ├── TeamCard.tsx
│   │           └── MediaPickerDialog.tsx
│   ├── skeletons/        # Loading skeletons
│   └── layout/           # Composants de layout
├── emails/               # React Email templates
│   ├── utils/            # Email layout & components
│   ├── newsletter-confirmation.tsx
│   └── contact-message-notification.tsx
├── lib/                  # Utilitaires et services
│   ├── supabase/        # Configuration Supabase
│   ├── dal/             # Data Access Layer (server-only)
│   │   ├── team.ts      # 🆕 Team members DAL
│   │   └── ...          # Other DAL modules
│   ├── email/           # Email actions & schemas
│   ├── hooks/           # Custom React hooks
│   ├── resend.ts        # Resend client config
│   └── site-config.ts   # Site configuration
├── types/                # TypeScript types
│   ├── database.types.ts # Supabase generated types
│   └── email.d.ts       # Email types
├── scripts/              # Testing scripts
│   ├── test-email-integration.ts
│   ├── check-email-logs.ts
│   └── test-webhooks.ts
├── supabase/            # Supabase project
│   ├── migrations/      # Database migrations
│   │   └── 20251022000001_create_medias_storage_bucket.sql  # 🆕 Storage bucket
│   └── schemas/         # Declarative schema (source of truth)
│       └── 02c_storage_buckets.sql  # 🆕 Storage bucket schema
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

### Configuration Resend

```typescript
// lib/resend.ts
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined");
}

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### Variables d'Environnement

**Supabase:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Admin only (scripts)
```

**Resend:**

```env
RESEND_API_KEY=re_xxx                      # Required
RESEND_AUDIENCE_ID=xxx                     # Optional
EMAIL_FROM=noreply@rougecardinalcompany.fr # Default FROM
EMAIL_CONTACT=contact@rougecardinalcompany.fr # Contact email
```

**Next.js Image Configuration:**

```env
# In next.config.ts remotePatterns
# Supabase Storage hostname configured for Image optimization
# yvtrlvmbofklefxcxrzv.supabase.co/storage/v1/object/public/**
```

**Site:**

```env
NEXT_PUBLIC_SITE_URL=https://rougecardinalcompany.fr # Production
# or
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Development
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
- @supabase/ssr: latest (Supabase Auth 2025)
- tailwindcss: ^3.4
- shadcn/ui: latest
- **resend**: ^4.0.1 (Email service)
- **@react-email/components**: ^0.0.30 (Email templates)
- **zod**: ^3.24.1 (Runtime validation)
- date-fns: ^4.1.0 (Date formatting)
- react-icons: ^5.3.0 (Icon library)

### Développement

- typescript: ^5
- eslint: latest
- prettier: latest
- @types/node: latest
- tsx: ^4.19.2 (TypeScript execution for scripts)

## Standards de Développement

### Code Style

- ESLint pour le linting
- Prettier pour le formatage
- TypeScript strict mode activé

### Conventions de Nommage

- Components: PascalCase (ex: `Button.tsx`)
- Utilitaires: camelCase (ex: `utils.ts`)
- Pages: kebab-case (URLs)

### Database Conventions

- **SQL Functions** : `SET search_path = ''` obligatoire (prévention SQL injection)
- **SECURITY DEFINER** : Justification explicite requise (issue #27)
- **Views** : `WITH (security_invoker = true)` par défaut
- **RLS** : Activé sur 100% des tables (36/36), aucun table-level grant
- **Migrations** : Idempotentes avec DO blocks + exception handling
- **Audit** : audit_grants_filtered.sql (whitelist objets système)

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

### Database Security

- **RLS-only model** : Aucun table-level grant, contrôle d'accès 100% via RLS policies
- **SECURITY INVOKER views** : 10 vues converties pour éliminer escalade privilèges
- **Storage RLS** : Bucket "medias" avec policies (public read, auth upload, admin delete)
- **Function security** : `SET search_path = ''` + SECURITY INVOKER par défaut
- **Audit automation** : CI security check avec audit_grants_filtered.sql

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

### Security Audit Tools

- **CI automation** : `.github/workflows/security-audit.yml` avec audit_grants_filtered.sql
- **Manual check** : `scripts/check-security-audit.sh` (requires DB URL extraction fix)
- **Detailed inspection** : `supabase/scripts/quick_check_all_grants.sql`
- **Whitelist strategy** : Exclusion objets système (`information_schema, realtime.*, storage.*, extensions.*`)
- **Verification** : Après chaque migration, CI check pour détecter expositions

### Documentation opérationnelle

**Supabase Local:**

- `doc-perso/lancement-supabase-local/CLI-Supabase-Local.md` : Commandes Supabase CLI détaillées
- `doc-perso/lancement-supabase-local/docker-install.md` : Installation Docker et gestion espace disque
- `supabase/migrations/README-migrations.md` : Conventions migrations et ordre d'exécution

**Email Service:**

- `memory-bank/architecture/Email_Service_Architecture.md` : Architecture email complète
- `TESTING_RESEND.md` : Guide de test de l'intégration Resend
- `.github/instructions/resend_supabase_integration.md` : Instructions d'intégration

**Architecture:**

- `memory-bank/architecture/Project_Architecture_Blueprint.md` : Architecture détaillée du projet
- `memory-bank/architecture/Project_Folders_Structure_Blueprint.md` : Guide de structure des dossiers

**Security Audit:**

- `supabase/migrations/SECURITY_AUDIT_SUMMARY.md` : Campagne complète 17 rounds (73 objets)
- `supabase/migrations/ROUND_7B_ANALYSIS.md` : Analyse pivot whitelist
- `doc/rls-policies-troubleshooting.md` : Guide troubleshooting RLS (202 lignes)
- `supabase/scripts/audit_grants_filtered.sql` : Script audit production
- `scripts/check-security-audit.sh` : Runner CI/manuel
