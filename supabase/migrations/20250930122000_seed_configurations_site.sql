-- Seed initial pour configurations_site
-- Configuration de base nécessaire au fonctionnement de l'application

set client_min_messages = warning;

insert into public.configurations_site (key, value, updated_at)
values
  -- Configuration générale du site
  ('site:maintenance_mode', 'false'::jsonb, now()),
  ('site:version', '"1.0.0"'::jsonb, now()),
  
  -- Configuration publique de la home
  ('public:home:hero', '{"enabled": true, "autoplay": true, "interval": 5000}'::jsonb, now()),
  ('public:home:about', '{"enabled": true, "show_stats": true, "show_mission": true}'::jsonb, now()),
  ('public:home:spectacles', '{"enabled": true, "max_items": 6, "show_archived": false}'::jsonb, now()),
  ('public:home:news', '{"enabled": true, "max_items": 3, "show_private": false}'::jsonb, now()),
  ('public:home:newsletter', '{"enabled": true, "show_consent": true, "double_optin": true}'::jsonb, now()),
  ('public:home:partners', '{"enabled": true, "show_inactive": false}'::jsonb, now()),
  
  -- Configuration contact et presse
  ('public:contact:enabled', 'true'::jsonb, now()),
  ('public:contact:reasons', '["booking", "partenariat", "presse", "education", "technique", "autre"]'::jsonb, now()),
  ('public:contact:require_consent', 'true'::jsonb, now()),
  
  -- Configuration presse
  ('public:presse:articles_enabled', 'true'::jsonb, now()),
  ('public:presse:communiques_enabled', 'true'::jsonb, now()),
  ('public:presse:media_kit_enabled', 'true'::jsonb, now()),
  
  -- Configuration agenda
  ('public:agenda:enabled', 'true'::jsonb, now()),
  ('public:agenda:show_past_events', 'false'::jsonb, now()),
  ('public:agenda:max_items', '50'::jsonb, now()),
  
  -- Réseaux sociaux et liens externes
  ('public:social:facebook', '{"enabled": false, "url": ""}'::jsonb, now()),
  ('public:social:instagram', '{"enabled": false, "url": ""}'::jsonb, now()),
  ('public:social:youtube', '{"enabled": false, "url": ""}'::jsonb, now()),
  ('public:social:linkedin', '{"enabled": false, "url": ""}'::jsonb, now()),
  
  -- Configuration SEO
  ('public:seo:site_name', '"Rouge Cardinal Company"'::jsonb, now()),
  ('public:seo:default_description', '"Compagnie de théâtre professionnelle créée en 2008, Rouge Cardinal développe un répertoire exigeant mêlant classiques et créations contemporaines."'::jsonb, now()),
  ('public:seo:default_keywords', '["théâtre", "compagnie", "Rouge Cardinal", "spectacle", "culture", "arts vivants"]'::jsonb, now()),
  
  -- Paramètres techniques
  ('app:max_upload_size', '10485760'::jsonb, now()), -- 10MB
  ('app:allowed_file_types', '["image/jpeg", "image/png", "image/webp", "application/pdf"]'::jsonb, now()),
  ('app:session_timeout', '7200'::jsonb, now()), -- 2 heures
  
  -- Configuration analytics (à activer selon les besoins)
  ('analytics:google_analytics', '{"enabled": false, "tracking_id": ""}'::jsonb, now()),
  ('analytics:matomo', '{"enabled": false, "site_id": "", "url": ""}'::jsonb, now())

on conflict (key) do update set
  value = excluded.value,
  updated_at = now();