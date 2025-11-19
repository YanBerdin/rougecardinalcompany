# Guide de Développement - Rouge Cardinal Company

## 🚀 Quick Start

### Prérequis

- Node.js 18+ (recommandé : 20 ou 22)
- pnpm 8+
- Git
- Compte Supabase (projet remote configuré)

### Installation initiale

```bash
# 1. Cloner le repo
git clone https://github.com/YanBerdin/rougecardinalcompany.git
cd rougecardinalcompany

# 2. Installer les dépendances
pnpm install

# 3. Copier et configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos credentials Supabase remote

# 4. Créer l'utilisateur admin initial (si nécessaire)
pnpm exec tsx scripts/create-admin-user.ts

# 5. Démarrer le serveur dev
pnpm dev
```

L'application sera accessible sur http://localhost:3000

**ℹ️ Variables d'environnement requises** :

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGc...
SUPABASE_SECRET_KEY=eyJhbGc... # Service role key
```

### Credentials admin

L'utilisateur admin doit être créé via le script `create-admin-user.ts` :

```bash
pnpm exec tsx scripts/create-admin-user.ts
```

Le script affichera le mot de passe temporaire généré.

⚠️ **IMPORTANT** : Changez ce mot de passe après votre première connexion !

## 🗄️ Gestion de la base de données

### Schéma déclaratif

Le projet utilise le **schéma déclaratif** de Supabase :

- **Source de vérité** : Fichiers dans `supabase/schemas/`
- **Migrations** : Générées automatiquement via `supabase db diff`
- **Organisation** : Ordre lexicographique (01_, 02_, 03_, etc.)

#### Structure des schemas

```
supabase/schemas/
├── 01_extensions.sql              # Extensions PostgreSQL
├── 02a_policies_tables.sql        # Tables principales
├── 02b_functions_core.sql         # Fonctions SQL (is_admin, etc.)
├── 03_rls_policies.sql            # Politiques RLS
├── 04_views.sql                   # Vues SQL
├── 05_profiles_auto_sync.sql      # Trigger auto-sync profiles
└── 90_grants.sql                  # Permissions
```

### Workflow de modification du schéma (remote)

**⚠️ RÈGLE CRITIQUE** : Ne jamais éditer directement les fichiers de migration.

**Méthode 1 : Via Supabase CLI** (recommandé)

```bash
# 1. Linker le projet remote
pnpm dlx supabase link --project-ref YOUR_PROJECT_ID

# 2. Modifier le fichier de schéma
code supabase/schemas/02a_policies_tables.sql

# 3. Générer la migration (compare avec remote)
pnpm dlx supabase db diff --linked -f add_spectacles_duration

# 4. Vérifier la migration générée
cat supabase/migrations/YYYYMMDDHHmmss_add_spectacles_duration.sql

# 5. Pousser vers remote
pnpm dlx supabase db push
```

**Méthode 2 : Via Supabase Studio** (plus simple)

1. Aller dans **Database → Schema** ou **SQL Editor**
2. Modifier le schéma directement
3. Supabase génère automatiquement les migrations
4. Récupérer les migrations : `pnpm dlx supabase db pull`

### Déploiement du schéma sur remote

**⚠️ ATTENTION** : Ces commandes impactent la base de production/staging.

```bash
# Pousser toutes les migrations vers remote
pnpm dlx supabase db push

# Recréer l'admin après déploiement si nécessaire
pnpm exec tsx scripts/create-admin-user.ts
```

**Pour un reset complet** (⚠️ DESTRUCTIF - uniquement sur staging) :

1. Aller dans **Supabase Dashboard → Database → Migrations**
2. Cliquer sur **Reset database** (détruit toutes les données)
3. Appliquer le schéma : `pnpm dlx supabase db push`
4. Recréer l'admin : `pnpm exec tsx scripts/create-admin-user.ts`

### Créer/recréer l'admin manuellement

Si l'admin n'existe pas ou a été supprimé :

```bash
pnpm run db:init-admin
```

## 🔐 Authentification & Autorisation

### Architecture à double couche

Le projet utilise une **architecture d'autorisation à deux niveaux** :

#### 1. Couche TypeScript/Middleware

**Fichier** : `lib/auth/is-admin.ts`

Vérifie les **JWT claims** (`app_metadata.role` ou `user_metadata.role`).

```typescript
const claims = await supabase.auth.getClaims();
const isAdmin = await isAdminUser(claims);
```

Utilisée pour :

- Redirections serveur (middleware)
- Contrôle d'accès des pages
- Navigation conditionnelle

#### 2. Couche Database/RLS

**Fichier** : `supabase/schemas/02b_functions_core.sql`

Fonction SQL `public.is_admin()` qui vérifie `profiles.role = 'admin'`.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

Utilisée par :

- **Toutes les RLS policies** des tables admin
- Contrôle d'accès au niveau base de données
- Sécurité en profondeur (defense-in-depth)

### ⚠️ Problème courant : Admin redirect vers /login

**Symptôme** : Utilisateur connecté avec `app_metadata.role = 'admin'` mais redirigé vers `/auth/login`.

**Cause** : JWT contient le rôle admin (couche 1 OK) mais **aucun profil dans `public.profiles`** (couche 2 KO).

**Diagnostic** :

```sql
-- Vérifier le profil admin
SELECT user_id, role FROM public.profiles WHERE role = 'admin';
-- Si 0 rows → Problème !
```

**Solution** : Voir [`doc/troubleshooting-admin-auth.md`](`./troubleshooting-admin-auth.md`)

## 📁 Structure du projet

```
rougecardinalcompany/
├── app/                           # Next.js App Router
│   ├── (admin)/                   # Route group : zone admin
│   │   ├── layout.tsx             # Layout admin (sidebar, auth)
│   │   └── admin/                 # Pages /admin/*
│   ├── (marketing)/               # Route group : site public
│   │   ├── layout.tsx             # Layout public (header, footer)
│   │   └── page.tsx               # Homepage
│   ├── auth/                      # Pages authentification
│   └── api/                       # API routes
│
├── components/                    # Composants React
│   ├── features/                  # Composants métier par feature
│   │   ├── admin/                 # Composants zone admin
│   │   └── public-site/           # Composants site public
│   └── ui/                        # shadcn/ui components
│
├── lib/                           # Bibliothèques partagées
│   ├── auth/                      # Helpers auth (is-admin, etc.)
│   ├── dal/                       # Data Access Layer (queries DB)
│   └── supabase/                  # Clients Supabase
│
├── scripts/                       # Scripts utilitaires
│   ├── create-admin-user.ts       # Création admin initial
│   ├── post-reset.sh              # Post-reset automatique
│   └── test-*.ts                  # Scripts de test
│
├── supabase/                      # Configuration Supabase
│   ├── schemas/                   # Schéma déclaratif (source de vérité)
│   └── migrations/                # Migrations générées (NE PAS ÉDITER)
│
└── doc/                           # Documentation
    ├── progress.md                # Avancement du projet
    └── troubleshooting-admin-auth.md  # Guide dépannage auth
```

## 🧪 Tests & Qualité

### Linting

```bash
# Linter TypeScript/JavaScript
pnpm lint
pnpm lint:fix

# Linter Markdown
pnpm lint:md
pnpm lint:md:fix

# Tout
pnpm lint:all
```

### Tests d'intégration Email

```bash
# Tester l'envoi d'emails (Resend)
pnpm test:email

# Vérifier les logs email
pnpm test:logs

# Tester les webhooks
pnpm test:webhooks

# Tout
pnpm test:resend
```

## 🔧 Commandes utiles

### Supabase (remote)

```bash
# Linker le projet remote
pnpm dlx supabase link --project-ref YOUR_PROJECT_ID

# Status du projet
pnpm dlx supabase status

# Générer une migration (compare avec remote)
pnpm dlx supabase db diff --linked -f migration_name

# Appliquer les migrations vers remote
pnpm dlx supabase db push

# Récupérer les migrations depuis remote
pnpm dlx supabase db pull

# Créer/recréer l'admin
pnpm exec tsx scripts/create-admin-user.ts
```

### Next.js

```bash
# Dev avec Turbopack
pnpm dev

# Build production
pnpm build

# Démarrer production
pnpm start
```

## 📚 Ressources

### Documentation interne

- [Troubleshooting Admin Auth](./troubleshooting-admin-auth.md) - Résolution problèmes auth admin
- [Progress](`./progress.md`) - État d'avancement du projet
- [GitHub Copilot Instructions](../.github/copilot-instructions.md) - Règles architecture

### Documentation externe

- [Next.js 15](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🆘 Support

En cas de problème :

1. **Consulter** [`doc/troubleshooting-admin-auth.md`](./troubleshooting-admin-auth.md)
2. **Vérifier** les logs Supabase : `pnpm dlx supabase status`
3. **Reset** complet : `pnpm run db:reset`
4. **Ouvrir une issue** sur GitHub

---

**Version** : 1.0.0  
**Dernière mise à jour** : 19 novembre 2025
