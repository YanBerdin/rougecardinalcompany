"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { HeroView } from './HeroView';
import { HeroSlide } from './types';
import { HeroSkeleton } from '@/components/skeletons/hero-skeleton';

export function HeroClient({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [isLoading, setIsLoading] = useState(false);
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
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, slides.length)) % Math.max(1, slides.length));
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (isAutoPlaying && !isLoading && slides.length > 1) {
      autoPlayRef.current = setInterval(nextSlide, 6000);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, nextSlide, isLoading, slides.length]);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (isLoading) return;
    pauseAutoPlay();
    isDragging.current = true;
    if ('touches' in e) {
      touchStartX.current = e.touches[0].clientX;
    } else {
      touchStartX.current = e.clientX;
      e.preventDefault();
    }
  }, [pauseAutoPlay, isLoading]);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current || isLoading) return;
    if ('touches' in e) {
      touchEndX.current = e.touches[0].clientX;
    } else {
      touchEndX.current = e.clientX;
    }
  }, [isLoading]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || isLoading) return;
    isDragging.current = false;
    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [nextSlide, prevSlide, isLoading]);

  if (isLoading) return <HeroSkeleton />;

  // Aucun slide côté BDD -> afficher un squelette pour éviter le crash
  if (!slides || slides.length === 0) return <HeroSkeleton />;

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
