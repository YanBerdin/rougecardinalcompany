---
applyTo: "**"
---

# GitHub Copilot Instructions - Rouge Cardinal Company

## Project Overview

A **theater company website** built with **Next.js 16 + TypeScript + Supabase + Tailwind/shadcn/ui**.

**Key Architecture**: Multi-layout routes with `(admin)` and `(marketing)` zones, server-first with optimized Supabase auth, comprehensive RLS security, feature-based organization, T3 Env for type-safe environment variables, and complete Media Library with Storage/Folders sync.

## Critical Architectural Knowledge

### 1. Route Groups & Layouts (November 2025 Migration)

```bash
app/
  layout.tsx              # Root: HTML shell + ThemeProvider
  (admin)/
    layout.tsx           # Admin: AppSidebar + auth protection
    admin/
      debug-auth/page.tsx # Diagnostic tools (auth & RLS testing)
      team/page.tsx       # CRUD interfaces
  (marketing)/
    layout.tsx           # Public: Header + Footer
    page.tsx             # Homepage
```

**BREAKING CHANGE**: Old flat structure migrated to route groups. Always check imports/middleware matchers when modifying routes.

### 2. Data Access Layer (DAL) - The Security Boundary

**Pattern**: All data access goes through `lib/dal/*.ts` modules marked `"use server"` and `import "server-only"`

```typescript
// lib/dal/team.ts
"use server";
import "server-only";
import { createClient } from "@/supabase/server";

export async function fetchTeamMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membres_equipe")
    .select("id, name, role, active")
    .eq("active", true);

  if (error) throw error;
  return data ?? [];
}
```

**Critical Rules**:

- NEVER import DAL in Client Components
- ALL mutations revalidate via Server Actions (not in DAL)
- Use Zod validation in both DAL inputs and Server Action inputs
- Return `DALResult<T>` from DAL, minimal DTOs not full database rows
- DAL helpers centralized in `lib/dal/helpers/`

### 3. Smart/Dumb Component Pattern

**Smart Components (Containers)**: Handle data, business logic, side effects

```typescript
// Server Smart Component (default choice)
export async function TeamContainer() {
  const teamMembers = await fetchTeamMembers(); // DAL call
  return <TeamList members={teamMembers} />;
}

// Client Smart Component (when interactivity needed)
'use client'
export function InteractiveTeamContainer() {
  const [members, setMembers] = useState([]);
  // ... state management, event handlers
  return <TeamEditor members={members} onSave={handleSave} />;
}
```

**Dumb Components**: Pure presentation, no data fetching or business logic

```typescript
interface TeamListProps {
  members: TeamMember[];
  onEdit?: (member: TeamMember) => void;
}

export function TeamList({ members, onEdit }: TeamListProps) {
  return (
    <div className="grid gap-4">
      {members.map(member => (
        <TeamCard key={member.id} member={member} onEdit={onEdit} />
      ))}
    </div>
  );
}
```

### 4. Supabase Auth Optimization (CANONICAL)

**Reference**: `.github/instructions/nextjs-supabase-auth-2025.instructions.md` for complete rules

**Key Patterns**:

```typescript
// Fast auth check (~2-5ms vs ~300ms)
const claims = await supabase.auth.getClaims();
if (!claims) redirect('/auth/login');

// Full user data only when needed
const { data: { user } } = await supabase.auth.getUser();

// Cookies: ONLY use getAll/setAll pattern
{
  cookies: {
    getAll() { return cookieStore.getAll() },
    setAll(cookiesToSet) { /* implementation */ }
  }
}
```

### 5. Server Actions Architecture

### note de sécurité : vues admin et rls

- récent : des migrations de hotfix ont été appliquées pour corriger une exposition d'une vue admin (`communiques_presse_dashboard`).
- règle importante : ne jamais accorder `select` globalement au rôle `authenticated` pour des vues ou tables contenant des données admin. Préférez :
  - ajouter un garde explicite dans la définition de la vue, par exemple `where (select public.is_admin()) = true`, et
  - créer une migration `revoke select on <view> from authenticated;` si nécessaire.
- lors d'un push de migration, si vous rencontrez un mismatch d'historique, réparez l'historique distant et exécutez `supabase db pull` avant de re-pusher les fichiers locaux.


**Pattern**: Validation + Auth + DAL + Revalidation

```typescript
// app/admin/team/actions.ts
"use server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { upsertTeamMember } from "@/lib/dal/team";
import { revalidatePath } from "next/cache";

const TeamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
});

export async function createTeamMember(input: unknown) {
  try {
    await requireAdmin(); // Explicit auth check
    const validated = TeamMemberSchema.parse(input);
    const result = await upsertTeamMember(validated);
    revalidatePath("/admin/team");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Essential Workflows

### Development Commands

```bash
# Development
pnpm dev                    # Start dev server with turbopack

# Quality Gates
pnpm lint                   # ESLint check
pnpm lint:md                # Markdown lint
pnpm build                  # Production build test

# Email Testing
pnpm test:resend           # Test email integration

# Admin Scripts
pnpm exec tsx scripts/test-admin-access.ts    # Security validation
pnpm exec tsx scripts/check-email-logs.ts     # Email audit
pnpm test:partners                             # Partners DAL validation (6 tests)
```

### Debugging Workflows

**Auth/RLS Issues**: Visit `/admin/debug-auth` (requires admin login)

- Tests cookies, user auth, database access permissions
- Validates RLS policies on public/admin tables
- Shows detailed error messages for troubleshooting

**Database Security**: Run `scripts/test-admin-access.ts`

- Verifies anon users are properly blocked from admin data
- Tests is_admin() function
- Validates service key access

## Project-Specific Conventions

### File Organization

```bash
components/
  features/
    admin/team/           # Feature: team management
      TeamContainer.tsx   # Smart component
      TeamList.tsx        # Dumb component
      TeamCard.tsx        # Dumb component
      types.ts           # Feature types + props interfaces
    public-site/home/     # Feature: homepage
      HeroContainer.tsx   # Smart component
      Hero.tsx           # Dumb component
  ui/                     # shadcn/ui components
    button.tsx
    card.tsx
    sidebar.tsx

lib/
  dal/                    # Server-only data access (31 modules + 5 helpers)
    helpers/              # Centralized DAL utilities
      error.ts           # DALResult<T> type + toDALResult()
      format.ts          # Formatting helpers
      slug.ts            # Slug generation
      index.ts           # Barrel exports
    team.ts
    home.ts
  schemas/               # Zod schemas (15+ modules)
    team.ts              # Server + UI schemas
    media.ts             # Media validation
    index.ts             # Barrel exports
  hooks/                  # Client-side hooks
    use-newsletter-subscribe.ts

app/(admin)/admin/
  team/
    page.tsx             # Server Component
    actions.ts           # Server Actions (colocated)
```

### DAL SOLID Pattern (Nov 2025)

**ALL 31+ DAL modules follow this pattern** (92% SOLID compliance):

```typescript
// lib/dal/helpers/error.ts
export type DALResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Usage in DAL modules
export async function createTeamMember(
  input: TeamMemberInput
): Promise<DALResult<TeamMemberDTO>> {
  await requireAdmin();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("membres_equipe")
    .insert(input)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
```

**Critical Rules**:

- ✅ DAL returns `DALResult<T>` — NEVER throws
- ✅ `revalidatePath()` in Server Actions ONLY — NEVER in DAL
- ✅ Email imports in email service ONLY — NEVER in DAL
- ✅ Props colocated with components in `types.ts`
- ✅ Server Actions colocated at `app/(admin)/admin/<feature>/actions.ts`

### Media Library Pattern (TASK029 - Complete)

**Architecture**: Complete media management system with Storage/Folders synchronization.

**Database Tables**:
- `media` — Main media records with metadata
- `media_tags` — Tag management (junction table)
- `media_folders` — 9 base folders hierarchy

**DAL Modules**:
```bash
lib/dal/
  media.ts           # CRUD for media records
  media-tags.ts      # Tag operations
  media-folders.ts   # Folder management
  media-usage.ts     # Usage tracking across entities
```

**Storage/Folders Sync Pattern**:
```typescript
// lib/dal/helpers/folder.ts
export async function getFolderIdFromPath(
  supabase: SupabaseClient,
  storagePath: string
): Promise<bigint | null> {
  const folderName = storagePath.split('/')[0];
  const { data } = await supabase
    .from('media_folders')
    .select('id')
    .eq('name', folderName)
    .single();
  return data?.id ?? null;
}
```

**9 Base Folders** (auto-assigned via `folder_id`):
| Folder | Description |
| ------ | ----------- |
| spectacles | Spectacle visuals |
| team | Team photos |
| press | Press images |
| gallery | General gallery |
| hero | Homepage hero |
| about | About section |
| partners | Partner logos |
| documents | PDFs and documents |
| misc | Miscellaneous |

**Thumbnail Generation** (Sharp):
```typescript
// Thumbnails: 300x300 JPEG, stored in media.thumbnail_url
import sharp from 'sharp';
const thumbnail = await sharp(buffer)
  .resize(300, 300, { fit: 'cover' })
  .jpeg({ quality: 80 })
  .toBuffer();
```

### Upload Security Hardening (Feb 2026)

**Architecture**: Server-side validation pipeline with magic bytes verification, filename sanitization, and 7-format support.

**Supported Formats** (7):
| Format | MIME Type | Magic Bytes |
| ------ | --------- | ----------- |
| JPEG | image/jpeg | `FF D8 FF` |
| PNG | image/png | `89 50 4E 47` |
| WebP | image/webp | `52 49 46 46...57 45 42 50` |
| AVIF | image/avif | `...66 74 79 70 61 76 69 66` |
| GIF | image/gif | `47 49 46 38` |
| SVG | image/svg+xml | `3C 73 76 67` or `3C 3F 78 6D 6C` |
| PDF | application/pdf | `25 50 44 46` |

**Validation Pipeline**:
```typescript
// lib/utils/mime-verify.ts
export async function verifyFileMime(file: File): Promise<AllowedUploadMimeType | null>

// lib/actions/media-actions.ts — validateFile()
// 1. Size check: MAX_FILE_SIZE = 10 * 1024 * 1024 (10MB)
// 2. Magic bytes verification via verifyFileMime()
// 3. Filename sanitization via sanitizeFilename()
```

**Key Files**:
- `lib/utils/mime-verify.ts` — Magic bytes verification (64 octets, 7 formats)
- `lib/schemas/media.ts` — `AllowedUploadMimeType`, `ALLOWED_UPLOAD_MIME_TYPES`, `isAllowedUploadMimeType()`
- `lib/dal/media.ts` — `sanitizeFilename()` (path traversal + special chars + 100 chars max)

**Critical Rules**:
- ✅ NEVER trust `file.type` (client-controlled) — always verify magic bytes server-side
- ✅ ALWAYS sanitize filenames before storage (prevent path traversal)
- ✅ Max 10MB aligned with Supabase Storage bucket configuration
- ✅ SVG treated as text (XML parse check), not binary magic bytes only

### BigInt Three-Layer Serialization Pattern (Jan 2026)

**Architecture**: Three-layer type system for handling PostgreSQL `bigint` IDs across React boundaries without serialization errors.

```bash
┌─────────────────────────────────────────────────────┐
│  UI Layer (Client)                                  │
│  └─ number IDs (FeatureFormSchema)                  │
│                     ↓                               │
│  Transport Layer (Server Actions)                   │
│  └─ string IDs (FeatureDataTransport)               │
│                     ↓                               │
│  DAL Layer (Server-Only)                            │
│  └─ bigint IDs (FeatureInputSchema)                 │
└─────────────────────────────────────────────────────┘
```

**Critical Rules**:
- ✅ **UI Schema**: `z.number().int().positive()` for form IDs
- ✅ **Transport**: `string` IDs in Server Actions (avoid BigInt serialization error)
- ✅ **Server Schema**: `z.coerce.bigint()` for database IDs
- ✅ **ActionResult**: Return `{ success: true/false }` ONLY, NEVER return data containing BigInt
- ✅ **Data Refresh**: Use `router.refresh()` to fetch updated data via Server Component
- ✅ **Manual Conversion**: `BigInt(stringId)` in Server Action before DAL call

### Sentry Error Monitoring Pattern (Jan 2026)

**Architecture**: Multi-runtime error monitoring with 3-level error boundaries.

**Configuration**: 4 runtime configs (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`)

**Error Boundary Hierarchy**:
1. **Root** (`app/global-error.tsx`) — Catches unhandled app-level errors
2. **Page** (`app/error.tsx`) — Catches route-level errors
3. **Component** (`components/error-boundaries/`) — Reusable granular boundaries

**Alert Levels**:
| Alert | Condition | Response Time |
| ----- | --------- | ------------- |
| P0 | >10 errors/min | 15 min |
| P1 | >50 errors/hour | 1 hour |

**Key Rules**:
- ✅ Sentry DSN configured via T3 Env (never hardcoded)
- ✅ Supabase integration with span deduplication
- ✅ Source maps upload via `next.config.ts`
- ✅ `@sentry/nextjs 10` multi-runtime

### React `cache()` Deduplication Pattern

**Architecture**: Use React `cache()` on all DAL read functions to deduplicate intra-request database calls.

```typescript
import { cache } from "react";

export const fetchTeamMembers = cache(async (): Promise<DALResult<TeamMemberDTO[]>> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membres_equipe")
    .select("id, name, role, active")
    .eq("active", true);

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
});
```

**Critical Rules**:
- ✅ Wrap ALL DAL read functions with `cache()` for request-level deduplication
- ✅ Multiple Server Components calling the same DAL function → single DB query
- ✅ `cache()` scope is per-request (automatically invalidated between requests)

### Display Toggles Pattern (TASK030 - Complete)

**Architecture**: Centralized configuration system for controlling visibility of UI sections across public pages.

**Database Table**: `public.configurations_site`
```sql
create table public.configurations_site (
  id bigint generated always as identity primary key,
  key text unique not null,
  value jsonb not null,  -- { "enabled": boolean, "max_items": number | null }
  description text,
  category text,         -- e.g., "home_display", "presse_display"
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**RLS Policies**:
- Public: Read-only access to all toggles
- Admin: Full CRUD access via `is_admin()` check

**10 Display Toggles by Category**:

| Category | Toggles | Description |
| -------- | ------- | ----------- |
| `home_display` | hero, about, spectacles, a_la_une, partners, newsletter | Homepage sections (6 toggles) |
| `agenda_display` | newsletter | Agenda newsletter inline form (1 toggle) |
| `contact_display` | newsletter | Contact newsletter card (1 toggle) |
| `presse_display` | media_kit, presse_articles | Media Kit + Press Releases sections (2 toggles) |

**DAL Pattern** (`lib/dal/site-config.ts`):
```typescript
export async function fetchDisplayToggle(
  key: string
): Promise<DALResult<DisplayToggleDTO | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("configurations_site")
    .select("key, value, description, category")
    .eq("key", key)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, data: null }; // Not found
    }
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
```

**Server Component Usage**:
```typescript
// components/features/public-site/presse/PresseServerGate.tsx
const mediaKitToggle = await fetchDisplayToggle("display_toggle_media_kit");
const pressReleasesToggle = await fetchDisplayToggle("display_toggle_presse_articles");

const showMediaKit = mediaKitToggle.success && 
  mediaKitToggle.data?.value?.enabled !== false;

const showPressReleases = pressReleasesToggle.success && 
  pressReleasesToggle.data?.value?.enabled !== false;

// Conditional data fetching
const [pressReleasesResult, mediaKitResult] = await Promise.all([
  showPressReleases ? fetchPressReleases() : Promise.resolve({ success: true, data: [] }),
  showMediaKit ? fetchMediaKit() : Promise.resolve({ success: true, data: [] }),
]);
```

**View Component Conditional Rendering**:
```typescript
// components/features/public-site/presse/PresseView.tsx
{pressReleases.length > 0 && (
  <section>
    <h2>Communiqués de Presse</h2>
    {/* content */}
  </section>
)}

{mediaKit.length > 0 && (
  <section>
    <h2>Kit Média</h2>
    {/* content */}
  </section>
)}
```

**Admin Management**:
- Route: `/admin/site-config`
- UI: Toggle switches with Server Actions
- Real-time updates: `revalidatePath()` after mutations
- Organized by section: Home, Presse, Agenda, Contact

**Utility Scripts** (Presse toggles):
```bash
# Check toggle status
pnpm exec tsx scripts/check-presse-toggles.ts

# Enable/disable for testing
pnpm exec tsx scripts/toggle-presse.ts enable-all
pnpm exec tsx scripts/toggle-presse.ts disable-all
pnpm exec tsx scripts/toggle-presse.ts enable-media-kit
pnpm exec tsx scripts/toggle-presse.ts enable-press-releases
```

**Key Migrations**:
1. `20260101160100_seed_display_toggles.sql` — Initial 9 toggles
2. `20260101170000_cleanup_and_add_epic_toggles.sql` — Epic alignment
3. `20260101220000_fix_presse_toggles.sql` — Split Media Kit + Press Releases (Phase 11)

**Critical Rules**:
- ✅ Toggles control BOTH data fetching AND rendering
- ✅ Default to `enabled: true` when toggle not found
- ✅ Hide entire sections (including titles) when disabled
- ✅ Use conditional Promise.all to avoid fetching disabled data
- ✅ Separate toggles for independent features (Media Kit ≠ Press Releases)

### Schemas Pattern (Server vs UI)

```typescript
// lib/schemas/team.ts

// Server schema (bigint for database IDs)
export const TeamMemberInputSchema = z.object({
  id: z.coerce.bigint(),
  name: z.string().min(1),
});

// UI schema (number for form handling)
export const TeamMemberFormSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});

export type TeamMemberInput = z.infer<typeof TeamMemberInputSchema>;
export type TeamMemberFormValues = z.infer<typeof TeamMemberFormSchema>;
```

### Security Rules (36/36 tables have RLS)

- ALL tables use Row Level Security
- Public tables: `published_at IS NOT NULL` OR `active = true` (read-only)
- Admin tables: `(select public.is_admin())` for all operations
- SECURITY INVOKER views require GRANT permissions on base tables
- **GRANT + RLS Combined Model**: Never consider RLS as substitute for GRANT. Always set explicit GRANT then RLS as defense-in-depth.
- **Recent RLS fixes (Dec 31, 2025)**:
  - `membres_equipe`: Public access limited to `active = true` rows only
  - `compagnie_presentation_sections`: Public access limited to `active = true` rows only
  - All 11 public views enforced with SECURITY INVOKER via migration 20251231020000
  - 7 admin views (*_admin) access revoked from anon role
  - Complete security test suite: 13/13 PASSED
- **Admin Views Security Hardening (TASK037, Jan 2026)**:
  - Dedicated `admin_views_owner` role owns all 7 admin views
  - `REVOKE SELECT` from `authenticated` and `anon` on admin views
  - Admin-only access enforced via `WHERE (select public.is_admin()) = true` inside view definitions
  - Pattern: views grant NO direct access, RLS on base tables + `is_admin()` guard in view SQL
  - Reference: `doc/ADMIN-VIEWS-SECURITY-HARDENING-SUMMARY.md`

### Type Safety Pattern

```typescript
import { z } from "zod";

// Runtime validation + TypeScript types
const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  role: z.string().min(1),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

// Use in DAL
export async function validateTeamMember(data: unknown): Promise<TeamMember> {
  return TeamMemberSchema.parse(data);
}
```

## Testing Patterns

### Integration Testing via Scripts

**Pattern**: Use standalone Node.js scripts for testing API endpoints and services:

```typescript
// scripts/test-email-integration.ts
import { sendNewsletterConfirmation } from "@/lib/email/actions";

async function testEmailService() {
  try {
    console.log("🧪 Testing newsletter confirmation...");
    const result = await sendNewsletterConfirmation("test@example.com");
    console.log("✅ Success:", result);
  } catch (error) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  }
}

testEmailService();
```

**Run with**: `pnpm exec tsx scripts/test-email-integration.ts`

### API Endpoint Testing

**Pattern**: Test endpoints by making HTTP requests to running dev server:

```typescript
// Test via fetch to localhost
const response = await fetch("http://localhost:3000/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(testData),
});

const result = await response.json();
expect(result.status).toBe("sent");
```

### Security Validation Testing

**Pattern**: Test different permission levels to validate RLS and auth guards:

```typescript
// scripts/test-admin-access.ts - Test anon vs admin access
async function testAnonAccess() {
  const anonClient = createAnonClient();
  const { data, error } = await anonClient.from("membres_equipe").select("*");

  // Should be blocked by RLS
  expect(error).toBeTruthy();
  console.log("✅ Anon properly blocked from admin table");
}
```

### Error State Testing

**Pattern**: Test error conditions with mock data and network failures:

```typescript
// Test invalid email format
const invalidEmail = "not-an-email";
const result = await subscribeToNewsletter(invalidEmail);
expect(result.error).toContain("Invalid email");

// Test network failure simulation
mockFetch.mockRejectOnce(new Error("Network failure"));
const result = await apiCall();
expect(result.success).toBe(false);
```

## Error Handling Patterns

### ActionResponse Pattern (Server Actions)

**Standard**: All Server Actions return consistent response type:

```typescript
type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number; details?: unknown };

export async function createTeamMember(
  input: CreateTeamMemberInput
): Promise<ActionResponse<TeamMember>> {
  try {
    // 1. Explicit auth check (defense in depth)
    await requireAdmin();

    // 2. Input validation with detailed error handling
    const validated = CreateTeamMemberInputSchema.parse(input);

    // 3. Database operation
    const result = await createTeamMemberDAL(validated);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        status: 422,
        details: error.issues,
      };
    }
    return { success: false, error: error.message, status: 500 };
  }
}
```

### API Route Error Handling

**Standard**: Consistent HTTP status codes and error structure:

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ContactSchema.parse(body);

    // Primary operation (never fail on email errors)
    const messageId = await createContactMessage(validated);

    // Secondary operation (graceful degradation)
    let emailSent = true;
    try {
      await sendContactNotification(validated);
    } catch (emailError) {
      console.error("[Contact] Email notification failed:", emailError);
      emailSent = false;
    }

    return NextResponse.json({
      status: "sent",
      message: "Message envoyé",
      ...(emailSent ? {} : { warning: "Notification email could not be sent" }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("[Contact API] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

### DAL Error Handling

**Standard**: Return `DALResult<T>`, NEVER throw errors:

```typescript
import { DALResult } from "@/lib/dal/helpers";

export async function fetchTeamMembers(): Promise<DALResult<TeamMemberDTO[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membres_equipe")
    .select("id, name, role, active")
    .eq("active", true);

  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, data: data ?? [] };
}
```

**Note**: L'ancien pattern `throw error` est déprécié. Utiliser `DALResult<T>` pour tous les modules DAL (voir section "DAL SOLID Pattern").

### Client Component Error Handling

**Pattern**: Error boundaries + user-friendly error states:

```typescript
// Error boundary for unexpected errors
if (error) {
  return (
    <div className="error-container" role="alert">
      <p>Error: {error.message}</p>
      <button onClick={actions.retry} className="retry-button">
        Retry
      </button>
    </div>
  );
}

// Toast notifications for action results
const handleSubmit = async (data: FormData) => {
  const result = await createTeamMemberAction(data);

  if (result.success) {
    toast.success('Member created successfully');
  } else {
    toast.error('Error', { description: result.error });
  }
};
```

### Graceful Degradation Pattern

**Critical**: Never fail primary operations due to secondary service failures:

```typescript
// ✅ CORRECT: Primary operation succeeds even if email fails
const contactId = await createContactMessage(data);
try {
  await sendEmail(data);
} catch (emailError) {
  console.error("Email failed:", emailError);
  // Don't throw - log and continue
}
return { success: true, id: contactId };

// ❌ WRONG: Email failure breaks entire operation
const contactId = await createContactMessage(data);
await sendEmail(data); // If this fails, entire operation fails
```

## Database & SQL Guidelines

### SQL Style Requirements

**Based on**: `.github/instructions/Postgres_SQL_Style_Guide.instructions.md`

```sql
-- ✅ ALWAYS use lowercase SQL keywords
create table membres_equipe (
  id bigint generated always as identity primary key,
  nom text not null,
  role text not null,
  photo_url text,
  order_index integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table membres_equipe is 'Membres de l''équipe théâtrale avec leur rôle et informations';

-- ✅ Use snake_case for tables/columns, plurals for tables, singular for columns
-- ✅ Always include table comments (up to 1024 characters)
-- ✅ Prefer `identity generated always` for IDs
-- ✅ Use ISO 8601 format for dates (timestamptz)
```

**Naming Conventions**:

- Tables: `snake_case` plurals (`membres_equipe`, `spectacles`)
- Columns: `snake_case` singular (`nom`, `photo_url`, `user_id`)
- Foreign keys: `{table_singular}_id` (e.g., `user_id` references `users`)
- Avoid prefixes like `tbl_`, use meaningful aliases with `as` keyword

**Query Formatting**:

```sql
-- Small queries: keep concise
select * from spectacles where active = true;

-- Large queries: format for readability
select
  s.titre,
  s.description,
  m.nom as auteur
from
  spectacles s
join
  membres_equipe m on s.auteur_id = m.id
where
  s.published_at is not null
and
  s.active = true
order by
  s.created_at desc;
```

### Next.js 16 Backend Requirements

**Based on**: `.github/instructions/nextjs15-backend-with-supabase.instructions.md`

```typescript
// ✅ ALWAYS await headers() and cookies() in Next.js 16
import { headers, cookies } from "next/headers";

export default async function ServerComponent() {
  const headersList = await headers();
  const cookieStore = await cookies();

  const userAgent = headersList.get("user-agent");
  const theme = cookieStore.get("theme");

  return <div data-theme={theme?.value}>Content</div>;
}

// ✅ API Routes: proper header/cookie handling
export async function GET(request: NextRequest) {
  const headersList = await headers();
  const authorization = headersList.get("authorization");

  return NextResponse.json({ data: results });
}

// ✅ Server Actions: secure cookie setting
export async function loginAction(formData: FormData) {
  const cookieStore = await cookies();

  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}
```

### Supabase Integration Rules

**Critical Performance Rules** (from canonical auth guide):

```typescript
// ✅ FAST: Use getClaims() for auth checks (~2-5ms)
const claims = await supabase.auth.getClaims();
if (!claims) redirect('/login');

// ✅ SLOW: Only use getUser() when you need full user data (~300ms)
const { data: { user } } = await supabase.auth.getUser();

// ✅ COOKIES: ONLY use getAll/setAll pattern (NEVER get/set/remove)
{
  cookies: {
    getAll() { return cookieStore.getAll() },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
    }
  }
}
```

## Next.js 16 & React 19 Best Practices

**Based on**: `.github/instructions/nextjs.instructions.md` + `.github/instructions/next-backend.instructions.md`

### Component Architecture Rules

```typescript
// ✅ Server Component (default) - for data fetching, SSR
export default async function TeamPage() {
  const teamMembers = await fetchTeamMembers(); // Direct DAL call
  return <TeamList members={teamMembers} />;
}

// ✅ Client Component - only for interactivity
'use client'
export function InteractiveTeamForm() {
  const [state, action, isPending] = useActionState(createTeamAction, null);
  return <form action={action}>{/* interactive form */}</form>;
}

'use client'
import { useActionState, startTransition } from 'react'
import { createPost } from '@/app/actions'
import { LoadingSpinner } from '@/app/ui/loading-spinner'
 
export function Button() {
  const [state, action, pending] = useActionState(createPost, false)
 
  return (
    <button onClick={() => startTransition(action)}>
      {pending ? <LoadingSpinner /> : 'Create Post'}
    </button>
  )
}

```

### Server Actions vs API Routes Decision Tree

1. **Mutations from same Next.js frontend** → **Server Action**
2. **Public APIs for external clients** → **API Route**
3. **Webhooks/OAuth callbacks** → **API Route**
4. **Initial page data fetching** → **Server Component**

### Critical 16 Rules

- **NEVER use `next/dynamic` with `{ ssr: false }` in Server Components**
- **ALWAYS await `headers()` and `cookies()` calls**
- **Use Route Groups** `(admin)`, `(marketing)` for layout organization
- **Server Actions must have `'use server'` directive** (lowercase)
- **Use `useActionState` not `startTransition`** for Server Actions

### App Router Structure

```bash
app/
  layout.tsx              # Root: HTML + providers
  (admin)/                # Route group - admin zone
    layout.tsx            # Admin layout + auth protection
    admin/
      team/page.tsx       # /admin/team
  (marketing)/            # Route group - public zone
    layout.tsx            # Public layout + header/footer
    page.tsx              # Homepage /
```

## TypeScript Strict Guidelines

**Based on**: `.github/instructions/2-typescript.instructions.md`

### Required TypeScript Patterns

```typescript
// ✅ ALWAYS: Explicit typing, never use any
interface TeamMemberProps {
  member: {
    id: string;
    name: string;
    role: string;
  };
  onEdit?: (member: TeamMember) => void; // Optional with explicit type
}

// ✅ Use interfaces for extensible objects
interface User {
  id: string;
  email: string;
}

// ✅ Use type for unions and primitives
type Status = "pending" | "completed" | "cancelled";
type ActionResponse<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };

// ✅ Prefer string literal unions over enums
type Role = "admin" | "user" | "guest";

// ✅ Generics with descriptive names (T prefix)
function fetchResource<TData>(endpoint: string): Promise<TData> {
  return fetch(endpoint).then((res) => res.json());
}

// ✅ Type guards for runtime checks (prefer over `as` assertions)
function isTeamMember(obj: unknown): obj is TeamMember {
  return typeof obj === "object" && obj !== null && "id" in obj;
}

function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return ALLOWED_TYPES.includes(mime as AllowedMimeType);
}
```

### Type Assertions Rules

```typescript
// ✅ Safe assertions
const config = { apiUrl: 'https://api.example.com' } as const;
type ButtonComponent = typeof Button as React.ComponentType;

// ❌ NEVER use unsafe assertions
const data = response as User; // Dangerous!
const file = formData.get('file') as File; // Use type guard instead

// ✅ Use type guards instead
const file = formData.get('file');
if (!(file instanceof File)) {
  throw new Error('Not a file');
}
// Now TypeScript knows file is File
```

### Environment Variables (T3 Env)

**CRITICAL**: Always use T3 Env for type-safe environment variable access.

```typescript
// ✅ ALWAYS use the env helper from lib/env.ts
import { env } from '@/lib/env';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const apiKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

// ❌ NEVER access process.env directly
const url = process.env.NEXT_PUBLIC_SUPABASE_URL; // Dangerous!
```

**Benefits**:
- Runtime validation with Zod schemas
- Type safety for all environment variables
- Clear distinction between client/server variables
- Build-time validation catches missing variables

### Nullability Handling

```typescript
// ✅ Optional properties (preferred)
interface Config {
  name: string;
  description?: string; // undefined when not set
}

// ✅ Pick one convention: null OR undefined (not both)
function findUser(id: string): User | null {
  // Consistent: always return null when not found
}

// ✅ Nullish coalescing for defaults
const displayName = user.name ?? "Anonymous";
const maxRetries = config.retries ?? 3;

// ✅ Enable strictNullChecks in tsconfig.json
```

### TypeScript Error Handling

```typescript
// ✅ Always catch as unknown, then type guard
try {
  await riskyOperation();
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error("Operation failed:", error.message);
  } else if (error instanceof z.ZodError) {
    console.error("Validation failed:", error.issues);
  } else {
    console.error("Unknown error:", error);
  }
}

// ✅ Custom error classes for domain errors
class TeamMemberValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = "TeamMemberValidationError";
  }
}
```

### Validation Pattern (External Data)

```typescript
// ✅ ALWAYS use unknown for external data (FormData, API responses, user input)
export async function createTeamMember(input: unknown) {
  // Runtime validation with Zod
  const validated: CreateTeamMemberInput =
    CreateTeamMemberInputSchema.parse(input);
  // Now type-safe after validation
  return await createTeamMemberDAL(validated);
}

// ❌ NEVER assume data is valid without runtime checks
export async function createTeamMember(input: CreateTeamMemberInput) {
  // No validation - dangerous!
}
```

## Clean Code Principles

**Based on**: `.github/instructions/1-clean-code.instructions.md`

### Function & File Limits

- **Max 30 lines per function**
- **Max 5 parameters per function**
- **Max 300 lines per file**
- **Max 10 sub-files per folder**
- **One responsibility per file**

### Code Quality Rules

```typescript
// ✅ Long, readable variable names
const authenticatedUserFromDatabase = await getCurrentUser();
const teamMemberCreationFormData = extractFormData(request);

// ✅ Explicit constants, no magic numbers
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const SESSION_DURATION_DAYS = 7;

// ✅ Fail fast with early returns
export async function createTeamMember(input: unknown) {
  if (!input) {
    return { success: false, error: "Input required" };
  }

  const validated = TeamMemberSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Validation failed" };
  }

  // Continue with main logic...
}

// ✅ No comments needed - code should be self-explanatory
const isUserAuthorizedForAdminArea = await checkAdminPermissions(user);
const shouldAllowTeamMemberCreation =
  isUserAuthorizedForAdminArea && hasValidInput;
```

### Error Handling Standards

```typescript
// ✅ Custom domain errors
class TeamMemberValidationError extends Error {
  constructor(field: string) {
    super(`Invalid team member ${field}`);
    this.name = "TeamMemberValidationError";
  }
}

// ✅ Throw early, handle at boundaries
export async function createTeamMember(data: unknown) {
  if (!data) throw new TeamMemberValidationError("data");

  const validated = TeamMemberSchema.parse(data); // Throws if invalid
  return await createTeamMemberDAL(validated);
}
```

## Database Management & Supabase Workflows

### Migration Guidelines

**Based on**: `.github/instructions/Create_migration.instructions.md`

**File Naming Convention**: `YYYYMMDDHHmmss_short_description.sql`

```sql
-- 20240906123045_create_profiles.sql

-- Migration Purpose: Create user profiles table with RLS
-- Affected Tables: profiles (new)
-- Special Considerations: Enables RLS for security

-- Create profiles table
create table public.profiles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.profiles is 'User profiles with biographical information';

-- Enable RLS (MANDATORY for all new tables)
alter table public.profiles enable row level security;

-- RLS Policy: Users can view all profiles
create policy "Anyone can view profiles"
on public.profiles for select
to anon, authenticated
using (true);

-- RLS Policy: Users can only edit their own profile
create policy "Users can edit own profile"
on public.profiles for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### Database Functions

**Based on**: `.github/instructions/Database_Create_functions.instructions.md`

**Default Pattern**: `SECURITY INVOKER` with empty `search_path`

**JSON Operator Pattern (Jan 2026)**: Pour trigger functions génériques, utiliser JSON operators pour accéder aux champs dynamiquement (supporte tables avec différentes colonnes PK : id, key, uuid).

```sql
-- ✅ PATTERN JSON OPERATOR (recommandé pour fonctions génériques)
create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer  -- Bypass RLS pour écriture dans audit_logs
set search_path = ''
as $$
declare
  record_id_text text;
begin
  -- JSON operator avec fallback chain (supporte id/key/uuid)
  record_id_text := coalesce(
    (to_json(new) ->> 'id'),    -- Tables avec id column
    (to_json(new) ->> 'key'),   -- Tables comme configurations_site
    (to_json(new) ->> 'uuid'),  -- Tables avec uuid
    null
  );
  
  insert into public.audit_logs (table_name, record_id, operation, user_id)
  values (tg_table_name::text, record_id_text, tg_op, auth.uid());
  
  return new;
end;
$$;

-- ❌ PATTERN DIRECT FIELD ACCESS (fragile, éviter)
-- record_id_text := coalesce(new.id::text, null);  -- Erreur si pas de colonne id
```

**Cas d'usage JSON operator**:

- ✅ Trigger functions génériques (audit_trigger, updated_at_trigger)
- ✅ Fonctions SECURITY DEFINER accédant à tables hétérogènes
- ✅ Vues dynamiques sur tables avec PK différentes

**Template fonction standard**:

```sql
-- Template for Supabase functions
create or replace function public.get_user_profile(profile_id bigint)
returns json
language plpgsql
security invoker -- Run with caller permissions (default choice)
set search_path = '' -- Prevent schema injection attacks
stable -- Optimize for read-only operations
as $$
declare
  profile_data json;
begin
  -- Use fully qualified names
  select row_to_json(p)
  into profile_data
  from public.profiles p
  where p.id = get_user_profile.profile_id;

  if profile_data is null then
    raise exception 'Profile not found';
  end if;

  return profile_data;
end;
$$;

-- Function with trigger example
create or replace function public.update_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Update timestamp on row modification
  new.updated_at := now();
  return new;
end;
$$;

-- Attach trigger to table
create trigger profiles_updated_at_trigger
before update on public.profiles
for each row
execute function public.update_updated_at();
```

### Declarative Schema Management

**Based on**: `.github/instructions/Declarative_Database_Schema.instructions.md`

**CRITICAL WORKFLOW**:

1. **Schema Files**: All changes in `supabase/schemas/*.sql`
2. **Stop Database**: `pnpm dlx supabase stop` before diff
3. **Generate Migration**: `pnpm dlx supabase db diff -f migration_name`
4. **Never Edit Migrations**: Only edit schema files, let CLI generate migrations

```bash
# Normal workflow
pnpm dlx supabase stop
# Edit supabase/schemas/10_profiles.sql
pnpm dlx supabase db diff -f add_profiles_table
pnpm dlx supabase start

# Emergency hotfix workflow (production only)
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_fix_critical_bug.sql
pnmp dlx supabase db push
# THEN update supabase/schemas/ to match
```

**Schema File Organization** (lexicographic order):

```bash
supabase/schemas/
  01_auth_extensions.sql      # Auth setup
  10_users_and_profiles.sql   # User tables
  20_content_tables.sql       # Main content
  30_functions.sql            # Database functions
  90_rls_policies.sql         # Security policies
```

### Memory Bank Management

**Based on**: `.github/instructions/memory-bank.instructions.md`

**Core Structure**:

```bash
memory-bank/
  projectbrief.md      # Foundation document
  productContext.md    # Why this exists
  activeContext.md     # Current focus (CRITICAL)
  systemPatterns.md    # Architecture decisions
  techContext.md       # Technologies used
  progress.md          # Current status
  tasks/
    _index.md          # Task status overview
    TASK001-name.md    # Individual task files
```

**Key Commands**:

- **update memory bank** → Review ALL memory-bank files
- **add task** → Create new task file + update \_index.md
- **update task TASKID** → Add progress log entry
- **show tasks active** → Filter tasks by status

**Task File Template**:

# `TASK001` - Implement Team Management

**Status:** In Progress  
**Added:** 2025-11-12  
**Updated:** 2025-11-12

## Progress Tracking

**Overall Status:** In Progress - 60%

### Subtasks

| ID  | Description          | Status      | Updated    | Notes |
| --- | -------------------- | ----------- | ---------- | ----- |
| 1.1 | Create DAL functions | Complete    | 2025-11-12 | ✅    |
| 1.2 | Build Server Actions | In Progress | 2025-11-12 | 🔄    |
| 1.3 | Create UI Components | Not Started | -          | ⏳    |

## Progress Log

### 2025-11-12

- Completed DAL functions for team CRUD
- Started Server Action implementation
- Made decision to use ActionResponse pattern

**Memory Bank Update Triggers**:

- After significant architecture changes
- When implementing new patterns
- User requests "update memory bank"
- Before major feature development
- After completing tasks

## Key References

**Architecture Documentation**:

- `memory-bank/architecture/Project_Architecture_Blueprint.md` - Current architecture (v4, Feb 2026)
- `memory-bank/architecture/Project_Folders_Structure_Blueprint_v5.md` - Folder structure reference
- `memory-bank/activeContext.md` - Recent changes and current focus
- `.github/instructions/nextjs-supabase-auth-2025.instructions.md` - Auth patterns (CANONICAL)

**Security Implementations**:

- `doc/ADMIN-VIEWS-SECURITY-HARDENING-SUMMARY.md` - Admin views isolation pattern (TASK037, Jan 2026)
- `memory-bank/tasks/TASK037-admin-views-security-hardening.md` - Security hardening task details
- `.github/prompts/plan-adminViewsSecurityHardening.prompt.md` - Implementation plan

**Migration Guides**:

- `.github/prompts/plan-teamMemberFormMigration.prompt.md` - Team CRUD migration to Server Actions + dedicated pages (`/new`, `/[id]/edit`)
- `.github/prompts/plan.dalSolidRefactoring.prompt.md` - DAL SOLID refactoring (31 modules + 5 helpers, 92% compliance)
- `.github/prompts/plan-task030DisplayTogglesEpicAlignment.prompt.md` - Display Toggles Epic alignment (10 toggles, Presse fix Phase 11)

**Display Toggles Implementation (January 2026)**:

Complete implementation of TASK030 across 11 phases:

1. **Database Foundation** (Phases 1-8):
   - `configurations_site` table with RLS policies
   - 10 display toggles across 5 categories (home, agenda, contact, presse)
   - Epic alignment: Newsletter, Partners, À la Une sections

2. **Presse Toggles Fix** (Phase 11 - Jan 1, 2026):
   - Split into 2 independent toggles: `display_toggle_media_kit` + `display_toggle_presse_articles`
   - Migration `20260101220000_fix_presse_toggles.sql` with idempotent transformation
   - Component fixes: PresseServerGate (dual fetches) + PresseView (conditional sections)
   - Utility scripts: `check-presse-toggles.ts` + `toggle-presse.ts` (4 modes)

3. **Admin Interface**:
   - Route: `/admin/site-config`
   - 5 sections: Home (6), Presse (2), Agenda (1), Contact (1)
   - Server Actions with immediate revalidation

**Commits**:
- `b27059f` - feat(presse): separate Media Kit and Press Releases toggles + hide disabled sections

**Audit Conformité Admin Features (February 2026)**:

Série de refactorings audit qualité sur les features admin, alignés sur les patterns DAL SOLID, Clean Code et WCAG :

1. **TASK033-FIX** Audit Logs — 7 corrections + 2 scripts test (branche `fix/audit-logs-violations`)
2. **TASK031-FIX** Analytics — 7 corrections + 2 bugfixes + infrastructure tracking
3. **TASK063** Media Admin — 12 étapes, 28 fichiers (branche `refactor/media-admin-audit-violations`, commit `5db3b25`)
4. **TASK064** Admin Partners — 18 étapes, 16 violations + 3 post-fix (branche `fix/admin-partners-audit-violations`, commit `3fd1bf7`)

**Pattern commun** :
- `mapToXxxDTO()` extraction dans DAL + `buildMediaPublicUrl` (T3 Env)
- `dalSuccess`/`dalError` + codes erreur `[ERR_XXX_NNN]`
- `.parseAsync()` Zod (async superRefine)
- `cache()` React sur lectures DAL
- Extraction composants > 300 lignes + `types.ts` colocalisé
- `import "server-only"` + `ActionResult` sans `data` (BigInt Three-Layer)
- Scripts test de validation non-régression (`pnpm test:partners`, `pnpm test:audit-logs:dal`)

**Next.js 16 Migration (December 2025)**:

The project was upgraded from Next.js 15.4.5 to 16.1.5 with the following key changes:

1. **Middleware renamed**: `middleware.ts` → `proxy.ts` (Next.js 16 convention)
2. **Turbopack default**: Now the default bundler in development
3. **Static generation stricter**: Pages using Supabase cookies require `export const dynamic = 'force-dynamic'`
4. **Codemod applied**: `pnpx @next/codemod@canary upgrade latest`
5. **Security fixes**: CVE-2025-57822 (SSRF), CVE-2025-64718 (js-yaml) resolved

**Pages requiring dynamic export** (Supabase SSR cookies):
- `app/(marketing)/page.tsx`
- `app/(marketing)/agenda/page.tsx`
- `app/(marketing)/presse/page.tsx`
- `app/(marketing)/spectacles/page.tsx`
- `app/(marketing)/compagnie/page.tsx`
- `app/(admin)/admin/home/about/page.tsx`

**Quality Standards**:

- Server Components first, Client Components only for interactivity
- Zod validation at all data boundaries
- Explicit admin checks + RLS policies (defense in depth)
- TypeScript strict mode, no `any` types
- Responsive design with shadcn/ui components

When in doubt, always examine existing patterns in the codebase and prioritize security, type safety, and maintainability.
