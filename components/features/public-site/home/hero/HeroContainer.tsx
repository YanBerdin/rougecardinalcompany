import { fetchActiveHomeHeroSlides } from "@/lib/dal/home-hero";
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { HeroClient } from "./HeroClient";
import { HeroSlide } from "./types";

export async function HeroContainer() {
  // Check display toggle
  const toggleResult = await fetchDisplayToggle("display_toggle_home_hero");
  if (!toggleResult.success || !toggleResult.data?.value?.enabled) {
    return null;
  }

  const result = await fetchActiveHomeHeroSlides();

  const records = result.success ? result.data : [];

  const slides: HeroSlide[] = records.map((r) => ({
    title: r.title,
    subtitle: r.subtitle ?? "",
    description: r.description ?? "",
    image: r.image_url ?? "",
    // CTA Primaire
    ctaPrimaryEnabled: r.cta_primary_enabled,
    ctaPrimaryLabel: r.cta_primary_label ?? undefined,
    ctaPrimaryUrl: r.cta_primary_url ?? undefined,
    // CTA Secondaire
    ctaSecondaryEnabled: r.cta_secondary_enabled,
    ctaSecondaryLabel: r.cta_secondary_label ?? undefined,
    ctaSecondaryUrl: r.cta_secondary_url ?? undefined,
  }));

  return <HeroClient initialSlides={slides} />;
}
