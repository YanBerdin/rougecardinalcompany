-- Row Level Security Policies - Profiles
-- Ordre: 60 - Après toutes les structures

alter table public.profiles enable row level security;

-- Lecture publique des profils
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Anon can view profiles" on public.profiles;
create policy "Anon can view profiles"
on public.profiles
for select
to anon
using ( true );

drop policy if exists "Authenticated can view profiles" on public.profiles;
create policy "Authenticated can view profiles"
on public.profiles
for select
to authenticated
using ( true );

-- Insertion : utilisateurs peuvent créer leur propre profil OU admins peuvent créer n'importe quel profil
-- Policy: Un utilisateur peut créer son propre profil. Un admin peut créer le profil de n'importe quel utilisateur.
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile OR admins can insert any profile"
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  OR
  (select public.is_admin()) = true
);

-- Mise à jour : propriétaires peuvent modifier leur profil OU admins peuvent modifier n'importe quel profil
-- Policy: Un utilisateur peut mettre à jour son propre profil. Un admin peut mettre à jour n'importe quel profil.
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile OR admins can update any profile"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = user_id
  OR
  (select public.is_admin()) = true
)
with check (
  (select auth.uid()) = user_id
  OR
  (select public.is_admin()) = true
);

-- Suppression : propriétaires peuvent supprimer leur profil OU admins peuvent supprimer n'importe quel profil
-- Policy: Un utilisateur peut supprimer son propre profil. Un admin peut supprimer n'importe quel profil.
drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile OR admins can delete any profile"
on public.profiles
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  OR
  (select public.is_admin()) = true
);
