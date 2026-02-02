drop policy "Validated analytics collection" on "public"."analytics_events";

drop policy "Validated contact submission" on "public"."messages_contact";

drop view if exists "public"."articles_presse_public";

drop view if exists "public"."communiques_presse_public";

alter table "public"."spectacles_medias" add column "type" text not null default 'gallery'::text;

CREATE UNIQUE INDEX spectacles_medias_spectacle_id_type_ordre_key ON public.spectacles_medias USING btree (spectacle_id, type, ordre);

alter table "public"."spectacles_medias" add constraint "spectacles_medias_check" CHECK (
CASE
    WHEN (type = 'landscape'::text) THEN (ordre = ANY (ARRAY[0, 1]))
    ELSE true
END) not valid;

alter table "public"."spectacles_medias" validate constraint "spectacles_medias_check";

alter table "public"."spectacles_medias" add constraint "spectacles_medias_spectacle_id_type_ordre_key" UNIQUE using index "spectacles_medias_spectacle_id_type_ordre_key";

alter table "public"."spectacles_medias" add constraint "spectacles_medias_type_check" CHECK ((type = ANY (ARRAY['poster'::text, 'landscape'::text, 'gallery'::text]))) not valid;

alter table "public"."spectacles_medias" validate constraint "spectacles_medias_type_check";

set check_function_bodies = off;

create or replace view "public"."spectacles_landscape_photos_admin" as  SELECT sm.spectacle_id,
    sm.media_id,
    sm.ordre,
    sm.type,
    m.storage_path,
    m.alt_text,
    m.mime,
    m.created_at
   FROM (public.spectacles_medias sm
     JOIN public.medias m ON ((sm.media_id = m.id)))
  WHERE (sm.type = 'landscape'::text)
  ORDER BY sm.spectacle_id, sm.ordre;


create or replace view "public"."spectacles_landscape_photos_public" as  SELECT sm.spectacle_id,
    sm.media_id,
    sm.ordre,
    m.storage_path,
    m.alt_text
   FROM ((public.spectacles_medias sm
     JOIN public.medias m ON ((sm.media_id = m.id)))
     JOIN public.spectacles s ON ((sm.spectacle_id = s.id)))
  WHERE ((sm.type = 'landscape'::text) AND (s.public = true))
  ORDER BY sm.spectacle_id, sm.ordre;


CREATE OR REPLACE FUNCTION public.swap_spectacle_photo_order(p_spectacle_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  -- Swap ordre 0 ↔ 1 for landscape photos
  update public.spectacles_medias
  set ordre = case 
    when ordre = 0 then 1
    when ordre = 1 then 0
    else ordre
  end
  where spectacle_id = p_spectacle_id
    and type = 'landscape'
    and ordre in (0, 1);
end;
$function$
;

create or replace view "public"."articles_presse_public" as  SELECT id,
    title,
    author,
    type,
    slug,
    chapo,
    excerpt,
    source_publication,
    source_url,
    published_at,
    created_at
   FROM public.articles_presse
  WHERE (published_at IS NOT NULL);


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



