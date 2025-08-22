'use client';

export function PageSkeleton() {
  return (
    <div className="pt-16">
      {/* Hero Section Skeleton */}
      <section className="py-20 hero-gradient">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-16 bg-white/20 animate-pulse rounded mb-6 max-w-2xl mx-auto" />
          <div className="h-8 bg-white/20 animate-pulse rounded max-w-xl mx-auto" />
        </div>
      </section>

      {/* Content Section Skeleton */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
            <div className="h-6 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden border">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="h-64 md:h-full bg-muted animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted animate-pulse rounded" />
                    <div className="h-8 bg-muted animate-pulse rounded" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="flex space-x-3 mt-6">
                      <div className="h-10 bg-muted animate-pulse rounded flex-1" />
                      <div className="h-10 bg-muted animate-pulse rounded w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archives Section Skeleton */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
            <div className="h-6 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden border">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
                <div className="p-6 pt-0">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="h-6 bg-muted animate-pulse rounded mb-6 max-w-md mx-auto" />
            <div className="h-12 bg-muted animate-pulse rounded max-w-xs mx-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}