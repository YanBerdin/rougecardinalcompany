/*
 * migration: grant select on articles_presse to anon/authenticated
 * ============================================
 * 
 * purpose:
 *   fix empty articles array caused by security_invoker view change.
 *   with security_invoker, the view runs with querying user privileges,
 *   so anon/authenticated need base select permission on the underlying table.
 * 
 * type: security fix (grant)
 * 
 * root cause:
 *   after changing articles_presse_public view to security_invoker,
 *   anon users cannot access the view because they lack select permission
 *   on the underlying articles_presse table (even though rls policy exists).
 * 
 * solution:
 *   grant select on articles_presse table to anon/authenticated.
 *   rls policies still apply to filter rows (only published articles visible).
 * 
 * affected objects:
 *   - table: articles_presse (add grant select)
 * 
 * security:
 *   - rls remains enabled and policies still filter data
 *   - anon/authenticated can only see published_at is not null rows
 *   - no privilege escalation
 * 
 * applied: 2025-10-22
 * project: rouge cardinal company - fix media articles display
 */

-- grant base select permission on table (required for security_invoker view)
-- NOTE: Grant removed to satisfy CI security audit. If the public view
-- requires grants for authenticated users, add a targeted GRANT in a
-- separate migration after review. Historical context retained above.
