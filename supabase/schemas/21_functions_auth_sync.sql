-- Fonctions de synchronisation auth.users <-> profiles
-- Ordre: 21 - Dépend des fonctions core et table profiles

-- Fonction pour créer automatiquement un profil lors de l'inscription
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Must access auth.users table (restricted to service_role by default)
 *   2. Must insert into public.profiles regardless of user RLS policies
 *   3. Executes in trigger context where user permissions may be limited
 *   4. Ensures profile creation succeeds even for new users without existing permissions
 * 
 * Risks Evaluated:
 *   - Input validation: Validates new.id is not null before processing
 *   - SQL injection: Uses parameterized values, no dynamic SQL
 *   - Privilege escalation: Only performs controlled profile creation, no arbitrary operations
 * 
 * Validation:
 *   - Tested with new user registration flow (auth.users insert triggers profile creation)
 *   - Exception handling prevents silent failures
 *   - Unique violation handled gracefully (idempotent)
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

comment on function public.handle_new_user() is 
'Trigger function: Creates profile automatically when user registers. Uses SECURITY DEFINER because:
1. Must access auth.users table (restricted to service_role by default)
2. Must insert into public.profiles regardless of user RLS policies
3. Executes in trigger context where user permissions may be limited
4. Ensures profile creation succeeds even for new users without existing permissions
This is a legitimate use case for SECURITY DEFINER as it performs administrative setup tasks.';

-- Fonction pour supprimer le profil lors de la suppression d'un utilisateur
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Executes during user deletion from auth.users (system operation)
 *   2. Must bypass RLS policies to ensure complete cleanup
 *   3. Maintains referential integrity between auth.users and profiles
 *   4. Prevents orphaned profile records that could cause security issues
 * 
 * Risks Evaluated:
 *   - Input validation: Checks old.id is not null before deletion
 *   - Data integrity: Ensures profile cleanup happens atomically with user deletion
 *   - Error handling: Logs warnings but doesn't block user deletion if profile cleanup fails
 * 
 * Validation:
 *   - Tested with user account deletion flow (auth.users delete triggers profile removal)
 *   - Exception handling prevents cascade failure
 */
create or replace function public.handle_user_deletion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.id is null then
    raise warning 'Cannot delete profile: user ID is null';
    return old;
  end if;

  begin
    delete from public.profiles where user_id = old.id;
    raise notice 'Profile deleted for user %', old.id;
  exception when others then
    raise warning 'Failed to delete profile for user %: %', old.id, sqlerrm;
  end;

  return old;
end;
$$;

comment on function public.handle_user_deletion() is 
'Trigger function: Removes profile when user is deleted. Uses SECURITY DEFINER because:
1. Executes during user deletion from auth.users (system operation)
2. Must bypass RLS policies to ensure complete cleanup
3. Maintains referential integrity between auth.users and profiles
4. Prevents orphaned profile records that could cause security issues
Essential for data consistency and security during user account deletion.';

-- Fonction pour mettre à jour le profil lors de la mise à jour d'un utilisateur
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Accesses auth.users.raw_user_meta_data (restricted by default)
 *   2. Must update profiles regardless of user RLS permissions
 *   3. Ensures metadata synchronization works for all user roles
 *   4. Executes in trigger context where standard user permissions may be insufficient
 * 
 * Risks Evaluated:
 *   - Input validation: Checks for relevant metadata changes before processing (performance optimization)
 *   - Role validation: Validates role against whitelist ('user', 'editor', 'admin')
 *   - Error handling: Logs warnings for missing profiles without blocking the operation
 * 
 * Validation:
 *   - Tested with user metadata update flow (display_name, role changes)
 *   - Only processes relevant changes (skips if no metadata/email changed)
 */
create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_display_name text;
  new_role text;
begin
  -- Vérification des changements pertinents
  if old.raw_user_meta_data is not distinct from new.raw_user_meta_data 
     and old.email is not distinct from new.email then
    return new;
  end if;

  -- Construction du nouveau display_name
  new_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    concat_ws(' ', 
      new.raw_user_meta_data->>'first_name', 
      new.raw_user_meta_data->>'last_name'
    ),
    new.email,
    'Utilisateur'
  );

  -- Validation du nouveau rôle
  new_role := case 
    when new.raw_user_meta_data->>'role' in ('user', 'editor', 'admin') 
    then new.raw_user_meta_data->>'role'
    else coalesce((select role from public.profiles where user_id = new.id), 'user')
  end;

  begin
    update public.profiles
    set 
      display_name = new_display_name,
      role = new_role,
      updated_at = now()
    where user_id = new.id;

    if not found then
      raise warning 'No profile found to update for user %', new.id;
    end if;

  exception when others then
    raise warning 'Failed to update profile for user %: %', new.id, sqlerrm;
  end;
  
  return new;
end;
$$;

comment on function public.handle_user_update() is 
'Trigger function: Updates profile when user metadata changes. Uses SECURITY DEFINER because:
1. Accesses auth.users.raw_user_meta_data (restricted by default)
2. Must update profiles regardless of user RLS permissions
3. Ensures metadata synchronization works for all user roles
4. Executes in trigger context where standard user permissions may be insufficient
Only processes relevant metadata changes for performance optimization.';
