import { Suspense } from "react";

// ✅ force-dynamic: page utilise cookies() via createClient() (Supabase SSR)
// ISR (revalidate=60) était incompatible avec Supabase SSR cookies en Next.js 16
// et causait des race conditions sur les caches ISR lors des toggles.
export const dynamic = "force-dynamic";

import {
  HeroContainer,
  NewsContainer,
  AboutContainer,
  ShowsContainer,
  NewsletterContainer,
  PartnersContainer,
  HomeTeamContainer,
} from "@/components/features/public-site/home";
import { HeroSkeleton } from "@/components/skeletons/hero-skeleton";
import { NewsSkeleton } from "@/components/skeletons/news-skeleton";
import { AboutSkeleton } from "@/components/skeletons/about-skeleton";
import { ShowsSkeleton } from "@/components/skeletons/shows-skeleton";
import { NewsletterSkeleton } from "@/components/skeletons/newsletter-skeleton";
import { HomeTeamSkeleton } from "@/components/skeletons/home-team-skeleton";

export default function Home() {
  return (
    <main className="space-y-0">
      {/* Hero + Partners en overlay au bas du hero */}
      <div className="relative">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroContainer />
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <PartnersContainer />
          </div>
        </Suspense>
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
      <Suspense fallback={<HomeTeamSkeleton />}>
        <HomeTeamContainer />
      </Suspense>
      <Suspense fallback={<AboutSkeleton />}>
        <AboutContainer />
      </Suspense>
    </main>
  );
}
