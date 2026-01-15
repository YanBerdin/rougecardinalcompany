"use client";

export function PartnersSkeleton() {
  return (
    <div className="relative overflow-hidden bg-background">
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          {/* En-tête skeleton */}
          <div className="text-center mb-10 md:mb-14">
            <div className="h-10 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
            <div className="h-6 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
          </div>

          {/* Bande de logos skeleton horizontale */}
          <div className="relative overflow-hidden">
            {/* Gradients de masquage */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

            {/* Rangée de rectangles animés */}
            <div className="flex gap-8 md:gap-12 lg:gap-16">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center flex-shrink-0 backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-xl p-4 animate-pulse"
                  style={{ minWidth: "150px", maxWidth: "200px", height: "80px" }}
                >
                  <div className="w-full h-12 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
