"use client";

import { PartnersView } from './PartnersView';
import { usePartners } from './hooks';

export function PartnersContainer() {
    const { partners, isLoading } = usePartners();

    return (
        <PartnersView partners={partners} isLoading={isLoading} />
    );
}
