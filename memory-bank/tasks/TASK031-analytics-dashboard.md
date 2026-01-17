# TASK031 - Analytics Dashboard

**Status:** ✅ Completed  
**Priority:** P1 (Important pour UX)  
**Added:** 2025-10-16  
**Updated:** 2026-01-17  
**Completed:** 2026-01-17

## Original Request

Provide an admin analytics dashboard showing site statistics, popular pages and user engagement.

## Context

Current state:

- Sentry configured for error tracking (TASK051 ✅)
- Audit logs table available (TASK033 ✅)
- Performance baselines documented (TASK034 ✅)
- No centralized analytics dashboard for admin users
- No pageview tracking implemented
- No data export functionality

Production requirements:

- Admin-only analytics dashboard
- Key metrics: pageviews, errors, performance
- Time-series data with date filters
- Export capabilities (CSV/JSON)
- Lightweight implementation (no large analytics libraries)

## Thought Process

Analytics strategy leveraging existing infrastructure:

1. **Data sources**: Sentry (errors/performance), Audit logs (user actions), New pageviews table
2. **Metrics priority**: Focus on actionable insights, avoid vanity metrics
3. **UI approach**: Server Components + shadcn/ui charts (Recharts via shadcn)
4. **Performance**: Aggregated queries, cached results, pagination
5. **Privacy**: Admin-only, RGPD-compliant (no PII tracking)

## Implementation Plan (4 Phases)

### Phase 1: Database Schema & Metrics Definition ✅ (1 day)

**Objective**: Define analytics data model and key metrics

**Schema Design**:

```sql
-- Pageviews tracking (aggregated hourly)
create table public.analytics_pageviews (
  id bigint generated always as identity primary key,
  path text not null,
  visitor_count integer default 1,
  view_count integer default 1,
  hour_bucket timestamptz not null,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_analytics_pageviews_hour on analytics_pageviews(hour_bucket desc);
create index idx_analytics_pageviews_path on analytics_pageviews(path);

-- RLS policies (admin-only)
alter table public.analytics_pageviews enable row level security;

create policy "Admins can view pageviews"
on public.analytics_pageviews for select
to authenticated
using ((select public.is_admin()));
```

**Key Metrics**:

- **Traffic**: Total pageviews, unique visitors (hourly aggregates)
- **Errors**: Error count by severity (P0/P1/P2) - via Sentry API
- **Performance**: Avg response time, slowest pages (Web Vitals)
- **Engagement**: Top pages, bounce rate approximation
- **Admin Activity**: Audit logs summary (CRUD operations count)

**Subtasks**:

- [ ] Create migration for analytics_pageviews table
- [ ] Define metrics interfaces/types in lib/schemas/analytics.ts
- [ ] Document data retention policy (90 days for pageviews)
- [ ] Test schema on staging

---

### Phase 2: DAL Aggregated Queries ✅ (1 day)

**Objective**: Create DAL functions for analytics data retrieval

**Files to create**:

- `lib/dal/analytics.ts` - Core analytics queries
- `lib/schemas/analytics.ts` - Zod schemas + types

**DAL Functions**:

```typescript
// lib/dal/analytics.ts
import { cache } from 'react';

// Pageviews time-series
export const fetchPageviewsTimeSeries = cache(async (
  startDate: Date,
  endDate: Date,
  granularity: 'hour' | 'day' = 'day'
): Promise<DALResult<PageviewsSeries[]>> => {
  // Aggregated query with date_trunc
});

// Top pages
export const fetchTopPages = cache(async (
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<DALResult<TopPage[]>> => {
  // Group by path, sum view_count
});

// Admin activity summary
export const fetchAdminActivitySummary = cache(async (
  startDate: Date,
  endDate: Date
): Promise<DALResult<AdminActivity[]>> => {
  // Query audit_logs table
});
```

**Optimization**:

- Use `date_trunc()` for time-series aggregation
- Apply `cache()` wrapper for request-level deduplication
- Limit queries to last 90 days (retention policy)
- Use indexes on timestamp columns

**Subtasks**:

- [ ] Create lib/dal/analytics.ts with 5 core functions
- [ ] Create lib/schemas/analytics.ts (Zod schemas)
- [ ] Add analytics exports to lib/schemas/index.ts
- [ ] Write unit tests for aggregation logic
- [ ] Test query performance (<500ms for 90 days data)

---

### Phase 3: Dashboard UI & Charts ✅ (1 day)

**Objective**: Build admin analytics dashboard with visualizations

**Route**: `/admin/analytics`

**Components Structure**:

```bash
app/(admin)/admin/analytics/
  page.tsx                          # Server Component (data fetching)

components/features/admin/analytics/
  AnalyticsContainer.tsx            # Smart component (fetch data)
  AnalyticsDashboard.tsx            # Dumb component (UI)
  AnalyticsFilters.tsx              # Date range picker (Client)
  PageviewsChart.tsx                # Line chart (Recharts)
  TopPagesTable.tsx                 # Table (shadcn/ui)
  MetricCard.tsx                    # Summary cards
  types.ts                          # Props interfaces
```

**UI Features**:

- **Date Range Picker**: Last 7/30/90 days or custom range
- **Summary Cards**: Total pageviews, unique visitors, error rate, avg response time
- **Pageviews Chart**: Time-series line chart (hourly/daily granularity)
- **Top Pages Table**: Path, views, unique visitors (sortable)
- **Admin Activity**: Recent admin actions summary
- **Export Button**: Download data as CSV/JSON

**Chart Library**:

- Use shadcn/ui charts (built on Recharts)
- Install: `pnpm dlx shadcn@latest add chart`
- Lightweight, tree-shakeable, no large bundle impact

**Subtasks**:

- [ ] Create route app/(admin)/admin/analytics/page.tsx
- [ ] Create AnalyticsContainer.tsx (Server Component)
- [ ] Create AnalyticsDashboard.tsx (Dumb component)
- [ ] Create AnalyticsFilters.tsx (Client Component)
- [ ] Create PageviewsChart.tsx with Recharts
- [ ] Create TopPagesTable.tsx with shadcn/ui Table
- [ ] Create MetricCard.tsx (summary stats)
- [ ] Add to admin sidebar navigation
- [ ] Test responsive design (mobile/tablet/desktop)

---

### Phase 4: Export & Optimization ✅ (1 day)

**Objective**: Add data export and performance tuning

**Export Functionality**:

```typescript
// Server Action
export async function exportAnalyticsData(
  format: 'csv' | 'json',
  startDate: Date,
  endDate: Date
): Promise<ActionResponse<string>> {
  // Fetch data via DAL
  // Format as CSV or JSON
  // Return download URL or inline data
}
```

**Export Formats**:

- **CSV**: Compatible with Excel/Google Sheets
- **JSON**: Machine-readable for integrations

**Optimization**:

- Enable ISR on analytics page (`export const revalidate = 300` - 5min cache)
- Add loading states with Suspense boundaries
- Paginate top pages table (10/25/50 rows per page)
- Add request-level caching with `cache()`
- Implement query result memoization

**Subtasks**:

- [ ] Create Server Action exportAnalyticsData()
- [ ] Add CSV export button (download link)
- [ ] Add JSON export button (download link)
- [ ] Enable ISR (revalidate=300) on analytics page
- [ ] Add Suspense boundaries for charts
- [ ] Add pagination to TopPagesTable
- [ ] Test export with large datasets (10k+ rows)
- [ ] Document analytics usage in memory-bank/

---

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks Summary

| Phase | Description | Status | Updated | Progress |
| ------- | ------------- | -------- | --------- | ---------- |
| **Phase 1** | Database Schema & Metrics | Not Started | - | 0% |
| 1.1 | Create migration analytics_pageviews | Not Started | - | ⏳ |
| 1.2 | Define metrics interfaces (lib/schemas) | Not Started | - | ⏳ |
| 1.3 | Document retention policy | Not Started | - | ⏳ |
| **Phase 2** | DAL Aggregated Queries | Not Started | - | 0% |
| 2.1 | Create lib/dal/analytics.ts | Not Started | - | ⏳ |
| 2.2 | Create lib/schemas/analytics.ts | Not Started | - | ⏳ |
| 2.3 | Write unit tests | Not Started | - | ⏳ |
| 2.4 | Test query performance | Not Started | - | ⏳ |
| **Phase 3** | Dashboard UI & Charts | Not Started | - | 0% |
| 3.1 | Create analytics route/page | Not Started | - | ⏳ |
| 3.2 | Create AnalyticsContainer.tsx | Not Started | - | ⏳ |
| 3.3 | Create AnalyticsDashboard.tsx | Not Started | - | ⏳ |
| 3.4 | Create PageviewsChart.tsx | Not Started | - | ⏳ |
| 3.5 | Create TopPagesTable.tsx | Not Started | - | ⏳ |
| 3.6 | Add to admin sidebar | Not Started | - | ⏳ |
| 3.7 | Test responsive design | Not Started | - | ⏳ |
| **Phase 4** | Export & Optimization | Not Started | - | 0% |
| 4.1 | Create exportAnalyticsData() action | Not Started | - | ⏳ |
| 4.2 | Add CSV/JSON export buttons | Not Started | - | ⏳ |
| 4.3 | Enable ISR (revalidate=300) | Not Started | - | ⏳ |
| 4.4 | Add Suspense boundaries | Not Started | - | ⏳ |
| 4.5 | Add pagination | Not Started | - | ⏳ |

---

## Dependencies

**Depends on**:

- ✅ TASK033 (Audit Logs Viewer) - audit_logs table for admin activity
- ✅ TASK034 (Performance Optimization) - baseline metrics + caching patterns
- ✅ TASK051 (Error Monitoring) - Sentry integration for error metrics

**Blocks**:

- TASK039 (Production Deployment) - analytics required for launch monitoring

---

## Acceptance Criteria

### Phase 1 ✅

- [ ] analytics_pageviews table created with RLS policies
- [ ] Metrics interfaces defined in lib/schemas/analytics.ts
- [ ] Data retention policy documented (90 days)
- [ ] Schema migration tested on staging

### Phase 2 ✅

- [ ] lib/dal/analytics.ts created with 5 core functions
- [ ] Zod schemas in lib/schemas/analytics.ts
- [ ] Unit tests written for aggregation logic
- [ ] Query performance validated (<500ms for 90 days)

### Phase 3 ✅

- [ ] Admin route /admin/analytics accessible
- [ ] Dashboard displays 4 summary cards
- [ ] Pageviews chart renders time-series data
- [ ] Top pages table displays top 10 pages
- [ ] Admin activity summary visible
- [ ] Date range picker functional (7/30/90 days)
- [ ] Responsive design on mobile/tablet/desktop

### Phase 4 ✅

- [ ] CSV export downloads successfully
- [ ] JSON export downloads successfully
- [ ] ISR enabled (revalidate=300)
- [ ] Suspense boundaries implemented
- [ ] Pagination working (10/25/50 rows)
- [ ] Large dataset export tested (10k+ rows)
- [ ] Documentation updated in memory-bank/

---

## Technical Decisions

### Chart Library Choice

**Decision**: Use shadcn/ui charts (built on Recharts)  
**Rationale**:

- Already using shadcn/ui ecosystem
- Lightweight, tree-shakeable
- Built on Recharts (industry standard)
- Consistent theming with existing UI

**Alternatives considered**:

- Chart.js: Heavier bundle, canvas-based
- Victory: Good, but less integrated with shadcn
- Custom D3: Overkill for simple charts

### Data Aggregation Strategy

**Decision**: Hourly bucketing in database  
**Rationale**:

- Reduces data volume (vs. per-pageview tracking)
- Privacy-friendly (no PII stored)
- Fast queries with date_trunc()
- 90-day retention = ~2,160 rows per page path

**Alternatives considered**:

- Real-time tracking: Privacy concerns, large data volume
- External service (Google Analytics): Data ownership, RGPD compliance

### Performance Optimization

**Decision**: ISR (5min cache) + request-level cache()  
**Rationale**:

- Analytics don't need real-time updates
- 5min cache = fresh enough for monitoring
- cache() deduplicates parallel requests
- Reduces DB load significantly

---

## Estimation

**Total Effort**: 3-4 jours (4 phases × 1 jour)

**Breakdown**:

- Phase 1 (Schema): 1 jour
- Phase 2 (DAL): 1 jour
- Phase 3 (UI): 1 jour
- Phase 4 (Export): 1 jour

---

## References

- Sentry Performance API: https://docs.sentry.io/api/organizations/retrieve-event-counts-for-an-organization/
- shadcn/ui Charts: https://ui.shadcn.com/docs/components/chart
- Recharts Documentation: https://recharts.org/en-US/
- PostgreSQL date_trunc(): https://www.postgresql.org/docs/current/functions-datetime.html
- Next.js ISR: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration

---

## Progress Log

### 2026-01-16

- Task documentation enriched with detailed 4-phase implementation plan
- Estimated effort: 3-4 days
- Dependencies validated: TASK033 ✅, TASK034 ✅, TASK051 ✅
- Ready to start implementation

### 2025-10-16

- Task created from epic list
