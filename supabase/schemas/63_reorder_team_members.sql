-- 63_reorder_team_members.sql
--
-- Purpose: provide an atomic, server-side operation to reorder rows in
-- the `public.membres_equipe` table. this function accepts a jsonb array of
-- objects with shape {"id": <int>, "ordre": <int>} and applies all updates
-- in a single transaction. it performs input validation, rejects duplicates,
-- and acquires a transaction-scoped advisory lock to avoid concurrent
-- reordering races.
--
-- Affected objects:
--  - public.reorder_team_members(jsonb) function
--  - public.membres_equipe table (updates ordre column)
--
-- Security notes:
--  - this function is defined with security definer to allow controlled
--    updates regardless of caller privileges; however it enforces an
--    authorization check using public.is_admin() to prevent non-admin RPC
--    calls from performing changes (defense-in-depth).
--  - grant execute should be applied deliberately (e.g. to authenticated)
--    by migrations/ops only after review. do not grant to anon.
--
-- Usage (from supabase/dal):
--   select public.reorder_team_members('[{"id":12,"ordre":1},{"id":45,"ordre":2}]'::jsonb);

create or replace function public.reorder_team_members(items jsonb)
returns void as $$
declare
  ids int[];
  ords int[];
  when_clauses text;
begin
  -- basic validation: must be a json array
  if jsonb_typeof(items) is distinct from 'array' then
    raise exception 'items must be a json array';
  end if;

  -- authorization: ensure caller is admin (defense-in-depth)
  if not (select public.is_admin()) then
    raise exception 'permission denied';
  end if;

  -- acquire a transaction-scoped advisory lock to avoid concurrent reorders
  perform pg_advisory_xact_lock(hashtext('reorder_team_members'));

  -- extract ids and ordre arrays
  ids := array(select (elem->>'id')::int from jsonb_array_elements(items) as elem);
  ords := array(select (elem->>'ordre')::int from jsonb_array_elements(items) as elem);

  if array_length(ids, 1) is null or array_length(ids, 1) = 0 then
    raise exception 'items array must not be empty';
  end if;

  -- no duplicate ids allowed
  if (select count(*) from (select unnest(ids) as v) s) <> (select count(distinct v) from (select unnest(ids) as v) s) then
    raise exception 'duplicate id in items';
  end if;

  -- no duplicate ordre allowed
  if (select count(*) from (select unnest(ords) as v) s) <> (select count(distinct v) from (select unnest(ords) as v) s) then
    raise exception 'duplicate ordre in items';
  end if;

  -- build when clauses for case expression
  select string_agg(format('when %s then %s', (elem->>'id')::int, (elem->>'ordre')::int), ' ')
  into when_clauses
  from jsonb_array_elements(items) as elem;

  if when_clauses is null or when_clauses = '' then
    raise exception 'no valid updates generated';
  end if;

  -- execute a single atomic update using case
  execute format(
    'update public.membres_equipe set ordre = case id %s end where id = any ($1)',
    when_clauses
  ) using ids;

end;
$$ language plpgsql security definer;

-- grant execute on function public.reorder_team_members(jsonb) to authenticated;
