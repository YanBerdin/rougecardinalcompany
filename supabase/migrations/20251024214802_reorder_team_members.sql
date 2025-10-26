-- 20251024214802_reorder_team_members.sql
-- Migration: add atomic reorder RPC for membres_equipe
-- Generated from declarative schema: supabase/schemas/63_reorder_team_members.sql
-- This migration creates the function and grants EXECUTE to the
-- `authenticated` role. Do NOT grant to `anon`.

begin;

/*
  Purpose: provide an atomic, server-side operation to reorder rows in
  the `public.membres_equipe` table. This function accepts a jsonb array of
  objects with shape {"id": <int>, "ordre": <int>} and applies all updates
  in a single transaction. It performs input validation, rejects duplicates,
  and acquires a transaction-scoped advisory lock to avoid concurrent
  reordering races.

  Security: defined as SECURITY DEFINER and performs an authorization check
  via public.is_admin(). This migration also grants EXECUTE to `authenticated`.
*/

CREATE OR REPLACE FUNCTION public.reorder_team_members(items jsonb)
RETURNS void AS $$
DECLARE
  ids int[];
  ords int[];
  when_clauses text;
BEGIN
  -- basic validation: must be a json array
  IF jsonb_typeof(items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'items must be a json array';
  END IF;

  -- authorization: ensure caller is admin (defense-in-depth)
  IF NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  -- acquire a transaction-scoped advisory lock to avoid concurrent reorders
  PERFORM pg_advisory_xact_lock(hashtext('reorder_team_members'));

  -- extract ids and ordre arrays
  ids := array(SELECT (elem->>'id')::int FROM jsonb_array_elements(items) AS elem);
  ords := array(SELECT (elem->>'ordre')::int FROM jsonb_array_elements(items) AS elem);

  IF array_length(ids, 1) IS NULL OR array_length(ids, 1) = 0 THEN
    RAISE EXCEPTION 'items array must not be empty';
  END IF;

  -- no duplicate ids allowed
  IF (SELECT count(*) FROM (SELECT unnest(ids) AS v) s) <> (SELECT count(DISTINCT v) FROM (SELECT unnest(ids) AS v) s) THEN
    RAISE EXCEPTION 'duplicate id in items';
  END IF;

  -- no duplicate ordre allowed
  IF (SELECT count(*) FROM (SELECT unnest(ords) AS v) s) <> (SELECT count(DISTINCT v) FROM (SELECT unnest(ords) AS v) s) THEN
    RAISE EXCEPTION 'duplicate ordre in items';
  END IF;

  -- build when clauses for case expression
  SELECT string_agg(format('when %s then %s', (elem->>'id')::int, (elem->>'ordre')::int), ' ')
  INTO when_clauses
  FROM jsonb_array_elements(items) AS elem;

  IF when_clauses IS NULL OR when_clauses = '' THEN
    RAISE EXCEPTION 'no valid updates generated';
  END IF;

  -- execute a single atomic update using case
  EXECUTE format(
    'UPDATE public.membres_equipe SET ordre = CASE id %s END WHERE id = ANY ($1)',
    when_clauses
  ) USING ids;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated role (do not grant to anon)
GRANT EXECUTE ON FUNCTION public.reorder_team_members(jsonb) TO authenticated;

commit;
