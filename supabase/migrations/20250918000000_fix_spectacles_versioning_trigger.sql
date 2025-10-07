-- Fix: Corriger le trigger spectacles_versioning_trigger() pour utiliser le champ 'public' au lieu de 'published_at'
-- La table spectacles n'a pas de champ published_at, elle utilise public (boolean) pour contrôler la visibilité

create or replace function public.spectacles_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  -- Déterminer le type de changement
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création du spectacle: ' || NEW.title;
  else
    -- Utiliser le champ 'public' (boolean) au lieu de 'published_at'
    if OLD.public = false and NEW.public = true then
      change_type_value := 'publish';
      change_summary_text := 'Publication du spectacle: ' || NEW.title;
    elsif OLD.public = true and NEW.public = false then
      change_type_value := 'unpublish';
      change_summary_text := 'Dépublication du spectacle: ' || NEW.title;
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour du spectacle: ' || NEW.title;
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'spectacle',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$$;
