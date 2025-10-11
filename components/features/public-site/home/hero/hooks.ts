"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HeroSlide } from "./types";

// Mock pour le slide de la page d'accueil
// 07d_table_home_hero.sql
const heroSlides: HeroSlide[] = [
  {
    title: "L'Art de Raconter",
    subtitle: "Des histoires qui résonnent",
    description:
      "Découvrez notre dernière création, une œuvre captivante qui explore les méandres de l'âme humaine.",
    image:
      "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cta: "Découvrir le spectacle",
  },
  {
    title: "Saison 2025-2026",
    subtitle: "Une programmation exceptionnelle",
    description:
      "Quatre créations inédites vous attendent cette saison, mêlant tradition et modernité.",
    image:
      "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cta: "Voir la programmation",
  },
];

export function useHero() {
  const [isLoading, setIsLoading] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // https://supabase.com/docs/reference/javascript/db-abortsignal
    const fetchHeroData = async () => {
      try {
        // Simuler un appel API avec délai => skeleton
        await new Promise((resolve) => setTimeout(resolve, 1500)); //TODO: remove

        setSlides(heroSlides);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données du hero",
          error
        );
        setSlides([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !isLoading) {
      autoPlayRef.current = setInterval(nextSlide, 6000);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, nextSlide, isLoading]);

  // Pause auto-play on user interaction
  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume after 10 seconds
  }, []);

  // Touch/Mouse event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (isLoading) return;
      pauseAutoPlay();
      isDragging.current = true;

      if ("touches" in e) {
        touchStartX.current = e.touches[0].clientX;
      } else {
        touchStartX.current = e.clientX;
        e.preventDefault(); // Prevent text selection on mouse drag
      }
    },
    [pauseAutoPlay, isLoading]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDragging.current || isLoading) return;

      if ("touches" in e) {
        touchEndX.current = e.touches[0].clientX;
      } else {
        touchEndX.current = e.clientX;
      }
    },
    [isLoading]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || isLoading) return;
    isDragging.current = false;

    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe left - next slide
        nextSlide();
      } else {
        // Swipe right - previous slide
        prevSlide();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [nextSlide, prevSlide, isLoading]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      if (e.key === "ArrowLeft") {
        pauseAutoPlay();
        prevSlide();
      } else if (e.key === "ArrowRight") {
        pauseAutoPlay();
        nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, pauseAutoPlay, isLoading]);

  return {
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
    handleTouchEnd,
  };
}
