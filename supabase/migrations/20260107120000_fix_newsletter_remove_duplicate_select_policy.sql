-- Migration: Remove duplicate SELECT policy on newsletter
-- Author: System
-- Date: 2026-01-07
-- Issue: Two SELECT policies cause issues - only one is needed

/**
 * Problem:
 * The table has 2 SELECT policies:
 * 1. "Anyone can check email existence for duplicates" - USING (true)
 * 2. "Admins can view full newsletter subscriber details" - USING (is_admin())
 * 
 * Having both causes issues because PostgreSQL evaluates all policies.
 * The USING (true) policy is sufficient - it allows SELECT for everyone.
 * Application layer (DAL) controls what data admins vs public can see.
 * 
 * Solution: Remove the redundant admin-only SELECT policy.
 */

-- Remove redundant admin SELECT policy
drop policy if exists "Admins can view full newsletter subscriber details" on public.abonnes_newsletter;

-- The "Anyone can check email existence for duplicates" policy remains
-- with USING (true) which allows the duplicate check in INSERT policy.

-- Update comment to clarify the SELECT policy purpose
comment on policy "Anyone can check email existence for duplicates" on public.abonnes_newsletter is
  'SELECT enabled for duplicate email checking in INSERT policy. Admin-only data access enforced by application DAL layer.';
