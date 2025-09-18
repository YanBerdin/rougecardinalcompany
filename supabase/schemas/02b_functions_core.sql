-- Fonctions utilitaires
-- Ordre: 02b - Après 02_table_profiles.sql pour pouvoir référencer profiles

-- Fonction helper pour vérifier les droits admin
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
create or replace function public.audit_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  headers_json json;
  xff_text text;
  ua_text text;
  user_id_uuid uuid := null;
  record_id_text text;
begin
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

  begin
    user_id_uuid := nullif(auth.uid(), '')::uuid;
  exception when others then
    user_id_uuid := null;
  end;

  begin
    if tg_op in ('insert','update') then
      record_id_text := coalesce(new.id::text, null);
    else
      record_id_text := coalesce(old.id::text, null);
    end if;
  exception when others then
    record_id_text := null;
  end;

  insert into public.logs_audit (
    user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at
  ) values (
    user_id_uuid, tg_op, tg_table_name, record_id_text,
    case when tg_op = 'delete' then row_to_json(old) else null end,
    case when tg_op in ('insert','update') then row_to_json(new) else null end,
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
'Generic audit trigger that logs all DML operations with user context and metadata. Uses SECURITY INVOKER to maintain user context for auditing - the audit log should reflect the actual user performing the operation, not an elevated service account. Includes robust error handling for missing headers or auth context.';

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
