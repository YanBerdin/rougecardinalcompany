-- Migration: Refactor handle_user_update() to read role from app_metadata only
-- Purpose: Aligne handle_user_update sur le nouveau modèle de sécurité (TASK096 Phase 1 Step 3)
-- Affected: function public.handle_user_update() (trigger on auth.users)
-- Special:
--   - Source de vérité du rôle : raw_app_meta_data->>'role' uniquement (server-side only).
--   - raw_user_meta_data->>'role' n'est plus lu : prévient l'auto-escalation client.
--   - Garde-fou enrichi : détecte aussi les changements de raw_app_meta_data.
--   - Cette migration est synchronisée avec supabase/schemas/21_functions_auth_sync.sql.

-- =============================================================================
-- Trigger function: handle_user_update
-- =============================================================================

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
  -- Vérification des changements pertinents : display_name vit dans user_metadata,
  -- role vit dans app_metadata. On doit donc surveiller les deux + l'email.
  if old.raw_user_meta_data is not distinct from new.raw_user_meta_data
     and old.raw_app_meta_data is not distinct from new.raw_app_meta_data
     and old.email is not distinct from new.email then
    return new;
  end if;

  -- Construction du nouveau display_name (toujours dans user_metadata)
  new_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    concat_ws(' ',
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name'
    ),
    new.email,
    'Utilisateur'
  );

  -- Validation du nouveau rôle (source unique : app_metadata).
  -- Si app_metadata.role absent/invalide, on préserve le rôle existant du profil.
  new_role := case
    when new.raw_app_meta_data->>'role' in ('user', 'editor', 'admin')
    then new.raw_app_meta_data->>'role'
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
1. Accesses auth.users.raw_app_meta_data / raw_user_meta_data (restricted by default)
2. Must update profiles regardless of user RLS permissions
3. Ensures metadata synchronization works for all user roles
4. Executes in trigger context where standard user permissions may be insufficient
Role source of truth: raw_app_meta_data->>"role" only (server-side, anti-escalation).
Only processes relevant metadata changes for performance optimization.';
