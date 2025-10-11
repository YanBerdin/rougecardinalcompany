import { Suspense } from "react";
import ContactServerGate from "./ContactServerGate";
import { ContactSkeleton } from "@/components/skeletons/contact-skeleton";

// Server container wrapping the client view, data is minimal and static here
export default async function ContactPageContainer() {
  return (
    <Suspense fallback={<ContactSkeleton />}>
      <ContactServerGate />
    </Suspense>
  );
}
