-- Migration: Editor storage policies for medias bucket
-- Purpose: Restrict INSERT/UPDATE/DELETE on medias bucket to editor+ role
-- Affected: storage.objects RLS policies where bucket_id = 'medias'
-- Depends on: has_min_role() function (migration 20260309...)

-- Drop old policies (old names from previous migration)
drop policy if exists "Authenticated users can upload to medias" on storage.objects;
drop policy if exists "Authenticated users can update medias" on storage.objects;
drop policy if exists "Admins can delete medias" on storage.objects;

-- Recreate with editor+ guard

-- Allow editors and admins to upload
create policy "Editors can upload to medias"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'medias'
  and (select public.has_min_role('editor'))
);

-- Allow editors and admins to update media files
create policy "Editors can update medias"
on storage.objects for update
to authenticated
using (
  bucket_id = 'medias'
  and (select public.has_min_role('editor'))
)
with check (
  bucket_id = 'medias'
  and (select public.has_min_role('editor'))
);

-- Allow editors and admins to delete media files
create policy "Editors can delete medias"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'medias'
  and (select public.has_min_role('editor'))
);
