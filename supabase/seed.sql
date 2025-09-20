-- Seed idempotent pour la section Home > About
-- Insère une ligne par défaut si absente

insert into public.home_about_content (
  slug,
  title,
  intro1,
  intro2,
  image_url,
  mission_title,
  mission_text,
  position,
  active
)
select
  'default',
  'Qui sommes-nous ?',
  'La Compagnie Rouge Cardinal est dédiée à la création, la transmission et la diffusion de spectacles vivants.',
  'Nous réunissons artistes et publics autour d’œuvres exigeantes et accessibles, ancrées dans le territoire et ouvertes sur le monde.',
  '/opengraph-image.png',
  'Notre mission',
  'Créer des formes artistiques qui mettent l’humain au cœur, et rendre la culture vivante et partagée.',
  1,
  true
where not exists (
  select 1 from public.home_about_content where slug = 'default'
);
