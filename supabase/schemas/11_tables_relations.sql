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
