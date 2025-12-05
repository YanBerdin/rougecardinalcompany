-- Migration: Refactor Hero Slides CTA - Dual buttons with toggles
-- Purpose: Replace single cta_label/cta_url with cta_primary_* and cta_secondary_*
-- Affected Tables: home_hero_slides
-- Special Considerations: Preserves existing data before column removal

-- ============================================================================
-- STEP 1: Add new columns (without constraints first)
-- ============================================================================
alter table "public"."home_hero_slides" 
  add column if not exists "cta_primary_enabled" boolean not null default false;

alter table "public"."home_hero_slides" 
  add column if not exists "cta_primary_label" text;

alter table "public"."home_hero_slides" 
  add column if not exists "cta_primary_url" text;

alter table "public"."home_hero_slides" 
  add column if not exists "cta_secondary_enabled" boolean not null default false;

alter table "public"."home_hero_slides" 
  add column if not exists "cta_secondary_label" text;

alter table "public"."home_hero_slides" 
  add column if not exists "cta_secondary_url" text;

-- ============================================================================
-- STEP 2: Migrate existing data (cta_label/cta_url → cta_primary_*)
-- ============================================================================
update public.home_hero_slides
set 
  cta_primary_enabled = (cta_label is not null and cta_url is not null),
  cta_primary_label = cta_label,
  cta_primary_url = cta_url
where cta_label is not null or cta_url is not null;

-- ============================================================================
-- STEP 3: Add constraints after data migration
-- ============================================================================
alter table "public"."home_hero_slides" 
  add constraint "home_hero_slides_cta_primary_label_length" 
    check ((cta_primary_label is null) or (char_length(cta_primary_label) <= 50));

alter table "public"."home_hero_slides" 
  add constraint "home_hero_slides_cta_secondary_label_length" 
    check ((cta_secondary_label is null) or (char_length(cta_secondary_label) <= 50));

alter table "public"."home_hero_slides" 
  add constraint "home_hero_slides_cta_primary_consistency" 
    check (
      (cta_primary_enabled = false) 
      or 
      ((cta_primary_enabled = true) and (cta_primary_label is not null) and (cta_primary_url is not null))
    );

alter table "public"."home_hero_slides" 
  add constraint "home_hero_slides_cta_secondary_consistency" 
    check (
      (cta_secondary_enabled = false) 
      or 
      ((cta_secondary_enabled = true) and (cta_secondary_label is not null) and (cta_secondary_url is not null))
    );

-- ============================================================================
-- STEP 4: Add comments
-- ============================================================================
comment on column public.home_hero_slides.cta_primary_enabled is 'Toggle to enable/disable primary CTA button.';
comment on column public.home_hero_slides.cta_primary_label is 'Primary CTA button text (max 50 chars).';
comment on column public.home_hero_slides.cta_primary_url is 'Primary CTA button URL (relative or absolute).';
comment on column public.home_hero_slides.cta_secondary_enabled is 'Toggle to enable/disable secondary CTA button.';
comment on column public.home_hero_slides.cta_secondary_label is 'Secondary CTA button text (max 50 chars).';
comment on column public.home_hero_slides.cta_secondary_url is 'Secondary CTA button URL (relative or absolute).';

-- ============================================================================
-- STEP 5: Drop old columns (data already migrated)
-- ============================================================================
alter table "public"."home_hero_slides" drop column if exists "cta_label";
alter table "public"."home_hero_slides" drop column if exists "cta_url";
