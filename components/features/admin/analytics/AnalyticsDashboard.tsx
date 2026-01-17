"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BarChart3, Users, Eye, Activity, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./MetricCard";
import { PageviewsChart } from "./PageviewsChart";
import { TopPagesTable } from "./TopPagesTable";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { SentryErrorsCard } from "./SentryErrorsCard";
import { AdminActivityCard } from "./AdminActivityCard";
import { exportAnalyticsCSV, exportAnalyticsJSON } from "@/app/(admin)/admin/analytics/actions";
import type { AnalyticsDashboardProps } from "./types";

/**
 * Analytics Dashboard (Client Component)
 *
 * Main dashboard UI with filters, metrics, charts, and tables
 */
export function AnalyticsDashboard({
    initialPageviewsSeries,
    initialTopPages,
    initialMetrics,
    initialAdminActivity,
    initialSentryErrors,
}: AnalyticsDashboardProps) {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Local state synchronized with props
    const [pageviewsSeries, setPageviewsSeries] = useState(initialPageviewsSeries);
    const [topPages, setTopPages] = useState(initialTopPages);
    const [metrics, setMetrics] = useState(initialMetrics);
    const [adminActivity, setAdminActivity] = useState(initialAdminActivity);
    const [sentryErrors, setSentryErrors] = useState(initialSentryErrors);

    // Sync state when props change (after router.refresh())
    useEffect(() => {
        setPageviewsSeries(initialPageviewsSeries);
        setTopPages(initialTopPages);
        setMetrics(initialMetrics);
        setAdminActivity(initialAdminActivity);
        setSentryErrors(initialSentryErrors);
    }, [
        initialPageviewsSeries,
        initialTopPages,
        initialMetrics,
        initialAdminActivity,
        initialSentryErrors,
    ]
    );


    // Handle date range change
    const handleDateRangeChange = async (startDate: Date, endDate: Date) => {
        setIsRefreshing(true);

        // TODO: Implement date range filter via Server Actions
        // For now, just refresh the page
        router.refresh();

        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Handle export actions
    const handleExportCSV = async () => {
        try {
            const result = await exportAnalyticsCSV({
                startDate: pageviewsSeries.startDate,
                endDate: pageviewsSeries.endDate,
                granularity: pageviewsSeries.granularity,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            // Download CSV
            const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `analytics-export-${Date.now()}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Export CSV réussi");
        } catch (error) {
            toast.error("Erreur lors de l'export CSV", {
                description: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    const handleExportJSON = async () => {
        try {
            const result = await exportAnalyticsJSON({
                startDate: pageviewsSeries.startDate,
                endDate: pageviewsSeries.endDate,
                granularity: pageviewsSeries.granularity,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            // Download JSON
            const blob = new Blob([result.data], { type: "application/json;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `analytics-export-${Date.now()}.json`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Export JSON réussi");
        } catch (error) {
            toast.error("Erreur lors de l'export JSON", {
                description: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };


    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Tableau de bord analytique avec métriques de trafic et visualisations
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isRefreshing} className="flex-1 sm:flex-none">
                        Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportJSON} disabled={isRefreshing} className="flex-1 sm:flex-none">
                        Export JSON
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <AnalyticsFilters
                startDate={pageviewsSeries.startDate}
                endDate={pageviewsSeries.endDate}
                onDateRangeChange={handleDateRangeChange}
                isLoading={isRefreshing}
            />

            {/* Metrics Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Vues"
                    value={metrics.totalViews.toLocaleString()}
                    description="Nombre total de pages vues"
                    icon={<Eye className="h-4 w-4 text-muted-foreground" />}
                />

                <MetricCard
                    title="Visiteurs Uniques"
                    value={metrics.uniqueVisitors.toLocaleString()}
                    description="Visiteurs distincts"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />

                <MetricCard
                    title="Sessions"
                    value={metrics.totalSessions.toLocaleString()}
                    description="Nombre de sessions"
                    icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                />

                <MetricCard
                    title="Événement Principal"
                    value={metrics.topEventType ?? "N/A"}
                    description="Type d'événement le plus fréquent"
                    icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            {/* Pageviews Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Vues dans le Temps</CardTitle>
                    <CardDescription>
                        Évolution des vues, visiteurs et sessions (granularité: {pageviewsSeries.granularity})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PageviewsChart data={pageviewsSeries} isLoading={isRefreshing} />
                </CardContent>
            </Card>

            {/* Two-column layout for tables and cards */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Pages Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pages Populaires</CardTitle>
                        <CardDescription>Top 10 des pages les plus visitées</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TopPagesTable pages={topPages} isLoading={isRefreshing} />
                    </CardContent>
                </Card>

                {/* Admin Activity */}
                <AdminActivityCard activity={adminActivity} isLoading={isRefreshing} />
            </div>

            {/* Sentry Errors Card */}
            <SentryErrorsCard metrics={sentryErrors} isLoading={isRefreshing} />
        </div>
    );
}


