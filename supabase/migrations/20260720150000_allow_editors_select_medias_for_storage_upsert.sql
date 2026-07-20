-- Migration: Allow editors to select media objects for Storage upsert
-- Purpose: Restore the SELECT permission required by Supabase Storage when
--          overwriting thumbnails with upload(..., { upsert: true }).
-- Affected: storage.objects policies for bucket id 'medias'
-- RLS: Adds an editor/admin-only SELECT policy; anon and regular users remain blocked
-- Special: Public CDN URLs remain available because the bucket is public

drop policy if exists "Editors can read medias" on storage.objects;

create policy "Editors can read medias"
on storage.objects for select
to authenticated
using (
  bucket_id = 'medias'
  and (select public.has_min_role('editor'))
);