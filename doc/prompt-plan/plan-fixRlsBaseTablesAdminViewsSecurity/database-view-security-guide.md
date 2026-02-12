# Vue Security Configuration - Database Security Guidelines

**Date:** 2025-12-31  
**Status:** ✅ All views secured with SECURITY INVOKER  
**Last Audit:** 2025-12-31

---

## 📋 Summary

All database views in this project are configured with `SECURITY INVOKER` to ensure:

- Queries run with the **calling user's privileges** (not the view owner's)
- Row Level Security (RLS) policies are **properly enforced**
- No privilege escalation or data leaks through views
- Proper security boundaries between admin and public data

---

## 🔒 Security Model

### SECURITY INVOKER vs SECURITY DEFINER

| Aspect | SECURITY INVOKER ✅ | SECURITY DEFINER ⚠️ |
| -------- | --------------------- | --------------------- |
| **Execution Context** | Runs with caller's privileges | Runs with owner's privileges |
| **RLS Enforcement** | ✅ Applied to caller | ❌ Bypassed (uses owner's context) |
| **Security Risk** | Low - proper isolation | High - privilege escalation |
| **Use Case** | Default for most views | Only when elevated privileges needed |
| **Our Standard** | ✅ Required for all views | ❌ Not allowed |

### Why SECURITY DEFINER is Dangerous

```sql
-- ❌ DANGEROUS: SECURITY DEFINER view
create view sensitive_data_view as
select * from users;  -- No 'with (security_invoker = true)'

-- Problem: Anyone who can query this view gets the owner's privileges
-- If owner is 'postgres' or service role, this bypasses ALL RLS policies!
```

```sql
-- ✅ SAFE: SECURITY INVOKER view
create view public_data_view
with (security_invoker = true)  -- Explicit!
as
select * from users where public = true;

-- Correct: Caller's RLS policies apply, only sees their allowed data
```

---

## 📊 Current Views Inventory

### Public Views

| View Name | Security Mode | Purpose | RLS Protected |
| ----------- | --------------- | --------- | --------------- |
| `communiques_presse_public` | SECURITY INVOKER ✅ | Public press releases with PDFs | ✅ Yes |
| `communiques_presse_dashboard` | SECURITY INVOKER ✅ | Admin dashboard view | ✅ Yes |

### Admin Views

| View Name | Security Mode | Purpose | RLS Protected |
| ----------- | --------------- | --------- | --------------- |
| `membres_equipe_admin` | SECURITY INVOKER ✅ | Team members with versions | ✅ Yes |
| `compagnie_presentation_sections_admin` | SECURITY INVOKER ✅ | Company sections with versions | ✅ Yes |
| `partners_admin` | SECURITY INVOKER ✅ | Partners with versions | ✅ Yes |

---

## ✅ Security Checklist

When creating a new view:

- [ ] Use `WITH (security_invoker = true)` explicitly
- [ ] Verify underlying tables have RLS enabled
- [ ] Add comment documenting security mode
- [ ] Test with anonymous role
- [ ] Test with authenticated non-admin role
- [ ] Test with admin role
- [ ] Ensure no private fields are exposed to public views
- [ ] Grant only necessary privileges (`SELECT` for read-only views)
- [ ] Document in this file

---

## 📝 View Creation Template

```sql
-- Drop existing view (handles schema changes)
drop view if exists public.my_view_name cascade;

-- Create view with explicit security mode
create or replace view public.my_view_name
with (security_invoker = true)  -- ✅ REQUIRED
as
select 
  t.id,
  t.public_field_1,
  t.public_field_2
  -- ⚠️ DO NOT include private fields like:
  -- - internal_notes
  -- - created_by
  -- - draft status (for public views)
from public.my_table t
where t.is_public = true  -- ✅ Filter for public data
  and t.active = true;

-- Document security model in comment
comment on view public.my_view_name is 
'Description of the view purpose. 
SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

-- Grant minimal required permissions
grant select on public.my_view_name to anon, authenticated;
```

---

## 🧪 Testing Security

### 1. Check View Security Setting

```sql
select 
  c.relname as view_name,
  c.reloptions::text as options,
  pg_get_userbyid(c.relowner) as owner
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' 
  and c.relkind = 'v'  -- Views only
order by c.relname;
```

Expected: All views should have `security_invoker=true` in options.

### 2. Test Anonymous Access

```sql
-- Test as anonymous user
set role anon;
select count(*) from public.communiques_presse_public;
reset role;

-- Should only return public=true records
```

### 3. Test RLS Enforcement

```sql
-- Verify underlying table has RLS
select 
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename = 'communiques_presse';

-- Expected: rowsecurity = true
```

### 4. Automated Testing Scripts

Run security validation:

```bash
# Check all views security configuration
pnpm exec tsx scripts/check-views-security.ts

# Validate view security after migration
pnpm exec tsx scripts/validate-view-security.ts
```

---

## 🚨 Security Incidents

### Incident Log

| Date | Issue | Resolution | Status |
| ------ | ------- | ------------ | -------- |
| 2025-12-31 | Potential SECURITY DEFINER on `communiques_presse_public` | Created migration to enforce SECURITY INVOKER | ✅ Resolved |

### Response Procedure

If a SECURITY DEFINER view is discovered:

1. **Immediate Action:**
   - Assess data exposure risk
   - Check access logs for suspicious queries
   - If critical, temporarily drop the view

2. **Create Migration:**
   - Use template from `20251231000000_fix_communiques_presse_public_security_invoker.sql`
   - Recreate view with `WITH (security_invoker = true)`
   - Test thoroughly with all user roles

3. **Validation:**
   - Run `scripts/validate-view-security.ts`
   - Verify RLS policies work correctly
   - Check application functionality

4. **Documentation:**
   - Update this document
   - Log incident in table above
   - Update `.github/copilot-instructions.md` if needed

---

## 📚 References

### Internal Documentation

- `.github/instructions/Database_Create_functions.instructions.md` - Function security guidelines
- `.github/instructions/Postgres_SQL_Style_Guide.instructions.md` - SQL coding standards
- Migration: `supabase/migrations/20251231000000_fix_communiques_presse_public_security_invoker.sql`

### PostgreSQL Documentation

- [PostgreSQL Views Documentation](https://www.postgresql.org/docs/current/sql-createview.html)
- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Security Functions](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)

### Supabase Documentation

- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Views Best Practices](https://supabase.com/docs/guides/database/postgres/views)

---

## 🔄 Audit Schedule

- **Weekly:** Automated check via CI/CD (`scripts/check-views-security.ts`)
- **Monthly:** Manual review of new views
- **Quarterly:** Full security audit of all database objects
- **After Schema Changes:** Immediate validation

---

## 👥 Responsible Team

- **Database Security:** Dev Team
- **Code Review:** All PR reviewers must verify view security
- **Security Audits:** Monthly review by tech lead
- **Incident Response:** Immediate escalation to tech lead

---

**Last Updated:** 2025-12-31  
**Next Review:** 2026-01-31
