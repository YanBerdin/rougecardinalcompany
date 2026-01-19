-- Migration: Add partners media folder
-- Purpose: Create partners folder entry in media_folders for partner logo uploads
-- Affected Tables: media_folders
-- Special Considerations: Uses ON CONFLICT DO NOTHING for idempotent execution

-- add partners folder to media_folders table
insert into public.media_folders (name, slug, description)
values ('Partenaires', 'partners', 'Logos des partenaires')
on conflict (slug) do nothing;
