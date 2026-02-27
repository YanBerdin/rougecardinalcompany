import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MetricCardProps } from "./types";

/**
 * Metric Card Component
 *
 * Displays a single metric with optional trend indicator
 */
export function MetricCard({
    title,
    value,
    description,
    trend,
    icon,
}: MetricCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-xs">
                        {trend.value >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" aria-hidden="true" />
                        ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" aria-hidden="true" />
                        )}
                        <span className={trend.value >= 0 ? "text-green-500" : "text-red-500"}>
                            {Math.abs(trend.value)}%
                        </span>
                        <span className="text-muted-foreground">{trend.label}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
