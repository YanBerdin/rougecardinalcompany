# [TASK022] - Team Management

**Status:** Pending  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

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
