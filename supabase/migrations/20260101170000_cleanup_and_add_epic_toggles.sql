-- Migration: Cleanup compagnie toggles + Add Epic-aligned toggles
-- Author: Rouge Cardinal Company Development Team
-- Date: 2026-01-01 17:00:00
--
-- Purpose:
--   Align TASK030 with Epic 14.7-back-office.md requirements:
--   - Remove compagnie display toggles (not in Epic scope)
--   - Add missing Epic toggles: À la Une, Partners, Newsletter (×3)
--
-- Affected Tables:
--   - public.configurations_site (DELETE + INSERT)
--
-- Dependencies:
--   - Requires existing configurations_site table
--
-- Breaking Changes:
--   - Removes display_toggle_compagnie_* keys (3 toggles)
--   - Applications using these keys must be updated

-- ============================================================================
-- STEP 1: DELETE compagnie toggles (not in Epic)
-- ============================================================================
-- These toggles were created in seed but are not part of Epic 14.7.
-- The /compagnie page will use direct DAL calls without display toggles.

delete from public.configurations_site 
where key in (
  'display_toggle_compagnie_values',
  'display_toggle_compagnie_presentation',
  'display_toggle_compagnie_stats'
);

-- ============================================================================
-- STEP 2: INSERT Epic-aligned toggles
-- ============================================================================
-- Add 5 new toggles required by Epic 14.7-back-office.md:
--   - display_toggle_home_a_la_une       : Featured press releases on homepage
--   - display_toggle_home_partners       : Partners section on homepage
--   - display_toggle_home_newsletter     : Newsletter section on homepage
--   - display_toggle_agenda_newsletter   : Newsletter CTA on Agenda page
--   - display_toggle_contact_newsletter  : Newsletter section on Contact page

insert into public.configurations_site (key, value, description, category) values
  (
    'display_toggle_home_a_la_une',
    '{"enabled": true, "max_items": 3}'::jsonb,
    'Afficher la section À la Une (actualités presse) sur la page d''accueil.',
    'home_display'
  ),
  (
    'display_toggle_home_partners',
    '{"enabled": true}'::jsonb,
    'Afficher la section Nos Partenaires sur la page d''accueil.',
    'home_display'
  ),
  (
    'display_toggle_home_newsletter',
    '{"enabled": true}'::jsonb,
    'Afficher la section Newsletter sur la page d''accueil.',
    'home_display'
  ),
  (
    'display_toggle_agenda_newsletter',
    '{"enabled": true}'::jsonb,
    'Afficher le formulaire d''inscription Newsletter sur la page Agenda.',
    'agenda_display'
  ),
  (
    'display_toggle_contact_newsletter',
    '{"enabled": true}'::jsonb,
    'Afficher la section Newsletter sur la page Contact.',
    'contact_display'
  )
on conflict (key) do nothing;

-- ============================================================================
-- STEP 3: Verify migration result
-- ============================================================================
-- After migration, the database should have exactly 9 display toggles:
--   - 6 home_display: hero, about, spectacles, a_la_une, partners, newsletter
--   - 1 agenda_display: newsletter
--   - 1 contact_display: newsletter
--   - 1 presse_display: articles
--
-- Query to verify:
-- SELECT category, count(*) as toggle_count
-- FROM public.configurations_site
-- WHERE key LIKE 'display_toggle_%'
-- GROUP BY category
-- ORDER BY category;
