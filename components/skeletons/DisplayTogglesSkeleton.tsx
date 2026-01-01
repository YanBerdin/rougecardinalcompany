import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function DisplayTogglesSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="mt-2 h-4 w-96" />
            </div>

            <Separator />

            {/* 3 categories */}
            {[1, 2, 3].map((category) => (
                <Card key={category}>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="mt-2 h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* 4 toggles per category */}
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-64" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <Skeleton className="h-6 w-12" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
