# Plan TASK053 - Data Retention Automation

## 📋 Vue d'ensemble

**Objectif**: Automatiser la purge des données sensibles/volumineuses selon les règles de rétention RGPD et optimiser la performance de la base de données.

**Priorité**: P1 (Important)

**Statut**: ✅ Completed

**Estimation**: 1-2 jours

**Dernière mise à jour**: 2026-01-18

---

## ⚠️ Notes importantes (Contexte actuel)

> **✅ Implémentation complète (2026-01-18) :**
>
> - ✅ `data_retention_config` — Table de configuration centralisée (5 tables configurées)
> - ✅ `data_retention_audit` — Table d'historique des purges
> - ✅ `cleanup_expired_data(text)` — Fonction générique de purge
> - ✅ `cleanup_unsubscribed_newsletter()` — Purge spécifique newsletter
> - ✅ `cleanup_old_contact_messages()` — Purge messages contact
> - ✅ `check_retention_health()` — Health check pour monitoring
> - ✅ **Edge Function `scheduled-cleanup`** — Première Edge Function du projet (Deno)
> - ✅ **pg_cron job configuré** — Daily 2:00 AM UTC (Job ID: 1)
>
> **4 Migrations appliquées :**
>
> - `20260117234007_task053_data_retention.sql` — Tables + fonctions + vues
> - `20260118004644_seed_data_retention_config.sql` — Configuration initiale
> - `20260118010000_restore_insert_policies_dropped_by_task053.sql` — Fix INSERT policies
> - `20260118012000_fix_security_definer_views_and_merge_policies.sql` — Fix SECURITY INVOKER

---

## 🎯 Objectifs spécifiques

1. **Automatiser la purge des logs d'audit** (rétention 90 jours par défaut)
2. **Automatiser la purge des désabonnements newsletter** (rétention 90 jours)
3. **Archivage/purge des messages contact** (rétention configurable)
4. **Système de monitoring et alertes** pour les jobs de purge
5. **Documentation RGPD** des politiques de rétention

---

## 📊 Analyse de l'existant

### Tables concernées et leurs règles

| Table | Colonne Date | Rétention Actuelle | Règle Cible | Volume Estimé | Impact RGPD |
|-------|-------------|-------------------|-------------|---------------|-------------|
| `logs_audit` | `expires_at` | ✅ 90 jours (configuré) | 90 jours | Élevé (logs continus) | Moyen (peut contenir données perso) |
| `abonnes_newsletter` | `unsubscribed_at` | ❌ Non automatisé | 90 jours après désinscription | Faible | Élevé (email = donnée perso) |
| `messages_contact` | `created_at` | ❌ Non automatisé | 1 an (configurable) | Moyen | Élevé (données perso complètes) |
| `analytics_events` | `created_at` | ❌ Non automatisé | 90 jours (optionnel) | Élevé | Faible (données anonymisées) |

### État des fonctions existantes

```sql
-- ✅ Déjà implémentée (supabase/schemas/20_audit_logs_retention.sql)
public.cleanup_expired_audit_logs() RETURNS integer
-- Purge basée sur expires_at < now()
-- SECURITY DEFINER pour bypass RLS
-- GRANT EXECUTE TO authenticated
```

**Script de test existant**: `scripts/test-retention-cloud.ts` (validation Supabase Cloud)

### Fonctions à créer

| Fonction | Description | Statut |
|----------|-------------|--------|
| `cleanup_expired_data(text)` | Purge générique basée sur config | ❌ À créer |
| `cleanup_unsubscribed_newsletter()` | Purge désabonnements newsletter | ❌ À créer |
| `cleanup_old_contact_messages()` | Purge messages contact traités | ❌ À créer |
| `check_retention_health()` | Health check pour alertes | ❌ À créer |

---

## 🏗️ Architecture de la solution

### 1. Extension du système de rétention

```
┌─────────────────────────────────────────┐
│  Supabase Scheduled Functions (Cron)   │
│  (Edge Function ou pg_cron)             │
└──────────────┬──────────────────────────┘
               │
               ├─────► cleanup_expired_audit_logs() [existant]
               │
               ├─────► cleanup_unsubscribed_newsletter()
               │
               ├─────► cleanup_old_contact_messages()
               │
               └─────► cleanup_old_analytics_events() [optionnel]
                       
┌─────────────────────────────────────────┐
│  Table: data_retention_config           │
│  (configuration centralisée)            │
└─────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────┐
│  Table: data_retention_audit            │
│  (logs des purges effectuées)           │
└─────────────────────────────────────────┘
```

---

## 📝 Implémentation détaillée

### Phase 1: Tables de configuration et audit

#### 1.1 Table de configuration centralisée

**Fichier**: `supabase/schemas/21_data_retention_tables.sql`

> **Note**: Nommé `21_` pour s'exécuter après `20_audit_logs_retention.sql` (dépendance logique)

```sql
-- Table de configuration des politiques de rétention
drop table if exists public.data_retention_config cascade;
create table public.data_retention_config (
  id bigint generated always as identity primary key,
  table_name text not null unique,
  retention_days integer not null check (retention_days > 0),
  date_column text not null, -- Nom de la colonne de date à vérifier
  enabled boolean not null default true,
  last_run_at timestamptz,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint valid_table_name check (table_name ~ '^[a-z_]+$')
);

comment on table public.data_retention_config is 
'Configuration centralisée des politiques de rétention de données';

comment on column public.data_retention_config.date_column is 
'Nom de la colonne utilisée pour calculer l''expiration (ex: created_at, unsubscribed_at)';

-- Index pour recherche rapide par table
create index idx_data_retention_config_table on public.data_retention_config(table_name);
create index idx_data_retention_config_enabled on public.data_retention_config(enabled) where enabled = true;

-- RLS: Admin-only
alter table public.data_retention_config enable row level security;

create policy "Admins can manage retention config"
on public.data_retention_config
for all
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- Seed configuration initiale
insert into public.data_retention_config (table_name, retention_days, date_column, description) values
  ('logs_audit', 90, 'expires_at', 'Logs d''audit - rétention RGPD'),
  ('abonnes_newsletter', 90, 'unsubscribed_at', 'Désabonnements newsletter - rétention RGPD'),
  ('messages_contact', 365, 'created_at', 'Messages contact - rétention légale 1 an'),
  ('analytics_events', 90, 'created_at', 'Événements analytics - optimisation performance')
on conflict (table_name) do nothing;
```

#### 1.2 Table d'audit des purges

```sql
-- Table de logs des opérations de purge
drop table if exists public.data_retention_audit cascade;
create table public.data_retention_audit (
  id bigint generated always as identity primary key,
  table_name text not null,
  rows_deleted integer not null default 0,
  execution_time_ms integer,
  error_message text,
  status text not null check (status in ('success', 'partial', 'failed')),
  executed_at timestamptz default now() not null,
  metadata jsonb default '{}'::jsonb
);

comment on table public.data_retention_audit is 
'Historique des opérations de purge automatique';

-- Index pour monitoring
create index idx_retention_audit_table on public.data_retention_audit(table_name, executed_at desc);
create index idx_retention_audit_status on public.data_retention_audit(status, executed_at desc);

-- RLS: Admin-only
alter table public.data_retention_audit enable row level security;

create policy "Admins can view retention audit"
on public.data_retention_audit
for select
to authenticated
using ( (select public.is_admin()) );
```

### Phase 2: Fonctions de purge

#### 2.1 Fonction générique de purge

**Fichier**: `supabase/schemas/22_data_retention_functions.sql`

```sql
/*
 * Fonction générique de purge basée sur la configuration
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Doit supprimer des données indépendamment des RLS policies
 *   2. Appelée par scheduled jobs (pas de contexte utilisateur)
 *   3. Audit trail complet de chaque exécution
 * 
 * Risks Evaluated:
 *   - Authorization: Fonction appelée uniquement par système (pg_cron/Edge Function)
 *   - Input validation: Validation stricte du nom de table (whitelist via config)
 *   - Data integrity: Transaction atomique avec rollback sur erreur
 */
create or replace function public.cleanup_expired_data(p_table_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_config record;
  v_deleted_count integer := 0;
  v_start_time timestamptz;
  v_execution_time_ms integer;
  v_sql text;
  v_error_msg text;
  v_status text := 'success';
begin
  v_start_time := clock_timestamp();
  
  -- Récupérer la configuration pour cette table
  select * into v_config
  from public.data_retention_config
  where table_name = p_table_name and enabled = true;
  
  if not found then
    raise exception 'No active retention config found for table: %', p_table_name;
  end if;
  
  -- Construction de la requête DELETE dynamique
  v_sql := format(
    'delete from public.%I where %I < now() - interval ''%s days''',
    v_config.table_name,
    v_config.date_column,
    v_config.retention_days
  );
  
  begin
    -- Exécution de la purge
    execute v_sql;
    get diagnostics v_deleted_count = row_count;
    
    -- Mise à jour de la dernière exécution
    update public.data_retention_config
    set last_run_at = now()
    where table_name = p_table_name;
    
  exception when others then
    v_status := 'failed';
    v_error_msg := sqlerrm;
    v_deleted_count := 0;
  end;
  
  -- Calcul du temps d'exécution
  v_execution_time_ms := extract(milliseconds from clock_timestamp() - v_start_time)::integer;
  
  -- Insertion dans l'audit trail
  insert into public.data_retention_audit (
    table_name, rows_deleted, execution_time_ms, error_message, status
  ) values (
    p_table_name, v_deleted_count, v_execution_time_ms, v_error_msg, v_status
  );
  
  return jsonb_build_object(
    'table', p_table_name,
    'deleted', v_deleted_count,
    'execution_time_ms', v_execution_time_ms,
    'status', v_status,
    'error', v_error_msg
  );
end;
$$;

grant execute on function public.cleanup_expired_data(text) to service_role;

comment on function public.cleanup_expired_data(text) is 
'Purge générique des données expirées basée sur data_retention_config. 
SECURITY DEFINER: bypass RLS pour purge système.';
```

#### 2.2 Fonctions spécifiques avec logique métier

```sql
-- Newsletter: purge uniquement les désabonnements
create or replace function public.cleanup_unsubscribed_newsletter()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted_count integer := 0;
  v_retention_days integer;
begin
  -- Récupérer la rétention configurée
  select retention_days into v_retention_days
  from public.data_retention_config
  where table_name = 'abonnes_newsletter' and enabled = true;
  
  if not found then
    raise exception 'Retention config not found for abonnes_newsletter';
  end if;
  
  -- Supprimer UNIQUEMENT les désabonnements expirés
  delete from public.abonnes_newsletter
  where subscribed = false
    and unsubscribed_at is not null
    and unsubscribed_at < now() - make_interval(days => v_retention_days);
  
  get diagnostics v_deleted_count = row_count;
  
  -- Audit
  insert into public.data_retention_audit (table_name, rows_deleted, status)
  values ('abonnes_newsletter', v_deleted_count, 'success');
  
  return jsonb_build_object('deleted', v_deleted_count);
end;
$$;

grant execute on function public.cleanup_unsubscribed_newsletter() to service_role;

-- Messages contact: archivage avant suppression (optionnel)
create or replace function public.cleanup_old_contact_messages()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted_count integer := 0;
  v_archived_count integer := 0;
  v_retention_days integer;
begin
  select retention_days into v_retention_days
  from public.data_retention_config
  where table_name = 'messages_contact' and enabled = true;
  
  if not found then
    raise exception 'Retention config not found for messages_contact';
  end if;
  
  -- Option 1: Suppression directe
  delete from public.messages_contact
  where created_at < now() - make_interval(days => v_retention_days)
    and status in ('traite', 'archive', 'spam');
  
  get diagnostics v_deleted_count = row_count;
  
  -- Audit
  insert into public.data_retention_audit (table_name, rows_deleted, status, metadata)
  values ('messages_contact', v_deleted_count, 'success', 
    jsonb_build_object('archived', v_archived_count));
  
  return jsonb_build_object('deleted', v_deleted_count, 'archived', v_archived_count);
end;
$$;

grant execute on function public.cleanup_old_contact_messages() to service_role;
```

### Phase 3: Planification automatique

#### Option A: Supabase Edge Function (Recommandée)

**Fichier**: `supabase/functions/scheduled-cleanup/index.ts`

> **Note**: Première Edge Function du projet — créer le répertoire `supabase/functions/`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

interface CleanupResult {
  table: string;
  deleted: number;
  status: string;
  error?: string;
}

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  
  // Validation: secret token pour sécuriser l'endpoint
  if (authHeader !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const results: Record<string, CleanupResult | { error: string }> = {};

  // Exécution séquentielle des purges (ordre important)
  const tables = [
    "logs_audit",
    "abonnes_newsletter",
    "messages_contact",
    "analytics_events",
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabaseClient.rpc("cleanup_expired_data", {
        p_table_name: table,
      });

      if (error) throw error;
      results[table] = data as CleanupResult;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      results[table] = { error: errorMessage };
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 
      "Content-Type": "application/json",
      "Connection": "keep-alive"
    },
  });
});
```

**Configuration cron** (via Supabase Dashboard):

```
0 2 * * * # Tous les jours à 2h00 UTC
```

#### Option B: pg_cron ❌ Non disponible

> **Note**: `pg_cron` n'est **pas activé** dans ce projet (voir `supabase/schemas/05_extensions.sql`).
> L'activation nécessiterait un plan Supabase Pro+ et une modification des extensions.
> → **Utiliser l'Option A (Edge Function)** pour ce projet.

### Phase 4: Monitoring et alertes

#### 4.1 Vue de monitoring

**Fichier**: `supabase/schemas/41_views_retention.sql`

```sql
-- Vue pour dashboard admin
create or replace view public.data_retention_monitoring
with (security_invoker = true)
as
select 
  c.table_name,
  c.retention_days,
  c.enabled,
  c.last_run_at,
  a.rows_deleted as last_deleted_count,
  a.execution_time_ms as last_execution_ms,
  a.status as last_status,
  a.executed_at as last_execution,
  case 
    when c.last_run_at is null then 'never_run'
    when c.last_run_at < now() - interval '25 hours' then 'overdue'
    when a.status = 'failed' then 'error'
    else 'ok'
  end as health_status
from public.data_retention_config c
left join lateral (
  select rows_deleted, execution_time_ms, status, executed_at
  from public.data_retention_audit
  where table_name = c.table_name
  order by executed_at desc
  limit 1
) a on true
order by c.table_name;

comment on view public.data_retention_monitoring is 
'Vue de monitoring pour le dashboard admin - état des jobs de rétention';

alter view public.data_retention_monitoring owner to admin_views_owner;
revoke all on public.data_retention_monitoring from anon, authenticated;
grant select on public.data_retention_monitoring to service_role;
```

#### 4.2 Fonction de santé pour alertes

```sql
-- Fonction pour détecter les anomalies
create or replace function public.check_retention_health()
returns table (
  table_name text,
  issue text,
  severity text
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  select 
    c.table_name,
    case 
      when c.last_run_at is null then 'Job never executed'
      when c.last_run_at < now() - interval '25 hours' then 'Job overdue (>25h)'
      when a.status = 'failed' then 'Last execution failed: ' || a.error_message
      when a.rows_deleted > 10000 then 'Unusually high deletion count: ' || a.rows_deleted::text
      else 'Unknown issue'
    end,
    case 
      when c.last_run_at is null then 'critical'
      when c.last_run_at < now() - interval '25 hours' then 'warning'
      when a.status = 'failed' then 'critical'
      when a.rows_deleted > 10000 then 'info'
      else 'ok'
    end
  from public.data_retention_config c
  left join lateral (
    select status, error_message, rows_deleted
    from public.data_retention_audit
    where table_name = c.table_name
    order by executed_at desc
    limit 1
  ) a on true
  where c.enabled = true
    and (
      c.last_run_at is null
      or c.last_run_at < now() - interval '25 hours'
      or a.status = 'failed'
      or a.rows_deleted > 10000
    );
end;
$$;

grant execute on function public.check_retention_health() to service_role;
```

### Phase 5: Tests et validation

#### 5.1 Script de test (staging uniquement)

**Fichier**: `scripts/test-data-retention.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testRetention() {
  console.log("🧪 Testing data retention system...\n");

  // Test 1: Vérifier la configuration
  const { data: config, error: configError } = await supabase
    .from("data_retention_config")
    .select("*");

  console.log("📋 Configuration:", config);
  if (configError) throw configError;

  // Test 2: Exécuter une purge manuelle
  const { data: result, error: cleanupError } = await supabase.rpc(
    "cleanup_expired_data",
    { p_table_name: "logs_audit" }
  );

  console.log("🗑️  Cleanup result:", result);
  if (cleanupError) throw cleanupError;

  // Test 3: Vérifier l'audit trail
  const { data: audit } = await supabase
    .from("data_retention_audit")
    .select("*")
    .order("executed_at", { ascending: false })
    .limit(10);

  console.log("📊 Recent audit logs:", audit);

  // Test 4: Health check
  const { data: health } = await supabase.rpc("check_retention_health");

  console.log("🏥 Health status:", health);
}

testRetention().catch(console.error);
```

#### 5.2 Tests unitaires SQL

```sql
-- Test de la fonction cleanup_expired_data
do $$
declare
  v_result jsonb;
begin
  -- Insérer des données de test expirées
  insert into public.logs_audit (user_id, action, table_name, created_at, expires_at)
  values 
    (null, 'TEST', 'test_table', now() - interval '100 days', now() - interval '10 days'),
    (null, 'TEST', 'test_table', now() - interval '100 days', now() - interval '10 days');
  
  -- Exécuter la purge
  select public.cleanup_expired_data('logs_audit') into v_result;
  
  -- Vérifier le résultat
  assert (v_result->>'status')::text = 'success', 'Cleanup should succeed';
  assert (v_result->>'deleted')::integer >= 2, 'Should delete at least 2 test rows';
  
  raise notice 'Test passed: %', v_result;
end;
$$;
```

---

## 📚 Documentation RGPD

### Justification des politiques de rétention

**Fichier**: `doc/RGPD_DATA_RETENTION_POLICY.md`

```markdown
# Politique de Rétention des Données - Rouge Cardinal Company

## Conformité RGPD (Art. 5.1.e - Limitation de conservation)

### Principes

Les données personnelles sont conservées **uniquement pour la durée nécessaire** aux finalités pour lesquelles elles sont traitées.

### Durées de rétention par finalité

| Données | Finalité | Base légale | Durée | Justification |
|---------|----------|-------------|-------|---------------|
| **Logs d'audit** | Sécurité système | Intérêt légitime | 90 jours | Détection incidents + conformité ISO 27001 |
| **Désabonnements newsletter** | Respect opt-out | Obligation légale | 90 jours | Preuve consentement retiré + liste exclusion |
| **Messages contact** | Gestion relation client | Exécution contrat | 1 an | Suivi conversations + obligation fiscale |
| **Analytics anonymisées** | Amélioration service | Intérêt légitime | 90 jours | Optimisation UX (données anonymes) |

### Processus de purge automatique

- **Fréquence**: Quotidienne (2h00 UTC)
- **Méthode**: Suppression définitive (pas d'archivage sauf mention contraire)
- **Audit**: Logs de purge conservés 1 an dans `data_retention_audit`

### Droits des personnes

- **Droit à l'oubli**: Suppression immédiate sur demande (contacter: privacy@rougecardinalcompany.fr)
- **Droit d'accès**: Export complet des données via interface admin
```

---

## ✅ Checklist de déploiement

### Phase 1: Préparation (Local)

- [ ] Créer `supabase/schemas/21_data_retention_tables.sql` (config + audit)
- [ ] Créer `supabase/schemas/22_data_retention_functions.sql` (fonctions purge)
- [ ] Créer `supabase/schemas/41_views_retention.sql` (monitoring)
- [ ] Créer `lib/dal/data-retention.ts` (DAL pour admin UI)
- [ ] Créer `lib/schemas/data-retention.ts` (validation Zod)
- [ ] Générer migration: `supabase db diff -f task053_data_retention`
- [ ] Tester en local avec `pnpm dlx supabase db reset`

> **Note**: `logs_audit.expires_at` et `cleanup_expired_audit_logs()` existent déjà — ne pas recréer

### Phase 2: Tests (Staging)

- [ ] Créer script `test-data-retention.ts`
- [ ] Insérer données de test expirées
- [ ] Exécuter purge manuelle via RPC
- [ ] Vérifier audit trail dans `data_retention_audit`
- [ ] Valider health check (`check_retention_health()`)

### Phase 3: Edge Function (Production)

- [ ] Créer répertoire `supabase/functions/scheduled-cleanup/`
- [ ] Créer `supabase/functions/scheduled-cleanup/index.ts`
- [ ] Créer `supabase/functions/scheduled-cleanup/deno.json` (config Deno)
- [ ] Déployer: `pnpm dlx supabase functions deploy scheduled-cleanup`
- [ ] Configurer secret `CRON_SECRET` via Supabase Dashboard
- [ ] Configurer planification cron (quotidien 2h00 UTC) via Dashboard
- [ ] Tester premier déclenchement avec logs

> **Note**: Première Edge Function du projet — créer la structure complète

### Phase 4: Monitoring (Production)

- [ ] Ajouter dashboard admin avec vue `data_retention_monitoring`
- [ ] Configurer alertes email si `health_status != 'ok'`
- [ ] Documenter runbook pour incidents
- [ ] Former équipe admin sur monitoring

### Phase 5: Documentation

- [ ] Créer `RGPD_DATA_RETENTION_POLICY.md`
- [ ] Mettre à jour politique de confidentialité site
- [ ] Documenter procédure droit à l'oubli
- [ ] Archiver dans knowledge base

---

## 🚨 Points d'attention

### Sécurité

- ⚠️ **SECURITY DEFINER obligatoire** pour bypass RLS lors des purges
- ⚠️ **Validation stricte** des noms de table (whitelist via config)
- ⚠️ **Secret token** pour protéger Edge Function cron

### Performance

- ⚠️ **Index requis** sur colonnes de date (déjà présents)
- ⚠️ **Batch size** pour grandes tables (chunking si >100k rows)
- ⚠️ **Vacuum recommandé** après purges importantes

### RGPD

- ⚠️ **Suppression définitive** (pas de restauration possible)
- ⚠️ **Logs de purge** conservés 1 an pour preuve conformité
- ⚠️ **Droit à l'oubli** doit contourner les rétentions (fonction dédiée)

### Rollback

- ✅ **Backups automatiques** Supabase (PITR 7 jours)
- ✅ **Désactivation rapide** via `enabled = false` dans config
- ✅ **Pas de migration destructrice** (DDL uniquement)

---

## 📊 Métriques de succès

| Métrique | Cible | Mesure |
|----------|-------|--------|
| **Taux de succès purges** | >99% | `data_retention_audit.status = 'success'` |
| **Latence maximum** | <5s par table | `data_retention_audit.execution_time_ms` |
| **Rows purgés/jour** | Variable | Monitoring dashboard |
| **Incidents jobs** | 0/mois | Alertes health check |
| **Conformité RGPD** | 100% | Audit annuel |

---

## 🔄 Évolutions futures

### Phase 2 (optionnelle)

- Archivage S3/cold storage avant suppression définitive
- Purge incrémentale (chunking) pour très grandes tables
- Alertes Slack/Discord pour incidents
- Métriques Grafana/Prometheus

### Phase 3 (si nécessaire)

- Anonymisation au lieu de suppression (analytics)
- Export automatique avant purge (compliance)
- Retention différenciée par tenant/client

---

## � Intégration DAL (Admin UI)

### Fichier: `lib/dal/data-retention.ts`

```typescript
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import type { DALResult } from "@/lib/dal/helpers";

export interface RetentionConfig {
  id: bigint;
  table_name: string;
  retention_days: number;
  date_column: string;
  enabled: boolean;
  last_run_at: string | null;
  description: string | null;
}

export interface RetentionAudit {
  id: bigint;
  table_name: string;
  rows_deleted: number;
  execution_time_ms: number | null;
  status: "success" | "partial" | "failed";
  executed_at: string;
}

export async function fetchRetentionConfigs(): Promise<DALResult<RetentionConfig[]>> {
  await requireAdmin();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("data_retention_config")
    .select("*")
    .order("table_name");

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function fetchRetentionAuditLogs(
  limit = 50
): Promise<DALResult<RetentionAudit[]>> {
  await requireAdmin();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("data_retention_audit")
    .select("*")
    .order("executed_at", { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function triggerManualCleanup(
  tableName: string
): Promise<DALResult<{ deleted: number }>> {
  await requireAdmin();
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("cleanup_expired_data", {
    p_table_name: tableName,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, data: { deleted: data?.deleted ?? 0 } };
}
```

### Fichier: `lib/schemas/data-retention.ts`

```typescript
import { z } from "zod";

export const RetentionConfigSchema = z.object({
  table_name: z.string().min(1).regex(/^[a-z_]+$/),
  retention_days: z.number().int().positive().max(3650),
  date_column: z.string().min(1),
  enabled: z.boolean().default(true),
  description: z.string().max(500).optional(),
});

export type RetentionConfigInput = z.infer<typeof RetentionConfigSchema>;
```

---

## 📖 Références

- [RGPD Article 5.1.e](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre2#Article5)
- [Supabase Scheduled Functions](https://supabase.com/docs/guides/functions/schedule-functions)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- TASK050: Database Backup & Recovery Strategy (context PITR)
- `supabase/schemas/20_audit_logs_retention.sql` — Implémentation existante

---

**Estimation finale**: 1.5 jours (12h)

| Phase | Tâche | Durée |
|-------|-------|-------|
| 1 | Schemas SQL (tables config/audit) | 2h |
| 2 | Fonctions SQL (cleanup génériques) | 2h |
| 3 | Edge Function + déploiement | 3h |
| 4 | DAL + Schémas Zod | 1h |
| 5 | Tests + Validation | 2h |
| 6 | Documentation RGPD | 2h |

**Total**: ~12h
