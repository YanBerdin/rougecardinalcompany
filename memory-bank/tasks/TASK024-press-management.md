# [TASK024] - Press Management

**Status:** Pending  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

## Original Request

Implement CRUD for press releases and press contacts so the press kit remains up-to-date.

## Thought Process

Press items may include attachments (PDFs) and rich text. Ensure storage handling and sanitize uploads. Provide preview and publish controls.

## Implementation Plan

- Confirm `press_releases` and `press_contacts` schemas.
- DAL for press CRUD and file attachments (Supabase Storage).
- Admin UI with rich-text editor (server-validated), preview before publishing.
- Access control: only editors/admins can publish.
- Tests for upload and access rules.

## Progress Log

### 2025-10-16

- Task file generated from epic.
