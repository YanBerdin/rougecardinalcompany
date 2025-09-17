-- Row Level Security Policies - Profiles
-- Ordre: 60 - Après toutes les structures

alter table public.profiles enable row level security;

-- Lecture publique des profils
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles
for select
to anon, authenticated
using ( true );

-- Insertion : utilisateurs peuvent créer leur propre profil
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check ( (select auth.uid()) = user_id );

-- Mise à jour : propriétaires peuvent modifier leur profil
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

-- Suppression : propriétaires peuvent supprimer leur profil
drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using ( (select auth.uid()) = user_id );
