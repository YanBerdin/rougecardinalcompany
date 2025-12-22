-- Migration: Add file_hash column for duplicate detection
-- Date: 2025-12-22
-- Purpose: Prevent duplicate media uploads using SHA-256 hash

alter table public.medias 
add column if not exists file_hash char(64);

comment on column public.medias.file_hash is 'SHA-256 hash for duplicate detection (64 hex chars)';

create unique index if not exists idx_medias_file_hash_unique 
on public.medias (file_hash) 
where file_hash is not null;
