-- 20251204133540_create_reorder_hero_slides_function.sql
--
-- Purpose: Create reorder_hero_slides function for admin drag-and-drop reordering
-- Reason: Migration 20251126001251 marked as applied but function was not created
--         (pg_net extension failure caused partial migration execution)
--
-- Affected objects:
--   - public.reorder_hero_slides(jsonb) function
--
-- ✅ **Intégré au schéma déclaratif** : `supabase/schemas/63b_reorder_hero_slides.sql`
-- 📝 **Migration conservée** pour l'historique et la cohérence avec Supabase Cloud

/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Atomic reordering operation requires UPDATE on multiple rows
 *   2. Must bypass RLS to update all positions in single transaction
 *   3. Admin-only operation (explicit is_admin() check enforced)
 *   4. Prevents race conditions with advisory lock
 * 
 * Risks Evaluated:
 *   - Authorization: Explicit is_admin() check at function start
 *   - Input validation: JSONB structure validated, numeric positions enforced
 *   - Concurrency: Advisory lock prevents simultaneous reorders
 *   - Data integrity: Transaction ensures all-or-nothing updates
 * 
 * Validation:
 *   - Tested with admin user: reorder succeeds
 *   - Tested with non-admin user: authorization denied
 *   - Tested concurrent calls: advisory lock prevents conflicts
 */
create or replace function public.reorder_hero_slides(order_data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Authorization check (defense-in-depth)
  if not (select public.is_admin()) then
    raise exception 'permission denied: admin role required';
  end if;

  -- Advisory lock to prevent concurrent updates
  perform pg_advisory_xact_lock(hashtext('reorder_hero_slides'));

  -- Input validation
  if jsonb_typeof(order_data) is distinct from 'array' then
    raise exception 'order_data must be a json array';
  end if;

  -- Process updates
  update public.home_hero_slides as h
  set position = (item->>'position')::integer
  from jsonb_array_elements(order_data) as item
  where h.id = (item->>'id')::bigint;

end;
$$;

-- Grant execute to authenticated users (admin check is inside the function)
grant execute on function public.reorder_hero_slides(jsonb) to authenticated;

comment on function public.reorder_hero_slides is 'Reorder hero slides by updating position values. Requires admin role.';
