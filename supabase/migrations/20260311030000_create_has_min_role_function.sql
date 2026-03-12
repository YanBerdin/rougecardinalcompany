-- Migration: Create has_min_role() function
-- Purpose: Hierarchical role checking function for editor role permissions
-- Prerequisite: profiles table with role column must exist (created in 20250918000002)
-- Affected: public.has_min_role(text) function (new)

-- Fonction helper pour vérifier un rôle minimum dans la hiérarchie user < editor < admin
/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Needs access to auth.uid() which requires authentication context
 *   2. Must read profiles table reliably across different security contexts
 *   3. Used by RLS policies for hierarchical role authorization checks
 *   4. Marked STABLE since auth.uid() and profiles.role remain constant during transaction
 * 
 * Risks Evaluated:
 *   - Read-only operation (SELECT only, no mutations)
 *   - Input parameter validated against fixed enum (no injection risk)
 *   - Simple boolean return value
 *   - Used in RLS policies (must be reliable and secure)
 * 
 * Validation:
 *   - admin calling has_min_role('editor') → true
 *   - editor calling has_min_role('editor') → true
 *   - user calling has_min_role('editor') → false
 *   - any role calling has_min_role('user') → true
 *   - invalid required_role → false
 * 
 * Grant Policy:
 *   - Implicitly callable via RLS policies by authenticated and anon roles
 */
create or replace function public.has_min_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select
        case p.role
          when 'admin' then 2
          when 'editor' then 1
          else 0
        end
        >=
        case required_role
          when 'admin' then 2
          when 'editor' then 1
          when 'user' then 0
          else 3
        end
      from public.profiles p
      where p.user_id = auth.uid()
    ),
    false
  );
$$;

comment on function public.has_min_role(text) is 
'Helper function: Checks if current user has at least the specified role in the hierarchy user(0) < editor(1) < admin(2). Invalid required_role returns false. Uses SECURITY DEFINER like is_admin() for reliable RLS policy usage.';
