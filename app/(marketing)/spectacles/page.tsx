import { Metadata } from "next";
import { SpectaclesContainer } from "@/components/features/public-site/spectacles/SpectaclesContainer";
import { Suspense } from "react";
import { SpectaclesSkeleton } from "@/components/skeletons/spectacles-skeleton";

// ✅ ISR: Cache pour 60 secondes avec revalidation automatique
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Spectacles | Rouge-Cardinal",
  description:
    "Découvrez tous les spectacles de la compagnie Rouge-Cardinal, créations actuelles et archives.",
};

export default function SpectaclesPage() {
  return (
    <Suspense fallback={<SpectaclesSkeleton />}>
      <SpectaclesContainer />
    </Suspense>
  );
}
