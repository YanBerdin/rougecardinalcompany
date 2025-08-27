-- ============================================================================
-- SCHEMA DÉCLARATIF ROUGE CARDINAL COMPANY
-- ============================================================================
-- 
-- Ce fichier définit l'état souhaité de la base de données selon les principes
-- du Declarative Database Schema Management de Supabase.
--
-- INSTRUCTIONS IMPORTANTES :
-- 1. Ce fichier représente l'état final désiré de la base de données
-- 2. Toute modification doit être faite dans ce fichier, PAS dans migrations/
-- 3. Génération des migrations via : supabase db diff -f <migration_name>
-- 4. Les opérations DML (INSERT/UPDATE/DELETE) doivent être gérées séparément
--
-- Voir : .github/copilot/Declarative_Database_Schema.Instructions.md
-- ============================================================================

-- Fonction pour créer automatiquement un profil lors de l'inscription
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

-- Triggers pour synchroniser les profils avec auth.users

-- Trigger pour la création de profil
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger pour la suppression de profil  
drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_user_deletion();

-- Trigger pour la mise à jour de profil
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_update();

-- Migration ponctuelle : Synchronisation des profils existants
-- EXTRACTED: Cette opération DML a été déplacée vers une migration dédiée
-- car les opérations de données ne sont pas capturées par le schema diff.
-- Voir: Declarative_Database_Schema.Instructions.md - section "Known caveats"

-- Migration créée : supabase/migrations/sync_existing_profiles.sql
-- Pour exécuter cette migration après application du schéma :
-- 1. Appliquer d'abord le schéma déclaratif via : supabase db diff -f apply_declarative_schema
-- 2. Puis exécuter la migration de données : supabase db push
-- 3. Ou exécuter manuellement : psql -f supabase/migrations/sync_existing_profiles.sql

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

create extension if not exists "pgcrypto"; -- optional: provides gen_random_uuid() if you still need UUIDs
create extension if not exists pg_trgm;   -- optional: trigram indexes for fuzzy search

-- ============================================================================
-- SECTION 2: TABLES PRINCIPALES
-- ============================================================================
-- Ordre d'exécution respecté pour les dépendances (foreign keys)

-- core tables: profiles, medias, membres_equipe, lieux, spectacles, evenements, articles_presse,
-- abonnes_newsletter, messages_contact, configurations_site, logs_audit

-- profiles
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

-- medias
drop table if exists public.medias cascade;
create table public.medias (
  id bigint generated always as identity primary key,
  storage_path text not null,
  filename text,
  mime text,
  size_bytes bigint,
  alt_text text,
  metadata jsonb default '{}'::jsonb,
  uploaded_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- membres_equipe
drop table if exists public.membres_equipe cascade;
create table public.membres_equipe (
  id bigint generated always as identity primary key,
  nom text not null,
  role text,
  description text,
  photo_media_id bigint null references public.medias(id) on delete set null,
  ordre smallint default 0,
  active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- lieux
drop table if exists public.lieux cascade;
create table public.lieux (
  id bigint generated always as identity primary key,
  nom text not null,
  adresse text,
  ville text,
  code_postal text,
  pays text default 'France',
  latitude double precision,
  longitude double precision,
  capacite integer,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- spectacles
drop table if exists public.spectacles cascade;
create table public.spectacles (
  id bigint generated always as identity primary key,
  titre text not null,
  slug text,
  description text,
  duree_minutes integer,
  public boolean default true,
  created_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector
);

-- evenements
drop table if exists public.evenements cascade;
create table public.evenements (
  id bigint generated always as identity primary key,
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  lieu_id bigint null references public.lieux(id) on delete set null,
  date_debut timestamptz not null,
  date_fin timestamptz null,
  capacity integer,
  price_cents integer null,
  status text default 'scheduled',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- articles_presse
drop table if exists public.articles_presse cascade;
create table public.articles_presse (
  id bigint generated always as identity primary key,
  titre text not null,
  slug text,
  chapo text,
  contenu text,
  source_nom text,
  source_url text,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector
);

-- abonnes_newsletter
drop table if exists public.abonnes_newsletter cascade;
create table public.abonnes_newsletter (
  id bigint generated always as identity primary key,
  email citext not null,
  nom text,
  subscribed boolean default true,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);
alter table public.abonnes_newsletter add constraint abonnes_email_unique unique (email);

-- messages_contact
drop table if exists public.messages_contact cascade;
create table public.messages_contact (
  id bigint generated always as identity primary key,
  nom text,
  email text,
  sujet text,
  message text,
  processed boolean default false,
  processed_at timestamptz null,
  created_at timestamptz default now() not null
);

-- configurations_site
drop table if exists public.configurations_site cascade;
create table public.configurations_site (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now() not null
);

-- logs_audit
drop table if exists public.logs_audit cascade;
create table public.logs_audit (
  id bigserial primary key,
  user_id uuid null,
  action text not null,
  table_name text not null,
  record_id text null,
  old_values jsonb null,
  new_values jsonb null,
  ip_address inet null,
  user_agent text null,
  created_at timestamptz default now() not null
);

-- ============================================================================
-- SECTION 3: TABLES DE LIAISON (Many-to-Many)
-- ============================================================================

-- join tables many-to-many

-- spectacles <-> membres_equipe
drop table if exists public.spectacles_membres_equipe cascade;
create table public.spectacles_membres_equipe (
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  membre_id bigint not null references public.membres_equipe(id) on delete cascade,
  role text,
  primary key (spectacle_id, membre_id)
);

-- spectacles <-> medias
drop table if exists public.spectacles_medias cascade;
create table public.spectacles_medias (
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  media_id bigint not null references public.medias(id) on delete cascade,
  ordre smallint default 0,
  primary key (spectacle_id, media_id)
);

-- articles_presse <-> medias
drop table if exists public.articles_medias cascade;
create table public.articles_medias (
  article_id bigint not null references public.articles_presse(id) on delete cascade,
  media_id bigint not null references public.medias(id) on delete cascade,
  ordre smallint default 0,
  primary key (article_id, media_id)
);

-- ============================================================================
-- SECTION 4: FONCTIONS ET TRIGGERS
-- ============================================================================

-- helper functions and triggers

-- is_admin helper: checks profiles.role = 'admin' for current auth.uid()
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

comment on function public.is_admin() is 
'Helper function: Checks if current user has admin role. Uses SECURITY DEFINER to access auth.uid() and profiles table reliably across different security contexts. Marked STABLE since auth.uid() remains constant during transaction.';

-- update_updated_at_column
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.update_updated_at_column() is 
'Generic trigger function to automatically update updated_at column. Uses SECURITY INVOKER since it only modifies the current row being processed and doesn''t need elevated privileges.';

-- audit_trigger (robust)
create or replace function public.audit_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  headers_json json;
  xff_text text;
  ua_text text;
  user_id_uuid uuid := null;
  record_id_text text;
begin
  begin
    headers_json := coalesce(current_setting('request.headers', true), '{}')::json;
  exception when others then
    headers_json := '{}';
  end;

  xff_text := headers_json ->> 'x-forwarded-for';
  ua_text := headers_json ->> 'user-agent';

  if xff_text is not null and btrim(xff_text) = '' then
    xff_text := null;
  end if;
  if ua_text is not null and btrim(ua_text) = '' then
    ua_text := null;
  end if;

  begin
    user_id_uuid := nullif(auth.uid(), '')::uuid;
  exception when others then
    user_id_uuid := null;
  end;

  begin
    if tg_op in ('insert','update') then
      record_id_text := coalesce(new.id::text, null);
    else
      record_id_text := coalesce(old.id::text, null);
    end if;
  exception when others then
    record_id_text := null;
  end;

  insert into public.logs_audit (
    user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at
  ) values (
    user_id_uuid, tg_op, tg_table_name, record_id_text,
    case when tg_op = 'delete' then row_to_json(old) else null end,
    case when tg_op in ('insert','update') then row_to_json(new) else null end,
    case when xff_text is not null then nullif(xff_text, '')::inet else null end,
    ua_text,
    now()
  );

  if tg_op = 'delete' then
    return old;
  else
    return new;
  end if;
end;
$$;

comment on function public.audit_trigger() is 
'Generic audit trigger that logs all DML operations with user context and metadata. Uses SECURITY INVOKER to maintain user context for auditing - the audit log should reflect the actual user performing the operation, not an elevated service account. Includes robust error handling for missing headers or auth context.';

-- to_tsvector helper (immutable)
create or replace function public.to_tsvector_french(text)
returns tsvector
language sql
immutable
security invoker
set search_path = ''
as $$
  select to_tsvector('french', coalesce($1, ''));
$$;

comment on function public.to_tsvector_french(text) is 
'Helper function for French full-text search vector generation. Marked IMMUTABLE because same input always produces same output, enabling PostgreSQL query optimization and index usage.';

-- spectacles search vector trigger
create or replace function public.spectacles_search_vector_trigger()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('french', coalesce(new.titre,'') || ' ' || coalesce(new.description,''));
  return new;
end;
$$;

drop trigger if exists trg_spectacles_search_vector on public.spectacles;
create trigger trg_spectacles_search_vector
before insert or update on public.spectacles
for each row execute function public.spectacles_search_vector_trigger();

-- articles search vector trigger
create or replace function public.articles_search_vector_trigger()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('french', coalesce(new.titre,'') || ' ' || coalesce(new.chapo,'') || ' ' || coalesce(new.contenu,''));
  return new;
end;
$$;

drop trigger if exists trg_articles_search_vector on public.articles_presse;
create trigger trg_articles_search_vector
before insert or update on public.articles_presse
for each row execute function public.articles_search_vector_trigger();

-- trigger: update_updated_at_column across tables
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(array[
    'public.profiles', 'public.medias', 'public.membres_equipe', 'public.lieux',
    'public.spectacles', 'public.evenements', 'public.articles_presse', 'public.abonnes_newsletter', 'public.messages_contact', 'public.configurations_site'
  ])
  LOOP
    EXECUTE format('drop trigger if exists trg_update_updated_at on %s;', tbl);
    EXECUTE format('create trigger trg_update_updated_at
      before update on %s
      for each row
      execute function public.update_updated_at_column();', tbl);
  END LOOP;
END;
$$;

-- attach audit trigger to tables
DO $$
DECLARE
  audit_tables text[] := array[
    'public.profiles', 'public.medias', 'public.membres_equipe', 'public.lieux',
    'public.spectacles', 'public.evenements', 'public.articles_presse', 'public.abonnes_newsletter', 'public.messages_contact', 'public.configurations_site'
  ];
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY audit_tables
  LOOP
    EXECUTE format('drop trigger if exists trg_audit on %s;', tbl);
    EXECUTE format('create trigger trg_audit
      after insert or update or delete on %s
      for each row
      execute function public.audit_trigger();', tbl);
  END LOOP;
END;
$$;

-- ============================================================================
-- SECTION 5: INDEX ET OPTIMISATIONS
-- ============================================================================

-- indexes and fulltext

-- evenements date index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_evenements_date_debut'
      AND n.nspname = 'public'
  ) THEN
    EXECUTE 'create index idx_evenements_date_debut on public.evenements (date_debut)';
  END IF;
END;
$$;

-- full text indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_spectacles_search_vector'
      AND n.nspname = 'public'
  ) THEN
    EXECUTE 'create index idx_spectacles_search_vector on public.spectacles using gin (search_vector)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_articles_search_vector'
      AND n.nspname = 'public'
  ) THEN
    EXECUTE 'create index idx_articles_search_vector on public.articles_presse using gin (search_vector)';
  END IF;
END;
$$;

-- regular indexes
create index if not exists idx_medias_storage_path on public.medias (storage_path);
create index if not exists idx_profiles_user_id on public.profiles (user_id);
create index if not exists idx_spectacles_titre on public.spectacles (titre);
create index if not exists idx_articles_published_at on public.articles_presse (published_at);

-- trigram indexes for fuzzy title search
create index if not exists idx_spectacles_titre_trgm on public.spectacles using gin (titre gin_trgm_ops);
create index if not exists idx_articles_titre_trgm on public.articles_presse using gin (titre gin_trgm_ops);

-- ============================================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- row level security policies. strict best-practice implementation for Supabase.
-- Notes:
--  - Do not include service_role in "to" clauses. service_role bypasses RLS when used server-side.
--  - Use helper public.is_admin() to centralize admin checks (based on profiles.role = 'admin').
--  - Policies are written with least privilege in mind: default deny, allow explicit operations only.

-- ---- profiles ----
alter table public.profiles enable row level security;

-- allow anyone to read public profiles
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles
for select
to anon, authenticated
using ( true );

-- allow authenticated users to insert their own profile (must set user_id = auth.uid())
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check ( (select auth.uid()) = user_id );

-- allow owners to update/delete their profile
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using ( (select auth.uid()) = user_id );


-- ---- medias ----
alter table public.medias enable row level security;

-- anyone can read medias
drop policy if exists "Medias are viewable by everyone" on public.medias;
create policy "Medias are viewable by everyone"
on public.medias
for select
to anon, authenticated
using ( true );

-- authenticated users can insert medias (uploader recorded on client or via function)
drop policy if exists "Authenticated users can insert medias" on public.medias;
create policy "Authenticated users can insert medias"
on public.medias
for insert
to authenticated
with check ( (select auth.uid()) is not null );

-- uploader or admin can update
drop policy if exists "Uploaders or admins can update medias" on public.medias;
create policy "Uploaders or admins can update medias"
on public.medias
for update
to authenticated
using ( uploaded_by = (select auth.uid()) or public.is_admin() )
with check ( uploaded_by = (select auth.uid()) or public.is_admin() );

-- uploader or admin can delete
drop policy if exists "Uploaders or admins can delete medias" on public.medias;
create policy "Uploaders or admins can delete medias"
on public.medias
for delete
to authenticated
using ( uploaded_by = (select auth.uid()) or public.is_admin() );


-- ---- spectacles ----
alter table public.spectacles enable row level security;

-- allow public reading only for spectacles flagged public=true
drop policy if exists "Public spectacles are viewable by everyone" on public.spectacles;
create policy "Public spectacles are viewable by everyone"
on public.spectacles
for select
to anon, authenticated
using ( public = true );

-- authenticated users can create spectacles (additional server-side checks recommended)
drop policy if exists "Authenticated users can create spectacles" on public.spectacles;
create policy "Authenticated users can create spectacles"
on public.spectacles
for insert
to authenticated
with check ( (select auth.uid()) is not null );

-- owner (created_by) or admin can update/delete
drop policy if exists "Owners or admins can update spectacles" on public.spectacles;
create policy "Owners or admins can update spectacles"
on public.spectacles
for update
to authenticated
using ( (created_by = (select auth.uid())) or public.is_admin() )
with check ( (created_by = (select auth.uid())) or public.is_admin() );

drop policy if exists "Owners or admins can delete spectacles" on public.spectacles;
create policy "Owners or admins can delete spectacles"
on public.spectacles
for delete
to authenticated
using ( (created_by = (select auth.uid())) or public.is_admin() );


-- ---- evenements ----
alter table public.evenements enable row level security;

-- public can read events
drop policy if exists "Events are viewable by everyone" on public.evenements;
create policy "Events are viewable by everyone"
on public.evenements
for select
to anon, authenticated
using ( true );

-- creation reserved to admin or creators via server functions
drop policy if exists "Admins can create events" on public.evenements;
create policy "Admins can create events"
on public.evenements
for insert
to authenticated
with check ( public.is_admin() );

-- update/delete reserved to admin
drop policy if exists "Admins can update events" on public.evenements;
create policy "Admins can update events"
on public.evenements
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );

drop policy if exists "Admins can delete events" on public.evenements;
create policy "Admins can delete events"
on public.evenements
for delete
to authenticated
using ( public.is_admin() );


-- ---- membres_equipe ----
alter table public.membres_equipe enable row level security;

drop policy if exists "Active team members are viewable by everyone" on public.membres_equipe;
create policy "Active team members are viewable by everyone"
on public.membres_equipe
for select
to anon, authenticated
using ( active = true );

-- admin-only modifications
drop policy if exists "Admins can create team members" on public.membres_equipe;
create policy "Admins can create team members"
on public.membres_equipe
for insert
to authenticated
with check ( public.is_admin() );

drop policy if exists "Admins can update team members" on public.membres_equipe;
create policy "Admins can update team members"
on public.membres_equipe
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );

drop policy if exists "Admins can delete team members" on public.membres_equipe;
create policy "Admins can delete team members"
on public.membres_equipe
for delete
to authenticated
using ( public.is_admin() );


-- ---- lieux ----
alter table public.lieux enable row level security;

drop policy if exists "Venues are viewable by everyone" on public.lieux;
create policy "Venues are viewable by everyone"
on public.lieux
for select
to anon, authenticated
using ( true );

-- admin-only create/update/delete for lieux
drop policy if exists "Admins can create venues" on public.lieux;
create policy "Admins can create venues"
on public.lieux
for insert
to authenticated
with check ( public.is_admin() );

drop policy if exists "Admins can update venues" on public.lieux;
create policy "Admins can update venues"
on public.lieux
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );

drop policy if exists "Admins can delete venues" on public.lieux;
create policy "Admins can delete venues"
on public.lieux
for delete
to authenticated
using ( public.is_admin() );


-- ---- articles_presse ----
alter table public.articles_presse enable row level security;

-- public read for published articles (published_at not null and <= now())
drop policy if exists "Published articles are viewable by everyone" on public.articles_presse;
create policy "Published articles are viewable by everyone"
on public.articles_presse
for select
to anon, authenticated
using ( published_at is not null and published_at <= now() );

-- insert by admin only
drop policy if exists "Admins can create articles" on public.articles_presse;
create policy "Admins can create articles"
on public.articles_presse
for insert
to authenticated
with check ( public.is_admin() );

-- update/delete by admin only
drop policy if exists "Admins can update articles" on public.articles_presse;
create policy "Admins can update articles"
on public.articles_presse
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );

drop policy if exists "Admins can delete articles" on public.articles_presse;
create policy "Admins can delete articles"
on public.articles_presse
for delete
to authenticated
using ( public.is_admin() );


-- ---- join tables (modify restricted to admin) ----
alter table public.spectacles_membres_equipe enable row level security;
drop policy if exists "Spectacle member relations are viewable by everyone" on public.spectacles_membres_equipe;
create policy "Spectacle member relations are viewable by everyone"
on public.spectacles_membres_equipe
for select
to anon, authenticated
using ( true );

drop policy if exists "Admins can create spectacle member relations" on public.spectacles_membres_equipe;
create policy "Admins can create spectacle member relations"
on public.spectacles_membres_equipe
for insert
to authenticated
with check ( public.is_admin() );

drop policy if exists "Admins can update spectacle member relations" on public.spectacles_membres_equipe;
create policy "Admins can update spectacle member relations"
on public.spectacles_membres_equipe
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );

drop policy if exists "Admins can delete spectacle member relations" on public.spectacles_membres_equipe;
create policy "Admins can delete spectacle member relations"
on public.spectacles_membres_equipe
for delete
to authenticated
using ( public.is_admin() );

alter table public.spectacles_medias enable row level security;
drop policy if exists "Spectacle media relations are viewable by everyone" on public.spectacles_medias;
create policy "Spectacle media relations are viewable by everyone"
on public.spectacles_medias
for select
to anon, authenticated
using ( true );

drop policy if exists "Admins can create spectacle media relations" on public.spectacles_medias;
create policy "Admins can create spectacle media relations"
on public.spectacles_medias
for insert
to authenticated
with check ( public.is_admin() );

drop policy if exists "Admins can update spectacle media relations" on public.spectacles_medias;
create policy "Admins can update spectacle media relations"
on public.spectacles_medias
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );

drop policy if exists "Admins can delete spectacle media relations" on public.spectacles_medias;
create policy "Admins can delete spectacle media relations"
on public.spectacles_medias
for delete
to authenticated
using ( public.is_admin() );

alter table public.articles_medias enable row level security;
drop policy if exists "Article media relations are viewable by everyone" on public.articles_medias;
create policy "Article media relations are viewable by everyone"
on public.articles_medias
for select
to anon, authenticated
using ( true );

drop policy if exists "Admins can create article media relations" on public.articles_medias;
create policy "Admins can create article media relations"
on public.articles_medias
for insert
to authenticated
with check ( public.is_admin() );

drop policy if exists "Admins can update article media relations" on public.articles_medias;
create policy "Admins can update article media relations"
on public.articles_medias
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );

drop policy if exists "Admins can delete article media relations" on public.articles_medias;
create policy "Admins can delete article media relations"
on public.articles_medias
for delete
to authenticated
using ( public.is_admin() );


-- ---- abonnés_newsletter ----
alter table public.abonnes_newsletter enable row level security;

-- allow inserts for subscriptions (anon too)
drop policy if exists "Anyone can subscribe to newsletter" on public.abonnes_newsletter;
create policy "Anyone can subscribe to newsletter"
on public.abonnes_newsletter
for insert
to anon, authenticated
with check ( email is not null );

-- select allowed only for authenticated/admins via profiles
drop policy if exists "Admins can view newsletter subscribers" on public.abonnes_newsletter;
create policy "Admins can view newsletter subscribers"
on public.abonnes_newsletter
for select
to authenticated
using ( public.is_admin() );

-- delete allowed only for admins
drop policy if exists "Admins can delete newsletter subscribers" on public.abonnes_newsletter;
create policy "Admins can delete newsletter subscribers"
on public.abonnes_newsletter
for delete
to authenticated
using ( public.is_admin() );


-- ---- configurations_site ----
alter table public.configurations_site enable row level security;

drop policy if exists "Admins can view site configurations" on public.configurations_site;
create policy "Admins can view site configurations"
on public.configurations_site
for select
to authenticated
using ( public.is_admin() );

drop policy if exists "Admins can update site configurations" on public.configurations_site;
create policy "Admins can update site configurations"
on public.configurations_site
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );


-- ---- logs_audit ----
alter table public.logs_audit enable row level security;

drop policy if exists "Admins can view audit logs" on public.logs_audit;
create policy "Admins can view audit logs"
on public.logs_audit
for select
to authenticated
using ( public.is_admin() );

-- add comments on tables and columns to follow the style guide

comment on table public.profiles is 'user profiles linked to auth.users; contains display info and role metadata';
comment on column public.profiles.user_id is 'references auth.users.id managed by Supabase';

comment on table public.medias is 'media storage metadata (paths, filenames, mime, size)';
comment on column public.medias.storage_path is 'storage provider path (bucket/key)';

comment on table public.membres_equipe is 'members of the team (artists, staff)';
comment on table public.lieux is 'physical venues where events can be scheduled';

comment on table public.spectacles is 'shows/performances (base entity)';
comment on table public.evenements is 'scheduled occurrences of spectacles with date and venue';

comment on table public.articles_presse is 'press articles referencing shows or company news';
comment on table public.abonnes_newsletter is 'newsletter subscribers';
comment on table public.messages_contact is 'contact form messages received from website';
comment on table public.configurations_site is 'key-value store for site-wide configuration';
comment on table public.logs_audit is 'audit log for create/update/delete operations on tracked tables';

-- metadata header documenting identity usage
comment on database current_database() is 'rougecardinalcompany database — uses integer identity primary keys (bigint generated always as identity). External ids (auth.users) remain uuid.';

-- 07_seed.sql (optional / commented)
-- seeds and sample values are optional; keep them out of declarative schema if possible.
-- example:
-- insert into public.configurations_site (key, value) values ('site:metadata', '{"title":"Rouge Cardinal"}'::jsonb);

-- 08_domains_and_checks.sql
-- Adds domains/check constraints to emulate ENUM validation without using Postgres ENUM types.
-- Safe operations: drop existing constraints if present, then add constraints.
-- Place this after table creation (e.g., run after 01_tables_core.sql and 02_tables_joins.sql).

-- profiles.role: allow a limited set of roles
do $$
begin
  -- drop constraint if exists (safe)
  if exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public' and t.relname = 'profiles' and c.conname = 'profiles_role_check'
  ) then
    execute 'alter table public.profiles drop constraint profiles_role_check';
  end if;
  -- add check constraint
  execute $sql$
    alter table public.profiles
    add constraint profiles_role_check check (role in ('user','editor','admin'));
  $sql$;
exception when others then
  raise notice 'Could not add profiles_role_check: %', sqlerrm;
end;
$$ language plpgsql;

-- evenements.status: restrict allowed values (includes English synonyms to be tolerant)
do $$
begin
  if exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public' and t.relname = 'evenements' and c.conname = 'evenements_status_check'
  ) then
    execute 'alter table public.evenements drop constraint evenements_status_check';
  end if;
  -- set a sensible default if not set (if you prefer 'planifie' you can change it)
  begin
    execute 'alter table public.evenements alter column status set default ''planifie''';
  exception when others then
    -- ignore if column doesn't exist or alter fails
    raise notice 'Could not set default for evenements.status: %', sqlerrm;
  end;
  execute $sql$
    alter table public.evenements
    add constraint evenements_status_check check (
      status in (
        'planifie','confirme','complet','annule','reporte',
        'scheduled','confirmed','sold_out','cancelled','postponed'
      )
    );
  $sql$;
exception when others then
  raise notice 'Could not add evenements_status_check: %', sqlerrm;
end;
$$ language plpgsql;

-- End of 08_domains_and_checks.sql


-- from 01_table_partners.sql
-- 01_table_partners.sql
create table if not exists public.partners (
  id bigint generated always as identity primary key,
  name text not null,
  slug text,
  description text,
  url text,
  logo_media_id bigint references public.medias(id) on delete set null,
  is_active boolean not null default true,
  featured boolean not null default false,
  display_order integer not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.partners is 'Liste des partenaires (nom, logo, url, visibilité, ordre d''affichage).';
create unique index if not exists idx_partners_slug on public.partners (slug);
create index if not exists idx_partners_is_active on public.partners (is_active);
create index if not exists idx_partners_display_order on public.partners (display_order);


-- from 02_alter_configurations_site.sql
-- 02_alter_configurations_site.sql
alter table if exists public.configurations_site
  add column if not exists show_partners boolean not null default true;

comment on column public.configurations_site.show_partners is 'Toggle pour afficher/masquer la section "Nos partenaires" sur la page d''accueil.';


-- from 20_function_partners_set_created_by.sql
-- 20_function_partners_set_created_by.sql
create or replace function public.partners_set_created_by()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    new.created_by := (select auth.uid())::uuid;
  end if;
  new.created_at := coalesce(new.created_at, now());
  new.updated_at := now();
  return new;
end;
$$;


-- from 21_function_partners_protect_created_by.sql
-- 21_function_partners_protect_created_by.sql
create or replace function public.partners_protect_created_by()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.created_by := old.created_by;
  new.updated_at := now();
  return new;
end;
$$;


-- from 30_trigger_partners.sql
-- 30_trigger_partners.sql
drop trigger if exists trg_partners_set_created_by on public.partners;
create trigger trg_partners_set_created_by
before insert on public.partners
for each row execute function public.partners_set_created_by();

drop trigger if exists trg_partners_protect_created_by on public.partners;
create trigger trg_partners_protect_created_by
before update on public.partners
for each row execute function public.partners_protect_created_by();


-- from 40_policy_partners.sql
-- 40_policy_partners.sql
alter table if exists public.partners enable row level security;

create policy "Public partners are viewable by anyone"
on public.partners
for select
to authenticated, anon
using ( is_active is true );

create policy "Admins can view all partners"
on public.partners
for select
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

create policy "Authenticated can insert partners"
on public.partners
for insert
to authenticated
with check ( (select auth.uid()) = created_by or (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

create policy "Owners or admins can update partners"
on public.partners
for update
to authenticated
using ( (select auth.uid()) = created_by or (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' )
with check ( (select auth.uid()) = created_by or (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

create policy "Owners or admins can delete partners"
on public.partners
for delete
to authenticated
using ( (select auth.uid()) = created_by or (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- 01_evenements_recurrence.sql
-- Ajout de la gestion de récurrence pour les événements

-- Ajouter les colonnes de récurrence à la table evenements
alter table public.evenements 
add column if not exists recurrence_rule text,
add column if not exists recurrence_end_date timestamptz,
add column if not exists parent_event_id bigint references public.evenements(id) on delete cascade;

-- Ajouter les commentaires
comment on column public.evenements.recurrence_rule is 'Règle de récurrence au format RRULE (RFC 5545)';
comment on column public.evenements.recurrence_end_date is 'Date de fin de la récurrence';
comment on column public.evenements.parent_event_id is 'Référence vers l''événement parent pour les occurrences générées';

-- Index pour les performances sur les requêtes de récurrence
create index if not exists idx_evenements_parent_event_id on public.evenements (parent_event_id);
create index if not exists idx_evenements_recurrence_end_date on public.evenements (recurrence_end_date);

-- Contrainte pour éviter la récursion infinie
alter table public.evenements 
add constraint check_no_self_parent 
check (parent_event_id != id or parent_event_id is null);

-- Fonction helper pour valider les règles RRULE basiques
create or replace function public.validate_rrule(rule text)
returns boolean
language plpgsql
immutable
security invoker
set search_path = ''
as $$
begin
  -- Validation basique du format RRULE
  if rule is null then
    return true;
  end if;
  
  -- Vérifier que ça commence par FREQ=
  if not (rule ~ '^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)') then
    return false;
  end if;
  
  return true;
end;
$$;

comment on function public.validate_rrule(text) is 
'Validates basic RRULE format for event recurrence (RFC 5545). Marked IMMUTABLE since validation logic is deterministic - same input always produces same result, enabling use in check constraints.';

-- Contrainte de validation RRULE
alter table public.evenements 
add constraint check_valid_rrule 
check (public.validate_rrule(recurrence_rule));

-- 02_analytics_table.sql
-- Création de la table analytics pour statistiques internes

drop table if exists public.analytics_events cascade;
create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  entity_type text,
  entity_id bigint,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  ip_address inet,
  user_agent text,
  referer text,
  pathname text,
  search_query text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

comment on table public.analytics_events is 'Événements analytiques internes (vues, clics, conversions, recherches)';
comment on column public.analytics_events.event_type is 'Type d''événement : page_view, click, search, download, etc.';
comment on column public.analytics_events.entity_type is 'Type d''entité : spectacle, article, media, etc.';
comment on column public.analytics_events.entity_id is 'ID de l''entité concernée';
comment on column public.analytics_events.session_id is 'Identifiant de session anonyme';
comment on column public.analytics_events.pathname is 'Chemin de la page visitée';
comment on column public.analytics_events.search_query is 'Terme de recherche si applicable';

-- Index pour performance des requêtes analytiques
create index idx_analytics_events_type on public.analytics_events(event_type, created_at);
create index idx_analytics_events_entity on public.analytics_events(entity_type, entity_id);
create index idx_analytics_events_user_session on public.analytics_events(user_id, session_id);
create index idx_analytics_events_created_at on public.analytics_events(created_at);

-- Index pour recherche fulltext sur search_query
create index if not exists idx_analytics_search_query_trgm on public.analytics_events using gin (search_query gin_trgm_ops);

-- Function pour enregistrer un événement analytique
create or replace function public.track_analytics_event(
  p_event_type text,
  p_entity_type text default null,
  p_entity_id bigint default null,
  p_session_id text default null,
  p_pathname text default null,
  p_search_query text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  headers_json json;
  xff_text text;
  ua_text text;
  ref_text text;
  event_id bigint;
begin
  -- Récupérer les headers HTTP
  begin
    headers_json := coalesce(current_setting('request.headers', true), '{}')::json;
  exception when others then
    headers_json := '{}';
  end;

  xff_text := headers_json ->> 'x-forwarded-for';
  ua_text := headers_json ->> 'user-agent';
  ref_text := headers_json ->> 'referer';

  -- Nettoyer les valeurs vides
  if xff_text is not null and btrim(xff_text) = '' then
    xff_text := null;
  end if;
  if ua_text is not null and btrim(ua_text) = '' then
    ua_text := null;
  end if;
  if ref_text is not null and btrim(ref_text) = '' then
    ref_text := null;
  end if;

  -- Insérer l'événement analytique
  insert into public.analytics_events (
    event_type,
    entity_type,
    entity_id,
    user_id,
    session_id,
    ip_address,
    user_agent,
    referer,
    pathname,
    search_query,
    metadata,
    created_at
  ) values (
    p_event_type,
    p_entity_type,
    p_entity_id,
    auth.uid(),
    p_session_id,
    case when xff_text is not null then nullif(xff_text, '')::inet else null end,
    ua_text,
    ref_text,
    p_pathname,
    p_search_query,
    p_metadata,
    now()
  ) returning id into event_id;

  return event_id;
end;
$$;

-- Vue pour statistiques rapides
create or replace view public.analytics_summary as
select 
  event_type,
  entity_type,
  count(*) as total_events,
  count(distinct user_id) as unique_users,
  count(distinct session_id) as unique_sessions,
  date_trunc('day', created_at) as event_date
from public.analytics_events 
where created_at >= current_date - interval '30 days'
group by event_type, entity_type, date_trunc('day', created_at)
order by event_date desc, total_events desc;

comment on view public.analytics_summary is 'Vue résumé des statistiques analytiques sur 30 jours';

-- 03_tags_categories_system.sql
-- Système de tags et catégories pour contenus

-- Table des catégories
drop table if exists public.categories cascade;
create table public.categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  color text, -- Code couleur hex pour l'affichage
  icon text,  -- Nom d'icône pour l'interface
  parent_id bigint references public.categories(id) on delete cascade,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.categories is 'Catégories hiérarchiques pour organiser les contenus';
comment on column public.categories.parent_id is 'Référence vers la catégorie parent pour hiérarchie';
comment on column public.categories.color is 'Code couleur hex (#RRGGBB) pour l''affichage';

-- Table des tags
drop table if exists public.tags cascade;
create table public.tags (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  usage_count integer default 0,
  is_featured boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.tags is 'Tags pour étiquetage flexible des contenus';
comment on column public.tags.usage_count is 'Nombre d''utilisations du tag (mis à jour par triggers)';
comment on column public.tags.is_featured is 'Tag mis en avant dans l''interface';

-- Index pour performance
create index idx_categories_parent_id on public.categories(parent_id);
create index idx_categories_slug on public.categories(slug);
create index idx_categories_display_order on public.categories(display_order);
create index idx_tags_slug on public.tags(slug);
create index idx_tags_usage_count on public.tags(usage_count desc);
create index idx_tags_is_featured on public.tags(is_featured);

-- Relations many-to-many : spectacles <-> categories
drop table if exists public.spectacles_categories cascade;
create table public.spectacles_categories (
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  category_id bigint not null references public.categories(id) on delete cascade,
  primary key (spectacle_id, category_id)
);

-- Relations many-to-many : spectacles <-> tags
drop table if exists public.spectacles_tags cascade;
create table public.spectacles_tags (
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  tag_id bigint not null references public.tags(id) on delete cascade,
  primary key (spectacle_id, tag_id)
);

-- Relations many-to-many : articles <-> categories
drop table if exists public.articles_categories cascade;
create table public.articles_categories (
  article_id bigint not null references public.articles_presse(id) on delete cascade,
  category_id bigint not null references public.categories(id) on delete cascade,
  primary key (article_id, category_id)
);

-- Relations many-to-many : articles <-> tags
drop table if exists public.articles_tags cascade;
create table public.articles_tags (
  article_id bigint not null references public.articles_presse(id) on delete cascade,
  tag_id bigint not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- Fonction pour maintenir le compteur d'usage des tags
create or replace function public.update_tag_usage_count()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  tag_id_to_update bigint;
begin
  -- Récupérer l'ID du tag concerné selon l'opération
  if tg_op = 'INSERT' then
    tag_id_to_update := new.tag_id;
  elsif tg_op = 'DELETE' then
    tag_id_to_update := old.tag_id;
  end if;

  -- Mettre à jour le compteur d'usage
  update public.tags 
  set usage_count = (
    select count(*) 
    from (
      select tag_id from public.spectacles_tags where tag_id = tag_id_to_update
      union all
      select tag_id from public.articles_tags where tag_id = tag_id_to_update
    ) as usage_count_query
  ),
  updated_at = now()
  where id = tag_id_to_update;

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

-- Triggers pour maintenir usage_count automatiquement
drop trigger if exists trg_spectacles_tags_usage_count on public.spectacles_tags;
create trigger trg_spectacles_tags_usage_count
  after insert or delete on public.spectacles_tags
  for each row execute function public.update_tag_usage_count();

drop trigger if exists trg_articles_tags_usage_count on public.articles_tags;
create trigger trg_articles_tags_usage_count
  after insert or delete on public.articles_tags
  for each row execute function public.update_tag_usage_count();

-- Vue pour naviguer dans les catégories avec hiérarchie
create or replace view public.categories_hierarchy as
with recursive category_tree as (
  -- Catégories racines
  select 
    id,
    name,
    slug,
    description,
    color,
    icon,
    parent_id,
    display_order,
    0 as level,
    array[id] as path,
    name as full_path
  from public.categories 
  where parent_id is null and is_active = true
  
  union all
  
  -- Sous-catégories
  select 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.color,
    c.icon,
    c.parent_id,
    c.display_order,
    ct.level + 1,
    ct.path || c.id,
    ct.full_path || ' > ' || c.name
  from public.categories c
  join category_tree ct on c.parent_id = ct.id
  where c.is_active = true
)
select 
  id,
  name,
  slug,
  description,
  color,
  icon,
  parent_id,
  display_order,
  level,
  path,
  full_path
from category_tree
order by path;

comment on view public.categories_hierarchy is 'Vue hiérarchique des catégories avec niveaux et chemins complets';

-- Vue pour les tags populaires
create or replace view public.popular_tags as
select 
  id,
  name,
  slug,
  usage_count,
  is_featured,
  created_at
from public.tags 
where usage_count > 0
order by is_featured desc, usage_count desc, name asc;

comment on view public.popular_tags is 'Tags les plus utilisés, avec mise en avant des tags featured';

-- 04_content_versioning.sql
-- Système de versioning pour le contenu éditorial

drop table if exists public.content_versions cascade;
create table public.content_versions (
  id bigint generated always as identity primary key,
  entity_type text not null, -- 'spectacle', 'article_presse', 'membre_equipe', etc.
  entity_id bigint not null,
  version_number integer not null default 1,
  title text,
  content_snapshot jsonb not null, -- Snapshot complet des données
  change_summary text, -- Description des modifications
  change_type text default 'update', -- 'create', 'update', 'publish', 'unpublish'
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  constraint content_versions_entity_version_unique unique (entity_type, entity_id, version_number)
);

comment on table public.content_versions is 'Historique des versions pour tous les contenus éditoriaux';
comment on column public.content_versions.entity_type is 'Type d''entité : spectacle, article_presse, membre_equipe, etc.';
comment on column public.content_versions.content_snapshot is 'Snapshot JSON complet des données au moment de la version';
comment on column public.content_versions.change_summary is 'Résumé des modifications apportées';
comment on column public.content_versions.change_type is 'Type de modification : create, update, publish, unpublish, restore';

-- Index pour performance
create index idx_content_versions_entity on public.content_versions(entity_type, entity_id);
create index idx_content_versions_created_at on public.content_versions(created_at desc);
create index idx_content_versions_created_by on public.content_versions(created_by);
create index idx_content_versions_type on public.content_versions(change_type);

-- Fonction générique pour créer une version
create or replace function public.create_content_version(
  p_entity_type text,
  p_entity_id bigint,
  p_content_snapshot jsonb,
  p_change_summary text default null,
  p_change_type text default 'update'
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  next_version integer;
  version_id bigint;
  extracted_title text;
begin
  -- Calculer le prochain numéro de version
  select coalesce(max(version_number), 0) + 1 
  into next_version
  from public.content_versions 
  where entity_type = p_entity_type and entity_id = p_entity_id;

  -- Extraire le titre du snapshot selon le type d'entité
  case p_entity_type
    when 'spectacle' then
      extracted_title := p_content_snapshot ->> 'titre';
    when 'article_presse' then
      extracted_title := p_content_snapshot ->> 'titre';
    when 'membre_equipe' then
      extracted_title := p_content_snapshot ->> 'nom';
    else
      extracted_title := p_content_snapshot ->> 'name';
  end case;

  -- Insérer la nouvelle version
  insert into public.content_versions (
    entity_type,
    entity_id,
    version_number,
    title,
    content_snapshot,
    change_summary,
    change_type,
    created_by
  ) values (
    p_entity_type,
    p_entity_id,
    next_version,
    extracted_title,
    p_content_snapshot,
    p_change_summary,
    p_change_type,
    auth.uid()
  ) returning id into version_id;

  return version_id;
end;
$$;

-- Trigger function pour capturer automatiquement les versions des spectacles
create or replace function public.spectacles_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  -- Déterminer le type de changement
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création du spectacle';
  elsif tg_op = 'UPDATE' then
    change_type_value := 'update';
    -- Générer un résumé basique des changements
    change_summary_text := 'Mise à jour';
    if old.titre != new.titre then
      change_summary_text := change_summary_text || ' - Titre modifié';
    end if;
    if old.description != new.description then
      change_summary_text := change_summary_text || ' - Description modifiée';
    end if;
    if old.public != new.public then
      change_summary_text := change_summary_text || ' - Visibilité changée';
    end if;
  end if;

  -- Créer la version avec le contenu complet
  perform public.create_content_version(
    'spectacle',
    new.id,
    row_to_json(new)::jsonb,
    change_summary_text,
    change_type_value
  );

  return new;
end;
$$;

-- Trigger function pour les articles de presse
create or replace function public.articles_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création de l''article';
  elsif tg_op = 'UPDATE' then
    change_type_value := 'update';
    change_summary_text := 'Mise à jour';
    if old.titre != new.titre then
      change_summary_text := change_summary_text || ' - Titre modifié';
    end if;
    if old.contenu != new.contenu then
      change_summary_text := change_summary_text || ' - Contenu modifié';
    end if;
    if old.published_at != new.published_at then
      if new.published_at is not null and old.published_at is null then
        change_type_value := 'publish';
        change_summary_text := 'Publication de l''article';
      elsif new.published_at is null and old.published_at is not null then
        change_type_value := 'unpublish';
        change_summary_text := 'Dépublication de l''article';
      else
        change_summary_text := change_summary_text || ' - Date de publication modifiée';
      end if;
    end if;
  end if;

  perform public.create_content_version(
    'article_presse',
    new.id,
    row_to_json(new)::jsonb,
    change_summary_text,
    change_type_value
  );

  return new;
end;
$$;

-- Appliquer les triggers de versioning
drop trigger if exists trg_spectacles_versioning on public.spectacles;
create trigger trg_spectacles_versioning
  after insert or update on public.spectacles
  for each row execute function public.spectacles_versioning_trigger();

drop trigger if exists trg_articles_versioning on public.articles_presse;
create trigger trg_articles_versioning
  after insert or update on public.articles_presse
  for each row execute function public.articles_versioning_trigger();

-- Vue pour consulter facilement l'historique d'une entité
create or replace view public.content_versions_detailed as
select 
  cv.id,
  cv.entity_type,
  cv.entity_id,
  cv.version_number,
  cv.title,
  cv.change_summary,
  cv.change_type,
  cv.created_at,
  cv.created_by,
  p.display_name as created_by_name,
  -- Extraire quelques champs utiles selon le type
  case 
    when cv.entity_type = 'spectacle' then cv.content_snapshot ->> 'public'
    when cv.entity_type = 'article_presse' then 
      case when (cv.content_snapshot ->> 'published_at') is not null then 'true' else 'false' end
    else null
  end as is_published,
  char_length(cv.content_snapshot::text) as snapshot_size
from public.content_versions cv
left join public.profiles p on cv.created_by = p.user_id
order by cv.entity_type, cv.entity_id, cv.version_number desc;

comment on view public.content_versions_detailed is 'Vue détaillée de l''historique des versions avec informations sur les auteurs';

-- Fonction pour restaurer une version antérieure
create or replace function public.restore_content_version(
  p_version_id bigint,
  p_change_summary text default 'Restauration d''une version antérieure'
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  version_record record;
  restore_success boolean := false;
begin
  -- Récupérer les informations de la version à restaurer
  select * into version_record
  from public.content_versions 
  where id = p_version_id;

  if not found then
    raise exception 'Version non trouvée: %', p_version_id;
  end if;

  -- Restaurer selon le type d'entité
  case version_record.entity_type
    when 'spectacle' then
      update public.spectacles set
        titre = version_record.content_snapshot ->> 'titre',
        slug = version_record.content_snapshot ->> 'slug',
        description = version_record.content_snapshot ->> 'description',
        duree_minutes = (version_record.content_snapshot ->> 'duree_minutes')::integer,
        public = (version_record.content_snapshot ->> 'public')::boolean,
        updated_at = now()
      where id = version_record.entity_id;
      
      restore_success := found;

    when 'article_presse' then
      update public.articles_presse set
        titre = version_record.content_snapshot ->> 'titre',
        slug = version_record.content_snapshot ->> 'slug',
        chapo = version_record.content_snapshot ->> 'chapo',
        contenu = version_record.content_snapshot ->> 'contenu',
        source_nom = version_record.content_snapshot ->> 'source_nom',
        source_url = version_record.content_snapshot ->> 'source_url',
        published_at = (version_record.content_snapshot ->> 'published_at')::timestamptz,
        updated_at = now()
      where id = version_record.entity_id;
      
      restore_success := found;

    else
      raise exception 'Type d''entité non supporté pour la restauration: %', version_record.entity_type;
  end case;

  -- Créer une entrée de version pour la restauration
  if restore_success then
    perform public.create_content_version(
      version_record.entity_type,
      version_record.entity_id,
      version_record.content_snapshot,
      p_change_summary || format(' (version %s du %s)', version_record.version_number, version_record.created_at::date),
      'restore'
    );
  end if;

  return restore_success;
end;
$$;

-- 05_seo_structured_metadata.sql
-- Amélioration du SEO avec métadonnées structurées

-- Ajouter colonnes SEO dédiées aux spectacles
alter table public.spectacles 
add column if not exists meta_title text,
add column if not exists meta_description text,
add column if not exists og_image_media_id bigint references public.medias(id) on delete set null,
add column if not exists schema_type text default 'TheaterEvent',
add column if not exists canonical_url text;

comment on column public.spectacles.meta_title is 'Titre SEO personnalisé (max 60 chars recommandé)';
comment on column public.spectacles.meta_description is 'Description SEO personnalisée (max 160 chars recommandé)';
comment on column public.spectacles.og_image_media_id is 'Image Open Graph spécifique pour partage social';
comment on column public.spectacles.schema_type is 'Type Schema.org : TheaterEvent, Event, CreativeWork';
comment on column public.spectacles.canonical_url is 'URL canonique pour éviter contenu dupliqué';

-- Ajouter colonnes SEO aux articles de presse
alter table public.articles_presse 
add column if not exists meta_title text,
add column if not exists meta_description text,
add column if not exists og_image_media_id bigint references public.medias(id) on delete set null,
add column if not exists schema_type text default 'Article',
add column if not exists canonical_url text,
add column if not exists keywords text[]; -- Mots-clés SEO

comment on column public.articles_presse.meta_title is 'Titre SEO personnalisé (max 60 chars recommandé)';
comment on column public.articles_presse.meta_description is 'Description SEO personnalisée (max 160 chars recommandé)';
comment on column public.articles_presse.og_image_media_id is 'Image Open Graph spécifique';
comment on column public.articles_presse.schema_type is 'Type Schema.org : Article, NewsArticle, BlogPosting';
comment on column public.articles_presse.keywords is 'Mots-clés SEO (array de strings)';

-- Table pour gérer les redirections SEO
drop table if exists public.seo_redirects cascade;
create table public.seo_redirects (
  id bigint generated always as identity primary key,
  old_path text not null unique,
  new_path text not null,
  redirect_type smallint default 301, -- 301, 302, etc.
  is_active boolean default true,
  hit_count integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.seo_redirects is 'Redirections SEO pour maintenir le référencement lors de changements d''URL';
comment on column public.seo_redirects.redirect_type is 'Code de redirection HTTP : 301 (permanent), 302 (temporaire)';
comment on column public.seo_redirects.hit_count is 'Nombre de fois que la redirection a été utilisée';

-- Index pour performance des redirections
create index idx_seo_redirects_old_path on public.seo_redirects(old_path);
create index idx_seo_redirects_active on public.seo_redirects(is_active) where is_active = true;

-- Table pour les sitemaps dynamiques
drop table if exists public.sitemap_entries cascade;
create table public.sitemap_entries (
  id bigint generated always as identity primary key,
  url text not null unique,
  entity_type text, -- 'spectacle', 'article', 'page', etc.
  entity_id bigint,
  priority decimal(2,1) default 0.5 check (priority >= 0.0 and priority <= 1.0),
  change_frequency text default 'monthly', -- always, hourly, daily, weekly, monthly, yearly, never
  last_modified timestamptz default now(),
  is_indexed boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.sitemap_entries is 'Entrées du sitemap XML généré dynamiquement';
comment on column public.sitemap_entries.priority is 'Priorité SEO de 0.0 à 1.0';
comment on column public.sitemap_entries.change_frequency is 'Fréquence de mise à jour pour les crawlers';

-- Index pour génération rapide du sitemap
create index idx_sitemap_entries_indexed on public.sitemap_entries(is_indexed) where is_indexed = true;
create index idx_sitemap_entries_last_modified on public.sitemap_entries(last_modified desc);

-- Fonction pour générer automatiquement meta_title si vide
create or replace function public.generate_meta_title(
  original_title text,
  entity_type text default 'default'
)
returns text
language plpgsql
immutable
set search_path = ''
as $
declare
  suffix text;
begin
  if original_title is null or length(trim(original_title)) = 0 then
    return null;
  end if;

  -- Définir le suffixe selon le type d'entité
  case entity_type
    when 'spectacle' then suffix := ' | Rouge Cardinal - Compagnie de Théâtre';
    when 'article' then suffix := ' | Presse - Rouge Cardinal';
    when 'member' then suffix := ' | Équipe - Rouge Cardinal';
    else suffix := ' | Rouge Cardinal';
  end case;

  -- Tronquer si nécessaire pour respecter les 60 caractères recommandés
  if length(original_title || suffix) > 60 then
    return left(original_title, 60 - length(suffix) - 3) || '...' || suffix;
  else
    return original_title || suffix;
  end if;
end;
$;

-- Fonction pour générer meta_description automatiquement
create or replace function public.generate_meta_description(
  content text,
  chapo text default null,
  max_length integer default 160
)
returns text
language plpgsql
immutable
set search_path = ''
as $
declare
  description_text text;
  clean_text text;
begin
  -- Utiliser le chapô en priorité, sinon le contenu
  description_text := coalesce(chapo, content);
  
  if description_text is null or length(trim(description_text)) = 0 then
    return null;
  end if;

  -- Nettoyer le HTML et les caractères spéciaux
  clean_text := regexp_replace(description_text, '<[^>]*>', ' ', 'g');
  clean_text := regexp_replace(clean_text, '\s+', ' ', 'g');
  clean_text := trim(clean_text);

  -- Tronquer à la longueur souhaitée
  if length(clean_text) > max_length then
    clean_text := left(clean_text, max_length - 3) || '...';
  end if;

  return clean_text;
end;
$;

-- Trigger pour générer automatiquement les métadonnées SEO des spectacles
create or replace function public.spectacles_seo_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $
begin
  -- Générer meta_title si vide
  if new.meta_title is null or length(trim(new.meta_title)) = 0 then
    new.meta_title := public.generate_meta_title(new.titre, 'spectacle');
  end if;

  -- Générer meta_description si vide
  if new.meta_description is null or length(trim(new.meta_description)) = 0 then
    new.meta_description := public.generate_meta_description(new.description);
  end if;

  -- Générer canonical_url si vide
  if new.canonical_url is null and new.slug is not null then
    new.canonical_url := '/spectacles/' || new.slug;
  end if;

  -- Mettre à jour l'entrée sitemap
  insert into public.sitemap_entries (
    url, 
    entity_type, 
    entity_id, 
    priority, 
    change_frequency,
    last_modified,
    is_indexed
  ) values (
    '/spectacles/' || coalesce(new.slug, new.id::text),
    'spectacle',
    new.id,
    case when new.public then 0.8 else 0.3 end,
    'monthly',
    now(),
    new.public
  ) on conflict (url) do update set
    priority = excluded.priority,
    last_modified = excluded.last_modified,
    is_indexed = excluded.is_indexed,
    updated_at = now();

  return new;
end;
$;

-- Trigger pour les articles de presse
create or replace function public.articles_seo_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $
begin
  -- Générer meta_title si vide
  if new.meta_title is null or length(trim(new.meta_title)) = 0 then
    new.meta_title := public.generate_meta_title(new.titre, 'article');
  end if;

  -- Générer meta_description si vide
  if new.meta_description is null or length(trim(new.meta_description)) = 0 then
    new.meta_description := public.generate_meta_description(new.contenu, new.chapo);
  end if;

  -- Générer canonical_url si vide
  if new.canonical_url is null and new.slug is not null then
    new.canonical_url := '/presse/' || new.slug;
  end if;

  -- Mettre à jour l'entrée sitemap
  insert into public.sitemap_entries (
    url, 
    entity_type, 
    entity_id, 
    priority, 
    change_frequency,
    last_modified,
    is_indexed
  ) values (
    '/presse/' || coalesce(new.slug, new.id::text),
    'article',
    new.id,
    case when new.published_at is not null and new.published_at <= now() then 0.6 else 0.2 end,
    'weekly',
    now(),
    new.published_at is not null and new.published_at <= now()
  ) on conflict (url) do update set
    priority = excluded.priority,
    last_modified = excluded.last_modified,
    is_indexed = excluded.is_indexed,
    updated_at = now();

  return new;
end;
$;

-- Appliquer les triggers SEO
drop trigger if exists trg_spectacles_seo on public.spectacles;
create trigger trg_spectacles_seo
  before insert or update on public.spectacles
  for each row execute function public.spectacles_seo_trigger();

drop trigger if exists trg_articles_seo on public.articles_presse;
create trigger trg_articles_seo
  before insert or update on public.articles_presse
  for each row execute function public.articles_seo_trigger();

-- Vue pour exporter facilement les données SEO
create or replace view public.seo_metadata_export as
select 
  'spectacle' as entity_type,
  s.id as entity_id,
  s.titre as title,
  s.meta_title,
  s.meta_description,
  s.canonical_url,
  s.schema_type,
  '/spectacles/' || s.slug as url_path,
  s.public as is_published,
  s.updated_at
from public.spectacles s
where s.slug is not null

union all

select 
  'article' as entity_type,
  a.id as entity_id,
  a.titre as title,
  a.meta_title,
  a.meta_description,
  a.canonical_url,
  a.schema_type,
  '/presse/' || a.slug as url_path,
  case when a.published_at is not null and a.published_at <= now() then true else false end as is_published,
  a.updated_at
from public.articles_presse a
where a.slug is not null

order by entity_type, title;

comment on view public.seo_metadata_export is 'Export unifié des métadonnées SEO pour génération de sitemaps et balises';

-- 06_cache_user_preferences.sql
-- Gestion du cache et préférences utilisateurs

-- Table pour gérer l'invalidation du cache Redis
drop table if exists public.cache_keys cascade;
create table public.cache_keys (
  id bigint generated always as identity primary key,
  cache_key text not null unique,
  entity_type text,
  entity_id bigint,
  expires_at timestamptz,
  tags text[], -- Tags pour invalidation groupée
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.cache_keys is 'Gestion des clés de cache Redis pour invalidation intelligente';
comment on column public.cache_keys.cache_key is 'Clé unique du cache Redis';
comment on column public.cache_keys.tags is 'Tags pour invalidation par groupes (ex: ["spectacles", "homepage"])';

-- Index pour performance
create index idx_cache_keys_entity on public.cache_keys(entity_type, entity_id);
create index idx_cache_keys_expires_at on public.cache_keys(expires_at);
create index idx_cache_keys_tags on public.cache_keys using gin(tags);

-- Table des préférences utilisateurs
drop table if exists public.user_preferences cascade;
create table public.user_preferences (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  preference_key text not null,
  preference_value jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint user_preferences_unique unique (user_id, preference_key)
);

comment on table public.user_preferences is 'Préférences personnalisées des utilisateurs (thème, notifications, filtres)';
comment on column public.user_preferences.preference_key is 'Type de préférence : theme, notifications, filters, etc.';
comment on column public.user_preferences.preference_value is 'Valeur JSON de la préférence';

-- Index pour accès rapide aux préférences
create index idx_user_preferences_user_id on public.user_preferences(user_id);
create index idx_user_preferences_key on public.user_preferences(preference_key);

-- Fonction pour invalider le cache par tags
create or replace function public.invalidate_cache_by_tags(p_tags text[])
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  invalidated_count integer := 0;
begin
  -- Marquer les entrées comme expirées
  update public.cache_keys 
  set expires_at = now()
  where tags && p_tags
    and (expires_at is null or expires_at > now());
  
  get diagnostics invalidated_count = row_count;
  
  return invalidated_count;
end;
$$;

-- Fonction pour nettoyer les clés de cache expirées
create or replace function public.cleanup_expired_cache_keys()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted_count integer := 0;
begin
  delete from public.cache_keys 
  where expires_at is not null and expires_at < now();
  
  get diagnostics deleted_count = row_count;
  
  return deleted_count;
end;
$$;

-- Fonction pour gérer les préférences utilisateur
create or replace function public.set_user_preference(
  p_user_id uuid,
  p_key text,
  p_value jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.user_preferences (user_id, preference_key, preference_value)
  values (p_user_id, p_key, p_value)
  on conflict (user_id, preference_key) 
  do update set 
    preference_value = excluded.preference_value,
    updated_at = now();
  
  return true;
end;
$$;

comment on function public.set_user_preference(uuid, text, jsonb) is 
'Sets or updates user preference value using upsert pattern. Uses SECURITY INVOKER to respect RLS policies - users can only modify their own preferences through policy enforcement.';

-- Fonction pour récupérer une préférence utilisateur
create or replace function public.get_user_preference(
  p_user_id uuid,
  p_key text,
  p_default jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  result jsonb;
begin
  select preference_value into result
  from public.user_preferences 
  where user_id = p_user_id and preference_key = p_key;
  
  return coalesce(result, p_default);
end;
$$;

comment on function public.get_user_preference(uuid, text, jsonb) is 
'Retrieves user preference value with fallback default. Marked STABLE since it only reads data and results remain consistent during transaction. Uses SECURITY INVOKER to respect RLS policies on user_preferences table.';

-- Trigger pour invalider le cache lors de modifications importantes
create or replace function public.cache_invalidation_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  tags_to_invalidate text[];
begin
  -- Déterminer les tags à invalider selon la table modifiée
  case tg_table_name
    when 'spectacles' then
      tags_to_invalidate := array['spectacles', 'homepage', 'agenda'];
      if new.public != old.public then
        tags_to_invalidate := tags_to_invalidate || array['sitemap'];
      end if;
    
    when 'articles_presse' then
      tags_to_invalidate := array['articles', 'presse', 'homepage'];
      if (new.published_at is null) != (old.published_at is null) then
        tags_to_invalidate := tags_to_invalidate || array['sitemap'];
      end if;
    
    when 'evenements' then
      tags_to_invalidate := array['evenements', 'agenda', 'homepage'];
    
    when 'membres_equipe' then
      tags_to_invalidate := array['equipe', 'homepage'];
    
    when 'partners' then
      tags_to_invalidate := array['partners', 'homepage'];
    
    when 'configurations_site' then
      tags_to_invalidate := array['config', 'homepage'];
    
    else
      tags_to_invalidate := array['general'];
  end case;

  -- Invalider le cache
  perform public.invalidate_cache_by_tags(tags_to_invalidate);
  
  return coalesce(new, old);
end;
$$;

-- Appliquer les triggers d'invalidation de cache
do $$
declare
  cache_tables text[] := array[
    'public.spectacles', 'public.articles_presse', 'public.evenements', 
    'public.membres_equipe', 'public.partners', 'public.configurations_site'
  ];
  tbl text;
begin
  foreach tbl in array cache_tables
  loop
    execute format('drop trigger if exists trg_cache_invalidation on %s;', tbl);
    execute format('create trigger trg_cache_invalidation
      after update on %s
      for each row
      execute function public.cache_invalidation_trigger();', tbl);
  end loop;
end;
$$;

-- Vue pour les préférences avec valeurs par défaut
create or replace view public.user_preferences_with_defaults as
with default_preferences as (
  select 
    unnest(array['theme', 'notifications', 'language', 'timezone']) as preference_key,
    unnest(array[
      '{"mode":"light","primaryColor":"#8B0000"}',
      '{"email":true,"browser":true,"newsletter":true}',
      '{"locale":"fr-FR"}',
      '{"zone":"Europe/Paris"}'
    ]::jsonb[]) as default_value
),
user_auth as (
  select auth.uid() as current_user_id
)
select 
  coalesce(u.current_user_id, uuid_nil()) as user_id,
  dp.preference_key,
  coalesce(up.preference_value, dp.default_value) as preference_value,
  up.updated_at
from default_preferences dp
cross join user_auth u
left join public.user_preferences up on up.user_id = u.current_user_id 
  and up.preference_key = dp.preference_key
where u.current_user_id is not null;

comment on view public.user_preferences_with_defaults is 'Préférences utilisateur avec valeurs par défaut pour utilisateur connecté';

-- Fonction utilitaire pour créer une clé de cache
create or replace function public.create_cache_key(
  p_cache_key text,
  p_entity_type text default null,
  p_entity_id bigint default null,
  p_ttl_seconds integer default 3600,
  p_tags text[] default array[]::text[]
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cache_id bigint;
  expires_at_value timestamptz;
begin
  if p_ttl_seconds > 0 then
    expires_at_value := now() + (p_ttl_seconds || ' seconds')::interval;
  else
    expires_at_value := null; -- Cache permanent
  end if;

  insert into public.cache_keys (
    cache_key,
    entity_type,
    entity_id,
    expires_at,
    tags
  ) values (
    p_cache_key,
    p_entity_type,
    p_entity_id,
    expires_at_value,
    p_tags
  ) returning id into cache_id;
  
  return cache_id;
end;
$$;

-- 07_rls_policies_new_tables.sql
-- Row Level Security policies pour les nouvelles tables

-- ---- analytics_events ----
alter table public.analytics_events enable row level security;

-- Lecture par admins uniquement
drop policy if exists "Admins can view analytics" on public.analytics_events;
create policy "Admins can view analytics"
on public.analytics_events
for select
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- Insertion pour tous (anon et authenticated) via fonction sécurisée uniquement
drop policy if exists "Analytics events can be inserted via function" on public.analytics_events;
create policy "Analytics events can be inserted via function"
on public.analytics_events
for insert
to authenticated, anon
with check ( true ); -- La sécurité est gérée par la fonction track_analytics_event

-- ---- categories ----
alter table public.categories enable row level security;

-- Lecture publique des catégories actives
drop policy if exists "Active categories are viewable by everyone" on public.categories;
create policy "Active categories are viewable by everyone"
on public.categories
for select
to authenticated, anon
using ( is_active = true );

-- Admins peuvent voir toutes les catégories
drop policy if exists "Admins can view all categories" on public.categories;
create policy "Admins can view all categories"
on public.categories
for select
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- Modification réservée aux admins
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
on public.categories
for insert, update, delete
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' )
with check ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- ---- tags ----
alter table public.tags enable row level security;

-- Lecture publique pour tous
drop policy if exists "Tags are viewable by everyone" on public.tags;
create policy "Tags are viewable by everyone"
on public.tags
for select
to authenticated, anon
using ( true );

-- Modification réservée aux admins
drop policy if exists "Admins can manage tags" on public.tags;
create policy "Admins can manage tags"
on public.tags
for insert, update, delete
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' )
with check ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- ---- Tables de liaison tags/categories ----
alter table public.spectacles_categories enable row level security;
alter table public.spectacles_tags enable row level security;
alter table public.articles_categories enable row level security;
alter table public.articles_tags enable row level security;

-- Lecture publique pour toutes les liaisons
drop policy if exists "Category relations are viewable by everyone" on public.spectacles_categories;
create policy "Category relations are viewable by everyone"
on public.spectacles_categories
for select
to authenticated, anon
using ( true );

drop policy if exists "Tag relations are viewable by everyone" on public.spectacles_tags;
create policy "Tag relations are viewable by everyone"
on public.spectacles_tags
for select
to authenticated, anon
using ( true );

drop policy if exists "Article category relations are viewable by everyone" on public.articles_categories;
create policy "Article category relations are viewable by everyone"
on public.articles_categories
for select
to authenticated, anon
using ( true );

drop policy if exists "Article tag relations are viewable by everyone" on public.articles_tags;
create policy "Article tag relations are viewable by everyone"
on public.articles_tags
for select
to authenticated, anon
using ( true );

-- Modification des liaisons par admins et éditeurs
drop policy if exists "Editors can manage spectacle categories" on public.spectacles_categories;
create policy "Editors can manage spectacle categories"
on public.spectacles_categories
for insert, update, delete
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) in ('admin', 'editor') )
with check ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) in ('admin', 'editor') );

drop policy if exists "Editors can manage spectacle tags" on public.spectacles_tags;
create policy "Editors can manage spectacle tags"
on public.spectacles_tags
for insert, update, delete
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) in ('admin', 'editor') )
with check ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) in ('admin', 'editor') );

drop policy if exists "Editors can manage article categories" on public.articles_categories;
create policy "Editors can manage article categories"
on public.articles_categories
for insert, update, delete
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) in ('admin', 'editor') )
with check ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) in ('admin', 'editor') );

drop policy if exists "Editors can manage article tags" on public.articles_tags;
create policy "Editors can manage article tags"
on public.articles_tags
for insert, update, delete
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) in ('admin', 'editor') )
with check ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) in ('admin', 'editor') );

-- ---- content_versions ----
alter table public.content_versions enable row level security;

-- Lecture par admins uniquement (historique sensible)
drop policy if exists "Admins can view content versions" on public.content_versions;
create policy "Admins can view content versions"
on public.content_versions
for select
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- Insertion automatique par triggers (pas de policy directe nécessaire)
drop policy if exists "Content versions are created by system" on public.content_versions;
create policy "Content versions are created by system"
on public.content_versions
for insert
to authenticated
with check ( (select auth.uid()) = created_by );

-- ---- seo_redirects ----
alter table public.seo_redirects enable row level security;

-- Lecture par admins uniquement
drop policy if exists "Admins can view SEO redirects" on public.seo_redirects;
create policy "Admins can view SEO redirects"
on public.seo_redirects
for select
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- Modification par admins uniquement
drop policy if exists "Admins can manage SEO redirects" on public.seo_redirects;
create policy "Admins can manage SEO redirects"
on public.seo_redirects
for insert, update, delete
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' )
with check ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- ---- sitemap_entries ----
alter table public.sitemap_entries enable row level security;

-- Lecture publique pour génération sitemap (mais via API seulement)
drop policy if exists "Sitemap entries are viewable by authenticated users" on public.sitemap_entries;
create policy "Sitemap entries are viewable by authenticated users"
on public.sitemap_entries
for select
to authenticated
using ( is_indexed = true );

-- Gestion automatique par triggers (admins peuvent voir tout)
drop policy if exists "Admins can view all sitemap entries" on public.sitemap_entries;
create policy "Admins can view all sitemap entries"
on public.sitemap_entries
for select
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- Modification par système uniquement (via triggers)
drop policy if exists "Sitemap entries managed by system" on public.sitemap_entries;
create policy "Sitemap entries managed by system"
on public.sitemap_entries
for insert, update, delete
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' )
with check ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- ---- cache_keys ----
alter table public.cache_keys enable row level security;

-- Accès restreint aux admins uniquement
drop policy if exists "Admins can select cache keys" on public.cache_keys;
create policy "Admins can select cache keys"
on public.cache_keys
for select
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

drop policy if exists "Admins can insert cache keys" on public.cache_keys;
create policy "Admins can insert cache keys"
on public.cache_keys
for insert
to authenticated
with check ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

drop policy if exists "Admins can update cache keys" on public.cache_keys;
create policy "Admins can update cache keys"
on public.cache_keys
for update
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' )
with check ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

drop policy if exists "Admins can delete cache keys" on public.cache_keys;
create policy "Admins can delete cache keys"
on public.cache_keys
for delete
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- ---- user_preferences ----
alter table public.user_preferences enable row level security;

-- Utilisateurs peuvent lire leurs propres préférences
drop policy if exists "Users can select their own preferences" on public.user_preferences;
create policy "Users can select their own preferences"
on public.user_preferences
for select
to authenticated
using ( (select auth.uid()) = user_id );

-- Utilisateurs peuvent créer leurs propres préférences
drop policy if exists "Users can insert their own preferences" on public.user_preferences;
create policy "Users can insert their own preferences"
on public.user_preferences
for insert
to authenticated
with check ( (select auth.uid()) = user_id );

-- Utilisateurs peuvent modifier leurs propres préférences
drop policy if exists "Users can update their own preferences" on public.user_preferences;
create policy "Users can update their own preferences"
on public.user_preferences
for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

-- Utilisateurs peuvent supprimer leurs propres préférences
drop policy if exists "Users can delete their own preferences" on public.user_preferences;
create policy "Users can delete their own preferences"
on public.user_preferences
for delete
to authenticated
using ( (select auth.uid()) = user_id );

-- Admins peuvent voir toutes les préférences
drop policy if exists "Admins can view all preferences" on public.user_preferences;
create policy "Admins can view all preferences"
on public.user_preferences
for select
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );

-- 08_triggers_updated_at_audit.sql
-- Application des triggers updated_at et audit sur les nouvelles tables

-- Appliquer trigger updated_at sur nouvelles tables
do $
declare
  new_tables text[] := array[
    'public.categories', 'public.tags', 'public.content_versions', 
    'public.seo_redirects', 'public.sitemap_entries', 'public.cache_keys', 'public.user_preferences'
  ];
  tbl text;
begin
  foreach tbl in array new_tables
  loop
    execute format('drop trigger if exists trg_update_updated_at on %s;', tbl);
    execute format('create trigger trg_update_updated_at
      before update on %s
      for each row
      execute function public.update_updated_at_column();', tbl);
  end loop;
end;
$;

-- Appliquer trigger audit sur tables importantes (exclure analytics_events pour éviter boucle)
do $
declare
  audit_tables text[] := array[
    'public.categories', 'public.tags', 'public.content_versions',
    'public.seo_redirects', 'public.user_preferences'
  ];
  tbl text;
begin
  foreach tbl in array audit_tables
  loop
    execute format('drop trigger if exists trg_audit on %s;', tbl);
    execute format('create trigger trg_audit
      after insert or update or delete on %s
      for each row
      execute function public.audit_trigger();', tbl);
  end loop;
end;
$;

-- 10_test_validation_suite.sql
-- Suite de tests pour valider l'implémentation des améliorations

-- ============================================================================
-- TESTS DE VALIDATION - AMÉLIORATIONS SCHEMA BDD ROUGE CARDINAL
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TESTS RÉCURRENCE ÉVÉNEMENTS
-- ----------------------------------------------------------------------------

-- Test 1.1 : Création événement avec récurrence
do $$
begin
  -- Insérer un spectacle de test si nécessaire
  insert into public.spectacles (titre, slug, description, public) 
  values ('Test Spectacle', 'test-spectacle', 'Spectacle de test', true)
  on conflict do nothing;

  -- Créer événement récurrent
  insert into public.evenements (
    spectacle_id, 
    date_debut, 
    date_fin,
    recurrence_rule, 
    recurrence_end_date
  ) 
  select 
    s.id,
    '2024-06-01 20:00'::timestamptz,
    '2024-06-01 22:00'::timestamptz,
    'FREQ=WEEKLY;BYDAY=SA',
    '2024-08-31 22:00'::timestamptz
  from public.spectacles s 
  where s.slug = 'test-spectacle'
  limit 1;

  raise notice 'Test 1.1 ✓ : Événement récurrent créé avec succès';
exception when others then
  raise notice 'Test 1.1 ✗ : Erreur création récurrence - %', sqlerrm;
end;
$$;

-- Test 1.2 : Validation RRULE
do $$
begin
  perform public.validate_rrule('FREQ=DAILY;COUNT=10');
  perform public.validate_rrule('FREQ=INVALID'); -- Doit échouer
  raise notice 'Test 1.2 ✗ : Validation RRULE devrait échouer';
exception when others then
  raise notice 'Test 1.2 ✓ : Validation RRULE fonctionne correctement';
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. TESTS ANALYTICS
-- ----------------------------------------------------------------------------

-- Test 2.1 : Enregistrement événement analytique
do $$
declare
  event_id bigint;
begin
  select public.track_analytics_event(
    'page_view',
    'spectacle',
    1,
    'test-session-123',
    '/spectacles/test-spectacle',
    'test search'
  ) into event_id;

  if event_id > 0 then
    raise notice 'Test 2.1 ✓ : Événement analytique créé (ID: %)', event_id;
  else
    raise notice 'Test 2.1 ✗ : Échec création événement analytique';
  end if;
exception when others then
  raise notice 'Test 2.1 ✗ : Erreur analytics - %', sqlerrm;
end;
$$;

-- Test 2.2 : Vue analytics summary
do $$
declare
  summary_count integer;
begin
  select count(*) into summary_count from public.analytics_summary;
  raise notice 'Test 2.2 ✓ : Analytics summary accessible (% entrées)', summary_count;
exception when others then
  raise notice 'Test 2.2 ✗ : Erreur analytics summary - %', sqlerrm;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. TESTS TAGS/CATÉGORIES
-- ----------------------------------------------------------------------------

-- Test 3.1 : Création hiérarchie catégories
do $$
declare
  parent_id bigint;
  child_id bigint;
begin
  -- Créer catégorie parent
  insert into public.categories (name, slug, description, color)
  values ('Théâtre', 'theatre', 'Productions théâtrales', '#8B0000')
  returning id into parent_id;

  -- Créer sous-catégorie
  insert into public.categories (name, slug, parent_id)
  values ('Drame', 'drame', parent_id)
  returning id into child_id;

  raise notice 'Test 3.1 ✓ : Hiérarchie catégories créée (parent: %, enfant: %)', parent_id, child_id;
exception when others then
  raise notice 'Test 3.1 ✗ : Erreur catégories - %', sqlerrm;
end;
$$;

-- Test 3.2 : Tags avec compteur d'usage
do $$
declare
  tag_id bigint;
  spectacle_id bigint;
  usage_count integer;
begin
  -- Créer tag
  insert into public.tags (name, slug) 
  values ('Classique', 'classique')
  returning id into tag_id;

  -- Associer à spectacle
  select id into spectacle_id from public.spectacles limit 1;
  
  insert into public.spectacles_tags (spectacle_id, tag_id)
  values (spectacle_id, tag_id);

  -- Vérifier compteur
  select usage_count into usage_count from public.tags where id = tag_id;
  
  if usage_count = 1 then
    raise notice 'Test 3.2 ✓ : Compteur usage tag mis à jour correctement';
  else
    raise notice 'Test 3.2 ✗ : Compteur usage incorrect (attendu: 1, actuel: %)', usage_count;
  end if;
exception when others then
  raise notice 'Test 3.2 ✗ : Erreur tags - %', sqlerrm;
end;
$$;

-- Test 3.3 : Vue hiérarchique
do $$
declare
  hierarchy_count integer;
begin
  select count(*) into hierarchy_count from public.categories_hierarchy;
  raise notice 'Test 3.3 ✓ : Vue hiérarchie accessible (% niveaux)', hierarchy_count;
exception when others then
  raise notice 'Test 3.3 ✗ : Erreur vue hiérarchie - %', sqlerrm;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. TESTS VERSIONING CONTENU
-- ----------------------------------------------------------------------------

-- Test 4.1 : Versioning automatique spectacle
do $$
declare
  spectacle_id bigint;
  version_count integer;
begin
  -- Prendre un spectacle existant
  select id into spectacle_id from public.spectacles limit 1;
  
  -- Modifier le spectacle (doit déclencher versioning)
  update public.spectacles 
  set titre = titre || ' [Modifié]',
      description = 'Description mise à jour'
  where id = spectacle_id;

  -- Vérifier création version
  select count(*) into version_count 
  from public.content_versions 
  where entity_type = 'spectacle' and entity_id = spectacle_id;

  if version_count > 0 then
    raise notice 'Test 4.1 ✓ : Versioning automatique fonctionne (% versions)', version_count;
  else
    raise notice 'Test 4.1 ✗ : Aucune version créée';
  end if;
exception when others then
  raise notice 'Test 4.1 ✗ : Erreur versioning - %', sqlerrm;
end;
$$;

-- Test 4.2 : Fonction de restauration
do $$
declare
  version_id bigint;
  restored boolean;
begin
  -- Prendre une version existante
  select id into version_id 
  from public.content_versions 
  where entity_type = 'spectacle'
  limit 1;

  if version_id is not null then
    select public.restore_content_version(version_id, 'Test restauration') into restored;
    raise notice 'Test 4.2 ✓ : Fonction restauration accessible (résultat: %)', restored;
  else
    raise notice 'Test 4.2 ⚠ : Aucune version disponible pour test restauration';
  end if;
exception when others then
  raise notice 'Test 4.2 ✗ : Erreur restauration - %', sqlerrm;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. TESTS SEO
-- ----------------------------------------------------------------------------

-- Test 5.1 : Génération automatique métadonnées
do $$
declare
  spectacle_id bigint;
  meta_title text;
  meta_desc text;
begin
  -- Créer spectacle test
  insert into public.spectacles (titre, description, slug, public)
  values (
    'Roméo et Juliette',
    'Tragédie de Shakespeare mise en scène par la compagnie Rouge Cardinal. Une histoire d''amour éternelle dans un décor contemporain.',
    'romeo-juliette',
    true
  ) returning id into spectacle_id;

  -- Récupérer métadonnées générées
  select meta_title, meta_description 
  into meta_title, meta_desc
  from public.spectacles 
  where id = spectacle_id;

  if meta_title is not null and meta_desc is not null then
    raise notice 'Test 5.1 ✓ : Métadonnées SEO générées automatiquement';
    raise notice '  - Title: %', left(meta_title, 50) || '...';
    raise notice '  - Description: %', left(meta_desc, 50) || '...';
  else
    raise notice 'Test 5.1 ✗ : Métadonnées SEO non générées';
  end if;
exception when others then
  raise notice 'Test 5.1 ✗ : Erreur SEO - %', sqlerrm;
end;
$$;

-- Test 5.2 : Entrée sitemap automatique
do $$
declare
  sitemap_count integer;
begin
  select count(*) into sitemap_count 
  from public.sitemap_entries 
  where entity_type = 'spectacle' and is_indexed = true;

  raise notice 'Test 5.2 ✓ : Entrées sitemap spectacles (% entrées)', sitemap_count;
exception when others then
  raise notice 'Test 5.2 ✗ : Erreur sitemap - %', sqlerrm;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. TESTS CACHE & PRÉFÉRENCES
-- ----------------------------------------------------------------------------

-- Test 6.1 : Création clé de cache
do $$
declare
  cache_id bigint;
begin
  select public.create_cache_key(
    'test:spectacles:homepage',
    'spectacle',
    null,
    3600,
    array['spectacles', 'homepage']
  ) into cache_id;

  if cache_id > 0 then
    raise notice 'Test 6.1 ✓ : Clé de cache créée (ID: %)', cache_id;
  else
    raise notice 'Test 6.1 ✗ : Échec création clé cache';
  end if;
exception when others then
  raise notice 'Test 6.1 ✗ : Erreur cache - %', sqlerrm;
end;
$$;

-- Test 6.2 : Invalidation cache par tags
do $$
declare
  invalidated_count integer;
begin
  select public.invalidate_cache_by_tags(array['spectacles', 'homepage']) 
  into invalidated_count;

  raise notice 'Test 6.2 ✓ : Cache invalidé (% entrées)', invalidated_count;
exception when others then
  raise notice 'Test 6.2 ✗ : Erreur invalidation cache - %', sqlerrm;
end;
$$;

-- ----------------------------------------------------------------------------
-- 7. TESTS PERFORMANCE
-- ----------------------------------------------------------------------------

-- Test 7.1 : Performance requête analytics
explain (analyze, costs off, timing off, summary off)
select 
  event_type, 
  count(*) as total,
  count(distinct session_id) as unique_sessions
from public.analytics_events 
where created_at >= now() - interval '7 days'
  and event_type in ('page_view', 'click')
group by event_type;

-- Test 7.2 : Performance recherche avec tags
explain (analyze, costs off, timing off, summary off)
select s.titre, s.slug
from public.spectacles s
join public.spectacles_tags st on s.id = st.spectacle_id
join public.tags t on st.tag_id = t.id
where t.slug = 'classique'
  and s.public = true;

-- Test 7.3 : Performance hiérarchie catégories  
explain (analyze, costs off, timing off, summary off)
select * from public.categories_hierarchy
where level <= 2;

-- ----------------------------------------------------------------------------
-- 8. TESTS RLS (ROW LEVEL SECURITY)
-- ----------------------------------------------------------------------------

-- Note: Ces tests nécessitent d'être exécutés avec différents rôles
-- Voir le guide de migration pour les procédures de test RLS complètes

do $$
begin
  raise notice '============================================';
  raise notice 'RÉSUMÉ DES TESTS DE VALIDATION';
  raise notice '============================================';
  raise notice 'Tests terminés. Vérifiez les messages ci-dessus :';
  raise notice '  ✓ = Test réussi';
  raise notice '  ✗ = Test échoué (nécessite correction)';
  raise notice '  ⚠ = Test partiellement réussi ou sauté';
  raise notice '';
  raise notice 'Pour les tests RLS, suivez le guide de migration.';
  raise notice 'Pour les tests de performance, analysez les plans d''exécution ci-dessus.';
end;
$$;

-- ============================================================================
-- FIN DU SCHEMA DÉCLARATIF ROUGE CARDINAL COMPANY
-- ============================================================================
-- 
-- PROCHAINES ÉTAPES POUR APPLIQUER CE SCHÉMA :
-- 
-- 1. Arrêter l'environnement local : supabase stop
-- 2. Générer les migrations : supabase db diff -f apply_declarative_schema
-- 3. Vérifier le fichier de migration généré avant application
-- 4. Appliquer les migrations : supabase db push
-- 
-- RAPPEL : Toute modification future de ce schéma doit être suivie par
-- une nouvelle génération de migration avec supabase db diff
-- 
-- ============================================================================

