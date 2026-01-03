import { fetchFeaturedPressReleases } from "@/lib/dal/home-news";
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { NewsView } from "./NewsView";
import type { NewsItem } from "./types";

export async function NewsContainer() {
  // TODO: remove - artificial delay to visualize Suspense skeletons
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // ✅ Check toggle
  const toggleResult = await fetchDisplayToggle("display_toggle_home_a_la_une");

  if (!toggleResult.success || !toggleResult.data?.value.enabled) {
    return null; // Section désactivée
  }

  const maxItems = toggleResult.data.value.max_items ?? 3;
  const result = await fetchFeaturedPressReleases(maxItems);

  const rows = result.success ? result.data : [];

  const news: NewsItem[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    short_description: r.description ?? "",
    date: r.date_publication,
    image: r.image_url ?? "",
    category: "Presse",
  }));

  if (news.length === 0) {
    return null;
  }

  return <NewsView news={news} />;
}
