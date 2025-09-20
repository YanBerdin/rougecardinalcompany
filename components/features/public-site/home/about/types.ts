import { ReactElement } from 'react';

export interface StatItem {
  icon: React.ElementType;
  value: string;
  label: string;
}

export interface AboutContent {
  title: string;
  intro1: string;
  intro2: string;
  imageUrl: string;
  missionTitle: string;
  missionText: string;
}

export interface AboutProps {
  stats: StatItem[];
  content: AboutContent;
  isLoading?: boolean;
}
