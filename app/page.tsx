//import { DeployButton } from "@/components/deploy-button";
//import { EnvVarWarning } from "@/components/env-var-warning";
//import { AuthButton } from "@/components/auth-button";
//import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
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
import { PartnersSkeleton } from "@/components/skeletons/partners-skeleton";
import { NewsletterSkeleton } from "@/components/skeletons/newsletter-skeleton";

export default function Home() {
  return (
    <main className="space-y-0">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroContainer />
      </Suspense>
      <Suspense fallback={<NewsSkeleton />}>
        <NewsContainer />
      </Suspense>
      <Suspense fallback={<AboutSkeleton />}>
        <AboutContainer />
      </Suspense>
      <Suspense fallback={<ShowsSkeleton />}>
        <ShowsContainer />
      </Suspense>
      <Suspense fallback={<NewsletterSkeleton />}>
        <NewsletterContainer />
      </Suspense>
      <Suspense fallback={<PartnersSkeleton />}>
        <PartnersContainer />
      </Suspense>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Next steps</h2>
            {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
          </main>
        </div>
      </div>
    </main>
  );
}
