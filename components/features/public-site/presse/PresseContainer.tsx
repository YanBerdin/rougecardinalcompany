import { Suspense } from "react";
import { PresseSkeleton } from "@/components/skeletons/presse-skeleton";
import PresseServerGate from "./PresseServerGate";

// Server Container: orchestre les fetch DAL et le rendu Client via un gate
export default function PresseContainer() {
  return (
    <Suspense fallback={<PresseSkeleton />}>
      {/* Gate serveur avec petit délai artificiel // TODO: remove */}
      <PresseServerGate />
    </Suspense>
  );
}
