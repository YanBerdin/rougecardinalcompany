-- 20251024215130_check_grants_membres_equipe.sql
-- Check grants for public.membres_equipe table and reorder_team_members function
-- This migration only reads catalog views and emits NOTICE messages with the
-- list of grantees for SELECT on the table and EXECUTE on the function.

BEGIN;

DO $$
DECLARE
  table_grantees text;
  func_grantees text;
BEGIN
  SELECT coalesce(string_agg(distinct grantee, ', '), 'none')
    INTO table_grantees
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public'
    AND table_name = 'membres_equipe'
    AND privilege_type = 'SELECT';

  SELECT coalesce(string_agg(distinct grantee, ', '), 'none')
    INTO func_grantees
  FROM information_schema.role_routine_grants
  WHERE specific_schema = 'public'
    AND routine_name = 'reorder_team_members'
    AND privilege_type = 'EXECUTE';

  RAISE NOTICE 'grants SELECT ON public.membres_equipe: %', table_grantees;
  RAISE NOTICE 'grants EXECUTE ON public.reorder_team_members(jsonb): %', func_grantees;
END
$$ LANGUAGE plpgsql;

COMMIT;
