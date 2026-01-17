"use server";
import "server-only";

/**
 * Analytics Data Access Layer
 * @module lib/dal/analytics
 *
 * Provides cached access to analytics metrics, time-series data, and error tracking.
 * All functions require admin authentication via requireAdmin() guard.
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { dalError, dalSuccess, getErrorMessage, type DALResult } from "./helpers/error";
import {
    autoSelectGranularity,
    PageviewsSeriesSchema,
    TopPagesSchema,
    MetricsSummarySchema,
    AdminActivitySummarySchema,
    SentryErrorMetricsSchema,
    type PageviewsSeries,
    type TopPages,
    type MetricsSummary,
    type AdminActivitySummary,
    type SentryErrorMetrics,
    type AnalyticsFilter,
} from "@/lib/schemas/analytics";
import { fetchSentryErrorMetrics as fetchSentryErrorMetricsService } from "@/lib/services/sentry-api";

// ============================================================================
// PAGEVIEWS TIME-SERIES
// ============================================================================

/**
 * Fetch pageviews time-series data with automatic granularity selection
 *
 * @param filter - Date range filter with optional granularity
 * @returns Time-series data with views, unique visitors, and sessions
 *
 * @example
 * const result = await fetchPageviewsTimeSeries({
 *   startDate: new Date('2026-01-01'),
 *   endDate: new Date('2026-01-15')
 * });
 */
export const fetchPageviewsTimeSeries = cache(
    async (filter: AnalyticsFilter): Promise<DALResult<PageviewsSeries>> => {
        try {
            await requireAdmin();

            const supabase = await createClient();
            const granularity = filter.granularity ?? autoSelectGranularity(filter.startDate, filter.endDate);

            // Use date_trunc to aggregate by granularity
            const truncExpression = granularity === "hour"
                ? "date_trunc('hour', created_at)"
                : "date_trunc('day', created_at)";

            const { data, error } = await supabase
                .from("analytics_events")
                .select("created_at, user_id, session_id")
                .eq("event_type", "page_view")
                .gte("created_at", filter.startDate.toISOString())
                .lte("created_at", filter.endDate.toISOString())
                .order("created_at", { ascending: true });

            if (error) {
                return dalError(`Failed to fetch pageviews: ${error.message}`);
            }

            // Aggregate data client-side (Supabase doesn't support date_trunc in JS SDK directly)
            const aggregated = new Map<string, { views: number; users: Set<string>; sessions: Set<string> }>();

            for (const row of data ?? []) {
                const timestamp = new Date(row.created_at);
                let key: string;

                if (granularity === "hour") {
                    timestamp.setMinutes(0, 0, 0);
                    key = timestamp.toISOString();
                } else {
                    timestamp.setHours(0, 0, 0, 0);
                    key = timestamp.toISOString();
                }

                if (!aggregated.has(key)) {
                    aggregated.set(key, { views: 0, users: new Set(), sessions: new Set() });
                }

                const bucket = aggregated.get(key)!;
                bucket.views++;
                if (row.user_id) bucket.users.add(row.user_id);
                if (row.session_id) bucket.sessions.add(row.session_id);
            }

            // Convert to array and sort
            const timeSeriesData = Array.from(aggregated.entries())
                .map(([timestamp, { views, users, sessions }]) => ({
                    timestamp: new Date(timestamp),
                    views,
                    uniqueVisitors: users.size,
                    sessions: sessions.size,
                }))
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            const validated = PageviewsSeriesSchema.parse({
                data: timeSeriesData,
                granularity,
                startDate: filter.startDate,
                endDate: filter.endDate,
            });

            return dalSuccess(validated);
        } catch (err) {
            return dalError(getErrorMessage(err));
        }
    }
);

// ============================================================================
// TOP PAGES
// ============================================================================

/**
 * Fetch top 10 pages by view count
 *
 * @param filter - Date range filter
 * @returns Top 10 pages with views and unique visitors
 */
export const fetchTopPages = cache(
    async (filter: AnalyticsFilter): Promise<DALResult<TopPages>> => {
        try {
            await requireAdmin();

            const supabase = await createClient();

            const { data, error } = await supabase
                .from("analytics_events")
                .select("pathname, user_id, session_id")
                .eq("event_type", "page_view")
                .not("pathname", "is", null)
                .gte("created_at", filter.startDate.toISOString())
                .lte("created_at", filter.endDate.toISOString());

            if (error) {
                return dalError(`Failed to fetch top pages: ${error.message}`);
            }

            // Aggregate by pathname
            const pageStats = new Map<string, { views: number; visitors: Set<string> }>();

            for (const row of data ?? []) {
                if (!row.pathname) continue;

                if (!pageStats.has(row.pathname)) {
                    pageStats.set(row.pathname, { views: 0, visitors: new Set() });
                }

                const stats = pageStats.get(row.pathname)!;
                stats.views++;
                if (row.user_id) stats.visitors.add(row.user_id);
            }

            // Convert to array, sort by views, take top 10
            const topPages = Array.from(pageStats.entries())
                .map(([pathname, { views, visitors }]) => ({
                    pathname,
                    views,
                    uniqueVisitors: visitors.size,
                }))
                .sort((a, b) => b.views - a.views)
                .slice(0, 10);

            const validated = TopPagesSchema.parse(topPages);

            return dalSuccess(validated);
        } catch (err) {
            return dalError(getErrorMessage(err));
        }
    }
);

// ============================================================================
// METRICS SUMMARY
// ============================================================================

/**
 * Fetch aggregated metrics summary for a date range
 *
 * @param filter - Date range filter
 * @returns Total views, unique visitors, sessions, and top event type
 */
export const fetchMetricsSummary = cache(
    async (filter: AnalyticsFilter): Promise<DALResult<MetricsSummary>> => {
        try {
            await requireAdmin();

            const supabase = await createClient();

            const { data, error } = await supabase
                .from("analytics_events")
                .select("event_type, user_id, session_id")
                .gte("created_at", filter.startDate.toISOString())
                .lte("created_at", filter.endDate.toISOString());

            if (error) {
                return dalError(`Failed to fetch metrics summary: ${error.message}`);
            }

            const uniqueUsers = new Set<string>();
            const uniqueSessions = new Set<string>();
            const eventTypeCounts = new Map<string, number>();

            for (const row of data ?? []) {
                if (row.user_id) uniqueUsers.add(row.user_id);
                if (row.session_id) uniqueSessions.add(row.session_id);

                const count = eventTypeCounts.get(row.event_type) ?? 0;
                eventTypeCounts.set(row.event_type, count + 1);
            }

            // Find top event type
            let topEventType: string | undefined;
            let maxCount = 0;
            for (const [eventType, count] of eventTypeCounts.entries()) {
                if (count > maxCount) {
                    maxCount = count;
                    topEventType = eventType;
                }
            }

            const metrics = MetricsSummarySchema.parse({
                totalViews: data?.length ?? 0,
                uniqueVisitors: uniqueUsers.size,
                totalSessions: uniqueSessions.size,
                topEventType,
            });

            return dalSuccess(metrics);
        } catch (err) {
            return dalError(getErrorMessage(err));
        }
    }
);

// ============================================================================
// ADMIN ACTIVITY SUMMARY
// ============================================================================

/**
 * Fetch admin activity summary from audit logs
 *
 * @param filter - Date range filter
 * @returns Total actions, unique admins, top operation, and recent actions
 */
export const fetchAdminActivitySummary = cache(
    async (filter: AnalyticsFilter): Promise<DALResult<AdminActivitySummary>> => {
        try {
            await requireAdmin();

            const supabase = await createClient();

            const { data, error } = await supabase
                .from("logs_audit")
                .select("action, table_name, created_at, user_id")
                .gte("created_at", filter.startDate.toISOString())
                .lte("created_at", filter.endDate.toISOString())
                .order("created_at", { ascending: false })
                .limit(100); // Get recent 100 actions

            if (error) {
                return dalError(`Failed to fetch admin activity: ${error.message}`);
            }

            const uniqueAdmins = new Set<string>();
            const operationCounts = new Map<string, number>();

            for (const row of data ?? []) {
                if (row.user_id) uniqueAdmins.add(row.user_id);

                const count = operationCounts.get(row.action) ?? 0;
                operationCounts.set(row.action, count + 1);
            }

            // Find top operation
            let topOperation: string | undefined;
            let maxCount = 0;
            for (const [operation, count] of operationCounts.entries()) {
                if (count > maxCount) {
                    maxCount = count;
                    topOperation = operation;
                }
            }

            // Format recent actions (top 10)
            const recentActions = (data ?? []).slice(0, 10).map((row) => ({
                operation: row.action,
                tableName: row.table_name,
                timestamp: new Date(row.created_at),
                userId: row.user_id ?? undefined,
            }));

            const summary = AdminActivitySummarySchema.parse({
                totalActions: data?.length ?? 0,
                uniqueAdmins: uniqueAdmins.size,
                topOperation,
                recentActions,
            });

            return dalSuccess(summary);
        } catch (err) {
            return dalError(getErrorMessage(err));
        }
    }
);

// ============================================================================
// SENTRY ERROR METRICS
// ============================================================================

/**
 * Fetch Sentry error metrics (P0/P1/P2 counts)
 *
 * Cached wrapper around Sentry API service. Returns zero metrics if Sentry
 * is not configured (graceful degradation).
 *
 * @returns Error counts by priority level
 */
export const fetchSentryErrorMetrics = cache(
    async (): Promise<DALResult<SentryErrorMetrics>> => {
        try {
            await requireAdmin();

            // Delegate to Sentry API service
            const result = await fetchSentryErrorMetricsService();

            if (!result.success) {
                return result; // Pass through error
            }

            // Validate response
            const validated = SentryErrorMetricsSchema.parse(result.data);

            return dalSuccess(validated);
        } catch (err) {
            return dalError(getErrorMessage(err));
        }
    }
);
