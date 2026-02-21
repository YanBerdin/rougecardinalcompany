-- Migration: Fix membres_equipe image_url constraint
-- Purpose: Assouplir la contrainte URL pour autoriser les CDN sans extension de fichier
--          (ex: Unsplash, Pexels qui servent via ?w=800&q=80 sans .jpg dans le chemin)
-- Affected: public.membres_equipe (constraint membres_equipe_image_url_format)
-- Special: La validation du type MIME réel reste effectuée côté applicatif (validateImageUrl + SSRF)

-- ============================================================
-- SUPPRESSION ancienne contrainte trop stricte (extension obligatoire)
-- ============================================================

alter table public.membres_equipe
  drop constraint if exists membres_equipe_image_url_format;

-- ============================================================
-- NOUVELLE contrainte : URL http/https uniquement, extension facultative
-- La validation du contenu (MIME, domaine) est gérée par validateImageUrl
-- ============================================================

alter table public.membres_equipe
  add constraint membres_equipe_image_url_format
  check (
    image_url is null or
    image_url ~* '^https?://[A-Za-z0-9._~:/?#%\-@!$&''()*+,;=]+'
  );

comment on constraint membres_equipe_image_url_format on public.membres_equipe
  is 'URL d''image externe doit être au format http/https (extension facultative, validée côté app)';
