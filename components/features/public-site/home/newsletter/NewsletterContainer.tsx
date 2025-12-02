import { fetchNewsletterSettings } from "@/lib/dal/home-newsletter";
import { NewsletterClientContainer } from "./NewsletterClientContainer";

export async function NewsletterContainer() {
  // TODO: remove - artificial delay to visualize Suspense skeletons
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const result = await fetchNewsletterSettings();

  // Default to enabled if fetch fails or returns enabled
  const settings = result.success ? result.data : { enabled: true };
  if (!settings.enabled) return null;

  return <NewsletterClientContainer />;
}
