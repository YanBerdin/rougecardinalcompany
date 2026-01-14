-- Migration: Add backups storage bucket for TASK050
-- Purpose: Create private bucket for automated database backups
-- Affected: storage.buckets, storage.objects policies
-- RLS: Service role only (no public/authenticated access)
-- Special: Used by GitHub Actions weekly backup workflow

-- =============================================================================
-- BUCKET CREATION
-- =============================================================================

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

-- =============================================================================
-- RLS POLICIES (service_role only)
-- =============================================================================

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
