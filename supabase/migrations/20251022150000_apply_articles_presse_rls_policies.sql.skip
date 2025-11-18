-- Migration: Apply RLS policies for articles_presse table
-- Created: 2025-10-22 15:00:00
-- Purpose: Apply RLS policies that were missing from the Cloud database
--
-- Context:
-- The table articles_presse has RLS enabled but no policies were applied.
-- This caused all queries from anon/authenticated users to return 0 results
-- (PostgreSQL's secure default behavior: deny all access when RLS is enabled
-- but no policies exist).
--
-- This migration applies the policies defined in the declarative schema
-- (supabase/schemas/08_table_articles_presse.sql).

-- Public can read only published articles
create policy "Public press articles are viewable by everyone"
on public.articles_presse
for select
to anon, authenticated
using ( published_at is not null );

-- Admins can read all articles (including drafts)
create policy "Admins can view all press articles"
on public.articles_presse
for select
to authenticated
using ( (select public.is_admin()) );

-- Only admins can create articles
create policy "Admins can create press articles"
on public.articles_presse
for insert
to authenticated
with check ( (select public.is_admin()) );

-- Only admins can update articles
create policy "Admins can update press articles"
on public.articles_presse
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- Only admins can delete articles
create policy "Admins can delete press articles"
on public.articles_presse
for delete
to authenticated
using ( (select public.is_admin()) );
