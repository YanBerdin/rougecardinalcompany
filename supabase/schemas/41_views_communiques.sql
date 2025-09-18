-- Vues Communiqués de presse dépendantes des relations
-- Ordre: 41 - après 11_tables_relations.sql

-- Vue publique communiqués
drop view if exists public.communiques_presse_public cascade;
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
  concat('/storage/v1/object/public/', pdf_m.storage_path) as file_url,
  cp.image_url,
  cm.ordre as image_ordre,
  im.filename as image_filename,
  im.storage_path as image_path,
  concat('/storage/v1/object/public/', im.storage_path) as image_file_url,
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  l.nom as lieu_nom,
  array_agg(distinct c.name) filter (where c.name is not null) as categories,
  array_agg(distinct t.name) filter (where t.name is not null) as tags
from public.communiques_presse cp
left join public.communiques_medias pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1
left join public.medias pdf_m on pdf_cm.media_id = pdf_m.id
left join public.communiques_medias cm on cp.id = cm.communique_id and cm.ordre = 0
left join public.medias im on cm.media_id = im.id
left join public.spectacles s on cp.spectacle_id = s.id
left join public.evenements e on cp.evenement_id = e.id
left join public.lieux l on e.lieu_id = l.id
left join public.communiques_categories cc on cp.id = cc.communique_id
left join public.categories c on cc.category_id = c.id and c.is_active = true
left join public.communiques_tags ct on cp.id = ct.communique_id
left join public.tags t on ct.tag_id = t.id
where cp.public = true
  and exists (
    select 1 from public.communiques_medias pdf_check 
    where pdf_check.communique_id = cp.id and pdf_check.ordre = -1
  )
group by cp.id, pdf_m.filename, pdf_m.size_bytes, pdf_m.storage_path, 
         cm.ordre, im.filename, im.storage_path, cp.image_url,
         s.title, e.date_debut, l.nom
order by cp.ordre_affichage asc, cp.date_publication desc;

comment on view public.communiques_presse_public is 
'Vue publique optimisée pour l''espace presse professionnel avec URLs de téléchargement, images et catégories. Exclut les communiqués sans PDF principal.';

-- Vue dashboard admin
drop view if exists public.communiques_presse_dashboard cascade;
create or replace view public.communiques_presse_dashboard as
select 
  cp.id,
  cp.title,
  cp.slug,
  cp.description,
  cp.date_publication,
  cp.public,
  cp.ordre_affichage,
  pdf_m.filename as pdf_filename,
  round(coalesce(cp.file_size_bytes, pdf_m.size_bytes) / 1024.0, 2) as pdf_size_kb,
  cp.image_url,
  im.filename as image_filename,
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  p.display_name as createur,
  cp.created_at,
  cp.updated_at,
  count(cc.category_id) as nb_categories,
  count(ct.tag_id) as nb_tags
from public.communiques_presse cp
left join public.communiques_medias pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1
left join public.medias pdf_m on pdf_cm.media_id = pdf_m.id
left join public.communiques_medias cm on cp.id = cm.communique_id and cm.ordre = 0
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
