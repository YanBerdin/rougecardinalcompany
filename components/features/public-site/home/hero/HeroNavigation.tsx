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
      {/* Flèche précédente — masquée sur mobile (navigation par swipe) */}
      <button
        onClick={() => {
          onPauseAutoPlay();
          onPrevSlide();
        }}
        className="hidden xl:block absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-chart-6 p-3 rounded-full transition-all duration-200 backdrop-blur-md"
        aria-label="Diapositive précédente"
      >
        <ArrowRight className="h-6 w-6 rotate-180" aria-hidden="true" />
      </button>

      {/* Flèche suivante — masquée sur mobile (navigation par swipe) */}
      <button
        onClick={() => {
          onPauseAutoPlay();
          onNextSlide();
        }}
        className="hidden xl:block absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-chart-6 p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Diapositive suivante"
      >
        <ArrowRight className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Bouton pause/lecture — discret, bas droite, au-dessus de la barre de progression */}
      <button
        onClick={onToggleAutoPlay}
        className="absolute bottom-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-chart-6/60 hover:text-chart-6 p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label={isAutoPlaying ? "Mettre en pause le diaporama" : "Reprendre le diaporama"}
        aria-pressed={!isAutoPlaying}
      >
        {isAutoPlaying ? (
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
