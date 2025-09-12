-- Table communiques_presse - Communiqués de presse (documents PDF)
-- Ordre: 08b - Après articles_presse mais avant partners

drop table if exists public.communiques_presse cascade;
create table public.communiques_presse (
  id bigint generated always as identity primary key,
  title text not null, -- Harmonisé avec articles_presse
  slug text,
  description text, -- Résumé/description (cohérent avec types TS)
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
  -- Informations du PDF principal (ordre = -1)
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
  -- URL public pour téléchargement (via Supabase Storage)
  concat('/storage/v1/object/public/', pdf_m.storage_path) as file_url,
  -- Informations image d'illustration
  cp.image_url,
  cm.ordre as image_ordre,
  im.filename as image_filename,
  im.storage_path as image_path,
  concat('/storage/v1/object/public/', im.storage_path) as image_file_url,
  -- Informations contextuelles
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  l.nom as lieu_nom,
  -- Catégories et tags
  array_agg(distinct c.name) filter (where c.name is not null) as categories,
  array_agg(distinct t.name) filter (where t.name is not null) as tags
from public.communiques_presse cp
left join public.communiques_medias pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1 -- PDF principal
left join public.medias pdf_m on pdf_cm.media_id = pdf_m.id
left join public.communiques_medias cm on cp.id = cm.communique_id and cm.ordre = 0 -- Image principale
left join public.medias im on cm.media_id = im.id
left join public.spectacles s on cp.spectacle_id = s.id
left join public.evenements e on cp.evenement_id = e.id
left join public.lieux l on e.lieu_id = l.id
left join public.communiques_categories cc on cp.id = cc.communique_id
left join public.categories c on cc.category_id = c.id and c.is_active = true
left join public.communiques_tags ct on cp.id = ct.communique_id
left join public.tags t on ct.tag_id = t.id
where cp.public = true
group by cp.id, pdf_m.filename, pdf_m.size_bytes, pdf_m.storage_path, 
         cm.ordre, im.filename, im.storage_path, cp.image_url,
         s.title, e.date_debut, l.nom
order by cp.ordre_affichage asc, cp.date_publication desc;

comment on view public.communiques_presse_public is 
'Vue publique optimisée pour l''espace presse professionnel avec URLs de téléchargement, images et catégories';

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
  pdf_m.filename as pdf_filename,
  round(coalesce(cp.file_size_bytes, pdf_m.size_bytes) / 1024.0, 2) as pdf_size_kb,
  -- Image info
  cp.image_url,
  im.filename as image_filename,
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
left join public.communiques_medias pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1 -- PDF principal
left join public.medias pdf_m on pdf_cm.media_id = pdf_m.id
left join public.communiques_medias cm on cp.id = cm.communique_id and cm.ordre = 0 -- Image principale
left join public.medias im on cm.media_id = im.id
left join public.spectacles s on cp.spectacle_id = s.id
left join public.evenements e on cp.evenement_id = e.id
left join public.profiles p on cp.created_by = p.user_id
left join public.communiques_categories cc on cp.id = cc.communique_id
left join public.communiques_tags ct on cp.id = ct.communique_id
group by cp.id, pdf_m.filename, pdf_m.size_bytes, im.filename, cp.image_url,
         s.title, e.date_debut, p.display_name
order by cp.created_at desc;

comment on view public.communiques_presse_dashboard is 
'Vue dashboard admin pour la gestion des communiqués avec statistiques et gestion des images';
