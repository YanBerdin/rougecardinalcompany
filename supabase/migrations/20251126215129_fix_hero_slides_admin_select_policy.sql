-- Migration: fix_hero_slides_admin_select_policy
-- Purpose: Add RLS policy for admins to view ALL hero slides (including inactive)
-- Affected table: public.home_hero_slides
-- Rationale: Admins need to see inactive slides to toggle their active state

create policy "Admins can view all home hero slides"
  on public.home_hero_slides
  as permissive
  for select
  to authenticated
  using ((select public.is_admin()));



