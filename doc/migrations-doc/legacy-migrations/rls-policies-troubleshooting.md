# Troubleshooting RLS Policies - Articles de Presse

## Problème rencontré (22 octobre 2025)

### Symptômes

- Vue `articles_presse_public` renvoyait un tableau vide côté client
- DAL `fetchMediaArticles()` retournait `[]` alors que 3 articles existaient en base
- Requête SQL directe (role postgres) montrait bien 3 articles publiés

### Investigation

```sql
-- ✅ Requête directe : 3 articles visibles
SELECT COUNT(*) as total FROM public.articles_presse;
-- Result: 3

-- ✅ Vue directe : 3 articles visibles
SELECT COUNT(*) as total FROM public.articles_presse_public;
-- Result: 3

-- ❌ Vue avec role anon : 0 articles visibles
SET ROLE anon;
SELECT COUNT(*) as total FROM public.articles_presse_public;
-- Result: 0 ❌
RESET ROLE;
```

### Root Cause Analysis

Le problème provenait de **deux causes combinées** :

#### 1. RLS activé sans policies appliquées

```sql
-- RLS était activé sur la table
ALTER TABLE public.articles_presse ENABLE ROW LEVEL SECURITY;

-- Mais AUCUNE policy n'existait
SELECT * FROM pg_policies WHERE tablename = 'articles_presse';
-- Result: [] (empty)
```

**Comportement PostgreSQL** : Quand RLS est activé sans policies, **PostgreSQL refuse par défaut tout accès** (principe de sécurité : "deny all by default"). C'est un comportement intentionnel pour protéger les données.

#### 2. SECURITY INVOKER sans permissions base table

La vue utilisait `SECURITY INVOKER` (bonne pratique sécurité) :

```sql
CREATE VIEW articles_presse_public
WITH (security_invoker = true)
AS SELECT * FROM articles_presse WHERE published_at IS NOT NULL;
```

Avec `SECURITY INVOKER`, **la vue s'exécute avec les privilèges de l'utilisateur qui la requête** (role `anon` dans notre cas), pas avec ceux du créateur (postgres).

Or le role `anon` n'avait pas de permission GRANT SELECT sur la table `articles_presse`.

## Solutions appliquées

### Solution 1: Application des RLS policies

**Migration** : `20251022150000_apply_articles_presse_rls_policies.sql`

```sql
-- Lecture publique des articles publiés
CREATE POLICY "Public press articles are viewable by everyone"
  ON public.articles_presse FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL);

-- Admin peut tout lire (drafts inclus)
CREATE POLICY "Admins can view all press articles"
  ON public.articles_presse FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admin peut créer/modifier/supprimer
CREATE POLICY "Admins can create press articles"
  ON public.articles_presse FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can update press articles"
  ON public.articles_presse FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can delete press articles"
  ON public.articles_presse FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));
```

**⚠️ IMPORTANT** : Cette migration était nécessaire mais **pas suffisante** seule.

### Solution 2: GRANT permissions sur table base

**Migration** : `20251022140000_grant_select_articles_presse_anon.sql`

```sql
-- Permissions base requises pour SECURITY INVOKER views
GRANT SELECT ON public.articles_presse TO anon, authenticated;
```

**Schéma déclaratif mis à jour** : `supabase/schemas/08_table_articles_presse.sql`

```sql
-- Grant base permissions on table for anon/authenticated (required for SECURITY INVOKER view)
GRANT SELECT ON public.articles_presse TO anon, authenticated;
```

### Résultat après corrections

```sql
SET ROLE anon;
SELECT COUNT(*) as total FROM public.articles_presse_public;
-- Result: 3 ✅
RESET ROLE;
```

Les articles sont maintenant visibles côté client !

## Modèle de sécurité : Defense in Depth

Le modèle appliqué combine **trois couches de sécurité** :

```
┌─────────────────────────────────────────┐
│ 1. VIEW (SECURITY INVOKER)              │
│    - Filtre WHERE published_at NOT NULL │
│    - S'exécute avec privilèges user     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ 2. GRANT PERMISSIONS                    │
│    - anon/authenticated: SELECT only    │
│    - Base access control                │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ 3. RLS POLICIES                         │
│    - Row-level filtering                │
│    - published_at IS NOT NULL           │
│    - Admin: full access                 │
└─────────────────────────────────────────┘
```

### Pourquoi cette architecture ?

1. **SECURITY INVOKER** : Empêche l'escalade de privilèges (vue ne s'exécute pas en tant que superuser)
2. **GRANT** : Contrôle d'accès de base (qui peut lire/écrire quoi)
3. **RLS** : Filtrage fin au niveau des lignes (quelles lignes sont visibles)

## Leçons apprises

### 1. SECURITY INVOKER nécessite GRANT explicite

Contrairement à `SECURITY DEFINER` (legacy pattern), `SECURITY INVOKER` ne contourne pas les permissions de base. Il faut explicitement donner les GRANT permissions.

### 2. RLS activé = deny all par défaut

Ne jamais activer RLS sans appliquer immédiatement les policies. PostgreSQL refuse tout accès par sécurité.

### 3. Tester avec le bon rôle

Toujours tester les requêtes avec `SET ROLE anon` pour simuler les utilisateurs anonymes :

```sql
-- Pattern de test RLS
SET ROLE anon;
SELECT COUNT(*) FROM ma_table;
SELECT COUNT(*) FROM ma_vue;
RESET ROLE;
```

### 4. Schéma déclaratif vs Migrations

- **Schéma déclaratif** : Source de vérité, définit l'état final désiré
- **Migrations** : Appliquent les changements sur les bases existantes
- **Co-localisation** : RLS policies dans le même fichier que la table

## Checklist de vérification RLS

Avant de merger une PR avec modifications RLS :

- [ ] RLS activé sur la table (`ENABLE ROW LEVEL SECURITY`)
- [ ] Au moins une policy définie par opération (SELECT, INSERT, UPDATE, DELETE)
- [ ] Policies testées avec `SET ROLE anon` et `SET ROLE authenticated`
- [ ] GRANT permissions explicites pour SECURITY INVOKER views
- [ ] Schéma déclaratif synchronisé avec migrations
- [ ] Documentation mise à jour (README.md, migrations.md)

## Ressources

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- `.github/instructions/Create_RLS_policies.Instructions.md`
- `supabase/schemas/README.md`
- `supabase/migrations/migrations.md`
