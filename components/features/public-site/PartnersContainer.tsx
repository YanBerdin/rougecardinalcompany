"use client";

import { PartnersList } from './PartnersList';
import { usePartners } from './hooks';

export function PartnersContainer() {
  const { partners, isLoading } = usePartners();
  
  return (
    <PartnersList partners={partners} isLoading={isLoading} />
  );
}
