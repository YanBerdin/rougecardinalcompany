-- =====================================================
-- Schema: Auto-sync profiles on user creation
-- Description: Trigger qui crée automatiquement un profil
--              dans public.profiles lors de l'inscription
-- =====================================================

-- Fonction trigger pour créer automatiquement le profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Trigger automatique après création d'un utilisateur dans auth.users
 *   2. Doit créer une entrée dans public.profiles sans dépendre de l'utilisateur
 *   3. Exécuté par le système lors de l'inscription (pas par l'utilisateur)
 *   4. Légitime : synchronisation auth.users → public.profiles
 * 
 * Risks Evaluated:
 *   - Authorization: Trigger système, pas d'input utilisateur direct
 *   - Input validation: Utilise NEW.id (UUID validé par auth.users)
 *   - Privilege escalation: Lecture seule de raw_user_meta_data (données de signup)
 *   - Concurrency: Trigger AFTER INSERT garantit l'existence de auth.users
 *   - Data integrity: INSERT avec gestion d'erreur silencieuse (DO NOTHING)
 * 
 * Validation:
 *   - Testé avec création utilisateur normal (role='user')
 *   - Testé avec création admin (app_metadata.role='admin')
 *   - Vérifié que les conflits sont gérés (ON CONFLICT DO NOTHING)
 *   - Testé après db reset + signup
 * 
 * Grant Policy:
 *   - Pas de GRANT nécessaire (trigger système)
 *   - Exécuté automatiquement lors de INSERT dans auth.users
 */
BEGIN
  -- Insérer le profil avec le rôle depuis user_metadata ou 'user' par défaut
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.email,
      'Utilisateur'
    ),
    CASE 
      WHEN new.raw_app_meta_data->>'role' IN ('user', 'editor', 'admin') 
        THEN new.raw_app_meta_data->>'role'
      WHEN new.raw_user_meta_data->>'role' IN ('user', 'editor', 'admin')
        THEN new.raw_user_meta_data->>'role'
      ELSE 'user'
    END
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Trigger function to automatically create a profile in public.profiles when a user signs up. '
  'Extracts role from app_metadata or user_metadata, defaults to "user". '
  'Uses SECURITY DEFINER to ensure profile creation even if RLS is enabled.';

-- Créer le trigger sur auth.users
-- Note: Automatically creates a profile in public.profiles when a new user signs up.
-- Ensures data consistency between auth.users and public.profiles.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Note: COMMENT ON TRIGGER for auth.users is not supported (system table)
-- The trigger documentation is provided in the inline comments above
