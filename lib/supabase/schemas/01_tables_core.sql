-- 01_tables_core.sql
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
