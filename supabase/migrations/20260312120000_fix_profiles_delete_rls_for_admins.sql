-- Migration: Allow admins to delete any profile
-- Purpose: Fix audit logs showing "Système" on user deletion.
--   The DELETE RLS policy only allowed self-deletion, blocking the admin's
--   authenticated client. The cascade trigger (handle_user_deletion, SECURITY DEFINER)
--   then performed the actual delete with auth.uid() = NULL → "Système" in audit.
-- Affected: public.profiles DELETE policy

drop policy if exists "Users can delete their own profile" on public.profiles;
drop policy if exists "Users can delete their own profile OR admins can delete any profile" on public.profiles;

create policy "Users can delete their own profile OR admins can delete any profile"
on public.profiles
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  or
  (select public.is_admin()) = true
);
