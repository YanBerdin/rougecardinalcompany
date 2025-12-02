import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AboutContentSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
            </div>

            {/* Form skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Title field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Intro paragraphs */}
                    {[1, 2].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ))}

                    {/* Mission section */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-32 w-full" />
                    </div>

                    {/* Image section */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex gap-4">
                            <Skeleton className="h-32 w-48 rounded" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
