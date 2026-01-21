drop policy "Validated analytics collection" on "public"."analytics_events";

drop policy "Validated contact submission" on "public"."messages_contact";

drop view if exists "public"."communiques_presse_dashboard";

drop view if exists "public"."communiques_presse_public";

alter table "public"."home_hero_slides" disable row level security;

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
    from public.data_retention_audit audit
    where audit.table_name = c.table_name
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


CREATE OR REPLACE FUNCTION public.set_slug_if_empty()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if NEW.slug is null or NEW.slug = '' then
    if TG_TABLE_NAME = 'spectacles' and NEW.title is not null then
      NEW.slug := public.generate_slug(NEW.title);
    elsif TG_TABLE_NAME = 'articles_presse' and NEW.title is not null then
      NEW.slug := public.generate_slug(NEW.title);
    elsif TG_TABLE_NAME = 'communiques_presse' and NEW.title is not null then
      NEW.slug := public.generate_slug(NEW.title);
    elsif TG_TABLE_NAME = 'categories' and NEW.name is not null then
      NEW.slug := public.generate_slug(NEW.name);
    elsif TG_TABLE_NAME = 'tags' and NEW.name is not null then
      NEW.slug := public.generate_slug(NEW.name);
    end if;
  end if;
  
  return NEW;
end;
$function$
;


