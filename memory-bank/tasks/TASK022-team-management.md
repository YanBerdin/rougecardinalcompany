# TASK022 - Team Management

**Status:** In Progress  
**Added:** 2025-10-16  
**Updated:** 2025-10-20

## Original Request

Implement CRUD for team members with photos and roles, so admins can manage team bios and displayed roles.

## Thought Process

Team members are a relatively small data set but require image upload and ordering. Use the Media Library for photo management and DAL for persistence.

## Implementation Plan

- Add `team_members` table or confirm schema: `supabase/schemas/README.md` `supabase/migrations/migrations.md`
- DAL methods for create/read/update/delete and ordering.
- Admin UI: list, create/edit modal with image upload to Supabase Storage.
- Integrate image thumbnails and ensure images optimized via Next/Image.
- Add role assignment UI and logging of changes.

## Progress Log

### 2025-10-16

- Task generated from epic Milestone 2.

### 2025-10-20

- Implementation progress:
  - Zod schemas/types created for team members (strict runtime validation)
  - Server-only DAL `lib/dal/team.ts` (list/create/update/activate/reorder, soft-delete + optional hard-delete)
  - Server Actions `app/admin/team/actions.ts` protected by `requireAdmin()`
  - Admin UI `components/features/admin/team/*` (Container/View, Form, List, Card, MediaPicker)
  - Authz: admin check via `getClaims()` in server guards
  - Lint/Types: no `any`, JSX entities escaped, Tailwind plugin in ESM
- Manual UI tests: create/edit/activate/deactivate/reorder verified
- Documentation: mentioned and linked in architecture blueprint v2

#### Remaining work (blocking completion)

- Media Library integration: finalize or confirm fallback component
- Admin layout structure: iterate to match final design (breadcrumbs, navigation)
- Photo upload flow: validate with Storage and transformations (WebP/AVIF/JPEG)

**Overall Status:** In Progress — 85%

## shadcn / TweakCN checklist

- [x] Use shadcn MCP to find components (Avatar, ImageUpload, Form, Input)
- [x] Call `get-component-demo` for each component and use the demo code
- [x] Ensure uploads integrate with Media Library and Supabase Storage patterns
- [x] Apply TweakCN theme and verify avatar/photo styles and list layouts
- [x] Responsive checks for profile cards and modals
- [x] Required components (Form, Input, Button, Card) available
- [x] Upload: integrated via Media Picker (Supabase Storage pattern compliant)
- [x] Theme: visual consistency verified (lists/cards)
- [x] Responsive: grids/cards validated
