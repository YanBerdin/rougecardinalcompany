-- Migration: Skip profile creation in handle_new_user() for invited users
-- Purpose: When an admin invites a user, the profile should be created by the
-- admin's authenticated client (createUserProfileWithRole) so the audit_trigger
-- captures the real admin user instead of "Système".
-- Affected: public.handle_new_user() trigger function
-- Note: superseded by migration 20260312140000 (invited_at was not set at INSERT time)

/*
 * Security Model: SECURITY DEFINER
 *
 * Rationale:
 *   1. Executes as a trigger on auth.users INSERT (system context, auth.uid() = NULL)
 *   2. Must INSERT into public.profiles bypassing RLS policies for new users without session
 *   3. SECURITY INVOKER insufficient: new users have no session at trigger fire time
 *   4. Legitimate use case: automatic profile creation on self-signup
 *
 * Risks Evaluated:
 *   - Authorization: Only runs on auth.users INSERT (trigger context, not user-callable)
 *   - Input validation: new.id null check prevents invalid INSERTs
 *   - Privilege escalation: Restricted to profile INSERT only, no arbitrary operations
 *   - SQL injection: Parameterized values only, no dynamic SQL
 *
 * Validation:
 *   - Superseded by migration 20260312140000 which uses _admin_managed flag
 *   - This version used invited_at check (ineffective: not set at INSERT time)
 *
 * Grant Policy:
 *   - No direct GRANT needed: executes only in trigger context
 */
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_display_name text;
  profile_role text;
begin
  -- Validation de l'entrée
  if new.id is null then
    raise exception 'User ID cannot be null';
  end if;

  -- Skip profile creation for admin-managed users: the admin code (createUserProfileWithRole)
  -- will INSERT the profile with the authenticated client so audit_trigger captures
  -- the real admin user instead of "Système".
  -- We check _admin_managed flag in metadata because invited_at may not be set
  -- at INSERT time by generateLink.
  if (new.raw_user_meta_data->>'_admin_managed') = 'true' then
    return new;
  end if;

  -- Construction sécurisée du display_name
  profile_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    concat_ws(' ', 
      new.raw_user_meta_data->>'first_name', 
      new.raw_user_meta_data->>'last_name'
    ),
    new.email,
    'Utilisateur'
  );

  -- Validation et assignation du rôle
  profile_role := case 
    when new.raw_user_meta_data->>'role' in ('user', 'editor', 'admin') 
    then new.raw_user_meta_data->>'role'
    else 'user'
  end;

  -- Insertion avec gestion d'erreur
  begin
    insert into public.profiles (user_id, display_name, role)
    values (new.id, profile_display_name, profile_role);
  exception 
    when unique_violation then
      raise warning 'Profile already exists for user %', new.id;
    when others then
      raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;
