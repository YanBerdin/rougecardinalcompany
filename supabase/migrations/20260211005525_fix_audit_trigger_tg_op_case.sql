-- Migration: Fix audit_trigger tg_op case sensitivity
-- Purpose: tg_op returns 'INSERT', 'UPDATE', 'DELETE' in UPPERCASE
--          but code was comparing with lowercase, causing record_id and new_values to be NULL
-- Affected: public.audit_trigger() function
-- Impact: All audit logs will now correctly capture record_id and new_values

/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Audit logs must be written by triggers only, not by users directly
 *   2. Function needs INSERT permission on logs_audit regardless of caller
 *   3. SECURITY INVOKER requires granting INSERT to all users (insecure)
 *   4. Legitimate use case: Automatic audit trail for all table modifications
 * 
 * Risks Evaluated:
 *   - Authorization: Function is ONLY called by database triggers (no direct call)
 *   - Input validation: All inputs come from trigger context (OLD/NEW records)
 *   - Privilege escalation: Limited to INSERT on logs_audit only
 *   - Concurrency: No race conditions (each trigger execution is atomic)
 *   - Data integrity: Single INSERT per trigger execution
 * 
 * Validation:
 *   - Tested: Triggers fire correctly on INSERT/UPDATE/DELETE
 *   - Tested: Tables without 'id' column (configurations_site) work correctly
 *   - Tested: Direct function call blocked by lack of trigger context
 *   - Tested: Users cannot INSERT directly into logs_audit after revoke
 *   - Tested: tg_op UPPERCASE comparisons produce correct record_id and new_values
 */
create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  headers_json json;
  xff_text text;
  ua_text text;
  user_id_uuid uuid := null;
  record_id_text text := null;
begin
  -- Parse request headers for IP and user agent
  begin
    headers_json := coalesce(current_setting('request.headers', true), '{}')::json;
  exception when others then
    headers_json := '{}';
  end;

  xff_text := headers_json ->> 'x-forwarded-for';
  ua_text := headers_json ->> 'user-agent';

  if xff_text is not null and btrim(xff_text) = '' then
    xff_text := null;
  end if;
  if ua_text is not null and btrim(ua_text) = '' then
    ua_text := null;
  end if;

  -- Get authenticated user ID (auth.uid() returns uuid or NULL natively)
  begin
    user_id_uuid := auth.uid();
  exception when others then
    user_id_uuid := null;
  end;

  -- Extract record identifier (handle tables without 'id' column)
  -- Priority: id > key > uuid > null
  -- FIX: tg_op returns UPPERCASE ('INSERT', 'UPDATE', 'DELETE')
  begin
    if tg_op in ('INSERT', 'UPDATE') then
      record_id_text := coalesce(
        (to_json(new) ->> 'id'),
        (to_json(new) ->> 'key'),
        (to_json(new) ->> 'uuid'),
        null
      );
    else
      record_id_text := coalesce(
        (to_json(old) ->> 'id'),
        (to_json(old) ->> 'key'),
        (to_json(old) ->> 'uuid'),
        null
      );
    end if;
  exception when others then
    record_id_text := null;
  end;

  -- Insert audit log entry
  -- FIX: tg_op comparisons now use UPPERCASE
  insert into public.logs_audit (
    user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at
  ) values (
    user_id_uuid,
    tg_op,
    tg_table_name,
    record_id_text,
    case when tg_op = 'DELETE' then row_to_json(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then row_to_json(new) else null end,
    case when xff_text is not null then nullif(xff_text, '')::inet else null end,
    ua_text,
    now()
  );

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

comment on function public.audit_trigger() is 
'Generic audit trigger that logs all DML operations with user context and metadata. Uses SECURITY DEFINER to bypass RLS and prevent direct user INSERTs into logs_audit. Handles tables with different primary key columns (id, key, uuid). FIX 20260110011128: support tables without id column. FIX 20260211005525: tg_op case sensitivity (UPPERCASE). FIX 20260211: auth.uid() type mismatch (nullif uuid/text).';
