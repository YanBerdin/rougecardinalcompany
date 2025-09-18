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

drop policy if exists "Admins can manage press contacts" on public.contacts_presse;
create policy "Admins can manage press contacts"
on public.contacts_presse
for all
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- ===== VUES UTILITAIRES =====
-- Vues déplacées dans 41_views_communiques.sql (dépendent des tables de relations)
