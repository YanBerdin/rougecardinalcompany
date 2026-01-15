"use client";

function SkeletonRow() {
    return (
        <div className="flex overflow-hidden mb-4 md:mb-6">
            <div className="flex gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-center flex-shrink-0 backdrop-blur-sm bg-white/10 dark:bg-black/20 border border-border/30 rounded-xl px-6 py-4 animate-pulse"
                        style={{ minWidth: "180px", height: "80px" }}
                    >
                        <div className="w-full h-12 bg-muted/50 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function PartnersSkeleton() {
    return (
        <section className="relative overflow-hidden bg-background py-16 md:py-20 lg:py-24">
            {/* En-tête skeleton */}
            <div className="max-w-7xl mx-auto px-6 text-center mb-12 md:mb-16">
                <div className="inline-flex h-6 w-32 bg-muted/30 animate-pulse rounded-full mb-6" />
                <div className="h-12 bg-muted animate-pulse rounded mb-6 max-w-md mx-auto" />
                <div className="h-6 bg-muted/70 animate-pulse rounded max-w-2xl mx-auto" />
            </div>

            {/* Marquee skeleton avec masque */}
            <div
                className="relative"
                style={{
                    maskImage:
                        "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                    WebkitMaskImage:
                        "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                }}
            >
                <SkeletonRow />
                <SkeletonRow />
            </div>

            {/* Message skeleton */}
            <div className="text-center mt-10 md:mt-14">
                <div className="h-4 bg-muted/50 animate-pulse rounded max-w-xs mx-auto" />
            </div>
        </section>
    );
}
