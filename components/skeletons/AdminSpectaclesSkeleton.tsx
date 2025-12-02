/**
 * Skeleton for the admin spectacles management table
 */
export function AdminSpectaclesSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-10 w-40 bg-card rounded animate-pulse" />
            </div>

            <div className="rounded-md border overflow-hidden">
                <div className="w-full">
                    {/* table header skeleton */}
                    <div className="grid grid-cols-7 gap-4 p-4 bg-surface">
                        <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                        <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                        <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                        <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                        <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                        <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                        <div className="h-4 bg-muted rounded col-span-1 animate-pulse text-right" />
                    </div>

                    {/* rows skeleton */}
                    <div className="space-y-3 p-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-7 gap-4 items-center p-4 bg-card rounded"
                            >
                                <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                                <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                                <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                                <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                                <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                                <div className="h-4 bg-muted rounded col-span-1 animate-pulse" />
                                <div className="flex justify-end gap-2 col-span-1">
                                    <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                                    <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                                    <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminSpectaclesSkeleton;
