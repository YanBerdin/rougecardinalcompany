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

## Design & Component Guidelines

**Component Installation**: Use shadcn MCP as documented in `.github/instructions/shadcn-mcp.instructions.md`
- Browse components using natural language with Copilot
- Install shadcn/ui components directly into `components/ui/`
- Example: "Add a badge component from shadcn registry"

**Frontend Design**: Follow `.github/instructions/rouge-cardinal-frontend-skill.instructions.md`
- Apply distinctive theatrical design aesthetic (Dramatic Minimalism, Editorial Sophistication, etc.)
- Use Cardinal red (`#ad0000`) as signature accent color
- Maintain brand consistency with serif display typography + clean sans-serif UI
- Ensure all views are production-grade with high design quality
- Avoid generic UI patterns; implement thoughtful, theatrical-inspired layouts

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

### Group 6: API Routes - Hero Slides

**Goal**: Create RESTful API endpoints for hero slides management

#### File 1: List & Create API

**Create** `app/api/admin/home/hero/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { withAdminAuth, ApiResponse, HttpStatus } from "@/lib/api/helpers";
import { fetchAllHeroSlides, createHeroSlide } from "@/lib/dal/admin-home-hero";
import { HeroSlideInputSchema } from "@/lib/schemas/home-content";

/**
 * GET /api/admin/home/hero
 * Fetch all hero slides (admin view)
 */
export const GET = withAdminAuth(async () => {
  try {
    const slides = await fetchAllHeroSlides();
    return ApiResponse.success({ slides });
  } catch (error: unknown) {
    return ApiResponse.error(
      error instanceof Error ? error.message : "Failed to fetch hero slides",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * POST /api/admin/home/hero
 * Create new hero slide
 */
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validated = HeroSlideInputSchema.parse(body);
    
    const result = await createHeroSlide(validated);
    
    if (!result.success) {
      return ApiResponse.error(
        result.error || "Failed to create hero slide",
        HttpStatus.BAD_REQUEST
      );
    }
    
    return ApiResponse.success({ slide: result.data }, HttpStatus.CREATED);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return ApiResponse.error("Invalid input data", HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return ApiResponse.error(
      error instanceof Error ? error.message : "Failed to create hero slide",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});
```

#### File 2: Get, Update & Delete API

**Create** `app/api/admin/home/hero/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { withAdminAuth, ApiResponse, HttpStatus } from "@/lib/api/helpers";
import {
  fetchHeroSlideById,
  updateHeroSlide,
  deleteHeroSlide,
} from "@/lib/dal/admin-home-hero";
import { HeroSlideInputSchema } from "@/lib/schemas/home-content";

/**
 * GET /api/admin/home/hero/[id]
 * Fetch single hero slide by ID
 */
export const GET = withAdminAuth(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const id = BigInt(params.id);
      const slide = await fetchHeroSlideById(id);
      
      if (!slide) {
        return ApiResponse.error("Hero slide not found", HttpStatus.NOT_FOUND);
      }
      
      return ApiResponse.success({ slide });
    } catch (error: unknown) {
      return ApiResponse.error(
        error instanceof Error ? error.message : "Failed to fetch hero slide",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
);

/**
 * PATCH /api/admin/home/hero/[id]
 * Update existing hero slide
 */
export const PATCH = withAdminAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const id = BigInt(params.id);
      const body = await request.json();
      const validated = HeroSlideInputSchema.partial().parse(body);
      
      const result = await updateHeroSlide(id, validated);
      
      if (!result.success) {
        return ApiResponse.error(
          result.error || "Failed to update hero slide",
          HttpStatus.BAD_REQUEST
        );
      }
      
      return ApiResponse.success({ slide: result.data });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "ZodError") {
        return ApiResponse.error("Invalid input data", HttpStatus.UNPROCESSABLE_ENTITY);
      }
      return ApiResponse.error(
        error instanceof Error ? error.message : "Failed to update hero slide",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
);

/**
 * DELETE /api/admin/home/hero/[id]
 * Soft delete hero slide (set active=false)
 */
export const DELETE = withAdminAuth(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const id = BigInt(params.id);
      const result = await deleteHeroSlide(id);
      
      if (!result.success) {
        return ApiResponse.error(
          result.error || "Failed to delete hero slide",
          HttpStatus.BAD_REQUEST
        );
      }
      
      return ApiResponse.success({ message: "Hero slide deleted" });
    } catch (error: unknown) {
      return ApiResponse.error(
        error instanceof Error ? error.message : "Failed to delete hero slide",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
);
```

#### File 3: Reorder API

**Create** `app/api/admin/home/hero/reorder/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { withAdminAuth, ApiResponse, HttpStatus } from "@/lib/api/helpers";
import { reorderHeroSlides } from "@/lib/dal/admin-home-hero";
import { ReorderInputSchema } from "@/lib/schemas/home-content";

/**
 * POST /api/admin/home/hero/reorder
 * Reorder hero slides via database RPC
 */
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validated = ReorderInputSchema.parse(body);
    
    const result = await reorderHeroSlides(validated);
    
    if (!result.success) {
      return ApiResponse.error(
        result.error || "Failed to reorder hero slides",
        HttpStatus.BAD_REQUEST
      );
    }
    
    return ApiResponse.success({ message: "Hero slides reordered successfully" });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return ApiResponse.error("Invalid reorder data", HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return ApiResponse.error(
      error instanceof Error ? error.message : "Failed to reorder hero slides",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});
```

**Validation Checkpoints**:
- [ ] All routes wrapped with `withAdminAuth()`
- [ ] Proper HTTP status codes using `HttpStatus` constants
- [ ] Zod validation with error handling
- [ ] Consistent error response format via `ApiResponse.success()` and `ApiResponse.error()`
- [ ] BigInt conversion for IDs
- [ ] API helpers imported from `@/lib/api/helpers`

---

### Group 7: API Routes - About Section

**Goal**: Create API endpoints for about content management

#### File 1: Get About Content API

**Create** `app/api/admin/home/about/route.ts`:

```typescript
import { withAdminAuth, ApiResponse, HttpStatus } from "@/lib/api/helpers";
import { fetchActiveAboutContent } from "@/lib/dal/admin-home-about";

/**
 * GET /api/admin/home/about
 * Fetch active about content (single record)
 */
export const GET = withAdminAuth(async () => {
  try {
    const content = await fetchActiveAboutContent();
    
    if (!content) {
      return ApiResponse.error("About content not found", HttpStatus.NOT_FOUND);
    }
    
    return ApiResponse.success({ content });
  } catch (error: unknown) {
    return ApiResponse.error(
      error instanceof Error ? error.message : "Failed to fetch about content",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});
```

#### File 2: Update About Content API

**Create** `app/api/admin/home/about/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { withAdminAuth, ApiResponse, HttpStatus } from "@/lib/api/helpers";
import { updateAboutContent } from "@/lib/dal/admin-home-about";
import { AboutContentInputSchema } from "@/lib/schemas/home-content";

/**
 * PATCH /api/admin/home/about/[id]
 * Update about content
 */
export const PATCH = withAdminAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const id = BigInt(params.id);
      const body = await request.json();
      const validated = AboutContentInputSchema.parse(body);
      
      const result = await updateAboutContent(id, validated);
      
      if (!result.success) {
        return ApiResponse.error(
          result.error || "Failed to update about content",
          HttpStatus.BAD_REQUEST
        );
      }
      
      return ApiResponse.success({ content: result.data });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "ZodError") {
        return ApiResponse.error("Invalid input data", HttpStatus.UNPROCESSABLE_ENTITY);
      }
      return ApiResponse.error(
        error instanceof Error ? error.message : "Failed to update about content",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
);
```

**Validation Checkpoints**:
- [ ] Routes wrapped with `withAdminAuth()`
- [ ] Proper HTTP status codes
- [ ] Zod validation with error handling
- [ ] 404 handling for missing content
- [ ] BigInt conversion for ID

---

### Group 8: Loading Skeleton Components

**Goal**: Create consistent loading states for admin UI

#### File 1: Hero Slides Skeleton

**Create** `components/skeletons/HeroSlidesSkeleton.tsx`:

```typescript
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSlidesSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Slides list skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-5 w-5" /> {/* Drag handle */}
                <Skeleton className="h-16 w-24 rounded" /> {/* Image */}
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-64" /> {/* Title */}
                  <Skeleton className="h-4 w-48" /> {/* Subtitle */}
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-md" /> {/* Edit button */}
                <Skeleton className="h-9 w-9 rounded-md" /> {/* Delete button */}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### File 2: About Content Skeleton

**Create** `components/skeletons/AboutContentSkeleton.tsx`:

```typescript
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AboutContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
      </div>
      
      {/* Form skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Intro paragraphs */}
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
          
          {/* Mission section */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
          
          {/* Image section */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-4">
              <Skeleton className="h-32 w-48 rounded" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Validation Checkpoints**:
- [ ] Skeletons match actual component layouts
- [ ] Proper spacing and sizing
- [ ] shadcn/ui Skeleton component used
- [ ] Accessible (no interactive elements)

---

### Group 9: Admin UI - Hero Slides

**Goal**: Create complete admin interface for hero slides management

**Design Guidelines**: 
- Use shadcn/ui components installed via MCP for consistency
- Apply `rouge-cardinal-frontend-skill.instructions.md` for production-grade design
- Implement theatrical-inspired layouts with Cardinal red accents
- Ensure admin interface maintains brand sophistication while remaining functional

#### File 1: Server Container

**Create** `components/features/admin/home/HeroSlidesContainer.tsx`:

```typescript
import { Suspense } from "react";
import { fetchAllHeroSlides } from "@/lib/dal/admin-home-hero";
import { HeroSlidesView } from "./HeroSlidesView";
import { HeroSlidesSkeleton } from "@/components/skeletons/HeroSlidesSkeleton";

async function HeroSlidesData() {
  const slides = await fetchAllHeroSlides();
  return <HeroSlidesView initialSlides={slides} />;
}

export function HeroSlidesContainer() {
  return (
    <Suspense fallback={<HeroSlidesSkeleton />}>
      <HeroSlidesData />
    </Suspense>
  );
}
```

#### File 2: Client View with Drag-Drop

**Create** `components/features/admin/home/HeroSlidesView.tsx`:

```typescript
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { HeroSlideForm } from "./HeroSlideForm";
import { HeroSlidePreview } from "./HeroSlidePreview";
import type { HeroSlideDTO } from "@/lib/schemas/home-content";

interface HeroSlidesViewProps {
  initialSlides: HeroSlideDTO[];
}

interface SortableSlideProps {
  slide: HeroSlideDTO;
  onEdit: (slide: HeroSlideDTO) => void;
  onDelete: (id: bigint) => void;
}

function SortableSlide({ slide, onEdit, onDelete }: SortableSlideProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3 flex-1">
          <button
            className="cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <HeroSlidePreview slide={slide} />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(slide)}
            aria-label="Edit slide"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(slide.id)}
            aria-label="Delete slide"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

export function HeroSlidesView({ initialSlides }: HeroSlidesViewProps) {
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideDTO | null>(null);
  const [isPending, setIsPending] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = slides.findIndex((s) => s.id.toString() === active.id);
      const newIndex = slides.findIndex((s) => s.id.toString() === over.id);

      const reordered = arrayMove(slides, oldIndex, newIndex);
      setSlides(reordered);

      // Debounce reorder API call
      const orderData = reordered.map((slide, index) => ({
        id: slide.id,
        position: index,
      }));

      try {
        const response = await fetch("/api/admin/home/hero/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error("Failed to reorder slides");
        }

        toast.success("Slides reordered successfully");
        router.refresh();
      } catch (error) {
        toast.error("Failed to reorder slides");
        setSlides(initialSlides); // Rollback
      }
    },
    [slides, initialSlides, router]
  );

  const handleEdit = useCallback((slide: HeroSlideDTO) => {
    setEditingSlide(slide);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: bigint) => {
      if (!confirm("Delete this hero slide?")) return;

      setIsPending(true);
      try {
        const response = await fetch(`/api/admin/home/hero/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete slide");
        }

        toast.success("Slide deleted successfully");
        router.refresh();
      } catch (error) {
        toast.error("Failed to delete slide");
      } finally {
        setIsPending(false);
      }
    },
    [router]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingSlide(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setEditingSlide(null);
    router.refresh();
  }, [router]);

  const activeSlides = slides.filter((s) => s.active);
  const canAddMore = activeSlides.length < 10;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hero Slides</h2>
        <Button
          onClick={() => setIsFormOpen(true)}
          disabled={!canAddMore || isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Slide {!canAddMore && "(Max 10)"}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={slides.map((s) => s.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-4">
            {slides.map((slide) => (
              <SortableSlide
                key={slide.id.toString()}
                slide={slide}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {slides.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No hero slides yet. Create your first slide!
          </CardContent>
        </Card>
      )}

      <HeroSlideForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        slide={editingSlide}
      />
    </div>
  );
}
```

#### File 3: Slide Form Dialog

**Create** `components/features/admin/home/HeroSlideForm.tsx`:

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MediaPickerDialog } from "@/components/features/admin/media/MediaPickerDialog";
import { HeroSlideInputSchema, type HeroSlideInput, type HeroSlideDTO } from "@/lib/schemas/home-content";

interface HeroSlideFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slide?: HeroSlideDTO | null;
}

export function HeroSlideForm({ open, onClose, onSuccess, slide }: HeroSlideFormProps) {
  const router = useRouter();
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<HeroSlideInput>({
    resolver: zodResolver(HeroSlideInputSchema),
    defaultValues: slide
      ? {
          title: slide.title,
          subtitle: slide.subtitle || "",
          description: slide.description || "",
          image_url: slide.image_url || "",
          image_media_id: slide.image_media_id || undefined,
          cta_label: slide.cta_label || "",
          cta_url: slide.cta_url || "",
          alt_text: slide.alt_text,
          active: slide.active,
        }
      : {
          title: "",
          subtitle: "",
          description: "",
          image_url: "",
          cta_label: "",
          cta_url: "",
          alt_text: "",
          active: true,
        },
  });

  const onSubmit = async (data: HeroSlideInput) => {
    setIsPending(true);

    try {
      const url = slide
        ? `/api/admin/home/hero/${slide.id}`
        : "/api/admin/home/hero";
      const method = slide ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save slide");
      }

      toast.success(slide ? "Slide updated" : "Slide created");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save slide");
    } finally {
      setIsPending(false);
    }
  };

  const handleMediaSelect = (media: { id: bigint; url: string }) => {
    form.setValue("image_media_id", media.id);
    form.setValue("image_url", media.url);
    setIsMediaPickerOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{slide ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={80} placeholder="Main headline" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={150} placeholder="Supporting text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} maxLength={500} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Image *</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMediaPickerOpen(true)}
                  >
                    Select from Media Library
                  </Button>
                  {form.watch("image_url") && (
                    <img
                      src={form.watch("image_url") || ""}
                      alt="Preview"
                      className="h-20 w-32 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="alt_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Text * (Accessibility)</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={125} placeholder="Describe the image" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cta_label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA Label</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={50} placeholder="Learn More" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cta_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA URL</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Display this slide on the homepage
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : slide ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <MediaPickerDialog
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </>
  );
}
```

#### File 4: Slide Preview Component

**Create** `components/features/admin/home/HeroSlidePreview.tsx`:

```typescript
import type { HeroSlideDTO } from "@/lib/schemas/home-content";
import { Badge } from "@/components/ui/badge";

interface HeroSlidePreviewProps {
  slide: HeroSlideDTO;
}

export function HeroSlidePreview({ slide }: HeroSlidePreviewProps) {
  return (
    <div className="flex items-center gap-4 flex-1">
      {slide.image_url && (
        <img
          src={slide.image_url}
          alt={slide.alt_text}
          className="h-16 w-24 object-cover rounded"
        />
      )}
      
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{slide.title}</h3>
          {!slide.active && <Badge variant="secondary">Inactive</Badge>}
        </div>
        
        {slide.subtitle && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {slide.subtitle}
          </p>
        )}
        
        {slide.cta_label && (
          <p className="text-xs text-muted-foreground">
            CTA: {slide.cta_label}
          </p>
        )}
      </div>
    </div>
  );
}
```

#### File 5: Admin Page

**Create** `app/(admin)/admin/home/hero/page.tsx`:

```typescript
import { HeroSlidesContainer } from "@/components/features/admin/home/HeroSlidesContainer";

export const metadata = {
  title: "Hero Slides Management | Admin",
  description: "Manage homepage hero slides",
};

export default function HeroSlidesPage() {
  return (
    <div className="container mx-auto py-8">
      <HeroSlidesContainer />
    </div>
  );
}
```

**Validation Checkpoints**:
- [ ] Server Container uses Suspense with skeleton
- [ ] Client View implements DnD Kit correctly
- [ ] Drag handle has proper ARIA labels
- [ ] Form uses React Hook Form + Zod resolver
- [ ] Media picker integration working
- [ ] Character count validation enforced
- [ ] Toast notifications for all actions
- [ ] Optimistic UI updates with rollback
- [ ] Debounced reorder API calls
- [ ] Max 10 slides enforced in UI

---

### Group 10: Admin UI - About Section

**Goal**: Create single-record editor for about content

**Design Guidelines**:
- Use shadcn/ui components installed via MCP for consistency
- Apply `rouge-cardinal-frontend-skill.instructions.md` for production-grade design
- Implement sophisticated form layouts reflecting brand identity
- Ensure single-record editor maintains visual hierarchy and usability

#### File 1: Server Container

**Create** `components/features/admin/home/AboutContentContainer.tsx`:

```typescript
import { Suspense } from "react";
import { fetchActiveAboutContent } from "@/lib/dal/admin-home-about";
import { AboutContentForm } from "./AboutContentForm";
import { AboutContentSkeleton } from "@/components/skeletons/AboutContentSkeleton";

async function AboutContentData() {
  const content = await fetchActiveAboutContent();
  
  if (!content) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No about content found. Please create one.
      </div>
    );
  }
  
  return <AboutContentForm content={content} />;
}

export function AboutContentContainer() {
  return (
    <Suspense fallback={<AboutContentSkeleton />}>
      <AboutContentData />
    </Suspense>
  );
}
```

#### File 2: Content Form

**Create** `components/features/admin/home/AboutContentForm.tsx`:

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MediaPickerDialog } from "@/components/features/admin/media/MediaPickerDialog";
import { AboutContentInputSchema, type AboutContentInput, type AboutContentDTO } from "@/lib/schemas/home-content";

interface AboutContentFormProps {
  content: AboutContentDTO;
}

export function AboutContentForm({ content }: AboutContentFormProps) {
  const router = useRouter();
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<AboutContentInput>({
    resolver: zodResolver(AboutContentInputSchema),
    defaultValues: {
      title: content.title,
      intro1: content.intro1,
      intro2: content.intro2,
      mission_title: content.mission_title,
      mission_text: content.mission_text,
      image_url: content.image_url || "",
      image_media_id: content.image_media_id || undefined,
      alt_text: content.alt_text || "",
    },
  });

  const onSubmit = async (data: AboutContentInput) => {
    setIsPending(true);

    try {
      const response = await fetch(`/api/admin/home/about/${content.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update content");
      }

      toast.success("About content updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update content");
    } finally {
      setIsPending(false);
    }
  };

  const handleMediaSelect = (media: { id: bigint; url: string }) => {
    form.setValue("image_media_id", media.id);
    form.setValue("image_url", media.url);
    setIsMediaPickerOpen(false);
  };

  const watchIntro1 = form.watch("intro1");
  const watchIntro2 = form.watch("intro2");
  const watchMissionText = form.watch("mission_text");

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">About Section Content</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit About Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Title *</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={80} placeholder="About Rouge Cardinal" />
                      </FormControl>
                      <FormDescription>
                        {field.value.length}/80 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="intro1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Introduction Paragraph 1 *</FormLabel>
                      <FormControl>
                        <Textarea {...field} maxLength={1000} rows={4} />
                      </FormControl>
                      <FormDescription>
                        {watchIntro1.length}/1000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="intro2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Introduction Paragraph 2 *</FormLabel>
                      <FormControl>
                        <Textarea {...field} maxLength={1000} rows={4} />
                      </FormControl>
                      <FormDescription>
                        {watchIntro2.length}/1000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission Section Title *</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={80} placeholder="Our Mission" />
                      </FormControl>
                      <FormDescription>
                        {field.value.length}/80 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission Text *</FormLabel>
                      <FormControl>
                        <Textarea {...field} maxLength={4000} rows={8} />
                      </FormControl>
                      <FormDescription>
                        {watchMissionText.length}/4000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Section Image</FormLabel>
                  <div className="flex gap-4">
                    {form.watch("image_url") && (
                      <img
                        src={form.watch("image_url") || ""}
                        alt="Preview"
                        className="h-32 w-48 object-cover rounded"
                      />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsMediaPickerOpen(true)}
                    >
                      Select Image
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="alt_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Alt Text (Accessibility)</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={125} placeholder="Describe the image" />
                      </FormControl>
                      <FormDescription>
                        {(field.value || "").length}/125 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <MediaPickerDialog
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </>
  );
}
```

#### File 3: Admin Page

**Create** `app/(admin)/admin/home/about/page.tsx`:

```typescript
import { AboutContentContainer } from "@/components/features/admin/home/AboutContentContainer";

export const metadata = {
  title: "About Section Management | Admin",
  description: "Manage about section content",
};

export default function AboutContentPage() {
  return (
    <div className="container mx-auto py-8">
      <AboutContentContainer />
    </div>
  );
}
```

**Validation Checkpoints**:
- [ ] Server Container uses Suspense
- [ ] Form uses React Hook Form + Zod
- [ ] Character counters for all text fields
- [ ] Real-time character count updates
- [ ] Media picker integration
- [ ] Toast notifications for success/error
- [ ] Form validation before submit
- [ ] Single record pattern enforced

---

### Group 11: Sidebar Navigation Updates

**Goal**: Add homepage management menu items to admin sidebar

**Update** `components/layout/AppSidebar.tsx` (or relevant sidebar component):

```typescript
// Add to sidebar menu items array
{
  title: "Homepage",
  icon: Home,
  items: [
    {
      title: "Hero Slides",
      url: "/admin/home/hero",
      icon: Image,
    },
    {
      title: "About Section",
      url: "/admin/home/about",
      icon: FileText,
    },
  ],
},
```

**Validation Checkpoints**:
- [ ] Menu items added under "Homepage" section
- [ ] Proper icons imported (Home, Image, FileText)
- [ ] URLs match route structure
- [ ] Active state highlighting works
- [ ] Menu items visible to admin users only

---

### Group 12: Error Boundaries & Rate Limiting

**Goal**: Add error handling and performance optimization

#### Debounce Hook for Reorder

**Create** `lib/hooks/use-debounce.ts`:

```typescript
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### Error Boundary Component

**Create** `components/features/admin/home/HeroSlidesErrorBoundary.tsx`:

```typescript
"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class HeroSlidesErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[HeroSlides] Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Something went wrong</h3>
                <p className="text-sm text-muted-foreground">
                  {this.state.error?.message || "Failed to load hero slides"}
                </p>
              </div>
              <Button onClick={() => window.location.reload()}>Reload Page</Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

**Validation Checkpoints**:
- [ ] Debounce hook created for reorder operations
- [ ] Error boundary catches runtime errors
- [ ] User-friendly error messages
- [ ] Reload button provided
- [ ] Errors logged to console

---

### Group 13: Testing & Validation

**Goal**: Create comprehensive test suite

#### API Integration Test Script

**Create** `scripts/test-home-hero-api.ts`:

```typescript
import "dotenv/config";

const API_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000";
const ADMIN_TOKEN = process.env.ADMIN_TEST_TOKEN; // Set in .env.local

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function testFetchAllSlides() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/home/hero`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    results.push({
      name: "Fetch all hero slides",
      passed: Array.isArray(data.slides),
    });
  } catch (error) {
    results.push({
      name: "Fetch all hero slides",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function testCreateSlide() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/home/hero`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Slide",
        subtitle: "Test subtitle",
        image_url: "https://example.com/image.jpg",
        alt_text: "Test image",
        active: false,
      }),
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    results.push({
      name: "Create hero slide",
      passed: !!data.slide?.id,
    });
    
    return data.slide?.id;
  } catch (error) {
    results.push({
      name: "Create hero slide",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function testDeleteSlide(id: string) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/home/hero/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    results.push({
      name: "Delete hero slide",
      passed: true,
    });
  } catch (error) {
    results.push({
      name: "Delete hero slide",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function runTests() {
  console.log("🧪 Running Hero Slides API Tests...\n");
  
  await testFetchAllSlides();
  const createdId = await testCreateSlide();
  
  if (createdId) {
    await testDeleteSlide(createdId);
  }
  
  console.log("\n📊 Test Results:");
  console.log("═".repeat(50));
  
  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  
  console.log("═".repeat(50));
  console.log(`\n${passed}/${total} tests passed`);
  
  process.exit(passed === total ? 0 : 1);
}

runTests();
```

**Add to package.json**:

```json
{
  "scripts": {
    "test:hero-api": "tsx scripts/test-home-hero-api.ts"
  }
}
```

#### Manual Testing Checklist

**Hero Slides**:
- [ ] Create new slide with all fields
- [ ] Create slide with only required fields
- [ ] Upload image from media library
- [ ] Edit existing slide
- [ ] Drag-drop reorder slides
- [ ] Delete slide (soft delete)
- [ ] Verify max 10 active slides enforced
- [ ] Test form validation (empty title, invalid URL)
- [ ] Test character limits on all fields
- [ ] Verify revalidation after mutations

**About Section**:
- [ ] Edit all text fields
- [ ] Test character counters
- [ ] Upload section image
- [ ] Save changes
- [ ] Verify revalidation

**Browser Testing**:
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Mobile Chrome (responsive)
- [ ] Mobile Safari (responsive)
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader compatibility

**Validation Checkpoints**:
- [ ] Test script created and executable
- [ ] Manual testing checklist completed
- [ ] Cross-browser testing performed
- [ ] Accessibility validated

---

### Group 14: Future Improvements

**Goal**: Document planned enhancements

#### Planned Features

**Audit Logging**:
```typescript
// Future: Track all homepage content changes
interface AuditLog {
  id: bigint;
  table_name: string;
  record_id: bigint;
  action: "create" | "update" | "delete" | "reorder";
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  user_id: string;
  timestamp: string;
}
```

**Content Versioning**:
```typescript
// Future: Version history for rollback capability
interface ContentVersion {
  id: bigint;
  content_type: "hero_slide" | "about_content";
  content_id: bigint;
  version: number;
  data: Record<string, unknown>;
  created_by: string;
  created_at: string;
}
```

**Advanced Features**:
- [ ] Scheduled publishing (publish_at, unpublish_at)
- [ ] A/B testing for hero slides (split traffic)
- [ ] Analytics integration (click tracking, view counts)
- [ ] Multi-language support (i18n)
- [ ] Image optimization (WebP conversion, responsive sizes)
- [ ] Video background support for hero slides
- [ ] Animation presets for hero transitions
- [ ] Content preview before publish
- [ ] Keyboard shortcuts for power users
- [ ] Bulk operations (delete multiple, reorder with drag-select)

**Performance Optimizations**:
- [ ] Implement optimistic UI updates
- [ ] Add infinite scroll for large slide lists
- [ ] Cache frequently accessed content
- [ ] Implement service worker for offline editing
- [ ] Add request deduplication

**Mobile Responsive Improvements**:
- [ ] Touch-friendly drag handles
- [ ] Swipe gestures for reorder
- [ ] Mobile-optimized form layouts
- [ ] Progressive image loading

**Validation Checkpoints**:
- [ ] Future features documented
- [ ] Technical feasibility assessed
- [ ] Priority assigned to each feature
- [ ] Implementation estimates provided

---

## Implementation Notes

- **Pattern Consistency**: Follow TASK021 Spectacles CRUD patterns
- **Component Library**: Use shadcn/ui components per `shadcn-mcp.instructions.md` (MCP-assisted installation)
- **Design Excellence**: Apply `rouge-cardinal-frontend-skill.instructions.md` for all views and UI components
  - Theatrical aesthetic over generic AI-generated interfaces
  - Deliberate design choices reflecting brand identity
  - Cardinal red accents, elegant typography, sophisticated layouts
- **Security**: All DAL functions require admin auth, all API routes use `withAdminAuth()`
- **Validation**: Zod schemas at API boundaries, TypeScript strict mode
- **Performance**: Optimistic UI updates with revalidation, debounce on reorder (300ms)
- **Accessibility**: Alt text required for all images, keyboard navigation for drag-drop
- **Error Handling**: Structured error codes for debugging, toast notifications for user feedback
- **Testing**: Comprehensive test coverage (unit, integration, E2E)
- **Documentation**: Inline JSDoc comments, README updates, architecture diagrams

---

## Related Documentation

- Next.js 15 API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Supabase RPC: https://supabase.com/docs/reference/javascript/rpc
- React Hook Form: https://react-hook-form.com/docs/useform
- Zod Validation: https://zod.dev/?id=strings
- DnD Kit: https://docs.dndkit.com/introduction/getting-started
- shadcn/ui: https://ui.shadcn.com/docs
- React Email: https://react.email/docs/introduction

---

**Status**: Implementation guide complete (Groups 1-14)
**Next**: Begin implementation following group order
**Estimated Time**: 12-16 hours (all groups)
**Priority**: High (core homepage content management)
