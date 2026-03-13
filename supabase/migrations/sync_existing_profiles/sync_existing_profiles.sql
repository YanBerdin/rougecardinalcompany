-- Migration: Synchronisation des profils existants avec auth.users
-- Date: 2025-08-27
-- Description: Migration ponctuelle pour créer les profils manquants basés sur les utilisateurs existants
-- Cette migration était précédemment dans le schéma déclaratif mais a été extraite
-- conformément aux instructions de Declarative Database Schema Management.

-- Note: Cette migration est idempotente (peut être exécutée plusieurs fois sans effet de bord)

-- Synchronisation des profils existants
insert into public.profiles (user_id, display_name, role)
select 
  u.id as user_id,
  coalesce(
    u.raw_user_meta_data ->> 'display_name',
    concat_ws(' ', 
      u.raw_user_meta_data ->> 'first_name', 
      u.raw_user_meta_data ->> 'last_name'
    ),
    u.email,
    'Utilisateur'
  ) as display_name,
  case 
    when u.raw_user_meta_data ->> 'role' in ('user', 'editor', 'admin') 
    then u.raw_user_meta_data ->> 'role'
    else 'user'
  end as role
from auth.users as u 
left join public.profiles as p on p.user_id = u.id 
where p.user_id is null;  -- Seulement les utilisateurs sans profil existant

-- Afficher le nombre de profils créés
do $$
declare
  profile_count integer;
begin
  select count(*) into profile_count 
  from public.profiles;
  
  raise notice 'Migration terminée. Total de profils: %', profile_count;
end;
$$;
