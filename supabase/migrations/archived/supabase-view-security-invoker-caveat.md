# Supabase View Security Invoker - Known Caveat

**Date**: 22 octobre 2025  
**Context**: Fix de sécurité pour la vue `articles_presse_public`

## 🚨 Problème de Sécurité Identifié

La vue `articles_presse_public` était définie avec `SECURITY DEFINER` (comportement par défaut de Supabase dans certains contextes), ce qui causait :

- Exécution des requêtes avec les privilèges du **créateur de la vue** (probablement `postgres` superuser)
- Risque d'**escalade de privilèges** involontaire
- Non-respect du **principe de moindre privilège**
- Contournement potentiel de RLS sur la table sous-jacente

## ✅ Solution Appliquée

Recréer la vue avec `SECURITY INVOKER` explicite :

```sql
create view public.articles_presse_public
with (security_invoker = true)  -- 🔐 Sécurité explicite
as
select ...
```

**Effet** : Les requêtes s'exécutent maintenant avec les privilèges de l'**utilisateur qui requête**, pas du créateur.

## ⚠️ Known Caveat : "security_invoker on views"

Selon **Declarative_Database_Schema.Instructions.md**, section "Known caveats" :

> **View ownership**
>
> - view owner and grants
> - **security invoker on views** ← Notre cas
> - materialized views

**Conséquence** : Le changement `security_invoker = true` **n'est PAS détecté** par `supabase db diff` !

## 📋 Workflow Appliqué (Conforme aux Instructions)

### 1. Mise à jour du Schéma Déclaratif ✅

**Fichier** : `supabase/schemas/08_table_articles_presse.sql`

```sql
create view public.articles_presse_public
with (security_invoker = true)
as
select ...
```

→ **Source de vérité** pour la structure de la vue

### 2. Création d'une Migration Manuelle ✅

**Fichier** : `supabase/migrations/20251022120000_fix_articles_presse_public_security_invoker.sql`

→ Nécessaire car `db diff` ne capture pas ce changement

### 3. Documentation ✅

**Fichier** : `supabase/migrations/migrations.md`

→ Explique pourquoi les deux coexistent (schéma + migration)

## 🎯 Justification de la Coexistence

**Question** : Pourquoi deux fichiers pour le même changement ?

**Réponse** :

1. **Schéma déclaratif** (`supabase/schemas/08_table_articles_presse.sql`)
   - Source de vérité
   - État final désiré
   - Utilisé pour futurs `db diff`

2. **Migration manuelle** (`supabase/migrations/20251022120000_...sql`)
   - Application immédiate sur Supabase Cloud
   - Historique des changements
   - Contourne le caveat du diff tool

## 📚 Références

- **Instructions** : `doc/copilot/Declarative_Database_Schema.Instructions.md`
- **Section** : "Known caveats" → "View ownership"
- **Pattern similaire** : Même workflow que `20251022000001_create_medias_storage_bucket.sql` (Storage bucket RLS policies)

## ✅ Validation

Pour vérifier que la vue utilise bien `SECURITY INVOKER` :

```sql
SELECT 
  viewname,
  viewowner,
  (pg_catalog.pg_get_viewdef(c.oid, true) LIKE '%security_invoker%') as has_security_invoker
FROM pg_catalog.pg_views v
JOIN pg_catalog.pg_class c ON c.relname = v.viewname
WHERE schemaname = 'public' AND viewname = 'articles_presse_public';
```

Ou via MCP Supabase :

```typescript
const { data } = await supabase.rpc('pg_get_viewdef', {
  view_oid: 'public.articles_presse_public'::regclass
});
console.log(data); // Devrait contrer "security_invoker"
```

## 🔐 Impact Sécurité

- **Avant** : Requêtes exécutées avec privilèges superuser → Risque HIGH
- **Après** : Requêtes exécutées avec privilèges utilisateur → Risque MITIGÉ
- **Accès** : Inchangé via `GRANT SELECT` explicite sur la vue
- **Conformité** : Respecte les best practices PostgreSQL et Supabase

## 📌 Takeaways

1. Toujours spécifier explicitement `with (security_invoker = true)` pour les vues publiques
2. Les changements `security_invoker` nécessitent une migration manuelle (caveat du diff tool)
3. Maintenir schéma déclaratif + migration pour cohérence totale
4. Documenter les caveats pour éviter confusion future
