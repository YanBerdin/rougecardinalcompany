# Admin Views Security Hardening - Summary

**Date:** 2026-01-05  
**Migrations:**

- `20260105120000_admin_views_security_hardening.sql` (Admin views isolation)
- `20260105130000_fix_security_definer_views.sql` (🔴 **CRITICAL HOTFIX**)  
**Status:** ✅ **COMPLETE**

---

## 🚨 CRITICAL HOTFIX (2026-01-05 13:00 UTC)

**Migration:** `20260105130000_fix_security_definer_views.sql`  
**Severity:** 🔴 **CRITICAL** - RLS Bypass Vulnerability

### Problem Detected

Two views were running in `SECURITY DEFINER` mode, executing queries with the view owner's privileges instead of the caller's, **bypassing Row-Level Security policies**:

1. ❌ `communiques_presse_public` (public view owned by postgres)
2. ❌ `communiques_presse_dashboard` (admin view owned by admin_views_owner)

### Security Risks

| Risk | Impact |
| ------ | -------- |
| **RLS Bypass** | Users could see rows they shouldn't because RLS checks ran with definer's broad access |
| **Privilege Escalation** | Indirect reads/writes beyond user's intended permissions |
| **Least Privilege Violation** | Views exposed more data than intended security model |
| **Unexpected Behavior** | Developers assumed per-user RLS enforcement, which was broken |

### Fix Applied

Recreated both views with explicit `SECURITY INVOKER` mode:

```sql
-- Before (VULNERABLE)
create view communiques_presse_public as ...;  -- Defaults to SECURITY DEFINER!

-- After (SECURE)
create view communiques_presse_public
with (security_invoker = true)  -- ✅ Runs with caller's privileges
as ...;
```

### Validation

```sql
-- Query to verify fix:
SELECT relname, 
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_options_to_table(reloptions) 
    WHERE option_name = 'security_invoker' AND option_value = 'true'
  ) THEN 'SECURITY INVOKER ✅' ELSE 'SECURITY DEFINER ❌' END
FROM pg_class WHERE relname LIKE '%communiques%';

-- Result:
✅ communiques_presse_dashboard: SECURITY INVOKER
✅ communiques_presse_public: SECURITY INVOKER
```

**Status:** ✅ Applied to cloud + local, validated  
**Detection:** Supabase Security Advisor + user report  
**Root Cause:** Migration snapshot `20260103004430_remote_schema.sql` likely recreated views without `security_invoker` option

---

## 🎯 Primary Objective (Task 037)

Fix security vulnerability where admin views (e.g., `communiques_presse_dashboard`) were returning empty arrays instead of "permission denied" errors for non-admin users.

**Root Cause:** Supabase's `DEFAULT PRIVILEGES` were automatically granting `SELECT` to `anon` and `authenticated` roles on newly created views, even when explicit `REVOKE` statements existed in declarative schemas.

---

## 🔧 Solution: Role-Based Isolation

Created dedicated `admin_views_owner` role to isolate admin views from Supabase's automatic privilege grants.

### Migration Structure

```sql
-- Part 1: Create admin_views_owner role
create role admin_views_owner nologin noinherit;
grant usage on schema public to admin_views_owner;
grant create on schema public to admin_views_owner;
grant admin_views_owner to postgres, service_role;

-- Part 2: Transfer ownership of 7 admin views
alter view public.communiques_presse_dashboard owner to admin_views_owner;
alter view public.membres_equipe_admin owner to admin_views_owner;
alter view public.compagnie_presentation_sections_admin owner to admin_views_owner;
alter view public.partners_admin owner to admin_views_owner;
alter view public.content_versions_detailed owner to admin_views_owner;
alter view public.messages_contact_admin owner to admin_views_owner;
alter view public.analytics_summary owner to admin_views_owner;

-- Part 3: Explicitly revoke access from anon/authenticated
revoke all on public.communiques_presse_dashboard from anon, authenticated;
-- ... (repeated for all 7 views)

-- Part 4: Grant access to service_role only
grant select on public.communiques_presse_dashboard to service_role;
-- ... (repeated for all 7 views)

-- Part 5: Prevent future automatic grants
alter default privileges for role admin_views_owner in schema public 
  revoke all on tables from anon, authenticated;
```

### Critical Fix: Schema Permissions

Initially failed with `ERROR: permission denied for schema public` because `admin_views_owner` lacked schema-level permissions. **Solution:**

```sql
grant usage on schema public to admin_views_owner;
grant create on schema public to admin_views_owner; -- Required for ALTER VIEW owner
```

---

## 📁 Updated Files

### 1. Migration File

- **Path:** `supabase/migrations/20260105120000_admin_views_security_hardening.sql`
- **Lines:** 120+
- **Status:** ✅ Applied to local and cloud databases

### 2. Declarative Schemas (5 files)

All admin views updated with security configuration:

```sql
alter view public.<view_name> owner to admin_views_owner;
revoke all on public.<view_name> from anon, authenticated;
grant select on public.<view_name> to service_role;
```

| File | Views Updated |
| ------ | --------------- |
| `supabase/schemas/41_views_communiques.sql` | `communiques_presse_dashboard` |
| `supabase/schemas/41_views_admin_content_versions.sql` | `membres_equipe_admin`, `compagnie_presentation_sections_admin`, `partners_admin` |
| `supabase/schemas/15_content_versioning.sql` | `content_versions_detailed` |
| `supabase/schemas/10_tables_system.sql` | `messages_contact_admin` |
| `supabase/schemas/13_analytics_events.sql` | `analytics_summary` |

### 3. Validation & Test Scripts

#### `scripts/check-admin-views-owner.ts`

Validates all 7 admin views have correct ownership:

```bash
pnpm exec tsx scripts/check-admin-views-owner.ts
```

Expected output:

```bash
✅ All 7 admin views owned by admin_views_owner
```

#### `scripts/test-views-security-authenticated.ts`

Extended to test all 7 admin views with authenticated non-admin user:

```bash
pnpm exec tsx scripts/test-views-security-authenticated.ts
```

**Key Changes:**

- Added loop testing all 7 admin views
- Changed from `select('id')` to `select('*')` to handle aggregate views like `analytics_summary` (no `id` column)
- Strict assertion for "permission denied" error (code 42501)
- Detects empty array vulnerability

#### `scripts/check-views-security.ts`

Validates anon access is properly blocked:

```bash
pnpm exec tsx scripts/check-views-security.ts
```

### 4. Documentation

- **Path:** `supabase/migrations/migrations.md`
- **Content:** Comprehensive entry with problem context, 5-part solution, affected views, schema updates, validation scripts, test commands

---

## ✅ Validation Results

### Local Database (`db reset`)

```
Applying migration 20260105120000_admin_views_security_hardening.sql...
NOTICE (00000): Role admin_views_owner created
Finished supabase db reset on branch master.
```

### Cloud Database (`db push`)

```
Applying migration 20260105120000_admin_views_security_hardening.sql...
NOTICE (00000): Role admin_views_owner already exists
NOTICE (00000): role "postgres" has already been granted membership in role "admin_views_owner"
NOTICE (00000): role "service_role" has already been granted membership in role "admin_views_owner"
Finished supabase db push.
```

### Security Tests

#### Authenticated Non-Admin User

```
🧪 Running view tests as authenticated non-admin: test.user@rougecardinal.local

   ✅ articles_presse_public: 0 rows
   ✅ communiques_presse_public: 0 rows
   ✅ popular_tags: 0 rows
   ✅ categories_hierarchy: 5 rows

🔒 Testing admin views access (should be denied):

   ✅ communiques_presse_dashboard: correctly denied
   ✅ membres_equipe_admin: correctly denied
   ✅ compagnie_presentation_sections_admin: correctly denied
   ✅ partners_admin: correctly denied
   ✅ content_versions_detailed: correctly denied
   ✅ messages_contact_admin: correctly denied
   ✅ analytics_summary: correctly denied

============================================================
✅ Authenticated non-admin tests passed
```

#### Anonymous Users

```
📋 Testing ADMIN views (should be BLOCKED for anon):

   ✅ Access denied: 42501 - communiques_presse_dashboard
   ✅ Access denied: 42501 - membres_equipe_admin
   ✅ Access denied: 42501 - compagnie_presentation_sections_admin
   ✅ Access denied: 42501 - partners_admin
   ✅ Access denied: 42501 - content_versions_detailed
   ✅ Access denied: 42501 - messages_contact_admin
   ✅ Access denied: 42501 - analytics_summary

📊 Summary
   ✅ Passed: 13
   ❌ Failed: 0
```

---

## 🔍 Technical Details

### Why `NOLOGIN NOINHERIT`?

- **`NOLOGIN`:** Role cannot be used for direct database authentication
- **`NOINHERIT`:** Does not inherit privileges from roles it's a member of
- **Purpose:** Prevent accidental privilege escalation; role is purely for ownership

### Why `GRANT CREATE ON SCHEMA`?

PostgreSQL requires `CREATE` privilege on a schema to alter the owner of objects within that schema. Without this grant, the migration fails with:

```
ERROR: permission denied for schema public (SQLSTATE 42501)
```

### DEFAULT PRIVILEGES Modification

Prevents future views owned by `admin_views_owner` from automatically inheriting grants:

```sql
alter default privileges for role admin_views_owner in schema public 
  revoke all on tables from anon, authenticated;
```

This ensures any new admin views created under this role will NOT have automatic SELECT grants.

---

## 📊 Affected Views Summary

| View Name | Purpose | Columns | Owner |
| ----------- | --------- | --------- | ------- |
| `communiques_presse_dashboard` | Press releases with media count | id, title, status, created_at, published_at, featured, media_count | `admin_views_owner` |
| `membres_equipe_admin` | Team members with all fields | id, name, role, bio, active, image_media_id, order_index, created_at, updated_at | `admin_views_owner` |
| `compagnie_presentation_sections_admin` | Company sections with all fields | id, title, content, active, order_index, icon, created_at, updated_at | `admin_views_owner` |
| `partners_admin` | Partners with all fields | id, name, description, logo_url, website_url, is_active, display_order, created_at, updated_at | `admin_views_owner` |
| `content_versions_detailed` | Content versioning with metadata | id, table_name, record_id, version_number, created_at, created_by, action, changes | `admin_views_owner` |
| `messages_contact_admin` | Contact messages with all fields | id, name, email, subject, message, consent_rgpd, created_at | `admin_views_owner` |
| `analytics_summary` | Analytics aggregation (30 days) | event_type, entity_type, event_date, total_events, unique_users, unique_sessions | `admin_views_owner` |

---

## 🎓 Lessons Learned

### 1. Supabase DEFAULT PRIVILEGES Override

Even with explicit `REVOKE ALL` in declarative schemas, Supabase's `DEFAULT PRIVILEGES` can re-grant access when views are recreated during migrations. **Solution:** Use dedicated ownership role to isolate from default grants.

### 2. Schema-Level Permissions

Transferring object ownership requires more than just role membership. The role must have schema-level `CREATE` privilege to alter ownership of existing objects.

### 3. SECURITY INVOKER vs Ownership

While `SECURITY INVOKER` ensures views run with querying user's privileges (correct for RLS), **ownership** determines default grants. Both mechanisms work together:

- **SECURITY INVOKER:** Runtime privilege enforcement (already in place via migration 20251231020000)
- **Ownership + REVOKE:** Prevent automatic privilege grants from Supabase defaults

### 4. Aggregate Views Testing

Views without `id` columns (e.g., `analytics_summary` with aggregates) require selecting `*` instead of specific columns in security tests.

---

## 🚀 Next Steps

### Ongoing Maintenance

1. **New Admin Views:** Always set owner to `admin_views_owner` in declarative schemas:

```sql
create or replace view public.new_admin_view as ...;
alter view public.new_admin_view owner to admin_views_owner;
revoke all on public.new_admin_view from anon, authenticated;
grant select on public.new_admin_view to service_role;
```

2. **Test Coverage:** Add new admin views to `scripts/test-views-security-authenticated.ts` loop.

3. **Documentation:** Update `migrations.md` when creating new admin views.

### Security Monitoring

Run validation scripts periodically:

```bash
# Check view ownership
pnpm exec tsx scripts/check-admin-views-owner.ts

# Test authenticated non-admin access
pnpm exec tsx scripts/test-views-security-authenticated.ts

# Test anon access + RLS policies
pnpm exec tsx scripts/check-views-security.ts
```

---

## 📚 References

- **Plan Document:** `.github/prompts/plan-adminViewsSecurityHardening.prompt.md`
- **Original Issue:** `communiques_presse_dashboard` returning empty arrays instead of permission denied
- **Related Migrations:**
  - `20251231020000_enforce_security_invoker_all_views_final.sql` (SECURITY INVOKER)
  - `20251231010000_fix_base_tables_rls_revoke_admin_views_anon.sql` (RLS cleanup)
  - `20260103123000_revoke_authenticated_on_communiques_dashboard.sql` (Temporary fix, now superseded)

---

## 🏆 Success Metrics

- ✅ **7/7** admin views now properly owned by `admin_views_owner`
- ✅ **0** security test failures (13/13 passed)
- ✅ **100%** enforcement of "permission denied" errors for non-admin users
- ✅ **0** empty array vulnerabilities detected
- ✅ **Idempotent** migration (safe to re-run)
- ✅ **Declarative schemas** updated with security pattern
- ✅ **Comprehensive testing** infrastructure in place

---

**Implementation Date:** 2026-01-05  
**Implementer:** AI Agent (GitHub Copilot)  
**Validation:** Automated tests + manual verification  
**Status:** ✅ **PRODUCTION READY**
