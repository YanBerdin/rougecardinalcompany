"use client";

import { useAbout } from './hooks';
import { About } from './About';
import { AboutSkeleton } from '@/components/skeletons/about-skeleton';

export function AboutContainer() {
  const { stats, isLoading } = useAbout();
  
  if (isLoading) {
    return <AboutSkeleton />;
  }
  
  return <About stats={stats} />;
}
