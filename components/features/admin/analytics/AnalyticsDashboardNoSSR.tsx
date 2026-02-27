"use client";

import dynamic from "next/dynamic";
import type { AnalyticsDashboardProps } from "./types";

/**
 * Analytics Dashboard — no SSR wrapper
 *
 * Skips server-side rendering to avoid Radix UI (Popover) and ChartContainer
 * useId() hydration mismatches between server and client.
 * Safe for admin-only pages that don't require SSR.
 */
const AnalyticsDashboardNoSSR = dynamic(
    () => import("./AnalyticsDashboard").then((mod) => mod.AnalyticsDashboard),
    { ssr: false }
);

export function AnalyticsDashboardClient(props: AnalyticsDashboardProps) {
    return <AnalyticsDashboardNoSSR {...props} />;
}
