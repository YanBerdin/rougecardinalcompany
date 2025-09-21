-- Create Home About Content table (DDL) to match declarative schema 07e_table_home_about.sql

create table public.home_about_content (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  intro1 text not null,
  intro2 text not null,
  image_url text,
  image_media_id bigint null references public.medias(id) on delete set null,
  mission_title text not null,
  mission_text text not null,
  position smallint not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.home_about_content is 'Bloc éditorial About de la page d''accueil (HomeAboutContentDTO). Un ou plusieurs enregistrements triés par position, filtrés par active.';
comment on column public.home_about_content.slug is 'Clé stable pour upsert (ex: default).';
comment on column public.home_about_content.image_media_id is 'Référence prioritaire vers un média stocké (surpasse image_url si non null).';

create index idx_home_about_content_active_order
  on public.home_about_content(active, position)
  where active = true;

alter table public.home_about_content enable row level security;

drop policy if exists "Home about content is viewable by everyone" on public.home_about_content;
create policy "Home about content is viewable by everyone"
  on public.home_about_content for select
  to anon, authenticated
  using ( true );

drop policy if exists "Admins can manage home about content" on public.home_about_content;
create policy "Admins can manage home about content"
  on public.home_about_content for all
  to authenticated
  using ( (select public.is_admin()) )
  with check ( (select public.is_admin()) );

-- Triggers to align with global trigger behavior from 30_triggers.sql
drop trigger if exists trg_update_updated_at on public.home_about_content;
create trigger trg_update_updated_at
  before update on public.home_about_content
  for each row execute function public.update_updated_at_column();

drop trigger if exists trg_audit on public.home_about_content;
create trigger trg_audit
  after insert or update or delete on public.home_about_content
  for each row execute function public.audit_trigger();
