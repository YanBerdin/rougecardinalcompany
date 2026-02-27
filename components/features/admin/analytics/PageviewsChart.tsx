"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { PageviewsChartProps } from "./types";

/**
 * Pageviews Chart Component
 *
 * Displays time-series chart for views, visitors, and sessions
 */
export function PageviewsChart({ data, isLoading }: PageviewsChartProps) {
    if (isLoading) {
        return (
            <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    // Format data for Recharts
    const chartData = data.data.map((point) => ({
        timestamp: point.timestamp.getTime(),
        date: format(point.timestamp, data.granularity === "hour" ? "dd/MM HH:mm" : "dd/MM/yyyy", {
            locale: fr,
        }),
        vues: point.views,
        visiteurs: point.uniqueVisitors,
        sessions: point.sessions,
    }));

    const chartConfig = {
        vues: {
            label: "Vues",
            color: "hsl(var(--chart-1))",
        },
        visiteurs: {
            label: "Visiteurs",
            color: "hsl(var(--chart-2))",
        },
        sessions: {
            label: "Sessions",
            color: "hsl(var(--chart-3))",
        },
    };

    return (
        <div role="img" aria-label="Graphique des pages vues par période">
        <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: "14px" }} />
                    <Line
                        type="monotone"
                        dataKey="vues"
                        stroke="var(--color-vues)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="visiteurs"
                        stroke="var(--color-visiteurs)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="var(--color-sessions)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    </div>
    );
}
