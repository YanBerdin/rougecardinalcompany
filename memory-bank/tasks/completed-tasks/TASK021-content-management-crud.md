# `TASK021` - Content Management CRUD

**Status:** Completed  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

## Original Request

Build Create/Read/Update/Delete interfaces for shows, events and articles so editors can manage content autonomously.

## Thought Process

This is a foundational admin feature. It requires a server-side DAL, server components for reads, client components for interactive forms, and proper validation and authorization. Follow project DAL and RLS patterns.

## Implementation Plan

- Create database migrations / verify existing schemas for shows, events, articles: `supabase/schemas/README.md` `supabase/migrations/migrations.md`
- Implement DAL methods in `lib/dal/` for CRUD operations (server-only).
- Create server-side Container components for listing and reading content.
- Create Client forms (Server Actions) for create/update with Zod validation and revalidate paths on success.
- Add tests: unit for DAL and integration for API/Server Actions.

## Progress Log

### 2025-10-16

- Task created from Back-office epic Milestone 2.

## shadcn / TweakCN checklist

- [ ] Use shadcn MCP to discover required components (list-components)
- [ ] For each component, call `get-component-demo` and embed the demo usage
- [ ] Add or update `components.json` registries if needed
- [ ] Ensure components are placed under `components/ui/` following project conventions
- [ ] Apply TweakCN theme (or paste TweakCN command output) and verify styles on the admin pages
- [ ] Manual responsive check: mobile/tablet/desktop for CRUD screens
