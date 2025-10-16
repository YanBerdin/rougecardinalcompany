# [TASK025] - Communications Dashboard

**Status:** Pending  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

## Original Request

Create a dashboard to view newsletter subscribers and contact messages so communications team can triage outreach.

## Thought Process

This dashboard needs read-only views over subscriber and messages tables and lightweight filtering. Ensure RLS allows admin read access.

## Implementation Plan

- DAL read methods for subscribers and contact messages.
- Admin dashboard page with lists, search, and filters.
- Quick actions: mark message as handled, export CSV.
- Add pagination and basic analytics summary.

## Progress Log

### 2025-10-16

- Generated from milestone list.
