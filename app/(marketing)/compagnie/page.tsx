import { Metadata } from "next";
import { Suspense } from "react";
import { CompagnieContainer } from "@/components/features/public-site/compagnie/CompagnieContainer";
import { CompagnieSkeleton } from "@/components/skeletons/compagnie-skeleton";

// ✅ ISR: Cache pour 60 secondes avec revalidation automatique
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Notre Compagnie | Rouge-Cardinal",
  description:
    "Découvrez l'histoire, les valeurs et l'équipe de la compagnie théâtrale Rouge-Cardinal.",
};

export default function CompagniePage() {
  return (
    <Suspense fallback={<CompagnieSkeleton />}>
      {/* Server Component */}
      {/* TODO: retirer les délais artificiels une fois l'UX validée */}
      <CompagnieContainer />
    </Suspense>
  );
}
