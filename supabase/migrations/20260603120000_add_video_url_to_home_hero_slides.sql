-- =============================================================================
-- Migration: add video_url column to home_hero_slides
-- Purpose: Support optional video background for hero slides (MVP URL libre)
-- Affected table: public.home_hero_slides
-- New column: video_url text nullable
-- Design: accepts relative path (/hero-theatre-loop.mp4) or absolute URL
-- =============================================================================

alter table public.home_hero_slides
  add column if not exists video_url text;

comment on column public.home_hero_slides.video_url is
  'URL vidéo de fond optionnelle. Si renseignée, remplace l''image. Accepte chemin relatif (/hero-theatre-loop.mp4) ou URL absolue (https://...).';
