# Instruction: Team Management CRUD Interface (TASK022)

> Please follow this plan using proper rules from knowledge-base and copilot-instructions.

## ✅ Implementation Status (Updated: 2025-10-20)

This instruction document has been **UPDATED** to reflect the actual implementation completed during TASK022. Key differences between original instructions and final implementation:

### Type System Changes

- **Zod Schema Patterns**: Used explicit `.nullable()` instead of `.optional()` for better database compatibility
- **CreateTeamMemberInputSchema**: Explicit field definitions with `.nullable().optional()` instead of `.omit()`
- **UpdateTeamMemberInputSchema**: All fields optional, no `id` requirement (handled in DAL layer)
- **Timestamp Handling**: `created_at` and `updated_at` are string `.optional()` (not `.datetime()`) to match DB format

### DAL Architecture Changes

- **Import Directive**: Uses `import "server-only"` only (NOT `"use server"` - that's for Server Actions)
- **Unified Upsert**: Implemented `upsertTeamMember()` function that handles both INSERT and UPDATE
  - Checks if `id` is valid (> 0) to determine INSERT vs UPDATE
  - Destructures `{id, ...rest}` to avoid GENERATED ALWAYS conflicts
- **Runtime Validation**: All DAL functions use `.safeParse()` to validate rows and filter invalid data
- **Flexible Filtering**: `fetchAllTeamMembers(includeInactive = false)` parameter for conditional filtering
- **Additional Functions**:
  - `setTeamMemberActive(id, active)` for soft delete/activate
  - `hardDeleteTeamMember(id)` for RGPD compliance
  - `reorderTeamMembers(updates)` with sequential updates

### Server Actions Architecture

- **Consistent Response Type**: All actions return `ActionResponse<T>` with `{success, data?, error?, status?, details?}`
- **Explicit Auth**: All actions call `requireAdmin()` at start (in addition to RLS)
- **Enhanced Error Handling**:
  - Separate Zod validation errors (status 422 with details)
  - Input validation (id checks, type checks)
  - Generic error handling (status 500)
- **DAL Integration**: Actions delegate to DAL functions instead of direct Supabase calls
- **Action Naming**: `setTeamMemberActiveAction` and `reorderTeamMembersAction` to distinguish from DAL functions

### Key Implementation Principles Applied

1. **Separation of Concerns**: DAL handles data access, Server Actions handle validation and orchestration
2. **Type Safety**: Runtime Zod validation + compile-time TypeScript types
3. **Error Resilience**: Graceful degradation with empty arrays/null returns, detailed error logging
4. **Security**: Explicit admin checks + RLS policies (defense in depth)
5. **Database Compatibility**: Careful handling of GENERATED ALWAYS fields and nullable columns

Sections below marked with **IMPLEMENTED** annotations show actual code patterns used.

---

## Goal

Implement a complete admin interface for managing team members (membres_equipe) with CRUD operations, photo management via Media Library, role assignment, display order control, and audit logging. Interface must follow Smart/Dumb component pattern with DAL for data access and Server Actions for mutations.

## Existing Files

### Database Schema

- `supabase/schemas/04_table_membres_equipe.sql` - Table definition with RLS policies

### Type Definitions

- `lib/database.types.ts` - Generated Supabase types (use `Database['public']['Tables']['membres_equipe']`)

### Data Access Layer

- `lib/dal/compagnie.ts` - Contains `fetchTeamMembers()` and `TeamMemberRecord` type

### Server Client

- `supabase/server.ts` - Supabase client factory with `createClient()`

### Auth Patterns

- `middleware.ts` - Auth middleware using `getClaims()`
- RLS policies in schema enforce admin-only writes

## New Files to Create

### DAL Extension

- `lib/dal/team.ts`

### Server Actions

- `app/admin/team/actions.ts`

### Smart Container

- `components/features/admin/team/TeamManagementContainer.tsx`

### Dumb Components

- `components/features/admin/team/TeamMemberList.tsx`
- `components/features/admin/team/TeamMemberCard.tsx`
- `components/features/admin/team/TeamMemberForm.tsx`
- `components/features/admin/team/MediaPickerDialog.tsx`

### Admin Page

- `app/admin/team/page.tsx`
- `app/admin/team/layout.tsx` (if needed)

### Validation Schemas

- `lib/schemas/team.ts`

## Grouped Tasks

### Group 1: Type Definitions and Validation

> Establish type safety and validation schemas using existing database types

- **IMPORTANT:** A Zod schema `TeamMemberSchema` already exists in `components/features/public-site/compagnie/types.ts` for public view (simplified fields: name, role, description, image)
- Do NOT duplicate this schema - create admin-specific schemas instead
- Import existing types from `lib/database.types.ts`:
  - `Database['public']['Tables']['membres_equipe']['Row']` as base type for full DB record
  - `Database['public']['Tables']['membres_equipe']['Insert']` for creation
  - `Database['public']['Tables']['membres_equipe']['Update']` for updates
- Create `lib/schemas/team.ts` with admin-specific Zod schemas:
  - `TeamMemberDbSchema` for full DB record validation (id, name, role, description, image_url, photo_media_id, ordre, active, created_at, updated_at)
    - **IMPLEMENTED:** Uses `.nullable()` for optional fields instead of `.optional()` for better database compatibility
    - **IMPLEMENTED:** `created_at` and `updated_at` are `.optional()` strings (not `.datetime()`) to handle DB timestamps
    - **IMPLEMENTED:** `ordre` and `active` are `.nullable()` to match actual DB schema
  - `CreateTeamMemberInputSchema` **IMPLEMENTED:** Explicit field definition with `.nullable().optional()` pattern instead of `.omit()`
  - `UpdateTeamMemberInputSchema` **IMPLEMENTED:** Explicit optional fields (no `id` required - handled in DAL)
  - `ReorderTeamMembersInputSchema` **IMPLEMENTED:** Array of `{id: number, ordre: number}`
- Export TypeScript types derived from Zod: `type CreateTeamMemberInput = z.infer<typeof CreateTeamMemberInputSchema>`
- Note: Public schema uses "image" fields, admin uses "image_url", "photo_media_id"
- Photo validation rules: max 5MB, formats WebP/AVIF/JPEG (handled by Media Library component)

### Group 2: Data Access Layer Extension

> Extend DAL with admin-specific queries (server-only, no RLS bypass)

- **IMPORTANT:** `fetchTeamMembers()` already exists in `lib/dal/compagnie.ts` for PUBLIC view (filters `active=true`, limit=12)
- Do NOT modify existing `fetchTeamMembers()` - it's used by public Compagnie page
- Create NEW file `lib/dal/team.ts` with `import "server-only"` directive (no `"use server"` - this is a DAL, not Server Actions)
- Import `createClient` from `@/supabase/server`
- Import type: `Database['public']['Tables']['membres_equipe']['Row']` as `TeamRow` from `@/lib/database.types`
- Import `TeamMemberDbSchema` from `@/lib/schemas/team` for runtime validation
- Implement admin-specific functions:
  - `fetchAllTeamMembers(includeInactive = false)`: **IMPLEMENTED** with optional parameter to filter active members by default
    - Uses Zod validation with `.safeParse()` to validate each row and filter out invalid data
    - Returns only valid rows, logs errors for invalid ones
  - `fetchTeamMemberById(id: number)`: **IMPLEMENTED** with Zod validation
  - `upsertTeamMember(payload: Partial<TeamRow>)`: **IMPLEMENTED** handles both INSERT and UPDATE
    - If `id` is present and valid (> 0), performs UPDATE
    - If `id` is missing/invalid, performs INSERT
    - Destructures `{id, ...rest}` to avoid sending `id` to INSERT (prevents GENERATED ALWAYS conflict)
    - Uses Zod validation on response
  - `setTeamMemberActive(id: number, active: boolean)`: **IMPLEMENTED** for soft delete/activate
  - `hardDeleteTeamMember(id: number)`: **IMPLEMENTED** for RGPD compliance (permanent deletion)
  - `reorderTeamMembers(updates: Array<{id, ordre}>)`: **IMPLEMENTED** with sequential updates
- Error handling: **IMPLEMENTED** with try/catch, console.error, returns empty arrays/null/false on failure
- No direct RLS bypass: rely on authenticated user context from `createClient()`
- Key difference: PUBLIC queries filter active=true, ADMIN queries show all records (unless `includeInactive=false`)

### Group 3: Server Actions for Mutations

> Implement secure mutations with Zod validation and cache revalidation

- Create `app/admin/team/actions.ts` with `"use server"` directive
- Import validation schemas from `lib/schemas/team.ts`
- Import DAL functions from `lib/dal/team.ts`: `upsertTeamMember`, `reorderTeamMembers`, `fetchTeamMemberById`, `setTeamMemberActive`
- Import `revalidatePath` from `next/cache`
- Import `requireAdmin` from `lib/auth/is-admin` for explicit auth checks
- **IMPLEMENTED:** All actions use consistent `ActionResponse<T>` type with `success`, `data?`, `error?`, `status?`, `details?`
- Implement `createTeamMember(input: unknown)`: **IMPLEMENTED**
  - Calls `requireAdmin()` for explicit auth check
  - Validates input with Zod: `CreateTeamMemberInputSchema.parse(input)`
  - Uses `upsertTeamMember()` DAL function (without id, triggers INSERT)
  - Handles Zod errors separately with status 422 and details
  - Returns `ActionResponse<TeamMemberDb>` with success/error structure
  - On success: calls `revalidatePath('/admin/team')`
- Implement `updateTeamMember(id: number, input: unknown)`: **IMPLEMENTED**
  - Calls `requireAdmin()` for explicit auth check
  - Validates id is finite and > 0
  - Validates input with Zod: `UpdateTeamMemberInputSchema.parse(input)`
  - Checks record exists with `fetchTeamMemberById(id)` before update
  - Uses `upsertTeamMember({...parsed, id})` DAL function (with id, triggers UPDATE)
  - Returns `ActionResponse<TeamMemberDb>`
  - On success: calls `revalidatePath('/admin/team')`
- Implement `setTeamMemberActiveAction(id: number, active: boolean)`: **IMPLEMENTED**
  - Calls `requireAdmin()` for explicit auth check
  - Validates id (finite, > 0) and active (boolean type check)
  - Uses `setTeamMemberActive(id, active)` DAL function
  - Returns `ActionResponse<null>`
  - On success: calls `revalidatePath('/admin/team')`
- Implement `reorderTeamMembersAction(input: unknown)`: **IMPLEMENTED**
  - Calls `requireAdmin()` for explicit auth check
  - Validates array with Zod: `ReorderTeamMembersInputSchema.parse(input)`
  - Uses `reorderTeamMembers(parsed)` DAL function
  - Returns `ActionResponse<null>`
  - On success: calls `revalidatePath('/admin/team')`
- Error handling: **IMPLEMENTED** with try/catch, Zod error handling (status 422 + details), generic errors (status 500)
- Auth verification: **IMPLEMENTED** with explicit `requireAdmin()` calls in addition to RLS policies

### Group 4: Media Picker Integration

> Integrate with existing Media Library component for photo selection

- Check if Media Library component exists in `components/` (search for MediaPicker, MediaLibrary, ImageUpload, etc.)
- If exists: reuse component and adapt interface
- If not exists: create `components/features/admin/team/MediaPickerDialog.tsx`:
  - Accept props: `open: boolean`, `onClose: () => void`, `onSelect: (mediaId: number) => void`
  - Use shadcn Dialog component wrapper
  - Display list of medias from `medias` table (fetch via DAL or direct query)
  - Allow upload of new media (form with file input, upload to Supabase Storage bucket `members-photos`, insert record into `medias` table)
  - File validation: max 5MB, formats WebP/AVIF/JPEG (client-side check before upload)
  - On select: call `onSelect(mediaId)` and close dialog
  - On upload success: insert into medias table, call `onSelect`, close dialog
- Display selected photo preview in form using Next.js `<Image>` component with Supabase Storage URL
- Fallback: if `photo_media_id` is null, show placeholder or use `image_url` field (external URL)

### Group 5: Dumb Presentation Components

> Build reusable UI components with no business logic

- Create `components/features/admin/team/TeamMemberCard.tsx`:
  - Props: `member: TeamMemberRecord`, `onEdit?: () => void`, `onDeactivate?: () => void`
  - Display: Avatar (shadcn Avatar component with photo), name, role, status badge (active/inactive), order number
  - Actions: Edit and Delete buttons (only if callbacks provided)
  - Styling: shadcn Card component, responsive layout
- Create `components/features/admin/team/TeamMemberList.tsx`:
  - Props: `members: TeamMemberRecord[]`, `onEditMember: (id: number) => void`, `onDeactivateMember: (id: number) => void`, `loading?: boolean`
  - Display: Grid or table layout with TeamMemberCard components
  - Empty state: show message "No team members yet" with add button
  - Loading state: show skeleton cards (shadcn Skeleton component)
  - Filter controls: active/inactive toggle, search by name (local state)
- Create `components/features/admin/team/TeamMemberForm.tsx`:
  - Props: `member?: TeamMemberRecord | null`, `onSubmit: (data) => void`, `onCancel: () => void`, `loading?: boolean`
  - Form fields: name (required), role (optional text input), description (textarea), photo picker button, ordre (numeric input), active (checkbox/switch)
  - Use shadcn Form, Input, Textarea, Button, Switch components
  - Client-side validation: display Zod errors inline
  - Photo preview: show selected photo with remove button
  - Submit: call `onSubmit` with form data
  - Mode: create (empty form) or edit (pre-filled with member data)

### Group 6: Smart Container Component

> Orchestrate data fetching, mutations, and UI state

- Create `components/features/admin/team/TeamManagementContainer.tsx` with `"use client"` directive
- Import DAL functions: `fetchAllTeamMembers` (or use Server Action to fetch)
- Import Server Actions: `createTeamMember`, `updateTeamMember`, `setTeamMemberActiveAction` (or `deactivate`), `reorderTeamMembers`
- State management:
  - `members: TeamMemberRecord[]` (fetched data)
  - `selectedMember: TeamMemberRecord | null` (for edit dialog)
  - `isFormOpen: boolean` (dialog state)
  - `loading: boolean` (loading states for mutations)
- Data fetching: use `useEffect` to fetch on mount or use React Query/SWR for caching
- Mutation handlers:
  - `handleCreate`: call `createTeamMember` action, show toast on success/error, refresh data, close dialog
  - `handleUpdate`: call `updateTeamMember` action, show toast, refresh data, close dialog
  - `handleDeactivateTeamMember`: show confirmation dialog, call `setTeamMemberActiveAction` (or server action `setTeamMemberActive`) to set active=false, show toast, refresh data
  - `handleReorder`: if implementing drag-and-drop, call `reorderTeamMembers` action (otherwise manual numeric input in form)
- Pass data and callbacks to dumb components: `<TeamMemberList>`, `<TeamMemberForm>` in Dialog
- Error handling: display errors in toast notifications (use shadcn Toast/Sonner)
- Optimistic updates: optional, update local state before server response for better UX

### Group 7: Admin Page Setup

> Create admin route entry point

- Create `app/admin/team/page.tsx` (Server Component by default):
  - Import `TeamManagementContainer` (Client Component)
  - Add page metadata: `export const metadata = { title: 'Team Management | Admin' }`
  - Render container: `<TeamManagementContainer />`
  - Add breadcrumbs: Home > Admin > Team Management
  - Add "Add Member" button (triggers dialog in container)
- Create `app/admin/layout.tsx` if not exists:
  - Admin sidebar with navigation links (Dashboard, Team, Shows, Events, etc.)
  - Check auth: verify user is admin using `getClaims()` from Supabase client
  - Redirect to login if not authenticated: `redirect('/auth/login')`
  - Apply admin-specific styling and layout
- Verify route protection: middleware should already protect `/admin/*` routes (check `middleware.ts`)
- Test access: only admin users can view page, others redirected

### Group 8: Image Optimization and Display

> Integrate Next.js Image with Supabase Storage

- Photo URLs: construct from Supabase Storage bucket `members-photos` + `photo_media_id`
- Use `supabase.storage.from('members-photos').getPublicUrl(path)` to get URL
- Display with Next.js `<Image>`:
  - Set `width` and `height` props for optimization
  - Use `fill` prop for responsive containers
  - Add `alt` text: member name
  - Apply `priority` for above-the-fold images
- Fallback logic: if `photo_media_id` is null, use `image_url` (external URL) or placeholder image
- Thumbnails: rely on Supabase Storage transforms (e.g., add transform params to URL) or generate on upload
- Avatar component: use shadcn Avatar with Image inside, handle missing images gracefully

### Group 9: Styling and Responsiveness

> Apply TweakCN theme and ensure responsive design

- Use shadcn/ui components exclusively (no custom CSS unless necessary)
- Apply TweakCN theme variables from `tailwind.config.ts` and `app/globals.css`
- Responsive breakpoints:
  - Mobile (< 768px): single column, full-width cards
  - Tablet (768-1024px): 2-column grid
  - Desktop (> 1024px): 3-column grid or table layout
- Test on multiple devices: Chrome DevTools responsive mode
- Accessibility: ensure keyboard navigation, focus styles, ARIA labels on buttons and form inputs
- Dark mode: verify theme consistency (shadcn handles automatically)

### Group 10: Testing and Validation

> Verify all functionality and edge cases

- Test CRUD operations:
  - Create: add new member with all fields, verify appears in list
  - Read: fetch and display all members, test filtering
  - Update: edit existing member, change name/role/photo/order, verify changes saved
  - Delete: soft delete member (set active=false), verify disappears from public view but visible in admin
- Test photo upload:
  - Upload new photo via Media Library, verify stored in Supabase Storage
  - Select existing photo from library, verify `photo_media_id` saved
  - Remove photo, verify falls back to placeholder or `image_url`
- Test reordering:
  - Change `ordre` values manually, verify list re-sorts
  - If drag-and-drop: drag member to new position, verify ordre updated
- Test RLS policies:
  - As admin: verify can create/edit/delete
  - As anonymous: verify can view active members only (test by opening site in incognito)
  - As non-admin authenticated user: verify cannot edit (should get Supabase error)
- Test validation:
  - Submit form with empty name: verify error shown
  - Submit with invalid ordre (negative number): verify rejected
  - Upload oversized photo: verify rejected with error message
- Test audit logs:
  - Create/update/delete member, verify action logged in `logs_audit` table (query via Supabase dashboard or SQL)
  - Verify log includes: user_id, table_name, action, old_data, new_data, timestamp
- Test responsive design: mobile, tablet, desktop layouts
- Test accessibility: keyboard navigation, screen reader (use axe DevTools)

## Validation Checkpoints

- All TypeScript types imported from `lib/database.types.ts` (no duplication)
- DAL functions use `"use server"` and `"server-only"` directives
- Server Actions validate inputs with Zod schemas
- Server Actions call `revalidatePath()` after mutations
- Smart Container is Client Component, dumb components are pure
- Photos managed via Media Library (no direct file uploads in form)
- RLS policies enforce admin-only writes (verified by test)
- Audit logs record all changes automatically (verified by query)
- Responsive design tested on mobile, tablet, desktop
- Accessibility: keyboard navigation, ARIA labels, focus management
- No console errors in browser DevTools
- Build passes: `pnpm run build` succeeds
- TypeScript checks pass: `pnpm tsc --noEmit` succeeds
- Markdown lint passes: `pnpm run lint:md` succeeds (if docs updated)

## Additional Notes

### Existing Patterns to Follow

- Smart/Dumb component pattern from `copilot-instructions.md`
- DAL pattern from `lib/dal/compagnie-presentation.ts` (use as reference for structure)
- Server Actions pattern from Next.js 15 instructions
- Zod validation pattern from `compagnie-presentation.ts` (local schema definition, avoid exports)
- RLS policy pattern from schema files (co-located with table definitions)

### Dependencies Likely Needed

- shadcn components: `Avatar`, `Form`, `Input`, `Textarea`, `Button`, `Card`, `Dialog`, `Switch`, `Badge`, `Skeleton`, `Toast`
- Zod for validation (already in project)
- Next.js Image component (built-in)
- Supabase client (already in project)

### Media Library Component

- If Media Library component does not exist yet, create minimal version in this task
- Future tasks can enhance with advanced features (drag-drop upload, bulk operations, tagging)
- For now: simple list of existing medias + upload form

### Reordering Strategy

- Manual numeric input for MVP (simpler implementation)
- Future enhancement: drag-and-drop with `@dnd-kit/sortable` library
- Ordre field allows gaps (10, 20, 30) for future insertions without reordering all

### Security Considerations

- RLS policies enforce admin-only writes (no bypass in DAL)
- Server Actions do not explicitly check `is_admin()` (RLS handles it)
- Photo uploads go through Supabase Storage (secure, no direct filesystem access)
- Zod validation prevents malformed data
- Audit logs provide traceability for all changes

### Performance Optimizations

- Use Next.js Image component for automatic optimization
- Cache DAL queries with React Query or SWR (optional, can add later)
- Paginate team member list if count exceeds 50 (future enhancement)
- Lazy load Media Library dialog (only fetch medias when dialog opens)

### Future Enhancements (Out of Scope for TASK022)

- Drag-and-drop reordering
- Bulk operations (activate/deactivate multiple members)
- Advanced filtering (by role, date added)
- Export team list to CSV
- Image cropping tool in Media Library
- Version history viewer (content_versions table integration)
- Email notifications on team changes

---

## CRITICAL ENHANCEMENTS

### Enhancement 1: shadcn Component Installation

Before starting implementation, ensure all required shadcn components are installed:

```bash
# Install all required components at once
npx shadcn@latest add avatar form input textarea button card dialog switch badge skeleton toast

# Or with pnpm
pnpm dlx shadcn@latest add avatar form input textarea button card dialog switch badge skeleton toast
```

Verify installation in `components/ui/` directory. All components should be present before proceeding.

### Enhancement 2: Error Handling Pattern

Use this consistent error handling pattern across all Server Actions:

```typescript
// app/admin/team/actions.ts
"use server";

import { z } from "zod";

type ActionResponse<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function createTeamMember(
  input: CreateTeamMemberInput
): Promise<ActionResponse<TeamMember>> {
  try {
    // Validate input
    const validated = CreateTeamMemberInputSchema.parse(input);
    
    // Create client
    const supabase = await createClient();
    
    // Perform operation
    const { data, error } = await supabase
      .from("membres_equipe")
      .insert(validated)
      .select()
      .single();
    
    if (error) {
      console.error("createTeamMember error:", error);
      return { success: false, error: error.message };
    }
    
    // Revalidate cache
    revalidatePath("/admin/team");
    
    return { success: true, data };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(", ") 
      };
    }
    
    // Handle unexpected errors
    console.error("createTeamMember unexpected error:", error);
    return { 
      success: false, 
      error: "Une erreur inattendue s'est produite" 
    };
  }
}
```

Apply this pattern to all mutations: `updateTeamMember`, `setTeamMemberActiveAction` (deactivate), `reorderTeamMembers`.

### Enhancement 3: Database Migration Script for Ordre Field

Run this SQL script to ensure all existing team members have valid ordre values:

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_populate_membres_equipe_ordre.sql

-- Populate NULL ordre values with sequential numbers
WITH numbered AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at, id) * 10 as new_ordre
  FROM public.membres_equipe
  WHERE ordre IS NULL
)
UPDATE public.membres_equipe m
SET ordre = n.new_ordre
FROM numbered n
WHERE m.id = n.id;

-- Ensure no NULL values remain (set default to max + 10)
UPDATE public.membres_equipe
SET ordre = COALESCE(
  (SELECT MAX(ordre) FROM public.membres_equipe WHERE ordre IS NOT NULL) + 10,
  10
)
WHERE ordre IS NULL;

-- Add NOT NULL constraint
ALTER TABLE public.membres_equipe
ALTER COLUMN ordre SET NOT NULL;

-- Add default value for future inserts
ALTER TABLE public.membres_equipe
ALTER COLUMN ordre SET DEFAULT (
  COALESCE(
    (SELECT MAX(ordre) FROM public.membres_equipe) + 10,
    10
  )
);
```

Apply migration: `supabase db push`

### Enhancement 4: Admin Permission Check Helper

Create reusable admin check helper for consistent auth verification:

```typescript
// lib/auth/is-admin.ts
"use server";

import "server-only";
import { createClient } from "@/supabase/server";

/**
 * Verify if current user is admin
 * Returns true if admin, false otherwise
 * Use in Server Components and Server Actions for explicit auth checks
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const claims = await supabase.auth.getClaims();
    
    if (!claims) {
      return false;
    }
    
    // Check for admin role in claims
    // Adjust claim path based on your auth setup
    const role = claims.user_role || claims.app_metadata?.role;
    return role === "admin";
  } catch (error) {
    console.error("isAdmin check failed:", error);
    return false;
  }
}

/**
 * Verify admin or throw error
 * Use in Server Actions when admin access is required
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}
```

Use in Server Actions for explicit verification:

```typescript
// app/admin/team/actions.ts
import { requireAdmin } from "@/lib/auth/is-admin";

export async function createTeamMember(input: CreateTeamMemberInput) {
  // Explicit admin check (in addition to RLS)
  await requireAdmin();
  
  // Rest of implementation...
}
```

### Enhancement 5: File Structure with Import Examples

Complete file structure with headers and imports:

```typescript
// lib/schemas/team.ts
import { z } from "zod";

// NOTE: Do NOT duplicate TeamMemberSchema from components/features/public-site/compagnie/types.ts
// That schema is for public view (description, image). This is for admin (full DB fields).

// IMPLEMENTED: Full DB record schema with .nullable() for optional fields
export const TeamMemberDbSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(200),
  role: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  photo_media_id: z.number().nullable(),
  ordre: z.number().nullable(),
  active: z.boolean().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// IMPLEMENTED: Create schema with explicit nullable/optional fields
export const CreateTeamMemberInputSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  photo_media_id: z.number().nullable().optional(),
  ordre: z.number().nullable().optional(),
  active: z.boolean().optional(),
});

// IMPLEMENTED: Update schema with all fields optional (no id required)
export const UpdateTeamMemberInputSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  photo_media_id: z.number().nullable().optional(),
  ordre: z.number().nullable().optional(),
  active: z.boolean().optional(),
});

// Reorder schema
export const ReorderTeamMembersInputSchema = z.array(
  z.object({
    id: z.number(),
    ordre: z.number(),
  })
);

// Types
export type TeamMemberDb = z.infer<typeof TeamMemberDbSchema>;
export type CreateTeamMemberInput = z.infer<typeof CreateTeamMemberInputSchema>;
export type UpdateTeamMemberInput = z.infer<typeof UpdateTeamMemberInputSchema>;
export type ReorderTeamMembersInput = z.infer<typeof ReorderTeamMembersInputSchema>;
```

```typescript
// lib/dal/team.ts
import "server-only";
import { createClient } from "@/supabase/server";
import type { Database } from "@/lib/database.types";
import { TeamMemberDbSchema } from "@/lib/schemas/team";

type TeamRow = Database["public"]["Tables"]["membres_equipe"]["Row"];

/**
 * IMPLEMENTED: Fetch team members with optional includeInactive parameter
 * Default behavior: filters active=true (for admin lists)
 * includeInactive=true: shows all members (active + inactive)
 * 
 * Uses Zod validation with safeParse to filter out invalid rows
 */
export async function fetchAllTeamMembers(
  includeInactive = false
): Promise<TeamRow[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("membres_equipe")
      .select("*")
      .order("ordre", { ascending: true });

    if (!includeInactive) {
      query = query.eq("active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("fetchAllTeamMembers error:", error);
      return [];
    }

    const rows = (data as TeamRow[]) || [];

    // Validate each row with Zod; log invalid rows and filter them out
    const validRows: TeamRow[] = [];
    for (const r of rows) {
      const parsed = TeamMemberDbSchema.safeParse(r as unknown);
      if (parsed.success) validRows.push(parsed.data as TeamRow);
      else console.error("fetchAllTeamMembers: invalid row:", parsed.error);
    }

    return validRows;
  } catch (err) {
    console.error("fetchAllTeamMembers exception:", err);
    return [];
  }
}

/**
 * IMPLEMENTED: Fetch single team member by ID with Zod validation
 */
export async function fetchTeamMemberById(id: number): Promise<TeamRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("membres_equipe")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("fetchTeamMemberById error:", error);
      return null;
    }

    const parsed = TeamMemberDbSchema.safeParse(data as unknown);
    if (!parsed.success) {
      console.error("fetchTeamMemberById: invalid row:", parsed.error);
      return null;
    }

    return parsed.data as TeamRow;
  } catch (err) {
    console.error("fetchTeamMemberById exception:", err);
    return null;
  }
}

/**
 * IMPLEMENTED: Unified upsert function
 * - If id is present and valid (> 0): performs UPDATE
 * - If id is missing/invalid: performs INSERT
 * - Destructures {id, ...rest} to avoid sending id to INSERT
 */
export async function upsertTeamMember(
  payload: Partial<TeamRow>
): Promise<TeamRow | null> {
  try {
    const supabase = await createClient();
    const { id, ...rest } = payload as Partial<TeamRow>;
    let data: unknown = null;
    let error: unknown = null;

    if (typeof id === "number" && Number.isFinite(id) && id > 0) {
      const res = await supabase
        .from("membres_equipe")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      data = res.data;
      error = res.error;
    } else {
      const res = await supabase
        .from("membres_equipe")
        .insert(rest)
        .select()
        .single();
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error("upsertTeamMember error:", error);
      return null;
    }

    const parsed = TeamMemberDbSchema.safeParse(data as unknown);
    if (!parsed.success) {
      console.error("upsertTeamMember: invalid response:", parsed.error);
      return null;
    }

    return parsed.data as TeamRow;
  } catch (err: unknown) {
    console.error("upsertTeamMember exception:", err);
    return null;
  }
}

// ... other DAL functions: setTeamMemberActive, hardDeleteTeamMember, reorderTeamMembers
```

```typescript
// components/features/admin/team/TeamManagementContainer.tsx
"use client";

import { useState, useEffect } from "react";
import { fetchAllTeamMembers } from "@/lib/dal/team";
import { createTeamMember, updateTeamMember, setTeamMemberActiveAction } from "@/app/admin/team/actions";
import { useToast } from "@/components/ui/use-toast";
import { TeamMemberList } from "./TeamMemberList";
import { TeamMemberForm } from "./TeamMemberForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Database } from "@/lib/database.types";

type TeamMember = Database["public"]["Tables"]["membres_equipe"]["Row"];

export function TeamManagementContainer() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // ... implementation
}
```

### Enhancement 6: Testing SQL Script Template

Use this SQL script to verify implementation:

```sql
-- Test RLS policies
-- Run as anonymous user (should see only active members)
SET ROLE anon;
SELECT * FROM public.membres_equipe; -- Should only return active=true

-- Run as authenticated non-admin (should see only active, cannot edit)
SET ROLE authenticated;
SELECT * FROM public.membres_equipe; -- Should only return active=true
INSERT INTO public.membres_equipe (name, role) VALUES ('Test', 'Actor'); -- Should fail

-- Run as admin (should see all, can edit)
SET ROLE authenticated;
-- Set user_role claim to 'admin' (method varies by setup)
SELECT * FROM public.membres_equipe; -- Should return all members
INSERT INTO public.membres_equipe (name, role) VALUES ('Test Admin', 'Director'); -- Should succeed

RESET ROLE;

-- Verify audit logs
SELECT 
  table_name,
  action,
  changed_by_id,
  changed_at,
  old_data->>'name' as old_name,
  new_data->>'name' as new_name
FROM public.logs_audit
WHERE table_name = 'membres_equipe'
ORDER BY changed_at DESC
LIMIT 10;

-- Verify ordre values (no NULLs, proper sequence)
SELECT id, name, ordre, active
FROM public.membres_equipe
ORDER BY ordre;

-- Check for duplicate ordre values
SELECT ordre, COUNT(*) as count
FROM public.membres_equipe
GROUP BY ordre
HAVING COUNT(*) > 1;
```

### Enhancement 7: Performance Benchmarking Checklist

Verify these performance targets:

- **Page Load Time:** < 1.5s (First Contentful Paint)
- **Image Loading:** < 500ms (with Next.js Image optimization)
- **Server Action Response:** < 300ms (create/update/delete)
- **DAL Query Time:** < 200ms (fetchAllTeamMembers)
- **Lighthouse Score:** > 90 (Performance, Accessibility, Best Practices, SEO)

Use Chrome DevTools Performance tab to measure and optimize.

---

>**End of Instructions**
