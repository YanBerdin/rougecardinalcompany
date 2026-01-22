-- Migration: Fix SECURITY DEFINER views → SECURITY INVOKER
-- Purpose: Prevent RLS bypass in press-related views
-- Affected: articles_presse_public, communiques_presse_public
-- Security: CRITICAL - Views must use SECURITY INVOKER to enforce RLS

drop view if exists "public"."articles_presse_public";

drop view if exists "public"."communiques_presse_public";

-- ✅ SECURITY INVOKER: Runs with querying user privileges (RLS enforced)
create or replace view "public"."articles_presse_public"
with (security_invoker = true)
as  SELECT id,
    title,
    author,
    type,
    slug,
    chapo,
    excerpt,
    source_publication,
    source_url,
    published_at,
    created_at
   FROM public.articles_presse
  WHERE (published_at IS NOT NULL);


-- ✅ SECURITY INVOKER: Runs with querying user privileges (RLS enforced)
-- Comment: This view combines press releases with their PDF files and associated metadata
create or replace view "public"."communiques_presse_public"
with (security_invoker = true)
as  SELECT cp.id,
    cp.title,
    cp.slug,
    cp.description,
    cp.date_publication,
    cp.ordre_affichage,
    cp.spectacle_id,
    cp.evenement_id,
    pdf_m.filename AS pdf_filename,
    cp.file_size_bytes,
        CASE
            WHEN (cp.file_size_bytes IS NOT NULL) THEN
            CASE
                WHEN (cp.file_size_bytes < 1024) THEN ((cp.file_size_bytes)::text || ' B'::text)
                WHEN (cp.file_size_bytes < 1048576) THEN ((round(((cp.file_size_bytes)::numeric / 1024.0), 1))::text || ' KB'::text)
                ELSE ((round(((cp.file_size_bytes)::numeric / 1048576.0), 1))::text || ' MB'::text)
            END
            ELSE (pdf_m.size_bytes)::text
        END AS file_size_display,
    pdf_m.storage_path AS pdf_path,
    concat('/storage/v1/object/public/medias/', pdf_m.storage_path) AS file_url,
    cp.image_url,
    cm.ordre AS image_ordre,
    im.filename AS image_filename,
    im.storage_path AS image_path,
    concat('/storage/v1/object/public/medias/', im.storage_path) AS image_file_url,
    s.title AS spectacle_titre,
    e.date_debut AS evenement_date,
    l.nom AS lieu_nom,
    array_agg(DISTINCT c.name) FILTER (WHERE (c.name IS NOT NULL)) AS categories,
    array_agg(DISTINCT t.name) FILTER (WHERE (t.name IS NOT NULL)) AS tags
   FROM (((((((((((public.communiques_presse cp
     LEFT JOIN public.communiques_medias pdf_cm ON (((cp.id = pdf_cm.communique_id) AND (pdf_cm.ordre = '-1'::integer))))
     LEFT JOIN public.medias pdf_m ON ((pdf_cm.media_id = pdf_m.id)))
     LEFT JOIN public.communiques_medias cm ON (((cp.id = cm.communique_id) AND (cm.ordre = 0))))
     LEFT JOIN public.medias im ON ((cm.media_id = im.id)))
     LEFT JOIN public.spectacles s ON ((cp.spectacle_id = s.id)))
     LEFT JOIN public.evenements e ON ((cp.evenement_id = e.id)))
     LEFT JOIN public.lieux l ON ((e.lieu_id = l.id)))
     LEFT JOIN public.communiques_categories cc ON ((cp.id = cc.communique_id)))
     LEFT JOIN public.categories c ON (((cc.category_id = c.id) AND (c.is_active = true))))
     LEFT JOIN public.communiques_tags ct ON ((cp.id = ct.communique_id)))
     LEFT JOIN public.tags t ON ((ct.tag_id = t.id)))
  WHERE ((cp.public = true) AND (EXISTS ( SELECT 1
           FROM public.communiques_medias pdf_check
          WHERE ((pdf_check.communique_id = cp.id) AND (pdf_check.ordre = '-1'::integer)))))
  GROUP BY cp.id, pdf_m.filename, pdf_m.size_bytes, pdf_m.storage_path, cm.ordre, im.filename, im.storage_path, cp.image_url, s.title, e.date_debut, l.nom
  ORDER BY cp.ordre_affichage, cp.date_publication DESC;

comment on view public.communiques_presse_public is 'SECURITY INVOKER: Public press releases with PDF files (enforces RLS policies from base tables)';
comment on view public.articles_presse_public is 'SECURITY INVOKER: Public press articles (enforces RLS policies from base table)';



