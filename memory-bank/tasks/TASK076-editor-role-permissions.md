# TASK076 — Editor Role Permissions

**Status:** Completed
**Added:** 2026-03-11
**Updated:** 2026-03-11

## Original Request

Implement a three-tier auth model (`user < editor < admin`) for the Rouge Cardinal theater admin. Replace the boolean `is_admin()` approach with a hierarchical role system. Editors gain full CRUD on editorial content (spectacles, événements, média, lieux, presse) while remaining blocked from admin-only resources (team, contacts presse, site config).

## Thought Process

- The existing auth model was binary (admin or not), which didn't allow partial backoffice access.
- The `editor` role sits between `user` (public) and `admin` (full access) in a linear hierarchy.
- SQL function `has_min_role(required_role)` reads `auth.jwt()->'app_metadata'->>'role'` and compares against a `CASE` expression mapping `'admin'→2, 'editor'→1, 'user'→0`.
- TypeScript guards (`hasMinRole`, `requireMinRole`, `requireEditorAccess`, `requireBackofficeAccess`) mirror the SQL logic client-side.
- All RLS policies for editorial tables were updated from `is_admin()` to `has_min_role('editor')`.
- Admin-only tables remain gated by `has_min_role('admin')`.
- `is_admin.ts` kept as deprecated re-export for backward compatibility.

## Implementation Plan

15 phases executed sequentially:

1. SQL function `has_min_role(required_role text)` — `SECURITY INVOKER`, `STABLE`, `search_path = ''`
2. Update declarative schema: `15_content_versioning.sql`, `61_rls_main_tables.sql`, `08_table_articles_presse.sql`
3. Generate migration via `supabase db diff`
4. TypeScript guards in `lib/auth/roles.ts`
5. Deprecate `lib/auth/is-admin.ts` (re-exports from `roles.ts`)
6. Migrate all DAL modules (31+ files): `requireBackofficeAccess` → `requireMinRole("editor")` for editorial, `requireMinRole("admin")` for admin-only
7. Migrate Server Actions
8. Migrate admin pages (`page.tsx`)
9. Migrate sidebar navigation (conditional items by role)
10. Migrate middleware (`proxy.ts`)
11. Update `lib/dal/helpers/` barrel exports
12. Create `test-editor-access-local.ts` script (local Supabase)
13. Create `test-editor-access-remote.ts` script (cloud Supabase)
14. Add test scripts to `package.json`
15. Update documentation (README, memory bank)

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID   | Description                                    | Status   | Updated    | Notes                                                |
| ---- | ---------------------------------------------- | -------- | ---------- | ---------------------------------------------------- |
| 1    | SQL `has_min_role()` function                  | Complete | 2026-03-11 | SECURITY INVOKER, STABLE                             |
| 2    | Declarative schema updates (RLS policies)      | Complete | 2026-03-11 | 3 schema files updated                               |
| 3    | Generate migration                             | Complete | 2026-03-11 | `supabase db diff -f editor_role_permissions`        |
| 4    | TypeScript guards (`roles.ts`)                 | Complete | 2026-03-11 | `hasMinRole`, `requireMinRole`, `requireEditorAccess`|
| 5    | Deprecate `is-admin.ts`                        | Complete | 2026-03-11 | Re-exports from roles.ts                             |
| 6    | DAL modules migration (31+ files)              | Complete | 2026-03-11 | Editorial → editor, Admin-only → admin               |
| 7    | Server Actions migration                       | Complete | 2026-03-11 |                                                      |
| 8    | Admin pages migration                          | Complete | 2026-03-11 |                                                      |
| 9    | Sidebar conditional navigation                 | Complete | 2026-03-11 | Items shown by min role                              |
| 10   | Middleware migration (`proxy.ts`)              | Complete | 2026-03-11 |                                                      |
| 11   | DAL helpers barrel exports                     | Complete | 2026-03-11 |                                                      |
| 12   | Local test script                              | Complete | 2026-03-11 | `test-editor-access-local.ts`                        |
| 13   | Remote test script                             | Complete | 2026-03-11 | `test-editor-access-remote.ts`                       |
| 14   | Package.json scripts                           | Complete | 2026-03-11 | `test:editor:local`, `test:editor:remote`            |
| 15   | Documentation updates                          | Complete | 2026-03-11 | README, memory bank                                  |

## Progress Log

### 2026-03-11

- All 15 phases completed in a single session.
- SQL function `has_min_role()` deployed using `CASE` expression with role hierarchy: admin=2, editor=1, user=0.
- TypeScript guards mirror SQL logic. `requireMinRole("editor")` replaces `requireBackofficeAccess()` for editorial content.
- 6 editorial tables: `spectacles`, `evenements`, `media`, `lieux`, `articles_presse`, `communiques_presse` — editor CRUD.
- 3 admin-only tables: `membres_equipe`, `contacts_presse`, `configurations_site` — admin only.
- Test scripts validate both local and remote Supabase RLS enforcement.
- `is-admin.ts` deprecated but functional (re-exports for backward compatibility).

## Key Files

| File | Purpose |
| --- | --- |
| `supabase/schemas/30_functions.sql` | `has_min_role()` SQL function |
| `supabase/schemas/61_rls_main_tables.sql` | Updated RLS policies |
| `lib/auth/roles.ts` | TypeScript role guards |
| `lib/auth/is-admin.ts` | Deprecated re-export wrapper |
| `scripts/test-editor-access-local.ts` | Local RLS test (9 tables, 4 ops) |
| `scripts/test-editor-access-remote.ts` | Remote/Cloud RLS test |
