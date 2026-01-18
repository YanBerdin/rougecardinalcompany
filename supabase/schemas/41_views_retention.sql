-- =====================================================
-- Data Retention Monitoring Views
-- =====================================================
-- Purpose: Vues pour dashboard admin - monitoring système rétention
-- Created: 2026-01-17
-- Dependencies: 21_data_retention_tables.sql, 22_data_retention_functions.sql
-- =====================================================

-- =====================================================
-- View: data_retention_monitoring
-- Description: Vue monitoring pour dashboard admin
-- Security: SECURITY INVOKER (admin-only via grants)
-- =====================================================

create or replace view public.data_retention_monitoring
with (security_invoker = true)
as
select 
  c.id,
  c.table_name,
  c.retention_days,
  c.date_column,
  c.enabled,
  c.description,
  c.last_run_at,
  c.created_at as config_created_at,
  c.updated_at as config_updated_at,
  
  -- Stats dernière exécution
  a.rows_deleted as last_deleted_count,
  a.execution_time_ms as last_execution_ms,
  a.status as last_status,
  a.error_message as last_error,
  a.executed_at as last_execution,
  a.metadata as last_metadata,
  
  -- Health status calculé
  case 
    when c.last_run_at is null then 
      'never_run'
    when c.last_run_at < now() - interval '7 days' then 
      'critical'
    when c.last_run_at < now() - interval '2 days' then 
      'warning'
    when a.status = 'failed' then 
      'failed'
    when a.status = 'partial' then 
      'warning'
    else 
      'ok'
  end as health_status,
  
  -- Prochain run estimé (si daily cron)
  case 
    when c.last_run_at is null then 
      null
    else 
      (c.last_run_at + interval '1 day')::timestamptz
  end as next_run_estimated
  
from public.data_retention_config c
left join lateral (
  select 
    rows_deleted, 
    execution_time_ms, 
    status, 
    error_message,
    executed_at,
    metadata
  from public.data_retention_audit
  where table_name = c.table_name
  order by executed_at desc
  limit 1
) a on true
order by 
  case c.enabled when true then 0 else 1 end,
  c.table_name;

comment on view public.data_retention_monitoring is 
  'Vue de monitoring pour le dashboard admin - état des jobs de rétention. 
Affiche config + dernière exécution + health status calculé.';

-- =====================================================
-- Grant permissions (admin-only)
-- =====================================================

-- Owner assignment removed from seed globals to avoid permission error
-- alter view public.data_retention_monitoring owner to admin_views_owner;

revoke all on public.data_retention_monitoring from anon, authenticated;

grant select on public.data_retention_monitoring to service_role;

-- Note: Authenticated users avec is_admin() peuvent accéder via RLS sur tables sous-jacentes
-- Mais la vue elle-même est protected (SECURITY INVOKER + grants explicites)

-- =====================================================
-- View: data_retention_stats
-- Description: Statistiques agrégées pour graphiques
-- =====================================================

create or replace view public.data_retention_stats
with (security_invoker = true)
as
select 
  table_name,
  
  -- Stats dernières 24h
  count(*) filter (where executed_at >= now() - interval '1 day') as executions_24h,
  sum(rows_deleted) filter (where executed_at >= now() - interval '1 day') as rows_deleted_24h,
  
  -- Stats derniers 7 jours
  count(*) filter (where executed_at >= now() - interval '7 days') as executions_7d,
  sum(rows_deleted) filter (where executed_at >= now() - interval '7 days') as rows_deleted_7d,
  
  -- Stats derniers 30 jours
  count(*) filter (where executed_at >= now() - interval '30 days') as executions_30d,
  sum(rows_deleted) filter (where executed_at >= now() - interval '30 days') as rows_deleted_30d,
  
  -- Performance
  avg(execution_time_ms) as avg_execution_ms,
  max(execution_time_ms) as max_execution_ms,
  
  -- Taux de succès
  count(*) filter (where status = 'success') * 100.0 / nullif(count(*), 0) as success_rate_pct,
  
  -- Dernière exécution
  max(executed_at) as last_executed_at
  
from public.data_retention_audit
group by table_name
order by table_name;

comment on view public.data_retention_stats is 
  'Statistiques agrégées des purges par table (24h, 7j, 30j). 
Pour graphiques dashboard admin.';

-- alter view public.data_retention_stats owner to admin_views_owner; -- Removed from seed globals to avoid permission error
revoke all on public.data_retention_stats from anon, authenticated;
grant select on public.data_retention_stats to service_role;

-- =====================================================
-- View: data_retention_recent_audit
-- Description: Logs récents pour debugging
-- =====================================================

create or replace view public.data_retention_recent_audit
with (security_invoker = true)
as
select 
  id,
  table_name,
  rows_deleted,
  execution_time_ms,
  status,
  error_message,
  executed_at,
  metadata,
  
  -- Human-readable time ago
  case 
    when executed_at >= now() - interval '1 hour' then 
      extract(minutes from now() - executed_at)::text || ' min ago'
    when executed_at >= now() - interval '1 day' then 
      extract(hours from now() - executed_at)::text || ' hours ago'
    else 
      extract(days from now() - executed_at)::text || ' days ago'
  end as time_ago
  
from public.data_retention_audit
where executed_at >= now() - interval '7 days'
order by executed_at desc
limit 100;

comment on view public.data_retention_recent_audit is 
  'Logs de purge des 7 derniers jours (max 100 lignes). 
Pour debugging et monitoring temps réel.';

-- alter view public.data_retention_recent_audit owner to admin_views_owner; -- Removed from seed globals to avoid permission error
revoke all on public.data_retention_recent_audit from anon, authenticated;
grant select on public.data_retention_recent_audit to service_role;
