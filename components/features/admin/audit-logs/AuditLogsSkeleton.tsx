import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AuditLogsSkeleton() {
    return (
        <Card className="p-6">
            <div className="mb-4 grid gap-4 md:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                ))}
            </div>
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                ))}
            </div>
            <div className="mt-4 flex justify-center">
                <Skeleton className="h-10 w-64" />
            </div>
        </Card>
    );
}
