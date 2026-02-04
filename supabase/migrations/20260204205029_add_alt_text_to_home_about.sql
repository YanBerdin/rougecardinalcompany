-- Migration: Add alt_text column to home_about_content table
-- Purpose: Support image accessibility with alt text for About section images
-- Affected Tables: home_about_content (modified)

alter table public.home_about_content
  add column if not exists alt_text varchar(125);

comment on column public.home_about_content.alt_text is 'Texte alternatif image pour accessibilité (max 125 caractères).';
