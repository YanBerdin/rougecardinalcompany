"use server";
import "server-only";

import {
    fetchPageviewsTimeSeries,
    fetchTopPages,
    fetchMetricsSummary,
    fetchAdminActivitySummary,
} from "@/lib/dal/analytics";
import { AnalyticsFilterSchema, type AnalyticsFilter } from "@/lib/schemas/analytics";
import { stringify } from "csv-stringify/sync";

export type ExportResult =
    | { success: true; data: string }
    | { success: false; error: string };

/**
 * Export analytics data as CSV
 *
 * Includes metrics summary, top pages, and time-series data
 */
export async function exportAnalyticsCSV(filter: AnalyticsFilter): Promise<ExportResult> {
    try {
        const validatedFilter = AnalyticsFilterSchema.parse(filter);

        // Fetch all data in parallel
        const [metricsResult, topPagesResult, timeSeriesResult, adminActivityResult] =
            await Promise.all([
                fetchMetricsSummary(validatedFilter),
                fetchTopPages(validatedFilter),
                fetchPageviewsTimeSeries(validatedFilter),
                fetchAdminActivitySummary(validatedFilter),
            ]);

        if (!metricsResult.success) {
            return { success: false, error: `Metrics fetch failed: ${metricsResult.error}` };
        }

        if (!topPagesResult.success) {
            return { success: false, error: `Top pages fetch failed: ${topPagesResult.error}` };
        }

        if (!timeSeriesResult.success) {
            return { success: false, error: `Time series fetch failed: ${timeSeriesResult.error}` };
        }

        // Build CSV sections
        const sections: string[] = [];

        // Section 1: Summary Metrics
        sections.push("# RÉSUMÉ DES MÉTRIQUES");
        sections.push(
            stringify([metricsResult.data], {
                header: true,
                columns: [
                    { key: "totalViews", header: "Total Vues" },
                    { key: "uniqueVisitors", header: "Visiteurs Uniques" },
                    { key: "totalSessions", header: "Total Sessions" },
                    { key: "topEventType", header: "Événement Principal" },
                ],
            })
        );

        // Section 2: Top Pages
        sections.push("\n# PAGES POPULAIRES");
        sections.push(
            stringify(topPagesResult.data, {
                header: true,
                columns: [
                    { key: "pathname", header: "Page" },
                    { key: "views", header: "Vues" },
                    { key: "uniqueVisitors", header: "Visiteurs Uniques" },
                ],
            })
        );

        // Section 3: Time Series
        sections.push("\n# DONNÉES TEMPORELLES");
        sections.push(
            stringify(
                timeSeriesResult.data.data.map((point) => ({
                    timestamp: point.timestamp.toISOString(),
                    views: point.views,
                    uniqueVisitors: point.uniqueVisitors,
                    sessions: point.sessions,
                })),
                {
                    header: true,
                    columns: [
                        { key: "timestamp", header: "Date/Heure" },
                        { key: "views", header: "Vues" },
                        { key: "uniqueVisitors", header: "Visiteurs Uniques" },
                        { key: "sessions", header: "Sessions" },
                    ],
                }
            )
        );

        // Section 4: Admin Activity (if available)
        if (adminActivityResult.success && adminActivityResult.data.totalActions > 0) {
            sections.push("\n# ACTIVITÉ ADMIN");
            sections.push(
                stringify(
                    [
                        {
                            totalActions: adminActivityResult.data.totalActions,
                            uniqueAdmins: adminActivityResult.data.uniqueAdmins,
                            topOperation: adminActivityResult.data.topOperation ?? "N/A",
                        },
                    ],
                    {
                        header: true,
                        columns: [
                            { key: "totalActions", header: "Total Actions" },
                            { key: "uniqueAdmins", header: "Admins Uniques" },
                            { key: "topOperation", header: "Opération Principale" },
                        ],
                    }
                )
            );
        }

        const csv = sections.join("\n");

        return { success: true, data: csv };
    } catch (error) {
        return {
            success: false,
            error: `CSV export failed: ${error instanceof Error ? error.message : "Unknown"}`,
        };
    }
}

/**
 * Export analytics data as JSON
 *
 * Includes all analytics data in structured JSON format
 */
export async function exportAnalyticsJSON(filter: AnalyticsFilter): Promise<ExportResult> {
    try {
        const validatedFilter = AnalyticsFilterSchema.parse(filter);

        // Fetch all data in parallel
        const [metricsResult, topPagesResult, timeSeriesResult, adminActivityResult] =
            await Promise.all([
                fetchMetricsSummary(validatedFilter),
                fetchTopPages(validatedFilter),
                fetchPageviewsTimeSeries(validatedFilter),
                fetchAdminActivitySummary(validatedFilter),
            ]);

        // Build JSON response
        const exportData = {
            exportDate: new Date().toISOString(),
            filter: {
                startDate: validatedFilter.startDate.toISOString(),
                endDate: validatedFilter.endDate.toISOString(),
                granularity: validatedFilter.granularity,
            },
            metrics: metricsResult.success ? metricsResult.data : null,
            topPages: topPagesResult.success ? topPagesResult.data : null,
            timeSeries: timeSeriesResult.success
                ? {
                    ...timeSeriesResult.data,
                    data: timeSeriesResult.data.data.map((point) => ({
                        ...point,
                        timestamp: point.timestamp.toISOString(),
                    })),
                }
                : null,
            adminActivity: adminActivityResult.success
                ? {
                    ...adminActivityResult.data,
                    recentActions: adminActivityResult.data.recentActions.map((action) => ({
                        ...action,
                        timestamp: action.timestamp.toISOString(),
                    })),
                }
                : null,
            errors: {
                metrics: metricsResult.success ? null : metricsResult.error,
                topPages: topPagesResult.success ? null : topPagesResult.error,
                timeSeries: timeSeriesResult.success ? null : timeSeriesResult.error,
                adminActivity: adminActivityResult.success ? null : adminActivityResult.error,
            },
        };

        const json = JSON.stringify(exportData, null, 2);

        return { success: true, data: json };
    } catch (error) {
        return {
            success: false,
            error: `JSON export failed: ${error instanceof Error ? error.message : "Unknown"}`,
        };
    }
}
