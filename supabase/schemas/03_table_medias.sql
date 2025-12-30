-- Table medias - Gestion des médias/fichiers
-- Ordre: 03 - Table de base sans dépendances

drop table if exists public.medias cascade;
create table public.medias (
  id bigint generated always as identity primary key,
  storage_path text not null,
  filename text,
  mime text,
  size_bytes bigint,
  alt_text text,
  file_hash char(64),
  -- folder_id will be added by migration 20251227203314_add_media_tags_folders.sql
  thumbnail_path text,
  metadata jsonb default '{}'::jsonb,
  uploaded_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.medias is 'media storage metadata (paths, filenames, mime, size)';
comment on column public.medias.storage_path is 'Relative path within medias bucket (e.g., press-kit/logos/file.png, NOT medias/press-kit/logos/file.png)';
comment on column public.medias.file_hash is 'SHA-256 hash for duplicate detection (64 hex chars)';
comment on column public.medias.thumbnail_path is 'Storage path to generated thumbnail (300x300 JPEG). Null if thumbnail generation failed or not yet processed (Phase 3)';

-- Unique index for duplicate prevention (partial - null allowed for legacy)
create unique index if not exists idx_medias_file_hash_unique 
on public.medias (file_hash) 
where file_hash is not null;

-- Index for thumbnail path lookups (Phase 3 - partial index for performance)
create index if not exists idx_medias_thumbnail_path 
on public.medias (thumbnail_path) 
where thumbnail_path is not null;

-- Index for folder lookups by storage_path prefix (for auto-assignment)
create index if not exists idx_medias_storage_path_prefix 
on public.medias (split_part(storage_path, '/', 1));

-- NOTE: medias_folder_id_idx index will be created by migration 20251227203314_add_media_tags_folders.sql after folder_id column is added

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Extract folder slug from storage_path (e.g., "team/photo.jpg" → "team")
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
