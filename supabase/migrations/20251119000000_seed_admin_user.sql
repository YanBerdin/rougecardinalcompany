-- =====================================================
-- Seed: Create initial admin user
-- Description: Crée l'utilisateur administrateur initial
--              avec profil dans public.profiles
-- =====================================================

DO $$
DECLARE
  admin_user_id uuid;
  admin_email text := 'yandevformation@gmail.com';
  admin_password text := 'AdminRouge2025!'; -- À CHANGER après première connexion
  existing_user_id uuid;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = admin_email;

  IF existing_user_id IS NOT NULL THEN
    -- L'utilisateur existe déjà, mettre à jour les métadonnées
    RAISE NOTICE 'Admin user already exists (%), updating metadata...', existing_user_id;
    
    UPDATE auth.users
    SET 
      raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{role}',
        '"admin"'
      ),
      raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        '"admin"'
      ),
      email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = existing_user_id;

    admin_user_id := existing_user_id;
  ELSE
    -- Créer le nouvel utilisateur admin
    RAISE NOTICE 'Creating new admin user...';
    
    -- Note: Dans Supabase local, auth.users n'accepte pas INSERT direct
    -- Cette partie nécessite l'utilisation de l'Admin API
    -- Voir scripts/create-admin-user.ts pour la création initiale
    
    RAISE NOTICE '⚠️  Cannot create auth.users directly via SQL migration.';
    RAISE NOTICE '   Run: pnpm exec tsx scripts/create-admin-user.ts';
    RETURN;
  END IF;

  -- Créer/mettre à jour le profil
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (admin_user_id, 'Administrateur', 'admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = 'admin',
    display_name = 'Administrateur',
    updated_at = now();

  RAISE NOTICE '✅ Admin profile synced for user %', admin_user_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create admin user: %', SQLERRM;
    RAISE NOTICE '   Manual creation required: pnpm exec tsx scripts/create-admin-user.ts';
END $$;
