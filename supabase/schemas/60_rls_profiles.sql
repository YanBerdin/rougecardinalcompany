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

-- Insertion : utilisateurs peuvent créer leur propre profil OU admins peuvent créer n'importe quel profil
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile OR admins can insert any profile"
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = user_id  -- User crée son propre profil
  OR
  (select public.is_admin()) = true  -- OU c'est un admin
);

-- Mise à jour : propriétaires peuvent modifier leur profil OU admins peuvent modifier n'importe quel profil
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile OR admins can update any profile"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = user_id  -- User met à jour son propre profil
  OR
  (select public.is_admin()) = true  -- OU c'est un admin
)
with check (
  (select auth.uid()) = user_id  -- User met à jour son propre profil
  OR
  (select public.is_admin()) = true  -- OU c'est un admin
);

-- Suppression : propriétaires peuvent supprimer leur profil
drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using ( (select auth.uid()) = user_id );
