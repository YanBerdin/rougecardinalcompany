-- Fix: Restore folder_id column that was accidentally dropped
-- This column was added by 20251227203314 but dropped by 20251227223934

alter table public.medias 
  add column if not exists folder_id bigint references public.media_folders(id) on delete set null;

comment on column public.medias.folder_id is 'Dossier parent du média (organisation hiérarchique)';

create index if not exists medias_folder_id_idx on public.medias(folder_id);
