"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HeroView } from "./HeroView";
import { HeroSlide } from "./types";
import {
  AUTO_PLAY_INTERVAL_MS,
  PAUSE_AFTER_INTERACTION_MS,
  MIN_SWIPE_DISTANCE_PX,
} from "./constants";

export function HeroClient({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  /** Vrai quand l'utilisateur a explicitement pausé via le bouton — l'auto-reprise est désactivée. */
  const isPermanentlyPaused = useRef(false);

  // Synchronisation si initialSlides change (streaming/rerender)
  useEffect(() => {
    setSlides(initialSlides);
  }, [initialSlides]);

  // Respecter prefers-reduced-motion : stoppe l'auto-play si activé
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsAutoPlaying(false);
      isPermanentlyPaused.current = true;
    }
    const handler = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsAutoPlaying(false);
        isPermanentlyPaused.current = true;
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, slides.length));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.max(1, slides.length)) % Math.max(1, slides.length)
    );
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (isAutoPlaying && slides.length > 1) {
      autoPlayRef.current = setInterval(nextSlide, AUTO_PLAY_INTERVAL_MS);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, nextSlide, slides.length]);

  /** Pause temporaire après interaction utilisateur — reprend automatiquement sauf si l'utilisateur a pausé manuellement. */
  const pauseAutoPlay = useCallback(() => {
    if (isPermanentlyPaused.current) return;
    setIsAutoPlaying(false);
    setTimeout(() => {
      if (!isPermanentlyPaused.current) setIsAutoPlaying(true);
    }, PAUSE_AFTER_INTERACTION_MS);
  }, []);

  /** Bascule pause/lecture explicite via le bouton dédié. */
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => {
      const next = !prev;
      isPermanentlyPaused.current = !next;
      return next;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        pauseAutoPlay();
        prevSlide();
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        pauseAutoPlay();
        nextSlide();
        e.preventDefault();
      }
    },
    [pauseAutoPlay, prevSlide, nextSlide]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      pauseAutoPlay();
      isDragging.current = true;
      if ("touches" in e) {
        touchStartX.current = e.touches[0].clientX;
      } else {
        touchStartX.current = e.clientX;
        e.preventDefault();
      }
    },
    [pauseAutoPlay]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDragging.current) return;
      if ("touches" in e) {
        touchEndX.current = e.touches[0].clientX;
      } else {
        touchEndX.current = e.clientX;
      }
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const deltaX = touchStartX.current - touchEndX.current;
    if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE_PX) {
      if (deltaX > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [nextSlide, prevSlide]);

  if (!slides || slides.length === 0) return null;

  return (
    <HeroView
      slides={slides}
      currentSlide={currentSlide}
      isAutoPlaying={isAutoPlaying}
      onPrevSlide={prevSlide}
      onNextSlide={nextSlide}
      onGoToSlide={goToSlide}
      onPauseAutoPlay={pauseAutoPlay}
      onToggleAutoPlay={toggleAutoPlay}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}
