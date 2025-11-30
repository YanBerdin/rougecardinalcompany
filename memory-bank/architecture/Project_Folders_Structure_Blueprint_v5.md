# Project Folders Structure Blueprint — Rouge Cardinal Company

**Generated:** 30 November 2025  
**Source:** `doc/prompts-github/folder-structure-blueprint-generator.prompt.md` (executed locally)  
**Branch:** feature/backoffice  
**Version:** v5

## Executive summary

This document is an updated project folder blueprint generated from the repository structure and the project prompt. It captures current conventions (Next.js 15 app router, strict TypeScript, Supabase with RLS, Resend + React Email), and the recent SOLID refactoring completed on `feature/backoffice`.

Key updates since v4 → v5 (SOLID Refactoring):

- **DALResult uniformization** — All 17 DAL files now use `DALResult<T>` pattern from `lib/dal/helpers/error.ts`.
- **DAL helpers extraction** — Common utilities extracted to `lib/dal/helpers/` (error handling, formatting, slug generation).
- **Zod schemas centralization** — 11 schema files in `lib/schemas/` with barrel exports. All schemas moved from DAL/feature files.
- **lib/types/ removal** — Folder deleted. Component props now colocated with features (e.g., `components/features/admin/media/types.ts`).
- **Email imports removed from DAL** — `admin-users.ts` no longer imports email; email sent via Server Action wrapper.
- **revalidatePath removed from DAL** — All 17 DAL files are now pure data access; cache invalidation happens in Server Actions only.
- **Error codes standardized** — All DAL files use `[ERR_ENTITY_NNN]` format (e.g., `[ERR_TEAM_001]`, `[ERR_CONTACT_001]`).
- **SOLID compliance** — Score improved from 70% to **92%** (target was 90%).

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
- **DAL (server-only)** under `lib/dal/*` with `"use server"` + `import "server-only"` directives. Acts as boundary for all DB access.
  - **NO `revalidatePath()` in DAL** — Cache invalidation in Server Actions only.
  - **NO email imports in DAL** — Email sending via Server Action wrappers.
  - Returns `DALResult<T>` type from `lib/dal/helpers/error.ts`.
  - Uses standardized error codes `[ERR_ENTITY_NNN]`.
- **Server Actions** (`app/(admin)/admin/.../actions.ts`) — Mutation layer between Client Components and DAL. All `revalidatePath()` and email calls happen here.
- **Zod schemas** (`lib/schemas/*`) — Centralized validation schemas with barrel exports. Dual schemas pattern: Server schemas (with `bigint`) for DAL/DB, UI schemas (with `number`) for forms.
- **Component props colocation** — Props interfaces colocated with features (e.g., `components/features/admin/media/types.ts`), not in `lib/types/`.
- Email templates live in `emails/` with shared layout in `emails/utils` and server actions in `lib/email`.
- Admin/backoffice features grouped under `components/features/admin/` and `app/(admin)/` route group.
- **Component splitting** — Forms over 300 lines are split into sub-components (`*FormFields.tsx`, `*ImageSection.tsx`).

## Directory visualization (selected depths)

```bash
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
  ├─ dal/                     # Data Access Layer (server-only, NO revalidatePath, NO email)
  │   ├─ helpers/             # Shared DAL utilities
  │   │   ├─ error.ts         # DALResult<T> type + handleError()
  │   │   ├─ format.ts        # Formatting utilities
  │   │   ├─ slug.ts          # Slug generation
  │   │   └─ index.ts         # Barrel exports
  │   ├─ admin-home-hero.ts   # Hero slides DAL
  │   ├─ admin-home-about.ts  # About section DAL
  │   ├─ admin-users.ts       # User management DAL
  │   ├─ agenda.ts            # Events/agenda DAL
  │   ├─ compagnie.ts         # Company pages DAL
  │   ├─ compagnie-presentation.ts
  │   ├─ contact.ts           # Contact messages DAL
  │   ├─ dashboard.ts         # Dashboard stats DAL
  │   ├─ home-about.ts        # Public about content
  │   ├─ home-hero.ts         # Public hero slides
  │   ├─ home-news.ts         # News items DAL
  │   ├─ home-newsletter.ts   # Newsletter subscriptions
  │   ├─ home-partners.ts     # Partners DAL
  │   ├─ home-shows.ts        # Shows preview DAL
  │   ├─ presse.ts            # Press releases DAL
  │   ├─ spectacles.ts        # Spectacles CRUD DAL
  │   └─ team.ts              # Team members DAL
  ├─ schemas/                 # Centralized Zod validation schemas
  │   ├─ admin-users.ts       # UpdateUserRoleSchema, InviteUserSchema
  │   ├─ agenda.ts            # EventSchema, EventFilterSchema
  │   ├─ compagnie.ts         # ValueSchema, TeamMemberSchema
  │   ├─ contact.ts           # ContactMessageSchema, NewsletterSubscriptionSchema
  │   ├─ dashboard.ts         # DashboardStatsSchema
  │   ├─ home-content.ts      # HeroSlideSchema, AboutContentSchema
  │   ├─ media.ts             # MediaItemSchema, MediaSelectResultSchema
  │   ├─ presse.ts            # PressReleaseSchema, MediaArticleSchema
  │   ├─ spectacles.ts        # SpectacleSchema, CurrentShowSchema
  │   ├─ team.ts              # TeamMemberSchema, SetActiveBodySchema
  │   └─ index.ts             # Barrel exports for all schemas
  ├─ email/
  │   └─ actions.ts           # sendInvitationEmail wrapper
  ├─ api/                     # API helpers (withAdminAuth, etc.)
  ├─ auth/                    # Auth utilities (is-admin, guards)
  ├─ hooks/                   # Custom hooks (use-debounce, etc.)
  ├─ forms/                   # Form utilities
  ├─ utils/                   # Utility functions
  └─ database.types.ts        # Supabase generated types

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

### DAL Helpers (`lib/dal/helpers/`)

Centralized utilities for all DAL files:

- `lib/dal/helpers/error.ts` — Core `DALResult<T>` type and error handling:

  ```typescript
  export type DALResult<T> = 
    | { success: true; data: T } 
    | { success: false; error: string };
  ```

- `lib/dal/helpers/format.ts` — Data formatting utilities
- `lib/dal/helpers/slug.ts` — URL slug generation
- `lib/dal/helpers/index.ts` — Barrel exports

### Data Access Layer (`lib/dal/`)

All 17 DAL files follow the same pattern:

```typescript
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { type DALResult } from "./helpers";

export async function fetchEntity(): Promise<DALResult<Entity[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("table").select("*");
  
  if (error) {
    console.error("[ERR_ENTITY_001] Failed to fetch:", error.message);
    return { success: false, error: `[ERR_ENTITY_001] ${error.message}` };
  }
  
  return { success: true, data: data ?? [] };
}
```

**Rules enforced:**

- ✅ `"use server"` directive (top of file)
- ✅ `import "server-only"` (security boundary)
- ✅ Returns `DALResult<T>` (never throws)
- ✅ Error codes `[ERR_ENTITY_NNN]` format
- ❌ NO `revalidatePath()` imports
- ❌ NO `@/lib/email` imports

### Server Actions (`app/(admin)/admin/.../actions.ts`)

Mutation layer calling DAL + side effects:

- `app/(admin)/admin/home/hero/actions.ts` — Hero Slides CRUD actions
- `app/(admin)/admin/home/about/actions.ts` — About section actions
- `app/(admin)/admin/users/actions.ts` — User management + invite email
- `app/(admin)/admin/team/actions.ts` — Team management actions
- `app/(admin)/admin/spectacles/actions.ts` — Spectacles CRUD actions

Pattern:

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { createEntity } from "@/lib/dal/entity";

export async function createEntityAction(input: unknown) {
  const validated = EntitySchema.parse(input);
  const result = await createEntity(validated);
  
  if (!result.success) return result;
  
  revalidatePath("/admin/entity");
  return { success: true, data: result.data };
}
```

### Schemas (`lib/schemas/`)

Centralized Zod schemas with barrel exports from `lib/schemas/index.ts`:

- `lib/schemas/admin-users.ts` — `UpdateUserRoleSchema`, `InviteUserSchema`, `UserRoleEnum`
- `lib/schemas/agenda.ts` — `EventSchema`, `EventFilterSchema`
- `lib/schemas/compagnie.ts` — `ValueSchema`, `TeamMemberSchema`
- `lib/schemas/contact.ts` — `ContactMessageSchema`, `ContactEmailSchema`, `NewsletterSubscriptionSchema`
- `lib/schemas/dashboard.ts` — `DashboardStatsSchema`
- `lib/schemas/home-content.ts` — Dual schemas pattern:
  - **Server schemas**: `HeroSlideInputSchema` (uses `z.coerce.bigint()` for IDs)
  - **UI schemas**: `HeroSlideFormSchema` (uses `z.number().int().positive()` for JSON serialization)
  - **DTOs**: `HeroSlideDTO`, `AboutContentDTO` types
- `lib/schemas/media.ts` — `MediaItemSchema`, `MediaSelectResultSchema`, constants
- `lib/schemas/presse.ts` — `PressReleaseSchema`, `MediaArticleSchema`
- `lib/schemas/spectacles.ts` — `SpectacleSchema`, `CurrentShowSchema`, `ArchivedShowSchema`
- `lib/schemas/team.ts` — `TeamMemberSchema`, `SetActiveBodySchema`

### Admin Components (`components/features/admin/`)

- `components/features/admin/home/` — Homepage management (10 files):
  - `HeroSlidesContainer.tsx` — Server Component, fetches data
  - `HeroSlidesView.tsx` — Client Component, list + DnD + state sync via `useEffect`
  - `HeroSlideForm.tsx` (~200 lines) — Main form dialog
  - `HeroSlideFormFields.tsx` — Extracted text fields (title, subtitle, description, CTA, toggle)
  - `HeroSlideImageSection.tsx` — Extracted image picker section
  - `AboutContentContainer.tsx`, `AboutContentView.tsx`, `AboutContentForm.tsx`
- `components/features/admin/media/` — Media library with colocated types:
  - `MediaLibraryPicker.tsx`, `MediaUploadDialog.tsx`, `MediaExternalUrlInput.tsx`
  - `types.ts` — Props interfaces (colocated, not in lib/types/)
  - `index.ts` — Barrel exports
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

- **Location**: `app/(admin)/admin/<feature>/actions.ts` (colocated with routes)
- **Naming**: `<verb><Entity>Action()` (e.g., `createHeroSlideAction`, `updateAboutContentAction`)
- **Pattern**: Zod validation → DAL call → `revalidatePath()` → return `ActionResult<T>`
- **Rule**: All `revalidatePath()` and email calls happen here, never in DAL

### DAL Modules

- **Location**: `lib/dal/<feature>.ts` (e.g., `admin-home-hero.ts`, `team.ts`)
- **Naming**: kebab-case with optional feature prefix
- **Directives**: `"use server"` + `import "server-only"`
- **Pattern**: auth check → database operation → return `DALResult<T>`
- **Helpers**: Import from `lib/dal/helpers/` for error handling, formatting
- **Rules**:
  - ❌ NO `revalidatePath()` imports
  - ❌ NO `@/lib/email` imports
  - ✅ Use `DALResult<T>` from helpers
  - ✅ Use error codes `[ERR_ENTITY_NNN]`

### Schemas

- **Location**: `lib/schemas/<feature>.ts` (centralized)
- **Barrel exports**: `lib/schemas/index.ts` re-exports all schemas
- **Server schemas**: Use `z.coerce.bigint()` for database IDs
- **UI schemas**: Use `z.number().int().positive()` for form IDs (JSON serializable)
- **Exports**: `*Schema`, `*Input`, `*DTO` types

### Component Props (Colocation Pattern)

- **Location**: `components/features/admin/<feature>/types.ts` (colocated with components)
- **NOT in**: `lib/types/` (folder removed)
- **Re-exports**: Can re-export from `lib/schemas/` for convenience

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
   - Add exports to `lib/schemas/index.ts`

2. **Create DAL** in `lib/dal/<feature>.ts`:
   - Add `"use server"` directive at top
   - Add `import "server-only"`
   - Import `DALResult` from `./helpers`
   - Add auth check with `requireAdmin()`
   - Implement CRUD functions returning `DALResult<T>`
   - Use error codes `[ERR_FEATURE_NNN]`
   - ❌ NO `revalidatePath()` here
   - ❌ NO email imports here

3. **Create Server Actions** in `app/(admin)/admin/<feature>/actions.ts`:
   - Mark with `"use server"`
   - Validate input with Zod (from `lib/schemas/`)
   - Call DAL functions
   - Call `revalidatePath()` on success
   - Send emails if needed (email calls only here)
   - Return `ActionResult<T>`

4. **Create components** in `components/features/admin/<feature>/`:
   - `<Feature>Container.tsx` — Server Component, fetches data from DAL
   - `<Feature>View.tsx` — Client Component with `useState` + `useEffect` sync
   - `<Feature>Form.tsx` — Client form dialog (max 300 lines)
   - `types.ts` — Component props (colocated, not in lib/types/)
   - Split form if > 300 lines: `*FormFields.tsx`, `*ImageSection.tsx`

5. **Create route** in `app/(admin)/admin/<feature>/page.tsx`:
   - Add `export const dynamic = 'force-dynamic'`
   - Add `export const revalidate = 0`
   - Render Container component

6. **Add tests** under `__tests__/` and include in CI

### Simple API Feature (for external access)

1. Create route in `app/api/<feature>/route.ts`
2. Validate input with Zod (import from `lib/schemas/`)
3. Use DAL for database access
4. Return proper HTTP status codes

---

## SOLID Compliance Summary

**Score: 92%** (target was 90%)

| Metric | Value | Status |
|--------|-------|--------|
| DALResult coverage | 17/17 | ✅ |
| revalidatePath in DAL | 0 | ✅ |
| Email imports in DAL | 0 | ✅ |
| "use server" directive | 17/17 | ✅ |
| Schemas centralized | 11 files | ✅ |
| Error codes standardized | All | ✅ |

---

**Maintenance**: Update this blueprint when adding new top-level areas (new `app` route groups, new DAL modules, new Server Actions, significant email/system integrations) and bump the generated date.

End of generated blueprint v5
