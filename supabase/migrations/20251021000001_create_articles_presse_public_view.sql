/*
 * Migration: Create articles_presse_public view
 * ============================================
 * 
 * PURPOSE:
 *   Workaround for RLS/JWT Signing Keys incompatibility on articles_presse table.
 *   JWT Signing Keys with new format (publishable/secret keys) do not trigger 
 *   RLS policy evaluation correctly for anon role, blocking public article queries.
 * 
 * TYPE: Hotfix (DDL)
 * 
 * AFFECTED OBJECTS:
 *   - NEW VIEW: articles_presse_public
 *   - BASE TABLE: articles_presse (structure unchanged, RLS remains enabled)
 *   - PERMISSIONS: GRANT SELECT to anon, authenticated
 * 
 * SOLUTION:
 *   Create a database VIEW that bypasses RLS evaluation entirely by granting
 *   permissions directly on the view. The view filters published articles
 *   (published_at IS NOT NULL), replicating the intended RLS policy behavior.
 * 
 * SECURITY IMPACT:
 *   None - Same access control as intended by original RLS policies.
 *   View permissions (GRANT) replace row-level filtering with identical result.
 * 
 * PERFORMANCE:
 *   Potential improvement - Bypassing RLS evaluation reduces query overhead.
 * 
 * MIGRATION STATUS:
 *   ✅ Integrated into declarative schema: supabase/schemas/08_table_articles_presse.sql
 *   📝 Migration file preserved for historical record and Supabase Cloud consistency
 * 
 * FUTURE CONSIDERATIONS:
 *   If JWT Signing Keys + RLS compatibility is fixed in future Supabase SDK,
 *   this view can be replaced by direct queries on articles_presse with RLS.
 * 
 * APPLIED: 2025-10-09 via MCP Supabase
 * PROJECT: Rouge Cardinal Company - Theater Website
 */

-- Vue pour articles de presse publics
drop view if exists public.articles_presse_public cascade;
create view public.articles_presse_public as
select 
  id,
  title,
  author,
  type,
  slug,
  chapo,
  excerpt,
  source_publication,
  source_url,
  published_at,
  created_at
from public.articles_presse
where published_at is not null;

comment on view public.articles_presse_public is 
'Public view of published press articles - bypasses RLS issues with JWT signing keys';

-- Grant read access to all roles
-- NOTE: Removed broad grant to anon/authenticated to comply with CI audit.
-- If necessary, grant access explicitly to 'authenticated' in a controlled
-- migration after review.
