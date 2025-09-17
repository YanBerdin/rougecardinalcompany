-- Table partners - Partenaires de la compagnie
-- Ordre: 09 - Après les tables principales mais avant les tables de relations

drop table if exists public.partners cascade;
create table public.partners (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  website_url text,
  logo_url text, -- URL directe alternative (fallback si pas de media interne)
  logo_media_id bigint references public.medias(id) on delete set null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index pour l'ordre d'affichage et le statut actif
create index idx_partners_active_order on public.partners(is_active, display_order) where is_active = true;
create index idx_partners_created_by on public.partners(created_by);

-- Contraintes de validation
alter table public.partners 
add constraint check_website_url_format 
check (website_url is null or website_url ~* '^https?://.*$');

alter table public.partners 
add constraint check_display_order_positive 
check (display_order >= 0);

-- Comments pour documentation
comment on table public.partners is 'Liste des partenaires (nom, logo, url, visibilité, ordre d''affichage)';
comment on column public.partners.name is 'Nom du partenaire (obligatoire)';
comment on column public.partners.description is 'Description courte du partenaire (optionnel)';
comment on column public.partners.website_url is 'URL du site web du partenaire (format http/https)';
comment on column public.partners.logo_url is 'URL directe du logo (https) si non géré via medias';
comment on column public.partners.logo_media_id is 'Référence vers le logo dans la table medias';
comment on column public.partners.is_active is 'Partenaire actif (affiché sur le site)';
comment on column public.partners.display_order is 'Ordre d''affichage (0 = premier)';
comment on column public.partners.created_by is 'Utilisateur ayant créé le partenaire';

-- Vue d'administration consolidée partenaires (avec dernière version)
drop view if exists public.partners_admin cascade;
create view public.partners_admin as
select
  p.id,
  p.name,
  p.description,
  p.website_url,
  p.logo_url,
  p.logo_media_id,
  p.is_active,
  p.display_order,
  p.created_by,
  p.created_at,
  p.updated_at,
  lv.version_number as last_version_number,
  lv.change_type as last_change_type,
  lv.created_at as last_version_created_at
from public.partners p
left join lateral (
  select version_number, change_type, created_at
  from public.content_versions cv
  where cv.entity_type = 'partner' and cv.entity_id = p.id
  order by version_number desc
  limit 1
) lv on true;

comment on view public.partners_admin is 'Vue administration partenaires incluant métadonnées versioning';
