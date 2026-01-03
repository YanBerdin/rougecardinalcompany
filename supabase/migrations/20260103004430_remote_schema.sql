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

drop table "public"."spectacles_backup_20251209120000";

alter table "public"."medias" add column "thumbnail_path" text;

CREATE INDEX idx_medias_thumbnail_path ON public.medias USING btree (thumbnail_path) WHERE (thumbnail_path IS NOT NULL);

alter table "public"."medias" add constraint "medias_folder_id_fkey" FOREIGN KEY (folder_id) REFERENCES public.media_folders(id) ON DELETE SET NULL not valid;

alter table "public"."medias" validate constraint "medias_folder_id_fkey";

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



