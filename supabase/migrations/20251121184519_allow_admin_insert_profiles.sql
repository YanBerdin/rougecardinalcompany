drop policy "Users can insert their own profile" on "public"."profiles";

drop view if exists "public"."messages_contact_admin";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare
  normalized_text text;
begin
  if input_text is null then
    return null;
  end if;
  
  -- Normaliser: minuscules, supprimer les accents, remplacer espaces/caractères spéciaux par des tirets
  normalized_text := lower(input_text);
  normalized_text := extensions.unaccent(normalized_text);
  normalized_text := regexp_replace(normalized_text, '[^a-z0-9]+', '-', 'g');
  normalized_text := regexp_replace(normalized_text, '^-+|-+$', '', 'g');
  
  return normalized_text;
end;
$function$
;

create or replace view "public"."messages_contact_admin" as  SELECT mc.id,
    mc.created_at,
    (now() - mc.created_at) AS age,
    mc.firstname,
    mc.lastname,
    TRIM(BOTH FROM ((COALESCE(mc.firstname, ''::text) || ' '::text) || COALESCE(mc.lastname, ''::text))) AS full_name,
    mc.email,
    mc.phone,
    mc.reason,
    mc.message,
    mc.status,
    mc.processed,
    mc.processed_at,
        CASE
            WHEN (mc.processed_at IS NOT NULL) THEN (mc.processed_at - mc.created_at)
            ELSE NULL::interval
        END AS processing_latency,
    mc.consent,
    mc.consent_at,
    mc.spam_score,
    mc.metadata,
    mc.contact_presse_id,
    cp.nom AS contact_presse_nom,
    cp.media AS contact_presse_media,
    cp.fonction AS contact_presse_role
   FROM (public.messages_contact mc
     LEFT JOIN public.contacts_presse cp ON ((cp.id = mc.contact_presse_id)));



  create policy "Users can insert their own profile OR admins can insert any pro"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check (((( SELECT auth.uid() AS uid) = user_id) OR (( SELECT public.is_admin() AS is_admin) = true)));


drop policy "Authenticated users can update medias" on "storage"."objects";


  create policy "Authenticated users can update medias"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'medias'::text))
with check ((bucket_id = 'medias'::text));



