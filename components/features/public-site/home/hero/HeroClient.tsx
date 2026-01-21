"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HeroView } from "./HeroView";
import { HeroSlide } from "./types";

export function HeroClient({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Si jamais initialSlides change (streaming/rerender), on met à jour
  useEffect(() => {
    setSlides(initialSlides);
  }, [initialSlides]);

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
      autoPlayRef.current = setInterval(nextSlide, 6000);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, nextSlide, slides.length]);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

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
    const minSwipeDistance = 50;
    if (Math.abs(deltaX) > minSwipeDistance) {
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}
