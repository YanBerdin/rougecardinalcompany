-- Migration: Fix infinite recursion in newsletter INSERT policy
-- Date: 2026-01-06 23:26 UTC
-- Severity: CRITICAL - Newsletter subscription broken
--
-- Problem: The "not exists" subquery in the newsletter policy causes
-- infinite recursion when checking for duplicate emails because it queries
-- the same table while the policy is being evaluated.
--
-- Solution: Use table alias to disambiguate and avoid recursion.

-- Drop the problematic policy
drop policy if exists "Validated newsletter subscription" on public.abonnes_newsletter;

-- Recreate with fixed subquery using table alias
create policy "Validated newsletter subscription"
on public.abonnes_newsletter for insert
to anon, authenticated
with check (
  -- Email format validation (strict regex)
  email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
  
  -- Anti-duplicate check (case-insensitive)
  -- FIXED: Use table alias 'existing' to avoid recursion
  and not exists (
    select 1 from public.abonnes_newsletter existing
    where lower(existing.email) = lower(abonnes_newsletter.email)
  )
);

comment on policy "Validated newsletter subscription" 
  on public.abonnes_newsletter is 
  'INSERT validation: email regex + anti-duplicate (case-insensitive). Defense in depth with app layer (Zod + rate limiting 3 req/h).';
