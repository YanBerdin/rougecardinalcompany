import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { NewsletterClientContainer } from "./NewsletterClientContainer";

export async function NewsletterContainer() {
  // TODO: remove - artificial delay to visualize Suspense skeletons
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // ✅ Check toggle
  const toggleResult = await fetchDisplayToggle("display_toggle_home_newsletter");

  if (!toggleResult.success || !toggleResult.data?.value.enabled) {
    return null; // Section désactivée
  }

  return <NewsletterClientContainer />;
}
