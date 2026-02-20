-- Migration: Add gallery photos views for spectacles
-- Date: 2026-02-20
-- Purpose: Create public and admin views for spectacle gallery photos (type = 'gallery')
-- Pattern: Mirrors spectacles_landscape_photos_public/admin views

-- ===== VUE PUBLIQUE =====

drop view if exists public.spectacles_gallery_photos_public cascade;
create or replace view public.spectacles_gallery_photos_public
with (security_invoker=on) as
select
  sm.spectacle_id,
  sm.media_id,
  sm.ordre,
  m.storage_path,
  m.alt_text
from public.spectacles_medias sm
inner join public.medias m on sm.media_id = m.id
inner join public.spectacles s on sm.spectacle_id = s.id
where sm.type = 'gallery'
  and s.public = true
order by sm.spectacle_id, sm.ordre asc;

comment on view public.spectacles_gallery_photos_public is
  'Photos galerie des spectacles publics (type gallery, ordonnées par ordre croissant)';

-- ===== VUE ADMIN =====

drop view if exists public.spectacles_gallery_photos_admin cascade;
create or replace view public.spectacles_gallery_photos_admin
with (security_invoker=on) as
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
where sm.type = 'gallery'
order by sm.spectacle_id, sm.ordre asc;

comment on view public.spectacles_gallery_photos_admin is
  'Vue admin pour gestion photos galerie spectacles (inclut métadonnées media)';

-- ===== GRANT STATEMENTS =====
grant select on public.spectacles_gallery_photos_public to anon, authenticated;
grant select on public.spectacles_gallery_photos_admin to authenticated;
