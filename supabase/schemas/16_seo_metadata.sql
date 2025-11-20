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
  normalized_text := extensions.unaccent(normalized_text);
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
