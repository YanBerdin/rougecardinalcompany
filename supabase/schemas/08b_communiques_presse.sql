-- Table communiques_presse - Communiqués de presse (documents PDF)
-- Ordre: 08b - Après articles_presse mais avant partners

drop table if exists public.communiques_presse cascade;
create table public.communiques_presse (
  id bigint generated always as identity primary key,
  title text not null, -- Harmonisé avec articles_presse
  slug text,
  description text, -- Résumé/description (cohérent avec types TS)
  date_publication date not null,
  
  -- Document PDF principal  
  document_pdf_media_id bigint not null references public.medias(id) on delete restrict,
  
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
comment on column public.communiques_presse.document_pdf_media_id is 'Référence obligatoire vers le PDF dans la table medias';
comment on column public.communiques_presse.ordre_affichage is 'Ordre d''affichage personnalisé dans le kit média (0 = premier)';
comment on column public.communiques_presse.file_size_bytes is 'Taille du fichier pour affichage utilisateur (ex: "312 KB")';

-- ===== TABLES DE RELATIONS =====

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

-- Liaison communiqués <-> catégories (utilise la table categories existante)
drop table if exists public.communiques_categories cascade;
create table public.communiques_categories (
  communique_id bigint not null references public.communiques_presse(id) on delete cascade,
  category_id bigint not null references public.categories(id) on delete cascade,
  primary key (communique_id, category_id)
);

-- Liaison communiqués <-> tags (utilise la table tags existante)
drop table if exists public.communiques_tags cascade;
create table public.communiques_tags (
  communique_id bigint not null references public.communiques_presse(id) on delete cascade,
  tag_id bigint not null references public.tags(id) on delete cascade,
  primary key (communique_id, tag_id)
);

-- ===== INDEX =====
create index idx_communiques_presse_date_publication on public.communiques_presse(date_publication desc);
create index idx_communiques_presse_public on public.communiques_presse(public) where public = true;
create index idx_communiques_presse_ordre on public.communiques_presse(ordre_affichage, date_publication desc);
create index idx_communiques_presse_spectacle_id on public.communiques_presse(spectacle_id);
create index idx_communiques_presse_created_by on public.communiques_presse(created_by);

-- Index pour contacts presse
create index idx_contacts_presse_media on public.contacts_presse(media);
create index idx_contacts_presse_actif on public.contacts_presse(actif) where actif = true;
create index idx_contacts_presse_specialites on public.contacts_presse using gin (specialites);

-- Recherche full-text sur titre et description (harmonisé avec articles_presse)
create index idx_communiques_presse_search on public.communiques_presse using gin (
  to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, ''))
);

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

-- ---- TABLES DE RELATIONS ----
-- communiques_categories
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

drop policy if exists "Admins can manage press release categories" on public.communiques_categories;
create policy "Admins can manage press release categories"
on public.communiques_categories
for all
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- communiques_tags
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

drop policy if exists "Admins can manage press release tags" on public.communiques_tags;
create policy "Admins can manage press release tags"
on public.communiques_tags
for all
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- ===== TRIGGERS STANDARD =====

-- Triggers pour updated_at
drop trigger if exists trg_update_updated_at on public.communiques_presse;
create trigger trg_update_updated_at
  before update on public.communiques_presse
  for each row execute function public.update_updated_at_column();

drop trigger if exists trg_update_updated_at on public.contacts_presse;
create trigger trg_update_updated_at
  before update on public.contacts_presse
  for each row execute function public.update_updated_at_column();

-- Triggers pour audit
drop trigger if exists trg_audit on public.communiques_presse;
create trigger trg_audit
  after insert or update or delete on public.communiques_presse
  for each row execute function public.audit_trigger();

drop trigger if exists trg_audit on public.contacts_presse;
create trigger trg_audit
  after insert or update or delete on public.contacts_presse
  for each row execute function public.audit_trigger();

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

-- ===== VUES UTILITAIRES =====

-- Vue pour affichage public des communiqués (espace presse professionnel)
create or replace view public.communiques_presse_public as
select 
  cp.id,
  cp.title,
  cp.slug,
  cp.description,
  cp.date_publication,
  cp.ordre_affichage,
  cp.spectacle_id,
  cp.evenement_id,
  -- Informations du PDF pour kit média
  m.filename as pdf_filename,
  cp.file_size_bytes,
  case 
    when cp.file_size_bytes is not null then 
      case 
        when cp.file_size_bytes < 1024 then cp.file_size_bytes::text || ' B'
        when cp.file_size_bytes < 1048576 then round(cp.file_size_bytes / 1024.0, 1)::text || ' KB'
        else round(cp.file_size_bytes / 1048576.0, 1)::text || ' MB'
      end
    else m.size_bytes::text
  end as file_size_display,
  m.storage_path as pdf_path,
  -- URL public pour téléchargement (via Supabase Storage)
  concat('/storage/v1/object/public/', m.storage_path) as file_url,
  -- Informations contextuelles
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  l.nom as lieu_nom,
  -- Catégories et tags
  array_agg(distinct c.name) filter (where c.name is not null) as categories,
  array_agg(distinct t.name) filter (where t.name is not null) as tags
from public.communiques_presse cp
inner join public.medias m on cp.document_pdf_media_id = m.id
left join public.spectacles s on cp.spectacle_id = s.id
left join public.evenements e on cp.evenement_id = e.id
left join public.lieux l on e.lieu_id = l.id
left join public.communiques_categories cc on cp.id = cc.communique_id
left join public.categories c on cc.category_id = c.id and c.is_active = true
left join public.communiques_tags ct on cp.id = ct.communique_id
left join public.tags t on ct.tag_id = t.id
where cp.public = true
group by cp.id, m.filename, m.size_bytes, m.storage_path, s.title, e.date_debut, l.nom
order by cp.ordre_affichage asc, cp.date_publication desc;

comment on view public.communiques_presse_public is 
'Vue publique optimisée pour l''espace presse professionnel avec URLs de téléchargement et tailles formatées';

-- Vue dashboard admin pour gestion
create or replace view public.communiques_presse_dashboard as
select 
  cp.id,
  cp.title,
  cp.slug,
  cp.description,
  cp.date_publication,
  cp.public,
  cp.ordre_affichage,
  -- PDF info
  m.filename as pdf_filename,
  round(coalesce(cp.file_size_bytes, m.size_bytes) / 1024.0, 2) as pdf_size_kb,
  -- Relations
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  -- Meta
  p.display_name as createur,
  cp.created_at,
  cp.updated_at,
  -- Stats
  count(cc.category_id) as nb_categories,
  count(ct.tag_id) as nb_tags
from public.communiques_presse cp
inner join public.medias m on cp.document_pdf_media_id = m.id
left join public.spectacles s on cp.spectacle_id = s.id
left join public.evenements e on cp.evenement_id = e.id
left join public.profiles p on cp.created_by = p.user_id
left join public.communiques_categories cc on cp.id = cc.communique_id
left join public.communiques_tags ct on cp.id = ct.communique_id
group by cp.id, m.filename, m.size_bytes, s.title, e.date_debut, p.display_name
order by cp.created_at desc;

comment on view public.communiques_presse_dashboard is 
'Vue dashboard admin pour la gestion des communiqués avec statistiques';
