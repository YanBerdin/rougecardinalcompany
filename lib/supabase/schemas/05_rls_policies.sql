-- 05_rls_policies.sql
-- row level security policies. strict best-practice implementation for Supabase.
-- Notes:
--  - Do not include service_role in "to" clauses. service_role bypasses RLS when used server-side.
--  - Use helper public.is_admin() to centralize admin checks (based on profiles.role = 'admin').
--  - Policies are written with least privilege in mind: default deny, allow explicit operations only.

-- ---- profiles ----
alter table public.profiles enable row level security;

-- allow anyone to read public profiles
drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public on public.profiles
  for select
  to anon, authenticated
  using ( true );

-- allow authenticated users to insert their own profile (must set user_id = auth.uid())
drop policy if exists profiles_insert_authenticated on public.profiles;
create policy profiles_insert_authenticated on public.profiles
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

-- allow owners to update/delete their profile
drop policy if exists profiles_update_owner on public.profiles;
create policy profiles_update_owner on public.profiles
  for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists profiles_delete_owner on public.profiles;
create policy profiles_delete_owner on public.profiles
  for delete
  to authenticated
  using ( (select auth.uid()) = user_id );


-- ---- medias ----
alter table public.medias enable row level security;

-- anyone can read medias
drop policy if exists medias_select_all on public.medias;
create policy medias_select_all on public.medias
  for select
  to anon, authenticated
  using ( true );

-- authenticated users can insert medias (uploader recorded on client or via function)
drop policy if exists medias_insert_authenticated on public.medias;
create policy medias_insert_authenticated on public.medias
  for insert
  to authenticated
  with check ( (select auth.uid()) is not null );

-- uploader or admin can update
drop policy if exists medias_update_uploader_or_admin on public.medias;
create policy medias_update_uploader_or_admin on public.medias
  for update
  to authenticated
  using ( uploaded_by = auth.uid() or public.is_admin() )
  with check ( uploaded_by = auth.uid() or public.is_admin() );

-- uploader or admin can delete
drop policy if exists medias_delete_uploader_or_admin on public.medias;
create policy medias_delete_uploader_or_admin on public.medias
  for delete
  to authenticated
  using ( uploaded_by = auth.uid() or public.is_admin() );


-- ---- spectacles ----
alter table public.spectacles enable row level security;

-- allow public reading only for spectacles flagged public=true
drop policy if exists spectacles_select_public on public.spectacles;
create policy spectacles_select_public on public.spectacles
  for select
  to anon, authenticated
  using ( public = true );

-- authenticated users can create spectacles (additional server-side checks recommended)
drop policy if exists spectacles_insert_authenticated on public.spectacles;
create policy spectacles_insert_authenticated on public.spectacles
  for insert
  to authenticated
  with check ( (select auth.uid()) is not null );

-- owner (created_by) or admin can update/delete
drop policy if exists spectacles_update_owner_or_admin on public.spectacles;
create policy spectacles_update_owner_or_admin on public.spectacles
  for update
  to authenticated
  using ( (created_by = auth.uid()) or public.is_admin() )
  with check ( (created_by = auth.uid()) or public.is_admin() );

drop policy if exists spectacles_delete_owner_or_admin on public.spectacles;
create policy spectacles_delete_owner_or_admin on public.spectacles
  for delete
  to authenticated
  using ( (created_by = auth.uid()) or public.is_admin() );


-- ---- evenements ----
alter table public.evenements enable row level security;

-- public can read events
drop policy if exists evenements_select_public on public.evenements;
create policy evenements_select_public on public.evenements
  for select
  to anon, authenticated
  using ( true );

-- creation reserved to admin or creators via server functions
drop policy if exists evenements_insert_admin on public.evenements;
create policy evenements_insert_admin on public.evenements
  for insert
  to authenticated
  with check ( public.is_admin() );

-- update/delete reserved to admin
drop policy if exists evenements_update_admin on public.evenements;
create policy evenements_update_admin on public.evenements
  for update
  to authenticated
  using ( public.is_admin() )
  with check ( public.is_admin() );

drop policy if exists evenements_delete_admin on public.evenements;
create policy evenements_delete_admin on public.evenements
  for delete
  to authenticated
  using ( public.is_admin() );
