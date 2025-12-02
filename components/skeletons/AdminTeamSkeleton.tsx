export function AdminTeamSkeleton() {
    return (

        <div className="space-y-6">
            <div>
                <div className="h-8 w-64 bg-muted rounded animate-pulse" />
                <div className="h-4 w-96 bg-muted rounded mt-2 animate-pulse" />
            </div>

            {/* header: left placeholder (empty in real component) + checkbox area on right */}
            <div className="flex items-center gap-4 justify-between">
                <div className="h-8 w-1/4 bg-transparent" />
                <div className="flex items-center gap-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-6 w-6 bg-muted rounded-full" />
                </div>
            </div>

            {/* add button row (aligned right in real component) */}
            <div className="flex justify-end">
                <div className="h-10 w-40 bg-card rounded" />
            </div>

            {/* team cards grid - mirrors TeamMember cards layout */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="p-6 bg-card rounded h-full animate-pulse flex flex-col justify-between"
                    >
                        <div>
                            <div className="h-5 w-48 bg-muted rounded" />
                            <div className="mt-4 flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-muted" />
                                <div className="space-y-2">
                                    <div className="h-3 w-64 bg-muted rounded" />
                                    <div className="h-3 w-40 bg-muted rounded" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <div className="h-8 w-20 bg-muted rounded" />
                            <div className="h-8 w-20 bg-muted rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* pagination / actions placeholder */}
            <div className="flex justify-end">
                <div className="h-10 w-32 bg-card rounded" />
            </div>
        </div>
    );
}

export default AdminTeamSkeleton;
