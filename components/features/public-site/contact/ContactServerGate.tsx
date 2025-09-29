import { ContactPageView } from "./ContactPageView";

// Server component that suspends to trigger Suspense fallback
export default async function ContactServerGate() {
  // Artificial delay for skeleton testing (TODO: remove)
  await new Promise((r) => setTimeout(r, 600));
  return <ContactPageView />;
}
