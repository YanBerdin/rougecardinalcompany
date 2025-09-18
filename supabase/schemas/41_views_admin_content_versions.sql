-- Vues d'administration dépendantes de content_versions
-- Ordre: 41 - après 15_content_versioning.sql

-- Membres équipe admin view
drop view if exists public.membres_equipe_admin cascade;
create or replace view public.membres_equipe_admin as
select 
  m.id,
  m.name,
  m.role,
  m.description,
  m.image_url,
  m.photo_media_id,
  m.ordre,
  m.active,
  m.created_at,
  m.updated_at,
  cv.version_number as last_version_number,
  cv.change_type as last_change_type,
  cv.created_at as last_version_created_at,
  vcount.total_versions
from public.membres_equipe m
left join lateral (
  select version_number, change_type, created_at
  from public.content_versions
  where entity_type = 'membre_equipe' and entity_id = m.id
  order by version_number desc
  limit 1
) cv on true
left join lateral (
  select count(*)::integer as total_versions
  from public.content_versions
  where entity_type = 'membre_equipe' and entity_id = m.id
) vcount on true;

comment on view public.membres_equipe_admin is 'Vue d''administration des membres avec métadonnées de versioning (dernière version et total).';

-- Sections présentation admin view
drop view if exists public.compagnie_presentation_sections_admin cascade;
create or replace view public.compagnie_presentation_sections_admin as
select
  s.id,
  s.slug,
  s.kind,
  s.title,
  s.subtitle,
  s.content,
  s.quote_text,
  s.quote_author,
  s.image_url,
  s.image_media_id,
  s.position,
  s.active,
  s.created_at,
  s.updated_at,
  cv.version_number as last_version_number,
  cv.change_type as last_change_type,
  cv.created_at as last_version_created_at,
  vcount.total_versions
from public.compagnie_presentation_sections s
left join lateral (
  select version_number, change_type, created_at
  from public.content_versions
  where entity_type = 'compagnie_presentation_section' and entity_id = s.id
  order by version_number desc
  limit 1
) cv on true
left join lateral (
  select count(*)::integer as total_versions
  from public.content_versions
  where entity_type = 'compagnie_presentation_section' and entity_id = s.id
) vcount on true;

comment on view public.compagnie_presentation_sections_admin is 'Vue administration sections présentation avec métadonnées de versioning.';

-- Partenaires admin view
drop view if exists public.partners_admin cascade;
create view public.partners_admin as
select
  p.id,
  p.name,
  p.description,
  p.website_url,
  p.logo_url,
  p.logo_media_id,
  p.is_active,
  p.display_order,
  p.created_by,
  p.created_at,
  p.updated_at,
  lv.version_number as last_version_number,
  lv.change_type as last_change_type,
  lv.created_at as last_version_created_at
from public.partners p
left join lateral (
  select version_number, change_type, created_at
  from public.content_versions cv
  where cv.entity_type = 'partner' and cv.entity_id = p.id
  order by version_number desc
  limit 1
) lv on true;

comment on view public.partners_admin is 'Vue administration partenaires incluant métadonnées versioning';
