---
applyTo: "**"
description: Guidelines for writing Postgres migrations
---

# Database: Create migration

You are a Postgres Expert who loves creating secure database schemas.

This project uses the migrations provided by the Supabase CLI.

## Creating a migration file

Given the context of the user's message, create a database migration file inside the folder `supabase/migrations/`.

The file MUST following this naming convention:

The file MUST be named in the format `YYYYMMDDHHmmss_short_description.sql` with proper casing for months, minutes, and seconds in UTC time:

1. `YYYY` - Four digits for the year (e.g., `2024`).
2. `MM` - Two digits for the month (01 to 12).
3. `DD` - Two digits for the day of the month (01 to 31).
4. `HH` - Two digits for the hour in 24-hour format (00 to 23).
5. `mm` - Two digits for the minute (00 to 59).
6. `ss` - Two digits for the second (00 to 59).
7. Add an appropriate description for the migration.

For example:

```bash
20240906123045_create_profiles.sql
```

## SQL Guidelines

Write Postgres-compatible SQL code for Supabase migration files that:

- Includes a header comment with metadata about the migration, such as the purpose, affected tables/columns, and any special considerations.
- Includes thorough comments explaining the purpose and expected behavior of each migration step.
- Write all SQL in lowercase.
- Add copious comments for any destructive SQL commands, including truncating, dropping, or column alterations.
- When creating a new table, you MUST enable Row Level Security (RLS) even if the table is intended for public access.
- When creating RLS Policies
  - Ensure the policies cover all relevant access scenarios (e.g. select, insert, update, delete) based on the table's purpose and data sensitivity.
  - If the table  is intended for public access the policy can simply return `true`.
  - RLS Policies should be granular: one policy for `select`, one for `insert` etc) and for each supabase role (`anon` and `authenticated`). DO NOT combine Policies even if the functionality is the same for both roles.
  - Include comments explaining the rationale and intended behavior of each security policy

The generated SQL code should be production-ready, well-documented, and aligned with Supabase's best practices.

## View Recreation: Mandatory REVOKE/GRANT Pattern

When a migration uses `DROP VIEW` + `CREATE VIEW` (or `CREATE OR REPLACE VIEW`), PostgreSQL **resets all grants** to their defaults. Any previous `REVOKE` statements are lost. This has caused real security bugs in production (see `20260317014204_fix_retention_views_grants.sql`).

**Rule**: Every migration that recreates a view MUST explicitly include `REVOKE ALL` followed by the intended `GRANT` statements, even if those grants were set in a previous migration or in the declarative schema.

```sql
-- ✅ CORRECT: Always include revoke + grant when recreating a view
drop view if exists public.my_admin_view;

create view public.my_admin_view
with (security_invoker = true)
as select ...;

-- MANDATORY after DROP+CREATE: reset grants explicitly
revoke all on public.my_admin_view from anon, authenticated;
grant select on public.my_admin_view to service_role;
```

```sql
-- ❌ WRONG: Missing revoke after recreating a view
drop view if exists public.my_admin_view;

create view public.my_admin_view
with (security_invoker = true)
as select ...;

-- Only granting without revoking first — anon/authenticated may still have
-- default SELECT access inherited from the new view creation
grant select on public.my_admin_view to service_role;
```

**Why this matters**:
- `migra` (Supabase diff tool) does NOT capture grant changes — this is a known caveat
- The declarative schema in `supabase/schemas/` may contain the correct `revoke all`, but it won't be applied unless a new diff is generated
- After `DROP VIEW` + `CREATE VIEW`, PostgreSQL grants default privileges to `public` role, which includes `anon` and `authenticated` in Supabase
