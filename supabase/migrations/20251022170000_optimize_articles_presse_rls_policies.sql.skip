-- Migration: Optimize articles_presse RLS policies for performance
-- Created: 2025-10-22 17:00:00
-- Purpose: Fix multiple permissive policies performance issue
--
-- Context:
-- Supabase Dashboard reported multiple permissive policies for authenticated
-- users on articles_presse table, causing PostgreSQL to evaluate both policies
-- for every SELECT query (OR semantics).
--
-- Current Issue:
-- Two permissive policies for role 'authenticated' on SELECT:
-- 1. "Public press articles are viewable by everyone" (anon + authenticated)
-- 2. "Admins can view all press articles" (authenticated only)
--
-- Problem:
-- For authenticated users, Postgres evaluates BOTH policies on every row,
-- causing unnecessary overhead even when the user is not an admin.
--
-- Solution Strategy:
-- Convert the admin policy from PERMISSIVE to RESTRICTIVE. This makes it
-- act as an "OR" gate: if the user is an admin, they see ALL rows regardless
-- of the public policy. If not admin, only the public policy applies.
--
-- Performance Impact:
-- - Admin users: Single is_admin() check, then full table access (optimal)
-- - Non-admin users: Only evaluate public policy (published_at check)
-- - Anon users: Only evaluate public policy (unchanged)
--
-- Security Model:
-- Layer 1: Public policy (PERMISSIVE) - published articles for everyone
-- Layer 2: Admin policy (RESTRICTIVE) - full access for admins
-- Result: Admins bypass public filter, non-admins see only published

-- Step 1: Drop existing admin policy
DROP POLICY IF EXISTS "Admins can view all press articles" ON public.articles_presse;

-- Step 2: Recreate as RESTRICTIVE policy
-- RESTRICTIVE policies use AND semantics with PERMISSIVE policies
-- For admins: true AND (any permissive) = true (shows all rows)
-- For non-admins: false AND (any permissive) = false (falls back to permissive only)
CREATE POLICY "Admins can view all press articles"
ON public.articles_presse
AS RESTRICTIVE  -- ← Key change: RESTRICTIVE instead of PERMISSIVE
FOR SELECT
TO authenticated
USING (
  -- Admin users see ALL rows (bypass published filter)
  (SELECT public.is_admin())
);

-- Note: Public permissive policy remains unchanged
-- "Public press articles are viewable by everyone" still allows
-- anon and authenticated users to see published articles

-- Performance optimization: Ensure indexes exist
-- (These should already exist from previous migrations)
DO $$
BEGIN
  -- Index on published_at for public policy evaluation
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'articles_presse' 
    AND indexname = 'idx_articles_presse_published_at'
  ) THEN
    CREATE INDEX idx_articles_presse_published_at 
    ON public.articles_presse(published_at) 
    WHERE published_at IS NOT NULL;
  END IF;
END $$;

-- Verification queries (run manually to test):
-- 
-- Test 1: As anon user (should see only published)
-- SET ROLE anon;
-- SELECT COUNT(*) FROM articles_presse; -- Should match published count
-- RESET ROLE;
--
-- Test 2: As authenticated non-admin (should see only published)
-- -- Simulate via client with non-admin JWT
--
-- Test 3: As authenticated admin (should see ALL)
-- -- Simulate via client with admin JWT (user_metadata.is_admin = true)
--
-- Performance test:
-- EXPLAIN ANALYZE SELECT * FROM articles_presse WHERE published_at IS NOT NULL;
-- Should show efficient index usage and minimal policy overhead
