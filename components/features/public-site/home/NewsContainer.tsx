"use client";

import { useNews } from './hooks';
import { NewsList } from './NewsList';
import { NewsSkeleton } from '@/components/skeletons/news-skeleton';

export function NewsContainer() {
  const { news, isLoading } = useNews();
  
  if (isLoading) {
    return <NewsSkeleton />;
  }
  
  // Si pas d'actualités à la une, ne pas afficher la section
  if (news.length === 0) {
    return null;
  }
  
  return <NewsList news={news} />;
}
