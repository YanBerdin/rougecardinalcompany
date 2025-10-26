-- 20251024231855_restrict_reorder_execute.sql
-- purpose: restrict execute permission on public.reorder_team_members(jsonb)
-- affected objects:
--   - function public.reorder_team_members(jsonb)
-- rationale:
--   - revoke broad execute grants (public/anon) to reduce attack surface
--   - grant execute only to authenticated role (admin UI and server clients)
-- notes:
--   - this is a manual hotfix migration applied to supabase cloud. the
--     declarative schema remains authoritative; ensure supabase/schemas/* is
--     updated if this change should be permanent in the schema files.

begin;

-- revoke execute from public and anon to remove wide open access
revoke execute on function public.reorder_team_members(jsonb) from public;
revoke execute on function public.reorder_team_members(jsonb) from anon;

-- grant execute only to authenticated role. do not grant to anon.
grant execute on function public.reorder_team_members(jsonb) to authenticated;

-- diagnostic: print current grantees for verification
do $$
declare
  func_grantees text;
begin
  select coalesce(string_agg(distinct grantee, ', '), 'none')
    into func_grantees
  from information_schema.role_routine_grants
  where specific_schema = 'public'
    and routine_name = 'reorder_team_members'
    and privilege_type = 'EXECUTE';

  raise notice 'post-change grants EXECUTE ON public.reorder_team_members(jsonb): %', func_grantees;
end
$$ language plpgsql;

commit;
