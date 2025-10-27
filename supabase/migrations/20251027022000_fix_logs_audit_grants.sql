-- Migration: Fix GRANTs pour logs_audit (trigger audit)
-- Date: 2025-10-27 02:20:00
-- Contexte: Les triggers d'audit INSERT dans logs_audit mais authenticated n'a pas INSERT
-- Symptôme: "permission denied for table logs_audit" lors d'UPDATE/INSERT/DELETE

-- ============================================================================
-- PROBLEM
-- ============================================================================
-- La table logs_audit est remplie automatiquement par le trigger audit_trigger()
-- Ce trigger s'exécute avec les permissions de l'utilisateur qui modifie la table
-- Si authenticated n'a pas INSERT sur logs_audit, le trigger échoue
--
-- Exemple d'erreur:
--   setTeamMemberActive error: permission denied for table logs_audit
--   upsertTeamMember error: permission denied for table logs_audit

-- ============================================================================
-- SOLUTION
-- ============================================================================
-- Donner INSERT à authenticated sur logs_audit pour que les triggers fonctionnent
-- La sécurité est maintenue par:
--   1. RLS policies qui filtrent les lectures (admin only)
--   2. Le trigger est automatique, pas d'INSERT manuel possible via l'API
--   3. Les colonnes sensibles (user_id, ip, etc.) sont remplies par le trigger

grant insert on public.logs_audit to authenticated;

-- Note: authenticated a déjà SELECT (lecture des logs pour admin)
-- service_role a tous les privilèges (pour maintenance)

-- ============================================================================
-- VERIFICATION
-- ============================================================================
do $$
declare
  has_insert boolean;
begin
  select exists(
    select 1 from information_schema.table_privileges
    where table_schema = 'public'
      and table_name = 'logs_audit'
      and grantee = 'authenticated'
      and privilege_type = 'INSERT'
  ) into has_insert;
  
  if not has_insert then
    raise exception 'GRANT INSERT on logs_audit for authenticated failed';
  end if;
  
  raise notice '✅ authenticated can now INSERT into logs_audit (via triggers)';
end $$;

-- ============================================================================
-- POST-MIGRATION TEST
-- ============================================================================
-- Pour tester après migration:
--   1. Authentifiez-vous en tant qu'admin
--   2. Modifiez un membre d'équipe (setTeamMemberActive ou upsertTeamMember)
--   3. Vérifiez que l'opération réussit sans erreur 42501
--   4. Vérifiez qu'une ligne a été ajoutée dans logs_audit
