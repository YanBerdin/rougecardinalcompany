-- Migration: Add missing FK indexes on communiques_* tables
-- Purpose: Fix lint=0001 — unindexed foreign keys slowing down JOINs and cascades
-- Affected: communiques_categories, communiques_presse, communiques_tags

-- Index on communiques_categories.category_id (FK → categories)
create index if not exists idx_communiques_categories_category_id
  on public.communiques_categories using btree (category_id);

-- Indexes on communiques_presse foreign key columns
create index if not exists idx_communiques_presse_spectacle_id
  on public.communiques_presse using btree (spectacle_id);

create index if not exists idx_communiques_presse_evenement_id
  on public.communiques_presse using btree (evenement_id);

create index if not exists idx_communiques_presse_created_by
  on public.communiques_presse using btree (created_by);

create index if not exists idx_communiques_presse_image_media_id
  on public.communiques_presse using btree (image_media_id);

-- Index on communiques_tags.tag_id (FK → tags)
create index if not exists idx_communiques_tags_tag_id
  on public.communiques_tags using btree (tag_id);
