import { fetchCompanyStats, fetchHomeAboutContent } from "@/lib/dal/home-about";
import { AboutView } from "./AboutView";
import type { StatItem, AboutContent } from "./types";
import { Users, Heart, Award } from "lucide-react";

const iconByKey: Record<string, React.ElementType> = {
  annees_experience: Users,
  spectacles_crees: Heart,
  prix_obtenus: Award,
};

export async function AboutContainer() {
  // TODO: remove - artificial delay to visualize Suspense skeletons
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const statsResult = await fetchCompanyStats();
  const records = statsResult.success ? statsResult.data : [];
  const stats: StatItem[] = records.map((r) => ({
    icon: iconByKey[r.key] ?? Users,
    value: r.value,
    label: r.label,
  }));

  const contentResult = await fetchHomeAboutContent();
  if (!contentResult.success) {
    // Fallback - ne pas casser le rendu
    console.error("[AboutContainer] Failed to fetch content");
  }
  const contentDto = contentResult.success
    ? contentResult.data
    : { title: "", intro1: "", intro2: "", imageUrl: "", missionTitle: "", missionText: "" };

  const content: AboutContent = {
    title: contentDto.title,
    intro1: contentDto.intro1,
    intro2: contentDto.intro2,
    imageUrl: contentDto.imageUrl,
    missionTitle: contentDto.missionTitle,
    missionText: contentDto.missionText,
  };

  return <AboutView stats={stats} content={content} />;
}
