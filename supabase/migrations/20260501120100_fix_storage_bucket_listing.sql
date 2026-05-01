-- Migration: Fix storage bucket medias policy to prevent anonymous listing
-- Purpose: The policy "Public read access for medias" grants SELECT to the `public` role,
--          which allows any anonymous user to list ALL files in the medias bucket (lint=0025).
--          Replace with an authenticated-only policy that restricts access to object reads.
-- Affected: storage.objects (bucket: medias)
-- Special considerations:
--   Public image URLs are still accessible directly via the CDN (Supabase storage public URL),
--   but listing the entire bucket contents will require authentication.
--   This does not break existing <img> tags or direct URL access in the public site.

-- drop the overly permissive public listing policy
drop policy if exists "Public read access for medias" on storage.objects;

-- create a new policy: authenticated users can read media objects
-- (direct CDN URLs remain publicly accessible — only bucket listing is restricted)
create policy "Authenticated read access for medias"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'medias' );
