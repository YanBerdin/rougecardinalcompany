-- migration: seed compagnie_presentation_sections from code source (idempotent)
-- source: components/features/public-site/compagnie/data/presentation.ts
-- rationale: align DB content for "LA compagnie" page with typed source data

set client_min_messages = warning;

-- NOTE: keep idempotent. We use slug (id) as natural key.
-- columns mapped: slug=id, kind, title, subtitle, content, quote_text, quote_author, image_url, position, active

with src as (
  select * from (
    values
      ('hero','hero','La Compagnie Rouge-Cardinal','15 ans de passion pour les arts de la scène', null::text[], null::text, null::text, null::text, 5, true),
      ('history','history','Notre Histoire', null,
        array[
          'Fondée en 2008 par un collectif de jeunes diplômés des grandes écoles théâtrales françaises, la compagnie Rouge-Cardinal est née d''une envie commune : créer un théâtre qui parle à notre époque tout en puisant dans la richesse du patrimoine dramatique.',
          'Le nom "Rouge-Cardinal" évoque à la fois la passion qui nous anime et la noblesse de notre art. Comme le cardinal, oiseau au plumage éclatant, nous cherchons à apporter couleur et vie sur scène.',
          'Depuis nos débuts, nous avons créé plus de 50 spectacles, tourné dans toute la France et à l''étranger, et remporté plusieurs prix prestigieux pour nos créations originales.'
        ]::text[],
        null::text, null::text,
        'https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=800',
        20, true),
      ('quote-history','quote', null, null, null::text[],
        'Le théâtre doit être un miroir de l''âme humaine, un lieu où l''émotion et la réflexion se rencontrent pour créer du sens et du lien entre les êtres.',
        'Marie Dubois, Directrice artistique',
        null::text,
        25, true),
      ('values','values','Nos Valeurs','Les principes qui guident notre travail artistique et notre vision du théâtre', null::text[], null::text, null::text, null::text, 40, true),
      ('team','team','Notre Équipe','Rencontrez les artistes et techniciens qui donnent vie à nos spectacles', null::text[], null::text, null::text, null::text, 50, true),
      ('mission','mission','Notre Mission', null,
        array[
          'Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l''art vivant. Nous nous attachons à rendre le théâtre accessible à tous, en développant des projets artistiques de qualité qui résonnent avec les enjeux de notre société.',
          'Notre engagement va au-delà de la simple représentation : nous menons des actions culturelles en milieu scolaire, participons à des festivals, et soutenons la création contemporaine par des résidences d''artistes et des collaborations avec de jeunes talents.'
        ]::text[],
        null::text, null::text, null::text,
        30, true)
  ) as v(slug, kind, title, subtitle, content, quote_text, quote_author, image_url, position, active)
)
merge into public.compagnie_presentation_sections as ps
using src as s
on ps.slug = s.slug
when matched then update set
  kind = s.kind,
  title = s.title,
  subtitle = s.subtitle,
  content = s.content,
  quote_text = s.quote_text,
  quote_author = s.quote_author,
  image_url = s.image_url,
  position = s.position,
  active = s.active,
  updated_at = now()
when not matched then insert (
  slug, kind, title, subtitle, content, quote_text, quote_author, image_url, image_media_id, position, active, created_at, updated_at
) values (
  s.slug, s.kind, s.title, s.subtitle, s.content, s.quote_text, s.quote_author, s.image_url, null, s.position, s.active, now(), now()
);
