-- Migration: Drop all remaining unused indexes
-- Purpose: Fix lint=0005 — unused indexes waste storage and slow down writes
-- Affected: multiple tables in the public schema
-- Note: These indexes were added speculatively (FK coverage) but have zero scans.
--       They can be recreated if query patterns change in the future.

-- articles_categories
drop index if exists public.idx_articles_categories_category_id;

-- articles_presse
drop index if exists public.idx_articles_presse_og_image_media_id;

-- articles_tags
drop index if exists public.idx_articles_tags_tag_id;

-- categories
drop index if exists public.idx_categories_created_by;
drop index if exists public.idx_categories_parent_id;

-- compagnie_presentation_sections
drop index if exists public.idx_compagnie_sections_image_media_id;

-- configurations_site
drop index if exists public.idx_configurations_site_updated_by;

-- evenements
drop index if exists public.idx_evenements_lieu_id;
drop index if exists public.idx_evenements_parent_event_id;

-- home_about_content
drop index if exists public.idx_home_about_content_image_media_id;

-- home_hero_slides
drop index if exists public.idx_home_hero_slides_image_media_id;

-- membres_equipe
drop index if exists public.idx_membres_equipe_photo_media_id;

-- messages_contact
drop index if exists public.idx_messages_contact_contact_presse_id;

-- partners
drop index if exists public.idx_partners_created_by;
drop index if exists public.idx_partners_logo_media_id;

-- spectacles_categories
drop index if exists public.idx_spectacles_categories_category_id;

-- spectacles_membres_equipe
drop index if exists public.idx_spectacles_membres_equipe_membre_id;

-- spectacles_tags
drop index if exists public.idx_spectacles_tags_tag_id;

-- tags
drop index if exists public.idx_tags_created_by;
