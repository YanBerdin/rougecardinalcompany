-- RPC function to fetch audit logs with user email
-- SECURITY DEFINER needed to access auth.users (system table)
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Needs to join auth.users (system table not accessible via RLS)
 *   2. Returns user email for audit trail display
 *   3. Protected by is_admin() check at function start
 * 
 * Risks Evaluated:
 *   - Authorization: Explicit is_admin() check (defense-in-depth)
 *   - Input validation: All params have safe types, search uses ILIKE (no injection)
 *   - Privilege escalation: Only reads data, cannot modify
 */
create or replace function public.get_audit_logs_with_email(
  p_action text default null,
  p_table_name text default null,
  p_user_id uuid default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_search text default null,
  p_page integer default 1,
  p_limit integer default 50
)
returns table (
  id bigint,
  user_id uuid,
  user_email text,
  action text,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz,
  expires_at timestamptz,
  total_count bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_offset integer;
begin
  -- Authorization check (defense-in-depth)
  if not (select public.is_admin()) then
    raise exception 'Permission denied: admin role required';
  end if;

  v_offset := (p_page - 1) * p_limit;

  return query
  with filtered_logs as (
    select 
      al.id,
      al.user_id,
      au.email::text as user_email,
      al.action,
      al.table_name,
      al.record_id,
      al.old_values,
      al.new_values,
      al.ip_address,
      al.user_agent,
      al.created_at,
      al.expires_at
    from public.logs_audit al
    left join auth.users au on al.user_id = au.id
    where 
      (p_action is null or al.action = p_action)
      and (p_table_name is null or al.table_name = p_table_name)
      and (p_user_id is null or al.user_id = p_user_id)
      and (p_date_from is null or al.created_at >= p_date_from)
      and (p_date_to is null or al.created_at <= p_date_to)
      and (p_search is null or 
           al.record_id ilike '%' || p_search || '%' or 
           al.table_name ilike '%' || p_search || '%')
  ),
  total as (
    select count(*)::bigint as cnt from filtered_logs
  )
  select 
    fl.id,
    fl.user_id,
    fl.user_email,
    fl.action,
    fl.table_name,
    fl.record_id,
    fl.old_values,
    fl.new_values,
    fl.ip_address,
    fl.user_agent,
    fl.created_at,
    fl.expires_at,
    t.cnt as total_count
  from filtered_logs fl, total t
  order by fl.created_at desc
  limit p_limit
  offset v_offset;
end;
$$;

grant execute on function public.get_audit_logs_with_email to authenticated;

comment on function public.get_audit_logs_with_email is 
'Fetch audit logs with user email from auth.users. Admin-only via is_admin() check.';
