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
  metadata jsonb default '{}'::jsonb,
  uploaded_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.medias is 'media storage metadata (paths, filenames, mime, size)';
comment on column public.medias.storage_path is 'Relative path within medias bucket (e.g., press-kit/logos/file.png, NOT medias/press-kit/logos/file.png)';
comment on column public.medias.file_hash is 'SHA-256 hash for duplicate detection (64 hex chars)';

-- Unique index for duplicate prevention (partial - null allowed for legacy)
create unique index if not exists idx_medias_file_hash_unique 
on public.medias (file_hash) 
where file_hash is not null;

-- NOTE: medias_folder_id_idx index will be created by migration 20251227203314_add_media_tags_folders.sql after folder_id column is added
