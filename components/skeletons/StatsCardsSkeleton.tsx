import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

/**
 * Loading skeleton for dashboard stats cards
 * Matches the structure of StatsCard component
 */
export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 whitespace-nowrap">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-4 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
