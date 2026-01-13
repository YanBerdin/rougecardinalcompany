# TASK051 - Error Monitoring & Alerting

**Status:** Not Started  
**Priority:** P0 (Critical)  
**Added:** 2026-01-05  
**Updated:** 2026-01-13

## Original Request

Setup comprehensive error monitoring, alerting, and incident response procedures before production deployment.

## Context

Current state:

- No centralized error tracking (dispersed logs, console.log usage)
- No error boundaries in React components
- No automated alerts for critical errors
- No incident response procedures documented
- MTTR (Mean Time To Recovery) unknown and untracked

Production requirements:

- Fast incident detection and notification
- Graceful error handling (user experience)
- Detailed error context for debugging
- Clear escalation procedures

## Thought Process

Error monitoring strategy must cover 4 layers:

1. **Sentry integration** for centralized error tracking + performance monitoring
2. **React error boundaries** for graceful UI degradation
3. **Alert thresholds** for critical errors (rate-based triggers)
4. **Notification channels** (Slack/email for on-call response)

## Implementation Plan

### Phase 1: Sentry Integration (1 day)

- Create Sentry project (Next.js template)
- Install packages:
  - `@sentry/nextjs` — Core SDK for Next.js
  - `@supabase/sentry-js-integration` — Supabase client integration
- Configure DSN in environment variables (T3 Env):
  - `SENTRY_DSN` (server)
  - `NEXT_PUBLIC_SENTRY_DSN` (client)
- Create 4 Sentry config files:
  - `sentry.client.config.ts` — Browser errors + breadcrumbs
  - `sentry.server.config.ts` — Server-side errors
  - `sentry.edge.config.ts` — Edge Functions + Proxy
  - `instrumentation.ts` — Next.js instrumentation hook
- Configure Supabase integration with deduplication:

  ```typescript
  supabaseIntegration(SupabaseClient, Sentry, {
    tracing: true,
    breadcrumbs: true,
    errors: true,
  })
  ```

- Setup span deduplication (avoid duplicates with browserTracingIntegration):

  ```typescript
  shouldCreateSpanForRequest: (url) => !url.startsWith(`${SUPABASE_URL}/rest`)
  ```

- Setup source maps upload in CI/CD (Vercel integration)
- Add release tagging for version tracking
- Test error capture on staging

### Phase 2: Error Boundaries (1 day)

- Create `RootErrorBoundary` component (app-level catch-all)
- Create `PageErrorBoundary` component (route-level)
- Create `ComponentErrorBoundary` (granular, reusable)
- Add custom error context to Sentry:
  - User ID (if authenticated)
  - Current route/pathname
  - Server Action name (if applicable)
  - Request ID for tracing
- Implement fallback UI components (user-friendly error states)

### Phase 3: Alert Configuration (1 day)

- Configure alert thresholds in Sentry:
  - **Critical (P0)**: >10 errors/min → immediate alert
  - **High (P1)**: >50 errors/hour → urgent alert
  - **DB connection failures** → immediate alert
  - **Auth failures spike** → security alert
- Setup notification channels:
  - Slack webhook for critical/high alerts
  - Email for daily digest and P1 alerts
- Configure alert rules (deduplication, rate limits)
- Test alert delivery (simulate error scenarios)

### Phase 4: Incident Response (1 day)

- Write incident response runbook:
  - Detection → Triage → Mitigation → Resolution → Postmortem
- Define error severity levels:
  - **P0**: Service down, data loss risk → 15min response
  - **P1**: Major feature broken → 1h response
  - **P2**: Minor feature degraded → 4h response
  - **P3**: Cosmetic/low impact → Next sprint
- Document escalation procedures (who to contact)
- Create error triage workflow (Sentry → Slack → Action)
- Setup on-call rotation (if applicable)

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | -------------------------------- | ----------- | ------- | ------------------------ |
| 1.1 | Create Sentry project | Not Started | - | Next.js template |
| 1.2 | Install @sentry/nextjs | Not Started | - | Core SDK |
| 1.3 | Install @supabase/sentry-js-integration | Not Started | - | Supabase client errors |
| 1.4 | Configure DSN in T3 Env | Not Started | - | SENTRY_DSN + NEXT_PUBLIC |
| 1.5 | Create sentry.client.config.ts | Not Started | - | Browser + deduplication |
| 1.6 | Create sentry.server.config.ts | Not Started | - | Server-side errors |
| 1.7 | Create sentry.edge.config.ts | Not Started | - | Edge Functions + Proxy |
| 1.8 | Create instrumentation.ts | Not Started | - | Next.js hook |
| 1.9 | Setup source maps upload | Not Started | - | Vercel CI integration |
| 2.1 | Create RootErrorBoundary | Not Started | - | App-level catch-all |
| 2.2 | Create PageErrorBoundary | Not Started | - | Route-level |
| 2.3 | Create ComponentErrorBoundary | Not Started | - | Reusable wrapper |
| 2.4 | Add custom error context | Not Started | - | User/route/action |
| 3.1 | Configure alert thresholds | Not Started | - | P0: >10/min, P1: >50/h |
| 3.2 | Setup Slack webhook | Not Started | - | Critical alerts channel |
| 3.3 | Setup email notifications | Not Started | - | Daily digest + P1 |
| 3.4 | Test alert delivery | Not Started | - | Simulate errors |
| 4.1 | Write incident response runbook | Not Started | - | Detection → Postmortem |
| 4.2 | Define severity levels (P0-P3) | Not Started | - | Response time SLAs |
| 4.3 | Document escalation procedures | Not Started | - | Contact list + workflow |

## Dependencies

- **Depends on:** TASK034 (Performance Optimization) - baseline metrics for anomaly detection
- **Blocks:** TASK039 (Production Deployment) - mandatory observability before launch

## Acceptance Criteria

- [ ] Sentry DSN configured in all environments (dev/staging/prod)
- [ ] Supabase integration installed (`@supabase/sentry-js-integration`)
- [ ] 4 Sentry config files created (client, server, edge, instrumentation)
- [ ] Span deduplication configured (avoid duplicates with Supabase REST calls)
- [ ] Error boundaries implemented (3 levels: root/page/component)
- [ ] Source maps uploaded to Sentry (CI/CD automated via Vercel)
- [ ] Custom error context captured (user ID, route, action name)
- [ ] Alert thresholds configured (P0: >10/min, P1: >50/hour)
- [ ] Notification channels tested (Slack webhook + email)
- [ ] Incident response runbook written and reviewed
- [ ] Error severity levels documented (P0/P1/P2/P3 with SLAs)
- [ ] Test error successfully captured and alerted in staging

## Estimation

3-4 jours (4 phases × 1 jour)

## References

- Sentry Next.js SDK: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Sentry + Vercel integration: https://vercel.com/integrations/sentry
- **Supabase Sentry Integration**: https://supabase.com/docs/guides/telemetry/sentry-monitoring
- **Supabase Edge Functions + Sentry**: https://supabase.com/docs/guides/functions/examples/sentry-monitoring
- Supabase Sentry JS Integration (GitHub): https://github.com/supabase-community/sentry-integration-js
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- Incident response best practices: https://response.pagerduty.com/
- Error boundary patterns: https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react

## Technical Notes

### Supabase Integration Config (Next.js)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'
import { SupabaseClient } from '@supabase/supabase-js'
import { supabaseIntegration } from '@supabase/sentry-js-integration'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    supabaseIntegration(SupabaseClient, Sentry, {
      tracing: true,
      breadcrumbs: true,
      errors: true,
    }),
    Sentry.browserTracingIntegration({
      shouldCreateSpanForRequest: (url) => {
        // Avoid duplicate spans for Supabase REST calls
        return !url.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest`)
      },
    }),
  ],
  tracesSampleRate: 1.0, // Adjust in production
})
```

### Edge Functions (Deno SDK)

⚠️ **Limitation**: Sentry Deno SDK doesn't support `Deno.serve` instrumentation — use `withScope` for request isolation.

```typescript
import * as Sentry from 'https://deno.land/x/sentry/index.mjs'

Sentry.init({
  dsn: SENTRY_DSN,
  defaultIntegrations: false, // Required for Edge Functions
  tracesSampleRate: 1.0,
})

// Custom tags for Edge Functions
Sentry.setTag('region', Deno.env.get('SB_REGION'))
Sentry.setTag('execution_id', Deno.env.get('SB_EXECUTION_ID'))
```

## Progress Log

### 2026-01-05

- Task created (critical observability requirement for production)

### 2026-01-13

- Task documentation completed with full implementation plan
- Added Supabase Sentry integration details from official docs
- Added 4 Sentry config files (client, server, edge, instrumentation) to subtasks
- Added span deduplication pattern for Supabase REST calls
- Added Technical Notes section with code examples
- Estimated effort: 3-4 days across 4 phases
