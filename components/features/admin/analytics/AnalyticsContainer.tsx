import { Suspense } from "react";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import {
    fetchPageviewsTimeSeries,
    fetchTopPages,
    fetchMetricsSummary,
    fetchAdminActivitySummary,
    fetchSentryErrorMetrics,
} from "@/lib/dal/analytics";

/**
 * Default date range: Last 7 days
 */
function getDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    return { startDate, endDate };
}

/**
 * Analytics Container (Server Component)
 *
 * Fetches analytics data in parallel and passes to client dashboard
 */
export async function AnalyticsContainer() {
    const { startDate, endDate } = getDefaultDateRange();

    // Fetch all data in parallel
    const [
        pageviewsResult,
        topPagesResult,
        metricsResult,
        adminActivityResult,
        sentryErrorsResult,
    ] = await Promise.all([
        fetchPageviewsTimeSeries({ startDate, endDate }),
        fetchTopPages({ startDate, endDate }),
        fetchMetricsSummary({ startDate, endDate }),
        fetchAdminActivitySummary({ startDate, endDate }),
        fetchSentryErrorMetrics(),
    ]);

    // Extract data (or use empty defaults on error)
    const pageviewsSeries = pageviewsResult.success ? pageviewsResult.data : {
        data: [],
        granularity: "day" as const,
        startDate,
        endDate,
    };

    const topPages = topPagesResult.success ? topPagesResult.data : [];

    const metrics = metricsResult.success ? metricsResult.data : {
        totalViews: 0,
        uniqueVisitors: 0,
        totalSessions: 0,
    };

    const adminActivity = adminActivityResult.success ? adminActivityResult.data : {
        totalActions: 0,
        uniqueAdmins: 0,
        recentActions: [],
    };

    const sentryErrors = sentryErrorsResult.success ? sentryErrorsResult.data : {
        p0Critical: 0,
        p1High: 0,
        p2Medium: 0,
        totalErrors: 0,
        lastFetched: new Date(),
    };

    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <AnalyticsDashboard
                initialPageviewsSeries={pageviewsSeries}
                initialTopPages={topPages}
                initialMetrics={metrics}
                initialAdminActivity={adminActivity}
                initialSentryErrors={sentryErrors}
            />
        </Suspense>
    );
}

/**
 * Loading skeleton for dashboard
 */
function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Metric cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>

            {/* Chart */}
            <Skeleton className="h-80" />

            {/* Tables */}
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
            </div>
        </div>
    );
}
