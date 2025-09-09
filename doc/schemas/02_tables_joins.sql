-- 02_tables_joins.sql
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
