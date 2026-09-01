-- Migration: Grant DELETE privilege on public.profiles to authenticated role
-- Created: 2026-07-15
-- Purpose: Fix "permission denied for table profiles" when an admin deletes
--          a user (RLS DELETE policy exists but the table-level GRANT was
--          missing on this database).
--
-- Context:
--   supabase/schemas/60_rls_profiles.sql defines a DELETE RLS policy allowing
--   self-deletion or admin deletion ("Users can delete their own profile OR
--   admins can delete any profile"), but the table-level GRANT for DELETE was
--   never restored after the security campaign that revoked all default
--   privileges. 20251027020000_restore_basic_grants_for_rls.sql only restored
--   SELECT, INSERT, UPDATE on profiles for authenticated — DELETE was omitted.
--
--   Without GRANT DELETE, PostgreSQL denies the operation before RLS policies
--   are even evaluated, causing lib/dal/admin-users.ts:deleteUser() to fail
--   with "permission denied for table profiles" and leaving a profile-less
--   "ghost" account still visible (and appearing "Vérifié") in the admin
--   users dashboard, since that list is sourced from auth.users, not profiles.
--
-- Affected: public.profiles (GRANT only, no schema/RLS change)

begin;

grant delete on table public.profiles to authenticated;

-- Verification
do $$
begin
  if not exists (
    select 1
    from information_schema.table_privileges
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee = 'authenticated'
      and privilege_type = 'DELETE'
  ) then
    raise exception 'GRANT DELETE on public.profiles to authenticated was not applied';
  end if;

  raise notice '✅ authenticated role can now DELETE on public.profiles (still filtered by RLS policy)';
end $$;

commit;
