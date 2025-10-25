# Security Audit - Grant Revocation Summary

**Date:** 2025-10-25  
**Branch:** feature/backoffice  
**Issue:** CI security audit detected database objects exposed to PUBLIC/anon/authenticated roles

## Problem

The security audit script (`supabase/scripts/audit_grants.sql`) detected broad table-level grants that bypass RLS (Row Level Security) policies. These grants were likely remnants from old migrations or initial setup.

## Root Cause

**Anti-pattern:** Table-level grants (e.g., `GRANT SELECT ON TABLE foo TO authenticated`) **short-circuit RLS policies**, making the policies ineffective.

**Best practice:** Use RLS policies exclusively for access control. Avoid table-level grants to PUBLIC/anon/authenticated.

## Migrations Created

### Round 1: Initial exposed objects (20251025181000)

**File:** `20251025181000_revoke_final_exposed_objects.sql`

Revoked grants on:

- `information_schema.administrable_role_authorizations` → PUBLIC
- `public.content_versions` → authenticated
- `public.content_versions_detailed` → authenticated
- `public.evenements` → authenticated
- `public.home_about_content` → authenticated

### Round 2: Additional exposed tables (20251025182000)

**File:** `20251025182000_revoke_new_exposed_objects.sql`

Revoked grants on:

- `public.home_hero_slides` → authenticated
- `public.lieux` → authenticated
- `public.logs_audit` → authenticated
- `public.medias` → authenticated

### Round 3: Team members and contact messages (20251025183000)

**File:** `20251025183000_revoke_membres_messages_views.sql`

Revoked grants on:

- `public.membres_equipe` → authenticated (table)
- `public.membres_equipe_admin` → authenticated (view)
- `public.messages_contact` → authenticated (table)
- `public.messages_contact_admin` → authenticated (view)

### Round 4: Partners, profiles and tag views (20251025184000)

**File:** `20251025184000_revoke_final_round_partners_profiles.sql`

Revoked grants on:

- `public.partners` → authenticated (table)
- `public.partners_admin` → authenticated (view)
- `public.popular_tags` → authenticated (view)
- `public.profiles` → authenticated (table)

### Round 5: SEO, spectacles and categories (20251025185000)

**File:** `20251025185000_revoke_seo_spectacles_final.sql`

Revoked grants on:

- `public.seo_redirects` → authenticated (table)
- `public.sitemap_entries` → authenticated (table)
- `public.spectacles` → authenticated (table)
- `public.spectacles_categories` → authenticated (junction table)
- `information_schema.administrable_role_authorizations` → PUBLIC (retry)

### Round 6: Spectacles junction tables and tags (20251025190000)

**File:** `20251025190000_revoke_junction_tables_final.sql`

Revoked grants on:

- `public.spectacles_medias` → authenticated (junction table)
- `public.spectacles_membres_equipe` → authenticated (junction table)
- `public.spectacles_tags` → authenticated (junction table)
- `public.tags` → authenticated (table)
- `information_schema.administrable_role_authorizations` → PUBLIC (retry)

### Round 7: Realtime System Tables (2025-10-25)

**Objects secured:** 3

- `realtime.messages` (authenticated)
- `realtime.schema_migrations` (authenticated, anon)
- `realtime.subscription` (anon, authenticated)

**Status:** ⚠️ Migration updated - awaiting application
**Migration files:**

- `20251025191000_revoke_realtime_schema.sql` (initial - updated to revoke both roles)
- `20251025192000_revoke_realtime_subscription_authenticated.sql` (補完 - specific fix for authenticated)

**Issue:** CI detected `realtime.subscription` was still exposed to `authenticated` after Round 7
**Fix:** Created Round 7b migration to specifically revoke authenticated role

## Total Impact

**28 objects secured:**

- 15 tables (seo_redirects, sitemap_entries, spectacles, partners, profiles, membres_equipe, messages_contact, content_versions, evenements, home_about_content, home_hero_slides, lieux, logs_audit, medias, tags)
- 4 junction tables (spectacles_categories, spectacles_medias, spectacles_membres_equipe, spectacles_tags)
- 4 admin views (partners_admin, membres_equipe_admin, messages_contact_admin, content_versions_detailed)
- 1 tag view (popular_tags)
- 3 Supabase Realtime system tables (messages, schema_migrations, subscription)
- 1 PostgreSQL system view (information_schema.administrable_role_authorizations)

## Security Model After Fix

### Access Control Strategy

All access is now controlled **exclusively through RLS policies**:

```sql
-- ❌ BEFORE (insecure - bypasses RLS)
GRANT SELECT ON TABLE public.medias TO authenticated;

-- ✅ AFTER (secure - RLS enforced)
CREATE POLICY "Medias are viewable by everyone"
  ON public.medias FOR SELECT
  TO anon, authenticated
  USING (true);
```

### Views Security

All admin views use `SECURITY INVOKER` to ensure queries run with the user's privileges:

```sql
-- Example: membres_equipe_admin view
CREATE VIEW public.membres_equipe_admin
WITH (security_invoker = true)  -- ✅ Runs with user privileges
AS SELECT ...;
```

**Why this matters:**

- `SECURITY DEFINER` (default) → runs with creator (postgres) privileges → **dangerous**
- `SECURITY INVOKER` → runs with querying user privileges → **safe**

## RLS Policies Summary

### Public Tables (Read Access)

Tables with public read access via RLS (no grants needed):

| Table | Read Policy | Write Policy |
|-------|-------------|--------------|
| `home_hero_slides` | anon, authenticated (active + dates) | Admin only |
| `lieux` | anon, authenticated | Admin only |
| `spectacles` | anon, authenticated (public=true) | Admin only |
| `medias` | anon, authenticated (tous) | Authenticated upload, Admin manage |
| `membres_equipe` | anon, authenticated | Admin only |
| `partners` | anon, authenticated (active) | Admin only |
| `evenements` | anon, authenticated | Admin only |
| `home_about_content` | anon, authenticated | Admin only |
| `content_versions` | Admin only | System + Admin |
| `profiles` | Public (own + public profiles) | Owner only |
| `seo_redirects` | Admin only | Admin only |
| `sitemap_entries` | Public (if indexed) | Admin only |

### Admin-Only Tables

Tables accessible only to admins:

- `logs_audit` (system logs)
- `content_versions_detailed` (versioning metadata)

### Special Cases

- `messages_contact`: Public insert (contact form), Admin read
- `messages_contact_admin`: Admin-only view (SECURITY INVOKER)
- `membres_equipe_admin`: Admin-only view (SECURITY INVOKER)
- `partners_admin`: Admin-only view with versioning (SECURITY INVOKER)
- `popular_tags`: Public read view for tag statistics (SECURITY INVOKER)

## Verification

### Manual Test (SQL Editor)

Run `supabase/scripts/quick_audit_test.sql` in Supabase SQL Editor:

- **Expected result:** 0 rows (no exposed objects)

### Automated Test (CI)

The CI workflow `.github/workflows/reorder-sql-tests.yml` runs:

1. `supabase db push --linked` (apply migrations)
2. `psql ... -f audit_grants.sql` (audit for exposed objects)
3. Fails if any objects are exposed

## Best Practices Going Forward

### ✅ DO

1. **Define RLS policies** in the declarative schema (`supabase/schemas/`)
2. **Use `SECURITY INVOKER`** for all views
3. **Test access** with different roles (anon, authenticated, admin)
4. **Run audit script** before merging PRs
5. **Document access requirements** in migration comments

### ❌ DON'T

1. **Never use** `GRANT ... TO PUBLIC/anon/authenticated` on tables
2. **Avoid** `SECURITY DEFINER` views (unless absolutely necessary)
3. **Don't bypass** RLS with table-level grants
4. **Don't assume** grants are needed for access (use RLS instead)

## References

- **Audit Script:** `supabase/scripts/audit_grants.sql`
- **Quick Test:** `supabase/scripts/quick_audit_test.sql`
- **Declarative Schema:** `supabase/schemas/README.md`
- **RLS Policies:** `supabase/schemas/61_rls_main_tables.sql`, `62_rls_advanced_tables.sql`
- **Security Documentation:** `.github/copilot/Create_RLS_policies.Instructions.md`

## Next Steps

1. ✅ All 7 migrations applied to cloud database (verified with `db push`)
2. 🔍 **Pending:** CI workflow run to confirm security audit passes with 0 exposed objects
3. ⏳ **Pending:** If CI passes, merge PR; if new objects detected, create Round 8
4. 📝 **Follow-up:** Document this pattern in team guidelines

---

**Status:** ✅ All 28 known exposed objects revoked via 7 idempotent migrations  
**Database Status:** ✅ Remote database confirmed up to date  
**Last Updated:** 2025-10-25  
**Author:** Security Audit Remediation
