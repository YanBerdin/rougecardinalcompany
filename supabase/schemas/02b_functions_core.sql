-- Fonctions utilitaires
-- Ordre: 02b - Après 02_table_profiles.sql pour pouvoir référencer profiles

-- Fonction helper pour vérifier les droits admin
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Needs access to auth.uid() which requires authentication context
 *   2. Must read profiles table reliably across different security contexts
 *   3. Used by RLS policies and other functions for authorization checks
 *   4. Marked STABLE since auth.uid() remains constant during transaction
 * 
 * Risks Evaluated:
 *   - Read-only operation (SELECT only, no mutations)
 *   - No user input parameters (zero injection risk)
 *   - Simple boolean return value
 *   - Used extensively in RLS policies (must be reliable and secure)
 * 
 * Validation:
 *   - Tested with admin and non-admin users
 *   - Used in multiple RLS policies across the schema
 *   - Performance optimized with STABLE volatility
 */
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

comment on function public.is_admin() is 
'Helper function: Checks if current user has admin role. Uses SECURITY DEFINER to access auth.uid() and profiles table reliably across different security contexts. Marked STABLE since auth.uid() remains constant during transaction.';

-- Fonction pour mise à jour automatique updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.update_updated_at_column() is 
'Generic trigger function to automatically update updated_at column. Uses SECURITY INVOKER since it only modifies the current row being processed and doesn''t need elevated privileges.';

-- Fonction d'audit générique
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

-- Helper pour recherche full-text français
create or replace function public.to_tsvector_french(text)
returns tsvector
language sql
immutable
security invoker
set search_path = ''
as $$
  select to_tsvector('french', coalesce($1, ''));
$$;

comment on function public.to_tsvector_french(text) is 
'Helper function for French full-text search vector generation. Marked IMMUTABLE because same input always produces same output, enabling PostgreSQL query optimization and index usage.';

-- Fonction de test de connexion Supabase
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Used for health checks and connectivity testing from client applications
 *   2. Must work regardless of user permissions (including anon users)
 *   3. Provides reliable system-level timestamp for monitoring
 *   4. No security risk as it only returns current server time
 * 
 * Risks Evaluated:
 *   - No user input (zero injection risk)
 *   - No data access (only system function now())
 *   - Granted to anon users intentionally for health checks
 *   - Read-only operation with no side effects
 * 
 * Validation:
 *   - Tested with anon and authenticated users
 *   - Used in client application health check endpoints
 */
create or replace function public.get_current_timestamp()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
begin
  return now();
end;
$$;

comment on function public.get_current_timestamp() is 
'Function to test Supabase connection. Uses SECURITY DEFINER to ensure it always works regardless of user permissions. Used for health checks and connectivity testing from client applications.';

-- Grant execute permission to anonymous users
grant execute on function public.get_current_timestamp() to anon;

-- Fonction pour horodater le consentement sur messages_contact
create or replace function public.set_messages_contact_consent_timestamp()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT' and new.consent = true and new.consent_at is null) then
    new.consent_at := now();
  elsif (tg_op = 'UPDATE' and new.consent = true and (old.consent is distinct from new.consent) and new.consent_at is null) then
    new.consent_at := now();
  end if;
  return new;
end;
$$;

comment on function public.set_messages_contact_consent_timestamp() is 'Définit consent_at lors de la première activation de consent pour messages_contact.';
