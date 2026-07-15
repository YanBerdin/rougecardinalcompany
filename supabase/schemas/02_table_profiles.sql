-- Table profiles - Profils utilisateurs
-- Ordre: 02 - Table de base sans dépendances

drop table if exists public.profiles cascade;
create table public.profiles (
  id bigint generated always as identity primary key,
  user_id uuid null,
  display_name text,
  slug text,
  bio text,
  avatar_media_id bigint null,
  role text default 'user',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint profiles_userid_unique unique (user_id)
);

comment on table public.profiles is 'user profiles linked to auth.users; contains display info and role metadata';
comment on column public.profiles.user_id is 'references auth.users.id managed by Supabase';

-- Grants (declarative record — GRANT statements are not captured by `supabase db diff`,
-- see .github/instructions/Declarative_Database_Schema.instructions.md "Known caveats").
-- SELECT/INSERT/UPDATE were restored by 20251027020000_restore_basic_grants_for_rls.sql.
-- DELETE was missing until 20260715130000_grant_delete_profiles_to_authenticated.sql,
-- causing "permission denied for table profiles" despite a valid RLS DELETE policy.
grant select, insert, update, delete on table public.profiles to authenticated;
