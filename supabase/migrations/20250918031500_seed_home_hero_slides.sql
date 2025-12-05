-- Seed initial des slides du hero (idempotent via upsert sur slug)
-- Concerne: public.home_hero_slides

insert into public.home_hero_slides as h (
  slug, title, subtitle, description, image_url,
  cta_primary_enabled, cta_primary_label, cta_primary_url,
  cta_secondary_enabled, cta_secondary_label, cta_secondary_url,
  position, active
)
values
  (
    'saison-2025',
    'Saison 2025-2026',
    'Une programmation exceptionnelle',
    'Quatre créations inédites vous attendent cette saison, mêlant tradition et modernité.',
    'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200',
    true, 'Voir la programmation', '/spectacles',
    false, null, null,
    1,
    true
  ),
  (
    'creation-phare',
    'L''Art de Raconter',
    'Des histoires qui résonnent',
    'Découvrez notre dernière création, une œuvre captivante qui explore les méandres de l''âme humaine.',
    'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200',
    true, 'Découvrir le spectacle', '/spectacles',
    false, null, null,
    2,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  image_url = excluded.image_url,
  cta_primary_enabled = excluded.cta_primary_enabled,
  cta_primary_label = excluded.cta_primary_label,
  cta_primary_url = excluded.cta_primary_url,
  cta_secondary_enabled = excluded.cta_secondary_enabled,
  cta_secondary_label = excluded.cta_secondary_label,
  cta_secondary_url = excluded.cta_secondary_url,
  position = excluded.position,
  active = excluded.active,
  updated_at = now();
