'use client';

export function CompagnieSkeleton() {
    return (
        <div className="pt-16">
            {/* Hero Section Skeleton */}
            <section className="py-20 hero-gradient">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="h-16 bg-white/20 animate-pulse rounded mb-6 max-w-2xl mx-auto" />
                    <div className="h-8 bg-white/20 animate-pulse rounded max-w-xl mx-auto" />
                </div>
            </section>

            {/* Histoire Section Skeleton */}
            <section className="py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                        <div>
                            <div className="h-10 bg-muted animate-pulse rounded mb-6 w-1/3" />
                            <div className="space-y-4">
                                <div className="h-5 bg-muted animate-pulse rounded w-full" />
                                <div className="h-5 bg-muted animate-pulse rounded w-full" />
                                <div className="h-5 bg-muted animate-pulse rounded w-5/6" />
                                <div className="h-5 bg-muted animate-pulse rounded w-full" />
                                <div className="h-5 bg-muted animate-pulse rounded w-4/5" />
                                <div className="h-5 bg-muted animate-pulse rounded w-full" />
                                <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                            </div>
                        </div>
                        <div>
                            <div className="aspect-[8/5] rounded-2xl bg-muted animate-pulse shadow-xl" />
                        </div>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-8 mb-16">
                        <div className="flex items-start space-x-4">
                            <div className="h-8 w-8 bg-primary/50 animate-pulse rounded-full flex-shrink-0 mt-1" />
                            <div className="space-y-4 w-full">
                                <div className="h-5 bg-muted animate-pulse rounded w-full" />
                                <div className="h-5 bg-muted animate-pulse rounded w-4/5" />
                                <div className="h-5 bg-muted animate-pulse rounded w-2/3" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Valeurs Section Skeleton */}
            <section className="py-20 bg-muted/30">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-xs mx-auto" />
                        <div className="h-6 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-card rounded-lg border p-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-primary/10 animate-pulse rounded-lg mb-4 flex items-center justify-center">
                                        <div className="h-8 w-8 bg-primary/40 animate-pulse rounded" />
                                    </div>
                                    <div className="h-6 bg-muted animate-pulse rounded mb-3 w-1/2" />
                                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                    <div className="h-4 bg-muted animate-pulse rounded w-4/5 mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Équipe Section Skeleton */}
            <section className="py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-xs mx-auto" />
                        <div className="h-6 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-card rounded-lg overflow-hidden border">
                                <div className="h-64 bg-muted animate-pulse" />
                                <div className="p-6 space-y-3">
                                    <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                                    <div className="h-5 bg-primary/20 animate-pulse rounded w-1/2" />
                                    <div className="space-y-2">
                                        <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                        <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                        <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section Skeleton */}
            <section className="py-20 hero-gradient">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="h-10 bg-white/20 animate-pulse rounded mb-6 max-w-xs mx-auto" />
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <div className="h-5 bg-white/20 animate-pulse rounded w-full" />
                        <div className="h-5 bg-white/20 animate-pulse rounded w-full" />
                        <div className="h-5 bg-white/20 animate-pulse rounded w-5/6" />
                        <div className="h-5 bg-white/20 animate-pulse rounded w-full" />
                        <div className="h-5 bg-white/20 animate-pulse rounded w-4/5" />
                    </div>
                </div>
            </section>
        </div>
    );
}
