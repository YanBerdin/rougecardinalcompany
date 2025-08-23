import { ReactElement } from 'react';

export interface StatItem {
  icon: React.ElementType;
  value: string;
  label: string;
}

export interface AboutProps {
  stats: StatItem[];
  isLoading?: boolean;
}
