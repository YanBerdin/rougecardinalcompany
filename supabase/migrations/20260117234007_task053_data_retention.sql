drop policy "Validated analytics collection" on "public"."analytics_events";

drop policy "Validated contact submission" on "public"."messages_contact";

drop view if exists "public"."communiques_presse_dashboard";

drop view if exists "public"."communiques_presse_public";


  create table "public"."data_retention_audit" (
    "id" bigint generated always as identity not null,
    "table_name" text not null,
    "rows_deleted" integer not null default 0,
    "execution_time_ms" integer,
    "error_message" text,
    "status" text not null,
    "executed_at" timestamp with time zone not null default now(),
    "metadata" jsonb default '{}'::jsonb
      );


alter table "public"."data_retention_audit" enable row level security;


  create table "public"."data_retention_config" (
    "id" bigint generated always as identity not null,
    "table_name" text not null,
    "retention_days" integer not null,
    "date_column" text not null,
    "enabled" boolean not null default true,
    "last_run_at" timestamp with time zone,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."data_retention_config" enable row level security;

alter table "public"."home_hero_slides" disable row level security;

CREATE UNIQUE INDEX data_retention_audit_pkey ON public.data_retention_audit USING btree (id);

CREATE UNIQUE INDEX data_retention_config_pkey ON public.data_retention_config USING btree (id);

CREATE UNIQUE INDEX data_retention_config_table_name_key ON public.data_retention_config USING btree (table_name);

CREATE INDEX idx_data_retention_config_enabled ON public.data_retention_config USING btree (enabled) WHERE (enabled = true);

CREATE INDEX idx_data_retention_config_table ON public.data_retention_config USING btree (table_name);

CREATE INDEX idx_retention_audit_executed_at ON public.data_retention_audit USING btree (executed_at DESC);

CREATE INDEX idx_retention_audit_status ON public.data_retention_audit USING btree (status, executed_at DESC);

CREATE INDEX idx_retention_audit_table ON public.data_retention_audit USING btree (table_name, executed_at DESC);

alter table "public"."data_retention_audit" add constraint "data_retention_audit_pkey" PRIMARY KEY using index "data_retention_audit_pkey";

alter table "public"."data_retention_config" add constraint "data_retention_config_pkey" PRIMARY KEY using index "data_retention_config_pkey";

alter table "public"."data_retention_audit" add constraint "data_retention_audit_status_check" CHECK ((status = ANY (ARRAY['success'::text, 'partial'::text, 'failed'::text]))) not valid;

alter table "public"."data_retention_audit" validate constraint "data_retention_audit_status_check";

alter table "public"."data_retention_config" add constraint "data_retention_config_retention_days_check" CHECK ((retention_days > 0)) not valid;

alter table "public"."data_retention_config" validate constraint "data_retention_config_retention_days_check";

alter table "public"."data_retention_config" add constraint "data_retention_config_table_name_key" UNIQUE using index "data_retention_config_table_name_key";

alter table "public"."data_retention_config" add constraint "valid_table_name" CHECK ((table_name ~ '^[a-z_]+$'::text)) not valid;

alter table "public"."data_retention_config" validate constraint "valid_table_name";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_retention_health()
 RETURNS TABLE(table_name text, issue text, severity text)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  return query
  select 
    c.table_name,
    case 
      when c.last_run_at is null then 
        'Jamais exécuté'
      when c.last_run_at < now() - interval '2 days' then 
        format('Dernière exécution: %s (>48h)', c.last_run_at::text)
      when a.status = 'failed' then 
        format('Dernière exécution échouée: %s', a.error_message)
      when a.status = 'partial' then 
        'Exécution partielle - vérifier logs'
      else
        null
    end as issue,
    case 
      when c.last_run_at is null then 'critical'
      when c.last_run_at < now() - interval '7 days' then 'critical'
      when c.last_run_at < now() - interval '2 days' then 'warning'
      when a.status = 'failed' then 'critical'
      when a.status = 'partial' then 'warning'
      else 'ok'
    end as severity
  from public.data_retention_config c
  left join lateral (
    select status, error_message, executed_at
    from public.data_retention_audit
    where table_name = c.table_name
    order by executed_at desc
    limit 1
  ) a on true
  where c.enabled = true
    and (
      c.last_run_at is null 
      or c.last_run_at < now() - interval '2 days'
      or a.status in ('failed', 'partial')
    );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_expired_data(p_table_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_config record;
  v_deleted_count integer := 0;
  v_start_time timestamptz;
  v_execution_time_ms integer;
  v_sql text;
  v_error_msg text;
  v_status text := 'success';
begin
  v_start_time := clock_timestamp();
  
  -- Récupérer la configuration pour cette table (whitelist validation)
  select * into v_config
  from public.data_retention_config
  where table_name = p_table_name and enabled = true;
  
  if not found then
    raise exception 'No active retention config found for table: %', p_table_name;
  end if;
  
  -- Construction de la requête DELETE dynamique
  -- %I = identifier escaping pour protection SQL injection
  v_sql := format(
    'delete from public.%I where %I < now() - interval ''%s days''',
    v_config.table_name,
    v_config.date_column,
    v_config.retention_days
  );
  
  begin
    -- Exécution de la purge
    execute v_sql;
    get diagnostics v_deleted_count = row_count;
    
    -- Mise à jour de last_run_at
    update public.data_retention_config
    set last_run_at = now()
    where table_name = p_table_name;
    
  exception when others then
    v_status := 'failed';
    v_error_msg := sqlerrm;
    v_deleted_count := 0;
  end;
  
  -- Calcul du temps d'exécution
  v_execution_time_ms := extract(milliseconds from clock_timestamp() - v_start_time)::integer;
  
  -- Insertion dans l'audit trail
  insert into public.data_retention_audit (
    table_name, rows_deleted, execution_time_ms, error_message, status, metadata
  ) values (
    p_table_name, 
    v_deleted_count, 
    v_execution_time_ms, 
    v_error_msg, 
    v_status,
    jsonb_build_object(
      'retention_days', v_config.retention_days,
      'date_column', v_config.date_column,
      'sql', v_sql
    )
  );
  
  return jsonb_build_object(
    'table', p_table_name,
    'deleted', v_deleted_count,
    'status', v_status,
    'execution_time_ms', v_execution_time_ms,
    'error', v_error_msg
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_old_contact_messages()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_deleted_count integer := 0;
  v_retention_days integer;
  v_start_time timestamptz;
  v_execution_time_ms integer;
begin
  v_start_time := clock_timestamp();
  
  -- Récupérer la rétention configurée
  select retention_days into v_retention_days
  from public.data_retention_config
  where table_name = 'messages_contact' and enabled = true;
  
  if not found then
    raise exception 'Retention config not found for messages_contact';
  end if;
  
  -- Suppression directe des messages anciens
  -- Note: Si besoin d'archivage, ajouter INSERT INTO archive_table avant DELETE
  delete from public.messages_contact
  where created_at < now() - make_interval(days => v_retention_days);
    -- Optionnel: ajouter filtre statut si colonne existe
    -- AND (status = 'processed' OR status = 'closed')
  
  get diagnostics v_deleted_count = row_count;
  
  -- Mise à jour last_run_at
  update public.data_retention_config
  set last_run_at = now()
  where table_name = 'messages_contact';
  
  v_execution_time_ms := extract(milliseconds from clock_timestamp() - v_start_time)::integer;
  
  -- Audit
  insert into public.data_retention_audit (
    table_name, rows_deleted, execution_time_ms, status, metadata
  ) values (
    'messages_contact', 
    v_deleted_count, 
    v_execution_time_ms, 
    'success',
    jsonb_build_object(
      'retention_days', v_retention_days,
      'filter', 'created_at expired (1 year default)',
      'archived', 0
    )
  );
  
  return jsonb_build_object(
    'table', 'messages_contact',
    'deleted', v_deleted_count,
    'archived', 0,
    'status', 'success',
    'execution_time_ms', v_execution_time_ms
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_unsubscribed_newsletter()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_deleted_count integer := 0;
  v_retention_days integer;
  v_start_time timestamptz;
  v_execution_time_ms integer;
begin
  v_start_time := clock_timestamp();
  
  -- Récupérer la rétention configurée
  select retention_days into v_retention_days
  from public.data_retention_config
  where table_name = 'abonnes_newsletter' and enabled = true;
  
  if not found then
    raise exception 'Retention config not found for abonnes_newsletter';
  end if;
  
  -- Supprimer UNIQUEMENT les désabonnements expirés
  delete from public.abonnes_newsletter
  where subscribed = false
    and unsubscribed_at is not null
    and unsubscribed_at < now() - make_interval(days => v_retention_days);
  
  get diagnostics v_deleted_count = row_count;
  
  -- Mise à jour last_run_at
  update public.data_retention_config
  set last_run_at = now()
  where table_name = 'abonnes_newsletter';
  
  v_execution_time_ms := extract(milliseconds from clock_timestamp() - v_start_time)::integer;
  
  -- Audit
  insert into public.data_retention_audit (
    table_name, rows_deleted, execution_time_ms, status, metadata
  ) values (
    'abonnes_newsletter', 
    v_deleted_count, 
    v_execution_time_ms, 
    'success',
    jsonb_build_object(
      'retention_days', v_retention_days,
      'filter', 'subscribed = false AND unsubscribed_at expired'
    )
  );
  
  return jsonb_build_object(
    'table', 'abonnes_newsletter',
    'deleted', v_deleted_count,
    'status', 'success',
    'execution_time_ms', v_execution_time_ms
  );
end;
$function$
;

create or replace view "public"."data_retention_monitoring" as  SELECT c.id,
    c.table_name,
    c.retention_days,
    c.date_column,
    c.enabled,
    c.description,
    c.last_run_at,
    c.created_at AS config_created_at,
    c.updated_at AS config_updated_at,
    a.rows_deleted AS last_deleted_count,
    a.execution_time_ms AS last_execution_ms,
    a.status AS last_status,
    a.error_message AS last_error,
    a.executed_at AS last_execution,
    a.metadata AS last_metadata,
        CASE
            WHEN (c.last_run_at IS NULL) THEN 'never_run'::text
            WHEN (c.last_run_at < (now() - '7 days'::interval)) THEN 'critical'::text
            WHEN (c.last_run_at < (now() - '2 days'::interval)) THEN 'warning'::text
            WHEN (a.status = 'failed'::text) THEN 'failed'::text
            WHEN (a.status = 'partial'::text) THEN 'warning'::text
            ELSE 'ok'::text
        END AS health_status,
        CASE
            WHEN (c.last_run_at IS NULL) THEN NULL::timestamp with time zone
            ELSE (c.last_run_at + '1 day'::interval)
        END AS next_run_estimated
   FROM (public.data_retention_config c
     LEFT JOIN LATERAL ( SELECT data_retention_audit.rows_deleted,
            data_retention_audit.execution_time_ms,
            data_retention_audit.status,
            data_retention_audit.error_message,
            data_retention_audit.executed_at,
            data_retention_audit.metadata
           FROM public.data_retention_audit
          WHERE (data_retention_audit.table_name = c.table_name)
          ORDER BY data_retention_audit.executed_at DESC
         LIMIT 1) a ON (true))
  ORDER BY
        CASE c.enabled
            WHEN true THEN 0
            ELSE 1
        END, c.table_name;


create or replace view "public"."data_retention_recent_audit" as  SELECT id,
    table_name,
    rows_deleted,
    execution_time_ms,
    status,
    error_message,
    executed_at,
    metadata,
        CASE
            WHEN (executed_at >= (now() - '01:00:00'::interval)) THEN ((EXTRACT(minutes FROM (now() - executed_at)))::text || ' min ago'::text)
            WHEN (executed_at >= (now() - '1 day'::interval)) THEN ((EXTRACT(hours FROM (now() - executed_at)))::text || ' hours ago'::text)
            ELSE ((EXTRACT(days FROM (now() - executed_at)))::text || ' days ago'::text)
        END AS time_ago
   FROM public.data_retention_audit
  WHERE (executed_at >= (now() - '7 days'::interval))
  ORDER BY executed_at DESC
 LIMIT 100;


create or replace view "public"."data_retention_stats" as  SELECT table_name,
    count(*) FILTER (WHERE (executed_at >= (now() - '1 day'::interval))) AS executions_24h,
    sum(rows_deleted) FILTER (WHERE (executed_at >= (now() - '1 day'::interval))) AS rows_deleted_24h,
    count(*) FILTER (WHERE (executed_at >= (now() - '7 days'::interval))) AS executions_7d,
    sum(rows_deleted) FILTER (WHERE (executed_at >= (now() - '7 days'::interval))) AS rows_deleted_7d,
    count(*) FILTER (WHERE (executed_at >= (now() - '30 days'::interval))) AS executions_30d,
    sum(rows_deleted) FILTER (WHERE (executed_at >= (now() - '30 days'::interval))) AS rows_deleted_30d,
    avg(execution_time_ms) AS avg_execution_ms,
    max(execution_time_ms) AS max_execution_ms,
    (((count(*) FILTER (WHERE (status = 'success'::text)))::numeric * 100.0) / (NULLIF(count(*), 0))::numeric) AS success_rate_pct,
    max(executed_at) AS last_executed_at
   FROM public.data_retention_audit
  GROUP BY table_name
  ORDER BY table_name;


CREATE OR REPLACE FUNCTION public.audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;

create or replace view "public"."communiques_presse_dashboard" as  SELECT cp.id,
    cp.title,
    cp.slug,
    cp.description,
    cp.date_publication,
    cp.public,
    cp.ordre_affichage,
    pdf_m.filename AS pdf_filename,
    round(((COALESCE(cp.file_size_bytes, pdf_m.size_bytes))::numeric / 1024.0), 2) AS pdf_size_kb,
    cp.image_url,
    im.filename AS image_filename,
    s.title AS spectacle_titre,
    e.date_debut AS evenement_date,
    p.display_name AS createur,
    cp.created_at,
    cp.updated_at,
    count(cc.category_id) AS nb_categories,
    count(ct.tag_id) AS nb_tags
   FROM (((((((((public.communiques_presse cp
     LEFT JOIN public.communiques_medias pdf_cm ON (((cp.id = pdf_cm.communique_id) AND (pdf_cm.ordre = '-1'::integer))))
     LEFT JOIN public.medias pdf_m ON ((pdf_cm.media_id = pdf_m.id)))
     LEFT JOIN public.communiques_medias cm ON (((cp.id = cm.communique_id) AND (cm.ordre = 0))))
     LEFT JOIN public.medias im ON ((cm.media_id = im.id)))
     LEFT JOIN public.spectacles s ON ((cp.spectacle_id = s.id)))
     LEFT JOIN public.evenements e ON ((cp.evenement_id = e.id)))
     LEFT JOIN public.profiles p ON ((cp.created_by = p.user_id)))
     LEFT JOIN public.communiques_categories cc ON ((cp.id = cc.communique_id)))
     LEFT JOIN public.communiques_tags ct ON ((cp.id = ct.communique_id)))
  WHERE (( SELECT public.is_admin() AS is_admin) = true)
  GROUP BY cp.id, pdf_m.filename, pdf_m.size_bytes, im.filename, cp.image_url, s.title, e.date_debut, p.display_name
  ORDER BY cp.created_at DESC;


create or replace view "public"."communiques_presse_public" as  SELECT cp.id,
    cp.title,
    cp.slug,
    cp.description,
    cp.date_publication,
    cp.ordre_affichage,
    cp.spectacle_id,
    cp.evenement_id,
    pdf_m.filename AS pdf_filename,
    cp.file_size_bytes,
        CASE
            WHEN (cp.file_size_bytes IS NOT NULL) THEN
            CASE
                WHEN (cp.file_size_bytes < 1024) THEN ((cp.file_size_bytes)::text || ' B'::text)
                WHEN (cp.file_size_bytes < 1048576) THEN ((round(((cp.file_size_bytes)::numeric / 1024.0), 1))::text || ' KB'::text)
                ELSE ((round(((cp.file_size_bytes)::numeric / 1048576.0), 1))::text || ' MB'::text)
            END
            ELSE (pdf_m.size_bytes)::text
        END AS file_size_display,
    pdf_m.storage_path AS pdf_path,
    concat('/storage/v1/object/public/medias/', pdf_m.storage_path) AS file_url,
    cp.image_url,
    cm.ordre AS image_ordre,
    im.filename AS image_filename,
    im.storage_path AS image_path,
    concat('/storage/v1/object/public/medias/', im.storage_path) AS image_file_url,
    s.title AS spectacle_titre,
    e.date_debut AS evenement_date,
    l.nom AS lieu_nom,
    array_agg(DISTINCT c.name) FILTER (WHERE (c.name IS NOT NULL)) AS categories,
    array_agg(DISTINCT t.name) FILTER (WHERE (t.name IS NOT NULL)) AS tags
   FROM (((((((((((public.communiques_presse cp
     LEFT JOIN public.communiques_medias pdf_cm ON (((cp.id = pdf_cm.communique_id) AND (pdf_cm.ordre = '-1'::integer))))
     LEFT JOIN public.medias pdf_m ON ((pdf_cm.media_id = pdf_m.id)))
     LEFT JOIN public.communiques_medias cm ON (((cp.id = cm.communique_id) AND (cm.ordre = 0))))
     LEFT JOIN public.medias im ON ((cm.media_id = im.id)))
     LEFT JOIN public.spectacles s ON ((cp.spectacle_id = s.id)))
     LEFT JOIN public.evenements e ON ((cp.evenement_id = e.id)))
     LEFT JOIN public.lieux l ON ((e.lieu_id = l.id)))
     LEFT JOIN public.communiques_categories cc ON ((cp.id = cc.communique_id)))
     LEFT JOIN public.categories c ON (((cc.category_id = c.id) AND (c.is_active = true))))
     LEFT JOIN public.communiques_tags ct ON ((cp.id = ct.communique_id)))
     LEFT JOIN public.tags t ON ((ct.tag_id = t.id)))
  WHERE ((cp.public = true) AND (EXISTS ( SELECT 1
           FROM public.communiques_medias pdf_check
          WHERE ((pdf_check.communique_id = cp.id) AND (pdf_check.ordre = '-1'::integer)))))
  GROUP BY cp.id, pdf_m.filename, pdf_m.size_bytes, pdf_m.storage_path, cm.ordre, im.filename, im.storage_path, cp.image_url, s.title, e.date_debut, l.nom
  ORDER BY cp.ordre_affichage, cp.date_publication DESC;


grant delete on table "public"."data_retention_audit" to "anon";

grant insert on table "public"."data_retention_audit" to "anon";

grant references on table "public"."data_retention_audit" to "anon";

grant select on table "public"."data_retention_audit" to "anon";

grant trigger on table "public"."data_retention_audit" to "anon";

grant truncate on table "public"."data_retention_audit" to "anon";

grant update on table "public"."data_retention_audit" to "anon";

grant delete on table "public"."data_retention_audit" to "authenticated";

grant insert on table "public"."data_retention_audit" to "authenticated";

grant references on table "public"."data_retention_audit" to "authenticated";

grant select on table "public"."data_retention_audit" to "authenticated";

grant trigger on table "public"."data_retention_audit" to "authenticated";

grant truncate on table "public"."data_retention_audit" to "authenticated";

grant update on table "public"."data_retention_audit" to "authenticated";

grant delete on table "public"."data_retention_audit" to "service_role";

grant insert on table "public"."data_retention_audit" to "service_role";

grant references on table "public"."data_retention_audit" to "service_role";

grant select on table "public"."data_retention_audit" to "service_role";

grant trigger on table "public"."data_retention_audit" to "service_role";

grant truncate on table "public"."data_retention_audit" to "service_role";

grant update on table "public"."data_retention_audit" to "service_role";

grant delete on table "public"."data_retention_config" to "anon";

grant insert on table "public"."data_retention_config" to "anon";

grant references on table "public"."data_retention_config" to "anon";

grant select on table "public"."data_retention_config" to "anon";

grant trigger on table "public"."data_retention_config" to "anon";

grant truncate on table "public"."data_retention_config" to "anon";

grant update on table "public"."data_retention_config" to "anon";

grant delete on table "public"."data_retention_config" to "authenticated";

grant insert on table "public"."data_retention_config" to "authenticated";

grant references on table "public"."data_retention_config" to "authenticated";

grant select on table "public"."data_retention_config" to "authenticated";

grant trigger on table "public"."data_retention_config" to "authenticated";

grant truncate on table "public"."data_retention_config" to "authenticated";

grant update on table "public"."data_retention_config" to "authenticated";

grant delete on table "public"."data_retention_config" to "service_role";

grant insert on table "public"."data_retention_config" to "service_role";

grant references on table "public"."data_retention_config" to "service_role";

grant select on table "public"."data_retention_config" to "service_role";

grant trigger on table "public"."data_retention_config" to "service_role";

grant truncate on table "public"."data_retention_config" to "service_role";

grant update on table "public"."data_retention_config" to "service_role";

grant insert on table "public"."logs_audit" to "anon";

grant insert on table "public"."logs_audit" to "authenticated";


  create policy "Admins can view retention audit"
  on "public"."data_retention_audit"
  as permissive
  for select
  to authenticated
using (( SELECT public.is_admin() AS is_admin));



  create policy "Admins can manage retention config"
  on "public"."data_retention_config"
  as permissive
  for all
  to authenticated
using (( SELECT public.is_admin() AS is_admin))
with check (( SELECT public.is_admin() AS is_admin));



  create policy "Admins can view all home hero slides"
  on "public"."home_hero_slides"
  as permissive
  for select
  to authenticated
using (( SELECT public.is_admin() AS is_admin));


CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.data_retention_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


