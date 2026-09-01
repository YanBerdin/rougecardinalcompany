-- Migration: Remove is_admin() check inside get_audit_logs_with_email
-- Purpose:   Fix ERR_AUDIT_001 ("Permission denied: admin role required")
--            triggered when the function is called via the service_role client.
-- Affected:  public.get_audit_logs_with_email (function body)
--
-- Context:
--   The previous migration 20260502140000_revoke_get_audit_logs_from_authenticated
--   announced in its header comment that the in-function is_admin() guard was
--   removed, but the migration only ran REVOKE statements and did not recreate
--   the function. As a result the cloud function still contained:
--       if not (select public.is_admin()) then
--         raise exception 'Permission denied: admin role required';
--       end if;
--   Since the DAL now calls the function via createAdminClient() (service_role),
--   auth.uid() returns NULL, is_admin() evaluates to false, and the exception
--   fires on every request. Authorization is already enforced at the Server
--   Action layer by requireAdminPageAccess() / requireAdmin(), so the
--   in-function check is redundant.
--
-- Security note:
--   - SECURITY DEFINER is kept (required to read auth.users).
--   - EXECUTE remains granted to service_role only (no GRANT to authenticated/anon).
--   - Admin enforcement happens BEFORE the DAL is reached.

-- =============================================================================
-- RECREATE FUNCTION WITHOUT THE is_admin() CHECK
-- =============================================================================

create or replace function public.get_audit_logs_with_email(
  p_action     text        default null,
  p_table_name text        default null,
  p_user_id    uuid        default null,
  p_date_from  timestamptz default null,
  p_date_to    timestamptz default null,
  p_search     text        default null,
  p_page       integer     default 1,
  p_limit      integer     default 50
)
returns table (
  id           bigint,
  user_id      uuid,
  user_email   text,
  action       text,
  table_name   text,
  record_id    text,
  old_values   jsonb,
  new_values   jsonb,
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz,
  expires_at   timestamptz,
  total_count  bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_offset integer;
begin
  -- Enforce maximum page size to prevent bypassing CTE optimization
  if p_limit > 200 then
    p_limit := 200;
  end if;

  v_offset := (p_page - 1) * p_limit;

  return query
  with
  total_count as (
    select count(*)::bigint as cnt
    from public.logs_audit al
    where
      (p_action     is null or al.action     = p_action)
      and (p_table_name is null or al.table_name = p_table_name)
      and (p_user_id    is null or al.user_id    = p_user_id)
      and (p_date_from  is null or al.created_at >= p_date_from)
      and (p_date_to    is null or al.created_at <= p_date_to)
      and (p_search     is null or
           al.record_id  ilike '%' || p_search || '%' or
           al.table_name ilike '%' || p_search || '%')
  ),
  page_logs as (
    select
      al.id,
      al.user_id,
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
    where
      (p_action     is null or al.action     = p_action)
      and (p_table_name is null or al.table_name = p_table_name)
      and (p_user_id    is null or al.user_id    = p_user_id)
      and (p_date_from  is null or al.created_at >= p_date_from)
      and (p_date_to    is null or al.created_at <= p_date_to)
      and (p_search     is null or
           al.record_id  ilike '%' || p_search || '%' or
           al.table_name ilike '%' || p_search || '%')
    order by al.created_at desc
    limit  p_limit
    offset v_offset
  )
  select
    pl.id,
    pl.user_id,
    au.email::text as user_email,
    pl.action,
    pl.table_name,
    pl.record_id,
    pl.old_values,
    pl.new_values,
    pl.ip_address,
    pl.user_agent,
    pl.created_at,
    pl.expires_at,
    tc.cnt as total_count
  from       page_logs   pl
  left join  auth.users  au on pl.user_id = au.id
  cross join total_count tc
  order by pl.created_at desc;
end;
$$;

-- CREATE OR REPLACE FUNCTION preserves existing grants in PostgreSQL,
-- but we re-assert them defensively in case the prior state was inconsistent.
grant execute on function public.get_audit_logs_with_email(
  text,
  text,
  uuid,
  timestamp with time zone,
  timestamp with time zone,
  text,
  integer,
  integer
) to service_role;

revoke execute on function public.get_audit_logs_with_email(
  text,
  text,
  uuid,
  timestamp with time zone,
  timestamp with time zone,
  text,
  integer,
  integer
) from authenticated, anon, public;

comment on function public.get_audit_logs_with_email is
  'Fetch paginated audit logs with user email from auth.users. Admin-only: '
  'called exclusively via service_role through createAdminClient() in the DAL. '
  'Authorization enforced upstream by requireAdminPageAccess() / requireAdmin(). '
  'Optimised: COUNT runs without the auth.users JOIN; the JOIN only touches '
  'the <=50 rows of the current page.';
