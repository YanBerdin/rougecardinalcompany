---
applyTo: "**"
---

# GitHub Copilot Instructions - Rouge Cardinal Company

## Project Overview

A **theater company website** built with **Next.js 15 + TypeScript + Supabase + Tailwind/shadcn/ui**.

**Key Architecture**: Multi-layout routes with `(admin)` and `(marketing)` zones, server-first with optimized Supabase auth, comprehensive RLS security, and feature-based organization.

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
    .from('membres_equipe')
    .select('id, name, role, active')
    .eq('active', true);
  
  if (error) throw error;
  return data ?? [];
}
```

**Critical Rules**:

- NEVER import DAL in Client Components
- ALL mutations must revalidate: `revalidatePath('/admin/team')`
- Use Zod validation in both DAL inputs and Server Action inputs
- Return minimal DTOs, not full database rows

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
  role: z.string().min(1)
});

export async function createTeamMember(input: unknown) {
  try {
    await requireAdmin(); // Explicit auth check
    const validated = TeamMemberSchema.parse(input);
    const result = await upsertTeamMember(validated);
    revalidatePath('/admin/team');
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

```
components/
  features/
    admin/team/           # Feature: team management
      TeamContainer.tsx   # Smart component
      TeamList.tsx        # Dumb component  
      TeamCard.tsx        # Dumb component
      types.ts           # Feature types
    public-site/home/     # Feature: homepage
      HeroContainer.tsx   # Smart component
      Hero.tsx           # Dumb component
  ui/                     # shadcn/ui components
    button.tsx
    card.tsx
    sidebar.tsx

lib/
  dal/                    # Server-only data access
    team.ts
    home.ts
  hooks/                  # Client-side hooks
    use-newsletter-subscribe.ts
```

### Security Rules (36/36 tables have RLS)

- ALL tables use Row Level Security
- Public tables: `published_at IS NOT NULL` (read-only)
- Admin tables: `(select public.is_admin())` for all operations
- SECURITY INVOKER views require GRANT permissions on base tables

### Type Safety Pattern

```typescript
import { z } from "zod";

// Runtime validation + TypeScript types
const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  role: z.string().min(1)
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
import { sendNewsletterConfirmation } from '@/lib/email/actions';

async function testEmailService() {
  try {
    console.log('🧪 Testing newsletter confirmation...');
    const result = await sendNewsletterConfirmation('test@example.com');
    console.log('✅ Success:', result);
  } catch (error) {
    console.error('❌ Failed:', error.message);
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
const response = await fetch('http://localhost:3000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
});

const result = await response.json();
expect(result.status).toBe('sent');
```

### Security Validation Testing

**Pattern**: Test different permission levels to validate RLS and auth guards:

```typescript
// scripts/test-admin-access.ts - Test anon vs admin access
async function testAnonAccess() {
  const anonClient = createAnonClient();
  const { data, error } = await anonClient
    .from('membres_equipe')
    .select('*');
  
  // Should be blocked by RLS
  expect(error).toBeTruthy();
  console.log('✅ Anon properly blocked from admin table');
}
```

### Error State Testing

**Pattern**: Test error conditions with mock data and network failures:

```typescript
// Test invalid email format
const invalidEmail = 'not-an-email';
const result = await subscribeToNewsletter(invalidEmail);
expect(result.error).toContain('Invalid email');

// Test network failure simulation
mockFetch.mockRejectOnce(new Error('Network failure'));
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

export async function createTeamMember(input: CreateTeamMemberInput): Promise<ActionResponse<TeamMember>> {
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
        error: 'Validation failed', 
        status: 422, 
        details: error.issues 
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
      console.error('[Contact] Email notification failed:', emailError);
      emailSent = false;
    }
    
    return NextResponse.json({
      status: 'sent',
      message: 'Message envoyé',
      ...(emailSent ? {} : { warning: 'Notification email could not be sent' })
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('[Contact API] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

### DAL Error Handling

**Standard**: Throw errors early, return minimal data:

```typescript
export async function fetchTeamMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('membres_equipe')
    .select('id, name, role, active')
    .eq('active', true);
  
  if (error) throw error; // Let caller handle
  return data ?? [];       // Defensive fallback
}
```

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
  console.error('Email failed:', emailError);
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

### Next.js 15 Backend Requirements  

**Based on**: `.github/instructions/nextjs15-backend-with-supabase.instructions.md`

```typescript
// ✅ ALWAYS await headers() and cookies() in Next.js 15
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

## Next.js 15 & React 19 Best Practices

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
```

### Server Actions vs API Routes Decision Tree

1. **Mutations from same Next.js frontend** → **Server Action**
2. **Public APIs for external clients** → **API Route** 
3. **Webhooks/OAuth callbacks** → **API Route**
4. **Initial page data fetching** → **Server Component**

### Critical Next.js 15 Rules

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
// ✅ ALWAYS: Explicit typing, no any/unknown
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
type Status = 'pending' | 'completed' | 'cancelled';
type ActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ✅ Generics with descriptive names
function fetchResource<TData>(endpoint: string): Promise<TData> {
  return fetch(endpoint).then(res => res.json());
}

// ✅ Type guards for runtime checks
function isTeamMember(obj: unknown): obj is TeamMember {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

### TypeScript Error Handling

```typescript
// ✅ Catch as unknown, then type guard
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof Error) {
    console.error('Operation failed:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
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
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const SESSION_DURATION_DAYS = 7;

// ✅ Fail fast with early returns
export async function createTeamMember(input: unknown) {
  if (!input) {
    return { success: false, error: 'Input required' };
  }
  
  const validated = TeamMemberSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: 'Validation failed' };
  }
  
  // Continue with main logic...
}

// ✅ No comments needed - code should be self-explanatory
const isUserAuthorizedForAdminArea = await checkAdminPermissions(user);
const shouldAllowTeamMemberCreation = isUserAuthorizedForAdminArea && hasValidInput;
```

### Error Handling Standards

```typescript
// ✅ Custom domain errors
class TeamMemberValidationError extends Error {
  constructor(field: string) {
    super(`Invalid team member ${field}`);
    this.name = 'TeamMemberValidationError';
  }
}

// ✅ Throw early, handle at boundaries
export async function createTeamMember(data: unknown) {
  if (!data) throw new TeamMemberValidationError('data');
  
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
```
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
```
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
```markdown
# [TASK001] - Implement Team Management

**Status:** In Progress  
**Added:** 2025-11-12  
**Updated:** 2025-11-12

## Progress Tracking

**Overall Status:** In Progress - 60%

### Subtasks

| ID  | Description           | Status      | Updated    | Notes |
|-----|-----------------------|-------------|------------|-------|
| 1.1 | Create DAL functions  | Complete    | 2025-11-12 | ✅    |
| 1.2 | Build Server Actions  | In Progress | 2025-11-12 | 🔄    |
| 1.3 | Create UI Components  | Not Started | -          | ⏳    |

## Progress Log

### 2025-11-12
- Completed DAL functions for team CRUD
- Started Server Action implementation
- Made decision to use ActionResponse pattern
```

**Memory Bank Update Triggers**:
- After significant architecture changes
- When implementing new patterns  
- User requests "update memory bank"
- Before major feature development
- After completing tasks

## Key References

**Architecture Documentation**:

- `memory-bank/architecture/Project_Architecture_Blueprint_v3.md` - Current architecture
- `memory-bank/activeContext.md` - Recent changes and current focus
- `.github/instructions/nextjs-supabase-auth-2025.instructions.md` - Auth patterns (CANONICAL)

**Quality Standards**:

- Server Components first, Client Components only for interactivity
- Zod validation at all data boundaries  
- Explicit admin checks + RLS policies (defense in depth)
- TypeScript strict mode, no `any` types
- Responsive design with shadcn/ui components

When in doubt, always examine existing patterns in the codebase and prioritize security, type safety, and maintainability.
