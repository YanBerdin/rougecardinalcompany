-- Migration: Seed Display Toggles data
-- Author: Rouge Cardinal Company Development Team  
-- Date: 2026-01-01 16:01:00
--
-- Purpose:
--   Migrate and seed display toggle configurations for homepage, company page, and press page.
--   This migration transforms existing feature flags into the new display toggles system
--   with proper categorization, descriptions, and metadata.
--
-- Affected Tables:
--   - public.configurations_site (UPDATE + INSERT)
--
-- Dependencies:
--   - Requires 20260101160000_add_display_toggles_metadata_columns.sql to be applied first
--
-- Toggles Created (4 initial):
--   Homepage (home_display):
--     1. display_toggle_home_hero         - Hero carousel section
--     2. display_toggle_home_spectacles   - Featured spectacles grid
--     3. display_toggle_home_about        - About section
--   
--   Press Page (presse_display):
--     4. display_toggle_presse_articles   - Press articles grid
--
-- Note: Additional toggles (à la une, partners, newsletter) are added via
--       migration 20260101170000_cleanup_and_add_epic_toggles.sql
--
-- Breaking Changes: None (backward compatible)

-- ============================================================================
-- STEP 1: Migrate existing public:presse:articles_enabled toggle
-- ============================================================================
-- Transform the legacy public:presse:articles_enabled flag into the new toggle format
-- with proper category and description metadata.

update public.configurations_site
set 
  category = 'presse_display',
  description = 'Afficher la grille des articles de presse sur la page Presse.',
  value = jsonb_build_object(
    'enabled', coalesce((value->>'enabled')::boolean, true),
    'max_items', 12
  )
where key = 'public:presse:articles_enabled';

-- ============================================================================
-- STEP 2: Update existing presse key to new naming convention
-- ============================================================================
-- Rename public:presse:articles_enabled to display_toggle_presse_articles
-- for consistency with other toggle keys.

update public.configurations_site
set key = 'display_toggle_presse_articles'
where key = 'public:presse:articles_enabled';

-- ============================================================================
-- STEP 3: Insert homepage display toggles
-- ============================================================================
-- Create 3 new toggles for homepage sections with default values.

insert into public.configurations_site (key, value, category, description)
values
  (
    'display_toggle_home_hero',
    jsonb_build_object('enabled', true, 'max_items', 5),
    'home_display',
    'Afficher le carrousel de slides hero sur la page d''accueil.'
  ),
  (
    'display_toggle_home_spectacles',
    jsonb_build_object('enabled', true, 'max_items', 6),
    'home_display',
    'Afficher la grille des spectacles mis en avant sur la page d''accueil.'
  ),
  (
    'display_toggle_home_about',
    jsonb_build_object('enabled', true, 'max_items', null),
    'home_display',
    'Afficher la section À propos sur la page d''accueil.'
  )
on conflict (key) do nothing;

-- ============================================================================
-- STEP 4: Verify data integrity
-- ============================================================================
-- Add comment to document the migration completion.

comment on column public.configurations_site.category is 
'Feature section category (home_display, compagnie_display, presse_display). Populated by migration 20260101160100.';
