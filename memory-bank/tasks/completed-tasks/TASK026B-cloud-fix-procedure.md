# TASK026B - Fix reorder_team_members sur Supabase Cloud

## 🎯 Objectif

Ajouter `SET search_path = ''` à la fonction `public.reorder_team_members(jsonb)` sur Supabase Cloud.

## ⚠️ Contexte

Le dépôt local et le Cloud ne sont pas synchronisés :

- **Cloud** : 32 migrations supplémentaires de TASK025B (Round 7-17 security audit)
- **Local** : Schéma déclaratif à jour avec la correction

## ⚠️ Contexte du Conflit de Migration

**Situation** : Le Cloud a 32 migrations supplémentaires (`20251021000001` à `20251026170000`) absentes du dépôt local.

**Cause** : Incident de sécurité du 27 octobre 2025 (voir `doc/migrations-doc/legacy-migrations/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md`) :

- Campagne RLS erronée (Rounds 1-17) appliquée directement sur Cloud
- Migrations jamais committées dans git
- **Déjà annulées** par les 5 migrations correctives du 27 octobre

**Impact** : Les 32 migrations manquantes sont obsolètes et ne doivent pas être recréées.

## 🚀 Solution : Appliquer via SQL Editor (Conforme Section 5.5)

### Étape 1 : Ouvrir SQL Editor sur Dashboard

1. Aller sur <https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv>
2. Cliquer sur "SQL Editor" dans la sidebar
3. Créer une nouvelle query

### Étape 2 : Exécuter le SQL suivant

```sql
-- Fix TASK026B: Add SET search_path to reorder_team_members
-- Issue #26: Database Functions Compliance
-- Security: Prevents schema injection attacks

create or replace function public.reorder_team_members(items jsonb)
returns void as $$
declare
  ids int[];
  ords int[];
  when_clauses text;
begin
  -- basic validation: must be a json array
  if jsonb_typeof(items) is distinct from 'array' then
    raise exception 'items must be a json array';
  end if;

  -- authorization: ensure caller is admin (defense-in-depth)
  if not (select public.is_admin()) then
    raise exception 'permission denied';
  end if;

  -- acquire a transaction-scoped advisory lock to avoid concurrent reorders
  perform pg_advisory_xact_lock(hashtext('reorder_team_members'));

  -- extract ids and ordre arrays
  ids := array(select (elem->>'id')::int from jsonb_array_elements(items) as elem);
  ords := array(select (elem->>'ordre')::int from jsonb_array_elements(items) as elem);

  if array_length(ids, 1) is null or array_length(ids, 1) = 0 then
    raise exception 'items array must not be empty';
  end if;

  -- no duplicate ids allowed
  if (select count(*) from (select unnest(ids) as v) s) <> (select count(distinct v) from (select unnest(ids) as v) s) then
    raise exception 'duplicate id in items';
  end if;

  -- no duplicate ordre allowed
  if (select count(*) from (select unnest(ords) as v) s) <> (select count(distinct v) from (select unnest(ords) as v) s) then
    raise exception 'duplicate ordre in items';
  end if;

  -- build when clauses for case expression
  select string_agg(format('when %s then %s', (elem->>'id')::int, (elem->>'ordre')::int), ' ')
  into when_clauses
  from jsonb_array_elements(items) as elem;

  if when_clauses is null or when_clauses = '' then
    raise exception 'no valid updates generated';
  end if;

  -- execute a single atomic update using case
  execute format(
    'update public.membres_equipe set ordre = case id %s end where id = any ($1)',
    when_clauses
  ) using ids;

end;
$$ language plpgsql security definer set search_path = '';

comment on function public.reorder_team_members(jsonb) is 
'Atomically reorders team members. SECURITY DEFINER with SET search_path for schema injection protection.';
```

### Étape 3 : Vérifier la correction

Exécuter cette query pour confirmer :

```sql
SELECT 
  proname as function_name,
  proconfig as settings
FROM pg_proc 
WHERE proname = 'reorder_team_members';
```

**Résultat attendu** : `settings` devrait contenir `{search_path=}`

### Étape 4 : Documenter dans migrations.md (Post-Fix Synchronization)

Ajouter dans `supabase/migrations/migrations.md` :

```markdown
## Corrections et fixes critiques

- `20251115150000_fix_reorder_team_members_search_path.sql` — **FIX TASK026B** : Add SET search_path to reorder_team_members
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/63_reorder_team_members.sql`
  - 📝 **Appliqué manuellement sur Cloud** via SQL Editor (conflit migration history)
  - 🔗 **Issue** : #26 - Database Functions Compliance
```

### Étape 5 : Marquer comme complété

Une fois exécuté sur Cloud :

- ✅ TASK026B : 100% complété (28/28 fonctions conformes)
- ✅ Issue #26 : Peut être fermée
- ✅ Schéma local déjà à jour dans `supabase/schemas/63_reorder_team_members.sql`
- ✅ Migration conservée dans le dépôt pour historique (conforme Section 5.5)

## 📊 Impact

- **Sécurité** : Protège contre injection schéma
- **Compatibilité** : Aligné avec 27 autres fonctions déjà conformes
- **Zero downtime** : Remplacement à chaud de la fonction

## 🔗 Références

- Issue #26: <https://github.com/YanBerdin/rougecardinalcompany/issues/26>
- TASK026B: `memory-bank/tasks/TASK026B-db-functions-compliance.md`
- Dashboard SQL Editor: <https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/sql/new>

## 📚 Conformité Instructions Supabase

Cette procédure suit **Section 5.5 : Hotfix Migrations and Schema Synchronization** de `.github/instructions/Declarative_Database_Schema.instructions.md` :

1. ✅ **Emergency Workflow** : Application directe via SQL Editor (Cloud)
2. ✅ **Post-Fix Synchronization** : Schéma déclaratif déjà synchronisé
3. ✅ **Documentation** : Migration conservée + notes dans migrations.md
4. ✅ **Migration Retention Policy** : Fichier gardé pour historique

**Justification** : Les 32 migrations manquantes sont issues de l'incident du 27 octobre (campagne RLS erronée déjà annulée). Plutôt que de réparer l'historique avec `migration repair`, on applique directement le fix minimal (conforme au workflow "Hotfix").
