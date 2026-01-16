import { fetchCompanyStats, fetchHomeAboutContent } from "@/lib/dal/home-about";
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { AboutView } from "./AboutView";
import type { StatItem, AboutContent } from "./types";
import { Users, Heart, Award } from "lucide-react";

const iconByKey: Record<string, React.ElementType> = {
  annees_experience: Users,
  spectacles_crees: Heart,
  prix_obtenus: Award,
};

export async function AboutContainer() {
  // Check display toggle
  const toggleResult = await fetchDisplayToggle("display_toggle_home_about");
  if (!toggleResult.success || !toggleResult.data?.value?.enabled) {
    return null;
  }

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
