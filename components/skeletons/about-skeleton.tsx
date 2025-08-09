import { Skeleton } from "@/components/ui/skeleton";

export function AboutSkeleton() {
  return (
    <section className="py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content skeleton */}
          <div className="space-y-6">
            {/* Title skeleton */}
            <Skeleton className="h-12 w-full max-w-md" />

            {/* Paragraphs skeleton */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/5" />
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-3 gap-6 py-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center">
                  <Skeleton className="w-12 h-12 rounded-lg mx-auto mb-3" />
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>

            {/* Button skeleton */}
            <Skeleton className="h-12 w-56" />
          </div>

          {/* Image skeleton */}
          <div className="relative">
            <Skeleton className="aspect-[4/5] rounded-2xl" />

            {/* Floating card skeleton */}
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg border max-w-xs">
              <Skeleton className="h-5 w-24 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}