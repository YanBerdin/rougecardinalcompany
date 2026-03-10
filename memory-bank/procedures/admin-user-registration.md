# Procédure d'Enregistrement Administrateur

**Date de création** : 16 novembre 2025  
**Dernière mise à jour** : 16 novembre 2025  
**Auteur** : YanBerdin  
**Statut** : Production-ready

---

## Vue d'ensemble

Cette procédure décrit comment créer un nouvel utilisateur administrateur dans l'application Rouge Cardinal Company. Les utilisateurs admin ont accès au backoffice et peuvent effectuer toutes les opérations CRUD sur le contenu.

**Contexte** : Le système d'autorisation utilise une fonction PostgreSQL `is_admin()` qui vérifie la présence d'une entrée dans la table `profiles` avec `role='admin'`. Sans cette entrée, même un utilisateur authentifié ne peut pas effectuer d'opérations d'administration.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- [x] Accès au Supabase Dashboard du projet
- [x] Rôle suffisant pour exécuter des requêtes SQL (Database → SQL Editor)
- [x] UUID de l'utilisateur à promouvoir (disponible dans Auth → Users)

---

## Étapes Détaillées

### 1. Création du Compte Utilisateur

L'utilisateur doit d'abord créer un compte via l'interface standard de l'application.

**Méthode A : Via l'application (recommandé)** :

1. Ouvrir `/auth/sign-up` dans l'application
2. Remplir le formulaire d'inscription
3. Confirmer l'email via le lien reçu

**Méthode B : Via Supabase Dashboard** :

1. Aller dans **Authentication** → **Users**
2. Cliquer sur **Add user** → **Create new user**
3. Remplir les informations (email, mot de passe temporaire)
4. Option : Cocher **Auto Confirm User** pour éviter la vérification email

**Résultat** : L'utilisateur apparaît dans la table `auth.users` avec un UUID unique.

---

### 2. Récupération de l'UUID Utilisateur

**Via Supabase Dashboard** :

1. Aller dans **Authentication** → **Users**
2. Rechercher l'utilisateur par email
3. Cliquer sur l'utilisateur pour voir ses détails
4. Copier l'UUID (format : `4ea792b9-4cd9-4363-98aa-641fad96ee16`)

**Via SQL Editor** :

```sql
-- Trouver l'UUID par email
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'utilisateur@example.com';
```

**⚠️ Note importante** : Copier l'UUID complet avec soin. Une erreur dans l'UUID empêchera l'autorisation admin.

---

### 3. Création de l'Entrée Profile Admin

**Méthode** : Exécuter la requête SQL suivante dans **Database** → **SQL Editor**

```sql
-- Créer ou mettre à jour le profile avec le rôle admin
INSERT INTO public.profiles (user_id, role, display_name)
VALUES (
  '4ea792b9-4cd9-4363-98aa-641fad96ee16',  -- Remplacer par l'UUID réel
  'admin',                                   -- Rôle admin
  'Prénom Nom'                              -- Nom d'affichage (optionnel)
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = now();
```

**Paramètres à personnaliser** :

- `user_id` : UUID de l'utilisateur à promouvoir (OBLIGATOIRE)
- `role` : Toujours `'admin'` pour les administrateurs
- `display_name` : Nom d'affichage (optionnel, peut être NULL)

**Comportement ON CONFLICT** :

- Si l'utilisateur a déjà un profile → Met à jour le rôle vers 'admin'
- Si l'utilisateur n'a pas de profile → Crée une nouvelle entrée

**Résultat attendu** :

```bash
INSERT 0 1
-- ou --
UPDATE 1
```

---

### 4. Vérification du Statut Admin

#### **Étape 4.1 : Vérifier l'entrée profile**

```sql
-- Vérifier que le profile existe avec le bon rôle
SELECT 
  id, 
  user_id, 
  display_name, 
  role, 
  created_at, 
  updated_at 
FROM public.profiles 
WHERE user_id = '4ea792b9-4cd9-4363-98aa-641fad96ee16';
```

**Résultat attendu** :

| id | user_id | display_name | role | created_at | updated_at |
| ---- | --------- | -------------- | ------ | ------------ | ------------ |
| 123 | 4ea792b9... | Prénom Nom | admin | 2025-11-16 10:30:00 | 2025-11-16 10:30:00 |

---

#### **Étape 4.2 : Tester la fonction is_admin()**

⚠️ **IMPORTANT** : Cette requête doit être exécutée **depuis l'application**, PAS depuis le SQL Editor du Dashboard.

**Pourquoi ?** Le SQL Editor Supabase utilise le rôle `service_role` qui n'a pas de contexte utilisateur. La fonction `auth.uid()` retourne NULL dans cet environnement.

**Méthode correcte** : Créer un script de test ou utiliser la console browser

**Script de test** (créer dans `scripts/verify-admin-status.ts`) :

```typescript
import { createClient } from '@/supabase/server';

async function verifyAdminStatus() {
  const supabase = await createClient();
  
  // Vérifier l'authentification
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('❌ Utilisateur non authentifié');
    return;
  }
  
  console.log('✅ Utilisateur authentifié:', user.email);
  console.log('📝 UUID:', user.id);
  
  // Tester is_admin()
  const { data, error } = await supabase
    .rpc('is_admin');
  
  if (error) {
    console.error('❌ Erreur lors du test is_admin():', error);
    return;
  }
  
  console.log('🔐 Résultat is_admin():', data ? '✅ TRUE (Admin)' : '❌ FALSE (Non-admin)');
}

verifyAdminStatus();
```

**Exécution** :

```bash
pnpm exec tsx scripts/verify-admin-status.ts
```

**Résultat attendu** :

```bash
✅ Utilisateur authentifié: utilisateur@example.com
📝 UUID: 4ea792b9-4cd9-4363-98aa-641fad96ee16
🔐 Résultat is_admin(): ✅ TRUE (Admin)
```

---

### 5. Test des Opérations CRUD Admin

**Étape finale** : Tester une opération CRUD depuis l'application

**Méthode** : Tenter de créer un nouveau spectacle dans le backoffice

1. Se connecter à l'application avec le compte admin
2. Naviguer vers `/admin/spectacles`
3. Cliquer sur "Créer un spectacle"
4. Remplir le formulaire et soumettre

**Résultat attendu** :

- ✅ **Succès** : Le spectacle est créé → Admin correctement configuré
- ❌ **Erreur 42501 (RLS)** : Vérifier les étapes précédentes

---

## Architecture Technique

### Modèle de Sécurité

**Couches de sécurité** (defense in depth) :

1. **Application-level** : Routes protégées par middleware (`middleware.ts`)
2. **API-level** : Wrapper `withAdminAuth()` pour les endpoints
3. **Database-level** : Politiques RLS avec `is_admin()`

### Fonction is_admin()

**Définition** (fichier `supabase/schemas/41_is_admin.sql`) :

```sql
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  user_role text;
begin
  select role 
  into user_role 
  from public.profiles 
  where user_id = auth.uid();
  
  return user_role = 'admin';
end;
$$;
```

**Caractéristiques** :

- **SECURITY DEFINER** : Exécutée avec les privilèges du propriétaire (permet de lire `profiles`)
- **STABLE** : Résultat constant pendant une transaction (optimisation)
- **search_path = ''** : Protection contre l'injection de schéma

### Politique RLS (Exemple : table spectacles)

**Politique pour INSERT** :

```sql
create policy "Authenticated users can create spectacles"
on public.spectacles
for insert
to authenticated
with check ( (select public.is_admin()) = true );
```

**Explication** :

- `for insert` : S'applique aux opérations CREATE
- `to authenticated` : Utilisateurs authentifiés seulement
- `with check ( ... )` : Condition de validation
- `(select public.is_admin()) = true` : Seuls les admins peuvent insérer

---

## Dépannage

### Problème : Erreur 42501 "row-level security policy violation"

**Cause possible 1** : Profile absent ou rôle incorrect

**Solution** :

```sql
-- Vérifier l'existence du profile
SELECT * FROM public.profiles WHERE user_id = 'UUID_UTILISATEUR';

-- Si absent, créer
INSERT INTO public.profiles (user_id, role) 
VALUES ('UUID_UTILISATEUR', 'admin');

-- Si rôle incorrect, mettre à jour
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = 'UUID_UTILISATEUR';
```

---

**Cause possible 2** : UUID incorrect dans le profile

**Solution** :

```sql
-- Vérifier la correspondance auth.users ↔ profiles
SELECT 
  u.id as auth_uuid,
  u.email,
  p.user_id as profile_uuid,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'utilisateur@example.com';

-- Si profile_uuid est NULL ou différent → Recréer
DELETE FROM public.profiles WHERE user_id = 'MAUVAIS_UUID';
INSERT INTO public.profiles (user_id, role) 
VALUES ('BON_UUID', 'admin');
```

---

**Cause possible 3** : Fonction is_admin() ne retourne pas true

**Diagnostic** :

```sql
-- Test manuel (depuis application, pas SQL Editor)
SELECT public.is_admin();  -- Doit retourner TRUE

-- Vérifier auth.uid() (depuis application)
SELECT auth.uid();  -- Doit retourner l'UUID de l'utilisateur connecté
```

**⚠️ Rappel** : Le SQL Editor Dashboard retourne NULL pour `auth.uid()` car il n'a pas de contexte utilisateur.

---

### Problème : is_admin() retourne FALSE alors que le profile existe

**Cause possible** : Cache PostgreSQL ou mauvaise session

**Solution** :

1. Se déconnecter de l'application
2. Vider les cookies (ou utiliser navigation privée)
3. Se reconnecter avec le compte admin
4. Réessayer l'opération CRUD

---

### Problème : Cannot read property 'id' of undefined

**Cause** : Utilisateur non authentifié dans l'application

**Solution** :

```typescript
// Vérifier l'authentification avant is_admin()
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  return { success: false, error: 'Non authentifié', status: 401 };
}

// Maintenant on peut appeler is_admin()
const { data: isAdmin } = await supabase.rpc('is_admin');
```

---

## Points d'Attention Sécurité

### ⚠️ Privilèges Élevés

- Un admin peut modifier **tout le contenu** de l'application
- Un admin peut promouvoir d'autres utilisateurs en admin (via SQL)
- **Recommandation** : Limiter le nombre d'admins (principe du moindre privilège)

### 🔐 Traçabilité

- Toutes les opérations admin sont tracées via `created_by` et `updated_by`
- **TODO** : Implémenter un audit log des actions admin (TASK032)

### 🚫 Révocation de Droits

**Pour retirer les droits admin** :

```sql
-- Rétrograder un admin en utilisateur standard
UPDATE public.profiles 
SET 
  role = 'user',
  updated_at = now()
WHERE user_id = 'UUID_UTILISATEUR';
```

**Effet immédiat** : L'utilisateur perd l'accès admin dès la prochaine vérification `is_admin()`.

---

## Références

### Fichiers du Projet

- **Schéma profiles** : `supabase/schemas/02_table_profiles.sql`
- **Fonction is_admin()** : `supabase/schemas/41_is_admin.sql`
- **Politiques RLS** : `supabase/schemas/61_rls_main_tables.sql`
- **Middleware auth** : `middleware.ts`
- **API helpers** : `lib/api/helpers.ts` (fonction `withAdminAuth`)

### Documentation

- **Memory Bank** : `memory-bank/activeContext.md` (architecture admin)
- **Instructions** : `.github/instructions/Create-RLS-policies.instructions.md`
- **Copilot Guide** : `.github/copilot-instructions.md` (section Security)

### Commits Pertinents

- **96c32f3** : "fix(dal): preserve Supabase client auth context + add RLS policy migration"
- **Création procédure** : Ce document (16 novembre 2025)

---

## Changelog

### 2025-11-16

- ✅ **Création** : Version initiale basée sur TASK021 root cause discovery
- 📝 **Contexte** : Résolution erreur RLS 42501 (missing admin profile)
- 🎯 **Objectif** : Procédure reproductible pour futurs admins

---

**Auteur** : YanBerdin  
**Dernière révision** : 16 novembre 2025, 17:00 UTC  
**Statut** : Production-ready ✅
