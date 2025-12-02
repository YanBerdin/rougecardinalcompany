# Dépannage : Authentification Admin

## Problème : "Toutes les pages /admin me renvoient vers /auth/login"

### Symptômes

- L'utilisateur est connecté avec un compte ayant `app_metadata.role = 'admin'`
- JWT contient les bonnes claims (vérifiable via middleware)
- Mais l'accès aux pages `/admin/*` redirige systématiquement vers `/auth/login`
- Erreur RLS `42501` (insufficient_privilege) dans les logs

### Cause racine

**Architecture d'autorisation à double couche** :

1. **Couche TypeScript/Middleware** (`lib/auth/is-admin.ts`)
   - Vérifie les JWT claims (`app_metadata.role` ou `user_metadata.role`)
   - Utilisée pour les redirections côté serveur
   - **✅ Peut être OK** même si la couche 2 échoue

2. **Couche Database/RLS** (`public.is_admin()` SQL function)
   - Vérifie `SELECT EXISTS (... FROM public.profiles WHERE role = 'admin')`
   - Utilisée par les RLS policies sur TOUTES les tables admin
   - **❌ Échoue** si aucun profil n'existe dans `public.profiles`

**Problème** : L'utilisateur existe dans `auth.users` avec les bonnes métadonnées, mais **aucune entrée correspondante dans `public.profiles`**.

### Diagnostic

**Via Supabase Studio (Dashboard remote)** :

1. Aller dans **Database → SQL Editor**
2. Exécuter les requêtes suivantes :

```sql
-- 1. Vérifier que l'utilisateur existe dans auth.users
SELECT id, email, 
       raw_app_meta_data->>'role' as app_role,
       raw_user_meta_data->>'role' as user_role
FROM auth.users 
WHERE email = 'votre-email@example.com';

-- 2. Vérifier le profil dans public.profiles
SELECT user_id, role, display_name 
FROM public.profiles 
WHERE user_id = 'UUID-DE-L-UTILISATEUR';

-- 3. Tester is_admin() avec l'UUID
SET request.jwt.claims = '{"sub": "UUID-DE-L-UTILISATEUR"}';
SELECT public.is_admin(); -- Doit retourner 't' (true)
```

**Résultat attendu** :

- ✅ Utilisateur existe dans `auth.users` avec `app_role = 'admin'`
- ❌ **AUCUN profil dans `public.profiles`** (0 rows)
- ❌ `is_admin()` retourne `false`

### Solution

#### Option 1 : Script SQL rapide (urgence)

**Via Supabase Studio → SQL Editor** :

```sql
-- Insertion directe du profil admin (bypass RLS)
INSERT INTO public.profiles (user_id, display_name, role)
VALUES ('UUID-DE-VOTRE-ADMIN', 'Administrateur', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin', display_name = 'Administrateur';
```

**ℹ️ Remplacez `UUID-DE-VOTRE-ADMIN` par l'UUID de votre utilisateur** (visible dans auth.users ou via Authentication → Users dans le dashboard).

#### Option 2 : Script TypeScript (après db reset)

```bash
# Créer/mettre à jour l'utilisateur admin + profil
pnpm exec tsx scripts/create-admin-user.ts
```

Ce script :

1. Vérifie si l'utilisateur existe
2. Met à jour `app_metadata.role` et `user_metadata.role`
3. Crée/met à jour le profil dans `public.profiles`
4. Vérifie que tout fonctionne

#### Option 3 : Trigger automatique (recommandé pour le futur)

**Le schéma déclaratif** (`supabase/schemas/05_profiles_auto_sync.sql`) contient un trigger qui crée automatiquement un profil lors de l'inscription d'un nouvel utilisateur.

**Pour l'appliquer sur la base remote** :

```bash
# Pusher le schéma déclaratif vers remote
pnpm dlx supabase db push
```

**Note** : Ce trigger ne s'applique qu'aux **nouveaux utilisateurs**. Les utilisateurs existants doivent être migrés manuellement (Option 1 ou 2).

### Procédure pour base remote (production/staging)

**Après déploiement d'un nouveau schéma** ou si l'admin n'existe pas :

```bash
# 1. Vérifier que SUPABASE_SECRET_KEY est configuré dans .env.local
# 2. Exécuter le script de création admin
pnpm exec tsx scripts/create-admin-user.ts

# 3. Logout/Login dans l'application
# - Obtenir un nouveau JWT avec app_metadata.role = 'admin'

# 4. Accéder aux pages admin
# - https://votre-domaine.com/admin devrait maintenant fonctionner
```

**⚠️ IMPORTANT** : Le script `create-admin-user.ts` se connecte à la base **configurée dans `.env.local`**. Vérifiez que :

- `NEXT_PUBLIC_SUPABASE_URL` pointe vers votre projet remote
- `SUPABASE_SECRET_KEY` contient la **service role key** (Admin API)

### Vérification finale

**Via Supabase Studio → SQL Editor** :

```sql
-- Tester l'authentification admin
SELECT 
  u.email,
  u.raw_app_meta_data->>'role' as jwt_role,
  p.role as profile_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE u.email = 'votre-email@example.com';
```

**Résultat attendu** :

```bash
         email          | jwt_role | profile_role 
------------------------+----------+--------------
 votre-email@example.com | admin    | admin
```

Si `profile_role` est `NULL`, répétez Option 1 ou 2.

### Prévention

Pour éviter ce problème à l'avenir :

1. ✅ **Trigger de synchronisation** : Le schéma déclaratif (`supabase/schemas/05_profiles_auto_sync.sql`) contient un trigger qui crée automatiquement un profil pour chaque nouvel utilisateur
2. ✅ **Migration sync existants** : La migration `20251002130000_sync_existing_profiles.sql` crée les profils pour les utilisateurs existants lors du déploiement
3. **Documentation CI/CD** : Ajouter `pnpm exec tsx scripts/create-admin-user.ts` dans le pipeline de déploiement si nécessaire

### Ressources

- **Code is_admin() TypeScript** : `lib/auth/is-admin.ts`
- **Code is_admin() SQL** : `supabase/schemas/02b_functions_core.sql`
- **Migration sync profiles** : `supabase/migrations/20251002130000_sync_existing_profiles.sql`
- **Script création admin** : `scripts/create-admin-user.ts`
- **Architecture guide** : `.github/copilot-instructions.md` (section "Database Security")

---

**Dernière mise à jour** : 19 novembre 2025  
**Version Supabase** : Remote (PostgreSQL 15)  
**Next.js** : 15.x  
**Mode** : Production/Staging (pas de Supabase local)
