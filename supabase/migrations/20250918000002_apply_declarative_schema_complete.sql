-- MIGRATION PRINCIPALE: Création de toutes les tables depuis le schéma déclaratif
-- Date: 2025-11-18
-- Source: supabase/schemas/*.sql
-- 
-- Cette migration reconstruit le schéma complet de la base de données.
-- Elle doit s'exécuter AVANT tous les seeds de données.
-- 
-- Ordre d'exécution:
--   1. Extensions (pgcrypto, unaccent, pg_trgm, citext)
--   2. Tables de base (profiles, medias)
--   3. Fonctions core (is_admin, helpers)
--   4. Tables métier (spectacles, événements, etc.)
--   5. Tables de liaison (many-to-many)
--   6. Triggers et contraintes
--   7. Vues et indexes
--   8. Politiques RLS
--
-- ⚠️  Note sur storage.objects:
--    Les commentaires sur les policies storage.objects sont commentés
--    car ils nécessitent des privilèges superuser.


-- ============================================================================
-- SOURCE: 01_extensions.sql
-- ============================================================================
-- Extensions requises pour Rouge Cardinal Company
-- Ordre: 01 - Exécuté en premier pour définir les extensions nécessaires

create extension if not exists "pgcrypto"; -- Génération UUID optionnelle
create extension if not exists "unaccent"; -- Pour generate_slug()
create extension if not exists "pg_trgm";   -- Index trigram pour recherche fuzzy
create extension if not exists "citext";    -- Case-insensitive text pour emails

-- ============================================================================
-- SOURCE: 02_table_profiles.sql
-- ============================================================================
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

-- ============================================================================
-- SOURCE: 02b_functions_core.sql
-- ============================================================================
-- Fonctions utilitaires
-- Ordre: 02b - Après 02_table_profiles.sql pour pouvoir référencer profiles

-- Fonction helper pour vérifier les droits admin
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Needs access to auth.uid() which requires authentication context
 *   2. Must read profiles table reliably across different security contexts
 *   3. Used by RLS policies and other functions for authorization checks
 *   4. Marked STABLE since auth.uid() remains constant during transaction
 * 
 * Risks Evaluated:
 *   - Read-only operation (SELECT only, no mutations)
 *   - No user input parameters (zero injection risk)
 *   - Simple boolean return value
 *   - Used extensively in RLS policies (must be reliable and secure)
 * 
 * Validation:
 *   - Tested with admin and non-admin users
 *   - Used in multiple RLS policies across the schema
 *   - Performance optimized with STABLE volatility
 */
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

-- Fonction pour mise à jour automatique updated_at
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

-- Fonction d'audit générique
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

-- Helper pour recherche full-text français
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

-- Fonction de test de connexion Supabase
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Used for health checks and connectivity testing from client applications
 *   2. Must work regardless of user permissions (including anon users)
 *   3. Provides reliable system-level timestamp for monitoring
 *   4. No security risk as it only returns current server time
 * 
 * Risks Evaluated:
 *   - No user input (zero injection risk)
 *   - No data access (only system function now())
 *   - Granted to anon users intentionally for health checks
 *   - Read-only operation with no side effects
 * 
 * Validation:
 *   - Tested with anon and authenticated users
 *   - Used in client application health check endpoints
 */
create or replace function public.get_current_timestamp()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
begin
  return now();
end;
$$;

comment on function public.get_current_timestamp() is 
'Function to test Supabase connection. Uses SECURITY DEFINER to ensure it always works regardless of user permissions. Used for health checks and connectivity testing from client applications.';

-- Grant execute permission to anonymous users
grant execute on function public.get_current_timestamp() to anon;

-- Fonction pour horodater le consentement sur messages_contact
create or replace function public.set_messages_contact_consent_timestamp()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT' and new.consent = true and new.consent_at is null) then
    new.consent_at := now();
  elsif (tg_op = 'UPDATE' and new.consent = true and (old.consent is distinct from new.consent) and new.consent_at is null) then
    new.consent_at := now();
  end if;
  return new;
end;
$$;

comment on function public.set_messages_contact_consent_timestamp() is 'Définit consent_at lors de la première activation de consent pour messages_contact.';

-- ============================================================================
-- SOURCE: 02c_storage_buckets.sql
-- ============================================================================
-- Storage Buckets Configuration
-- Ordre: 02c - Buckets requis avant les tables qui référencent storage_path

/*
 * Bucket: medias
 * ===================
 * 
 * PURPOSE:
 *   Central storage for all media assets (team photos, press images, etc.)
 *   Referenced by multiple tables via storage_path column.
 * 
 * SECURITY:
 *   - Public read access (public = true)
 *   - Authenticated users can upload
 *   - Only admins can delete
 * 
 * TABLES USING THIS BUCKET:
 *   - medias (storage_path column)
 *   - membres_equipe (via photo_media_id FK)
 *   - communiques_presse (via header_media_id FK)
 *   - Future: spectacles, articles_presse, etc.
 */

-- Create medias bucket (idempotent with ON CONFLICT)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medias',
  'medias',
  true,  -- Public read access
  5242880,  -- 5MB max file size
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

/*
 * RLS Policies for storage.objects
 * ====================================
 * Co-located with bucket creation for maintainability
 */

-- Drop existing policies if any (for clean re-generation)
drop policy if exists "Public read access for medias" on storage.objects;
drop policy if exists "Authenticated users can upload to medias" on storage.objects;
drop policy if exists "Authenticated users can update medias" on storage.objects;
drop policy if exists "Admins can delete medias" on storage.objects;

-- Allow public read access
create policy "Public read access for medias"
on storage.objects for select
to public
using ( bucket_id = 'medias' );

-- Allow authenticated users to upload
create policy "Authenticated users can upload to medias"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'medias' );

-- Allow authenticated users to update their own uploads
create policy "Authenticated users can update medias"
on storage.objects for update
to authenticated
using ( bucket_id = 'medias' )
with check ( bucket_id = 'medias' );

-- Allow admins to delete (requires is_admin() check)
create policy "Admins can delete medias"
on storage.objects for delete
to authenticated
using ( 
  bucket_id = 'medias' 
  and (select public.is_admin())
);

-- Note: Comments on storage.objects policies are skipped (require superuser privileges)
-- -- comment on policy "Public read access for medias" on storage.objects is 'Anyone can view media files';
-- -- comment on policy "Authenticated users can upload to medias" on storage.objects is 'Authenticated users can upload files (admin check in Server Actions)';
-- -- comment on policy "Authenticated users can update medias" on storage.objects is 'Authenticated users can update file metadata';
-- -- comment on policy "Admins can delete medias" on storage.objects is 'Only admins can delete media files';

-- ============================================================================
-- SOURCE: 03_table_medias.sql
-- ============================================================================
-- Table medias - Gestion des médias/fichiers
-- Ordre: 03 - Table de base sans dépendances

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

comment on table public.medias is 'media storage metadata (paths, filenames, mime, size)';
comment on column public.medias.storage_path is 'storage provider path (bucket/key)';

-- ============================================================================
-- SOURCE: 04_table_membres_equipe.sql
-- ============================================================================
-- Table membres_equipe - Membres de l'équipe
-- Ordre: 04 - Dépend de medias pour photo_media_id

drop table if exists public.membres_equipe cascade;
create table public.membres_equipe (
  id bigint generated always as identity primary key,
  name text not null,
  role text,
  description text,
  image_url text, -- URL d'image externe optionnelle (complément à photo_media_id)
  photo_media_id bigint null references public.medias(id) on delete set null,
  ordre smallint default 0,
  active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.membres_equipe is 'Members of the team (artists, staff). image_url permet d utiliser une image externe sans media uploadé.';
comment on column public.membres_equipe.image_url is 'URL externe de l image du membre (fallback si aucun media stocké)';

-- Row Level Security
alter table public.membres_equipe enable row level security;

-- Tout le monde peut voir les membres d'équipe
drop policy if exists "Membres equipe are viewable by everyone" on public.membres_equipe;
create policy "Membres equipe are viewable by everyone"
on public.membres_equipe
for select
to anon, authenticated
using ( true );

-- Seuls les admins peuvent gérer les membres d'équipe
drop policy if exists "Admins can create membres equipe" on public.membres_equipe;
create policy "Admins can create membres equipe"
on public.membres_equipe
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update membres equipe" on public.membres_equipe;
create policy "Admins can update membres equipe"
on public.membres_equipe
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete membres equipe" on public.membres_equipe;
create policy "Admins can delete membres equipe"
on public.membres_equipe
for delete
to authenticated
using ( (select public.is_admin()) );

-- Vue admin déplacée dans 41_views_admin_content_versions.sql (dépend de content_versions)

-- ============================================================================
-- SOURCE: 05_table_lieux.sql
-- ============================================================================
-- Table lieux - Lieux de représentation
-- Ordre: 05 - Table indépendante

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

comment on table public.lieux is 'physical venues where events can be scheduled';

-- Row Level Security
alter table public.lieux enable row level security;

-- Tout le monde peut voir les lieux
drop policy if exists "Lieux are viewable by everyone" on public.lieux;
create policy "Lieux are viewable by everyone"
on public.lieux
for select
to anon, authenticated
using ( true );

-- Seuls les admins peuvent gérer les lieux
drop policy if exists "Admins can create lieux" on public.lieux;
create policy "Admins can create lieux"
on public.lieux
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update lieux" on public.lieux;
create policy "Admins can update lieux"
on public.lieux
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete lieux" on public.lieux;
create policy "Admins can delete lieux"
on public.lieux
for delete
to authenticated
using ( (select public.is_admin()) );

-- ============================================================================
-- SOURCE: 06_table_spectacles.sql
-- ============================================================================
-- Table spectacles - Spectacles/représentations
-- Ordre: 06 - Table principale pour les spectacles

drop table if exists public.spectacles cascade;
create table public.spectacles (
  id bigint generated always as identity primary key,
  title text not null,
  slug text,
  status text,
  description text,
  short_description text,
  genre text,
  duration_minutes integer,
  casting integer,
  premiere timestamptz null,
  image_url text, -- URL externe vers une image alternative)
  public boolean default true,
  awards text[],
  created_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector
);

comment on table public.spectacles is 'shows/performances (base entity)';
comment on column public.spectacles.casting is 'Nombre d  interprètes au plateau (anciennement `cast`)';
comment on column public.spectacles.image_url is 'URL externe vers une image (alternative ou complément à image_media_id)';
comment on column public.spectacles.awards is 'Liste des prix et distinctions (array, d''où le pluriel conforme au type)';

-- ============================================================================
-- SOURCE: 07_table_evenements.sql
-- ============================================================================
-- Table evenements - Événements programmés
-- Ordre: 07 - Dépend de spectacles et lieux

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
  recurrence_rule text,
  recurrence_end_date timestamptz,
  parent_event_id bigint references public.evenements(id) on delete cascade,
  ticket_url text, -- URL vers la billetterie externe
  image_url text, -- URL d'image pour l'événement spécifique
  start_time time, -- Heure de début (complément à date_debut)
  end_time time, -- Heure de fin (complément à date_fin ou durée)
  type_array text[] default '{}', -- Tableau des types d'événements (spectacle, atelier, rencontre, etc.)
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.evenements is 'Séances programmées de spectacles, avec date et lieu';
comment on column public.evenements.recurrence_rule is 'Règle de récurrence au format RRULE (RFC 5545)';
comment on column public.evenements.recurrence_end_date is 'Date de fin de la récurrence';
comment on column public.evenements.parent_event_id is 'Référence vers l''événement parent pour les occurrences générées';
comment on column public.evenements.ticket_url is 'URL vers la billetterie externe ou système de réservation';
comment on column public.evenements.image_url is 'URL d''image spécifique à cet événement (complément aux médias du spectacle)';
comment on column public.evenements.start_time is 'Heure de début précise (complément à date_debut pour horaires)';
comment on column public.evenements.end_time is 'Heure de fin précise (complément à date_fin ou calcul de durée)';
comment on column public.evenements.type_array is 'Tableau des types d''événements : spectacle, première, atelier, rencontre, etc.';

-- ============================================================================
-- SOURCE: 07b_table_compagnie_content.sql
-- ============================================================================
-- Tables de contenu institutionnel compagnie (valeurs & statistiques)
-- Ordre: 07b - Après spectacles (pour garder regroupement logique), avant articles

-- Valeurs de la compagnie (correspond à Value[] côté front Page "La Compagnie")
-- Champ icon non stocké (déterminé en front via mapping titre/clé)

drop table if exists public.compagnie_values cascade;
create table public.compagnie_values (
  id bigint generated always as identity primary key,
  key text not null unique, -- slug interne stable (ex: passion, collectif, excellence, innovation)
  title text not null,
  description text not null,
  position smallint not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.compagnie_values is 'Valeurs institutionnelles (icon géré côté front).';
comment on column public.compagnie_values.key is 'Identifiant stable utilisé pour mapping icône côté frontend.';
comment on column public.compagnie_values.position is 'Ordre affichage (croissant).';

-- Statistiques / chiffres clés (correspond à StatItem[] côté front Page "Acceuil")
-- Champ icon non stocké

drop table if exists public.compagnie_stats cascade;
create table public.compagnie_stats (
  id bigint generated always as identity primary key,
  key text not null unique, -- slug interne (annees_experience, spectacles_crees, prix_obtenus)
  label text not null,
  value text not null, -- garder texte pour souplesse (ex: 15+, 8, 50+)
  position smallint not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.compagnie_stats is 'Statistiques / chiffres clés institutionnels (icon géré côté front).';
comment on column public.compagnie_stats.key is 'Identifiant stable pour mapping icône côté frontend.';

-- Index
create index if not exists idx_compagnie_values_active_order on public.compagnie_values(active, position) where active = true;
create index if not exists idx_compagnie_stats_active_order on public.compagnie_stats(active, position) where active = true;

-- RLS activation
alter table public.compagnie_values enable row level security;
alter table public.compagnie_stats enable row level security;

-- Politiques: lecture publique, écriture admin
-- VALUES
 drop policy if exists "Compagnie values are viewable by everyone" on public.compagnie_values;
create policy "Compagnie values are viewable by everyone"
  on public.compagnie_values for select
  to anon, authenticated
  using ( true );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert compagnie values" on public.compagnie_values;
create policy "Admins can insert compagnie values"
  on public.compagnie_values for insert
  to authenticated
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can update compagnie values" on public.compagnie_values;
create policy "Admins can update compagnie values"
  on public.compagnie_values for update
  to authenticated
  using ( (select public.is_admin()) )
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete compagnie values" on public.compagnie_values;
create policy "Admins can delete compagnie values"
  on public.compagnie_values for delete
  to authenticated
  using ( (select public.is_admin()) );

-- STATS
 drop policy if exists "Compagnie stats are viewable by everyone" on public.compagnie_stats;
create policy "Compagnie stats are viewable by everyone"
  on public.compagnie_stats for select
  to anon, authenticated
  using ( true );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert compagnie stats" on public.compagnie_stats;
create policy "Admins can insert compagnie stats"
  on public.compagnie_stats for insert
  to authenticated
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can update compagnie stats" on public.compagnie_stats;
create policy "Admins can update compagnie stats"
  on public.compagnie_stats for update
  to authenticated
  using ( (select public.is_admin()) )
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete compagnie stats" on public.compagnie_stats;
create policy "Admins can delete compagnie stats"
  on public.compagnie_stats for delete
  to authenticated
  using ( (select public.is_admin()) );


-- ============================================================================
-- SOURCE: 07c_table_compagnie_presentation.sql
-- ============================================================================
-- Table des sections de présentation de la compagnie
-- Ordre: 07c - après 07b (valeurs & stats), avant articles
-- Représente les entrées du tableau PresentationSection[] côté frontend (Page 'La Compagnie' /compagnie)
-- Objectif: rendre administrable la structure et le contenu éditorial modulable (hero, history, quote, values, team, mission, custom)

-- Suppression recréation déclarative
 drop table if exists public.compagnie_presentation_sections cascade;
create table public.compagnie_presentation_sections (
  id bigint generated always as identity primary key,
  slug text not null unique, -- correspond à PresentationSection.id (ex: hero, history, mission, quote-history)
  kind text not null check (kind in ('hero','history','quote','values','team','mission','custom')),
  title text,          -- facultatif selon le type
  subtitle text,       -- facultatif
  content text[],      -- liste de paragraphes (history, mission, custom)
  quote_text text,     -- utilisé si kind = quote
  quote_author text,   -- auteur citation
  image_url text,      -- image illustrative optionnelle (fallback)
  image_media_id bigint null references public.medias(id) on delete set null, -- media stocké prioritaire
  position smallint not null default 0, -- ordre général sur la page
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.compagnie_presentation_sections is 'Sections dynamiques de la page présentation compagnie (hero, history, mission, values placeholder, team placeholder, quotes, custom).';
comment on column public.compagnie_presentation_sections.slug is 'Identifiant stable référencé par le frontend.';
comment on column public.compagnie_presentation_sections.kind is 'Type de section (enum contrôlé côté DB).';
comment on column public.compagnie_presentation_sections.content is 'Liste ordonnée de paragraphes (NULL si non pertinent).';
comment on column public.compagnie_presentation_sections.quote_text is 'Texte de la citation si kind = quote.';
comment on column public.compagnie_presentation_sections.position is 'Ordre global croissant d affichage.';
comment on column public.compagnie_presentation_sections.image_media_id is 'Référence vers un media (prioritaire sur image_url).';

-- Index
create index if not exists idx_compagnie_presentation_sections_active_order on public.compagnie_presentation_sections(active, position) where active = true;
create index if not exists idx_compagnie_presentation_sections_kind on public.compagnie_presentation_sections(kind);

-- RLS
alter table public.compagnie_presentation_sections enable row level security;

-- Lecture publique
 drop policy if exists "Compagnie presentation sections are viewable by everyone" on public.compagnie_presentation_sections;
create policy "Compagnie presentation sections are viewable by everyone"
  on public.compagnie_presentation_sections for select
  to anon, authenticated
  using ( true );

-- Écriture réservée admin
-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert compagnie presentation sections" on public.compagnie_presentation_sections;
create policy "Admins can insert compagnie presentation sections"
  on public.compagnie_presentation_sections for insert
  to authenticated
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can update compagnie presentation sections" on public.compagnie_presentation_sections;
create policy "Admins can update compagnie presentation sections"
  on public.compagnie_presentation_sections for update
  to authenticated
  using ( (select public.is_admin()) )
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete compagnie presentation sections" on public.compagnie_presentation_sections;
create policy "Admins can delete compagnie presentation sections"
  on public.compagnie_presentation_sections for delete
  to authenticated
  using ( (select public.is_admin()) );

-- Vue admin déplacée dans 41_views_admin_content_versions.sql (dépend de content_versions)


-- ============================================================================
-- SOURCE: 07d_table_home_hero.sql
-- ============================================================================
-- Table des slides Hero de la page d'accueil
-- Ordre: 07d - après 07c (sections présentation)
-- Représente les entrées HeroSlide[] (title, subtitle, description, image, cta)

drop table if exists public.home_hero_slides cascade;
create table public.home_hero_slides (
  id bigint generated always as identity primary key,
  slug text not null unique, -- identifiant stable (ex: saison-2025, creation-phare)
  title text not null,
  subtitle text,
  description text,
  image_url text, -- fallback externe
  image_media_id bigint null references public.medias(id) on delete set null, -- media prioritaire
  -- CTA Primary (bouton principal)
  cta_primary_enabled boolean not null default false,
  cta_primary_label text,
  cta_primary_url text,
  -- CTA Secondary (bouton secondaire)
  cta_secondary_enabled boolean not null default false,
  cta_secondary_label text,
  cta_secondary_url text,
  position smallint not null default 0,
  active boolean not null default true,
  starts_at timestamptz, -- fenêtre d'activation planifiée (optionnel)
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Contraintes de validation
  constraint home_hero_slides_cta_primary_label_length check (cta_primary_label is null or char_length(cta_primary_label) <= 50),
  constraint home_hero_slides_cta_secondary_label_length check (cta_secondary_label is null or char_length(cta_secondary_label) <= 50),
  constraint home_hero_slides_cta_primary_consistency check (cta_primary_enabled = false or (cta_primary_enabled = true and cta_primary_label is not null and cta_primary_url is not null)),
  constraint home_hero_slides_cta_secondary_consistency check (cta_secondary_enabled = false or (cta_secondary_enabled = true and cta_secondary_label is not null and cta_secondary_url is not null))
);

comment on table public.home_hero_slides is 'Slides hero page d accueil (carousel) avec 2 CTA indépendants et planification optionnelle.';
comment on column public.home_hero_slides.slug is 'Identifiant stable pour ciblage et tracking.';
comment on column public.home_hero_slides.image_media_id is 'Référence media interne (prioritaire sur image_url).';
comment on column public.home_hero_slides.cta_primary_enabled is 'Active/désactive le bouton CTA principal.';
comment on column public.home_hero_slides.cta_primary_label is 'Texte du bouton CTA principal (max 50 caractères).';
comment on column public.home_hero_slides.cta_primary_url is 'URL du CTA principal (relative /path ou absolue https://...).';
comment on column public.home_hero_slides.cta_secondary_enabled is 'Active/désactive le bouton CTA secondaire.';
comment on column public.home_hero_slides.cta_secondary_label is 'Texte du bouton CTA secondaire (max 50 caractères).';
comment on column public.home_hero_slides.cta_secondary_url is 'URL du CTA secondaire (relative /path ou absolue https://...).';
comment on column public.home_hero_slides.starts_at is 'Date/heure de début d affichage (NULL = immédiat).';
comment on column public.home_hero_slides.ends_at is 'Date/heure de fin d affichage (NULL = illimité).';

-- Index
create index if not exists idx_home_hero_slides_active_order on public.home_hero_slides(active, position) where active = true;
create index if not exists idx_home_hero_slides_schedule on public.home_hero_slides(starts_at, ends_at) where active = true;

-- RLS
alter table public.home_hero_slides enable row level security;

-- Lecture publique (slides actifs + fenêtre valide)
drop policy if exists "Home hero slides are viewable by everyone" on public.home_hero_slides;
create policy "Home hero slides are viewable by everyone"
  on public.home_hero_slides for select
  to anon, authenticated
  using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

-- Gestion admin
-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert home hero slides" on public.home_hero_slides;
create policy "Admins can insert home hero slides"
  on public.home_hero_slides for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update home hero slides" on public.home_hero_slides;
create policy "Admins can update home hero slides"
  on public.home_hero_slides for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete home hero slides" on public.home_hero_slides;
create policy "Admins can delete home hero slides"
  on public.home_hero_slides for delete
  to authenticated
  using ((select public.is_admin()));

-- ============================================================================
-- SOURCE: 07e_table_home_about.sql
-- ============================================================================
-- Table de contenu "About" pour la page d'accueil
-- Ordre: 07e - après 07d (home_hero), avant 08_* (presse)
-- But: stocker un enregistrement éditorial pilotant HomeAboutContentDTO (title, intro1, intro2, image_url, mission_title, mission_text)

-- Recréation déclarative
 drop table if exists public.home_about_content cascade;
create table public.home_about_content (
  id bigint generated always as identity primary key,
  slug text not null unique, -- identifiant logique (ex: 'default') pour faciliter upsert/seed
  title text not null,
  intro1 text not null,
  intro2 text not null,
  image_url text,
  image_media_id bigint null references public.medias(id) on delete set null,
  mission_title text not null,
  mission_text text not null,
  position smallint not null default 0, -- pour préparer plusieurs variantes si besoin
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.home_about_content is 'Bloc éditorial About de la page d''accueil (HomeAboutContentDTO). Un ou plusieurs enregistrements triés par position, filtrés par active.';
comment on column public.home_about_content.slug is 'Clé stable pour upsert (ex: default).';
comment on column public.home_about_content.image_media_id is 'Référence prioritaire vers un média stocké (surpasse image_url si non null).';

-- Index
create index if not exists idx_home_about_content_active_order on public.home_about_content(active, position) where active = true;

-- RLS
alter table public.home_about_content enable row level security;

-- Lecture publique
 drop policy if exists "Home about content is viewable by everyone" on public.home_about_content;
create policy "Home about content is viewable by everyone"
  on public.home_about_content for select
  to anon, authenticated
  using ( true );

-- Écriture réservée admin (politiques granulaires)
drop policy if exists "Admins can insert home about content" on public.home_about_content;
create policy "Admins can insert home about content"
  on public.home_about_content for insert
  to authenticated
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can update home about content" on public.home_about_content;
create policy "Admins can update home about content"
  on public.home_about_content for update
  to authenticated
  using ( (select public.is_admin()) )
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete home about content" on public.home_about_content;
create policy "Admins can delete home about content"
  on public.home_about_content for delete
  to authenticated
  using ( (select public.is_admin()) );

-- ============================================================================
-- SOURCE: 08_table_articles_presse.sql
-- ============================================================================
-- Table articles_presse - Articles de presse
-- Ordre: 08 - Table indépendante

drop table if exists public.articles_presse cascade;
create table public.articles_presse (
  id bigint generated always as identity primary key,
  title text not null,
  author text,
  type text,
  slug text,
  chapo text,
  excerpt text,
  source_publication text,
  source_url text,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector
);

comment on table public.articles_presse is 'press articles referencing shows or company news';

alter table public.articles_presse enable row level security;

-- NOTE: Granting SELECT to broad roles (anon/authenticated) was removed
-- to comply with CI security audit. If the SECURITY_INVOKER view requires
-- specific permissions for authenticated users, grant them explicitly in a
-- targeted migration (e.g. GRANT SELECT ON public.articles_presse TO authenticated;).

drop view if exists public.articles_presse_public cascade;
create view public.articles_presse_public
with (security_invoker = true)
as
select 
  id,
  title,
  author,
  type,
  slug,
  chapo,
  excerpt,
  source_publication,
  source_url,
  published_at,
  created_at
from public.articles_presse
where published_at is not null;

comment on view public.articles_presse_public is 
'Public view of published press articles - bypasses RLS issues with JWT signing keys. SECURITY INVOKER: Runs with querying user privileges (not definer). Used by anon/authenticated users to access published articles without triggering RLS policy evaluation delays.';

-- NOTE: Public grant removed. To allow authenticated users to read the
-- view, add an explicit GRANT to the 'authenticated' role in a controlled
-- migration after reviewing security implications.

-- Public can read only published articles
drop policy if exists "Public press articles are viewable by everyone" on public.articles_presse;
create policy "Public press articles are viewable by everyone"
on public.articles_presse
for select
to anon, authenticated
using ( published_at is not null );

-- Admins can read all articles (including drafts)
-- RESTRICTIVE policy: acts as OR gate for admin users
-- Performance: Avoids evaluating both permissive policies for authenticated users
drop policy if exists "Admins can view all press articles" on public.articles_presse;
create policy "Admins can view all press articles"
on public.articles_presse
as restrictive  -- RESTRICTIVE: admin users bypass public filter
for select
to authenticated
using ( (select public.is_admin()) );

-- Only admins can create articles
drop policy if exists "Admins can create press articles" on public.articles_presse;
create policy "Admins can create press articles"
on public.articles_presse
for insert
to authenticated
with check ( (select public.is_admin()) );

-- Only admins can update articles
drop policy if exists "Admins can update press articles" on public.articles_presse;
create policy "Admins can update press articles"
on public.articles_presse
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- Only admins can delete articles
drop policy if exists "Admins can delete press articles" on public.articles_presse;
create policy "Admins can delete press articles"
on public.articles_presse
for delete
to authenticated
using ( (select public.is_admin()) );

-- ============================================================================
-- SOURCE: 08b_communiques_presse.sql
-- ============================================================================
-- Table communiques_presse - Communiqués de presse (documents PDF)
-- Ordre: 08b - Après articles_presse mais avant partners

drop table if exists public.communiques_presse cascade;
create table public.communiques_presse (
  id bigint generated always as identity primary key,
  title text not null, -- Harmonisé avec articles_presse
  slug text,
  description text, -- Résumé/description 
  date_publication date not null,
  
  -- Image externe (URLs)
  image_url text, -- URL externe vers une image (alternative aux médias stockés)
  
  -- Relations avec autres entités (optionnel)
  spectacle_id bigint references public.spectacles(id) on delete set null,
  evenement_id bigint references public.evenements(id) on delete set null,
  
  -- Métadonnées pour espace presse professionnel
  ordre_affichage integer default 0, -- Pour tri personnalisé dans kit média
  public boolean default true, -- Visibilité publique
  file_size_bytes bigint, -- Taille du fichier pour affichage utilisateur
  
  -- Gestion standard
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Index et contraintes
  constraint communiques_slug_unique unique (slug)
);

-- Comments
comment on table public.communiques_presse is 'Communiqués de presse professionnels téléchargeables pour l''espace presse';
comment on column public.communiques_presse.title is 'Titre du communiqué (harmonisé avec articles_presse)';
comment on column public.communiques_presse.description is 'Description/résumé affiché dans la liste et kit média';
comment on column public.communiques_presse.image_url is 'URL externe vers une image (alternative aux médias stockés)';
comment on column public.communiques_presse.ordre_affichage is 'Ordre d''affichage personnalisé dans le kit média (0 = premier)';
comment on column public.communiques_presse.file_size_bytes is 'Taille du fichier pour affichage utilisateur (ex: "312 KB")';

-- Table contacts_presse - Gestion des contacts journalistes
drop table if exists public.contacts_presse cascade;
create table public.contacts_presse (
  id bigint generated always as identity primary key,
  nom text not null,
  prenom text,
  fonction text, -- Ex: "Journaliste culture", "Rédacteur en chef"
  media text not null, -- Nom du média/journal
  email text not null,
  telephone text,
  adresse text,
  ville text,
  specialites text[], -- Ex: ['théâtre', 'danse', 'musique']
  notes text, -- Notes internes
  actif boolean default true,
  derniere_interaction timestamptz,
  
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  constraint contacts_presse_email_unique unique (email)
);

comment on table public.contacts_presse is 'Base de données des contacts presse et journalistes';
comment on column public.contacts_presse.specialites is 'Domaines de spécialisation du journaliste';
comment on column public.contacts_presse.notes is 'Notes internes sur les interactions passées';

-- ===== ROW LEVEL SECURITY =====

-- ---- COMMUNIQUES PRESSE ----
alter table public.communiques_presse enable row level security;

-- Les communiqués publics sont visibles par tous
drop policy if exists "Public press releases are viewable by everyone" on public.communiques_presse;
create policy "Public press releases are viewable by everyone"
on public.communiques_presse
for select
to anon, authenticated
using ( public = true );

-- Les admins voient tous les communiqués
drop policy if exists "Admins can view all press releases" on public.communiques_presse;
create policy "Admins can view all press releases"
on public.communiques_presse
for select
to authenticated
using ( (select public.is_admin()) );

-- Seuls les admins peuvent gérer les communiqués
drop policy if exists "Admins can create press releases" on public.communiques_presse;
create policy "Admins can create press releases"
on public.communiques_presse
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update press releases" on public.communiques_presse;
create policy "Admins can update press releases"
on public.communiques_presse
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete press releases" on public.communiques_presse;
create policy "Admins can delete press releases"
on public.communiques_presse
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- CONTACTS PRESSE ----
alter table public.contacts_presse enable row level security;

-- Seuls les admins peuvent voir/gérer les contacts presse
drop policy if exists "Admins can view press contacts" on public.contacts_presse;
create policy "Admins can view press contacts"
on public.contacts_presse
for select
to authenticated
using ( (select public.is_admin()) );

-- Politiques granulaires pour la gestion
drop policy if exists "Admins can create press contacts" on public.contacts_presse;
create policy "Admins can create press contacts"
on public.contacts_presse
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update press contacts" on public.contacts_presse;
create policy "Admins can update press contacts"
on public.contacts_presse
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete press contacts" on public.contacts_presse;
create policy "Admins can delete press contacts"
on public.contacts_presse
for delete
to authenticated
using ( (select public.is_admin()) );

-- ===== VUES UTILITAIRES =====
-- Vues déplacées dans 41_views_communiques.sql (dépendent des tables de relations)

-- ============================================================================
-- SOURCE: 09_table_partners.sql
-- ============================================================================
-- Table partners - Partenaires de la compagnie
-- Ordre: 09 - Après les tables principales mais avant les tables de relations

drop table if exists public.partners cascade;
create table public.partners (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  website_url text,
  logo_url text, -- URL directe alternative (fallback si pas de media interne)
  logo_media_id bigint references public.medias(id) on delete set null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index pour l'ordre d'affichage et le statut actif
create index idx_partners_active_order on public.partners(is_active, display_order) where is_active = true;
create index idx_partners_created_by on public.partners(created_by);

-- Contraintes de validation
alter table public.partners 
add constraint check_website_url_format 
check (website_url is null or website_url ~* '^https?://.*$');

alter table public.partners 
add constraint check_display_order_positive 
check (display_order >= 0);

-- Comments pour documentation
comment on table public.partners is 'Liste des partenaires (nom, logo, url, visibilité, ordre d''affichage)';
comment on column public.partners.name is 'Nom du partenaire (obligatoire)';
comment on column public.partners.description is 'Description courte du partenaire (optionnel)';
comment on column public.partners.website_url is 'URL du site web du partenaire (format http/https)';
comment on column public.partners.logo_url is 'URL directe du logo (https) si non géré via medias';
comment on column public.partners.logo_media_id is 'Référence vers le logo dans la table medias';
comment on column public.partners.is_active is 'Partenaire actif (affiché sur le site)';
comment on column public.partners.display_order is 'Ordre d''affichage (0 = premier)';
comment on column public.partners.created_by is 'Utilisateur ayant créé le partenaire';

-- Vue partenaires_admin déplacée dans 41_views_admin_content_versions.sql (dépend de content_versions)

-- ============================================================================
-- SOURCE: 10_tables_system.sql
-- ============================================================================
-- Tables utilitaires - Tables système et configuration
-- Ordre: 09 - Tables indépendantes

-- Newsletter subscribers
drop table if exists public.abonnes_newsletter cascade;
create table public.abonnes_newsletter (
  id bigint generated always as identity primary key,
  email citext not null,
  subscribed boolean default true,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);
alter table public.abonnes_newsletter add constraint abonnes_email_unique unique (email);

-- Contact form messages  
drop table if exists public.messages_contact cascade;
create table public.messages_contact (
  id bigint generated always as identity primary key,
  firstname text,
  lastname text,
  email text not null,
  phone text, -- téléphone volontaire
  reason text not null, -- booking|partenariat|presse|education|technique|autre (valeurs FR normalisées)
  message text not null,
  consent boolean default false, -- consentement RGPD (newsletter ou réponse)
  consent_at timestamptz null, -- timestamp auto quand consent passe à true
  status text default 'nouveau' not null, -- nouveau|en_cours|traite|archive|spam
  processed boolean generated always as (status in ('traite','archive')) stored, -- compat legacy (dérivé)
  processed_at timestamptz null,
  spam_score numeric(5,2), -- score heuristique (optionnel)
  metadata jsonb default '{}'::jsonb, -- données supplémentaires (ip, user_agent)
  contact_presse_id bigint null references public.contacts_presse(id) on delete set null, -- association manuelle via back-office
  created_at timestamptz default now() not null
);

comment on table public.messages_contact is 'Messages issus du formulaire de contact (public). Ne stocke que les soumissions entrantes.';
comment on column public.messages_contact.firstname is 'Prénom saisi dans le formulaire de contact.';
comment on column public.messages_contact.lastname is 'Nom de famille saisi dans le formulaire de contact.';
comment on column public.messages_contact.reason is 'Motif du contact (booking|partenariat|presse|education|technique|autre) en français.';
comment on column public.messages_contact.consent is 'Indique si l''utilisateur a donné son consentement explicite.';
comment on column public.messages_contact.consent_at is 'Horodatage du consentement enregistré automatiquement.';
comment on column public.messages_contact.status is 'Workflow de traitement: nouveau|en_cours|traite|archive|spam';
comment on column public.messages_contact.processed is 'Champ dérivé: true si status final (traite, archive).';
comment on column public.messages_contact.contact_presse_id is 'Lien optionnel vers un contact presse existant (association manuelle back-office).';

-- Vue d'administration pour le suivi et le tri des messages de contact
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
drop view if exists public.messages_contact_admin cascade;
create view public.messages_contact_admin
with (security_invoker = true)
as
select
  mc.id,
  mc.created_at,
  now() - mc.created_at as age,
  mc.firstname,
  mc.lastname,
  trim(coalesce(mc.firstname,'') || ' ' || coalesce(mc.lastname,'')) as full_name,
  mc.email,
  mc.phone,
  mc.reason,
  mc.message,
  mc.status,
  mc.processed,
  mc.processed_at,
  case when mc.processed_at is not null then mc.processed_at - mc.created_at end as processing_latency,
  mc.consent,
  mc.consent_at,
  mc.spam_score,
  mc.metadata,
  mc.contact_presse_id,
  cp.nom as contact_presse_nom,
  cp.media as contact_presse_media,
    cp.fonction as contact_presse_role
from public.messages_contact mc
left join public.contacts_presse as cp on cp.id = mc.contact_presse_id;

comment on view public.messages_contact_admin is 'Vue pour l administration: suivi des messages, latences, association presse.';

-- Site configuration
drop table if exists public.configurations_site cascade;
create table public.configurations_site (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now() not null
);

-- Audit logs
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

comment on table public.abonnes_newsletter is 'newsletter subscribers';
comment on table public.messages_contact is 'contact form messages received from website';
comment on table public.configurations_site is 'key-value store for site-wide configuration';
comment on table public.logs_audit is 'audit log for create/update/delete operations on tracked tables';

-- ===== ROW LEVEL SECURITY =====

-- ---- ABONNES NEWSLETTER ----
alter table public.abonnes_newsletter enable row level security;

-- RGPD: Seuls les admins peuvent lire les emails des abonnés (donnée personnelle)
-- L'email ne doit pas être exposé publiquement
drop policy if exists "Admins can view newsletter subscribers" on public.abonnes_newsletter;
create policy "Admins can view newsletter subscribers"
on public.abonnes_newsletter
for select
to authenticated
using ( (select public.is_admin()) );

-- Tout le monde peut s'abonner à la newsletter (insertion uniquement)
-- L'API gère les doublons côté serveur avec ON CONFLICT DO NOTHING
drop policy if exists "Anyone can subscribe to newsletter" on public.abonnes_newsletter;
create policy "Anyone can subscribe to newsletter"
on public.abonnes_newsletter
for insert
to anon, authenticated
with check ( true );

-- Seuls les admins peuvent modifier les abonnements
drop policy if exists "Admins can update newsletter subscriptions" on public.abonnes_newsletter;
create policy "Admins can update newsletter subscriptions"
on public.abonnes_newsletter
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- Les abonnés peuvent se désabonner ou les admins peuvent supprimer
drop policy if exists "Subscribers can unsubscribe or admins can delete" on public.abonnes_newsletter;
create policy "Subscribers can unsubscribe or admins can delete"
on public.abonnes_newsletter
for delete
to anon, authenticated
using ( 
  -- Les admins peuvent tout supprimer
  (select public.is_admin()) 
  -- Ou l'utilisateur peut se désabonner via email (à implementer côté app)
);

-- ---- MESSAGES CONTACT ----
alter table public.messages_contact enable row level security;

-- RGPD: Seuls les admins peuvent lire les données personnelles (prénom, nom, email, téléphone)
-- Les messages de contact contiennent des informations sensibles qui ne doivent jamais être exposées publiquement
drop policy if exists "Admins can view contact messages" on public.messages_contact;
create policy "Admins can view contact messages"
on public.messages_contact
for select
to authenticated
using ( (select public.is_admin()) );

-- Tout le monde peut envoyer un message de contact
drop policy if exists "Anyone can send contact messages" on public.messages_contact;
create policy "Anyone can send contact messages"
on public.messages_contact
for insert
to anon, authenticated
with check ( true );

-- Seuls les admins peuvent modifier les messages
drop policy if exists "Admins can update contact messages" on public.messages_contact;
create policy "Admins can update contact messages"
on public.messages_contact
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- Seuls les admins peuvent supprimer les messages
drop policy if exists "Admins can delete contact messages" on public.messages_contact;
create policy "Admins can delete contact messages"
on public.messages_contact
for delete
to authenticated
using ( (select public.is_admin()) );

-- Validation applicative basique via contraintes CHECK (enum text simulé)
do $$
begin
  -- reason check
  if exists (select 1 from pg_constraint where conname = 'messages_contact_reason_check') then
    alter table public.messages_contact drop constraint messages_contact_reason_check;
  end if;
  alter table public.messages_contact add constraint messages_contact_reason_check
    check (reason in ('booking','partenariat','presse','education','technique','autre'));

  -- status check
  if exists (select 1 from pg_constraint where conname = 'messages_contact_status_check') then
    alter table public.messages_contact drop constraint messages_contact_status_check;
  end if;
  alter table public.messages_contact add constraint messages_contact_status_check
    check (status in ('nouveau','en_cours','traite','archive','spam'));
exception when others then
  raise notice 'Could not apply messages_contact checks: %', sqlerrm;
end;$$ language plpgsql;

-- ---- CONFIGURATIONS SITE ----
alter table public.configurations_site enable row level security;

-- Tout le monde peut voir les configurations publiques (selon convention de nommage)
drop policy if exists "Public site configurations are viewable by everyone" on public.configurations_site;
create policy "Public site configurations are viewable by everyone"
on public.configurations_site
for select
to anon, authenticated
using ( 
  -- Seules les configs dont la clé commence par 'public:' sont visibles pour tous
  key like 'public:%'
  -- Ou si l'utilisateur est admin, il peut voir toutes les configs
  or (select public.is_admin())
);

-- Seuls les admins peuvent gérer les configurations
drop policy if exists "Admins can create site configurations" on public.configurations_site;
create policy "Admins can create site configurations"
on public.configurations_site
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update site configurations" on public.configurations_site;
create policy "Admins can update site configurations"
on public.configurations_site
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete site configurations" on public.configurations_site;
create policy "Admins can delete site configurations"
on public.configurations_site
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- LOGS AUDIT ----
alter table public.logs_audit enable row level security;

-- Seuls les admins peuvent voir les logs d'audit
drop policy if exists "Admins can view audit logs" on public.logs_audit;
create policy "Admins can view audit logs"
on public.logs_audit
for select
to authenticated
using ( (select public.is_admin()) );

-- Le système peut insérer des logs (via triggers)
drop policy if exists "System can insert audit logs" on public.logs_audit;
create policy "System can insert audit logs"
on public.logs_audit
for insert
to anon, authenticated
with check ( true );

-- Seuls les super-admins peuvent modifier/supprimer les logs (rare)
drop policy if exists "Super admins can update audit logs" on public.logs_audit;
create policy "Super admins can update audit logs"
on public.logs_audit
for update
to authenticated
using ( 
  (select public.is_admin()) 
  and exists (
    select 1 
    from public.profiles as p 
    where p.user_id = (select auth.uid()) 
      and p.role = 'super_admin'
  )
)
with check ( 
  (select public.is_admin()) 
  and exists (
    select 1 
    from public.profiles as p 
    where p.user_id = (select auth.uid()) 
      and p.role = 'super_admin'
  )
);

drop policy if exists "Super admins can delete audit logs" on public.logs_audit;
create policy "Super admins can delete audit logs"
on public.logs_audit
for delete
to authenticated
using ( 
  (select public.is_admin()) 
  and exists (
    select 1 
    from public.profiles as p 
    where p.user_id = (select auth.uid()) 
      and p.role = 'super_admin'
  )
);

-- ============================================================================
-- SOURCE: 11_tables_relations.sql
-- ============================================================================
-- Tables de liaison - Relations many-to-many
-- Ordre: 10 - Dépend des tables principales

-- Spectacles <-> Membres équipe
drop table if exists public.spectacles_membres_equipe cascade;
create table public.spectacles_membres_equipe (
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  membre_id bigint not null references public.membres_equipe(id) on delete cascade,
  role text,
  primary key (spectacle_id, membre_id)
);

-- Spectacles <-> Medias
drop table if exists public.spectacles_medias cascade;
create table public.spectacles_medias (
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  media_id bigint not null references public.medias(id) on delete cascade,
  ordre smallint default 0,
  primary key (spectacle_id, media_id)
);

-- Articles <-> Medias
drop table if exists public.articles_medias cascade;
create table public.articles_medias (
  article_id bigint not null references public.articles_presse(id) on delete cascade,
  media_id bigint not null references public.medias(id) on delete cascade,
  ordre smallint default 0,
  primary key (article_id, media_id)
);

-- ===== TABLES DE RELATIONS COMMUNIQUES PRESSE =====

-- Liaison communiqués <-> medias (utilise la table médias existante)
drop table if exists public.communiques_medias cascade;
create table public.communiques_medias (
  communique_id bigint not null references public.communiques_presse(id) on delete cascade,
  media_id bigint not null references public.medias(id) on delete cascade,
  ordre smallint default 0, -- Ordre d'affichage. Convention : -1 = PDF principal, 0+ = images/autres médias
  primary key (communique_id, media_id)
);

comment on table public.communiques_medias is 'Relation many-to-many entre communiqués et médias. Ordre -1 pour le PDF principal obligatoire. CONTRAINTE : Chaque communiqué doit avoir exactement un PDF principal (ordre = -1).';
comment on column public.communiques_medias.ordre is 'Ordre d''affichage : -1 = PDF principal (obligatoire et unique), 0 = image principale, 1+ = médias secondaires';

-- ===== ROW LEVEL SECURITY POUR TABLES DE RELATIONS =====

-- Spectacles membres équipe relations
alter table public.spectacles_membres_equipe enable row level security;

drop policy if exists "Spectacle member relations are viewable by everyone" on public.spectacles_membres_equipe;
create policy "Spectacle member relations are viewable by everyone"
on public.spectacles_membres_equipe
for select
to anon, authenticated
using ( true );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert spectacle member relations" on public.spectacles_membres_equipe;
create policy "Admins can insert spectacle member relations"
on public.spectacles_membres_equipe
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update spectacle member relations" on public.spectacles_membres_equipe;
create policy "Admins can update spectacle member relations"
on public.spectacles_membres_equipe
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete spectacle member relations" on public.spectacles_membres_equipe;
create policy "Admins can delete spectacle member relations"
on public.spectacles_membres_equipe
for delete
to authenticated
using ( (select public.is_admin()) );

-- Spectacles medias relations
alter table public.spectacles_medias enable row level security;

drop policy if exists "Spectacle media relations are viewable by everyone" on public.spectacles_medias;
create policy "Spectacle media relations are viewable by everyone"
on public.spectacles_medias
for select
to anon, authenticated
using ( true );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert spectacle media relations" on public.spectacles_medias;
create policy "Admins can insert spectacle media relations"
on public.spectacles_medias
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update spectacle media relations" on public.spectacles_medias;
create policy "Admins can update spectacle media relations"
on public.spectacles_medias
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete spectacle media relations" on public.spectacles_medias;
create policy "Admins can delete spectacle media relations"
on public.spectacles_medias
for delete
to authenticated
using ( (select public.is_admin()) );

-- Articles medias relations
alter table public.articles_medias enable row level security;

drop policy if exists "Article media relations are viewable by everyone" on public.articles_medias;
create policy "Article media relations are viewable by everyone"
on public.articles_medias
for select
to anon, authenticated
using ( true );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert article media relations" on public.articles_medias;
create policy "Admins can insert article media relations"
on public.articles_medias
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update article media relations" on public.articles_medias;
create policy "Admins can update article media relations"
on public.articles_medias
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete article media relations" on public.articles_medias;
create policy "Admins can delete article media relations"
on public.articles_medias
for delete
to authenticated
using ( (select public.is_admin()) );

-- Communiques medias relations (RLS)
alter table public.communiques_medias enable row level security;

drop policy if exists "Press release media relations follow parent visibility" on public.communiques_medias;
create policy "Press release media relations follow parent visibility"
on public.communiques_medias
for select
to anon, authenticated
using ( 
  exists (
    select 1 
    from public.communiques_presse as cp 
    where cp.id = communique_id 
      and (cp.public = true or (select public.is_admin()))
  )
);

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert press release media relations" on public.communiques_medias;
create policy "Admins can insert press release media relations"
on public.communiques_medias
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update press release media relations" on public.communiques_medias;
create policy "Admins can update press release media relations"
on public.communiques_medias
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete press release media relations" on public.communiques_medias;
create policy "Admins can delete press release media relations"
on public.communiques_medias
for delete
to authenticated
using ( (select public.is_admin()) );

-- ============================================================================
-- SOURCE: 12_evenements_recurrence.sql
-- ============================================================================
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

  -- Vérifier que la règle commence par RRULE:
  if position('RRULE:' in upper(rule)) != 1 then
    return false;
  end if;

  -- Vérification basique de la présence de FREQ (obligatoire)
  if position('FREQ=' in upper(rule)) = 0 then
    return false;
  end if;

  -- Validation passée
  return true;
end;
$$;

comment on function public.validate_rrule(text) is 
'Validates basic RRULE format for event recurrence (RFC 5545). Marked IMMUTABLE since validation logic is deterministic - same input always produces same result, enabling use in check constraints.';

-- Contrainte de validation RRULE
alter table public.evenements 
add constraint check_valid_rrule 
check (recurrence_rule is null or public.validate_rrule(recurrence_rule));

-- Row Level Security pour events_recurrence (si la table existe)
-- Note: Cette section assume l'existence d'une table events_recurrence séparée
-- Si cette table n'existe pas, ces politiques peuvent être supprimées
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'events_recurrence') then
    -- Activer RLS sur events_recurrence
    execute 'alter table public.events_recurrence enable row level security';

    -- Tout le monde peut voir les récurrences des événements publics
    execute 'drop policy if exists "Event recurrences are viewable by everyone" on public.events_recurrence';
    execute 'create policy "Event recurrences are viewable by everyone"
    on public.events_recurrence
    for select
    to anon, authenticated
    using ( true )';

    -- Seuls les admins peuvent gérer les récurrences
    execute 'drop policy if exists "Admins can create event recurrences" on public.events_recurrence';
    execute 'create policy "Admins can create event recurrences"
    on public.events_recurrence
    for insert
    to authenticated
    with check ( (select public.is_admin()) )';

    execute 'drop policy if exists "Admins can update event recurrences" on public.events_recurrence';
    execute 'create policy "Admins can update event recurrences"
    on public.events_recurrence
    for update
    to authenticated
    using ( (select public.is_admin()) )
    with check ( (select public.is_admin()) )';

    execute 'drop policy if exists "Admins can delete event recurrences" on public.events_recurrence';
    execute 'create policy "Admins can delete event recurrences"
    on public.events_recurrence
    for delete
    to authenticated
    using ( (select public.is_admin()) )';
  end if;
end $$;

-- ============================================================================
-- SOURCE: 13_analytics_events.sql
-- ============================================================================
-- Création de la table analytics pour statistiques internes

drop table if exists public.analytics_events cascade;
create table public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz default now() not null,
  event_type text not null,
  entity_type text,
  entity_id bigint,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  pathname text,
  search_query text,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text
);

comment on table public.analytics_events is 'Événements analytiques internes (vues, clics, conversions, recherches)';
comment on column public.analytics_events.event_type is 'Type d''événement : page_view, click, search, download, etc.';
comment on column public.analytics_events.entity_type is 'Type d''entité : spectacle, article, media, etc.';
comment on column public.analytics_events.entity_id is 'ID de l''entité concernée';
comment on column public.analytics_events.session_id is 'Identifiant de session anonyme';
comment on column public.analytics_events.pathname is 'Chemin de la page visitée';
comment on column public.analytics_events.search_query is 'Terme de recherche si applicable';
comment on column public.analytics_events.metadata is 'Données supplémentaires au format JSON';
comment on column public.analytics_events.ip_address is 'Adresse IP (anonymisée)';
comment on column public.analytics_events.user_agent is 'User-Agent du navigateur';

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
  p_metadata jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  headers_json json;
  event_id bigint;
  v_session_id text;
  v_pathname text;
  v_entity_type text;
  v_entity_id bigint;
  v_search_query text;
  v_ip_address text;
  v_user_agent text;
begin
  -- Récupérer les headers HTTP
  headers_json := current_setting('request.headers', true)::json;
  
  -- Extraire les informations des métadonnées
  v_session_id := p_metadata->>'session_id';
  v_pathname := p_metadata->>'pathname';
  v_entity_type := p_metadata->>'entity_type';
  v_entity_id := (p_metadata->>'entity_id')::bigint;
  v_search_query := p_metadata->>'search_query';
  
  -- Extraire IP et User-Agent des headers
  v_ip_address := headers_json->'x-forwarded-for'->>0;
  v_user_agent := headers_json->>'user-agent';
  
  -- Insérer l'événement
  insert into public.analytics_events (
    event_type,
    entity_type,
    entity_id,
    user_id,
    session_id,
    pathname,
    search_query,
    metadata,
    ip_address,
    user_agent
  ) values (
    p_event_type,
    v_entity_type,
    v_entity_id,
    (select auth.uid()),
    v_session_id,
    v_pathname,
    v_search_query,
    p_metadata,
    v_ip_address,
    v_user_agent
  ) returning id into event_id;
  
  return event_id;
end;
$$;

-- Vue pour statistiques rapides
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
create or replace view public.analytics_summary
with (security_invoker = true)
as
select 
  event_type,
  entity_type,
  date_trunc('day', created_at) as event_date,
  count(*) as total_events,
  count(distinct user_id) as unique_users,
  count(distinct session_id) as unique_sessions
from public.analytics_events 
where created_at >= current_date - interval '30 days'
group by event_type, entity_type, date_trunc('day', created_at)
order by event_date desc, total_events desc;

comment on view public.analytics_summary is 'Vue résumé des statistiques analytiques sur 30 jours. SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

-- ============================================================================
-- SOURCE: 14_categories_tags.sql
-- ============================================================================
-- Système de tags et catégories pour contenus

-- Table des catégories
drop table if exists public.categories cascade;
create table public.categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null,
  description text,
  parent_id bigint references public.categories(id) on delete restrict,
  color text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now() not null
);

comment on table public.categories is 'Catégories hiérarchiques pour organiser les contenus';
comment on column public.categories.parent_id is 'Référence vers la catégorie parent pour hiérarchie';
comment on column public.categories.color is 'Code couleur hex (#RRGGBB) pour l''affichage';
comment on column public.categories.display_order is 'Ordre d''affichage dans l''interface';

-- Table des tags
drop table if exists public.tags cascade;
create table public.tags (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null,
  description text,
  usage_count integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) on delete set null,
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

-- Relations many-to-many : communiqués <-> catégories
drop table if exists public.communiques_categories cascade;
create table public.communiques_categories (
  communique_id bigint not null references public.communiques_presse(id) on delete cascade,
  category_id bigint not null references public.categories(id) on delete cascade,
  primary key (communique_id, category_id)
);

-- Relations many-to-many : communiqués <-> tags
drop table if exists public.communiques_tags cascade;
create table public.communiques_tags (
  communique_id bigint not null references public.communiques_presse(id) on delete cascade,
  tag_id bigint not null references public.tags(id) on delete cascade,
  primary key (communique_id, tag_id)
);

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
  if TG_OP = 'INSERT' then
    tag_id_to_update := NEW.tag_id;
    
    -- Incrémenter le compteur d'usage
    update public.tags 
    set usage_count = usage_count + 1 
    where id = tag_id_to_update;
    
  elsif TG_OP = 'DELETE' then
    tag_id_to_update := OLD.tag_id;
    
    -- Décrémenter le compteur d'usage
    update public.tags 
    set usage_count = greatest(0, usage_count - 1) 
    where id = tag_id_to_update;
  end if;
  
  return null; -- trigger AFTER ne retourne rien
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

-- RLS policies for communiqués relations
alter table public.communiques_categories enable row level security;

drop policy if exists "Press release categories follow parent visibility" on public.communiques_categories;
create policy "Press release categories follow parent visibility"
on public.communiques_categories
for select
to anon, authenticated
using (
  exists (
    select 1 from public.communiques_presse cp
    where cp.id = communique_id
    and (cp.public = true or (select public.is_admin()))
  )
);

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert press release categories" on public.communiques_categories;
create policy "Admins can insert press release categories"
on public.communiques_categories
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update press release categories" on public.communiques_categories;
create policy "Admins can update press release categories"
on public.communiques_categories
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete press release categories" on public.communiques_categories;
create policy "Admins can delete press release categories"
on public.communiques_categories
for delete
to authenticated
using ( (select public.is_admin()) );

alter table public.communiques_tags enable row level security;

drop policy if exists "Press release tags follow parent visibility" on public.communiques_tags;
create policy "Press release tags follow parent visibility"
on public.communiques_tags
for select
to anon, authenticated
using (
  exists (
    select 1 from public.communiques_presse cp
    where cp.id = communique_id
    and (cp.public = true or (select public.is_admin()))
  )
);

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert press release tags" on public.communiques_tags;
create policy "Admins can insert press release tags"
on public.communiques_tags
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update press release tags" on public.communiques_tags;
create policy "Admins can update press release tags"
on public.communiques_tags
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete press release tags" on public.communiques_tags;
create policy "Admins can delete press release tags"
on public.communiques_tags
for delete
to authenticated
using ( (select public.is_admin()) );

-- Vue pour naviguer dans les catégories avec hiérarchie
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
create or replace view public.categories_hierarchy
with (security_invoker = true)
as
with recursive category_tree as (
  -- Catégories racines
  select 
    id,
    name,
    slug,
    parent_id,
    0 as level,
    array[id] as path,
    name as full_path
  from public.categories
  where parent_id is null and is_active = true
  
  union all
  
  -- Catégories enfants
  select 
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    ct.level + 1 as level,
    ct.path || c.id as path,
    ct.full_path || ' > ' || c.name as full_path
  from public.categories c
  join category_tree ct on c.parent_id = ct.id
  where c.is_active = true
)
select 
  id,
  name,
  slug,
  parent_id,
  level,
  path,
  full_path
from category_tree
order by path;

comment on view public.categories_hierarchy is 'Vue hiérarchique des catégories avec niveaux et chemins complets. SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

-- Vue pour les tags populaires
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
create or replace view public.popular_tags
with (security_invoker = true)
as
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

comment on view public.popular_tags is 'Tags les plus utilisés, avec mise en avant des tags featured. SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

-- ============================================================================
-- SOURCE: 15_content_versioning.sql
-- ============================================================================
-- Système de versioning pour le contenu éditorial

drop table if exists public.content_versions cascade;
create table public.content_versions (
  id bigint generated always as identity primary key,
  entity_type text not null, -- 'spectacle', 'article_presse', etc.
  entity_id bigint not null,
  version_number integer not null,
  content_snapshot jsonb not null,
  change_summary text,
  change_type text not null, -- 'create', 'update', 'publish', 'unpublish', 'restore'
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) on delete set null,
  constraint content_versions_entity_version_unique unique (entity_type, entity_id, version_number)
);

comment on table public.content_versions is 'Historique des versions pour tous les contenus éditoriaux';
comment on column public.content_versions.entity_type is 'Type d''entité : spectacle, article_presse, communique_presse, membre_equipe, etc.';
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
  extracted_title text;
  version_id bigint;
begin
  -- Calculer le prochain numéro de version
  select coalesce(max(version_number), 0) + 1
  into next_version
  from public.content_versions
  where entity_type = p_entity_type and entity_id = p_entity_id;
  
  -- Extraire un title du snapshot si possible pour le résumé auto
  extracted_title := p_content_snapshot->>'title';
  if extracted_title is null then
    extracted_title := p_content_snapshot->>'name';
  end if;
  
  -- Générer un résumé automatique si non fourni
  if p_change_summary is null then
    p_change_summary := case
      when p_change_type = 'create' then 'Création initiale'
      when p_change_type = 'update' then 'Mise à jour'
      when p_change_type = 'publish' then 'Publication'
      when p_change_type = 'unpublish' then 'Dépublication'
      when p_change_type = 'restore' then 'Restauration depuis version antérieure'
      else 'Modification'
    end;
    
    if extracted_title is not null then
      p_change_summary := p_change_summary || ' - ' || extracted_title;
    end if;
  end if;
  
  -- Insérer la nouvelle version
  insert into public.content_versions (
    entity_type,
    entity_id,
    version_number,
    content_snapshot,
    change_summary,
    change_type,
    created_by
  ) values (
    p_entity_type,
    p_entity_id,
    next_version,
    p_content_snapshot,
    p_change_summary,
    p_change_type,
    (select auth.uid())
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
    change_summary_text := 'Création du spectacle: ' || NEW.title;
  else
    -- Utiliser le champ 'public' (boolean) au lieu de 'published_at'
    if OLD.public = false and NEW.public = true then
      change_type_value := 'publish';
      change_summary_text := 'Publication du spectacle: ' || NEW.title;
    elsif OLD.public = true and NEW.public = false then
      change_type_value := 'unpublish';
      change_summary_text := 'Dépublication du spectacle: ' || NEW.title;
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour du spectacle: ' || NEW.title;
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'spectacle',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
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
    change_summary_text := 'Création de l''article: ' || NEW.title;
  else
    if OLD.published_at is null and NEW.published_at is not null then
      change_type_value := 'publish';
      change_summary_text := 'Publication de l''article: ' || NEW.title;
    elsif OLD.published_at is not null and NEW.published_at is null then
      change_type_value := 'unpublish';
      change_summary_text := 'Dépublication de l''article: ' || NEW.title;
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour de l''article: ' || NEW.title;
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'article_presse',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$$;

-- Trigger function pour les communiqués de presse
create or replace function public.communiques_versioning_trigger()
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
    change_summary_text := 'Création du communiqué: ' || NEW.title;
  else
    if OLD.public = false and NEW.public = true then
      change_type_value := 'publish';
      change_summary_text := 'Publication du communiqué: ' || NEW.title;
    elsif OLD.public = true and NEW.public = false then
      change_type_value := 'unpublish';
      change_summary_text := 'Dépublication du communiqué: ' || NEW.title;
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour du communiqué: ' || NEW.title;
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'communique_presse',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$$;

-- Trigger function pour les membres de l'équipe
create or replace function public.membres_equipe_versioning_trigger()
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
  change_summary_text := 'Création membre équipe: ' || coalesce(NEW.name, '');
  else
    change_type_value := 'update';
  change_summary_text := 'Mise à jour membre équipe: ' || coalesce(NEW.name, '');
  end if;

  perform public.create_content_version(
    'membre_equipe',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$$;

-- Trigger function pour les événements
create or replace function public.evenements_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
  spectacle_title text;
begin
  -- Récupérer le titre du spectacle pour le résumé
  select title into spectacle_title 
  from public.spectacles 
  where id = NEW.spectacle_id;
  
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création d''événement pour: ' || coalesce(spectacle_title, 'Spectacle #' || NEW.spectacle_id);
  else
    if OLD.status != NEW.status then
      change_type_value := 'update';
      change_summary_text := 'Changement de statut (' || OLD.status || ' → ' || NEW.status || ') pour: ' || coalesce(spectacle_title, 'Spectacle #' || NEW.spectacle_id);
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour d''événement pour: ' || coalesce(spectacle_title, 'Spectacle #' || NEW.spectacle_id);
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'evenement',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
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

drop trigger if exists trg_communiques_versioning on public.communiques_presse;
create trigger trg_communiques_versioning
  after insert or update on public.communiques_presse
  for each row execute function public.communiques_versioning_trigger();

drop trigger if exists trg_membres_equipe_versioning on public.membres_equipe;
create trigger trg_membres_equipe_versioning
  after insert or update on public.membres_equipe
  for each row execute function public.membres_equipe_versioning_trigger();

drop trigger if exists trg_evenements_versioning on public.evenements;
create trigger trg_evenements_versioning
  after insert or update on public.evenements
  for each row execute function public.evenements_versioning_trigger();

-- Trigger function pour les partenaires
create or replace function public.partners_versioning_trigger()
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
    change_summary_text := 'Création partenaire: ' || coalesce(NEW.name, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour partenaire: ' || coalesce(NEW.name, '');
  end if;

  perform public.create_content_version(
    'partner',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$$;

drop trigger if exists trg_partners_versioning on public.partners;
create trigger trg_partners_versioning
  after insert or update on public.partners
  for each row execute function public.partners_versioning_trigger();

-- Trigger function pour les valeurs de la compagnie
create or replace function public.compagnie_values_versioning_trigger()
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
    change_summary_text := 'Création valeur compagnie: ' || coalesce(NEW.title, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour valeur compagnie: ' || coalesce(NEW.title, '');
  end if;

  perform public.create_content_version(
    'compagnie_value',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$$;

drop trigger if exists trg_compagnie_values_versioning on public.compagnie_values;
create trigger trg_compagnie_values_versioning
  after insert or update on public.compagnie_values
  for each row execute function public.compagnie_values_versioning_trigger();

-- Trigger function pour les statistiques de la compagnie
create or replace function public.compagnie_stats_versioning_trigger()
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
    change_summary_text := 'Création statistique compagnie: ' || coalesce(NEW.label, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour statistique compagnie: ' || coalesce(NEW.label, '');
  end if;

  perform public.create_content_version(
    'compagnie_stat',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$$;

drop trigger if exists trg_compagnie_stats_versioning on public.compagnie_stats;
create trigger trg_compagnie_stats_versioning
  after insert or update on public.compagnie_stats
  for each row execute function public.compagnie_stats_versioning_trigger();

-- Trigger function pour les sections de présentation compagnie
create or replace function public.compagnie_presentation_sections_versioning_trigger()
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
    change_summary_text := 'Création section présentation: ' || coalesce(NEW.slug, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour section présentation: ' || coalesce(NEW.slug, '');
  end if;

  perform public.create_content_version(
    'compagnie_presentation_section',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$$;

drop trigger if exists trg_compagnie_presentation_sections_versioning on public.compagnie_presentation_sections;
create trigger trg_compagnie_presentation_sections_versioning
  after insert or update on public.compagnie_presentation_sections
  for each row execute function public.compagnie_presentation_sections_versioning_trigger();

-- Vue pour consulter facilement l'historique d'une entité
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
create or replace view public.content_versions_detailed
with (security_invoker = true)
as
select 
  cv.id,
  cv.entity_type,
  cv.entity_id,
  cv.version_number,
  cv.change_type,
  cv.change_summary,
  cv.created_at,
  p.display_name as created_by_name,
  cv.created_by as created_by_id,
  char_length(cv.content_snapshot::text) as snapshot_size
from public.content_versions cv
left join public.profiles as p on cv.created_by = p.user_id
order by cv.entity_type, cv.entity_id, cv.version_number desc;

comment on view public.content_versions_detailed is 'Vue détaillée de l''historique des versions avec informations sur les auteurs. SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

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
  select 
    entity_type,
    entity_id,
    content_snapshot
  into version_record
  from public.content_versions
  where id = p_version_id;
  
  -- Vérifier que la version existe
  if version_record is null then
    return false;
  end if;
  
  -- Restaurer selon le type d'entité
  if version_record.entity_type = 'spectacle' then
    update public.spectacles
    set 
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      published_at = (version_record.content_snapshot->>'published_at')::timestamptz,
      public = (version_record.content_snapshot->>'public')::boolean,
      image_url = version_record.content_snapshot->>'image_url',
      updated_at = now()
      -- Autres champs à restaurer
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'article_presse' then
    update public.articles_presse
    set 
      title = version_record.content_snapshot->>'title',
      author = version_record.content_snapshot->>'author',
      type = version_record.content_snapshot->>'type',
      slug = version_record.content_snapshot->>'slug',
      chapo = version_record.content_snapshot->>'chapo',
      excerpt = version_record.content_snapshot->>'excerpt',
      source_publication = version_record.content_snapshot->>'source_publication',
      source_url = version_record.content_snapshot->>'source_url',
      published_at = (version_record.content_snapshot->>'published_at')::timestamptz,
      updated_at = now()
      -- Autres champs à restaurer
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'communique_presse' then
    update public.communiques_presse
    set 
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      date_publication = (version_record.content_snapshot->>'date_publication')::date,
      public = (version_record.content_snapshot->>'public')::boolean,
      ordre_affichage = (version_record.content_snapshot->>'ordre_affichage')::integer,
      file_size_bytes = (version_record.content_snapshot->>'file_size_bytes')::bigint,
      image_url = version_record.content_snapshot->>'image_url',
      updated_at = now()
      -- Note: Relations many-to-many (medias, categories, tags) non restaurées pour éviter incohérences
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'evenement' then
    update public.evenements
    set 
      spectacle_id = (version_record.content_snapshot->>'spectacle_id')::bigint,
      lieu_id = (version_record.content_snapshot->>'lieu_id')::bigint,
      date_debut = (version_record.content_snapshot->>'date_debut')::timestamptz,
      date_fin = (version_record.content_snapshot->>'date_fin')::timestamptz,
      capacity = (version_record.content_snapshot->>'capacity')::integer,
      price_cents = (version_record.content_snapshot->>'price_cents')::integer,
      status = version_record.content_snapshot->>'status',
      ticket_url = version_record.content_snapshot->>'ticket_url',
      image_url = version_record.content_snapshot->>'image_url',
      start_time = (version_record.content_snapshot->>'start_time')::time,
      end_time = (version_record.content_snapshot->>'end_time')::time,
      type_array = array(select jsonb_array_elements_text(version_record.content_snapshot->'type_array')),
      metadata = version_record.content_snapshot->'metadata',
      recurrence_rule = version_record.content_snapshot->>'recurrence_rule',
      recurrence_end_date = (version_record.content_snapshot->>'recurrence_end_date')::timestamptz,
      parent_event_id = (version_record.content_snapshot->>'parent_event_id')::bigint,
      updated_at = now()
    where id = version_record.entity_id;
    
    restore_success := found;
  elsif version_record.entity_type = 'membre_equipe' then
    update public.membres_equipe
    set 
      name = coalesce(version_record.content_snapshot->>'name', version_record.content_snapshot->>'nom'),
      role = version_record.content_snapshot->>'role',
      description = version_record.content_snapshot->>'description',
      image_url = version_record.content_snapshot->>'image_url',
      photo_media_id = (version_record.content_snapshot->>'photo_media_id')::bigint,
      ordre = (version_record.content_snapshot->>'ordre')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'partner' then
    update public.partners
    set
      name = version_record.content_snapshot->>'name',
      description = version_record.content_snapshot->>'description',
      website_url = version_record.content_snapshot->>'website_url',
      logo_url = version_record.content_snapshot->>'logo_url',
      logo_media_id = (version_record.content_snapshot->>'logo_media_id')::bigint,
      is_active = (version_record.content_snapshot->>'is_active')::boolean,
      display_order = (version_record.content_snapshot->>'display_order')::integer,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_value' then
    update public.compagnie_values
    set
      key = version_record.content_snapshot->>'key',
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_stat' then
    update public.compagnie_stats
    set
      key = version_record.content_snapshot->>'key',
      label = version_record.content_snapshot->>'label',
      value = version_record.content_snapshot->>'value',
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_presentation_section' then
    update public.compagnie_presentation_sections
    set
      slug = version_record.content_snapshot->>'slug',
      kind = version_record.content_snapshot->>'kind',
      title = version_record.content_snapshot->>'title',
      subtitle = version_record.content_snapshot->>'subtitle',
      content = case when version_record.content_snapshot ? 'content' then array(select jsonb_array_elements_text(version_record.content_snapshot->'content')) else null end,
      quote_text = version_record.content_snapshot->>'quote_text',
      quote_author = version_record.content_snapshot->>'quote_author',
      image_url = version_record.content_snapshot->>'image_url',
      image_media_id = (version_record.content_snapshot->>'image_media_id')::bigint,
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  end if;
  
  -- Si restauration réussie, créer une nouvelle version pour tracer l'opération
  if restore_success then
    perform public.create_content_version(
      version_record.entity_type,
      version_record.entity_id,
      version_record.content_snapshot,
      p_change_summary,
      'restore'
    );
  end if;
  
  return restore_success;
end;
$$;

-- ============================================================================
-- SOURCE: 16_seo_metadata.sql
-- ============================================================================
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
  old_path text not null,
  new_path text not null,
  redirect_type integer not null default 301,
  is_active boolean not null default true,
  hit_count integer not null default 0,
  last_hit_at timestamptz,
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now() not null
);

-- Ajouter une validation pour les redirections :
alter table public.seo_redirects 
add constraint check_different_paths 
check (old_path != new_path);

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
  url text not null,
  entity_type text,
  entity_id bigint,
  last_modified timestamptz not null default now(),
  change_frequency text check (change_frequency in ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
  priority decimal(3,2) check (priority >= 0.0 and priority <= 1.0),
  is_indexed boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.sitemap_entries is 'Entrées du sitemap XML généré dynamiquement';
comment on column public.sitemap_entries.priority is 'Priorité SEO de 0.0 à 1.0';
comment on column public.sitemap_entries.change_frequency is 'Fréquence de mise à jour pour les crawlers';

-- Index pour génération rapide du sitemap
create index idx_sitemap_entries_indexed on public.sitemap_entries(is_indexed) where is_indexed = true;
create index idx_sitemap_entries_last_modified on public.sitemap_entries(last_modified desc);

-- Fonction pour générer un slug SEO à partir d'un texte
create or replace function public.generate_slug(input_text text)
returns text
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  normalized_text text;
begin
  if input_text is null then
    return null;
  end if;
  
  -- Normaliser: minuscules, supprimer les accents, remplacer espaces/caractères spéciaux par des tirets
  normalized_text := lower(input_text);
  normalized_text := unaccent(normalized_text);
  normalized_text := regexp_replace(normalized_text, '[^a-z0-9]+', '-', 'g');
  normalized_text := regexp_replace(normalized_text, '^-+|-+$', '', 'g');
  
  return normalized_text;
end;
$$;

comment on function public.generate_slug(text) is 'Génère un slug SEO-friendly à partir d''un texte. Nécessite l''extension unaccent.';

-- Triggers pour auto-générer les slugs si non fournis
create or replace function public.set_slug_if_empty()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if NEW.slug is null or NEW.slug = '' then
    if TG_TABLE_NAME = 'spectacles' and NEW.title is not null then
      NEW.slug := public.generate_slug(NEW.title);
    elsif TG_TABLE_NAME = 'articles_presse' and NEW.title is not null then
      NEW.slug := public.generate_slug(NEW.title);
    elsif TG_TABLE_NAME = 'categories' and NEW.name is not null then
      NEW.slug := public.generate_slug(NEW.name);
    elsif TG_TABLE_NAME = 'tags' and NEW.name is not null then
      NEW.slug := public.generate_slug(NEW.name);
    end if;
  end if;
  
  return NEW;
end;
$$;

-- Ajouter les triggers pour les slugs auto
drop trigger if exists trg_spectacles_slug on public.spectacles;
create trigger trg_spectacles_slug
  before insert or update on public.spectacles
  for each row execute function public.set_slug_if_empty();

drop trigger if exists trg_articles_slug on public.articles_presse;
create trigger trg_articles_slug
  before insert or update on public.articles_presse
  for each row execute function public.set_slug_if_empty();

drop trigger if exists trg_categories_slug on public.categories;
create trigger trg_categories_slug
  before insert or update on public.categories
  for each row execute function public.set_slug_if_empty();

drop trigger if exists trg_tags_slug on public.tags;
create trigger trg_tags_slug
  before insert or update on public.tags
  for each row execute function public.set_slug_if_empty();

-- ============================================================================
-- SOURCE: 20_functions_core.sql
-- ============================================================================
-- Intentionally left empty.
-- Functions are now defined in 02b_functions_core.sql to satisfy ordering.

-- ============================================================================
-- SOURCE: 21_functions_auth_sync.sql
-- ============================================================================
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

-- ============================================================================
-- SOURCE: 30_triggers.sql
-- ============================================================================
-- Triggers - Application des triggers sur les tables
-- Ordre: 30 - Après les tables et fonctions

-- Triggers de synchronisation auth.users <-> profiles
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_user_deletion();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_update();

-- Triggers de mise à jour updated_at
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(array[
    'public.profiles', 'public.medias', 'public.membres_equipe', 'public.lieux',
    'public.spectacles', 'public.evenements', 'public.articles_presse', 
    'public.partners', 'public.abonnes_newsletter', 'public.messages_contact', 'public.configurations_site',
    'public.communiques_presse', 'public.contacts_presse', 'public.home_about_content'
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

-- Triggers d'audit
DO $$
DECLARE
  audit_tables text[] := array[
    'public.profiles', 'public.medias', 'public.membres_equipe', 'public.lieux',
    'public.spectacles', 'public.evenements', 'public.articles_presse', 
    'public.partners', 'public.abonnes_newsletter', 'public.messages_contact', 'public.configurations_site',
    'public.communiques_presse', 'public.contacts_presse', 'public.home_about_content'
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

-- ===== TRIGGERS SPÉCIALISÉS =====

-- Trigger consentement messages_contact (horodatage consent_at)
drop trigger if exists trg_messages_contact_consent on public.messages_contact;
create trigger trg_messages_contact_consent
  before insert or update on public.messages_contact
  for each row execute function public.set_messages_contact_consent_timestamp();

-- Triggers pour slug auto-généré
drop trigger if exists trg_communiques_slug on public.communiques_presse;
create trigger trg_communiques_slug
  before insert or update on public.communiques_presse
  for each row execute function public.set_slug_if_empty();

-- Triggers pour usage count des tags
drop trigger if exists trg_communiques_tags_usage_count on public.communiques_tags;
create trigger trg_communiques_tags_usage_count
  after insert or delete on public.communiques_tags
  for each row execute function public.update_tag_usage_count();

-- ============================================================================
-- SOURCE: 40_indexes.sql
-- ============================================================================
-- Index et optimisations
-- Ordre: 40 - Après les tables

-- Index de base
create index if not exists idx_medias_storage_path on public.medias (storage_path);
create index if not exists idx_profiles_user_id on public.profiles (user_id);
create index if not exists idx_spectacles_title on public.spectacles (title);
create index if not exists idx_articles_published_at on public.articles_presse (published_at);
-- Index partiel pour optimiser les lectures publiques (articles publiés uniquement)
create index if not exists idx_articles_published_at_public 
	on public.articles_presse (published_at desc)
	where published_at is not null;

-- Index date pour événements
create index if not exists idx_evenements_date_debut on public.evenements (date_debut);
create index if not exists idx_evenements_parent_event_id on public.evenements (parent_event_id);
create index if not exists idx_evenements_recurrence_end_date on public.evenements (recurrence_end_date);

-- Index pour nouveaux champs événements
create index if not exists idx_evenements_start_time on public.evenements (start_time);
create index if not exists idx_evenements_type_array on public.evenements using gin (type_array);
create index if not exists idx_evenements_spectacle_date on public.evenements (spectacle_id, date_debut);
create index if not exists idx_evenements_date_time on public.evenements (date_debut, start_time) where start_time is not null;

-- Index trigram pour recherche fuzzy
create index if not exists idx_spectacles_title_trgm on public.spectacles using gin (title gin_trgm_ops);
create index if not exists idx_articles_title_trgm on public.articles_presse using gin (title gin_trgm_ops);

-- Index pour optimiser les politiques RLS
create index if not exists idx_medias_uploaded_by on public.medias (uploaded_by);
create index if not exists idx_spectacles_created_by on public.spectacles (created_by);

-- ===== INDEX COMMUNIQUES PRESSE =====

-- Index pour communiqués de presse
create index if not exists idx_communiques_presse_date_publication on public.communiques_presse(date_publication desc);
create index if not exists idx_communiques_presse_public on public.communiques_presse(public) where public = true;
create index if not exists idx_communiques_presse_ordre on public.communiques_presse(ordre_affichage, date_publication desc);
create index if not exists idx_communiques_presse_spectacle_id on public.communiques_presse(spectacle_id);
create index if not exists idx_communiques_presse_created_by on public.communiques_presse(created_by);

-- Index pour contacts presse
create index if not exists idx_contacts_presse_media on public.contacts_presse(media);
create index if not exists idx_contacts_presse_actif on public.contacts_presse(actif) where actif = true;
create index if not exists idx_contacts_presse_specialites on public.contacts_presse using gin (specialites);

-- Index pour relations communiqués-medias
create index if not exists idx_communiques_medias_ordre on public.communiques_medias(communique_id, ordre);

-- Recherche full-text sur titre et description (harmonisé avec articles_presse)
create index if not exists idx_communiques_presse_search on public.communiques_presse using gin (
	to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, ''))
);
create index if not exists idx_spectacles_public on public.spectacles (public) where public = true;
create index if not exists idx_partners_is_active on public.partners (is_active) where is_active = true;
create index if not exists idx_categories_is_active on public.categories (is_active) where is_active = true;
create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_configurations_site_key_pattern on public.configurations_site (key) where key like 'public:%';

-- ===== INDEX MESSAGES CONTACT =====
create index if not exists idx_messages_contact_reason on public.messages_contact(reason);
create index if not exists idx_messages_contact_status on public.messages_contact(status);
create index if not exists idx_messages_contact_created_at on public.messages_contact(created_at desc);
create index if not exists idx_messages_contact_contact_presse on public.messages_contact(contact_presse_id) where contact_presse_id is not null;
-- Index partiel pour filtrage rapide des messages actifs (non terminés) dans dashboard
create index if not exists idx_messages_contact_status_actifs on public.messages_contact(status) where status in ('nouveau','en_cours');
-- Index partiel pour recherche des messages avec consentement explicite (ex: export ciblé)
create index if not exists idx_messages_contact_consent_true on public.messages_contact(id) where consent = true;

-- ============================================================================
-- SOURCE: 41_views_admin_content_versions.sql
-- ============================================================================
-- Vues d'administration dépendantes de content_versions
-- Ordre: 41 - après 15_content_versioning.sql

-- Membres équipe admin view
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
drop view if exists public.membres_equipe_admin cascade;
create or replace view public.membres_equipe_admin
with (security_invoker = true)
as
select 
  m.id,
  m.name,
  m.role,
  m.description,
  m.image_url,
  m.photo_media_id,
  m.ordre,
  m.active,
  m.created_at,
  m.updated_at,
  cv.version_number as last_version_number,
  cv.change_type as last_change_type,
  cv.created_at as last_version_created_at,
  vcount.total_versions
from public.membres_equipe m
left join lateral (
  select version_number, change_type, created_at
  from public.content_versions
  where entity_type = 'membre_equipe' and entity_id = m.id
  order by version_number desc
  limit 1
) cv on true
left join lateral (
  select count(*)::integer as total_versions
  from public.content_versions
  where entity_type = 'membre_equipe' and entity_id = m.id
) vcount on true;

comment on view public.membres_equipe_admin is 'Vue d''administration des membres avec métadonnées de versioning (dernière version et total). SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

-- Sections présentation admin view
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
drop view if exists public.compagnie_presentation_sections_admin cascade;
create or replace view public.compagnie_presentation_sections_admin
with (security_invoker = true)
as
select
  s.id,
  s.slug,
  s.kind,
  s.title,
  s.subtitle,
  s.content,
  s.quote_text,
  s.quote_author,
  s.image_url,
  s.image_media_id,
  s.position,
  s.active,
  s.created_at,
  s.updated_at,
  cv.version_number as last_version_number,
  cv.change_type as last_change_type,
  cv.created_at as last_version_created_at,
  vcount.total_versions
from public.compagnie_presentation_sections s
left join lateral (
  select version_number, change_type, created_at
  from public.content_versions
  where entity_type = 'compagnie_presentation_section' and entity_id = s.id
  order by version_number desc
  limit 1
) cv on true
left join lateral (
  select count(*)::integer as total_versions
  from public.content_versions
  where entity_type = 'compagnie_presentation_section' and entity_id = s.id
) vcount on true;

comment on view public.compagnie_presentation_sections_admin is 'Vue administration sections présentation avec métadonnées de versioning. SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

-- Partenaires admin view
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
drop view if exists public.partners_admin cascade;
create view public.partners_admin
with (security_invoker = true)
as
select
  p.id,
  p.name,
  p.description,
  p.website_url,
  p.logo_url,
  p.logo_media_id,
  p.is_active,
  p.display_order,
  p.created_by,
  p.created_at,
  p.updated_at,
  lv.version_number as last_version_number,
  lv.change_type as last_change_type,
  lv.created_at as last_version_created_at
from public.partners p
left join lateral (
  select version_number, change_type, created_at
  from public.content_versions cv
  where cv.entity_type = 'partner' and cv.entity_id = p.id
  order by version_number desc
  limit 1
) lv on true;

comment on view public.partners_admin is 'Vue administration partenaires incluant métadonnées versioning. SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

-- ============================================================================
-- SOURCE: 41_views_communiques.sql
-- ============================================================================
-- Vues Communiqués de presse dépendantes des relations
-- Ordre: 41 - après 11_tables_relations.sql

-- Vue publique communiqués
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
drop view if exists public.communiques_presse_public cascade;
create or replace view public.communiques_presse_public
with (security_invoker = true)
as
select 
  cp.id,
  cp.title,
  cp.slug,
  cp.description,
  cp.date_publication,
  cp.ordre_affichage,
  cp.spectacle_id,
  cp.evenement_id,
  pdf_m.filename as pdf_filename,
  cp.file_size_bytes,
  case 
    when cp.file_size_bytes is not null then 
      case 
        when cp.file_size_bytes < 1024 then cp.file_size_bytes::text || ' B'
        when cp.file_size_bytes < 1048576 then round(cp.file_size_bytes / 1024.0, 1)::text || ' KB'
        else round(cp.file_size_bytes / 1048576.0, 1)::text || ' MB'
      end
    else pdf_m.size_bytes::text
  end as file_size_display,
  pdf_m.storage_path as pdf_path,
  concat('/storage/v1/object/public/', pdf_m.storage_path) as file_url,
  cp.image_url,
  cm.ordre as image_ordre,
  im.filename as image_filename,
  im.storage_path as image_path,
  concat('/storage/v1/object/public/', im.storage_path) as image_file_url,
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  l.nom as lieu_nom,
  array_agg(distinct c.name) filter (where c.name is not null) as categories,
  array_agg(distinct t.name) filter (where t.name is not null) as tags
from public.communiques_presse as cp
left join public.communiques_medias as pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1
left join public.medias as pdf_m on pdf_cm.media_id = pdf_m.id
left join public.communiques_medias as cm on cp.id = cm.communique_id and cm.ordre = 0
left join public.medias as im on cm.media_id = im.id
left join public.spectacles as s on cp.spectacle_id = s.id
left join public.evenements as e on cp.evenement_id = e.id
left join public.lieux as l on e.lieu_id = l.id
left join public.communiques_categories as cc on cp.id = cc.communique_id
left join public.categories as c on cc.category_id = c.id and c.is_active = true
left join public.communiques_tags as ct on cp.id = ct.communique_id
left join public.tags as t on ct.tag_id = t.id
where cp.public = true
  and exists (
    select 1 
    from public.communiques_medias as pdf_check 
    where pdf_check.communique_id = cp.id 
      and pdf_check.ordre = -1
  )
group by cp.id, pdf_m.filename, pdf_m.size_bytes, pdf_m.storage_path, 
         cm.ordre, im.filename, im.storage_path, cp.image_url,
         s.title, e.date_debut, l.nom
order by cp.ordre_affichage asc, cp.date_publication desc;

comment on view public.communiques_presse_public is 
'Vue publique optimisée pour l''espace presse professionnel avec URLs de téléchargement, images et catégories. Exclut les communiqués sans PDF principal. SECURITY INVOKER: Runs with querying user privileges (not definer).';

-- Vue dashboard admin
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
drop view if exists public.communiques_presse_dashboard cascade;
create or replace view public.communiques_presse_dashboard
with (security_invoker = true)
as
select 
  cp.id,
  cp.title,
  cp.slug,
  cp.description,
  cp.date_publication,
  cp.public,
  cp.ordre_affichage,
  pdf_m.filename as pdf_filename,
  round(coalesce(cp.file_size_bytes, pdf_m.size_bytes) / 1024.0, 2) as pdf_size_kb,
  cp.image_url,
  im.filename as image_filename,
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  p.display_name as createur,
  cp.created_at,
  cp.updated_at,
  count(cc.category_id) as nb_categories,
  count(ct.tag_id) as nb_tags
from public.communiques_presse as cp
left join public.communiques_medias as pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1
left join public.medias as pdf_m on pdf_cm.media_id = pdf_m.id
left join public.communiques_medias as cm on cp.id = cm.communique_id and cm.ordre = 0
left join public.medias as im on cm.media_id = im.id
left join public.spectacles as s on cp.spectacle_id = s.id
left join public.evenements as e on cp.evenement_id = e.id
left join public.profiles as p on cp.created_by = p.user_id
left join public.communiques_categories as cc on cp.id = cc.communique_id
left join public.communiques_tags as ct on cp.id = ct.communique_id
group by cp.id, pdf_m.filename, pdf_m.size_bytes, im.filename, cp.image_url,
         s.title, e.date_debut, p.display_name
order by cp.created_at desc;

comment on view public.communiques_presse_dashboard is 
'Vue dashboard admin pour la gestion des communiqués avec statistiques et gestion des images. SECURITY INVOKER: Runs with querying user privileges (not definer), protected by RLS on base tables.';

-- ============================================================================
-- SOURCE: 50_constraints.sql
-- ============================================================================
-- Contraintes et validations
-- Ordre: 50 - Après les tables et index

-- Contraintes de validation pour profiles.role
do $$
begin
  if exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public' and t.relname = 'profiles' and c.conname = 'profiles_role_check'
  ) then
    execute 'alter table public.profiles drop constraint profiles_role_check';
  end if;
  
  execute 'alter table public.profiles add constraint profiles_role_check check (role in (''user'',''editor'',''admin''))';
exception when others then
  raise notice 'Could not add profiles_role_check: %', sqlerrm;
end;
$$ language plpgsql;

-- Contraintes pour evenements.status
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
  
  execute 'alter table public.evenements alter column status set default ''planifie''';
  execute 'alter table public.evenements add constraint evenements_status_check check (status in (''planifie'',''confirme'',''complet'',''annule'',''reporte'',''scheduled'',''confirmed'',''sold_out'',''cancelled'',''postponed''))';
exception when others then
  raise notice 'Could not add evenements_status_check: %', sqlerrm;
end;
$$ language plpgsql;

-- Contrainte anti-récursion pour événements
alter table public.evenements 
drop constraint if exists check_no_self_parent;
alter table public.evenements 
add constraint check_no_self_parent 
check (parent_event_id != id or parent_event_id is null);

-- ===== CONTRAINTES POUR EVENEMENTS - NOUVEAUX CHAMPS =====

-- Contraintes de validation pour ticket_url (format URL)
alter table public.evenements 
drop constraint if exists check_ticket_url_format;
alter table public.evenements 
add constraint check_ticket_url_format 
check (ticket_url is null or ticket_url ~* '^https?://.*$');

-- Contraintes de validation pour image_url (format URL)
alter table public.evenements 
drop constraint if exists check_image_url_format;
alter table public.evenements 
add constraint check_image_url_format 
check (image_url is null or image_url ~* '^https?://.*$');

-- Contrainte pour s'assurer que start_time <= end_time quand les deux sont définis
alter table public.evenements 
drop constraint if exists check_start_end_time_order;
alter table public.evenements 
add constraint check_start_end_time_order 
check (start_time is null or end_time is null or start_time <= end_time);

-- Contrainte pour valider les types d'événements
alter table public.evenements 
drop constraint if exists check_valid_event_types;
alter table public.evenements 
add constraint check_valid_event_types 
check (
  type_array is null
  or type_array <@ ARRAY[
    'spectacle', 'première', 'premiere', 'atelier', 'workshop',
    'rencontre', 'conference', 'masterclass', 'répétition', 'repetition',
    'audition', 'casting', 'formation', 'residency', 'résidence'
  ]::text[]
);

comment on constraint check_ticket_url_format on public.evenements is 'URL de billetterie doit être au format http/https';
comment on constraint check_image_url_format on public.evenements is 'URL d''image doit être au format http/https';
comment on constraint check_start_end_time_order on public.evenements is 'L''heure de début doit être antérieure à l''heure de fin';
comment on constraint check_valid_event_types on public.evenements is 'Types d''événements limités à une liste prédéfinie';

-- ===== CONTRAINTES POUR MEMBRES EQUIPE =====

-- Contrainte de validation pour membres_equipe.image_url (format URL http/https)
-- Mise à jour: renforcement pattern pour extensions d'images courantes (jpg|jpeg|png|webp|gif|avif|svg)
alter table public.membres_equipe 
drop constraint if exists membres_equipe_image_url_format;
alter table public.membres_equipe 
add constraint membres_equipe_image_url_format 
check (
  image_url is null or 
  image_url ~* '^https?://[A-Za-z0-9._~:/?#%\-@!$&''()*+,;=]+\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?(#.*)?$'
);

comment on constraint membres_equipe_image_url_format on public.membres_equipe is 'URL d''image externe doit être au format http/https';

-- ===== CONTRAINTES POUR PARTNERS =====

-- Contrainte format URL simple pour logo_url (externe) avec extensions images fréquentes facultatives
alter table public.partners 
drop constraint if exists partners_logo_url_format;
alter table public.partners 
add constraint partners_logo_url_format
check (
  logo_url is null or 
  logo_url ~* '^https?://[A-Za-z0-9._~:/?#%\-@!$&''()*+,;=]+'
);

comment on constraint partners_logo_url_format on public.partners is 'URL externe du logo doit être http/https';

-- ===== CONTRAINTES POUR COMMUNIQUES DE PRESSE =====

-- Fonction pour vérifier qu'un communiqué a un PDF principal
create or replace function public.check_communique_has_pdf()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  pdf_count integer;
begin
  -- Compter les PDFs principaux (ordre = -1) pour ce communiqué
  select count(*)
  into pdf_count
  from public.communiques_medias cm
  where cm.communique_id = coalesce(NEW.communique_id, OLD.communique_id)
    and cm.ordre = -1;

  -- INSERT: empêcher l'ajout d'un second PDF principal
  if TG_OP = 'INSERT' then
    if NEW.ordre = -1 and pdf_count >= 1 then
      raise exception 'Un communiqué ne peut avoir qu''un seul PDF principal (ordre = -1). PDF principal déjà existant.';
    end if;
    return NEW;
  end if;

  -- UPDATE: gérer les transitions vers/depuis ordre = -1
  if TG_OP = 'UPDATE' then
    -- Passage vers ordre = -1: vérifier qu''il n''en existe pas déjà un autre
    if NEW.ordre = -1 and coalesce(OLD.ordre, 0) <> -1 then
      if pdf_count >= 1 then
        raise exception 'Un communiqué ne peut avoir qu''un seul PDF principal (ordre = -1). PDF principal déjà existant.';
      end if;
    end if;

    -- Passage de -1 vers autre valeur: s''assurer qu''il en reste au moins un
    if OLD.ordre = -1 and NEW.ordre <> -1 then
      if pdf_count <= 1 then
        raise exception 'Impossible de modifier le PDF principal: il doit en rester un (ordre = -1).';
      end if;
    end if;
    return NEW;
  end if;

  -- DELETE: empêcher la suppression du dernier PDF principal
  if TG_OP = 'DELETE' then
    if OLD.ordre = -1 and pdf_count <= 1 then
      raise exception 'Impossible de supprimer le dernier PDF principal du communiqué. Un communiqué doit toujours avoir un PDF principal (ordre = -1).';
    end if;
    return OLD;
  end if;
end;
$$;

-- Trigger pour valider l'obligation du PDF principal
drop trigger if exists trg_check_communique_pdf on public.communiques_medias;
create trigger trg_check_communique_pdf
  before insert or update or delete on public.communiques_medias
  for each row
  execute function public.check_communique_has_pdf();

-- Contrainte CHECK pour s'assurer que l'ordre -1 est réservé aux PDFs
alter table public.communiques_medias 
drop constraint if exists check_pdf_order_constraint;
alter table public.communiques_medias 
add constraint check_pdf_order_constraint
check (
  (ordre = -1) or (ordre >= 0)
);

comment on constraint check_pdf_order_constraint on public.communiques_medias is 'Ordre -1 réservé au PDF principal, 0+ pour autres médias';

-- Fonction pour vérifier qu'un communiqué peut être créé (appelée par l'application)
create or replace function public.validate_communique_creation(p_communique_id bigint)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  pdf_count integer;
begin
  -- Vérifier qu'il y a exactement un PDF principal
  select count(*)
  into pdf_count
  from public.communiques_medias cm
  where cm.communique_id = p_communique_id
    and cm.ordre = -1;
    
  return pdf_count = 1;
end;
$$;

comment on function public.validate_communique_creation(bigint) is 'Valide qu''un communiqué a exactement un PDF principal avant publication';

-- ============================================================================
-- SOURCE: 60_rls_profiles.sql
-- ============================================================================
-- Row Level Security Policies - Profiles
-- Ordre: 60 - Après toutes les structures

alter table public.profiles enable row level security;

-- Lecture publique des profils
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles
for select
to anon, authenticated
using ( true );

-- Insertion : utilisateurs peuvent créer leur propre profil
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check ( (select auth.uid()) = user_id );

-- Mise à jour : propriétaires peuvent modifier leur profil
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

-- Suppression : propriétaires peuvent supprimer leur profil
drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using ( (select auth.uid()) = user_id );

-- ============================================================================
-- SOURCE: 61_rls_main_tables.sql
-- ============================================================================
-- Row Level Security Policies - Tables principales
-- Ordre: 61 - RLS pour medias, spectacles, events, etc.

-- ---- MEDIAS ----
alter table public.medias enable row level security;

drop policy if exists "Medias are viewable by everyone" on public.medias;
create policy "Medias are viewable by everyone"
on public.medias
for select
to anon, authenticated
using ( true );

drop policy if exists "Authenticated users can insert medias" on public.medias;
create policy "Authenticated users can insert medias"
on public.medias
for insert
to authenticated
with check ( (select auth.uid()) is not null );

drop policy if exists "Uploaders or admins can update medias" on public.medias;
create policy "Uploaders or admins can update medias"
on public.medias
for update
to authenticated
using ( uploaded_by = (select auth.uid()) or (select public.is_admin()) )
with check ( uploaded_by = (select auth.uid()) or (select public.is_admin()) );

drop policy if exists "Uploaders or admins can delete medias" on public.medias;
create policy "Uploaders or admins can delete medias"
on public.medias
for delete
to authenticated
using ( uploaded_by = (select auth.uid()) or (select public.is_admin()) );

-- ---- SPECTACLES ----
alter table public.spectacles enable row level security;

drop policy if exists "Public spectacles are viewable by everyone" on public.spectacles;
create policy "Public spectacles are viewable by everyone"
on public.spectacles
for select
to anon, authenticated
using ( public = true );

create policy "Admins can view all spectacles"
on public.spectacles
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
    and role = 'admin'
  )
);

drop policy if exists "Authenticated users can create spectacles" on public.spectacles;
create policy "Admins can create spectacles"
on public.spectacles
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
    and role = 'admin'
  )
);

drop policy if exists "Owners or admins can update spectacles" on public.spectacles;
create policy "Owners or admins can update spectacles"
on public.spectacles
for update
to authenticated
using (
  (created_by = (select auth.uid()))
  or exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
    and role = 'admin'
  )
)
with check (
  (created_by = (select auth.uid()))
  or exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
    and role = 'admin'
  )
);

drop policy if exists "Owners or admins can delete spectacles" on public.spectacles;
create policy "Owners or admins can delete spectacles"
on public.spectacles
for delete
to authenticated
using (
  (created_by = (select auth.uid()))
  or exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
    and role = 'admin'
  )
);

-- ---- EVENEMENTS ----
alter table public.evenements enable row level security;

drop policy if exists "Events are viewable by everyone" on public.evenements;
create policy "Events are viewable by everyone"
on public.evenements
for select
to anon, authenticated
using ( true );

drop policy if exists "Admins can create events" on public.evenements;
create policy "Admins can create events"
on public.evenements
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update events" on public.evenements;
create policy "Admins can update events"
on public.evenements
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete events" on public.evenements;
create policy "Admins can delete events"
on public.evenements
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- PARTNERS ----
alter table public.partners enable row level security;

drop policy if exists "Public partners are viewable by anyone" on public.partners;
create policy "Public partners are viewable by anyone"
on public.partners
for select
to authenticated, anon
using ( is_active = true );

drop policy if exists "Admins can view all partners" on public.partners;
create policy "Admins can view all partners"
on public.partners
for select
to authenticated
using ( (select public.is_admin()) );

drop policy if exists "Admins can create partners" on public.partners;
create policy "Admins can create partners"
on public.partners
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update partners" on public.partners;
create policy "Admins can update partners"
on public.partners
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete partners" on public.partners;
create policy "Admins can delete partners"
on public.partners
for delete
to authenticated
using ( (select public.is_admin()) );

-- ============================================================================
-- SOURCE: 62_rls_advanced_tables.sql
-- ============================================================================
-- Row Level Security Policies - Nouvelles tables
-- Ordre: 62 - RLS pour analytics, categories, tags, content_versions, etc.

-- ---- ANALYTICS EVENTS ----
alter table public.analytics_events enable row level security;

-- Les administrateurs peuvent voir les événements analytiques
drop policy if exists "Admins can view analytics events" on public.analytics_events;
create policy "Admins can view analytics events"
on public.analytics_events
for select
to authenticated
using ( (select public.is_admin()) );

-- Tout le monde peut insérer des événements analytiques
drop policy if exists "Anyone can insert analytics events" on public.analytics_events;
create policy "Anyone can insert analytics events"
on public.analytics_events
for insert
to anon, authenticated
with check ( true );

-- Seuls les admins peuvent modifier/supprimer
drop policy if exists "Admins can update analytics events" on public.analytics_events;
create policy "Admins can update analytics events"
on public.analytics_events
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete analytics events" on public.analytics_events;
create policy "Admins can delete analytics events"
on public.analytics_events
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- CATEGORIES ----
alter table public.categories enable row level security;

-- Tout le monde peut voir les catégories actives
drop policy if exists "Active categories are viewable by everyone" on public.categories;
create policy "Active categories are viewable by everyone"
on public.categories
for select
to anon, authenticated
using ( is_active = true );

-- Les admins peuvent voir toutes les catégories
drop policy if exists "Admins can view all categories" on public.categories;
create policy "Admins can view all categories"
on public.categories
for select
to authenticated
using ( (select public.is_admin()) );

-- Seuls les admins peuvent gérer les catégories
drop policy if exists "Admins can create categories" on public.categories;
create policy "Admins can create categories"
on public.categories
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
on public.categories
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
on public.categories
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- TAGS ----
alter table public.tags enable row level security;

-- Tout le monde peut voir les tags
drop policy if exists "Tags are viewable by everyone" on public.tags;
create policy "Tags are viewable by everyone"
on public.tags
for select
to anon, authenticated
using ( true );

-- Seuls les admins peuvent gérer les tags
drop policy if exists "Admins can create tags" on public.tags;
create policy "Admins can create tags"
on public.tags
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update tags" on public.tags;
create policy "Admins can update tags"
on public.tags
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete tags" on public.tags;
create policy "Admins can delete tags"
on public.tags
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- TABLES DE RELATIONS (TAGS/CATEGORIES) ----
-- spectacles_categories
alter table public.spectacles_categories enable row level security;
drop policy if exists "Spectacle category relations are viewable by everyone" on public.spectacles_categories;
create policy "Spectacle category relations are viewable by everyone"
on public.spectacles_categories
for select
to anon, authenticated
using ( true );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert spectacle categories" on public.spectacles_categories;
create policy "Admins can insert spectacle categories"
on public.spectacles_categories
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update spectacle categories" on public.spectacles_categories;
create policy "Admins can update spectacle categories"
on public.spectacles_categories
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete spectacle categories" on public.spectacles_categories;
create policy "Admins can delete spectacle categories"
on public.spectacles_categories
for delete
to authenticated
using ( (select public.is_admin()) );

-- spectacles_tags
alter table public.spectacles_tags enable row level security;
drop policy if exists "Spectacle tag relations are viewable by everyone" on public.spectacles_tags;
create policy "Spectacle tag relations are viewable by everyone"
on public.spectacles_tags
for select
to anon, authenticated
using ( true );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert spectacle tags" on public.spectacles_tags;
create policy "Admins can insert spectacle tags"
on public.spectacles_tags
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update spectacle tags" on public.spectacles_tags;
create policy "Admins can update spectacle tags"
on public.spectacles_tags
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete spectacle tags" on public.spectacles_tags;
create policy "Admins can delete spectacle tags"
on public.spectacles_tags
for delete
to authenticated
using ( (select public.is_admin()) );

-- articles_categories
alter table public.articles_categories enable row level security;
drop policy if exists "Article category relations are viewable by everyone" on public.articles_categories;
create policy "Article category relations are viewable by everyone"
on public.articles_categories
for select
to anon, authenticated
using ( true );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert article categories" on public.articles_categories;
create policy "Admins can insert article categories"
on public.articles_categories
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update article categories" on public.articles_categories;
create policy "Admins can update article categories"
on public.articles_categories
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete article categories" on public.articles_categories;
create policy "Admins can delete article categories"
on public.articles_categories
for delete
to authenticated
using ( (select public.is_admin()) );

-- articles_tags
alter table public.articles_tags enable row level security;
drop policy if exists "Article tag relations are viewable by everyone" on public.articles_tags;
create policy "Article tag relations are viewable by everyone"
on public.articles_tags
for select
to anon, authenticated
using ( true );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert article tags" on public.articles_tags;
create policy "Admins can insert article tags"
on public.articles_tags
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update article tags" on public.articles_tags;
create policy "Admins can update article tags"
on public.articles_tags
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete article tags" on public.articles_tags;
create policy "Admins can delete article tags"
on public.articles_tags
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- CONTENT VERSIONS ----
alter table public.content_versions enable row level security;

-- Seuls les admins peuvent voir les versions de contenu
drop policy if exists "Admins can view content versions" on public.content_versions;
create policy "Admins can view content versions"
on public.content_versions
for select
to authenticated
using ( (select public.is_admin()) );

-- Les utilisateurs authentifiés peuvent créer des versions (via triggers)
drop policy if exists "Authenticated users can create content versions" on public.content_versions;
create policy "Authenticated users can create content versions"
on public.content_versions
for insert
to authenticated
with check ( (select auth.uid()) is not null );

-- Seuls les admins peuvent modifier/supprimer des versions
drop policy if exists "Admins can update content versions" on public.content_versions;
create policy "Admins can update content versions"
on public.content_versions
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete content versions" on public.content_versions;
create policy "Admins can delete content versions"
on public.content_versions
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- SEO REDIRECTS ----
alter table public.seo_redirects enable row level security;

-- Seuls les admins peuvent voir/gérer les redirections
drop policy if exists "Admins can view SEO redirects" on public.seo_redirects;
create policy "Admins can view SEO redirects"
on public.seo_redirects
for select
to authenticated
using ( (select public.is_admin()) );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert SEO redirects" on public.seo_redirects;
create policy "Admins can insert SEO redirects"
on public.seo_redirects
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update SEO redirects" on public.seo_redirects;
create policy "Admins can update SEO redirects"
on public.seo_redirects
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete SEO redirects" on public.seo_redirects;
create policy "Admins can delete SEO redirects"
on public.seo_redirects
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- SITEMAP ENTRIES ----
alter table public.sitemap_entries enable row level security;

-- Tout le monde peut voir les entrées du sitemap
drop policy if exists "Sitemap entries are viewable by everyone" on public.sitemap_entries;
create policy "Sitemap entries are viewable by everyone"
on public.sitemap_entries
for select
to anon, authenticated
using ( is_indexed = true );

-- Seuls les admins peuvent gérer le sitemap
-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert sitemap entries" on public.sitemap_entries;
create policy "Admins can insert sitemap entries"
on public.sitemap_entries
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update sitemap entries" on public.sitemap_entries;
create policy "Admins can update sitemap entries"
on public.sitemap_entries
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete sitemap entries" on public.sitemap_entries;
create policy "Admins can delete sitemap entries"
on public.sitemap_entries
for delete
to authenticated
using ( (select public.is_admin()) );

-- ============================================================================
-- SOURCE: 63_reorder_team_members.sql
-- ============================================================================
-- 63_reorder_team_members.sql
--
-- Purpose: provide an atomic, server-side operation to reorder rows in
-- the `public.membres_equipe` table. this function accepts a jsonb array of
-- objects with shape {"id": <int>, "ordre": <int>} and applies all updates
-- in a single transaction. it performs input validation, rejects duplicates,
-- and acquires a transaction-scoped advisory lock to avoid concurrent
-- reordering races.
--
-- Affected objects:
--  - public.reorder_team_members(jsonb) function
--  - public.membres_equipe table (updates ordre column)
--
-- Usage (from supabase/dal):
--   select public.reorder_team_members('[{"id":12,"ordre":1},{"id":45,"ordre":2}]'::jsonb);

/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Allows controlled atomic updates to membres_equipe.ordre column
 *   2. Bypasses RLS to perform batch updates efficiently
 *   3. Uses advisory locking to prevent concurrent reordering conflicts
 *   4. Must work regardless of individual row-level permissions
 * 
 * Risks Evaluated:
 *   - Authorization: Explicit is_admin() check enforces admin-only access (defense-in-depth)
 *   - Input validation: Validates JSON array structure, checks for duplicate IDs/ordre values
 *   - Concurrency: Advisory lock (hashtext('reorder_team_members')) prevents race conditions
 *   - SQL injection: Uses parameterized queries with format() and $1 placeholder
 *   - Data integrity: Atomic transaction ensures all-or-nothing updates
 * 
 * Validation:
 *   - Tested with valid reorder operations (admin user)
 *   - Tested authorization denial (non-admin user)
 *   - Tested concurrent reorder attempts (advisory lock prevents conflicts)
 *   - Tested invalid inputs (empty array, duplicates, non-array JSON)
 * 
 * Grant Policy:
 *   - EXECUTE granted to authenticated role only (not anon)
 *   - Requires manual review before granting to additional roles
 */
create or replace function public.reorder_team_members(items jsonb)
returns void as $$
declare
  ids int[];
  ords int[];
  when_clauses text;
begin
  -- basic validation: must be a json array
  if jsonb_typeof(items) is distinct from 'array' then
    raise exception 'items must be a json array';
  end if;

  -- authorization: ensure caller is admin (defense-in-depth)
  if not (select public.is_admin()) then
    raise exception 'permission denied';
  end if;

  -- acquire a transaction-scoped advisory lock to avoid concurrent reorders
  perform pg_advisory_xact_lock(hashtext('reorder_team_members'));

  -- extract ids and ordre arrays
  ids := array(select (elem->>'id')::int from jsonb_array_elements(items) as elem);
  ords := array(select (elem->>'ordre')::int from jsonb_array_elements(items) as elem);

  if array_length(ids, 1) is null or array_length(ids, 1) = 0 then
    raise exception 'items array must not be empty';
  end if;

  -- no duplicate ids allowed
  if (select count(*) from (select unnest(ids) as v) s) <> (select count(distinct v) from (select unnest(ids) as v) s) then
    raise exception 'duplicate id in items';
  end if;

  -- no duplicate ordre allowed
  if (select count(*) from (select unnest(ords) as v) s) <> (select count(distinct v) from (select unnest(ords) as v) s) then
    raise exception 'duplicate ordre in items';
  end if;

  -- build when clauses for case expression
  select string_agg(format('when %s then %s', (elem->>'id')::int, (elem->>'ordre')::int), ' ')
  into when_clauses
  from jsonb_array_elements(items) as elem;

  if when_clauses is null or when_clauses = '' then
    raise exception 'no valid updates generated';
  end if;

  -- execute a single atomic update using case
  execute format(
    'update public.membres_equipe set ordre = case id %s end where id = any ($1)',
    when_clauses
  ) using ids;

end;
$$ language plpgsql security definer set search_path = '';

-- grant execute to authenticated so only authenticated users (admin UI / server) can execute the rpc
grant execute on function public.reorder_team_members(jsonb) to authenticated;
