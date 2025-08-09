import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function NewsSkeleton() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* News cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              {/* Image skeleton */}
              <div className="relative">
                <Skeleton className="h-48 w-full" />
                <div className="absolute top-4 left-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>

              <CardContent className="p-6">
                {/* Date skeleton */}
                <div className="flex items-center mb-3">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-32" />
                </div>

                {/* Title skeleton */}
                <Skeleton className="h-6 w-full mb-3" />

                {/* Description skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </CardContent>

              <CardFooter>
                <Skeleton className="h-10 w-32" />
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA button skeleton */}
        <div className="text-center">
          <Skeleton className="h-12 w-64 mx-auto" />
        </div>
      </div>
    </section>
  );
}