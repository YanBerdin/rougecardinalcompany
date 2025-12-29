revoke delete on table "public"."spectacles_backup_20251209120000" from "anon";

revoke insert on table "public"."spectacles_backup_20251209120000" from "anon";

revoke references on table "public"."spectacles_backup_20251209120000" from "anon";

revoke select on table "public"."spectacles_backup_20251209120000" from "anon";

revoke trigger on table "public"."spectacles_backup_20251209120000" from "anon";

revoke truncate on table "public"."spectacles_backup_20251209120000" from "anon";

revoke update on table "public"."spectacles_backup_20251209120000" from "anon";

revoke delete on table "public"."spectacles_backup_20251209120000" from "authenticated";

revoke insert on table "public"."spectacles_backup_20251209120000" from "authenticated";

revoke references on table "public"."spectacles_backup_20251209120000" from "authenticated";

revoke select on table "public"."spectacles_backup_20251209120000" from "authenticated";

revoke trigger on table "public"."spectacles_backup_20251209120000" from "authenticated";

revoke truncate on table "public"."spectacles_backup_20251209120000" from "authenticated";

revoke update on table "public"."spectacles_backup_20251209120000" from "authenticated";

revoke delete on table "public"."spectacles_backup_20251209120000" from "service_role";

revoke insert on table "public"."spectacles_backup_20251209120000" from "service_role";

revoke references on table "public"."spectacles_backup_20251209120000" from "service_role";

revoke select on table "public"."spectacles_backup_20251209120000" from "service_role";

revoke trigger on table "public"."spectacles_backup_20251209120000" from "service_role";

revoke truncate on table "public"."spectacles_backup_20251209120000" from "service_role";

revoke update on table "public"."spectacles_backup_20251209120000" from "service_role";

drop view if exists "public"."communiques_presse_dashboard";

drop view if exists "public"."communiques_presse_public";

drop index if exists "public"."medias_folder_id_idx";

drop index if exists "public"."idx_spectacles_public";

drop table "public"."spectacles_backup_20251209120000";

alter table "public"."medias" drop column "folder_id";

alter table "public"."medias" add column "thumbnail_path" text;

CREATE INDEX idx_medias_thumbnail_path ON public.medias USING btree (thumbnail_path) WHERE (thumbnail_path IS NOT NULL);

CREATE INDEX idx_spectacles_public ON public.spectacles USING btree (public);

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



