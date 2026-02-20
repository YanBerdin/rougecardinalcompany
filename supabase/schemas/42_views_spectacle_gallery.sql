-- Vues pour les photos gallery des spectacles
-- Ordre: 42 - Dépend des tables spectacles, medias, spectacles_medias
-- Miroir du pattern spectacles_landscape_photos (41_views_spectacle_photos.sql)

-- ===== VUE PUBLIQUE =====

-- Vue publique pour photos gallery des spectacles publics
-- SECURITY INVOKER: nécessite GRANT sur tables de base
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

-- Vue admin pour gestion photos gallery (toutes, avec métadonnées)
-- SECURITY INVOKER + garde is_admin() — pattern TASK037 admin views hardening
-- Accès uniquement aux administrateurs : la condition WHERE est évaluée avec les
-- permissions du requêteur (SECURITY INVOKER). REVOKE sur authenticated ci-dessous.
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
  and (select public.is_admin()) = true
order by sm.spectacle_id, sm.ordre asc;

comment on view public.spectacles_gallery_photos_admin is
  'Vue admin pour gestion photos galerie spectacles (inclut métadonnées media) — accès is_admin() uniquement';

-- ===== GRANT STATEMENTS =====
-- Les GRANT sur spectacles_medias, medias et spectacles existent déjà (41_views)
-- Vues publiques : lecture ouverte
grant select on public.spectacles_gallery_photos_public to anon, authenticated;
-- Vue admin : accès restreint (is_admin() guard dans SQL — defense-in-depth)
grant select on public.spectacles_gallery_photos_admin to authenticated;
-- Bloquer l'accès direct anon (jamais admin)
revoke select on public.spectacles_gallery_photos_admin from anon;
