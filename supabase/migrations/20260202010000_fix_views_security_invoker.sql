-- Migration: Fix SECURITY DEFINER views → SECURITY INVOKER
-- Date: 2026-02-02
-- Context: Migration 20260202004924 regenerated views WITHOUT security_invoker clause
-- Impact: 4 views bypassing RLS (detected by Supabase Advisors)
-- Fix: Re-create views with explicit security_invoker = true

-- =============================================================================
-- SECURITY FIX: articles_presse_public
-- =============================================================================

drop view if exists public.articles_presse_public cascade;
create view public.articles_presse_public
with (security_invoker = true)
as
select 
  id,
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
from public.articles_presse
where published_at is not null;

comment on view public.articles_presse_public is 
'Public view of published press articles - SECURITY INVOKER enforces RLS policies';

-- =============================================================================
-- SECURITY FIX: communiques_presse_public
-- =============================================================================

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
  concat('/storage/v1/object/public/medias/', pdf_m.storage_path) as file_url,
  cp.image_url,
  cm.ordre as image_ordre,
  im.filename as image_filename,
  im.storage_path as image_path,
  concat('/storage/v1/object/public/medias/', im.storage_path) as image_file_url,
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

comment on view public.communiques_presse_public is 
'Vue publique optimisée pour espace presse avec URLs et images - SECURITY INVOKER enforces RLS';

-- =============================================================================
-- SECURITY FIX: spectacles_landscape_photos_public
-- =============================================================================

drop view if exists public.spectacles_landscape_photos_public cascade;
create or replace view public.spectacles_landscape_photos_public
with (security_invoker = true)
as
select 
  sm.spectacle_id,
  sm.media_id,
  sm.ordre,
  m.storage_path,
  m.alt_text
from public.spectacles_medias sm
inner join public.medias m on sm.media_id = m.id
inner join public.spectacles s on sm.spectacle_id = s.id
where sm.type = 'landscape'
  and s.public = true
order by sm.spectacle_id, sm.ordre asc;

comment on view public.spectacles_landscape_photos_public is 
'Photos paysage des spectacles publics - SECURITY INVOKER enforces RLS';

-- =============================================================================
-- SECURITY FIX: spectacles_landscape_photos_admin
-- =============================================================================

drop view if exists public.spectacles_landscape_photos_admin cascade;
create or replace view public.spectacles_landscape_photos_admin
with (security_invoker = true)
as
select 
  sm.spectacle_id,
  sm.media_id,
  sm.ordre,
  sm.type,
  m.storage_path,
  m.alt_text,
  m.mime,
  m.created_at
from public.spectacles_medias sm
inner join public.medias m on sm.media_id = m.id
where sm.type = 'landscape'
order by sm.spectacle_id, sm.ordre asc;

comment on view public.spectacles_landscape_photos_admin is 
'Vue admin photos paysage spectacles - SECURITY INVOKER + RLS policies enforce access control';
