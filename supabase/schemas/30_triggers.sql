-- Triggers - Application des triggers sur les tables
-- Ordre: 30 - Après les tables et fonctions

-- Triggers de synchronisation auth.users <-> profiles
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_user_deletion();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_update();

-- Triggers de mise à jour updated_at
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(array[
    'public.profiles', 'public.medias', 'public.membres_equipe', 'public.lieux',
    'public.spectacles', 'public.evenements', 'public.articles_presse', 
    'public.abonnes_newsletter', 'public.messages_contact', 'public.configurations_site'
  ])
  LOOP
    EXECUTE format('drop trigger if exists trg_update_updated_at on %s;', tbl);
    EXECUTE format('create trigger trg_update_updated_at
      before update on %s
      for each row
      execute function public.update_updated_at_column();', tbl);
  END LOOP;
END;
$$;

-- Triggers d'audit
DO $$
DECLARE
  audit_tables text[] := array[
    'public.profiles', 'public.medias', 'public.membres_equipe', 'public.lieux',
    'public.spectacles', 'public.evenements', 'public.articles_presse', 
    'public.abonnes_newsletter', 'public.messages_contact', 'public.configurations_site'
  ];
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY audit_tables
  LOOP
    EXECUTE format('drop trigger if exists trg_audit on %s;', tbl);
    EXECUTE format('create trigger trg_audit
      after insert or update or delete on %s
      for each row
      execute function public.audit_trigger();', tbl);
  END LOOP;
END;
$$;
