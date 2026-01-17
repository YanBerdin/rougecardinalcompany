-- Migration: Create 90-day analytics summary view
-- Purpose: Extend analytics retention from 30 to 90 days for long-term trend analysis
-- Affected: New view analytics_summary_90d
-- Special Considerations: Admin-only access with SECURITY INVOKER pattern

-- Create 90-day analytics summary view (extends retention for admin dashboard)
create or replace view public.analytics_summary_90d
with (security_invoker = true)
as
select 
  event_type,
  entity_type,
  date_trunc('day', created_at) as event_date,
  count(*) as total_events,
  count(distinct user_id) as unique_users,
  count(distinct session_id) as unique_sessions
from public.analytics_events 
where created_at >= current_date - interval '90 days'
group by event_type, entity_type, date_trunc('day', created_at)
order by event_date desc, total_events desc;

comment on view public.analytics_summary_90d is 'Vue résumé des statistiques analytiques sur 90 jours pour analyse de tendances. SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

-- Set owner to admin_views_owner role
alter view public.analytics_summary_90d owner to admin_views_owner;

-- Revoke default permissions
revoke all on public.analytics_summary_90d from anon, authenticated;

-- Grant select to service_role only (admins access via DAL with is_admin() check)
grant select on public.analytics_summary_90d to service_role;
