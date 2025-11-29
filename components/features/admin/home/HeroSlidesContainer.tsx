import { Suspense } from "react";
import { fetchAllHeroSlides } from "@/lib/dal/admin-home-hero";
import { HeroSlidesView } from "./HeroSlidesView";
import { HeroSlidesSkeleton } from "@/components/skeletons/HeroSlidesSkeleton";

async function HeroSlidesData() {
  const result = await fetchAllHeroSlides();

  if (!result.success) {
    return (
      <div className="text-center text-destructive py-8">
        Error: {result.error}
      </div>
    );
  }

  return <HeroSlidesView initialSlides={result.data} />;
}

export function HeroSlidesContainer() {
  return (
    <Suspense fallback={<HeroSlidesSkeleton />}>
      <HeroSlidesData />
    </Suspense>
  );
}
