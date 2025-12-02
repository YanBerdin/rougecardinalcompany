-- Fix TASK026B: Add SET search_path to reorder_team_members function
-- Issue #26: Database Functions Compliance
-- Security: Prevents schema injection attacks

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

comment on function public.reorder_team_members(jsonb) is 
'Atomically reorders team members. SECURITY DEFINER with SET search_path for schema injection protection.';
