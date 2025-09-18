-- migration: seed initial (idempotent) pour compagnie_values
-- table affectée: public.compagnie_values
-- considerations:
--   - clé naturelle: key (unique)
--   - idempotence via on conflict (key) do update
--   - actualise updated_at à chaque update

set client_min_messages = warning;

insert into public.compagnie_values (key, title, description, position, active, created_at, updated_at)
values
  ('passion', 'Passion', 'Nous créons avec intensité et sincérité, au service des émotions du public.', 1, true, now(), now()),
  ('collectif', 'Collectif', 'La force du groupe et la diversité des regards nourrissent nos créations.', 2, true, now(), now()),
  ('excellence', 'Excellence', 'Un haut niveau d’exigence artistique et technique guide notre travail.', 3, true, now(), now()),
  ('innovation', 'Innovation', 'Nous explorons de nouvelles formes et technologies pour réinventer la scène.', 4, true, now(), now())
on conflict (key) do update
set
  title = excluded.title,
  description = excluded.description,
  position = excluded.position,
  active = excluded.active,
  updated_at = now();
