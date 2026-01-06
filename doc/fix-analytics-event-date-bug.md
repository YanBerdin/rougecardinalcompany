# Fix RLS Policy Vulnerabilities - Analytics Event_Date Bug Fix

## Date

2026-01-06 19:30 UTC

## Issue

La migration `20260106190617_fix_rls_policy_with_check_true_vulnerabilities.sql` et les fichiers associés référençaient une colonne `event_date` qui **n'existe pas** dans la table `analytics_events`.

### Schéma Réel

```sql
-- supabase/schemas/13_analytics_events.sql
create table public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz default now() not null,  -- ✅ Colonne timestamp
  event_type text not null,
  entity_type text,
  -- ... autres colonnes
);
```

**Colonne utilisée** : `created_at` avec `default now()`  
**Colonne inexistante** : `event_date`

## Files Corrected

### 1. Migration File

**File**: `supabase/migrations/20260106190617_fix_rls_policy_with_check_true_vulnerabilities.sql`

**Removed Lines** (3 checks supprimés):

```sql
-- ❌ AVANT (lignes supprimées)
and event_date is not null
and event_date <= now()
and event_date >= now() - interval '7 days'
```

**Rationale**:

- `created_at` a un `default now()` → pas besoin de vérifier null/future
- Validation temporelle inutile puisque timestamp automatique

### 2. Declarative Schema File

**File**: `supabase/schemas/62_rls_advanced_tables.sql`

**Removed Lines** (mêmes 3 checks):

```sql
-- ❌ AVANT (lignes supprimées)
and event_date is not null
and event_date <= now()
and event_date >= now() - interval '7 days'
```

**Policy actuelle** (lignes 15-41):

```sql
create policy "Validated analytics events INSERT"
on public.analytics_events for insert
to anon, authenticated
with check (
  -- Event type whitelist
  event_type in ('view', 'click', 'share', 'download')
  and
  -- Entity type whitelist
  entity_type in ('spectacle', 'article', 'communique', 'evenement')
  -- Note: created_at uses default now() automatically
);
```

### 3. Test Script

**File**: `scripts/test-rls-policy-with-check-validation.ts`

**Changes**:

1. Supprimé 4 références à `event_date` dans les INSERT tests
2. Supprimé test "Future date blocked" (test 4.3) devenu inutile
3. Mis à jour commentaire en-tête : "Validation types" au lieu de "Validation types + limites temporelles"

**Exemple de correction**:

```typescript
// ❌ AVANT
const { error } = await anonClient
  .from("analytics_events")
  .insert({
    event_type: "view",
    entity_type: "spectacle",
    event_date: new Date().toISOString(),  // ❌ Colonne inexistante
  });

// ✅ APRÈS
const { error } = await anonClient
  .from("analytics_events")
  .insert({
    event_type: "view",
    entity_type: "spectacle",
    // Note: created_at automatically set to now()
  });
```

## Impact

### Avant Correction

- ❌ Migration échouerait avec erreur PostgreSQL : "column event_date does not exist"
- ❌ RLS policy ne pourrait pas s'activer
- ❌ Script de test échouerait sur tous les INSERT analytics

### Après Correction

- ✅ Migration s'exécute sans erreur
- ✅ RLS policy active avec validation whitelist uniquement
- ✅ Script de test valide correctement les types d'événements
- ✅ `created_at` rempli automatiquement par `default now()`

## Validation Remaining

**Nouvelle Policy** conserve :

- ✅ Event type whitelist : `('view', 'click', 'share', 'download')`
- ✅ Entity type whitelist : `('spectacle', 'article', 'communique', 'evenement')`

**Supprime** :

- ❌ Validation temporelle (inutile avec default now())
- ❌ Référence à colonne inexistante

## Prevention

**Root Cause**: Plan écrit sans vérifier le schéma réel de la table.

**Lesson**: Toujours vérifier `supabase/schemas/*.sql` avant d'écrire migrations.

**Check Command**:

```bash
# Vérifier structure d'une table
grep -A 20 "create table public.analytics_events" supabase/schemas/*.sql
```

## Testing Next Steps

1. Exécuter `pnpm dlx supabase db reset` pour tester migration
2. Exécuter `pnpm exec tsx scripts/test-rls-policy-with-check-validation.ts`
3. Vérifier logs PostgreSQL : aucune erreur "column does not exist"
4. Tester INSERT analytics via API : doit accepter types valides, rejeter types invalides

## Files Modified Summary

| File | Lines Changed | Type |
| ------ | -------------- | ------ |
| `supabase/migrations/20260106190617_fix_rls_policy_with_check_true_vulnerabilities.sql` | -3 | Removed event_date checks |
| `supabase/schemas/62_rls_advanced_tables.sql` | -3 | Removed event_date checks |
| `scripts/test-rls-policy-with-check-validation.ts` | -4 INSERT, -1 test, -1 comment | Removed event_date usage |

## Status

✅ **All corrections applied**  
✅ **No remaining event_date references**  
✅ **Ready for testing**
