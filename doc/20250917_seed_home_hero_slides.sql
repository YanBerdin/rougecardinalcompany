-- Seed initial des slides du hero (idempotent via upsert sur slug)
-- Concerne: public.home_hero_slides

insert into public.home_hero_slides as h (
  slug, title, subtitle, description, image_url, cta_label, cta_url, position, active
)
values
  (
    'saison-2025',
    'Saison 2025-2026',
    'Une programmation exceptionnelle',
    'Quatre créations inédites vous attendent cette saison, mêlant tradition et modernité.',
    'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Voir la programmation',
    '/spectacles',
    1,
    true
  ),
  (
    'creation-phare',
    'L’Art de Raconter',
    'Des histoires qui résonnent',
    'Découvrez notre dernière création, une œuvre captivante qui explore les méandres de l’âme humaine.',
    'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Découvrir le spectacle',
    '/spectacles',
    2,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  image_url = excluded.image_url,
  cta_label = excluded.cta_label,
  cta_url = excluded.cta_url,
  position = excluded.position,
  active = excluded.active,
  updated_at = now();
