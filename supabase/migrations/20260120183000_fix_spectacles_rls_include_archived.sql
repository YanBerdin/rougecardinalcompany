-- Migration: Fix spectacles RLS policy to include archived shows
-- Date: 2026-01-20
--
-- Purpose:
--   The RLS policy for spectacles was filtering out archived shows for anonymous
--   users (status = 'published' only). This caused "Nos Créations Passées" section
--   to show 0 results for unauthenticated visitors (Chrome without session).
--
-- Changes:
--   - Update SELECT policy to allow public spectacles with status 'published' OR 'archived'
--   - Use is_admin() helper function instead of subquery for consistency
--
-- Affected Tables:
--   - public.spectacles (UPDATE policy)
--
-- Security Considerations:
--   - Only public = true spectacles are visible to anonymous users
--   - Draft/unpublished spectacles remain hidden from public
--   - Admins retain full visibility

-- Drop existing policies
drop policy if exists "Public spectacles are viewable by everyone" on public.spectacles;
drop policy if exists "Admins can view all spectacles" on public.spectacles;
drop policy if exists "View spectacles (public published OR admin all)" on public.spectacles;
drop policy if exists "View spectacles (public published/archived OR admin all)" on public.spectacles;

-- Create new policy that includes archived shows
create policy "View spectacles (public published/archived OR admin all)"
on public.spectacles
for select
to anon, authenticated
using (
  (
    -- Public spectacles: published OR archived (for "Nos Créations Passées")
    public = true
    and status in ('published', 'archived')
  )
  or
  -- Admins can see everything
  (select public.is_admin())
);

-- Verification query (commented, for manual testing)
-- SELECT count(*) as archived_public_spectacles 
-- FROM public.spectacles 
-- WHERE status = 'archived' AND public = true;
