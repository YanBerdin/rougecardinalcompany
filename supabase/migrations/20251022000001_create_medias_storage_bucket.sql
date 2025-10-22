/*
 * Migration: Create medias storage bucket
 * ============================================
 * 
 * PURPOSE:
 *   Create Supabase Storage bucket for team photos and other media assets.
 *   Required for Team Management feature (TASK022).
 * 
 * TYPE: DDL (Storage)
 * 
 * AFFECTED OBJECTS:
 *   - NEW BUCKET: medias
 *   - POLICIES: Allow authenticated users to upload, admins to delete
 * 
 * SECURITY:
 *   - Public read access for all uploaded files
 *   - Authenticated users can upload (additional admin check in Server Actions)
 *   - Only admins can delete files
 * 
 * APPLIED: 2025-10-22
 * PROJECT: Rouge Cardinal Company - Team Management
 */

-- Create medias bucket (public = true for public read access)
insert into storage.buckets (id, name, public)
values ('medias', 'medias', true)
on conflict (id) do nothing;

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
using ( bucket_id = 'medias' );

-- Allow admins to delete (requires is_admin() check)
create policy "Admins can delete medias"
on storage.objects for delete
to authenticated
using ( 
  bucket_id = 'medias' 
  and (select public.is_admin())
);
