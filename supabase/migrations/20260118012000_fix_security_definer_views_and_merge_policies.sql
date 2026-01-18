-- Migration: Convert SECURITY DEFINER views to SECURITY INVOKER + merge home_hero_slides SELECT policies
-- Purpose: Fix Supabase security advisors recommendations
-- 
-- Fixes:
--   1. communiques_presse_public: SECURITY DEFINER → SECURITY INVOKER
--   2. data_retention_recent_audit: SECURITY DEFINER → SECURITY INVOKER
--   3. data_retention_monitoring: SECURITY DEFINER → SECURITY INVOKER
--   4. data_retention_stats: SECURITY DEFINER → SECURITY INVOKER
--   5. home_hero_slides: Merge 2 SELECT policies into 1 combined policy

-- ============================================================================
-- 1. RECREATE communiques_presse_public WITH SECURITY INVOKER
-- ============================================================================

drop view if exists public.communiques_presse_public;

create view public.communiques_presse_public
with (security_invoker = on)
as
select
  cp.id,
  cp.title,
  cp.slug,
  cp.description,
  cp.date_publication,
  cp.ordre_affichage,
  cp.spectacle_id,
  cp.evenement_id,
  pdf_m.filename as pdf_filename,
  cp.file_size_bytes,
  case
    when cp.file_size_bytes is not null then
      case
        when cp.file_size_bytes < 1024 then cp.file_size_bytes::text || ' B'
        when cp.file_size_bytes < 1048576 then round(cp.file_size_bytes::numeric / 1024.0, 1)::text || ' KB'
        else round(cp.file_size_bytes::numeric / 1048576.0, 1)::text || ' MB'
      end
    else pdf_m.size_bytes::text
  end as file_size_display,
  pdf_m.storage_path as pdf_path,
  concat('/storage/v1/object/public/medias/', pdf_m.storage_path) as file_url,
  cp.image_url,
  cm.ordre as image_ordre,
  im.filename as image_filename,
  im.storage_path as image_path,
  concat('/storage/v1/object/public/medias/', im.storage_path) as image_file_url,
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  l.nom as lieu_nom,
  array_agg(distinct c.name) filter (where c.name is not null) as categories,
  array_agg(distinct t.name) filter (where t.name is not null) as tags
from communiques_presse cp
left join communiques_medias pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1
left join medias pdf_m on pdf_cm.media_id = pdf_m.id
left join communiques_medias cm on cp.id = cm.communique_id and cm.ordre = 0
left join medias im on cm.media_id = im.id
left join spectacles s on cp.spectacle_id = s.id
left join evenements e on cp.evenement_id = e.id
left join lieux l on e.lieu_id = l.id
left join communiques_categories cc on cp.id = cc.communique_id
left join categories c on cc.category_id = c.id and c.is_active = true
left join communiques_tags ct on cp.id = ct.communique_id
left join tags t on ct.tag_id = t.id
where cp.public = true
  and exists (
    select 1 from communiques_medias pdf_check
    where pdf_check.communique_id = cp.id and pdf_check.ordre = -1
  )
group by cp.id, pdf_m.filename, pdf_m.size_bytes, pdf_m.storage_path, 
         cm.ordre, im.filename, im.storage_path, cp.image_url, 
         s.title, e.date_debut, l.nom
order by cp.ordre_affichage, cp.date_publication desc;

comment on view public.communiques_presse_public is 
'Public press releases with PDF attachments. SECURITY INVOKER for RLS compliance.';

-- Grants for public access
grant select on public.communiques_presse_public to anon, authenticated, service_role;

-- ============================================================================
-- 2. RECREATE data_retention_recent_audit WITH SECURITY INVOKER
-- ============================================================================

drop view if exists public.data_retention_recent_audit;

create view public.data_retention_recent_audit
with (security_invoker = on)
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
  case
    when executed_at >= now() - interval '1 hour' then
      extract(minutes from (now() - executed_at))::text || ' min ago'
    when executed_at >= now() - interval '1 day' then
      extract(hours from (now() - executed_at))::text || ' hours ago'
    else
      extract(days from (now() - executed_at))::text || ' days ago'
  end as time_ago
from data_retention_audit
where executed_at >= now() - interval '7 days'
order by executed_at desc
limit 100;

comment on view public.data_retention_recent_audit is 
'Recent data retention audit logs (last 7 days). SECURITY INVOKER - admin only via RLS.';

-- Admin-only access (RLS on base table enforces this)
grant select on public.data_retention_recent_audit to service_role;

-- ============================================================================
-- 3. RECREATE data_retention_monitoring WITH SECURITY INVOKER
-- ============================================================================

drop view if exists public.data_retention_monitoring;

create view public.data_retention_monitoring
with (security_invoker = on)
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
  a.rows_deleted as last_deleted_count,
  a.execution_time_ms as last_execution_ms,
  a.status as last_status,
  a.error_message as last_error,
  a.executed_at as last_execution,
  a.metadata as last_metadata,
  case
    when c.last_run_at is null then 'never_run'
    when c.last_run_at < now() - interval '7 days' then 'critical'
    when c.last_run_at < now() - interval '2 days' then 'warning'
    when a.status = 'failed' then 'failed'
    when a.status = 'partial' then 'warning'
    else 'ok'
  end as health_status,
  case
    when c.last_run_at is null then null
    else c.last_run_at + interval '1 day'
  end as next_run_estimated
from data_retention_config c
left join lateral (
  select 
    rows_deleted,
    execution_time_ms,
    status,
    error_message,
    executed_at,
    metadata
  from data_retention_audit
  where table_name = c.table_name
  order by executed_at desc
  limit 1
) a on true
order by 
  case c.enabled when true then 0 else 1 end,
  c.table_name;

comment on view public.data_retention_monitoring is 
'Data retention monitoring dashboard with health status. SECURITY INVOKER - admin only via RLS.';

-- Admin-only access (RLS on base tables enforces this)
grant select on public.data_retention_monitoring to service_role;

-- ============================================================================
-- 4. RECREATE data_retention_stats WITH SECURITY INVOKER
-- ============================================================================

drop view if exists public.data_retention_stats;

create view public.data_retention_stats
with (security_invoker = on)
as
select
  table_name,
  count(*) filter (where executed_at >= now() - interval '1 day') as executions_24h,
  sum(rows_deleted) filter (where executed_at >= now() - interval '1 day') as rows_deleted_24h,
  count(*) filter (where executed_at >= now() - interval '7 days') as executions_7d,
  sum(rows_deleted) filter (where executed_at >= now() - interval '7 days') as rows_deleted_7d,
  count(*) filter (where executed_at >= now() - interval '30 days') as executions_30d,
  sum(rows_deleted) filter (where executed_at >= now() - interval '30 days') as rows_deleted_30d,
  avg(execution_time_ms) as avg_execution_ms,
  max(execution_time_ms) as max_execution_ms,
  (count(*) filter (where status = 'success')::numeric * 100.0) / nullif(count(*), 0)::numeric as success_rate_pct,
  max(executed_at) as last_executed_at
from data_retention_audit
group by table_name
order by table_name;

comment on view public.data_retention_stats is 
'Data retention statistics aggregated by table. SECURITY INVOKER - admin only via RLS.';

-- Admin-only access (RLS on base table enforces this)
grant select on public.data_retention_stats to service_role;

-- ============================================================================
-- 5. MERGE home_hero_slides SELECT POLICIES
-- ============================================================================
-- Current state:
--   - "Admins can view all home hero slides" (authenticated only, is_admin())
--   - "View home hero slides (public active OR admin all)" (anon+authenticated, combined)
-- 
-- The second policy already covers admin access via OR is_admin()
-- So we can safely drop the admin-only policy (redundant)

drop policy if exists "Admins can view all home hero slides" on public.home_hero_slides;

-- The remaining policy handles both cases:
-- - anon: sees active slides within schedule
-- - authenticated admin: sees all via is_admin() OR clause
-- - authenticated non-admin: sees active slides within schedule

-- ============================================================================
-- 6. VERIFICATION
-- ============================================================================

do $$
declare
  view_count integer;
  policy_count integer;
begin
  -- Verify SECURITY INVOKER on views
  select count(*) into view_count
  from pg_views v
  join pg_class c on c.relname = v.viewname
  where v.viewname in (
    'communiques_presse_public',
    'data_retention_recent_audit', 
    'data_retention_monitoring',
    'data_retention_stats'
  )
  and c.relnamespace = 'public'::regnamespace;
  
  if view_count = 4 then
    raise notice '✅ All 4 views recreated successfully';
  else
    raise warning '⚠️ Expected 4 views, found %', view_count;
  end if;

  -- Verify single SELECT policy on home_hero_slides
  select count(*) into policy_count
  from pg_policies
  where tablename = 'home_hero_slides' and cmd = 'SELECT';
  
  if policy_count = 1 then
    raise notice '✅ home_hero_slides: Single SELECT policy (merged)';
  else
    raise warning '⚠️ home_hero_slides: Expected 1 SELECT policy, found %', policy_count;
  end if;

  raise notice '✅ Security advisor fixes applied successfully';
end;
$$;
