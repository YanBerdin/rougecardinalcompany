export default function AdminTeamLoading() {
  return (
    <div className="space-y-6 mt-24 animate-pulse">
      {/* page header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-1/3 bg-muted rounded" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-card rounded" />
          <div className="h-8 w-10 bg-card rounded" />
        </div>
      </div>

      {/* filter / toggle + add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-6 w-6 bg-muted rounded-full" />
        </div>
        <div className="h-10 w-40 bg-card rounded" />
      </div>

      {/* team list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 p-4 bg-card rounded"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded" />
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
