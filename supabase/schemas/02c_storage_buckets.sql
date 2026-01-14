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
 *   - Public read access (public = true)
 *   - Authenticated users can upload
 *   - Only admins can delete
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
  5242880,  -- 5MB max file size
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
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
drop policy if exists "Authenticated users can upload to medias" on storage.objects;
drop policy if exists "Authenticated users can update medias" on storage.objects;
drop policy if exists "Admins can delete medias" on storage.objects;

-- Allow public read access
create policy "Public read access for medias"
on storage.objects for select
to public
using ( bucket_id = 'medias' );

-- Allow authenticated users to upload
create policy "Authenticated users can upload to medias"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'medias' );

-- Allow authenticated users to update their own uploads
create policy "Authenticated users can update medias"
on storage.objects for update
to authenticated
using ( bucket_id = 'medias' )
with check ( bucket_id = 'medias' );

-- Allow admins to delete (requires is_admin() check)
create policy "Admins can delete medias"
on storage.objects for delete
to authenticated
using ( 
  bucket_id = 'medias' 
  and (select public.is_admin())
);

-- Note: comments on storage.objects policies not supported in declarative schema
-- Policy descriptions:
-- - Public read access: Anyone can view media files
-- - Upload access: Authenticated users (admin check in Server Actions)
-- - Update access: Authenticated users can update file metadata
-- - Delete access: Only admins can delete media files

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
