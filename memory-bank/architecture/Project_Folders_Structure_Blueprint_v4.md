# Project Folders Structure Blueprint — Rouge Cardinal Company

**Generated:** 27 November 2025  
**Source:** `doc/prompts-github/folder-structure-blueprint-generator.prompt.md` (executed locally)  
**Branch:** feature/backoffice

## Executive summary

This document is an updated project folder blueprint generated from the repository structure and the project prompt. It captures current conventions (Next.js 15 app router, strict TypeScript, Supabase with RLS, Resend + React Email), and the recent admin feature additions implemented on `feature/backoffice`.

Key updates since v2 → v3

- Added backoffice admin users feature (`/admin/users`) and related components under `components/features/admin/users`.
- Invitation email templates and server-side email actions (`emails/` and `lib/email/actions.ts`).
- DAL `lib/dal/admin-users.ts` implementing `inviteUser()` with robust `upsert()` logic.
- New CI workflow to run InvitationEmail render test: `.github/workflows/invitation-email-test.yml`.
- RLS migrations applied to support UPSERT on `public.profiles` (`supabase/migrations/20251121185458_allow_admin_update_profiles.sql`).

Key updates since v3 → v4:

- **Server Actions architecture** (`lib/actions/`) — New layer for mutations replacing direct API Route calls. `revalidatePath()` now called exclusively from Server Actions.
- **Homepage content management** (TASK026) — Hero Slides CRUD + drag-drop reorder, About Section editor.
- **Clean Code conformity refactoring** — Forms split into sub-components (<300 lines rule), UI schemas separated from Server schemas (bigint→number for JSON serialization).
- **Obsolete API routes removed** — `app/api/admin/home/about/` routes deleted after Server Actions migration.
- **CRUD pattern documented** in `.github/instructions/crud-server-actions-pattern.instructions.md` v1.1.

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
- DAL (server-only) under `lib/dal/*` with `import "server-only"` directive; acts as boundary for all DB access. **NO `revalidatePath()` in DAL**.
- **Server Actions** (`lib/actions/*`) — Mutation layer between Client Components and DAL. All `revalidatePath()` calls happen here.
- **Zod schemas** (`lib/schemas/*`) — Dual schemas pattern: Server schemas (with `bigint`) for DAL/DB, UI schemas (with `number`) for forms.
- Email templates live in `emails/` with shared layout in `emails/utils` and server actions in `lib/email`.
- Admin/backoffice features grouped under `components/features/admin/` and `app/(admin)/` route group.
- **Component splitting** — Forms over 300 lines are split into sub-components (`*FormFields.tsx`, `*ImageSection.tsx`).

## Directory visualization (selected depths)

```
app/
  ├─ (admin)/
  │   ├─ admin/
  │   │   ├─ home/
  │   │   │   ├─ hero/        # Hero slides management (CRUD + DnD reorder)
  │   │   │   └─ about/       # About section editor
  │   │   ├─ users/           # admin users pages & invite flow
  │   │   ├─ team/            # team management
  │   │   └─ spectacles/      # spectacles CRUD
  │   └─ layout.tsx
  ├─ (marketing)/
  │   ├─ spectacles/
  │   ├─ compagnie/
  │   ├─ contact/
  │   ├─ agenda/
  │   └─ presse/
  ├─ api/
  │   ├─ admin/
  │   │   ├─ home/hero/       # Hero slides API (list, create, update, delete, reorder)
  │   │   ├─ media/           # Media library API
  │   │   ├─ spectacles/      # Spectacles API
  │   │   └─ team/            # Team API
  │   ├─ public/              # Public API endpoints
  │   └─ newsletter/          # Newsletter subscription
  └─ layout.tsx

components/
  ├─ features/
  │   ├─ admin/
  │   │   ├─ home/            # HeroSlidesView, HeroSlideForm, AboutContentForm, etc.
  │   │   ├─ users/           # InviteUserForm, UsersManagementView
  │   │   ├─ team/            # Team management components
  │   │   ├─ media/           # MediaLibraryPicker, MediaUploadDialog
  │   │   └─ spectacles/      # Spectacles management components
  │   └─ public-site/
  │       ├─ home/            # Hero, About, Newsletter, Partners, News sections
  │       ├─ spectacles/
  │       ├─ compagnie/
  │       ├─ contact/
  │       ├─ agenda/
  │       └─ presse/
  ├─ skeletons/               # Loading skeletons for Suspense
  └─ ui/                      # shadcn/ui components

lib/
  ├─ actions/                 # Server Actions (mutations + revalidatePath)
  │   ├─ home-hero-actions.ts
  │   └─ home-about-actions.ts
  ├─ dal/                     # Data Access Layer (server-only, NO revalidatePath)
  │   ├─ admin-home-hero.ts
  │   ├─ admin-home-about.ts
  │   ├─ admin-users.ts
  │   ├─ team.ts
  │   ├─ spectacles.ts
  │   └─ ... feature DALs
  ├─ schemas/                 # Zod validation schemas (Server + UI)
  │   ├─ home-content.ts      # HeroSlideInputSchema, HeroSlideFormSchema, etc.
  │   ├─ spectacles.ts
  │   └─ team.ts
  ├─ email/
  │   └─ actions.ts           # sendInvitationEmail wrapper
  ├─ api/                     # API helpers
  ├─ auth/                    # Auth utilities (is-admin, guards)
  ├─ hooks/                   # Custom hooks (use-debounce, etc.)
  ├─ utils/                   # Utility functions
  └─ types/                   # TypeScript types

emails/
  ├─ invitation-email.tsx
  └─ utils/

supabase/
  ├─ schemas/                 # Declarative schema files
  └─ migrations/              # Generated migrations

.github/
  ├─ instructions/            # AI coding instructions
  │   ├─ crud-server-actions-pattern.instructions.md  # CRUD pattern v1.1
  │   └─ ... other instructions
  ├─ prompts/                 # Execution plans
  └─ workflows/               # CI workflows
```

## Key directory analysis

### Server Actions Layer (`lib/actions/`)

- `lib/actions/home-hero-actions.ts` — Server Actions for Hero Slides CRUD:
  - `createHeroSlideAction()`, `updateHeroSlideAction()`, `deleteHeroSlideAction()`
  - Validates with Zod, calls DAL, then `revalidatePath()` on success
  - Returns `ActionResult<T>` type
- `lib/actions/home-about-actions.ts` — Server Action for About section update:
  - `updateAboutContentAction()` with same pattern

### Data Access Layer (`lib/dal/`)

- `lib/dal/admin-home-hero.ts` — Server-only DAL for Hero Slides (NO revalidatePath):
  - `fetchHeroSlides()`, `createHeroSlide()`, `updateHeroSlide()`, `deleteHeroSlide()`, `reorderHeroSlides()`
  - Returns `DALResult<T>` type
- `lib/dal/admin-home-about.ts` — Server-only DAL for About section
- `lib/dal/admin-users.ts` — Server-only DAL implementing `inviteUser()` which:
  - validates input with Zod
  - uses `createAdminClient()` (service role) to create/invite user
  - ensures a `profiles` row with `upsert(..., { onConflict: 'user_id' })`
  - records audit and returns an ActionResponse-like result

### Schemas (`lib/schemas/`)

- `lib/schemas/home-content.ts` — Dual Zod schemas for Home Content:
  - **Server schemas**: `HeroSlideInputSchema` (uses `z.coerce.bigint()` for IDs)
  - **UI schemas**: `HeroSlideFormSchema` (uses `z.number().int().positive()` for JSON serialization)
  - **DTOs**: `HeroSlideDTO`, `AboutContentDTO` types

### Admin Components (`components/features/admin/`)

- `components/features/admin/home/` — Homepage management (10 files):
  - `HeroSlidesContainer.tsx` — Server Component, fetches data
  - `HeroSlidesView.tsx` — Client Component, list + DnD + state sync via `useEffect`
  - `HeroSlideForm.tsx` (~200 lines) — Main form dialog
  - `HeroSlideFormFields.tsx` — Extracted text fields (title, subtitle, description, CTA, toggle)
  - `HeroSlideImageSection.tsx` — Extracted image picker section
  - `AboutContentContainer.tsx`, `AboutContentView.tsx`, `AboutContentForm.tsx`
- `components/features/admin/users/` — User management:
  - `UsersManagementContainer.tsx` (Server), `UsersManagementView.tsx` (Client), `InviteUserForm.tsx`

### Emails

- `emails/invitation-email.tsx` — React Email template (single `<Tailwind>` wrapper, CTA inline styles). Paired with `lib/email/actions.ts` for sending and a dev redirect gate `EMAIL_DEV_REDIRECT`.

## File placement & naming patterns

### Components

- **Containers**: `PascalCase` + `Container.tsx` (e.g., `HeroSlidesContainer.tsx`) — Server Components
- **Views**: `PascalCase` + `View.tsx` (e.g., `HeroSlidesView.tsx`) — Client Components with state
- **Forms**: `PascalCase` + `Form.tsx` (e.g., `HeroSlideForm.tsx`) — Client form dialogs, max 300 lines
- **Form sub-components** (when form > 300 lines):
  - `*FormFields.tsx` — Text input fields (title, description, etc.)
  - `*ImageSection.tsx` — Image picker sections
  - `*CtaFields.tsx` — CTA-related fields
  - `*Toggle.tsx` — Switch/toggle controls

### Server Actions

- **Location**: `lib/actions/<feature>-actions.ts` (e.g., `home-hero-actions.ts`)
- **Naming**: `<verb><Entity>Action()` (e.g., `createHeroSlideAction`, `updateAboutContentAction`)
- **Pattern**: Zod validation → DAL call → `revalidatePath()` → return `ActionResult<T>`

### DAL Modules

- **Location**: `lib/dal/<feature>.ts` (e.g., `admin-home-hero.ts`)
- **Naming**: kebab-case with feature prefix
- **Pattern**: `import "server-only"` → auth check → database operation → return `DALResult<T>`
- **Rule**: NO `revalidatePath()` in DAL (only in Server Actions)

### Schemas

- **Location**: `lib/schemas/<feature>.ts` (e.g., `home-content.ts`)
- **Server schemas**: Use `z.coerce.bigint()` for database IDs
- **UI schemas**: Use `z.number().int().positive()` for form IDs (JSON serializable)
- **Exports**: `*InputSchema`, `*FormSchema`, `*DTO` types

### Email templates

- `emails/<name>.tsx` and utils under `emails/utils/`

### Tests

- Top-level `__tests__/` or co-located `*.test.tsx` for components

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

### CRUD Feature (with Server Actions pattern)

1. **Create schemas** in `lib/schemas/<feature>.ts`:
   - Server schema with `z.coerce.bigint()` for IDs
   - UI schema with `z.number()` for form IDs
   - DTO types for data transfer

2. **Create DAL** in `lib/dal/<feature>.ts`:
   - Mark with `import "server-only"`
   - Add auth check with `requireAdmin()`
   - Implement CRUD functions returning `DALResult<T>`
   - NO `revalidatePath()` here

3. **Create Server Actions** in `lib/actions/<feature>-actions.ts`:
   - Mark with `"use server"` and `import "server-only"`
   - Validate input with Zod
   - Call DAL functions
   - Call `revalidatePath()` on success
   - Return `ActionResult<T>`

4. **Create components** in `components/features/admin/<feature>/`:
   - `<Feature>Container.tsx` — Server Component, fetches data from DAL
   - `<Feature>View.tsx` — Client Component with `useState` + `useEffect` sync
   - `<Feature>Form.tsx` — Client form dialog (max 300 lines)
   - Split form if > 300 lines: `*FormFields.tsx`, `*ImageSection.tsx`

5. **Create route** in `app/(admin)/admin/<feature>/page.tsx`:
   - Add `export const dynamic = 'force-dynamic'`
   - Add `export const revalidate = 0`
   - Render Container component

6. **Add tests** under `__tests__/` and include in CI

### Simple API Feature (for external access)

1. Create route in `app/api/<feature>/route.ts`
2. Validate input with Zod
3. Use DAL for database access
4. Return proper HTTP status codes

---

**Maintenance**: Update this blueprint when adding new top-level areas (new `app` route groups, new DAL modules, new Server Actions, significant email/system integrations) and bump the generated date.

End of generated blueprint v4
