-- Storage Buckets Configuration
-- Ordre: 02c - Buckets requis avant les tables qui référencent storage_path

/*
 * Bucket: medias
 * ===================
 * 
 * PURPOSE:
 *   Central storage for all media assets (team photos, press images, etc.)
 *   Referenced by multiple tables via storage_path column.
 * 
 * SECURITY:
 *   - No SELECT policy: bucket listing disabled (lint=0025 fix)
 *   - Direct CDN object URLs remain publicly accessible via Supabase Storage CDN
 *   - Editors and admins can upload, update, and delete
 *   - Enforced via has_min_role('editor') in RLS policies
 * 
 * TABLES USING THIS BUCKET:
 *   - medias (storage_path column)
 *   - membres_equipe (via photo_media_id FK)
 *   - communiques_presse (via header_media_id FK)
 *   - Future: spectacles, articles_presse, etc.
 */

-- Create medias bucket (idempotent with ON CONFLICT)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medias',
  'medias',
  true,  -- Public read access
  10485760,  -- 10MB max file size (increased for PDF support)
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']  -- PDF support for press releases
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

/*
 * RLS Policies for storage.objects
 * ====================================
 * Co-located with bucket creation for maintainability
 */

-- Drop existing policies if any (for clean re-generation)
drop policy if exists "Public read access for medias" on storage.objects;
drop policy if exists "Authenticated read access for medias" on storage.objects;
drop policy if exists "Authenticated users can upload to medias" on storage.objects;
drop policy if exists "Authenticated users can update medias" on storage.objects;
drop policy if exists "Admins can delete medias" on storage.objects;
drop policy if exists "Editors can upload to medias" on storage.objects;
drop policy if exists "Editors can update medias" on storage.objects;
drop policy if exists "Editors can delete medias" on storage.objects;

-- NOTE: No SELECT policy — bucket 'medias' is public=true, CDN URLs work without RLS.
-- Removing SELECT policy fixes lint=0025 (public_bucket_allows_listing) Supabase advisor alert.
-- Authenticated users can still access files via CDN URLs; they just can't enumerate the bucket.

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

-- Note: comments on storage.objects policies not supported in declarative schema
-- Policy descriptions:
-- - Public read access: Anyone can view media files
-- - Upload access: Editors and admins only (via has_min_role('editor'))
-- - Update access: Editors and admins can update file metadata
-- - Delete access: Editors and admins can delete media files

/*
 * Bucket: backups
 * ===================
 * 
 * PURPOSE:
 *   Automated weekly database backups (pg_dump output).
 *   Used by GitHub Actions workflow for TASK050 backup strategy.
 * 
 * SECURITY:
 *   - NOT PUBLIC (public = false)
 *   - Service role only access (for GitHub Actions automated backups)
 *   - No authenticated/anon access (backups are sensitive)
 * 
 * RETENTION:
 *   - Automated rotation: keeps last 4 weekly backups (1 month)
 *   - Implemented in scripts/backup-database.ts
 * 
 * FILE NAMING:
 *   - backup-YYYYMMDD-HHMMSS.dump.gz (gzip compressed pg_dump custom format)
 */

-- Create backups bucket (private, service_role only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'backups',
  'backups',
  false,  -- Private bucket (no public access)
  524288000,  -- 500MB max file size (sufficient for database dumps)
  array['application/gzip', 'application/octet-stream']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

/*
 * RLS Policies for storage.objects (backups bucket)
 * ====================================
 * CRITICAL SECURITY: No public/authenticated access.
 * Only service_role can upload/delete (GitHub Actions).
 */

-- Drop existing policies if any (for clean re-generation)
drop policy if exists "Service role can upload backups" on storage.objects;
drop policy if exists "Service role can read backups" on storage.objects;
drop policy if exists "Service role can delete old backups" on storage.objects;

-- Service role can upload new backups
create policy "Service role can upload backups"
on storage.objects for insert
to service_role
with check ( bucket_id = 'backups' );

-- Service role can read backups (for listing/rotation)
create policy "Service role can read backups"
on storage.objects for select
to service_role
using ( bucket_id = 'backups' );

-- Service role can delete old backups (rotation policy)
create policy "Service role can delete old backups"
on storage.objects for delete
to service_role
using ( bucket_id = 'backups' );

-- Note: No policies for 'authenticated' or 'anon' roles.
-- Backups are sensitive data and should never be publicly accessible.
