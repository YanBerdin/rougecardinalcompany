import { Skeleton } from "@/components/ui/skeleton";

export function NewsletterSkeleton() {
    return (
        <section className="py-20 hero-gradient">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="space-y-8">
                    {/* Icon skeleton */}
                    <Skeleton className="h-12 w-12 mx-auto bg-white/20" />

                    {/* Title skeleton */}
                    <Skeleton className="h-10 w-48 mx-auto bg-white/20" />

                    {/* Description skeleton */}
                    <div className="space-y-3 max-w-2xl mx-auto">
                        <Skeleton className="h-6 w-full bg-white/15" />
                        <Skeleton className="h-6 w-4/5 mx-auto bg-white/15" />
                    </div>

                    {/* Form skeleton */}
                    <div className="max-w-md mx-auto">
                        <div className="flex gap-3">
                            <Skeleton className="h-12 flex-1 bg-white/15" />
                            <Skeleton className="h-12 w-24 bg-white/20" />
                        </div>
                        <Skeleton className="h-4 w-64 mx-auto mt-4 bg-white/10" />
                    </div>
                </div>
            </div>
        </section>
    );
}
