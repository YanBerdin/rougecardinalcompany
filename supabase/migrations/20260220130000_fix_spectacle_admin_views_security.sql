-- Migration: Fix security on spectacle admin views
-- Date: 2026-02-20
-- Purpose: Add is_admin() guard to spectacles_landscape_photos_admin and
--          spectacles_gallery_photos_admin views (TASK037 hardening pattern)
-- Affected:
--   - public.spectacles_landscape_photos_admin (existed before TASK037 — was missing guard)
--   - public.spectacles_gallery_photos_admin   (created 20260220120000 — guard omitted)
-- References:
--   - doc/ADMIN-VIEWS-SECURITY-HARDENING-SUMMARY.md (TASK037)
--   - supabase/schemas/41_views_spectacle_photos.sql (source of truth post-fix)
--   - supabase/schemas/42_views_spectacle_gallery.sql (already fixed)

-- =============================================================================
-- 1. VUE spectacles_landscape_photos_admin
-- =============================================================================

-- Recreate with is_admin() WHERE clause — defense-in-depth on top of SECURITY INVOKER
drop view if exists public.spectacles_landscape_photos_admin cascade;
create or replace view public.spectacles_landscape_photos_admin
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
where sm.type = 'landscape'
  and (select public.is_admin()) = true
order by sm.spectacle_id, sm.ordre asc;

comment on view public.spectacles_landscape_photos_admin is
  'Vue admin pour gestion photos paysage spectacles (inclut métadonnées media) — accès is_admin() uniquement';

-- Grant : authenticated only (is_admin() guard ajoute une 2e couche)
grant select on public.spectacles_landscape_photos_admin to authenticated;
-- Bloquer l'accès direct anon
revoke select on public.spectacles_landscape_photos_admin from anon;

-- =============================================================================
-- 2. VUE spectacles_gallery_photos_admin
-- =============================================================================

-- Recreate with is_admin() WHERE clause — guard omis dans la migration initiale
-- (20260220120000_add_gallery_photos_views.sql)
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

-- Grant : authenticated only (déjà correct dans la migration initiale, conservé)
grant select on public.spectacles_gallery_photos_admin to authenticated;
-- Bloquer l'accès direct anon (idempotent si déjà révoqué)
revoke select on public.spectacles_gallery_photos_admin from anon;
