-- Note: pg_net extension line removed (not available on Supabase Cloud, caused silent failure)
-- The function reorder_hero_slides was re-created via hotfix migration 20251204133540

alter table "public"."home_hero_slides" add column "alt_text" text not null default ''::text;

alter table "public"."home_hero_slides" add constraint "home_hero_slides_alt_text_length" CHECK ((char_length(alt_text) <= 125)) not valid;

alter table "public"."home_hero_slides" validate constraint "home_hero_slides_alt_text_length";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.reorder_hero_slides(order_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  -- Authorization check (defense-in-depth)
  if not (select public.is_admin()) then
    raise exception 'permission denied: admin role required';
  end if;

  -- Advisory lock to prevent concurrent updates
  perform pg_advisory_xact_lock(hashtext('reorder_hero_slides'));

  -- Input validation
  if jsonb_typeof(order_data) is distinct from 'array' then
    raise exception 'order_data must be a json array';
  end if;

  -- Process updates
  update public.home_hero_slides as h
  set position = (item->>'position')::integer
  from jsonb_array_elements(order_data) as item
  where h.id = (item->>'id')::bigint;

end;
$function$
;

CREATE OR REPLACE FUNCTION public.restore_content_version(p_version_id bigint, p_change_summary text DEFAULT 'Restauration d''une version antérieure'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  version_record record;
  restore_success boolean := false;
begin
  -- Récupérer les informations de la version à restaurer
  select 
    entity_type,
    entity_id,
    content_snapshot
  into version_record
  from public.content_versions
  where id = p_version_id;
  
  -- Vérifier que la version existe
  if version_record is null then
    return false;
  end if;
  
  -- Restaurer selon le type d'entité
  if version_record.entity_type = 'spectacle' then
    update public.spectacles
    set 
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      public = (version_record.content_snapshot->>'public')::boolean,
      image_url = version_record.content_snapshot->>'image_url',
      updated_at = now()
      -- Autres champs à restaurer
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'article_presse' then
    update public.articles_presse
    set 
      title = version_record.content_snapshot->>'title',
      author = version_record.content_snapshot->>'author',
      type = version_record.content_snapshot->>'type',
      slug = version_record.content_snapshot->>'slug',
      chapo = version_record.content_snapshot->>'chapo',
      excerpt = version_record.content_snapshot->>'excerpt',
      source_publication = version_record.content_snapshot->>'source_publication',
      source_url = version_record.content_snapshot->>'source_url',
      published_at = (version_record.content_snapshot->>'published_at')::timestamptz,
      updated_at = now()
      -- Autres champs à restaurer
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'communique_presse' then
    update public.communiques_presse
    set 
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      date_publication = (version_record.content_snapshot->>'date_publication')::date,
      public = (version_record.content_snapshot->>'public')::boolean,
      ordre_affichage = (version_record.content_snapshot->>'ordre_affichage')::integer,
      file_size_bytes = (version_record.content_snapshot->>'file_size_bytes')::bigint,
      image_url = version_record.content_snapshot->>'image_url',
      updated_at = now()
      -- Note: Relations many-to-many (medias, categories, tags) non restaurées pour éviter incohérences
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'evenement' then
    update public.evenements
    set 
      spectacle_id = (version_record.content_snapshot->>'spectacle_id')::bigint,
      lieu_id = (version_record.content_snapshot->>'lieu_id')::bigint,
      date_debut = (version_record.content_snapshot->>'date_debut')::timestamptz,
      date_fin = (version_record.content_snapshot->>'date_fin')::timestamptz,
      capacity = (version_record.content_snapshot->>'capacity')::integer,
      price_cents = (version_record.content_snapshot->>'price_cents')::integer,
      status = version_record.content_snapshot->>'status',
      ticket_url = version_record.content_snapshot->>'ticket_url',
      image_url = version_record.content_snapshot->>'image_url',
      start_time = (version_record.content_snapshot->>'start_time')::time,
      end_time = (version_record.content_snapshot->>'end_time')::time,
      type_array = array(select jsonb_array_elements_text(version_record.content_snapshot->'type_array')),
      metadata = version_record.content_snapshot->'metadata',
      recurrence_rule = version_record.content_snapshot->>'recurrence_rule',
      recurrence_end_date = (version_record.content_snapshot->>'recurrence_end_date')::timestamptz,
      parent_event_id = (version_record.content_snapshot->>'parent_event_id')::bigint,
      updated_at = now()
    where id = version_record.entity_id;
    
    restore_success := found;
  elsif version_record.entity_type = 'membre_equipe' then
    update public.membres_equipe
    set 
      name = coalesce(version_record.content_snapshot->>'name', version_record.content_snapshot->>'nom'),
      role = version_record.content_snapshot->>'role',
      description = version_record.content_snapshot->>'description',
      image_url = version_record.content_snapshot->>'image_url',
      photo_media_id = (version_record.content_snapshot->>'photo_media_id')::bigint,
      ordre = (version_record.content_snapshot->>'ordre')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'partner' then
    update public.partners
    set
      name = version_record.content_snapshot->>'name',
      description = version_record.content_snapshot->>'description',
      website_url = version_record.content_snapshot->>'website_url',
      logo_url = version_record.content_snapshot->>'logo_url',
      logo_media_id = (version_record.content_snapshot->>'logo_media_id')::bigint,
      is_active = (version_record.content_snapshot->>'is_active')::boolean,
      display_order = (version_record.content_snapshot->>'display_order')::integer,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_value' then
    update public.compagnie_values
    set
      key = version_record.content_snapshot->>'key',
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_stat' then
    update public.compagnie_stats
    set
      key = version_record.content_snapshot->>'key',
      label = version_record.content_snapshot->>'label',
      value = version_record.content_snapshot->>'value',
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_presentation_section' then
    update public.compagnie_presentation_sections
    set
      slug = version_record.content_snapshot->>'slug',
      kind = version_record.content_snapshot->>'kind',
      title = version_record.content_snapshot->>'title',
      subtitle = version_record.content_snapshot->>'subtitle',
      content = case when version_record.content_snapshot ? 'content' then array(select jsonb_array_elements_text(version_record.content_snapshot->'content')) else null end,
      quote_text = version_record.content_snapshot->>'quote_text',
      quote_author = version_record.content_snapshot->>'quote_author',
      image_url = version_record.content_snapshot->>'image_url',
      image_media_id = (version_record.content_snapshot->>'image_media_id')::bigint,
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  end if;
  
  -- Si restauration réussie, créer une nouvelle version pour tracer l'opération
  if restore_success then
    perform public.create_content_version(
      version_record.entity_type,
      version_record.entity_id,
      version_record.content_snapshot,
      p_change_summary,
      'restore'
    );
  end if;
  
  return restore_success;
end;
$function$
;


