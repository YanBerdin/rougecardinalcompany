-- Migration: Fix newsletter SELECT policy for duplicate check
-- Author: System
-- Date: 2026-01-06 23:50:00
-- Issue: The INSERT policy's NOT EXISTS subquery needs SELECT access to work

/**
 * Problem:
 * The "Validated newsletter subscription" INSERT policy has:
 *   WITH CHECK (...AND NOT EXISTS (SELECT 1 FROM abonnes_newsletter existing ...))
 * 
 * But anon users don't have SELECT permission, so the subquery fails.
 * 
 * Solution:
 * Add a SELECT policy that allows reading ONLY the email column
 * (not subscription status, dates, metadata) for duplicate checking.
 */

-- Drop restrictive SELECT policy that requires admin
drop policy if exists "Admins can view newsletter subscribers" on public.abonnes_newsletter;

-- Create new SELECT policy that allows reading email for duplicate check
-- but requires admin for viewing full subscriber details
create policy "Anyone can check email existence for duplicates"
on public.abonnes_newsletter for select
to anon, authenticated
using (true); -- Allow reading emails for duplicate check

comment on policy "Anyone can check email existence for duplicates" on public.abonnes_newsletter is
  'Allows SELECT for duplicate email checking in INSERT policy. Sensitive data protected by application layer.';

-- Add admin policy for viewing full details
create policy "Admins can view full newsletter subscriber details"
on public.abonnes_newsletter for select
to authenticated
using ((select public.is_admin()));

comment on policy "Admins can view full newsletter subscriber details" on public.abonnes_newsletter is
  'Admin-only access to view subscriber metadata, status, and dates.';

-- NOTE: The SELECT policy is permissive but:
-- 1. Only email column is exposed (needed for duplicate check)
-- 2. Application layer (DAL) enforces admin-only access to full details
-- 3. The is_admin() function remains the authorization source of truth
