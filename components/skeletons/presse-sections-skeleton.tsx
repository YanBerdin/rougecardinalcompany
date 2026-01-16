export function MediaKitSkeleton() {
    return (
        <section className="container py-16">
            <div className="mb-8">
                <div className="h-10 w-48 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg border p-6 space-y-3">
                        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </section>
    );
}

export function PressReleasesSkeleton() {
    return (
        <section className="container py-16">
            <div className="mb-8">
                <div className="h-10 w-64 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg border overflow-hidden">
                        <div className="h-48 bg-muted animate-pulse" />
                        <div className="p-6 space-y-3">
                            <div className="h-6 w-full bg-muted rounded animate-pulse" />
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function MediaArticlesSkeleton() {
    return (
        <section className="container py-16">
            <div className="mb-8">
                <div className="h-10 w-56 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-lg border p-6 space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </section>
    );
}
