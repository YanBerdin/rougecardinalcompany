-- Migration: Final restoration of INSERT policies after chronological conflicts
-- Purpose: Re-restore INSERT policies dropped by migration 20260106200000 applied after 20260118010000
-- 
-- Context:
--   1. Migration 20260118010000 restored INSERT policies after TASK053 db diff bug
--   2. Migration 20260106200000 was created on Jan 6 but applied chronologically AFTER Jan 18
--   3. This caused INSERT policies to be dropped again in production
--   4. Local db reset applies in alphabetical order (06 before 18), so policies exist locally
--   5. This migration re-establishes the validated INSERT policies for production

-- ============================================================================
-- RESTORE INSERT POLICIES FOR messages_contact
-- ============================================================================

-- Drop any existing INSERT policies to ensure clean state
drop policy if exists "Validated contact submission" on public.messages_contact;
drop policy if exists "Anyone can send contact messages" on public.messages_contact;

-- Create validated INSERT policy (RGPD compliant with consent + validation)
create policy "Validated contact submission"
on public.messages_contact for insert
to anon, authenticated
with check (
  -- Required fields validation
  firstname is not null and firstname <> ''
  and lastname is not null and lastname <> ''
  and email is not null and email <> ''
  and reason is not null
  and message is not null and message <> ''
  
  -- RGPD: Consent mandatory
  and consent = true
  
  -- Email format validation (RFC 5322 simplified)
  and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  
  -- Phone format validation (optional field, if provided must be valid)
  and (phone is null or phone ~* '^\+?[0-9\s\-\(\)]{10,}$')
  
  -- Message length validation
  and length(message) between 10 and 5000
);

comment on policy "Validated contact submission" on public.messages_contact is
'Allow validated contact form submissions with RGPD consent and field validation';

-- ============================================================================
-- RESTORE INSERT POLICIES FOR analytics_events
-- ============================================================================

-- Drop any existing INSERT policies to ensure clean state
drop policy if exists "Validated analytics collection" on public.analytics_events;
drop policy if exists "Anyone can insert analytics events" on public.analytics_events;

-- Create validated INSERT policy
create policy "Validated analytics collection"
on public.analytics_events for insert
to anon, authenticated
with check (
  -- Event type must be one of the allowed values
  event_type in ('view', 'click', 'share', 'download')
  
  -- ✅ Entity type whitelist (restored from 20260106190617 + extended)
  and entity_type in ('spectacle', 'article', 'communique', 'evenement', 'media', 'partner', 'team')
  
  -- Entity ID is optional but if provided must be valid (future foreign key constraint)
  and (entity_id is null or entity_id::text ~ '^\d+$')
  
  -- Session ID optional for anonymous tracking
  and (session_id is null or session_id::text ~ '^[a-f0-9-]{36}$')
  
  -- User agent optional
  and (user_agent is null or length(user_agent) <= 500)
  
  -- Metadata is valid JSON (enforced by column type, default '{}' is allowed)
);

comment on policy "Validated analytics collection" on public.analytics_events is
'Allow validated analytics event tracking with type and entity validation';

-- ============================================================================
-- VERIFICATION: Ensure exactly 1 INSERT policy per table
-- ============================================================================

do $$
declare
  contact_policies integer;
  analytics_policies integer;
begin
  -- Count INSERT policies for messages_contact
  select count(*) into contact_policies
  from pg_policies
  where tablename = 'messages_contact' and cmd = 'INSERT';
  
  if contact_policies = 1 then
    raise notice '✅ messages_contact has exactly 1 INSERT policy';
  else
    raise warning '⚠️  messages_contact has % INSERT policies (expected 1)', contact_policies;
  end if;

  -- Count INSERT policies for analytics_events
  select count(*) into analytics_policies
  from pg_policies
  where tablename = 'analytics_events' and cmd = 'INSERT';
  
  if analytics_policies = 1 then
    raise notice '✅ analytics_events has exactly 1 INSERT policy';
  else
    raise warning '⚠️  analytics_events has % INSERT policies (expected 1)', analytics_policies;
  end if;

  -- Final success message
  if contact_policies = 1 and analytics_policies = 1 then
    raise notice '✅ INSERT policies successfully restored - WITH CHECK validation active';
  else
    raise exception 'INSERT policy restoration failed - manual intervention required';
  end if;
end;
$$;
