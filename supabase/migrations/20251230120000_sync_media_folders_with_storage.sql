-- =============================================================================
-- Migration: Synchronize media_folders with Storage bucket structure
-- =============================================================================
-- Description: 
--   1. Restore folder_id column (dropped by 20251228145621)
--   2. Seed media_folders to match existing Storage directories
--   3. Assign folder_id to existing medias based on storage_path
--   4. Add comment to enforce slug = storage path convention
--
-- NOTE: This migration contains DML (INSERT/UPDATE) which is not captured
-- by schema diff. The DDL parts (function, index, comments) are also added
-- to declarative schemas for future consistency:
--   - supabase/schemas/03_table_medias.sql (function + index)
--   - supabase/schemas/04_table_media_tags_folders.sql (slug comment)
-- =============================================================================

-- Step 0: Restore folder_id column that was dropped by thumbnail migration
alter table public.medias 
  add column if not exists folder_id bigint references public.media_folders(id) on delete set null;

create index if not exists medias_folder_id_idx on public.medias(folder_id);

-- Step 1: Seed folders matching Storage structure
-- These slugs MUST match the first directory segment in storage_path
insert into public.media_folders (name, slug, description) values
  ('Uploads génériques', 'uploads', 'Uploads directs depuis la médiathèque'),
  ('Équipe', 'team', 'Photos des membres de l''équipe'),
  ('Spectacles', 'spectacles', 'Images des spectacles'),
  ('Hero (Home)', 'home-hero', 'Slides carousel page d''accueil'),
  ('À propos (Home)', 'home-about', 'Images section À propos'),
  ('Presse', 'press', 'Logos et visuels presse'),
  ('Kit Presse', 'press-kit', 'Logos et visuels du kit presse'),
  ('Photos', 'photos', 'Photos générales'),
  ('Dossiers', 'dossiers', 'Documents PDF et dossiers')
on conflict (slug) do nothing;

-- Step 2: Auto-assign folder_id to existing medias based on storage_path prefix
-- This creates the link between physical storage location and logical folder
update public.medias m
set folder_id = (
  select mf.id 
  from public.media_folders mf
  where m.storage_path like (mf.slug || '/%')
  limit 1
)
where m.folder_id is null
  and m.storage_path is not null;

-- Step 3: Add documentation comment for convention enforcement
comment on column public.media_folders.slug is 
  'URL-friendly identifier (MUST match Storage directory name in medias/{slug}/)';

comment on column public.medias.folder_id is 
  'Logical folder reference - auto-assigned based on storage_path prefix during upload';

-- Step 4: Create helper function to extract folder from storage_path
create or replace function public.extract_folder_from_path(storage_path text)
returns text
language sql
immutable
set search_path = ''
as $$
  select split_part(storage_path, '/', 1)
$$;

comment on function public.extract_folder_from_path(text) is 
  'Extract folder slug from storage_path (e.g., "team/photo.jpg" → "team")';

-- Step 5: Create index for faster folder lookups by storage_path prefix
create index if not exists idx_medias_storage_path_prefix 
on public.medias (split_part(storage_path, '/', 1));
