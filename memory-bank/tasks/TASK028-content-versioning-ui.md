# TASK028 - Content Versioning UI

**Status:** Pending  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

## Original Request

Provide a UI to view history, compare versions and restore previous states for content.

## Thought Process

Versioning adds complexity to storage; prefer a lightweight revision table that stores deltas or full snapshots depending on size. Provide compare/restore operations as admin actions.

## Implementation Plan

- Design `content_revisions` table or utilize existing change logs: `supabase/schemas/README.md` `supabase/migrations/migrations.md`.
- DAL methods to list revisions and fetch snapshot data.
- UI to display side-by-side diffs and a restore button (Server Action) with authorization.
- Tests covering restore correctness and audit logging.

## Progress Log

### 2025-10-16

- Task created from Milestone 3 list.

## shadcn / TweakCN checklist

- [ ] Use shadcn MCP to find components for diffs, modal viewers, and side-by-side layout
- [ ] Call `get-component-demo` and reuse dialog/modal patterns for compare/restore flows
- [ ] Apply TweakCN theme to versioning UI and confirm contrast for diff highlights
- [ ] Accessibility checks for diff navigation and keyboard interactions
