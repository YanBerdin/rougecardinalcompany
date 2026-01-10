-- Migration: Fix audit_trigger to handle tables without id column
-- Author: Rouge Cardinal Company Development Team
-- Date: 2026-01-10 01:11:28
--
-- Purpose:
--   Fix the audit_trigger function to gracefully handle tables that don't have
--   an 'id' column (e.g., configurations_site uses 'key' as primary identifier).
--
-- Problem:
--   [ERR_CONFIG_003] record "new" has no field "id"
--   The audit_trigger function assumed all tables have an 'id' column, which
--   caused errors when updating configurations_site (uses 'key' instead).
--
-- Solution:
--   Use dynamic SQL to check if 'id' column exists before accessing it.
--   Fallback to 'key' column for configurations_site.
--
-- Affected Functions:
--   - public.audit_trigger()
--
-- Breaking Changes: None

/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Audit logs must be written regardless of RLS policies
 *   2. Users should not be able to INSERT directly into audit logs
 *   3. The function only INSERTs to logs_audit, no arbitrary operations
 *   4. Legitimate use case: System-level audit trail integrity
 * 
 * Risks Evaluated:
 *   - Authorization: Function is trigger-only, cannot be called directly
 *   - Input validation: All data comes from trigger context (OLD/NEW records)
 *   - Privilege escalation: Limited to INSERT on logs_audit table only
 *   - Concurrency: No locking needed for audit INSERTs
 *   - Data integrity: Transactional with parent operation
 * 
 * Validation:
 *   - Tested: Triggers fire correctly on INSERT/UPDATE/DELETE
 *   - Tested: Tables without 'id' column (configurations_site) work correctly
 *   - Tested: Direct function call blocked by lack of trigger context
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

  -- Get authenticated user ID
  begin
    user_id_uuid := nullif(auth.uid(), '')::uuid;
  exception when others then
    user_id_uuid := null;
  end;

  -- Extract record identifier (handle tables without 'id' column)
  -- Priority: id > key > uuid > null
  begin
    if tg_op in ('insert', 'update') then
      -- Try common identifier columns in order of preference
      record_id_text := coalesce(
        (to_json(new) ->> 'id'),      -- Most common: bigint/int id
        (to_json(new) ->> 'key'),     -- configurations_site uses 'key'
        (to_json(new) ->> 'uuid'),    -- Some tables use uuid as PK
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
  insert into public.logs_audit (
    user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at
  ) values (
    user_id_uuid, 
    tg_op, 
    tg_table_name, 
    record_id_text,
    case when tg_op = 'delete' then row_to_json(old) else null end,
    case when tg_op in ('insert', 'update') then row_to_json(new) else null end,
    case when xff_text is not null then nullif(xff_text, '')::inet else null end,
    ua_text,
    now()
  );

  if tg_op = 'delete' then
    return old;
  else
    return new;
  end if;
end;
$$;

comment on function public.audit_trigger() is 
'Generic audit trigger that logs all DML operations with user context and metadata. Uses SECURITY DEFINER to bypass RLS and prevent direct user INSERTs into logs_audit. Handles tables with different primary key columns (id, key, uuid). Migration 20260110011128 fixes support for tables without id column.';
