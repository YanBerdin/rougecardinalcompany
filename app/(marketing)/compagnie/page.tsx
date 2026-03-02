import { Metadata } from "next";
import { Suspense } from "react";
import { CompagnieContainer } from "@/components/features/public-site/compagnie/CompagnieContainer";
import { CompagnieSkeleton } from "@/components/skeletons/compagnie-skeleton";

// ✅ force-dynamic: page utilise createClient() Supabase SSR (cookies)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Notre Compagnie | Rouge-Cardinal",
  description:
    "Découvrez l'histoire, les valeurs et l'équipe de la compagnie théâtrale Rouge-Cardinal.",
};

export default function CompagniePage() {
  return (
    <Suspense fallback={<CompagnieSkeleton />}>
      <CompagnieContainer />
    </Suspense>
  );
}
