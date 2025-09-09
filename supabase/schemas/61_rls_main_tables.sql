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
using ( uploaded_by = (select auth.uid()) or public.is_admin() )
with check ( uploaded_by = (select auth.uid()) or public.is_admin() );

drop policy if exists "Uploaders or admins can delete medias" on public.medias;
create policy "Uploaders or admins can delete medias"
on public.medias
for delete
to authenticated
using ( uploaded_by = (select auth.uid()) or public.is_admin() );

-- ---- SPECTACLES ----
alter table public.spectacles enable row level security;

drop policy if exists "Public spectacles are viewable by everyone" on public.spectacles;
create policy "Public spectacles are viewable by everyone"
on public.spectacles
for select
to anon, authenticated
using ( public = true );

drop policy if exists "Authenticated users can create spectacles" on public.spectacles;
create policy "Authenticated users can create spectacles"
on public.spectacles
for insert
to authenticated
with check ( (select auth.uid()) is not null );

drop policy if exists "Owners or admins can update spectacles" on public.spectacles;
create policy "Owners or admins can update spectacles"
on public.spectacles
for update
to authenticated
using ( (created_by = (select auth.uid())) or public.is_admin() )
with check ( (created_by = (select auth.uid())) or public.is_admin() );

drop policy if exists "Owners or admins can delete spectacles" on public.spectacles;
create policy "Owners or admins can delete spectacles"
on public.spectacles
for delete
to authenticated
using ( (created_by = (select auth.uid())) or public.is_admin() );

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
with check ( public.is_admin() );

drop policy if exists "Admins can update events" on public.evenements;
create policy "Admins can update events"
on public.evenements
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );

drop policy if exists "Admins can delete events" on public.evenements;
create policy "Admins can delete events"
on public.evenements
for delete
to authenticated
using ( public.is_admin() );

-- ---- PARTNERS ----
alter table public.partners enable row level security;

drop policy if exists "Public partners are viewable by anyone" on public.partners;
create policy "Public partners are viewable by anyone"
on public.partners
for select
to authenticated, anon
using ( is_active = true );

drop policy if exists "Admins can view all partners" on public.partners;
create policy "Admins can view all partners"
on public.partners
for select
to authenticated
using ( public.is_admin() );

drop policy if exists "Admins can create partners" on public.partners;
create policy "Admins can create partners"
on public.partners
for insert
to authenticated
with check ( public.is_admin() );

drop policy if exists "Admins can update partners" on public.partners;
create policy "Admins can update partners"
on public.partners
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );

drop policy if exists "Admins can delete partners" on public.partners;
create policy "Admins can delete partners"
on public.partners
for delete
to authenticated
using ( public.is_admin() );
