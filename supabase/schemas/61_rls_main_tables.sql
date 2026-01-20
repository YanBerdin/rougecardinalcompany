-- Row Level Security Policies - Tables principales
-- Ordre: 61 - RLS pour medias, spectacles, events, etc.

-- ---- MEDIAS ----
alter table public.medias enable row level security;

drop policy if exists "Medias are viewable by everyone" on public.medias;
create policy "Medias are viewable by everyone"
on public.medias
for select
to anon, authenticated
using ( true );

drop policy if exists "Authenticated users can insert medias" on public.medias;
create policy "Authenticated users can insert medias"
on public.medias
for insert
to authenticated
with check ( (select auth.uid()) is not null );

drop policy if exists "Uploaders or admins can update medias" on public.medias;
create policy "Uploaders or admins can update medias"
on public.medias
for update
to authenticated
using ( uploaded_by = (select auth.uid()) or (select public.is_admin()) )
with check ( uploaded_by = (select auth.uid()) or (select public.is_admin()) );

drop policy if exists "Uploaders or admins can delete medias" on public.medias;
create policy "Uploaders or admins can delete medias"
on public.medias
for delete
to authenticated
using ( uploaded_by = (select auth.uid()) or (select public.is_admin()) );

-- ---- SPECTACLES ----
alter table public.spectacles enable row level security;

drop policy if exists "Public spectacles are viewable by everyone" on public.spectacles;
drop policy if exists "Admins can view all spectacles" on public.spectacles;
drop policy if exists "View spectacles (public published OR admin all)" on public.spectacles;

create policy "View spectacles (public published/archived OR admin all)"
on public.spectacles
for select
to anon, authenticated
using (
  (
    -- Public spectacles: published OR archived (for "Nos Créations Passées")
    public = true
    and status in ('published', 'archived')
  )
  or
  -- Admins can see everything
  (select public.is_admin())
);

drop policy if exists "Authenticated users can create spectacles" on public.spectacles;
create policy "Admins can create spectacles"
on public.spectacles
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
    and role = 'admin'
  )
);

drop policy if exists "Owners or admins can update spectacles" on public.spectacles;
create policy "Owners or admins can update spectacles"
on public.spectacles
for update
to authenticated
using (
  (created_by = (select auth.uid()))
  or exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
    and role = 'admin'
  )
)
with check (
  (created_by = (select auth.uid()))
  or exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
    and role = 'admin'
  )
);

drop policy if exists "Owners or admins can delete spectacles" on public.spectacles;
create policy "Owners or admins can delete spectacles"
on public.spectacles
for delete
to authenticated
using (
  (created_by = (select auth.uid()))
  or exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
    and role = 'admin'
  )
);

-- ---- EVENEMENTS ----
alter table public.evenements enable row level security;

drop policy if exists "Events are viewable by everyone" on public.evenements;
create policy "Events are viewable by everyone"
on public.evenements
for select
to anon, authenticated
using ( true );

drop policy if exists "Admins can create events" on public.evenements;
create policy "Admins can create events"
on public.evenements
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update events" on public.evenements;
create policy "Admins can update events"
on public.evenements
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete events" on public.evenements;
create policy "Admins can delete events"
on public.evenements
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- PARTNERS ----
alter table public.partners enable row level security;

drop policy if exists "Public partners are viewable by anyone" on public.partners;
drop policy if exists "Admins can view all partners" on public.partners;

create policy "View partners (active public OR admin all)"
on public.partners
for select
to anon, authenticated
using (
  is_active = true
  or (select public.is_admin())
);

drop policy if exists "Admins can create partners" on public.partners;
create policy "Admins can create partners"
on public.partners
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update partners" on public.partners;
create policy "Admins can update partners"
on public.partners
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete partners" on public.partners;
create policy "Admins can delete partners"
on public.partners
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- MEDIA TAGS ----
alter table public.media_tags enable row level security;

drop policy if exists "Anon can view media tags" on public.media_tags;
create policy "Anon can view media tags"
on public.media_tags
for select
to anon
using ( true );

drop policy if exists "Authenticated can view media tags" on public.media_tags;
create policy "Authenticated can view media tags"
on public.media_tags
for select
to authenticated
using ( true );

drop policy if exists "Admins can insert media tags" on public.media_tags;
create policy "Admins can insert media tags"
on public.media_tags
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update media tags" on public.media_tags;
create policy "Admins can update media tags"
on public.media_tags
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete media tags" on public.media_tags;
create policy "Admins can delete media tags"
on public.media_tags
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- MEDIA FOLDERS ----
alter table public.media_folders enable row level security;

drop policy if exists "Anon can view media folders" on public.media_folders;
create policy "Anon can view media folders"
on public.media_folders
for select
to anon
using ( true );

drop policy if exists "Authenticated can view media folders" on public.media_folders;
create policy "Authenticated can view media folders"
on public.media_folders
for select
to authenticated
using ( true );

drop policy if exists "Admins can insert media folders" on public.media_folders;
create policy "Admins can insert media folders"
on public.media_folders
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update media folders" on public.media_folders;
create policy "Admins can update media folders"
on public.media_folders
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete media folders" on public.media_folders;
create policy "Admins can delete media folders"
on public.media_folders
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- MEDIA ITEM TAGS (Junction Table) ----
alter table public.media_item_tags enable row level security;

drop policy if exists "Anon can view media item tags" on public.media_item_tags;
create policy "Anon can view media item tags"
on public.media_item_tags
for select
to anon
using ( true );

drop policy if exists "Authenticated can view media item tags" on public.media_item_tags;
create policy "Authenticated can view media item tags"
on public.media_item_tags
for select
to authenticated
using ( true );

drop policy if exists "Admins can insert media item tags" on public.media_item_tags;
create policy "Admins can insert media item tags"
on public.media_item_tags
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update media item tags" on public.media_item_tags;
create policy "Admins can update media item tags"
on public.media_item_tags
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete media item tags" on public.media_item_tags;
create policy "Admins can delete media item tags"
on public.media_item_tags
for delete
to authenticated
using ( (select public.is_admin()) );
