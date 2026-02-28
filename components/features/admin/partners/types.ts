import type { PartnerDTO } from "@/lib/schemas/partners";

export interface PartnersViewProps {
    initialPartners: PartnerDTO[];
}

export interface SortablePartnerCardProps {
    partner: PartnerDTO;
    onEdit: (partner: PartnerDTO) => void;
    onDelete: (id: number) => void;
}

export interface PartnerFormProps {
    partner?: PartnerDTO;
}
