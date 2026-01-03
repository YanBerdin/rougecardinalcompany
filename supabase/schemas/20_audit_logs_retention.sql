-- Schema: Add retention policy to logs_audit
-- Purpose: Auto-expire logs after 90 days for compliance and performance

-- 1. Add retention column with default 90 days expiration
alter table public.logs_audit 
add column if not exists expires_at timestamptz 
default (now() + interval '90 days');

-- 2. Backfill existing logs (set expiration based on creation date)
update public.logs_audit 
set expires_at = created_at + interval '90 days' 
where expires_at is null;

-- 3. Create index for efficient cleanup queries
create index if not exists idx_audit_logs_expires_at 
on public.logs_audit (expires_at) 
where expires_at is not null;

-- 4. Cleanup function (SECURITY DEFINER for elevated permissions)
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Function needs to delete rows regardless of RLS policies
 *   2. Called by scheduled jobs (no user context)
 *   3. Only deletes expired logs based on expires_at column
 * 
 * Risks Evaluated:
 *   - Authorization: Function only deletes expired rows (date-based)
 *   - Input validation: No user input - uses system date
 *   - Privilege escalation: Limited to DELETE on logs_audit only
 */
create or replace function public.cleanup_expired_audit_logs()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from public.logs_audit
  where expires_at < now();
  
  get diagnostics deleted_count = row_count;
  
  return deleted_count;
end;
$$;

-- Grant execute to authenticated (for manual cleanup via admin UI)
grant execute on function public.cleanup_expired_audit_logs() to authenticated;

comment on function public.cleanup_expired_audit_logs() is 
'Purge audit logs older than 90 days. Returns count of deleted rows. SECURITY DEFINER: bypasses RLS for cleanup.';
