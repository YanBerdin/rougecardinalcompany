import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSlidesSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Slides list skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-5 w-5" /> {/* Drag handle */}
                <Skeleton className="h-16 w-24 rounded" /> {/* Image */}
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-64" /> {/* Title */}
                  <Skeleton className="h-4 w-48" /> {/* Subtitle */}
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-md" /> {/* Edit button */}
                <Skeleton className="h-9 w-9 rounded-md" /> {/* Delete button */}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
