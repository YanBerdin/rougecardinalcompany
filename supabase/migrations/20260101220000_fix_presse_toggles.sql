-- Migration: Fix presse display toggles
-- Author: Rouge Cardinal Company Development Team
-- Date: 2026-01-01 22:00:00
--
-- Purpose:
--   Transform existing legacy presse toggles into the new display_toggle format.
--   
--   This migration:
--   1. Transforms public:presse:media_kit_enabled → display_toggle_media_kit
--   2. Transforms public:presse:communiques_enabled → display_toggle_presse_articles
--   3. Adds proper category and description metadata
--
-- Affected Tables:
--   - public.configurations_site (UPDATE for 2 existing toggles)
--
-- Context:
--   The seed migrations expected public:presse:articles_enabled but the actual
--   keys in the database were public:presse:media_kit_enabled and 
--   public:presse:communiques_enabled. This migration handles the actual state.

-- ============================================================================
-- STEP 1: Transform Media Kit toggle
-- ============================================================================
-- Transform public:presse:media_kit_enabled into display_toggle_media_kit
-- Only if display_toggle_media_kit doesn't already exist

do $$
declare
  media_kit_exists boolean;
  legacy_media_kit_exists boolean;
begin
  -- Check if new key already exists
  select exists(
    select 1 from public.configurations_site 
    where key = 'display_toggle_media_kit'
  ) into media_kit_exists;
  
  -- Check if legacy key exists
  select exists(
    select 1 from public.configurations_site 
    where key = 'public:presse:media_kit_enabled'
  ) into legacy_media_kit_exists;
  
  if not media_kit_exists and legacy_media_kit_exists then
    -- Transform legacy key
    update public.configurations_site
    set 
      key = 'display_toggle_media_kit',
      category = 'presse_display',
      description = 'Afficher la section Kit Média sur la page Presse.',
      value = jsonb_build_object(
        'enabled', coalesce((value)::boolean, true),
        'max_items', null
      )
    where key = 'public:presse:media_kit_enabled';
    
    raise notice '✅ Transformed public:presse:media_kit_enabled → display_toggle_media_kit';
  elsif media_kit_exists then
    raise notice '⏭️  display_toggle_media_kit already exists, skipping';
  else
    raise warning '⚠️  Neither display_toggle_media_kit nor public:presse:media_kit_enabled found';
  end if;
end $$;

-- ============================================================================
-- STEP 2: Transform Press Releases toggle
-- ============================================================================
-- Transform public:presse:communiques_enabled into display_toggle_presse_articles
-- Only if display_toggle_presse_articles doesn't already exist

do $$
declare
  press_releases_exists boolean;
  legacy_communiques_exists boolean;
begin
  -- Check if new key already exists
  select exists(
    select 1 from public.configurations_site 
    where key = 'display_toggle_presse_articles'
  ) into press_releases_exists;
  
  -- Check if legacy key exists
  select exists(
    select 1 from public.configurations_site 
    where key = 'public:presse:communiques_enabled'
  ) into legacy_communiques_exists;
  
  if not press_releases_exists and legacy_communiques_exists then
    -- Transform legacy key
    update public.configurations_site
    set 
      key = 'display_toggle_presse_articles',
      category = 'presse_display',
      description = 'Afficher la section Communiqués de Presse sur la page Presse.',
      value = jsonb_build_object(
        'enabled', coalesce((value)::boolean, true),
        'max_items', 12
      )
    where key = 'public:presse:communiques_enabled';
    
    raise notice '✅ Transformed public:presse:communiques_enabled → display_toggle_presse_articles';
  elsif press_releases_exists then
    raise notice '⏭️  display_toggle_presse_articles already exists, skipping';
  else
    raise warning '⚠️  Neither display_toggle_presse_articles nor public:presse:communiques_enabled found';
  end if;
end $$;

-- ============================================================================
-- STEP 3: Verify final state
-- ============================================================================
-- Count should be 2 presse_display toggles

do $$
declare
  toggle_count integer;
  media_kit_exists boolean;
  press_releases_exists boolean;
begin
  -- Count total presse_display toggles
  select count(*) into toggle_count
  from public.configurations_site
  where category = 'presse_display';
  
  -- Check specific toggles
  select exists(
    select 1 from public.configurations_site 
    where key = 'display_toggle_media_kit'
  ) into media_kit_exists;
  
  select exists(
    select 1 from public.configurations_site 
    where key = 'display_toggle_presse_articles'
  ) into press_releases_exists;
  
  if toggle_count = 2 and media_kit_exists and press_releases_exists then
    raise notice 'Success: Found % presse_display toggles', toggle_count;
    raise notice '  ✅ display_toggle_media_kit';
    raise notice '  ✅ display_toggle_presse_articles';
  else
    raise warning 'Expected 2 presse_display toggles but found %', toggle_count;
    if not media_kit_exists then
      raise warning '  ❌ display_toggle_media_kit is missing';
    end if;
    if not press_releases_exists then
      raise warning '  ❌ display_toggle_presse_articles is missing';
    end if;
  end if;
end $$;

-- Expected result after migration:
-- SELECT key, category, description 
-- FROM public.configurations_site 
-- WHERE category = 'presse_display' 
-- ORDER BY key;
--
-- Should return:
--   1. display_toggle_media_kit       | presse_display | Afficher la section Kit Média sur la page Presse.
--   2. display_toggle_presse_articles | presse_display | Afficher la section Communiqués de Presse sur la page Presse.
