import type { ReactNode } from "react";
import type {
    PageviewsSeries,
    TopPages,
    MetricsSummary,
    AdminActivitySummary,
    SentryErrorMetrics,
} from "@/lib/schemas/analytics";

/**
 * Props for AnalyticsDashboard component
 */
export interface AnalyticsDashboardProps {
    initialPageviewsSeries: PageviewsSeries;
    initialTopPages: TopPages;
    initialMetrics: MetricsSummary;
    initialAdminActivity: AdminActivitySummary;
    initialSentryErrors: SentryErrorMetrics;
}

/**
 * Props for MetricCard component
 */
export interface MetricCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: {
        value: number;
        label: string;
    };
    icon?: ReactNode;
}

/**
 * Props for PageviewsChart component
 */
export interface PageviewsChartProps {
    data: PageviewsSeries;
    isLoading?: boolean;
}

/**
 * Props for TopPagesTable component
 */
export interface TopPagesTableProps {
    pages: TopPages;
    isLoading?: boolean;
}

/**
 * Props for AnalyticsFilters component
 */
export interface AnalyticsFiltersProps {
    startDate: Date;
    endDate: Date;
    onDateRangeChange: (startDate: Date, endDate: Date) => void;
    isLoading?: boolean;
}

/**
 * Props for SentryErrorsCard component
 */
export interface SentryErrorsCardProps {
    metrics: SentryErrorMetrics;
    isLoading?: boolean;
}

/**
 * Props for AdminActivityCard component
 */
export interface AdminActivityCardProps {
    activity: AdminActivitySummary;
    isLoading?: boolean;
}
