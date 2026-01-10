# 🔧 Plan de Reconstruction de la Base de Données Supabase

## 🔍 Problème Identifié

La migration principale `20250918004849_apply_declarative_schema.sql` qui devait créer toutes les tables depuis le schéma déclaratif **N'EXISTE PAS**.

### Situation Actuelle

```bash
supabase/schemas/          ✅ COMPLET (36 fichiers de schéma déclaratif)
supabase/migrations/       ⚠️  INCOMPLET (manque la migration de base)
  ├── 20250918000000_fix_spectacles_versioning_trigger.sql
  ├── 20250918031500_seed_home_hero_slides.sql  ❌ Échoue car tables n'existent pas
  ├── ... (32 autres migrations de seed/fix)
  └── ❌ MANQUE: 20250918004849_apply_declarative_schema.sql
```

### Pourquoi ça échoue

1. **Supabase db reset/push** essaie d'appliquer les migrations dans l'ordre chronologique
2. La première migration après le fix (20250918031500) est un **SEED** qui insère dans `home_hero_slides`
3. Mais la table `home_hero_slides` n'existe pas encore (elle devrait être créée par la migration manquante)
4. Résultat: `ERROR: relation "public.home_hero_slides" does not exist`

## ✅ Solution en 3 Étapes

### Étape 1: Générer la migration principale depuis le schéma déclaratif

```bash
# Arrêter Supabase local
pnpm dlx supabase stop

# Générer la migration depuis le schéma déclaratif
# Cette commande va créer une nouvelle migration avec tout le schéma
pnpm dlx supabase db diff -f apply_declarative_schema_complete

# Renommer avec le bon timestamp pour qu'elle s'exécute en premier
mv supabase/migrations/$(ls -t supabase/migrations/*.sql | head -1) \
   supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
```

**Note**: Le timestamp `20250918000002` assure qu'elle s'exécute APRÈS le fix du trigger (000000) mais AVANT tous les seeds (031500+).

### Étape 2: Tester en local

```bash
# Réinitialiser complètement la base locale
pnpm dlx supabase db reset

# Si ça passe, toutes les tables seront créées, puis les seeds appliqués
```

### Étape 3: Déployer sur le cloud

```bash
# Pousser vers Supabase Cloud
pnpm dlx supabase db push
```

## 🎯 Approche Alternative (Plus Rapide)

Si l'approche ci-dessus échoue, créer manuellement la migration :

```bash
# Créer la migration avec le bon timestamp
cat > supabase/migrations/20250918000002_apply_declarative_schema_complete.sql << 'EOF'
-- MIGRATION PRINCIPALE: Création de toutes les tables depuis le schéma déclaratif
-- Date: 2025-11-18
-- Source: supabase/schemas/*.sql

-- Cette migration reconstruit le schéma complet de la base de données
-- Elle doit s'exécuter AVANT tous les seeds de données

EOF

# Concaténer tous les fichiers de schéma dans l'ordre
for file in supabase/schemas/*.sql; do
    echo "" >> supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
    echo "-- ============================================================================" >> supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
    echo "-- SOURCE: $(basename $file)" >> supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
    echo "-- ============================================================================" >> supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
    cat "$file" >> supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
done

# Corriger les commentaires sur storage.objects (nécessite superuser)
sed -i 's/^comment on policy.*storage\.objects/-- &/' supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
```

## 📊 Ordre d'Exécution Correct

Après correction, les migrations s'exécuteront dans cet ordre:

```bash
1. 20250918000000_fix_spectacles_versioning_trigger.sql    ✅ Fix fonction
2. 20250918000002_apply_declarative_schema_complete.sql    ✅ CRÉER TOUTES LES TABLES
3. 20250918031500_seed_home_hero_slides.sql                ✅ Seed (tables existent)
4. 20250918094530_seed_core_content.sql                    ✅ Seed
5. ... (tous les autres seeds)                             ✅ Seeds
```

## 🚨 Points d'Attention

### Problèmes Potentiels

1. **storage.objects policies**: Les commentaires sur ces policies nécessitent des privilèges superuser
   - **Solution**: Commentés dans la migration (lignes préfixées par `--`)

2. **Duplications de policies**: Certaines migrations ultérieures recréent des policies
   - **Solution**: Les fichiers de schéma utilisent `drop policy if exists` avant `create policy`

3. **Ordre des dépendances**: Les fichiers de schéma sont nommés pour respecter les dépendances
   - **OK**: 01_extensions → 02_profiles → 02b_functions → ... → 62_rls_advanced

### Vérification Post-Migration

```bash
# Vérifier que toutes les tables existent
psql $DB_URL -c "\dt public.*" | wc -l
# Devrait afficher ~36 tables

# Vérifier les policies RLS
psql $DB_URL -c "SELECT schemaname, tablename, COUNT(*) FROM pg_policies WHERE schemaname='public' GROUP BY schemaname, tablename;"
# Toutes les tables doivent avoir des policies

# Tester un seed
psql $DB_URL -c "SELECT COUNT(*) FROM public.home_hero_slides;"
```

## 📝 Mise à Jour du README

Après réussite, mettre à jour `supabase/schemas/README.md`:

Pour rappel, la migration générée est `supabase/migrations/20250918000002_apply_declarative_schema_complete.sql`

## 🎉 Résultat Attendu

- ✅ Base locale reconstruite depuis zéro avec `db reset`
- ✅ Base cloud synchronisée avec `db push`
- ✅ Toutes les tables créées avec RLS
- ✅ Tous les seeds appliqués
- ✅ Site fonctionnel en local et en production

---

## 🔐 Post-Migration: Création de l'Utilisateur Admin

### ⚠️ IMPORTANT : auth.users Ne Peut Pas Être Seedé par SQL

La table `auth.users` est gérée par l'Auth API de Supabase et **ne peut pas être modifiée directement via SQL migrations**.

### Pourquoi la migration `20251119000000_seed_admin_user.sql` ne crée pas l'utilisateur ?

Cette migration contient une **protection intentionnelle** :

```sql
-- Note: Dans Supabase local, auth.users n'accepte pas INSERT direct
-- Cette partie nécessite l'utilisation de l'Admin API
-- Voir scripts/create-admin-user.ts pour la création initiale

RAISE NOTICE '⚠️  Cannot create auth.users directly via SQL migration.';
RAISE NOTICE '   Run: pnpm exec tsx scripts/create-admin-user.ts';
RETURN;
```

La migration s'exécute mais **retourne immédiatement** si aucun utilisateur n'existe, laissant `auth.users` vide.

### ✅ Solution : Utiliser le Script TypeScript

Après avoir reconstruit la base de données (local ou cloud), exécutez **manuellement** :

```bash
# Créer l'utilisateur admin via l'Admin API
pnpm exec tsx scripts/create-admin-user.ts
```

### 📋 Que fait le script ?

1. **Vérifie** si l'utilisateur `yandevformation@gmail.com` existe déjà
2. **Si existe** : Met à jour les métadonnées (`role: 'admin'`)
3. **Si n'existe pas** : Crée l'utilisateur avec :
   - Email : `yandevformation@gmail.com`
   - Password : `AdminRouge2025!` (temporaire)
   - Role : `admin` (dans `app_metadata` et `user_metadata`)
   - Email confirmé automatiquement
4. **Crée/met à jour** le profil dans `public.profiles` :
   - `display_name` : "Administrateur"
   - `role` : "admin"

### 🐛 Si le Script Échoue avec "duplicate key constraint"

Si vous obtenez l'erreur `profiles_userid_unique` :

```bash
# L'utilisateur existe dans auth.users mais le profil est incomplet
# Corriger manuellement avec SQL :
```

```sql
-- Via Supabase SQL Editor ou psql
UPDATE public.profiles 
SET display_name = 'Administrateur', 
    updated_at = now() 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'yandevformation@gmail.com'
);
```

Ou via MCP Supabase (si connecté) :

```typescript
// Dans GitHub Copilot Chat avec MCP Supabase activé
UPDATE public.profiles 
SET display_name = 'Administrateur', updated_at = now() 
WHERE user_id = '3bb6d67d-8a61-4042-9a6b-7240bca26f5f';
```

### 📊 Vérification Post-Création

```bash
# Vérifier l'utilisateur dans auth.users
pnpm dlx supabase db execute "SELECT id, email, raw_app_meta_data->>'role' as role FROM auth.users;"

# Vérifier le profil
pnpm dlx supabase db execute "SELECT user_id, display_name, role FROM public.profiles;"
```

Ou avec MCP Supabase :

```sql
-- auth.users
SELECT id, email, raw_app_meta_data->>'role' as role, email_confirmed_at 
FROM auth.users 
WHERE email = 'yandevformation@gmail.com';

-- public.profiles
SELECT user_id, display_name, role, created_at 
FROM public.profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'yandevformation@gmail.com');
```

### 🚀 Checklist Complète Post-Reset

Après un `pnpm dlx supabase db reset` :

- [ ] **1. Migrations appliquées** : Vérifier avec `pnpm dlx supabase migration list`
- [ ] **2. Tables créées** : Vérifier ~36 tables avec `\dt public.*` ou MCP
- [ ] **3. Seeds appliqués** : Vérifier `home_hero_slides`, `spectacles`, etc.
- [ ] **4. Utilisateur admin créé** : **EXÉCUTER** `pnpm exec tsx scripts/create-admin-user.ts`
- [ ] **5. Profil vérifié** : `display_name` et `role` corrects dans `public.profiles`
- [ ] **6. Connexion testée** : Login avec `yandevformation@gmail.com` / `AdminRouge2025!`
- [ ] **7. ⚠️ MOT DE PASSE CHANGÉ** : Changer le mot de passe temporaire immédiatement

### 🔑 Identifiants Admin (Par Défaut)

| Champ | Valeur |
| ------- | --------- |
| **📧 Email** | `yandevformation@gmail.com` |
| **🔒 Mot de passe** | `AdminRouge2025!` |
| **🔐 Rôle** | `admin` |
| **📝 Nom d'affichage** | `Administrateur` |

⚠️ **IMPORTANT** : Changez le mot de passe après la première connexion !

### 📚 Scripts Disponibles

- `scripts/create-admin-user.ts` — **Principal** : Crée l'utilisateur admin (à utiliser après reset)
- `scripts/sync-admin-profile.ts` — Synchronise le profil si incohérent
- `scripts/set-admin-role.ts` — Définit le rôle admin pour un utilisateur existant
- `scripts/check-admin-status.ts` — Vérifie le statut admin d'un utilisateur
- `scripts/test-admin-access.ts` — Teste les permissions admin (RLS, DAL, etc.)

### 🎯 TL;DR - Commande Rapide

```bash
# Après chaque reset de base de données
pnpm dlx supabase db reset && pnpm exec tsx scripts/create-admin-user.ts
```
