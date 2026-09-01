-- Migration: Remove user_metadata.role fallback from handle_new_user()
-- Purpose: TASK096 Phase 1 Step 5 — purge the temporary raw_user_meta_data->>'role'
--          fallback now that backfill is validated and admin code writes app_metadata only.
-- Affected: function public.handle_new_user() (trigger on auth.users)
-- Special:
--   - Source de vérité unique : raw_app_meta_data->>'role' (server-side, signé dans le JWT).
--   - raw_user_meta_data->>'role' n'est plus jamais lu : prévient l'auto-escalation client
--     via supabase.auth.updateUser({ data: { role: 'admin' } }).
--   - Synchronisée avec supabase/schemas/21_functions_auth_sync.sql et 05_profiles_auto_sync.sql.
--   - Conserve la skip-logic _admin_managed et la sync auth.users.raw_app_meta_data.

-- =============================================================================
-- Trigger function: handle_new_user (rewritten without user_metadata role fallback)
-- =============================================================================

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

  -- Skip profile creation for admin-managed users : le code admin
  -- (createUserProfileWithRole) insère le profil avec le client authentifié
  -- pour que audit_trigger capture l'admin réel au lieu de "Système".
  if (new.raw_user_meta_data->>'_admin_managed') = 'true' then
    return new;
  end if;

  -- Construction sécurisée du display_name (toujours dans user_metadata)
  profile_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    concat_ws(' ',
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name'
    ),
    new.email,
    'Utilisateur'
  );

  -- Validation et assignation du rôle.
  -- Source unique : raw_app_meta_data->>'role' (server-only, signé dans le JWT).
  -- raw_user_meta_data->>'role' est ignoré (modifiable par l'utilisateur côté client
  -- → risque d'élévation de privilège). Si app_metadata.role absent/invalide → 'user'.
  profile_role := case
    when new.raw_app_meta_data->>'role' in ('user', 'editor', 'admin')
      then new.raw_app_meta_data->>'role'
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

  -- Synchronise le rôle dans auth.users.raw_app_meta_data pour qu'il soit
  -- embarqué dans le JWT (utilisé par getClaims() côté app). Garde-fou
  -- `is distinct from` pour éviter un UPDATE inutile (qui déclencherait
  -- on_auth_user_updated -> handle_user_update).
  if (new.raw_app_meta_data->>'role') is distinct from profile_role then
    begin
      update auth.users
      set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
        || jsonb_build_object('role', profile_role)
      where id = new.id;
    exception when others then
      raise warning 'Failed to sync app_metadata.role for user %: %', new.id, sqlerrm;
    end;
  end if;

  return new;
end;
$$;

comment on function public.handle_new_user() is
'Trigger function: Creates profile automatically when user registers. Uses SECURITY DEFINER because:
1. Must access auth.users table (restricted to service_role by default)
2. Must insert into public.profiles regardless of user RLS policies
3. Executes in trigger context where user permissions may be limited
4. Ensures profile creation succeeds even for new users without existing permissions
Role source of truth: raw_app_meta_data->>"role" only (server-side, anti-escalation).
Skips profiles for users tagged _admin_managed=true (admin code inserts profile itself).';
