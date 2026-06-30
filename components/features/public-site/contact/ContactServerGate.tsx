import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { fetchFooterConfig } from "@/lib/dal/footer-config";
import { FOOTER_DEFAULTS } from "@/lib/schemas/footer-config";
import { ContactPageView } from "./ContactPageView";
import { ContactInfoSidebar } from "./ContactInfoSidebar";
import { NewsletterCard } from "./NewsletterCard";

// Server component that suspends to trigger Suspense fallback
export default async function ContactServerGate() {
  const [newsletterToggleResult, footerConfigResult] = await Promise.all([
    fetchDisplayToggle("display_toggle_contact_newsletter"),
    fetchFooterConfig(),
  ]);

  const showNewsletter =
    newsletterToggleResult.success &&
    newsletterToggleResult.data?.value?.enabled !== false;

  const contact =
    footerConfigResult.success && footerConfigResult.data
      ? footerConfigResult.data.contact
      : FOOTER_DEFAULTS.contact;

  const sidebar = (
    <ContactInfoSidebar contactInfo={contact}>
      {showNewsletter && <NewsletterCard />}
    </ContactInfoSidebar>
  );

  return <ContactPageView sidebar={sidebar} />;
}
