"use client";

import { HeroProps } from "./types";
import { HeroSlideBackground } from "./HeroSlideBackground";
import { HeroCTA } from "./HeroCTA";
import { HeroNavigation } from "./HeroNavigation";
import { HeroProgressBar } from "./HeroProgressBar";

export function HeroView({
  slides,
  currentSlide,
  isAutoPlaying,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  onPauseAutoPlay,
  onToggleAutoPlay,
  onKeyDown,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: HeroProps) {
  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Diaporama des spectacles à l'affiche"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="relative h-svh flex items-center justify-center overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-gold/60 pb-36 sm:pb-44 md:pb-44"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onTouchStart}
      onMouseMove={onTouchMove}
      onMouseUp={onTouchEnd}
      onMouseLeave={onTouchEnd}
    >
      <HeroSlideBackground slides={slides} currentSlide={currentSlide} />
      <HeroNavigation
        isAutoPlaying={isAutoPlaying}
        onPrevSlide={onPrevSlide}
        onNextSlide={onNextSlide}
        onPauseAutoPlay={onPauseAutoPlay}
        onToggleAutoPlay={onToggleAutoPlay}
      />
      <HeroCTA slide={slides[currentSlide]} />
      <HeroProgressBar isAutoPlaying={isAutoPlaying} />
    </section>
  );
}
