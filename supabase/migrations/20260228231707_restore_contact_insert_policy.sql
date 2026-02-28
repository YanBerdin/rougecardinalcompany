-- Migration: Restore "Validated contact submission" INSERT policy on messages_contact
-- Purpose: Fix regression from 20260201135511_add_landscape_photos_to_spectacles.sql
--          which dropped the policy without recreating it, blocking all public contact form submissions.
-- Affected table: public.messages_contact (INSERT only)

-- Idempotent: drop first to avoid duplicate policy error
drop policy if exists "Validated contact submission" on public.messages_contact;

create policy "Validated contact submission"
on public.messages_contact for insert
to anon, authenticated
with check (
  -- Required fields non-null
  firstname is not null and firstname <> ''
  and lastname is not null and lastname <> ''
  and email is not null and email <> ''
  and reason is not null
  and message is not null and message <> ''
  and consent = true  -- RGPD mandatory

  -- Email format validation
  and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'

  -- Phone optional but validated if present
  and (phone is null or phone ~* '^\+?[0-9\s\-\(\)]{10,}$')

  -- Message length limits (anti-abuse)
  and length(message) between 10 and 5000
);

comment on policy "Validated contact submission"
  on public.messages_contact is
'Enforce form validation and RGPD consent.
Rate limiting (5 req/15min/IP) enforced by application layer (TASK046).
Restored by hotfix migration 20260228231707 after accidental drop in 20260201135511.';
