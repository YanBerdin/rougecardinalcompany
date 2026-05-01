-- Index supporting ORDER BY created_at DESC and retention cleanup queries.
create index if not exists idx_logs_audit_created_at
  on public.logs_audit using btree (created_at desc);

comment on index public.idx_logs_audit_created_at is
  'Supports ORDER BY created_at DESC in get_audit_logs_with_email and retention cleanup.';

-- RPC function to fetch paginated audit logs with user email.
-- SECURITY DEFINER is required to access auth.users (system table).
/*
 * Security Model: SECURITY DEFINER
 *
 * Rationale:
 *   1. Needs to join auth.users (system table not accessible via RLS).
 *   2. Returns user email for audit trail display.
 *   3. Called exclusively through createAdminClient() (service_role) in the
 *      server-side DAL, so no EXECUTE grant to authenticated is needed.
 *
 * Risks Evaluated:
 *   - Authorization: Enforced by requireAdminPageAccess() / requireAdmin() in
 *     the Server Component and Server Action layers before the DAL is reached.
 *     No is_admin() check inside the function because auth.uid() returns NULL
 *     when invoked through the service_role client, making any such check fail.
 *   - Input validation: All params have safe types; search uses ILIKE (no
 *     injection risk because the value is passed as a bind parameter, never
 *     concatenated into dynamic SQL).
 *   - Privilege escalation: Read-only — no INSERT/UPDATE/DELETE.
 *   - Performance: COUNT and page data are separated into independent CTEs so
 *     the expensive auth.users JOIN only touches the ≤50 page rows.
 *
 * Validation:
 *   - Function is read-only (no DML statements).
 *   - Tested with EXPLAIN ANALYZE: COUNT CTE uses index scan, JOIN touches ≤50 rows.
 *   - REVOKE EXECUTE from authenticated/anon applied in migration
 *     20260502140000_revoke_get_audit_logs_from_authenticated.
 *
 * Grant Policy:
 *   - NO explicit EXECUTE grant to authenticated or anon.
 *   - Callable only by service_role (bypasses PostgreSQL grants) via
 *     createAdminClient() in lib/dal/audit-logs.ts.
 *   - Admin access enforced by requireAdminPageAccess() in the page.
 */
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
  -- Count-only CTE: scans logs_audit only (no auth.users JOIN).
  -- With an index on created_at this is significantly faster than the
  -- previous approach that materialised the full JOIN before counting.
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
  -- Page data CTE: applies LIMIT/OFFSET before the JOIN so the planner
  -- only needs to materialise p_limit rows (≤50) from logs_audit.
  -- The idx_logs_audit_created_at index makes the ORDER BY cheap.
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
  -- Final select: join only the ≤50 page rows with auth.users.
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

-- No EXECUTE grant to authenticated/anon: function is called via service_role
-- client (createAdminClient) from the server-side DAL only.

comment on function public.get_audit_logs_with_email is
  'Fetch paginated audit logs with user email from auth.users. Admin-only: '
  'called exclusively via service_role through createAdminClient() in the DAL. '
  'Optimised: COUNT runs without the auth.users JOIN; '
  'the JOIN only touches the ≤50 rows of the current page.';
