-- Migration: Simplify newsletter INSERT policy to fix infinite recursion
-- Author: System
-- Date: 2026-01-07
-- Issue: NOT EXISTS subquery causes infinite recursion when evaluating RLS policies

/**
 * CRITICAL FIX: Infinite Recursion in RLS Policy
 * 
 * Root Cause Analysis:
 * The INSERT policy has a NOT EXISTS subquery that queries the same table:
 *   WITH CHECK (... AND NOT EXISTS (SELECT 1 FROM abonnes_newsletter existing ...))
 * 
 * When PostgreSQL evaluates this policy:
 * 1. User tries to INSERT → triggers INSERT policy evaluation
 * 2. INSERT policy has NOT EXISTS subquery → needs to SELECT from same table
 * 3. SELECT triggers SELECT policy evaluation on same table
 * 4. This can cause recursion in policy evaluation
 * 
 * Solution:
 * Remove the NOT EXISTS check from the RLS policy.
 * Rely on the UNIQUE constraint on email column for duplicate prevention.
 * The UNIQUE constraint is evaluated AFTER RLS, so no recursion.
 * 
 * Defense in Depth:
 * - Database layer: UNIQUE constraint on email (abonnes_email_unique)
 * - Application layer: Zod validation + rate limiting (3 req/h)
 * - RLS layer: Email format validation only
 */

-- Drop the problematic INSERT policy
drop policy if exists "Validated newsletter subscription" on public.abonnes_newsletter;

-- Create simplified INSERT policy without subquery
create policy "Validated newsletter subscription"
on public.abonnes_newsletter for insert
to anon, authenticated
with check (
  -- Email format validation only (no subquery to avoid recursion)
  email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
);

comment on policy "Validated newsletter subscription" on public.abonnes_newsletter is
  'INSERT validation: email regex only. Duplicate prevention by UNIQUE constraint. Rate limiting (3 req/h) enforced by application layer (TASK046).';
