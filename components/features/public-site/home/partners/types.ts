export interface Partner {
  id: number;
  name: string;
  type: string;
  description: string;
  logo: string;
  website: string;
}

export interface PartnersViewProps {
  partners: Partner[];
  isLoading?: boolean;
}
