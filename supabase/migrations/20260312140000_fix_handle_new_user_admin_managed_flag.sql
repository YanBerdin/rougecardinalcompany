-- Migration: Fix handle_new_user() to use _admin_managed metadata flag
-- Purpose: The previous migration used invited_at which is not set at INSERT time
-- by generateLink. This fix checks raw_user_meta_data->>'_admin_managed' instead.
-- Affected: public.handle_new_user() trigger function

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
 *   - Admin bypass: _admin_managed flag skips trigger for admin-created users so that
 *     createUserProfileWithRole() (authenticated client) captures the real admin UUID
 *
 * Validation:
 *   - Tested: self-signup creates profile via trigger with display_name from metadata
 *   - Tested: admin invitation skips trigger (_admin_managed=true), profile created by admin client
 *   - Unique violation handled gracefully (idempotent, raise WARNING)
 *
 * Grant Policy:
 *   - No direct GRANT needed: executes only in trigger context (auth.users INSERT)
 *   - Not user-callable
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
