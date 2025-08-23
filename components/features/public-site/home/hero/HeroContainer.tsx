"use client";

import { useHero } from './hooks';
import { HeroView } from './HeroView';
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
        <HeroView
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
