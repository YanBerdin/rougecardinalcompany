-- migration: seed footer configuration row
-- purpose: insert the single row used by the public footer
--          (key = 'public:footer:content') in public.configurations_site.
-- affected tables: public.configurations_site (one row inserted)
-- special considerations:
--   - idempotent via `on conflict (key) do nothing`
--   - rls policies for `public:%` keys already allow public select +
--     admin write (see existing schema). no policy change needed here.
--   - audit trigger on configurations_site uses json operator pattern
--     and supports the `key` primary column.

insert into public.configurations_site (key, value, description, category)
values (
    'public:footer:content',
    jsonb_build_object(
        'description',
        'Compagnie de théâtre passionnée par les arts de la scène, nous créons et produisons des spectacles qui touchent et interrogent notre époque.',
        'contact',
        jsonb_build_object(
            'email', 'contact@rouge-cardinal.fr',
            'phone', '+33 1 23 45 67 89',
            'address', '75011 Paris, France'
        ),
        'socialLinks',
        jsonb_build_object(
            'facebook', 'https://www.facebook.com/',
            'instagram', 'https://www.instagram.com/',
            'twitter', 'https://twitter.com/'
        )
    ),
    'Contenu administrable du footer public (description, contact, réseaux sociaux).',
    'footer_content'
)
on conflict (key) do nothing;
