"use client";

import { HeroSlide } from "./types";

interface HeroIndicatorsProps {
  slides: HeroSlide[];
  currentSlide: number;
  onPauseAutoPlay: () => void;
  onGoToSlide: (index: number) => void;
}

export function HeroIndicators({
  slides,
  currentSlide,
  onPauseAutoPlay,
  onGoToSlide,
}: HeroIndicatorsProps) {
  return (
    <>
      {/* Annonce live pour lecteurs d'écran */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Diapositive ${currentSlide + 1} sur ${slides.length} : ${slides[currentSlide]?.title ?? ""}`}
      </div>

      {/* Points de navigation */}
      <div
        role="group"
        aria-label="Sélectionner une diapositive"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20"
      >
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => {
              onPauseAutoPlay();
              onGoToSlide(index);
            }}
            aria-label={`Diapositive ${index + 1}${slide.title ? ` : ${slide.title}` : ""}`}
            aria-current={index === currentSlide ? "true" : undefined}
            className="touch-hitbox overflow-hidden"
          >
            <span
              className={`block w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? "bg-chart-6 scale-110"
                  : "bg-chart-6/50 hover:bg-chart-6/75 scale-95"
              }`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      {/* Indication de swipe — décoratif, masqué pour réducteurs de mouvement */}
      <div
        className="absolute bottom-8 right-8 text-chart-6/70 text-sm hidden sm:block"
        aria-hidden="true"
      >
        <div className="flex items-center space-x-2">
          <span>Glissez pour naviguer</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-chart-6/50 rounded-full motion-safe:animate-pulse" />
            <div
              className="w-2 h-2 bg-chart-6/50 rounded-full motion-safe:animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 bg-chart-6/50 rounded-full motion-safe:animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
