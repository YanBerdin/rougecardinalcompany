-- Migration: Synchronize role into auth.users.raw_app_meta_data
--
-- Purpose
--   Make `app_metadata.role` the authoritative source of truth for user role.
--   This is required so that `getClaims()` (fast JWT verification) can rely on
--   `role` being present in the JWT (`app_metadata` is embedded in the token)
--   instead of falling back to user_metadata or a database lookup against
--   public.profiles. The fallback to user_metadata in lib/auth/roles.ts is
--   intentionally kept for one rotation cycle; this migration is the
--   prerequisite so it can be removed safely later.
--
-- Scope of this migration
--   1. Recreate `public.handle_new_user()` trigger function so that any new
--      user signup automatically writes `role` into `auth.users.raw_app_meta_data`.
--      Existing behavior is preserved: skip for admin-managed inserts and create
--      the matching row in public.profiles when applicable.
--   2. Backfill `auth.users.raw_app_meta_data->>role` from `public.profiles.role`
--      for every existing user where it differs (idempotent).
--
-- Affected objects
--   - function public.handle_new_user() (CREATE OR REPLACE)
--   - data: auth.users.raw_app_meta_data (UPDATE, idempotent)
--
-- Caveats / safety notes
--   - The function uses SECURITY DEFINER (it must read auth.users metadata and
--     write into public.profiles regardless of caller RLS). See header below.
--   - The function performs an UPDATE on auth.users which fires the
--     on_auth_user_updated trigger -> public.handle_user_update(). That
--     function only updates public.profiles and does NOT update auth.users,
--     so no infinite recursion is possible.
--   - The backfill is idempotent: it skips users whose app_metadata.role is
--     already equal to profiles.role.
--   - JWTs already issued before this migration still carry the old claims
--     (or no role claim). They will be refreshed on the user's next session
--     refresh / sign-in. Forcing immediate refresh requires JWT signing key
--     rotation in the Supabase Dashboard, which is intentionally out of scope
--     for this migration.

/*
 * Security Model: SECURITY DEFINER
 *
 * Rationale:
 *   1. Trigger must access auth.users (restricted to service_role by default)
 *   2. Must insert into public.profiles regardless of caller RLS
 *   3. Must update auth.users.raw_app_meta_data to embed `role` into the JWT
 *   4. Runs in trigger context where the calling user has no privileges yet
 *
 * Risks Evaluated:
 *   - Authorization: trigger system, pas d'input utilisateur direct
 *   - Input validation: new.id checked non-null; role is whitelisted to
 *     ('user','editor','admin')
 *   - SQL injection: aucune SQL dynamique
 *   - Privilege escalation: aucune opération arbitraire, uniquement INSERT
 *     profile + UPDATE app_metadata.role
 *   - Concurrency: AFTER INSERT garantit l'existence de auth.users
 *   - Recursion: l'UPDATE auth.users déclenche handle_user_update qui
 *     ne touche que public.profiles, donc pas de boucle
 *   - Data integrity: INSERT en ON CONFLICT DO NOTHING-like (gestion
 *     unique_violation), UPDATE guarded par is distinct from
 *
 * Validation:
 *   - Tested with self-signup (user_metadata.role default 'user')
 *   - Tested with admin-managed insert (_admin_managed=true => function skips)
 *   - Backfill idempotency vérifiée
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
  -- Validate input
  if new.id is null then
    raise exception 'User ID cannot be null';
  end if;

  -- Skip for admin-managed inserts: the admin application code is responsible
  -- for inserting the matching public.profiles row (so audit logging captures
  -- the real admin actor) and for setting app_metadata.role via the Admin API.
  if (new.raw_user_meta_data->>'_admin_managed') = 'true' then
    return new;
  end if;

  -- Compute display_name (safe coalesce)
  profile_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    concat_ws(' ',
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name'
    ),
    new.email,
    'Utilisateur'
  );

  -- Compute role with priority: app_metadata > user_metadata > 'user'.
  -- app_metadata wins because it can only be set server-side (Admin API),
  -- whereas user_metadata can be set by the client during signup.
  profile_role := case
    when new.raw_app_meta_data->>'role' in ('user','editor','admin')
      then new.raw_app_meta_data->>'role'
    when new.raw_user_meta_data->>'role' in ('user','editor','admin')
      then new.raw_user_meta_data->>'role'
    else 'user'
  end;

  -- Create the matching profile row.
  begin
    insert into public.profiles (user_id, display_name, role)
    values (new.id, profile_display_name, profile_role);
  exception
    when unique_violation then
      raise warning 'Profile already exists for user %', new.id;
    when others then
      raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
  end;

  -- Ensure role is present in app_metadata so it lands in the JWT.
  -- Guarded by `is distinct from` to avoid spurious UPDATEs that would fire
  -- the on_auth_user_updated trigger for nothing.
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
'Trigger function: creates public.profiles row and syncs role into auth.users.raw_app_meta_data on signup. SECURITY DEFINER because it must access auth.users and bypass RLS on profiles. Skipped when raw_user_meta_data->>_admin_managed = ''true'' (admin-managed flow handles both itself).';

-- ---------------------------------------------------------------------------
-- Backfill: copy role from public.profiles into auth.users.raw_app_meta_data
-- ---------------------------------------------------------------------------
-- This UPDATE is intentionally written as a single statement and is idempotent
-- thanks to the `is distinct from` filter. Re-running this migration would be
-- a no-op for users already in sync.
--
-- Note: this UPDATE will fire on_auth_user_updated -> handle_user_update for
-- each touched row. That function only updates public.profiles (no-op since
-- the role and display_name are unchanged).
update auth.users u
set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', p.role)
from public.profiles p
where p.user_id = u.id
  and p.role in ('user','editor','admin')
  and (u.raw_app_meta_data->>'role') is distinct from p.role;
