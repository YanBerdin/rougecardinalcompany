# TASK023 - Partners Management

**Status:** Pending  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

## Original Request

Provide CRUD for partners with logos and display order so marketing can manage partner lists.

## Thought Process

Partners need logo uploads and a display-order field. Reuse Media Library for logos and provide drag-and-drop sorting in the admin UI.

## Implementation Plan

- Confirm `partners` table schema (logo url, name, url, display_order): `supabase/schemas/README.md` `supabase/migrations/migrations.md`.
- DAL methods for persistence and ordering.
- Admin UI with list, upload control, and drag-to-reorder.
- Persist ordering in DB and revalidate homepage/partners fragment on changes.

## Progress Log

### 2025-10-16

- Task created from Milestone 2.

## shadcn / TweakCN checklist

- [ ] Discover components with shadcn MCP: Image, Grid, DraggableList
- [ ] Use `get-component-demo` for drag-and-drop and image usage
- [ ] Ensure Media Library integration for logos and thumbnails
- [ ] Apply TweakCN theme and verify logo scaling and grid behavior
- [ ] Mobile responsiveness for partner lists and reordering UI
