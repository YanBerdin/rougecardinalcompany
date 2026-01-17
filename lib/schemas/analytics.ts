import { z } from "zod";

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

/**
 * Granularity for time-series aggregation
 * Auto-selected based on date range: "hour" for ≤7 days, "day" for >7 days
 */
export const GranularitySchema = z.enum(["hour", "day"]);
export type Granularity = z.infer<typeof GranularitySchema>;

/**
 * Analytics filter for date range queries
 * Supports automatic granularity selection
 */
export const AnalyticsFilterSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    granularity: GranularitySchema.optional(), // Auto-computed if not provided
});
export type AnalyticsFilter = z.infer<typeof AnalyticsFilterSchema>;

/**
 * UI-friendly filter schema with string dates
 */
export const AnalyticsFilterFormSchema = z.object({
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    granularity: GranularitySchema.optional(),
});
export type AnalyticsFilterFormValues = z.infer<typeof AnalyticsFilterFormSchema>;

// ============================================================================
// TIME-SERIES SCHEMAS
// ============================================================================

/**
 * Single data point in pageviews time-series
 */
export const PageviewsDataPointSchema = z.object({
    timestamp: z.coerce.date(),
    views: z.number().int().nonnegative(),
    uniqueVisitors: z.number().int().nonnegative(),
    sessions: z.number().int().nonnegative(),
});
export type PageviewsDataPoint = z.infer<typeof PageviewsDataPointSchema>;

/**
 * Complete pageviews time-series response
 */
export const PageviewsSeriesSchema = z.object({
    data: z.array(PageviewsDataPointSchema),
    granularity: GranularitySchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
});
export type PageviewsSeries = z.infer<typeof PageviewsSeriesSchema>;

// ============================================================================
// TOP PAGES SCHEMAS
// ============================================================================

/**
 * Single page with view count
 */
export const TopPageSchema = z.object({
    pathname: z.string(),
    views: z.number().int().positive(),
    uniqueVisitors: z.number().int().nonnegative(),
    averageSessionDuration: z.number().nonnegative().optional(),
});
export type TopPage = z.infer<typeof TopPageSchema>;

/**
 * Top pages list response
 */
export const TopPagesSchema = z.array(TopPageSchema);
export type TopPages = z.infer<typeof TopPagesSchema>;

// ============================================================================
// METRICS SUMMARY SCHEMAS
// ============================================================================

/**
 * Aggregated metrics for a date range
 */
export const MetricsSummarySchema = z.object({
    totalViews: z.number().int().nonnegative(),
    uniqueVisitors: z.number().int().nonnegative(),
    totalSessions: z.number().int().nonnegative(),
    averageSessionDuration: z.number().nonnegative().optional(),
    topEventType: z.string().optional(),
});
export type MetricsSummary = z.infer<typeof MetricsSummarySchema>;

// ============================================================================
// ADMIN ACTIVITY SCHEMAS
// ============================================================================

/**
 * Admin activity summary from audit logs
 */
export const AdminActivitySummarySchema = z.object({
    totalActions: z.number().int().nonnegative(),
    uniqueAdmins: z.number().int().nonnegative(),
    topOperation: z.string().optional(),
    recentActions: z.array(
        z.object({
            operation: z.string(),
            tableName: z.string(),
            timestamp: z.coerce.date(),
            userId: z.string().uuid().optional(),
        })
    ),
});
export type AdminActivitySummary = z.infer<typeof AdminActivitySummarySchema>;

// ============================================================================
// SENTRY ERROR METRICS SCHEMAS
// ============================================================================

/**
 * Sentry error metrics by severity
 */
export const SentryErrorMetricsSchema = z.object({
    p0Critical: z.number().int().nonnegative(), // Critical errors (P0)
    p1High: z.number().int().nonnegative(), // High priority (P1)
    p2Medium: z.number().int().nonnegative(), // Medium priority (P2)
    totalErrors: z.number().int().nonnegative(),
    lastFetched: z.coerce.date(),
});
export type SentryErrorMetrics = z.infer<typeof SentryErrorMetricsSchema>;

// ============================================================================
// DATABASE ROW SCHEMAS (Internal)
// ============================================================================

/**
 * Raw analytics event from database
 * Used internally by DAL functions
 */
export const AnalyticsEventSchema = z.object({
    id: z.coerce.bigint(),
    created_at: z.coerce.date(),
    event_type: z.string(),
    entity_type: z.string().nullable(),
    entity_id: z.coerce.bigint().nullable(),
    user_id: z.string().uuid().nullable(),
    session_id: z.string().nullable(),
    pathname: z.string().nullable(),
    search_query: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    ip_address: z.string().nullable(),
    user_agent: z.string().nullable(),
});
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

/**
 * Analytics summary row from database view
 */
export const AnalyticsSummaryRowSchema = z.object({
    event_type: z.string(),
    entity_type: z.string().nullable(),
    event_date: z.coerce.date(),
    total_events: z.number().int(),
    unique_users: z.number().int(),
    unique_sessions: z.number().int(),
});
export type AnalyticsSummaryRow = z.infer<typeof AnalyticsSummaryRowSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Auto-select granularity based on date range
 * ≤7 days → "hour", >7 days → "day"
 */
export function autoSelectGranularity(
    startDate: Date,
    endDate: Date
): Granularity {
    const diffDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 7 ? "hour" : "day";
}

/**
 * Validate and normalize analytics filter
 */
export function normalizeAnalyticsFilter(
    input: unknown
): AnalyticsFilter {
    const parsed = AnalyticsFilterSchema.parse(input);

    // Auto-select granularity if not provided
    if (!parsed.granularity) {
        return {
            ...parsed,
            granularity: autoSelectGranularity(parsed.startDate, parsed.endDate),
        };
    }

    return parsed;
}
