# ⚠️ DEPRECATED - Security Audit Documentation

> **❌ CRITICAL WARNING - THIS DOCUMENT DESCRIBES A FAILED SECURITY CAMPAIGN**
>
> **Date of Incident:** October 27, 2025 02:00
> **Status:** ❌ DEPRECATED - DO NOT USE AS REFERENCE
> **Replacement:** See `doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md`
>
> This document is preserved **only for historical purposes** and to serve as a warning against incorrect security assumptions.

---

# Security Audit - Grant Revocation Summary (❌ FAILED CAMPAIGN)

**Date:** 2025-10-25 to 2025-10-26  
**Branch:** feature/backoffice  
**Original Claim:** "CI security audit detected database objects exposed to PUBLIC/anon/authenticated roles"  
**Actual Result:** **PRODUCTION FAILURE** - Entire application broken for 8 hours

## ❌ FLAWED PROBLEM STATEMENT

**Original claim:**
> "The security audit script detected broad table-level grants that bypass RLS (Row Level Security) policies."

**Reality:**
Table-level grants DO NOT bypass RLS. They are REQUIRED for RLS to function.

## ❌ INCORRECT ROOT CAUSE ANALYSIS

**Original claim:**
> "Anti-pattern: Table-level grants short-circuit RLS policies, making the policies ineffective."
> "Best practice: Use RLS policies exclusively for access control."

**Reality:**
This is **architecturally incorrect**. PostgreSQL security model requires:

1. **GRANT (table-level)** - Controls WHO can access the table structure
2. **RLS (row-level)** - Controls WHICH rows within accessible tables

**Without GRANT, PostgreSQL returns "permission denied" BEFORE evaluating RLS policies.**

## ❌ ACTUAL RESULT OF CAMPAIGN

### Rounds 1-17 Summary (Oct 25-26, 2025)

**Claimed:** "73 objects secured"  
**Reality:** **73 objects BROKEN**

**Breakdown:**

- 21 business tables → **21 tables inaccessible**
- 5 junction tables → **5 relations broken**
- 6 admin views → **6 views returning permission denied**
- 31 functions → **31 functions failing with "permission denied for function"**
- 10 system tables → **Correctly whitelisted** (only positive outcome)

### Production Impact (October 27, 2025)

**02:00** - Production DOWN  
**Errors reported:**

- "permission denied for table home_hero_slides" (PostgreSQL 42501)
- "permission denied for table evenements"
- "permission denied for view articles_presse_public"
- "permission denied for table logs_audit"
- "permission denied for function create_content_version"

**Pages affected:**

- Homepage (7 DAL functions failing)
- All public pages
- All admin pages
- Authentication system
- Content management

**Duration:** 8 hours until root cause identified and corrected

## ✅ CORRECT RESOLUTION (Oct 27, 2025)

### Emergency GRANT Restoration

Five emergency migrations created to restore GRANTs:

1. **20251027020000_restore_basic_grants_for_rls.sql** - 9 critical tables
2. **20251027021000_restore_remaining_grants.sql** - 26 remaining tables
3. **20251027021500_restore_views_grants.sql** - 11 views
4. **20251027022000_fix_logs_audit_grants.sql** - Audit trigger permissions
5. **20251027022500_grant_execute_all_trigger_functions.sql** - 15 trigger functions

**Total restored:** 59 database objects  
**Result:** Production operational again

### Correct Security Model

```sql
-- ✅ CORRECT: GRANT + RLS work TOGETHER
-- Step 1: GRANT table-level access
GRANT SELECT ON TABLE public.spectacles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.spectacles TO authenticated;

-- Step 2: RLS filters which rows
CREATE POLICY "Public spectacles are viewable by everyone"
  ON public.spectacles FOR SELECT
  TO anon, authenticated
  USING (public = true);

CREATE POLICY "Admins see all spectacles"
  ON public.spectacles FOR SELECT
  TO authenticated
  USING (is_admin());
```

**How it works:**

1. PostgreSQL checks GRANT first → "Can this role access this table?"
2. If GRANT exists, PostgreSQL then checks RLS → "Which rows can they see?"
3. Both layers = Defense in depth (correct security model)

## ❌ INCORRECT SECTIONS BELOW

The following sections describe the flawed campaign. They are preserved for historical reference but should NOT be used as guidance.

---

## Original (Incorrect) Migrations Created

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

**Status:** ✅ Migrations applied successfully
**Migration files:**

- `20251025191000_revoke_realtime_schema.sql` (initial - updated to revoke both roles)
- `20251025192000_revoke_realtime_subscription_authenticated.sql` (補完 - **APPLIED**)

**Issue:** CI detected `realtime.subscription` was still exposed to `authenticated` after Round 7  
**Fix:** Created Round 7b migration to specifically revoke authenticated role  
**Result:** ✅ Applied successfully with expected warnings on system columns (NOTICE: Revoked ALL on realtime.subscription from authenticated)

## Total Impact

**72 objects secured across 16 rounds:**

- 21 business tables (seo_redirects, sitemap_entries, spectacles, partners, profiles, membres_equipe, messages_contact, content_versions, evenements, home_about_content, home_hero_slides, lieux, logs_audit, medias, tags, categories, articles_presse_public, articles_tags, etc.)
- 5 junction tables (spectacles_categories, spectacles_medias, spectacles_membres_equipe, spectacles_tags, articles_tags)
- 6 admin views (partners_admin, membres_equipe_admin, messages_contact_admin, content_versions_detailed, popular_tags, categories_hierarchy)
- **4 Realtime system tables** (messages, schema_migrations, subscription + 1) - **WHITELISTED**
- **6 Storage system tables** (buckets, buckets_analytics, objects, prefixes, s3_multipart_uploads, s3_multipart_uploads_parts) - **WHITELISTED**
- **30 functions**:
  - **14 trigger functions**: 10 versioning triggers (spectacles, membres_equipe, partners, evenements, articles, communiques, compagnie_presentation_sections, compagnie_stats, compagnie_values), audit_trigger, handle_new_user, handle_user_deletion, handle_user_update, set_messages_contact_consent_timestamp, set_slug_if_empty
  - **5 admin functions**: reorder_team_members, restore_content_version, validate_communique_creation, validate_rrule, create_content_version
  - **5 analytics/search/utility functions**: track_analytics_event, to_tsvector_french, show_trgm (partial), generate_slug, get_current_timestamp
  - **3 auth helper functions**: is_admin, handle_new_user, handle_user_deletion
  - **3 pg_trgm functions**: show_limit, show_trgm (complete), gin_trgm_triconsistent

### Campaign Timeline (Oct 25-26, 2025)

**Round 1-7** (Oct 25): Initial 28 business objects  
**Round 7b補完** (Oct 25): realtime.subscription authenticated fix  
**Round 8** (Oct 26 08:00): 6 objects - articles_presse tables + trigger functions  
**Round 9** (Oct 26 09:00): 6 objects - categories + analytics functions  
**Round 10** (Oct 26 10:00): 3 objects - storage.buckets + search utilities  
**Round 11** (Oct 26 11:00): 3 objects - storage.buckets_analytics + persistent pg_trgm  
**Round 12** (Oct 26 12:00): 5 objects - storage.objects (CRITICAL!) + business functions  
**Round 13** (Oct 26 13:00): 5 objects - storage.prefixes + versioning/auth functions  
**Round 14** (Oct 26 14:00): 4 objects - storage.s3_multipart_uploads + auth triggers  
**Round 15** (Oct 26 15:00): 5 objects - storage.s3_multipart_uploads_parts + utilities  
**Round 16** (Oct 26 16:00): 6 objects - Final versioning triggers cleanup

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

1. ✅ All 7 migrations + Round 7b applied to cloud database
2. ✅ **Audit script updated** - Now uses filtered version excluding system objects
3. 🔍 **CI will now pass** - Whitelist excludes:
   - `information_schema.*` (PostgreSQL system catalog - safe)
   - `realtime.*` (Supabase Realtime system tables - managed internally)
   - `pg_catalog.*`, `pg_toast.*` (PostgreSQL internal schemas)
4. 📝 **Focus on real security** - Audit now detects only business data exposures

### Whitelisted System Objects (Safe/Expected)

These objects are intentionally excluded from the audit as they are:

- ✅ **PostgreSQL or Supabase system objects**
- ✅ **Not containing user/business data**
- ✅ **Managed by the database engine**
- ✅ **Low security risk**

**Excluded objects:**

- `information_schema.administrable_role_authorizations` (PostgreSQL system view)
- `realtime.messages` (Supabase Realtime internal queue)
- `realtime.schema_migrations` (Supabase Realtime migration metadata)
- `realtime.subscription` (Supabase Realtime WebSocket tracking)

**Audit script:** `supabase/scripts/audit_grants_filtered.sql`  
**Original (unfiltered):** `supabase/scripts/audit_grants.sql` (kept for reference)

---

## ✅ CORRECT APPROACH - LESSONS LEARNED

### What Should Have Been Done

**Correct security audit questions:**

1. ✅ "Are RLS policies enabled on all tables?" (Answer: Yes)
2. ✅ "Are RLS policies correctly filtering rows?" (Answer: Yes)
3. ✅ "Are there overly permissive RLS policies?" (Answer: No - all policies have proper checks)
4. ❌ "Should we remove all GRANTs?" (Answer: NO - PostgreSQL requires them)

### Correct Security Model Documentation

**PostgreSQL requires TWO security layers:**

```sql
-- Layer 1: Table-level permissions (GRANT)
-- Controls: WHO can access the table structure
-- Check: Happens FIRST
GRANT SELECT ON TABLE public.spectacles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.spectacles TO authenticated;

-- Layer 2: Row-level permissions (RLS)
-- Controls: WHICH rows within accessible tables
-- Check: Happens SECOND (only if GRANT passed)
CREATE POLICY "Public spectacles viewable by everyone"
  ON public.spectacles FOR SELECT
  TO anon, authenticated
  USING (public = true);
```

**Without GRANT:** PostgreSQL returns `permission denied for table` (42501) BEFORE checking RLS.

### Real Security Issues That Should Be Audited

1. ✅ **Overly permissive RLS policies** - `USING (true)` without good reason
2. ✅ **Missing RLS on sensitive tables** - Tables without `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
3. ✅ **SECURITY DEFINER functions** - Functions that bypass RLS should be carefully reviewed
4. ✅ **Leaked credentials** - API keys, passwords in code or logs
5. ✅ **SQL injection vulnerabilities** - Unparameterized queries
6. ❌ **Table-level GRANTs** - These are REQUIRED, not a security issue

### Tools That Led to the Error

**Flawed tools (DO NOT USE):**

- `supabase/scripts/audit_grants.sql` (unfiltered) - Flags all GRANTs as "exposed"
- `supabase/scripts/audit_grants_filtered.sql` - Still based on flawed premise
- `.github/workflows/check-security-audit.sh` - Fails CI when GRANTs exist

**Reason:** These tools assume "no GRANTs = secure" which is incorrect.

**Correct approach:**

- Audit RLS policies for overly permissive rules
- Verify RLS is enabled on all tables
- Test actual access patterns with different roles
- Use `SET ROLE authenticated` to simulate user access

### References

- ✅ **Incident Post-Mortem:** `doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md`
- ✅ **Emergency Migrations:** `supabase/migrations/20251027*.sql` (5 files)
- ✅ **PostgreSQL Security Documentation:** [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- ❌ **This document (deprecated):** Historical reference only

---

## 🚨 FINAL WARNING

**DO NOT:**

- Use this document as a security reference
- Replicate the migrations described above (Rounds 1-17)
- Assume "RLS-only" is sufficient
- Remove table-level GRANTs

**DO:**

- Read the post-mortem: `doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md`
- Understand PostgreSQL security requires GRANT + RLS
- Test access with `SET ROLE authenticated` before production
- Focus security audits on RLS policy logic, not GRANT existence

**Preserved for:** Historical reference and learning from mistakes  
**Status:** ❌ DEPRECATED - DO NOT REPLICATE  
**Date:** October 27, 2025

---

**Author:** Security Audit Remediation Campaign (Oct 25-26, 2025) - FAILED  
**Corrected by:** Emergency Incident Response (Oct 27, 2025) - SUCCESSFUL
