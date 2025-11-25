import { Suspense } from "react";
import { fetchAllHeroSlides } from "@/lib/dal/admin-home-hero";
import { HeroSlidesView } from "./HeroSlidesView";
import { HeroSlidesSkeleton } from "@/components/skeletons/HeroSlidesSkeleton";

async function HeroSlidesData() {
  const slides = await fetchAllHeroSlides();
  return <HeroSlidesView initialSlides={slides} />;
}

export function HeroSlidesContainer() {
  return (
    <Suspense fallback={<HeroSlidesSkeleton />}>
      <HeroSlidesData />
    </Suspense>
  );
}
