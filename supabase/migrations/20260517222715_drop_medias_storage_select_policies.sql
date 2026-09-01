-- Migration: drop medias storage select policies
-- Purpose: prevent broad client-side listing of the public medias storage bucket.
-- Affected: storage.objects policies for bucket id 'medias'.
-- RLS: removes select policies; public object urls remain available through the public bucket.
-- Special: storage policy changes are a Supabase diff caveat, so this hotfix is versioned manually.

-- Remove the original public listing policy, if it still exists on any environment.
drop policy if exists "Public read access for medias" on storage.objects;

-- Remove the intermediate authenticated listing policy created by the previous hotfix.
drop policy if exists "Authenticated read access for medias" on storage.objects;