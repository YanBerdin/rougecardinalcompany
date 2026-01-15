import type { Partner as LogoCloudPartner } from "@/components/LogoCloud/types";

// Réutiliser le type Partner de LogoCloud
export type Partner = LogoCloudPartner;

export interface PartnersViewProps {
  partners: Partner[];
  isLoading?: boolean;
}
