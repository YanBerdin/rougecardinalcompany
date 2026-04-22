import { Skeleton } from "@/components/ui/skeleton";

export function HomeTeamSkeleton() {
  return (
    <section className="max-sm:py-12 py-24 bg-chart-7">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-4 lg:px-4">
        <div className="text-center max-sm:mb-8 mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-16">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.5rem)] lg:w-[calc(25%-1.5rem)] xl:w-[calc(19%-1.5rem)] flex flex-col items-center gap-3"
            >
              <Skeleton className="w-32 h-32 rounded-full" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
