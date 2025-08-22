"use client";

export function ContactSkeleton() {
    return (
        <section className="py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
                    <div className="h-5 bg-muted animate-pulse rounded max-w-xs mx-auto" />
                </div>
                <div className="bg-card rounded-2xl p-8 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Formulaire côté gauche */}
                        <div>
                            <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-4" />
                            <div className="h-10 bg-muted animate-pulse rounded mb-6" />
                            <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-4" />
                            <div className="h-10 bg-muted animate-pulse rounded mb-6" />
                            <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-4" />
                            <div className="h-24 bg-muted animate-pulse rounded mb-6" />
                            <div className="h-10 bg-muted animate-pulse rounded w-1/3 mx-auto" />
                        </div>
                        {/* Infos de contact côté droit */}
                        <div className="space-y-6">
                            <div className="h-4 bg-muted animate-pulse rounded w-1/3 mb-2" />
                            <div className="h-4 bg-muted animate-pulse rounded w-2/3 mb-4" />
                            <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-2" />
                            <div className="h-4 bg-muted animate-pulse rounded w-1/3 mb-4" />
                            <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-2" />
                            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
