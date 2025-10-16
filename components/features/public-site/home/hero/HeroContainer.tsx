import { fetchActiveHomeHeroSlides } from "@/lib/dal/home-hero";
import { HeroClient } from "./HeroClient";
import { HeroSlide } from "./types";

export async function HeroContainer() {
  // TODO: remove - artificial delay to visualize Suspense skeletons
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const records = await fetchActiveHomeHeroSlides();

  const slides: HeroSlide[] = (records ?? []).map((r) => ({
    title: r.title,
    subtitle: r.subtitle ?? "",
    description: r.description ?? "",
    image: r.image_url ?? "",
    cta: r.cta_label ?? "",
    ctaUrl: r.cta_url ?? "#",
  }));

  return <HeroClient initialSlides={slides} />;
}
