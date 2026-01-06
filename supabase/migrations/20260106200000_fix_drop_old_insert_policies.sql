-- Migration: Fix RLS policy conflicts by dropping old permissive INSERT policies
-- Purpose: Remove "WITH CHECK (true)" policies that override validation policies
-- Affected Tables: messages_contact, analytics_events
-- 
-- Problem: PostgreSQL combines PERMISSIVE policies with OR logic.
-- When "Anyone can insert..." has WITH CHECK (true), it allows everything,
-- making the "Validated..." policy ineffective.

-- ============================================================================
-- STEP 1: DROP OLD PERMISSIVE INSERT POLICIES (WITH CHECK = true)
-- ============================================================================

-- messages_contact: Remove the permissive policy that allows any insert
drop policy if exists "Anyone can send contact messages" on public.messages_contact;

-- analytics_events: Remove the permissive policy that allows any insert
drop policy if exists "Anyone can insert analytics events" on public.analytics_events;

-- ============================================================================
-- VERIFICATION: After this migration, only validated policies should remain
-- ============================================================================
-- Expected result:
--   messages_contact: "Validated contact submission" (INSERT)
--   analytics_events: "Validated analytics collection" (INSERT)
--   abonnes_newsletter: "Validated newsletter subscription" (INSERT)
--   logs_audit: No INSERT policy (protected by REVOKE + trigger)

do $$
declare
  policy_count integer;
begin
  -- Check messages_contact INSERT policies
  select count(*) into policy_count
  from pg_policies
  where tablename = 'messages_contact' and cmd = 'INSERT';
  
  if policy_count = 1 then
    raise notice '✅ messages_contact has exactly 1 INSERT policy';
  else
    raise warning '⚠️ messages_contact has % INSERT policies (expected 1)', policy_count;
  end if;

  -- Check analytics_events INSERT policies
  select count(*) into policy_count
  from pg_policies
  where tablename = 'analytics_events' and cmd = 'INSERT';
  
  if policy_count = 1 then
    raise notice '✅ analytics_events has exactly 1 INSERT policy';
  else
    raise warning '⚠️ analytics_events has % INSERT policies (expected 1)', policy_count;
  end if;

  -- Check abonnes_newsletter INSERT policies
  select count(*) into policy_count
  from pg_policies
  where tablename = 'abonnes_newsletter' and cmd = 'INSERT';
  
  if policy_count = 1 then
    raise notice '✅ abonnes_newsletter has exactly 1 INSERT policy';
  else
    raise warning '⚠️ abonnes_newsletter has % INSERT policies (expected 1)', policy_count;
  end if;

  raise notice '✅ Old permissive INSERT policies removed - validation now enforced';
end;
$$;
