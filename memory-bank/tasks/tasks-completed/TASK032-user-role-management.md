# TASK032 - User Role Management

**Status:** Pending  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

## Original Request

Manage admin/editor roles and permissions with UI to change roles and assign fine-grained permissions.

## Thought Process

Leverage Supabase auth + RLS for enforcement. UI should allow role assignment and mapping of permissions. Ensure audit logging and safeguards for last admin demotion.

## Implementation Plan

- Define roles and permissions model.
- DAL or Admin APIs to update roles, enforced server-side.
- Admin UI: user list, role editor, permission matrix for advanced roles.
- Prevent removing last admin; require confirmation for critical changes.

## Progress Log

### 2025-10-16

- Task generated from Milestone 3.
