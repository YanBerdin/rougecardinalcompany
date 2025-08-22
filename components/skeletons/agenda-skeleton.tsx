"use client";

export function AgendaSkeleton() {
    return (
        <section className="py-20">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
                    <div className="h-5 bg-muted animate-pulse rounded max-w-xs mx-auto" />
                </div>
                <div className="space-y-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-xl p-6 shadow flex flex-col md:flex-row gap-6 animate-fade-in-up">
                            <div className="h-32 w-full md:w-48 bg-muted animate-pulse rounded-lg" />
                            <div className="flex-1 space-y-4">
                                <div className="h-6 bg-muted animate-pulse rounded w-2/3" />
                                <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                                <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
