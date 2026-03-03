-- =============================================================================
-- Migration: add alt_text column to compagnie_presentation_sections
--
-- Purpose:
--   Add alt_text (texte alternatif) to images in presentation sections.
--   Required for WCAG 2.2 Level AA accessibility compliance (image alt text).
--
-- Affected tables: compagnie_presentation_sections (add column alt_text)
-- Special considerations:
--   - Nullable column — no backfill needed for existing rows.
--   - No RLS policy change required (inherits existing policies).
-- =============================================================================

-- Add alt_text column after image_media_id
alter table public.compagnie_presentation_sections
    add column if not exists alt_text text;

-- Document the column purpose
comment on column public.compagnie_presentation_sections.alt_text
    is 'Texte alternatif pour l''image de la section (accessibilité WCAG 2.2)';
