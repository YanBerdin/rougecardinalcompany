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
create or replace view public.categories_hierarchy as
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
