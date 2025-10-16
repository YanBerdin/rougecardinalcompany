import { Metadata } from "next";
import AgendaContainer from "@/components/features/public-site/agenda/AgendaContainer";
import { Suspense } from "react";
import { AgendaSkeleton } from "@/components/skeletons/agenda-skeleton";

export const metadata: Metadata = {
  title: "Agenda | Rouge-Cardinal",
  description:
    "Retrouvez tous les événements, spectacles et ateliers de la compagnie Rouge-Cardinal.",
};

export default function AgendaPage() {
  return (
    <Suspense fallback={<AgendaSkeleton />}>
      {/* Server Component */}
      <AgendaContainer />
    </Suspense>
  );
}
