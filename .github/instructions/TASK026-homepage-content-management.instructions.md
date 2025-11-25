---
applyTo: "**"
description: TASK026
---

# TASK026 - Homepage Content Management

> Complete admin interface for managing homepage content: Hero Slides (CRUD + reorder), About Section (single record editor), and News Highlights (featured flag). Follow TASK021 pattern: DAL → API Routes → Admin UI.

## Goal

Build complete admin interface for managing homepage content with three main sections:

1. **Hero Slides**: CRUD + drag-drop reordering (max 10 active slides)
2. **About Section**: Single record editor with character limits
3. **News Highlights**: Featured flag toggle for press releases

## Prerequisites

- Admin authentication system operational
- Media Library available (`MediaPickerDialog`)
- Existing DAL pattern from TASK021
- Supabase local database running
- Required npm packages:
  - `@dnd-kit/core` and `@dnd-kit/sortable` (install if missing: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`)
  - `react-hook-form` and `@hookform/resolvers` (already installed)
  - `zod` (already installed)

## Existing Files

```
lib/dal/home-hero.ts                                    # Public hero slides fetching
lib/dal/home-about.ts                                   # Public about content fetching
lib/dal/home-news.ts                                    # Public news fetching
lib/api/helpers.ts                                      # API response helpers
components/ui/button.tsx                                # shadcn/ui button
components/ui/input.tsx                                 # shadcn/ui input
components/ui/textarea.tsx                              # shadcn/ui textarea
components/ui/form.tsx                                  # shadcn/ui form
components/ui/dialog.tsx                                # shadcn/ui dialog
components/features/admin/media/MediaPickerDialog.tsx  # Media picker
supabase/schemas/07d_table_home_hero.sql               # Hero slides table
supabase/schemas/07e_table_home_about.sql              # About content table
supabase/schemas/08b_communiques_presse.sql            # Press releases table
```

## New Files to Create

```
lib/dal/admin-home-hero.ts                              # Admin hero slides DAL
lib/dal/admin-home-about.ts                             # Admin about content DAL
lib/schemas/home-content.ts                             # Zod validation schemas
app/api/admin/home/hero/route.ts                        # Hero slides list/create API
app/api/admin/home/hero/[id]/route.ts                   # Hero slide get/update/delete API
app/api/admin/home/hero/reorder/route.ts                # Hero slides reorder API
app/api/admin/home/about/route.ts                       # About content get API
app/api/admin/home/about/[id]/route.ts                  # About content update API
app/(admin)/admin/home/hero/page.tsx                    # Hero slides admin page
app/(admin)/admin/home/about/page.tsx                   # About content admin page
components/features/admin/home/HeroSlidesContainer.tsx  # Hero slides server container
components/features/admin/home/HeroSlidesView.tsx       # Hero slides client view
components/features/admin/home/HeroSlideForm.tsx        # Hero slide form dialog
components/features/admin/home/HeroSlidePreview.tsx     # Hero slide live preview
components/features/admin/home/AboutContentContainer.tsx # About content server container
components/features/admin/home/AboutContentForm.tsx     # About content form
components/skeletons/HeroSlidesSkeleton.tsx             # Loading skeleton for hero slides
components/skeletons/AboutContentSkeleton.tsx           # Loading skeleton for about content
lib/utils/validate-image-url.ts                         # Image URL validation helper
supabase/schemas/63b_reorder_hero_slides.sql            # Hero slides reorder function
scripts/test-home-hero-api.ts                           # API integration tests
```

## Implementation Groups

### Group 1: Database Schema & Functions

**Goal**: Setup database layer with reorder function and validation constraints

**Tasks**:

1. **Install dependencies** (if not present):
   ```bash
   pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. **Stop local database** before schema changes:
   ```bash
   pnpm dlx supabase stop
   ```

3. **Create reorder function** `supabase/schemas/63b_reorder_hero_slides.sql`:
   - Clone pattern from `63_reorder_team_members.sql`
   - Function signature: `public.reorder_hero_slides(order_data jsonb) RETURNS void`
   - Add `SECURITY DEFINER` with rationale header:
     ```sql
     /*
      * Security Model: SECURITY DEFINER
      * 
      * Rationale:
      *   1. Atomic reordering operation requires UPDATE on multiple rows
      *   2. Must bypass RLS to update all positions in single transaction
      *   3. Admin-only operation (explicit is_admin() check enforced)
      *   4. Prevents race conditions with advisory lock
      * 
      * Risks Evaluated:
      *   - Authorization: Explicit is_admin() check at function start
      *   - Input validation: JSONB structure validated, numeric positions enforced
      *   - Concurrency: Advisory lock prevents simultaneous reorders
      *   - Data integrity: Transaction ensures all-or-nothing updates
      * 
      * Validation:
      *   - Tested with admin user: reorder succeeds
      *   - Tested with non-admin user: authorization denied
      *   - Tested concurrent calls: advisory lock prevents conflicts
      */
     ```
   - Set `search_path = ''` for security
   - Use advisory lock: `pg_advisory_xact_lock(hashtext('reorder_hero_slides'))`
   - Validate `is_admin()` at function start
   - Grant `EXECUTE` to `authenticated` role only

4. **Add database constraints**:
   - `featured` boolean column to `communiques_presse`:
     ```sql
     ALTER TABLE public.communiques_presse 
     ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
     
     COMMENT ON COLUMN public.communiques_presse.featured IS 
     'Flag indicating if press release is featured on homepage';
     ```
   - CHECK constraint `home_hero_slides_max_active`:
     ```sql
     CREATE OR REPLACE FUNCTION public.check_max_hero_slides()
     RETURNS trigger
     LANGUAGE plpgsql
     SECURITY INVOKER
     SET search_path = ''
     AS $$
     BEGIN
       IF NEW.active = true THEN
         IF (SELECT COUNT(*) FROM public.home_hero_slides WHERE active = true) >= 10 THEN
           RAISE EXCEPTION 'Maximum 10 active hero slides allowed';
         END IF;
       END IF;
       RETURN NEW;
     END;
     $$;
     
     CREATE TRIGGER enforce_max_hero_slides
     BEFORE INSERT OR UPDATE ON public.home_hero_slides
     FOR EACH ROW
     EXECUTE FUNCTION public.check_max_hero_slides();
     ```
   - CHECK constraint `home_hero_slides_image_required`:
     ```sql
     ALTER TABLE public.home_hero_slides
     ADD CONSTRAINT home_hero_slides_image_required 
     CHECK (image_media_id IS NOT NULL OR image_url IS NOT NULL);
     ```
   - `alt_text` column to `home_hero_slides`:
     ```sql
     ALTER TABLE public.home_hero_slides 
     ADD COLUMN IF NOT EXISTS alt_text text NOT NULL DEFAULT '',
     ADD CONSTRAINT home_hero_slides_alt_text_length CHECK (char_length(alt_text) <= 125);
     
     COMMENT ON COLUMN public.home_hero_slides.alt_text IS 
     'Alt text for hero slide image (accessibility, max 125 chars)';
     ```
   - Update `home_about_content` constraints:
     ```sql
     ALTER TABLE public.home_about_content
     ADD CONSTRAINT home_about_title_length CHECK (char_length(title) <= 80),
     ADD CONSTRAINT home_about_intro1_length CHECK (char_length(intro1) <= 1000),
     ADD CONSTRAINT home_about_intro2_length CHECK (char_length(intro2) <= 1000),
     ADD CONSTRAINT home_about_mission_text_length CHECK (char_length(mission_text) <= 4000);
     
     ALTER TABLE public.home_about_content
     ADD COLUMN IF NOT EXISTS alt_text text,
     ADD CONSTRAINT home_about_alt_text_length CHECK (char_length(alt_text) <= 125);
     
     COMMENT ON COLUMN public.home_about_content.alt_text IS 
     'Alt text for about section image (accessibility, max 125 chars)';
     ```

5. **Generate migration**:
   ```bash
   pnpm dlx supabase db diff -f add_homepage_content_constraints
   ```

6. **Test migration locally**:
   ```bash
   pnpm dlx supabase db push
   ```

7. **Rollback migration** (in case of failure):
   - Create `supabase/migrations/YYYYMMDDHHMMSS_rollback_homepage_constraints.sql`:
     ```sql
     -- Rollback script (use only if migration fails)
     DROP TRIGGER IF EXISTS enforce_max_hero_slides ON public.home_hero_slides;
     DROP FUNCTION IF EXISTS public.check_max_hero_slides();
     DROP FUNCTION IF EXISTS public.reorder_hero_slides(jsonb);
     ALTER TABLE public.home_hero_slides DROP CONSTRAINT IF EXISTS home_hero_slides_image_required;
     ALTER TABLE public.home_hero_slides DROP CONSTRAINT IF EXISTS home_hero_slides_alt_text_length;
     ALTER TABLE public.home_hero_slides DROP COLUMN IF EXISTS alt_text;
     ALTER TABLE public.home_about_content DROP CONSTRAINT IF EXISTS home_about_title_length;
     ALTER TABLE public.home_about_content DROP CONSTRAINT IF EXISTS home_about_intro1_length;
     ALTER TABLE public.home_about_content DROP CONSTRAINT IF EXISTS home_about_intro2_length;
     ALTER TABLE public.home_about_content DROP CONSTRAINT IF EXISTS home_about_mission_text_length;
     ALTER TABLE public.home_about_content DROP CONSTRAINT IF EXISTS home_about_alt_text_length;
     ALTER TABLE public.home_about_content DROP COLUMN IF EXISTS alt_text;
     ALTER TABLE public.communiques_presse DROP COLUMN IF EXISTS featured;
     ```

**Validation Checkpoints**:
- [ ] Dependencies installed
- [ ] Migration file generated with proper naming
- [ ] `reorder_hero_slides()` function created with SECURITY DEFINER rationale header
- [ ] All constraints added successfully
- [ ] Local database migration applied without errors
- [ ] Rollback script created (not executed)

---

### Group 2: Validation Schemas (Zod)

**Goal**: Define strict TypeScript validation schemas with refinements

**Create** `lib/schemas/home-content.ts`:

```typescript
import { z } from "zod";

// Hero Slide Input Schema
export const HeroSlideInputSchema = z.object({
  title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
  subtitle: z.string().max(150, "Subtitle max 150 characters").optional(),
  description: z.string().max(500, "Description max 500 characters").optional(),
  image_url: z.string().url("Invalid URL format").optional(),
  image_media_id: z.coerce.bigint().optional(),
  cta_label: z.string().max(50, "CTA label max 50 characters").optional(),
  cta_url: z.string().url("Invalid CTA URL format").optional(),
  alt_text: z.string().min(1, "Alt text required for accessibility").max(125, "Alt text max 125 characters"),
  active: z.boolean().default(true),
  position: z.coerce.number().int().min(0, "Position must be non-negative").optional(),
}).refine(
  (data) => data.image_media_id !== undefined || data.image_url !== undefined,
  { message: "An image is required (media ID or URL)", path: ["image_media_id"] }
).refine(
  (data) => !data.cta_label || data.cta_url !== undefined,
  { message: "CTA URL required when label provided", path: ["cta_url"] }
).refine(
  (data) => !data.cta_url || data.cta_label !== undefined,
  { message: "CTA label required when URL provided", path: ["cta_label"] }
);

export type HeroSlideInput = z.infer<typeof HeroSlideInputSchema>;

// About Content Input Schema
export const AboutContentInputSchema = z.object({
  title: z.string().min(1, "Title required").max(80, "Title max 80 characters"),
  intro1: z.string().min(1, "First intro paragraph required").max(1000, "Intro 1 max 1000 characters"),
  intro2: z.string().min(1, "Second intro paragraph required").max(1000, "Intro 2 max 1000 characters"),
  mission_title: z.string().min(1, "Mission title required").max(80, "Mission title max 80 characters"),
  mission_text: z.string().min(1, "Mission text required").max(4000, "Mission text max 4000 characters"),
  image_url: z.string().url("Invalid URL format").optional(),
  image_media_id: z.coerce.bigint().optional(),
  alt_text: z.string().max(125, "Alt text max 125 characters").optional(),
});

export type AboutContentInput = z.infer<typeof AboutContentInputSchema>;

// Reorder Input Schema
export const ReorderInputSchema = z.array(
  z.object({
    id: z.coerce.bigint(),
    position: z.coerce.number().int().min(0),
  })
);

export type ReorderInput = z.infer<typeof ReorderInputSchema>;

// DTO Types for API responses
export interface HeroSlideDTO {
  id: bigint;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  image_media_id: bigint | null;
  cta_label: string | null;
  cta_url: string | null;
  alt_text: string;
  active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface AboutContentDTO {
  id: bigint;
  title: string;
  intro1: string;
  intro2: string;
  mission_title: string;
  mission_text: string;
  image_url: string | null;
  image_media_id: bigint | null;
  alt_text: string | null;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Validation Checkpoints**:
- [ ] All Zod schemas created with proper constraints
- [ ] Refinements enforce business rules (image required, CTA pairing)
- [ ] TypeScript types exported for use in DAL/API
- [ ] DTO interfaces match database schema

---

### Group 3: Image URL Validation Helper

**Goal**: Add URL validation helper to prevent invalid image URLs

**Create** `lib/utils/validate-image-url.ts`:

```typescript
"use server";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
] as const;

type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return ALLOWED_MIME_TYPES.includes(mime as AllowedMimeType);
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  mime?: AllowedMimeType;
  size?: number;
}

export async function validateImageUrl(
  url: string
): Promise<ImageValidationResult> {
  try {
    const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });

    if (!response.ok) {
      return {
        valid: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !isAllowedMimeType(contentType.split(";")[0].trim())) {
      return {
        valid: false,
        error: `Invalid image type: ${contentType}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
      };
    }

    const contentLength = response.headers.get("content-length");
    const size = contentLength ? parseInt(contentLength, 10) : undefined;

    return {
      valid: true,
      mime: contentType.split(";")[0].trim() as AllowedMimeType,
      size,
    };
  } catch (error: unknown) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}
```

**Usage Example**:
```typescript
const validation = await validateImageUrl("https://example.com/image.jpg");
if (!validation.valid) {
  return { success: false, error: validation.error };
}
```

**Validation Checkpoints**:
- [ ] Helper function created with type guards
- [ ] HEAD request checks HTTP 200 and MIME type
- [ ] Timeout set to prevent hanging requests (5s)
- [ ] Error handling covers network failures

---

### Group 4: DAL - Hero Slides (Admin)

**Goal**: Create server-only data access layer for hero slides management

**Create** `lib/dal/admin-home-hero.ts`:

```typescript
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import type { HeroSlideInput, HeroSlideDTO, ReorderInput } from "@/lib/schemas/home-content";
import { HeroSlideInputSchema, ReorderInputSchema } from "@/lib/schemas/home-content";
import { requireAdmin } from "@/lib/auth/is-admin";

export interface DALResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all hero slides (admin view, includes inactive)
 * @returns Array of hero slides ordered by position
 */
export async function fetchAllHeroSlides(): Promise<HeroSlideDTO[]> {
  await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_hero_slides")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(`[ERR_HERO_001] Failed to fetch hero slides: ${error.message}`);
  return data ?? [];
}

/**
 * Fetch single hero slide by ID
 * @param id - Hero slide ID
 * @returns Hero slide or null if not found
 */
export async function fetchHeroSlideById(id: bigint): Promise<HeroSlideDTO | null> {
  await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_hero_slides")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`[ERR_HERO_002] Failed to fetch hero slide: ${error.message}`);
  }
  
  return data;
}

/**
 * Create new hero slide
 * @param input - Hero slide data
 * @returns Created hero slide
 */
export async function createHeroSlide(input: HeroSlideInput): Promise<DALResult<HeroSlideDTO>> {
  try {
    await requireAdmin();
    
    const validated = HeroSlideInputSchema.parse(input);
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("home_hero_slides")
      .insert(validated)
      .select()
      .single();

    if (error) {
      console.error("[DAL] Failed to create hero slide:", error);
      return {
        success: false,
        error: `[ERR_HERO_003] Failed to create hero slide: ${error.message}`,
      };
    }

    revalidatePath("/admin/home/hero");
    revalidatePath("/");
    
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update existing hero slide
 * @param id - Hero slide ID
 * @param input - Partial hero slide data
 * @returns Updated hero slide
 */
export async function updateHeroSlide(
  id: bigint,
  input: Partial<HeroSlideInput>
): Promise<DALResult<HeroSlideDTO>> {
  try {
    await requireAdmin();
    
    const validated = HeroSlideInputSchema.partial().parse(input);
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("home_hero_slides")
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[DAL] Failed to update hero slide:", error);
      return {
        success: false,
        error: `[ERR_HERO_004] Failed to update hero slide: ${error.message}`,
      };
    }

    revalidatePath("/admin/home/hero");
    revalidatePath("/");
    
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Soft delete hero slide (set active=false)
 * @param id - Hero slide ID
 * @returns Success status
 */
export async function deleteHeroSlide(id: bigint): Promise<DALResult<null>> {
  try {
    await requireAdmin();
    
    const supabase = await createClient();
    const { error } = await supabase
      .from("home_hero_slides")
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[DAL] Failed to delete hero slide:", error);
      return {
        success: false,
        error: `[ERR_HERO_005] Failed to delete hero slide: ${error.message}`,
      };
    }

    revalidatePath("/admin/home/hero");
    revalidatePath("/");
    
    return { success: true, data: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reorder hero slides via database RPC
 * @param order - Array of {id, position} objects
 * @returns Success status
 */
export async function reorderHeroSlides(order: ReorderInput): Promise<DALResult<null>> {
  try {
    await requireAdmin();
    
    const validated = ReorderInputSchema.parse(order);
    
    const supabase = await createClient();
    const { error } = await supabase.rpc("reorder_hero_slides", {
      order_data: validated,
    });

    if (error) {
      console.error("[DAL] Failed to reorder hero slides:", error);
      return {
        success: false,
        error: `[ERR_HERO_006] Failed to reorder hero slides: ${error.message}`,
      };
    }

    revalidatePath("/admin/home/hero");
    revalidatePath("/");
    
    return { success: true, data: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

**Error Codes Reference**:
- `[ERR_HERO_001]`: Failed to fetch all hero slides
- `[ERR_HERO_002]`: Failed to fetch hero slide by ID
- `[ERR_HERO_003]`: Failed to create hero slide
- `[ERR_HERO_004]`: Failed to update hero slide
- `[ERR_HERO_005]`: Failed to soft delete hero slide
- `[ERR_HERO_006]`: Failed to reorder hero slides

**Validation Checkpoints**:
- [ ] All functions marked `"use server"` with `import "server-only"`
- [ ] Admin auth checked via `requireAdmin()` at start of each function
- [ ] Zod validation on all inputs
- [ ] Error codes added for tracing
- [ ] `revalidatePath()` called for both admin and public homepage
- [ ] Functions ≤ 30 lines each (Clean Code compliance)
- [ ] JSDoc comments document params and return types

---

### Group 5: DAL - About Section (Admin)

**Goal**: Create server-only data access for about content management

**Create** `lib/dal/admin-home-about.ts`:

```typescript
"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import type { AboutContentInput, AboutContentDTO } from "@/lib/schemas/home-content";
import { AboutContentInputSchema } from "@/lib/schemas/home-content";
import { requireAdmin } from "@/lib/auth/is-admin";

export interface DALResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch active about content (single record)
 * @returns Active about content or null if not found
 */
export async function fetchActiveAboutContent(): Promise<AboutContentDTO | null> {
  await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_about_content")
    .select("*")
    .eq("active", true)
    .order("position", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`[ERR_ABOUT_001] Failed to fetch about content: ${error.message}`);
  }
  
  return data;
}

/**
 * Update about content
 * @param id - About content ID
 * @param input - About content data
 * @returns Updated about content
 */
export async function updateAboutContent(
  id: bigint,
  input: AboutContentInput
): Promise<DALResult<AboutContentDTO>> {
  try {
    await requireAdmin();
    
    const validated = AboutContentInputSchema.parse(input);
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("home_about_content")
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[DAL] Failed to update about content:", error);
      return {
        success: false,
        error: `[ERR_ABOUT_002] Failed to update about content: ${error.message}`,
      };
    }

    revalidatePath("/admin/home/about");
    revalidatePath("/");
    
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

**Error Codes Reference**:
- `[ERR_ABOUT_001]`: Failed to fetch about content
- `[ERR_ABOUT_002]`: Failed to update about content

**Validation Checkpoints**:
- [ ] Server-only directives present
- [ ] Admin auth enforced
- [ ] Zod validation on input
- [ ] Error codes for tracing
- [ ] Revalidation paths correct
- [ ] Functions ≤ 30 lines

---

## Next Groups Preview

**Group 6**: API Routes - Hero Slides (GET, POST, PATCH, DELETE, reorder)
**Group 7**: API Routes - About Section (GET, PATCH)
**Group 8**: Skeleton Components (loading states)
**Group 9**: Admin UI - Hero Slides (container, view, form, preview)
**Group 10**: Admin UI - About Section (container, form)
**Group 11**: Sidebar Navigation Updates
**Group 12**: Error Boundaries & Rate Limiting
**Group 13**: Testing & Validation
**Group 14**: Future Improvements (audit logging, versioning, mobile responsive)

---

## Implementation Notes

- **Pattern Consistency**: Follow TASK021 Spectacles CRUD patterns
- **Security**: All DAL functions require admin auth, all API routes use `withAdminAuth()`
- **Validation**: Zod schemas at API boundaries, TypeScript strict mode
- **Performance**: Optimistic UI updates with revalidation, debounce on reorder (300ms)
- **Accessibility**: Alt text required for all images, keyboard navigation for drag-drop
- **Error Handling**: Structured error codes for debugging, toast notifications for user feedback

---

## Related Documentation

- Next.js 15 API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Supabase RPC: https://supabase.com/docs/reference/javascript/rpc
- React Hook Form: https://react-hook-form.com/docs/useform
- Zod Validation: https://zod.dev/?id=strings
- DnD Kit: https://docs.dndkit.com/introduction/getting-started

---

**Status**: Ready for implementation (Groups 1-5 defined)
**Next**: Continue with Groups 6-14 following same pattern
