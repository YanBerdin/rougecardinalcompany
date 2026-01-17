import type { Metadata } from "next";
import { AnalyticsContainer } from "../../../../components/features/admin/analytics/AnalyticsContainer";

export const metadata: Metadata = {
    title: "Analytics | Admin | Rouge Cardinal Company",
    description: "Tableau de bord analytique avec métriques de trafic et visualisations temps-série",
};

/**
 * Analytics Dashboard Page
 *
 * Force dynamic rendering for real-time analytics data
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AnalyticsPage() {
    return <AnalyticsContainer />;
}
