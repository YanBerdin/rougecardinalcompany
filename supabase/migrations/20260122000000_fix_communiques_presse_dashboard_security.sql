-- Migration: Fix communiques_presse_dashboard security issue
-- Problem: View returns empty array instead of permission denied for non-admins
-- Solution: Replace view with SECURITY DEFINER function that throws error for non-admins

-- Drop existing view
drop view if exists public.communiques_presse_dashboard cascade;

-- Create SECURITY DEFINER function with explicit admin check
create or replace function public.communiques_presse_dashboard()
returns table (
  id bigint,
  title text,
  slug text,
  description text,
  date_publication date,
  public boolean,
  ordre_affichage integer,
  pdf_filename text,
  pdf_size_kb numeric,
  image_url text,
  image_filename text,
  spectacle_titre text,
  evenement_date date,
  createur text,
  created_at timestamptz,
  updated_at timestamptz,
  nb_categories bigint,
  nb_tags bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Explicit admin check - throws error if not admin
  if not (select public.is_admin()) then
    raise exception 'permission denied: admin access required';
  end if;

  -- Return dashboard data
  return query
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
  group by cp.id, pdf_m.filename, pdf_m.size_bytes, im.filename, cp.image_url,
           s.title, e.date_debut, p.display_name
  order by cp.created_at desc;
end;
$$;

comment on function public.communiques_presse_dashboard is 
'Admin dashboard function for press releases with statistics and image management. SECURITY DEFINER with explicit admin check - throws error for non-admins instead of returning empty array.';

-- Revoke from public roles (defense in depth)
revoke all on function public.communiques_presse_dashboard() from anon, authenticated;

-- Grant to service_role for admin backend
grant execute on function public.communiques_presse_dashboard() to service_role;
