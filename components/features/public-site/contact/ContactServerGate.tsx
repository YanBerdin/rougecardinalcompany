import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { ContactPageView } from "./ContactPageView";

// Server component that suspends to trigger Suspense fallback
export default async function ContactServerGate() {
  // Artificial delay for skeleton testing (TODO: remove)
  await new Promise((r) => setTimeout(r, 600));
  
  const newsletterToggleResult = await fetchDisplayToggle("display_toggle_contact_newsletter");
  const showNewsletter = newsletterToggleResult.success &&
    newsletterToggleResult.data?.value?.enabled !== false;
  
  return <ContactPageView showNewsletter={showNewsletter} />;
}
