"use client";

import { LogoCloud } from "@/components/LogoCloud";
import type { PartnersViewProps } from "./types";
import { PartnersSkeleton } from "@/components/skeletons/partners-skeleton";

export function PartnersView({ partners, isLoading }: PartnersViewProps) {
  if (isLoading) {
    return <PartnersSkeleton />;
  }

  return (
    <div className="relative overflow-hidden bg-background">
      <LogoCloud
        partners={partners}
        title="Nos Partenaires"
        subtitle="Ils nous accompagnent et soutiennent notre démarche artistique"
        speed="normal"
        pauseOnHover={true}
        linkable={true}
      />
    </div>
  );
}

