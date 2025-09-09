-- 06_comments_and_metadata.sql
-- add comments on tables and columns to follow the style guide

comment on table public.profiles is 'user profiles linked to auth.users; contains display info and role metadata';
comment on column public.profiles.user_id is 'references auth.users.id managed by Supabase';

comment on table public.medias is 'media storage metadata (paths, filenames, mime, size)';
comment on column public.medias.storage_path is 'storage provider path (bucket/key)';

comment on table public.membres_equipe is 'members of the team (artists, staff)';
comment on table public.lieux is 'physical venues where events can be scheduled';

comment on table public.spectacles is 'shows/performances (base entity)';
comment on table public.evenements is 'scheduled occurrences of spectacles with date and venue';

comment on table public.articles_presse is 'press articles referencing shows or company news';
comment on table public.abonnes_newsletter is 'newsletter subscribers';
comment on table public.messages_contact is 'contact form messages received from website';
comment on table public.configurations_site is 'key-value store for site-wide configuration';
comment on table public.logs_audit is 'audit log for create/update/delete operations on tracked tables';

-- metadata header documenting identity usage
comment on database current_database() is 'rougecardinalcompany database — uses integer identity primary keys (bigint generated always as identity). External ids (auth.users) remain uuid.';
