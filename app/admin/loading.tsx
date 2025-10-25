export default function AdminLoading() {
  return (
    <div className="space-y-8 mt-20 animate-pulse">
      {/* header area (env/auth) */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-6 w-1/3 bg-muted rounded" />
        <div className="h-8 w-40 bg-card rounded" />
      </div>

      {/* stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 p-4 bg-card rounded flex flex-col justify-between"
          >
            <div className="h-4 w-2/3 bg-muted rounded" />
            <div className="h-8 w-1/3 bg-muted rounded mt-4" />
          </div>
        ))}
      </div>

      {/* quick actions */}
      <div className="p-4 bg-card rounded">
        <div className="h-5 w-1/4 bg-muted rounded mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded" />
          ))}
        </div>
      </div>

      {/* main content placeholder */}
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-1/4" />
        <div className="h-64 bg-card rounded" />
      </div>
    </div>
  );
}
