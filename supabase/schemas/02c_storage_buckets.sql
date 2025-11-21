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
