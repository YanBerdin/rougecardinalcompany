-- =============================================================================
-- Migration: Fix spectacle photo admin views to allow editor access
-- Date: 2026-03-11
-- Affected views: spectacles_landscape_photos_admin, spectacles_gallery_photos_admin
--
-- Problem:
--   The security hardening migration 20260220130000_fix_spectacle_admin_views_security.sql
--   added `AND (select public.is_admin()) = true` to both spectacle photo admin views.
--   Editors (role = 'editor') are NOT admins, so they received zero rows.
--   Consequence: the admin form saw empty photo slots, and any add attempt triggered
--   [ERR_PHOTO_001] "Maximum 2 landscape photos per spectacle" because the rows
--   already existed in the database.
--
-- Fix:
--   Replace is_admin() with has_min_role('editor') so that both editors and admins
--   can access the management views.
--   The "admin" in the view name refers to "backoffice management" (as opposed to
--   public-facing views), not "admin role only".
--   Editors have a legitimate need to manage spectacle photos in the backoffice.
--
-- Security analysis:
--   - SECURITY INVOKER is preserved: the function runs with the caller's permissions
--   - has_min_role('editor') blocks anon and regular user roles (role 0)
--   - REVOKE on anon is unchanged (still in place)
--   - Defense-in-depth is maintained: DAL also calls requireMinRole('editor')
-- =============================================================================

-- ===== FIX: spectacles_landscape_photos_admin =====

create or replace view public.spectacles_landscape_photos_admin
with (security_invoker = on) as
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
-- Backoffice access: editors and admins (role >= 1).
-- has_min_role('editor') returns true for role 'editor' (1) and 'admin' (2).
where sm.type = 'landscape'
  and (select public.has_min_role('editor')) = true
order by sm.spectacle_id, sm.ordre asc;

comment on view public.spectacles_landscape_photos_admin is
  'Vue backoffice pour gestion photos paysage spectacles (inclut métadonnées media) — accès éditeur et admin via has_min_role(''editor'')';

-- ===== FIX: spectacles_gallery_photos_admin =====

create or replace view public.spectacles_gallery_photos_admin
with (security_invoker = on) as
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
-- Backoffice access: editors and admins (role >= 1).
where sm.type = 'gallery'
  and (select public.has_min_role('editor')) = true
order by sm.spectacle_id, sm.ordre asc;

comment on view public.spectacles_gallery_photos_admin is
  'Vue backoffice pour gestion photos galerie spectacles (inclut métadonnées media) — accès éditeur et admin via has_min_role(''editor'')';

-- ===== GRANTs (inchangés — defense-in-depth) =====
-- Vue landscape admin : accès authenticated uniquement (anon reste révoqué)
grant select on public.spectacles_landscape_photos_admin to authenticated;
revoke select on public.spectacles_landscape_photos_admin from anon;

-- Vue gallery admin : accès authenticated uniquement (anon reste révoqué)
grant select on public.spectacles_gallery_photos_admin to authenticated;
revoke select on public.spectacles_gallery_photos_admin from anon;
