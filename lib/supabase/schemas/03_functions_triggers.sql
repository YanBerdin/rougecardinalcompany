  -- 03_functions_triggers.sql
  -- helper functions and triggers

  -- is_admin helper: checks profiles.role = 'admin' for current auth.uid()
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

  -- update_updated_at_column
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

  -- audit_trigger (robust)
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

  -- to_tsvector helper (immutable)
  create or replace function public.to_tsvector_french(text)
  returns tsvector
  language sql
  immutable
  as $$
    select to_tsvector('french', coalesce($1, ''));
  $$;

  -- spectacles search vector trigger
  create or replace function public.spectacles_search_vector_trigger()
  returns trigger
  language plpgsql
  as $$
  begin
    new.search_vector := to_tsvector('french', coalesce(new.titre,'') || ' ' || coalesce(new.description,''));
    return new;
  end;
  $$;

  drop trigger if exists trg_spectacles_search_vector on public.spectacles;
  create trigger trg_spectacles_search_vector
  before insert or update on public.spectacles
  for each row execute function public.spectacles_search_vector_trigger();

  -- articles search vector trigger
  create or replace function public.articles_search_vector_trigger()
  returns trigger
  language plpgsql
  as $$
  begin
    new.search_vector := to_tsvector('french', coalesce(new.titre,'') || ' ' || coalesce(new.chapo,'') || ' ' || coalesce(new.contenu,''));
    return new;
  end;
  $$;

  drop trigger if exists trg_articles_search_vector on public.articles_presse;
  create trigger trg_articles_search_vector
  before insert or update on public.articles_presse
  for each row execute function public.articles_search_vector_trigger();

  -- trigger: update_updated_at_column across tables
  DO $$
  DECLARE
    tbl text;
  BEGIN
    FOR tbl IN SELECT unnest(array[
      'public.profiles', 'public.medias', 'public.membres_equipe', 'public.lieux',
      'public.spectacles', 'public.evenements', 'public.articles_presse', 'public.abonnes_newsletter', 'public.messages_contact', 'public.configurations_site'
    ])
    LOOP
      EXECUTE format('drop trigger if exists trg_update_updated_at on %s;', tbl);
      EXECUTE format('create trigger trg_update_updated_at
before update on %s
for each row
execute function public.update_updated_at_column();', tbl);
    END LOOP;
  END;
  $$;

  -- attach audit trigger to tables
  DO $$
  DECLARE
    audit_tables text[] := array[
      'public.profiles', 'public.medias', 'public.membres_equipe', 'public.lieux',
      'public.spectacles', 'public.evenements', 'public.articles_presse', 'public.abonnes_newsletter', 'public.messages_contact', 'public.configurations_site'
    ];
    tbl text;
  BEGIN
    FOREACH tbl IN ARRAY audit_tables
    LOOP
      EXECUTE format('drop trigger if exists trg_audit on %s;', tbl);
      EXECUTE format('create trigger trg_audit
after insert or update or delete on %s
for each row
execute function public.audit_trigger();', tbl);
    END LOOP;
  END;
  $$;
