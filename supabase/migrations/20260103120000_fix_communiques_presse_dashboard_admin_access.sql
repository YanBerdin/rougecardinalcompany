-- Migration: restreindre l'accès admin à la vue communiques_presse_dashboard
-- Date: 2026-01-03 12:00:00 UTC
-- Objectif: empêcher les utilisateurs authentifiés non-admin d'interroger la vue
--           admin. la vue reste en SECURITY INVOKER ; la condition ci-dessous
--           force la visibilité uniquement si public.is_admin() retourne true.
-- Affected objects: public.communiques_presse_dashboard (view)

-- ===========================================================================
-- WARNING: destructive operation
-- the statement below drops the view with `cascade`. this may remove dependent
-- objects. before applying on production:
--  - ensure you have a recent database backup or point-in-time recovery window
--  - verify no unexpected dependent objects will be dropped by cascade
-- rollback: if needed, restore the previous view from the declarative schema
--           `supabase/schemas/41_views_communiques.sql` or from backups.
-- post-fix synchronization: update `supabase/schemas/41_views_communiques.sql`
--                         to include the same admin guard so the declarative
--                         schema remains the source-of-truth for future diffs.
-- ===========================================================================

begin;

-- drop / recreate view with explicit admin-only guard

drop view if exists public.communiques_presse_dashboard cascade;
create or replace view public.communiques_presse_dashboard
with (security_invoker = true)
as
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
from public.communiques_presse as cp
left join public.communiques_medias as pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1
left join public.medias as pdf_m on pdf_cm.media_id = pdf_m.id
left join public.communiques_medias as cm on cp.id = cm.communique_id and cm.ordre = 0
left join public.medias as im on cm.media_id = im.id
left join public.spectacles as s on cp.spectacle_id = s.id
left join public.evenements as e on cp.evenement_id = e.id
left join public.profiles as p on cp.created_by = p.user_id
left join public.communiques_categories as cc on cp.id = cc.communique_id
left join public.communiques_tags as ct on cp.id = ct.communique_id
where (select public.is_admin()) = true
group by cp.id, pdf_m.filename, pdf_m.size_bytes, im.filename, cp.image_url,
         s.title, e.date_debut, p.display_name
order by cp.created_at desc;

comment on view public.communiques_presse_dashboard is 
'Vue dashboard admin pour la gestion des communiqués — désormais accessible uniquement aux administrateurs. SECURITY INVOKER maintenu; la condition WHERE (select public.is_admin()) = true empêche l''accès aux utilisateurs authentifiés non-admin.';

commit;
