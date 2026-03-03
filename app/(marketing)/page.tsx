import { Suspense } from "react";

// ✅ ISR: Cache pour 60 secondes avec revalidation automatique
export const revalidate = 60;

import {
  HeroContainer,
  NewsContainer,
  AboutContainer,
  ShowsContainer,
  NewsletterContainer,
  PartnersContainer,
} from "@/components/features/public-site/home";
import { HeroSkeleton } from "@/components/skeletons/hero-skeleton";
import { NewsSkeleton } from "@/components/skeletons/news-skeleton";
import { AboutSkeleton } from "@/components/skeletons/about-skeleton";
import { ShowsSkeleton } from "@/components/skeletons/shows-skeleton";
import { NewsletterSkeleton } from "@/components/skeletons/newsletter-skeleton";
import { PartnersSkeleton } from "@/components/skeletons/partners-skeleton";

export default function Home() {
  return (
    <main className="space-y-0">
      {/* Hero + Partners en overlay au bas du hero */}
      <div className="relative">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroContainer />
        </Suspense>
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <Suspense fallback={<PartnersSkeleton />}>
            <PartnersContainer />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<ShowsSkeleton />}>
        <ShowsContainer />
      </Suspense>
      <Suspense fallback={<NewsSkeleton />}>
        <NewsContainer />
      </Suspense>
      <Suspense fallback={<NewsletterSkeleton />}>
        <NewsletterContainer />
      </Suspense>
      <Suspense fallback={<AboutSkeleton />}>
        <AboutContainer />
      </Suspense>
    </main>
  );
}
