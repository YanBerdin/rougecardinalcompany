import { fetchActivePartners } from "@/lib/dal/home-partners";
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { PartnersView } from "./PartnersView";
import type { Partner } from "./types";

export async function PartnersContainer() {
  // TODO: remove - artificial delay to visualize Suspense skeletons
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // ✅ Check toggle
  const toggleResult = await fetchDisplayToggle("display_toggle_home_partners");

  if (!toggleResult.success || !toggleResult.data?.value.enabled) {
    return null; // Section désactivée
  }

  const maxItems = toggleResult.data.value.max_items ?? 12;
  const result = await fetchActivePartners(maxItems);

  const records = result.success ? result.data : [];

  const partners: Partner[] = records.map((r) => ({
    id: Number(r.id),
    name: r.name,
    logo: r.logo_url ?? "",
    website: r.website_url ?? undefined,
  }));

  return <PartnersView partners={partners} isLoading={false} />;
}
