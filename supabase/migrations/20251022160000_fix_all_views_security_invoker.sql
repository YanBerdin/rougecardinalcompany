-- Migration: Fix all views to use SECURITY INVOKER instead of SECURITY DEFINER
-- Created: 2025-10-22 16:00:00
-- Purpose: Eliminate privilege escalation risk in all database views
--
-- Context:
-- PostgreSQL views default to SECURITY DEFINER, which means they run with
-- the privileges of the view creator (usually postgres superuser). This creates
-- a security risk where any user with SELECT permission on the view can access
-- data they shouldn't see, bypassing RLS policies.
--
-- SECURITY INVOKER makes views run with the privileges of the querying user,
-- ensuring RLS policies are properly enforced.
--
-- This migration updates all remaining views that were still using the default
-- SECURITY DEFINER behavior.
--
-- Affected views:
-- 1. communiques_presse_public (public press releases)
-- 2. communiques_presse_dashboard (admin dashboard)
-- 3. membres_equipe_admin (team members admin)
-- 4. compagnie_presentation_sections_admin (presentation sections admin)
-- 5. partners_admin (partners admin)
-- 6. analytics_summary (analytics statistics)
-- 7. content_versions_detailed (version history)
-- 8. categories_hierarchy (category tree)
-- 9. popular_tags (popular tags)
-- 10. messages_contact_admin (contact messages admin)

-- 1. Fix communiques_presse_public view
drop view if exists public.communiques_presse_public cascade;
create or replace view public.communiques_presse_public
with (security_invoker = true)
as
select 
  cp.id,
  cp.title,
  cp.slug,
  cp.description,
  cp.date_publication,
  cp.ordre_affichage,
  cp.spectacle_id,
  cp.evenement_id,
  pdf_m.filename as pdf_filename,
  cp.file_size_bytes,
  case 
    when cp.file_size_bytes is not null then 
      case 
        when cp.file_size_bytes < 1024 then cp.file_size_bytes::text || ' B'
        when cp.file_size_bytes < 1048576 then round(cp.file_size_bytes / 1024.0, 1)::text || ' KB'
        else round(cp.file_size_bytes / 1048576.0, 1)::text || ' MB'
      end
    else pdf_m.size_bytes::text
  end as file_size_display,
  pdf_m.storage_path as pdf_path,
  concat('/storage/v1/object/public/', pdf_m.storage_path) as file_url,
  cp.image_url,
  cm.ordre as image_ordre,
  im.filename as image_filename,
  im.storage_path as image_path,
  concat('/storage/v1/object/public/', im.storage_path) as image_file_url,
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  l.nom as lieu_nom,
  array_agg(distinct c.name) filter (where c.name is not null) as categories,
  array_agg(distinct t.name) filter (where t.name is not null) as tags
from public.communiques_presse as cp
left join public.communiques_medias as pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1
left join public.medias as pdf_m on pdf_cm.media_id = pdf_m.id
left join public.communiques_medias as cm on cp.id = cm.communique_id and cm.ordre = 0
left join public.medias as im on cm.media_id = im.id
left join public.spectacles as s on cp.spectacle_id = s.id
left join public.evenements as e on cp.evenement_id = e.id
left join public.lieux as l on e.lieu_id = l.id
left join public.communiques_categories as cc on cp.id = cc.communique_id
left join public.categories as c on cc.category_id = c.id and c.is_active = true
left join public.communiques_tags as ct on cp.id = ct.communique_id
left join public.tags as t on ct.tag_id = t.id
where cp.public = true
  and exists (
    select 1 
    from public.communiques_medias as pdf_check 
    where pdf_check.communique_id = cp.id 
      and pdf_check.ordre = -1
  )
group by cp.id, pdf_m.filename, pdf_m.size_bytes, pdf_m.storage_path, 
         cm.ordre, im.filename, im.storage_path, cp.image_url,
         s.title, e.date_debut, l.nom
order by cp.ordre_affichage asc, cp.date_publication desc;

-- 2. Fix communiques_presse_dashboard view
drop view if exists public.communiques_presse_dashboard cascade;
create or replace view public.communiques_presse_dashboard
with (security_invoker = true)
as
select 
  cp.id,
  cp.title,
  cp.slug,
  cp.description,
  cp.date_publication,
  cp.public,
  cp.ordre_affichage,
  pdf_m.filename as pdf_filename,
  round(coalesce(cp.file_size_bytes, pdf_m.size_bytes) / 1024.0, 2) as pdf_size_kb,
  cp.image_url,
  im.filename as image_filename,
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  p.display_name as createur,
  cp.created_at,
  cp.updated_at,
  count(cc.category_id) as nb_categories,
  count(ct.tag_id) as nb_tags
from public.communiques_presse as cp
left join public.communiques_medias as pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1
left join public.medias as pdf_m on pdf_cm.media_id = pdf_m.id
left join public.communiques_medias as cm on cp.id = cm.communique_id and cm.ordre = 0
left join public.medias as im on cm.media_id = im.id
left join public.spectacles as s on cp.spectacle_id = s.id
left join public.evenements as e on cp.evenement_id = e.id
left join public.profiles as p on cp.created_by = p.user_id
left join public.communiques_categories as cc on cp.id = cc.communique_id
left join public.communiques_tags as ct on cp.id = ct.communique_id
group by cp.id, pdf_m.filename, pdf_m.size_bytes, im.filename, cp.image_url,
         s.title, e.date_debut, p.display_name
order by cp.created_at desc;

-- 3. Fix membres_equipe_admin view
drop view if exists public.membres_equipe_admin cascade;
create or replace view public.membres_equipe_admin
with (security_invoker = true)
as
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

-- 4. Fix compagnie_presentation_sections_admin view
drop view if exists public.compagnie_presentation_sections_admin cascade;
create or replace view public.compagnie_presentation_sections_admin
with (security_invoker = true)
as
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

-- 5. Fix partners_admin view
drop view if exists public.partners_admin cascade;
create view public.partners_admin
with (security_invoker = true)
as
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

-- 6. Fix analytics_summary view
drop view if exists public.analytics_summary cascade;
create or replace view public.analytics_summary
with (security_invoker = true)
as
select 
  event_type,
  entity_type,
  date_trunc('day', created_at) as event_date,
  count(*) as total_events,
  count(distinct user_id) as unique_users,
  count(distinct session_id) as unique_sessions
from public.analytics_events 
where created_at >= current_date - interval '30 days'
group by event_type, entity_type, date_trunc('day', created_at)
order by event_date desc, total_events desc;

-- 7. Fix content_versions_detailed view
drop view if exists public.content_versions_detailed cascade;
create or replace view public.content_versions_detailed
with (security_invoker = true)
as
select 
  cv.id,
  cv.entity_type,
  cv.entity_id,
  cv.version_number,
  cv.change_type,
  cv.change_summary,
  cv.created_at,
  p.display_name as created_by_name,
  cv.created_by as created_by_id,
  char_length(cv.content_snapshot::text) as snapshot_size
from public.content_versions cv
left join public.profiles as p on cv.created_by = p.user_id
order by cv.entity_type, cv.entity_id, cv.version_number desc;

-- 8. Fix categories_hierarchy view
drop view if exists public.categories_hierarchy cascade;
create or replace view public.categories_hierarchy
with (security_invoker = true)
as
with recursive category_tree as (
  select 
    id,
    name,
    slug,
    parent_id,
    0 as level,
    array[id] as path,
    name as full_path
  from public.categories
  where parent_id is null and is_active = true
  
  union all
  
  select 
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    ct.level + 1 as level,
    ct.path || c.id as path,
    ct.full_path || ' > ' || c.name as full_path
  from public.categories c
  join category_tree ct on c.parent_id = ct.id
  where c.is_active = true
)
select 
  id,
  name,
  slug,
  parent_id,
  level,
  path,
  full_path
from category_tree
order by path;

-- 9. Fix popular_tags view
drop view if exists public.popular_tags cascade;
create or replace view public.popular_tags
with (security_invoker = true)
as
select 
  id,
  name,
  slug,
  usage_count,
  is_featured,
  created_at
from public.tags 
where usage_count > 0
order by is_featured desc, usage_count desc, name asc;

-- 10. Fix messages_contact_admin view
drop view if exists public.messages_contact_admin cascade;
create view public.messages_contact_admin
with (security_invoker = true)
as
select
  mc.id,
  mc.created_at,
  now() - mc.created_at as age,
  mc.firstname,
  mc.lastname,
  trim(coalesce(mc.firstname,'') || ' ' || coalesce(mc.lastname,'')) as full_name,
  mc.email,
  mc.phone,
  mc.reason,
  mc.message,
  mc.status,
  mc.processed,
  mc.processed_at,
  case when mc.processed_at is not null then mc.processed_at - mc.created_at end as processing_latency,
  mc.contact_presse_id,
  cp.nom as contact_presse_nom,
  cp.email as contact_presse_email
from public.messages_contact mc
left join public.contacts_presse cp on mc.contact_presse_id = cp.id
order by
  case 
    when mc.status = 'nouveau' then 1
    when mc.status = 'en_cours' then 2
    when mc.status = 'traite' then 3
    else 4
  end,
  mc.created_at desc;
