import { Skeleton } from "@/components/ui/skeleton";

export function NewsletterSkeleton() {
  return (
    <section className="py-16 hero-gradient">
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-x-8 lg:gap-y-6 lg:grid-cols-[3fr_2fr] px-4">
        {/* Colonne gauche */}
        <div className="flex gap-6 mx-auto">
          <div className="flex flex-col items-center lg:items-start">
            <Skeleton className="h-5 w-24 bg-white/20 mb-2" />
            <Skeleton className="h-12 w-72 lg:w-96 bg-white/25" />
            <div className="h-px w-24 xl:w-72 bg-white/40 my-6" />
          </div>
        </div>

        {/* Colonne droite */}
        <div className="flex mx-auto items-start text-center lg:text-left lg:mt-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Skeleton className="h-10 flex-1 bg-white/15" />
              <Skeleton className="h-10 w-24 bg-white/20" />
            </div>
            <Skeleton className="h-4 w-64 mx-auto lg:mx-0 mt-4 bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
