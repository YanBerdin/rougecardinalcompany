-- Migration: Restore folder_id column that was dropped by 20260103183217
-- This column is required for the Media Library feature (TASK029)
-- Date: 2026-01-11

-- Add folder_id column back to medias table
alter table public.medias
  add column if not exists folder_id bigint;

-- Add foreign key constraint to media_folders (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'medias_folder_id_fkey'
      and conrelid = 'public.medias'::regclass
  ) then
    alter table public.medias
      add constraint medias_folder_id_fkey
      foreign key (folder_id) references public.media_folders(id)
      on delete set null
      not valid;
  end if;
end $$;

-- Validate the constraint (if it exists)
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'medias_folder_id_fkey'
      and conrelid = 'public.medias'::regclass
      and convalidated = false
  ) then
    alter table public.medias validate constraint medias_folder_id_fkey;
  end if;
end $$;

-- Add index for performance
create index if not exists medias_folder_id_idx on public.medias(folder_id);

-- Comment
comment on column public.medias.folder_id is 'Dossier parent du média (auto-assigned from storage_path prefix)';

-- Auto-assign folder_id based on storage_path prefix
update public.medias m
set folder_id = (
  select f.id from public.media_folders f
  where f.slug = split_part(m.storage_path, '/', 1)
)
where m.folder_id is null
  and exists (
    select 1 from public.media_folders f
    where f.slug = split_part(m.storage_path, '/', 1)
  );
