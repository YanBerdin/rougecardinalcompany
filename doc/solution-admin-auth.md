# Solution : Admin Redirect to Login (Résolu ✅)

**Date** : 19 novembre 2025  
**Statut** : ✅ **RÉSOLU**  
**Environnement** : Supabase Remote (pas de local)

---

## 🎯 Problème Initial

**Symptôme** : Toutes les pages `/admin/*` redirigent vers `/auth/login` même si l'utilisateur est connecté avec un compte admin.

**Erreur** : RLS `42501` (insufficient_privilege) dans les logs Supabase.

---

## 🔍 Cause Racine

### Architecture d'autorisation à double couche

Le projet utilise **deux mécanismes de vérification admin** :

1. **Couche TypeScript/Middleware** (`lib/auth/is-admin.ts`)
   - Vérifie les JWT claims (`app_metadata.role` ou `user_metadata.role`)
   - Utilisée pour les redirections serveur
   - ✅ **Fonctionnait correctement**

2. **Couche Database/RLS** (`public.is_admin()` SQL function)
   - Vérifie `SELECT EXISTS (... FROM public.profiles WHERE role = 'admin')`
   - Utilisée par les RLS policies sur TOUTES les tables admin
   - ❌ **Échouait** : Aucun profil dans `public.profiles`

**Problème** : L'utilisateur existait dans `auth.users` avec les bonnes métadonnées, mais **aucune entrée correspondante dans `public.profiles`**.

---

## ✅ Solution Implémentée

### 1. Création du profil admin manuel

**Via SQL direct** (Supabase Studio → SQL Editor) :

```sql
INSERT INTO public.profiles (user_id, display_name, role)
VALUES ('902a742a-6f83-44cd-834b-4636b82966a0', 'Administrateur', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin', display_name = 'Administrateur';
```

### 2. Script automatisé pour le futur

**Script créé** : `scripts/create-admin-user.ts`

```bash
pnpm exec tsx scripts/create-admin-user.ts
```

Ce script :

- Crée ou met à jour l'utilisateur dans `auth.users`
- Configure `app_metadata.role = 'admin'` et `user_metadata.role = 'admin'`
- Crée/met à jour le profil dans `public.profiles` avec `role = 'admin'`

### 3. Trigger automatique pour les nouveaux utilisateurs

**Fichier** : `supabase/schemas/05_profiles_auto_sync.sql`

Contient un trigger qui crée automatiquement un profil dans `public.profiles` lors de l'inscription d'un nouvel utilisateur.

**Important** : Ce trigger ne s'applique qu'aux **nouveaux utilisateurs**. Les utilisateurs existants doivent être migrés manuellement.

### 4. Migration pour utilisateurs existants

**Fichier** : `supabase/migrations/20251002130000_sync_existing_profiles.sql`

Crée automatiquement les profils pour tous les utilisateurs existants dans `auth.users` qui n'ont pas encore de profil.

**IMPORTANT** : Cette migration doit s'exécuter **APRÈS** la création des tables (timestamp > 20250918000002).

---

## 📋 Procédure de Déploiement

### Déploiement initial (première fois)

```bash
# 1. Linker le projet remote
pnpm dlx supabase link --project-ref YOUR_PROJECT_ID

# 2. Pousser le schéma déclaratif (inclut le trigger)
pnpm dlx supabase db push

# 3. Créer l'utilisateur admin initial
pnpm exec tsx scripts/create-admin-user.ts

# 4. Tester l'accès admin
# - Se connecter avec les credentials affichés
# - Accéder à https://votre-domaine.com/admin
# - Devrait fonctionner sans redirection
```

### Après chaque déploiement de schéma

```bash
# Si l'admin n'existe pas ou a été supprimé
pnpm exec tsx scripts/create-admin-user.ts
```

### Vérification

**Via Supabase Studio → SQL Editor** :

```sql
-- Vérifier que le profil admin existe
SELECT 
  u.email,
  u.raw_app_meta_data->>'role' as jwt_role,
  p.role as profile_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE u.email = 'votre-email@example.com';
```

**Résultat attendu** :

| email                      | jwt_role | profile_role |
|----------------------------|----------|--------------|
| votre-email@example.com    | admin    | admin        |

Si `profile_role` est `NULL`, réexécuter le script `create-admin-user.ts`.

---

## 📁 Fichiers Modifiés/Créés

### Documentation

- ✅ `doc/troubleshooting-admin-auth.md` - Guide de dépannage complet
- ✅ `doc/guide-developpement.md` - Guide de développement (adapté remote)
- ✅ `supabase/schemas/README.md` - Documentation schéma déclaratif
- ✅ `README.md` - Quick start et procédure admin
- ✅ `doc/solution-admin-auth.md` - Ce document (résumé de la solution)

### Scripts

- ✅ `scripts/create-admin-user.ts` - Création/mise à jour admin automatique
- ✅ `scripts/sync-admin-profile.ts` - Script de synchronisation (legacy)

### Base de données

- ✅ `supabase/schemas/05_profiles_auto_sync.sql` - Trigger auto-sync profiles
- ✅ `supabase/migrations/20251002130000_sync_existing_profiles.sql` - Migration sync existants

---

## 🔐 Architecture Finale

### Schéma d'authentification

```
┌─────────────────────────────────────────────────────────┐
│                    Nouvelle inscription                  │
│                                                          │
│  User signs up → auth.users (Supabase Auth)             │
│       ↓                                                  │
│  TRIGGER: on_auth_user_created                          │
│       ↓                                                  │
│  AUTO-CREATE: public.profiles (role, display_name)      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               Vérification d'autorisation               │
│                                                          │
│  Request to /admin → Middleware                          │
│       ↓                                                  │
│  Check JWT claims (app_metadata.role = 'admin')         │
│       ↓ (OK)                                            │
│  Database query → RLS Policy                            │
│       ↓                                                  │
│  Check public.is_admin() → profiles.role = 'admin'      │
│       ↓ (OK)                                            │
│  Access granted ✅                                       │
└─────────────────────────────────────────────────────────┘
```

### Points de contrôle

1. **Middleware** : `lib/auth/is-admin.ts` → JWT claims
2. **RLS Policies** : `supabase/schemas/03_rls_policies.sql` → `public.is_admin()`
3. **SQL Function** : `supabase/schemas/02b_functions_core.sql` → `profiles.role`

**Tous les trois doivent être synchronisés** pour que l'authentification fonctionne.

---

## ⚠️ Points d'attention

### Pour le développement

1. **Toujours vérifier** que `SUPABASE_SECRET_KEY` est configuré dans `.env.local`
2. **Ne jamais éditer** directement les fichiers de migration
3. **Toujours modifier** les fichiers de schéma déclaratif dans `supabase/schemas/`
4. **Générer les migrations** via `pnpm dlx supabase db diff --linked -f nom`

### Pour le déploiement

1. **Pousser le schéma** : `pnpm dlx supabase db push`
2. **Recréer l'admin** : `pnpm exec tsx scripts/create-admin-user.ts`
3. **Vérifier** que le profil existe dans `public.profiles`
4. **Tester** l'accès aux pages `/admin`

### Pour le dépannage

1. **Consulter** `doc/troubleshooting-admin-auth.md`
2. **Vérifier** les deux couches d'authentification (JWT + profiles)
3. **Quick fix** : Insérer directement le profil via SQL
4. **Reset complet** : Réexécuter le script `create-admin-user.ts`

---

## 📚 Ressources

- [Guide de développement](./guide-developpement.md) - Setup complet du projet
- [Troubleshooting Admin Auth](./troubleshooting-admin-auth.md) - Dépannage détaillé
- [Schémas déclaratifs](../supabase/schemas/README.md) - Structure de la base
- [GitHub Copilot Instructions](../.github/copilot-instructions.md) - Règles architecture

---

**Validé par** : Tests manuels 19 novembre 2025  
**Environnement** : Supabase Remote (PostgreSQL 15)  
**Next.js** : 15.x  
**Statut** : ✅ Production-ready
