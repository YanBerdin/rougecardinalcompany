-- supabase/schemas/06_table_spectacles.sql
-- Table spectacles - Spectacles/représentations
-- Ordre: 06 - Table principale pour les spectacles
-- Last updated: 2025-12-10 - Normalisation status (canonical English values only)

drop table if exists public.spectacles cascade;
create table public.spectacles (
  id bigint generated always as identity primary key,
  title text not null,
  slug text,
  status text not null default 'draft',
  description text,
  short_description text,
  genre text,
  duration_minutes integer,
  casting integer,
  premiere timestamptz null,
  image_url text,
  public boolean default true,
  awards text[],
  created_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector,
  
  -- ✅ NOUVEAU : Contrainte CHECK pour valeurs canoniques uniquement
  constraint chk_spectacles_status_allowed 
    check (status in ('draft', 'published', 'archived'))
);

-- ✅ Commentaires mis à jour (source de vérité)
comment on table public.spectacles is 'shows/performances (base entity)';

comment on column public.spectacles.status is 
'Canonical status values (English only): ''draft'', ''published'', ''archived''. 
UI translations to French are handled by translateStatus() helper in application code.
Historical note: Legacy French values (brouillon, actuellement, archive, etc.) were 
normalized to English tokens in migration 20251209120000_normalize_spectacles_status_to_english.sql';

comment on column public.spectacles.casting is 
'Nombre d''interprètes au plateau (anciennement `cast`)';

comment on column public.spectacles.image_url is 
'URL externe vers une image (alternative ou complément à image_media_id)';

comment on column public.spectacles.awards is 
'Liste des prix et distinctions (array, d''où le pluriel conforme au type)';

-- ✅ Index pour performance - partial index for published spectacles
create index if not exists idx_spectacles_slug_published 
  on public.spectacles(slug) 
  where status = 'published';
create index if not exists idx_spectacles_status on public.spectacles(status);
create index if not exists idx_spectacles_public on public.spectacles(public);
create index if not exists idx_spectacles_search_vector on public.spectacles using gin(search_vector);

