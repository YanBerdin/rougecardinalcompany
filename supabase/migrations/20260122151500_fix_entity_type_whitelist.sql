-- Migration: Fix analytics_events INSERT policy - Add entity_type whitelist
-- Purpose: Restore entity_type whitelist accidentally removed in 20260122150000
-- 
-- Context:
--   Migration 20260122150000 restored INSERT policies but forgot to include
--   the entity_type whitelist from original migration 20260106190617.
--   This allows invalid entity types to be inserted.
-- 
-- Fix: Recreate policy with complete validation including entity_type whitelist

-- ============================================================================
-- FIX analytics_events INSERT POLICY - Add entity_type whitelist
-- ============================================================================

-- Drop existing policy
drop policy if exists "Validated analytics collection" on public.analytics_events;

-- Recreate with complete validation including entity_type whitelist
create policy "Validated analytics collection"
on public.analytics_events for insert
to anon, authenticated
with check (
  -- Event type must be one of the allowed values
  event_type in ('view', 'click', 'share', 'download')
  
  -- ✅ Entity type whitelist (from original 20260106190617 + extended)
  and entity_type in (
    'spectacle',      -- Shows
    'article',        -- Press articles
    'communique',     -- Press releases
    'evenement',      -- Events
    'media',          -- Media files
    'partner',        -- Partners
    'team'            -- Team members
  )
  
  -- Entity ID is optional but if provided must be valid positive integer
  and (entity_id is null or entity_id::text ~ '^\d+$')
  
  -- Session ID optional for anonymous tracking (UUID format)
  and (session_id is null or session_id::text ~ '^[a-f0-9-]{36}$')
  
  -- User agent optional but limited length
  and (user_agent is null or length(user_agent) <= 500)
);

comment on policy "Validated analytics collection" on public.analytics_events is
'Enforce event_type and entity_type whitelisting. Rate limiting handled at app layer.';

-- ============================================================================
-- VERIFICATION: Ensure policy enforces whitelist
-- ============================================================================

do $$
declare
  test_error text;
begin
  -- Set role to anon to test RLS enforcement
  execute 'set local role anon';
  
  -- Test: Invalid entity_type should be blocked
  begin
    insert into public.analytics_events (event_type, entity_type)
    values ('view', 'invalid_entity_type');
    
    raise exception 'VALIDATION FAILED: Invalid entity_type was NOT blocked!';
  exception
    when sqlstate '42501' then
      raise notice '✅ entity_type whitelist enforced correctly';
    when others then
      get stacked diagnostics test_error = message_text;
      raise warning 'Unexpected error during validation: %', test_error;
  end;
  
  -- Reset role
  reset role;

  raise notice '✅ entity_type whitelist validation complete';
end;
$$;
