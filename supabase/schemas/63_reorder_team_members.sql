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
-- Usage (from supabase/dal):
--   select public.reorder_team_members('[{"id":12,"ordre":1},{"id":45,"ordre":2}]'::jsonb);

/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Allows controlled atomic updates to membres_equipe.ordre column
 *   2. Bypasses RLS to perform batch updates efficiently
 *   3. Uses advisory locking to prevent concurrent reordering conflicts
 *   4. Must work regardless of individual row-level permissions
 * 
 * Risks Evaluated:
 *   - Authorization: Explicit is_admin() check enforces admin-only access (defense-in-depth)
 *   - Input validation: Validates JSON array structure, checks for duplicate IDs/ordre values
 *   - Concurrency: Advisory lock (hashtext('reorder_team_members')) prevents race conditions
 *   - SQL injection: Uses parameterized queries with format() and $1 placeholder
 *   - Data integrity: Atomic transaction ensures all-or-nothing updates
 * 
 * Validation:
 *   - Tested with valid reorder operations (admin user)
 *   - Tested authorization denial (non-admin user)
 *   - Tested concurrent reorder attempts (advisory lock prevents conflicts)
 *   - Tested invalid inputs (empty array, duplicates, non-array JSON)
 * 
 * Grant Policy:
 *   - EXECUTE granted to authenticated role only (not anon)
 *   - Requires manual review before granting to additional roles
 */
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
$$ language plpgsql security definer set search_path = '';

-- grant execute to authenticated so only authenticated users (admin UI / server) can execute the rpc
grant execute on function public.reorder_team_members(jsonb) to authenticated;
