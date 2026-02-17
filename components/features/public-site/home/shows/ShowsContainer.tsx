import { fetchFeaturedShows } from "@/lib/dal/home-shows";
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { ShowsView } from "./ShowsView";
import type { Show } from "./types";

export async function ShowsContainer() {
  // ✅ Check toggle - uses `public:home:spectacles`
  const toggleResult = await fetchDisplayToggle("display_toggle_home_spectacles");

  if (!toggleResult.success || !toggleResult.data?.value.enabled) {
    return null; // Section désactivée
  }

  const maxItems = toggleResult.data.value.max_items ?? 6;
  const result = await fetchFeaturedShows(maxItems);

  const records = result.success ? result.data : [];

  const shows: Show[] = records.map((r) => ({
    id: r.id,
    title: r.title,
    short_description: r.short_description ?? "",
    image: r.image_url ?? "",
    slug: r.slug ?? String(r.id),
    genre: r.genre ?? null,
    dates: r.dates ?? [],
  }));

  return <ShowsView shows={shows} />;
}
