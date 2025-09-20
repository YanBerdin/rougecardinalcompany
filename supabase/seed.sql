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
  'La Passion du Théâtre depuis 2008',
  'Née de la rencontre de professionnels passionnés, la compagnie Rouge-Cardinal s''attache à créer des spectacles qui interrogent notre époque tout en célébrant la beauté de l''art théâtral.',
  'Notre démarche artistique privilégie l''humain, l''émotion authentique et la recherche constante d''une vérité scénique qui touche et transforme.',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Notre mission',
  'Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l''art vivant.',
  1,
  true
where not exists (
  select 1 from public.home_about_content where slug = 'default'
);
