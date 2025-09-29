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

