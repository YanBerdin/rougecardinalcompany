import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatsCardsSkeleton } from "@/components/skeletons/StatsCardsSkeleton";

/**
 * Skeleton placeholder for the full admin dashboard page
 * - title + subtitle
 * - stats cards (reuses existing StatsCardsSkeleton)
 * - quick actions card with placeholder buttons
 */
export function AdminDashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div>
                <div className="h-8 w-64 bg-muted rounded animate-pulse" />
                <div className="h-4 w-96 bg-muted rounded mt-2 animate-pulse" />
            </div>

            {/* stats */}
            <StatsCardsSkeleton />

            {/* quick actions skeleton */}
            <Card className="animate-pulse">
                <CardHeader>
                    <div className="h-5 w-48 bg-muted rounded" />
                    <div className="h-4 w-72 bg-muted rounded mt-2" />
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center gap-2 py-6 border border-transparent"
                        >
                            <div className="h-10 w-10 rounded-full bg-muted" />
                            <div className="h-4 w-28 bg-muted rounded mt-2" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default AdminDashboardSkeleton;
