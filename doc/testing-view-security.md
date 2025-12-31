# Database View Security - Testing Guide

Ce guide explique comment vérifier la sécurité des vues PostgreSQL dans le projet.

---

## 🎯 Objectif

Vérifier que toutes les vues utilisent `SECURITY INVOKER` pour garantir que :

- Les requêtes s'exécutent avec les privilèges de l'**utilisateur appelant** (pas du propriétaire de la vue)
- Les politiques RLS (Row Level Security) sont **correctement appliquées**
- Aucune escalade de privilèges ou fuite de données via les vues

---

## 🚀 Quick Start

### Prérequis

⚠️ **Fichier `.env.local` complet requis** : Les scripts utilisent T3 Env qui valide toutes les variables d'environnement au démarrage (pas seulement celles utilisées).

Assurez-vous que votre `.env.local` contient toutes les variables listées dans `.env.example`.

### Option 1 : Vérification Rapide

```bash
# Vérifier la configuration de toutes les vues
pnpm exec tsx scripts/check-views-security.ts
```

**Résultat attendu :**

✅ All views are properly configured with SECURITY INVOKER

### Option 2 : Tests Complets

```bash
# Tests de sécurité complets (4 tests)
pnpm exec tsx scripts/validate-view-security.ts
```

**Tests exécutés :**

1. ✅ Vérification du paramètre SECURITY INVOKER
2. ✅ Test d'accès anonyme (enforcement RLS)
3. ✅ Vérification exposition de données privées
4. ✅ Validation RLS sur les tables sous-jacentes

---

## 📋 Scripts Disponibles

### 1. `check-views-security.ts`

**Objectif :** Vérifier la configuration de sécurité de toutes les vues.

```bash
pnpm exec tsx scripts/check-views-security.ts
```

**Sortie :**

```
🔍 Checking views security configuration...

📋 Public Views:

✅ communiques_presse_public
   Owner: postgres
   Security: INVOKER
   Options: {security_invoker=true}

✅ All views are properly configured with SECURITY INVOKER
```

**Erreurs possibles :**

```
🚨 SECURITY DEFINER or UNKNOWN views found:

   - public.my_insecure_view
     Owner: postgres
     Options: none (defaults to DEFINER!)
```

### 2. `validate-view-security.ts`

**Objectif :** Tests de sécurité complets avec validation RLS.

```bash
pnpm exec tsx scripts/validate-view-security.ts
```

**Sortie réussie :**

```
🔒 Validating View Security Configuration
==========================================

📋 Test 1: Check view security setting...
   ✅ SECURITY INVOKER: true

📋 Test 2: Test anonymous access (RLS enforcement)...
   ✅ Counts match: true

📋 Test 3: Verify private data is not exposed...
   ✅ No private fields: true

📋 Test 4: Verify underlying tables have RLS...
   ✅ All underlying tables have RLS

📊 Test Results Summary
======================

✅ All security tests passed!
```

**Sortie avec erreurs :**

```
📊 Test Results Summary
======================

✅ View has SECURITY INVOKER
❌ Anonymous access shows only public data
   Service: 10, Anon: 12
✅ No private fields exposed
✅ All underlying tables have RLS

Total: 4 tests
Passed: 3
Failed: 1

⚠️  Some tests failed. Please review and fix security issues.
```

---

## 🔧 Résolution de Problèmes

### Problème : Vue sans SECURITY INVOKER

**Symptôme :**

```
❌ my_view
   Options: none (defaults to DEFINER!)
```

**Solution :**

1. Créer une migration :

```bash
cd supabase/migrations
touch $(date +%Y%m%d%H%M%S)_fix_my_view_security_invoker.sql
```

2. Contenu de la migration :

```sql
drop view if exists public.my_view cascade;

create or replace view public.my_view
with (security_invoker = true)  -- ✅ AJOUT OBLIGATOIRE
as
select ...;

comment on view public.my_view is 
'Description. SECURITY INVOKER: Runs with querying user privileges.';

grant select on public.my_view to anon, authenticated;
```

3. Appliquer la migration :

```bash
pnpm dlx supabase db push
```

4. Vérifier :

```bash
pnpm exec tsx scripts/validate-view-security.ts
```

### Problème : RLS non activé sur table sous-jacente

**Symptôme :**

```
❌ my_table: false
```

**Solution :**

```sql
alter table public.my_table enable row level security;

-- Puis créer les politiques appropriées
create policy "anon_read_public"
on public.my_table for select
to anon, authenticated
using (public = true);
```

### Problème : Données privées exposées

**Symptôme :**

⚠️  Warning: Private fields detected in view!

**Solution :**

Modifier la vue pour exclure les champs privés :

```sql
-- ❌ AVANT
select * from users;

-- ✅ APRÈS
select id, name, avatar  -- Uniquement les champs publics
from users
where public = true;  -- Filtrage supplémentaire
```

---

## 🛡️ Protection Préventive

### Pre-commit Hook

Activer le hook pour bloquer les commits avec des vues non sécurisées :

```bash
chmod +x .git/hooks/pre-commit-view-security
```

**Test du hook :**

```bash
# Créer un fichier SQL de test
cat > test.sql <<EOF
create view insecure_view as select * from users;
EOF

git add test.sql
git commit -m "test"

# Résultat attendu :
# ❌ SECURITY ISSUE: Views without explicit SECURITY INVOKER found
```

### CI/CD (À venir)

Ajouter à `.github/workflows/security.yml` :

```yaml
- name: Check Database View Security
  run: pnpm exec tsx scripts/check-views-security.ts
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

- **Guide de sécurité :** `doc/database-view-security-guide.md`
- **Rapport d'audit :** `doc/security-audit-views-2025-12-31.md`
- **Migration exemple :** `supabase/migrations/20251231000000_fix_communiques_presse_public_security_invoker.sql`

---

## ❓ FAQ

### Pourquoi SECURITY INVOKER est-il important ?

**SECURITY DEFINER** (par défaut) exécute les requêtes avec les privilèges du **propriétaire de la vue**, ce qui :

- Contourne les politiques RLS
- Peut exposer des données sensibles
- Crée un risque d'escalade de privilèges

**SECURITY INVOKER** exécute les requêtes avec les privilèges de l'**utilisateur appelant**, ce qui :

- ✅ Applique correctement les politiques RLS
- ✅ Respecte les permissions de l'utilisateur
- ✅ Évite les fuites de données

### Toutes les vues doivent-elles utiliser SECURITY INVOKER ?

**Oui**, dans ce projet, **toutes** les vues doivent utiliser `WITH (security_invoker = true)` explicitement.

**Exception :** Aucune exception n'est autorisée pour les vues. Si des privilèges élevés sont nécessaires, utiliser une **fonction SECURITY DEFINER** avec validation explicite de l'appelant.

### Comment vérifier une seule vue ?

```sql
select 
  c.relname as view_name,
  c.reloptions::text as options
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' 
  and c.relname = 'ma_vue';
```

**Résultat attendu :**

```
view_name | options
----------|---------------------------
ma_vue    | {security_invoker=true}
```

### Que faire en cas de doute ?

1. Exécuter les scripts de validation
2. Consulter la documentation (`doc/database-view-security-guide.md`)
3. Demander une revue de sécurité avant de merger

---

## 🎓 Ressources Externes

- [PostgreSQL Views Documentation](https://www.postgresql.org/docs/current/sql-createview.html)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Dernière mise à jour :** 2025-12-31  
**Mainteneur :** Équipe de développement
