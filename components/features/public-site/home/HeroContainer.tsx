"use client";

import { useHero } from './hooks';
import { Hero } from './Hero';
import { HeroSkeleton } from '@/components/skeletons/hero-skeleton';

export function HeroContainer() {
  const { 
    slides,
    currentSlide,
    isAutoPlaying,
    isLoading,
    nextSlide,
    prevSlide,
    goToSlide,
    pauseAutoPlay,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useHero();
  
  if (isLoading) {
    return <HeroSkeleton />;
  }
  
  return (
    <Hero
      slides={slides}
      currentSlide={currentSlide}
      isAutoPlaying={isAutoPlaying}
      onPrevSlide={prevSlide}
      onNextSlide={nextSlide}
      onGoToSlide={goToSlide}
      onPauseAutoPlay={pauseAutoPlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}
