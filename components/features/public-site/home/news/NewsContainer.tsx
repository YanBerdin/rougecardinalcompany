import { fetchFeaturedArticles } from "@/lib/dal/home-news";
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { NewsView } from "./NewsView";
import type { NewsItem } from "./types";

export async function NewsContainer() {
  // ✅ Check toggle
  const toggleResult = await fetchDisplayToggle("display_toggle_home_a_la_une");

  if (!toggleResult.success || !toggleResult.data?.value.enabled) {
    return null; // Section désactivée
  }

  const maxItems = toggleResult.data.value.max_items ?? 3;
  const result = await fetchFeaturedArticles(maxItems);

  const rows = result.success ? result.data : [];

  const news: NewsItem[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    short_description: r.chapo ?? r.excerpt ?? "",
    date: r.published_at,
    image: r.image_url ?? "",
    source_url: r.source_url ?? "",
    source_publication: r.source_publication ?? "",
    category: "Presse",
  }));

  if (news.length === 0) {
    return null;
  }

  return <NewsView news={news} />;
}
