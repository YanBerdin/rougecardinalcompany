import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background skeleton */}
      <div className="absolute inset-0">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content skeleton */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Title skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-16 md:h-20 w-full max-w-3xl mx-auto bg-white/20" />
            <Skeleton className="h-8 md:h-10 w-3/4 mx-auto bg-white/15" />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <Skeleton className="h-6 w-full bg-white/10" />
            <Skeleton className="h-6 w-4/5 mx-auto bg-white/10" />
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Skeleton className="h-12 w-48 bg-white/15" />
            <Skeleton className="h-12 w-56 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Navigation arrows skeleton */}
      <Skeleton className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/20" />
      <Skeleton className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/20" />

      {/* Indicators skeleton */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        <Skeleton className="w-3 h-3 rounded-full bg-white/30" />
        <Skeleton className="w-3 h-3 rounded-full bg-white/20" />
      </div>

      {/* Progress bar skeleton */}
      <div className="absolute bottom-0 left-0 right-0 h-1">
        <Skeleton className="h-full w-full bg-white/20" />
      </div>
    </section>
  );
}