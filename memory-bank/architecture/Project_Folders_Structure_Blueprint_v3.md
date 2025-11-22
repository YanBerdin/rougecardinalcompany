# Project Folders Structure Blueprint — Rouge Cardinal Company

**Generated:** 22 November 2025
**Source:** `doc/prompts-github/folder-structure-blueprint-generator.prompt.md` (executed locally)
**Branch:** feature/backoffice

## Executive summary

This document is an updated project folder blueprint generated from the repository structure and the project prompt. It captures current conventions (Next.js 15 app router, strict TypeScript, Supabase with RLS, Resend + React Email), and the recent admin/invitation feature additions implemented on `feature/backoffice` (admin users UI, DAL invite flow, email templates, CI test).

Key updates since v2:

- Added backoffice admin users feature (`/admin/users`) and related components under `components/features/admin/users`.
- Invitation email templates and server-side email actions (`emails/` and `lib/email/actions.ts`).
- DAL `lib/dal/admin-users.ts` implementing `inviteUser()` with robust `upsert()` logic.
- New CI workflow to run InvitationEmail render test: `.github/workflows/invitation-email-test.yml`.
- RLS migrations applied to support UPSERT on `public.profiles` (`supabase/migrations/20251121185458_allow_admin_update_profiles.sql`).

## Auto-detection summary

- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict)
- React: 19.x
- Bundler/dev: turbopack (dev script)
- Data: Supabase (Postgres) with declarative schemas and migrations
- Email: Resend + React Email
- Project layout: feature-based, Server Components first, DAL under `lib/dal`

## High-level organization principles

- Feature-based: each feature has a Server `Container` (data-fetching, DAL calls) and a Client `View` for interactivity.
- DAL (server-only) under `lib/dal/*` with `import "server-only"` directive; acts as boundary for all DB access.
- Email templates live in `emails/` with shared layout in `emails/utils` and server actions in `lib/email`.
- Admin/backoffice features grouped under `components/features/admin/` and `app/(admin)/` route group.

## Directory visualization (selected depths)

app/
  ├─ (admin)/
  │   ├─ admin/
  │   │   ├─ users/           # admin users pages & invite flow
  │   │   └─ team/            # team management
  │   └─ layout.tsx
  ├─ (marketing)/
  ├─ api/
  └─ layout.tsx

components/
  ├─ features/
  │   ├─ admin/
  │   │   └─ users/           # InviteUserForm, UsersManagementView, container, skeleton
  │   └─ public-site/
  └─ ui/

lib/
  ├─ dal/
  │   ├─ admin-users.ts       # inviteUser, listAllUsers, updateUserRole, deleteUser
  │   └─ ... feature DALs
  ├─ email/
  │   └─ actions.ts           # sendInvitationEmail wrapper
  └─ supabase/                 # client factory helpers

emails/
  ├─ invitation-email.tsx
  └─ utils/

supabase/
  ├─ schemas/
  └─ migrations/

## Key directory analysis

- `app/(admin)/admin/users` — Server page + server actions for user list & invite flow. Page uses a Server Container that calls `lib/dal/admin-users.ts` and renders a Client `UsersManagementView`.
- `components/features/admin/users` — Client presentation (`UsersManagementView.tsx`), `InviteUserForm.tsx` (client) and server `UsersManagementContainer.tsx` (async Server Component).
- `lib/dal/admin-users.ts` — Server-only DAL implementing `inviteUser()` which:
  - validates input with Zod
  - uses `createAdminClient()` (service role) to create/invite user
  - ensures a `profiles` row with `upsert(..., { onConflict: 'user_id' })`
  - records audit and returns an ActionResponse-like result
- `emails/invitation-email.tsx` — React Email template (single `<Tailwind>` wrapper, CTA inline styles). Paired with `lib/email/actions.ts` for sending and a dev redirect gate `EMAIL_DEV_REDIRECT`.

## File placement & naming patterns

- Components: `PascalCase.tsx` (Container, View, Form)
- DAL modules: `kebab-case.ts` (e.g., `admin-users.ts`)
- Email templates: `emails/<name>.tsx` and utils under `emails/utils/`
- Tests: top-level `__tests__/` or co-located `*.test.tsx` for components; here a standalone script test under `__tests__/emails/` is used for render-based checks.

## Development workflow notes

- Add new admin features under `components/features/admin/` and expose them via `app/(admin)/` routes.
- Always use `createServerClient()` or `createAdminClient()` inside DAL functions and mark DAL files with `import "server-only"`.
- Validate inputs at Server Action boundary (Zod) and again in DAL (defense in depth).

## CI / Tests

- A lightweight GitHub Actions workflow was added to execute the standalone InvitationEmail render test on pushes/PRs: `.github/workflows/invitation-email-test.yml`.
- Recommended next steps:
  - integrate unit tests into the main test matrix
  - run `pnpm tsc --noEmit` and `pnpm lint` in CI

## Security & RLS

- RLS policies live under `supabase/schemas/60_rls_profiles.sql` and related files. Recent migration relaxed the UPDATE policy for `profiles` to allow admin UPSERT scenario.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Use server-only admin client for privileged operations.

## Extension templates (how to add a new feature)

1. Create `components/features/<domain>/<feature>` with `FeatureContainer.tsx` (server) and `FeatureView.tsx` (client).
2. Add DAL functions to `lib/dal/<feature>.ts` with `import "server-only"`.
3. Add route under `app/` (e.g., `app/<route>/page.tsx`).
4. Add tests under `__tests__/` and include in CI.

---

**Maintenance**: Update this blueprint when adding new top-level areas (new `app` route groups, new DAL modules, significant email/system integrations) and bump the generated date.

End of generated blueprint v3
