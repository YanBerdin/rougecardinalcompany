-- Migration: Fix duplicate permissive SELECT policies on categories table
-- Source: Performance audit - duplicate policies cause unnecessary evaluation overhead
-- Date: 2026-01-07
--
-- Problem:
--   Table public.categories has two permissive RLS policies for SELECT:
--   1. "Active categories are viewable by everyone" - using (is_active = true)
--   2. "Admins can view all categories" - using ((select public.is_admin()))
--
--   Both apply to role 'authenticated', forcing PostgreSQL to evaluate both
--   policies for every SELECT query, increasing CPU work and query latency.
--
-- Solution:
--   Merge both policies into a single policy with OR logic:
--   - Allow rows where (is_active = true) OR (user is admin)
--   - Applies to both anon and authenticated roles
--   - Single evaluation per query instead of two
--
-- Expected impact:
--   - Reduced RLS evaluation overhead on categories table
--   - Simpler policy logic, easier to maintain
--   - Consistent with other optimized tables (spectacles, partners, etc.)

-- Drop old duplicate policies
drop policy if exists "Active categories are viewable by everyone" on public.categories;
drop policy if exists "Admins can view all categories" on public.categories;

-- Create merged policy with combined logic
create policy "View categories (active OR admin)"
on public.categories
for select
to anon, authenticated
using ( is_active = true or (select public.is_admin()) );
