"use client";

import { ArrowRight, Pause, Play } from "lucide-react";

interface HeroNavigationProps {
  isAutoPlaying: boolean;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onPauseAutoPlay: () => void;
  onToggleAutoPlay: () => void;
}

export function HeroNavigation({
  isAutoPlaying,
  onPrevSlide,
  onNextSlide,
  onPauseAutoPlay,
  onToggleAutoPlay,
}: HeroNavigationProps) {
  return (
    <>
      {/* Bouton pause / lecture */}
      <button
        onClick={onToggleAutoPlay}
        className="absolute top-4 right-4 z-30 bg-black/30 hover:bg-black/50 text-chart-6 p-2 rounded-full transition-all duration-200 backdrop-blur-md"
        aria-label={
          isAutoPlaying
            ? "Mettre en pause le défilement automatique"
            : "Reprendre le défilement automatique"
        }
        aria-pressed={!isAutoPlaying}
      >
        {isAutoPlaying ? (
          <Pause className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Play className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Flèche précédente */}
      <button
        onClick={() => {
          onPauseAutoPlay();
          onPrevSlide();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-chart-6 p-3 rounded-full transition-all duration-200 backdrop-blur-md"
        aria-label="Diapositive précédente"
      >
        <ArrowRight className="h-6 w-6 rotate-180" aria-hidden="true" />
      </button>

      {/* Flèche suivante */}
      <button
        onClick={() => {
          onPauseAutoPlay();
          onNextSlide();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-chart-6 p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Diapositive suivante"
      >
        <ArrowRight className="h-6 w-6" aria-hidden="true" />
      </button>
    </>
  );
}
