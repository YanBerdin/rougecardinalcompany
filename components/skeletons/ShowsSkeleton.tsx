import React from "react";

export function ShowsSkeleton() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
          <div className="h-6 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
                <div className="flex space-x-2">
                  <div className="h-10 bg-muted animate-pulse rounded flex-1" />
                  <div className="h-10 bg-muted animate-pulse rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
