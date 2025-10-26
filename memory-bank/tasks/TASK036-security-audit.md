# `[TASK036]` - Security Audit

**Status:** Pending  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

## Original Request

Perform a security audit: review RLS policies, test auth flows, run vulnerability scans prior to launch.

## Thought Process

Audit should include RLS checks, secrets management, dependency scanning, and an OWASP-style review. Produce remediation tickets for issues found.

## Implementation Plan

- Review all RLS policies and test edge cases.
- Run dependency vulnerability scans (npm audit / snyk) and remediate critical items.
- Perform penetration testing checklist and document findings.
- Validate secure cookie flags and auth flows (`getClaims()` usage).

## Progress Log

### 2025-10-16

- Task generated from Milestone 4.
