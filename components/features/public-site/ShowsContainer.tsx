"use client";

import { useShows } from './hooks';
import { ShowsList } from './ShowsList';
import { ShowsSkeleton } from '@/components/skeletons/ShowsSkeleton';

export function ShowsContainer() {
  const { shows, isLoading } = useShows();
  
  if (isLoading) {
    return <ShowsSkeleton />;
  }
  
  return <ShowsList shows={shows} />;
}
