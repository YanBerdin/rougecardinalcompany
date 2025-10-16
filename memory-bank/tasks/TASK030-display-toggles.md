# [TASK030] - Display Toggles

**Status:** Pending  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

## Original Request

Implement display toggles to control visibility of newsletter, partners, and featured content sections.

## Thought Process

Toggles are configuration stored in DB and read by public pages; ensure fast reads and immediate effect. Provide admin toggles and audit logging.

## Implementation Plan

- Create `site_config` table or `feature_flags` table for toggles: `supabase/schemas/README.md` `supabase/migrations/migrations.md`
- DAL read/write methods for toggles.
- Admin UI with toggles per page (with confirmation) and immediate revalidation of affected paths.
- Log changes for audit.

## Progress Log

### 2025-10-16

- Task created from Milestone 3.
