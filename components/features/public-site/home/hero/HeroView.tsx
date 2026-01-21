"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroProps } from "./types";

export function HeroView({
  slides,
  currentSlide,
  isAutoPlaying,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  onPauseAutoPlay,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: HeroProps) {
  if (!slides || slides.length === 0) {
    return null;
  }
  return (
    <section
      className="relative h-screen flex items-center justify-center overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onTouchStart}
      onMouseMove={onTouchMove}
      onMouseUp={onTouchEnd}
      onMouseLeave={onTouchEnd}
    >
      {/* Background Images - Optimized with next/image for LCP */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
        >
          {slide.image && (
            <Image
              src={slide.image}
              alt={slide.title || "Hero slide"}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 text-center text-chart-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {slides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-gray-200">
            {slides[currentSlide].subtitle}
          </p>
          <p className="text-lg mb-8 text-gray-200 max-w-2xl mx-auto">
            {slides[currentSlide].description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* CTA Primaire - Bouton plein */}
            {slides[currentSlide].ctaPrimaryEnabled && slides[currentSlide].ctaPrimaryLabel && (
              <Button variant="default" size="lg" asChild>
                <Link href={slides[currentSlide].ctaPrimaryUrl || "/spectacles"}>
                  {slides[currentSlide].ctaPrimaryLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* CTA Secondaire - Bouton outline */}
            {slides[currentSlide].ctaSecondaryEnabled && slides[currentSlide].ctaSecondaryLabel && (
              <Button
                variant="outline"
                size="lg"
                className="bg-white/30 border-white/50 text-chart-6 backdrop-blur-md hover:bg-chart-6 hover:text-black transition-all duration-300 shadow-lg"
                asChild
              >
                <Link href={slides[currentSlide].ctaSecondaryUrl || "/agenda"}>
                  {slides[currentSlide].ctaSecondaryLabel}
                  <Play className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => {
          onPauseAutoPlay();
          onPrevSlide();
        }}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-chart-6 p-3 rounded-full transition-all duration-200 backdrop-blur-md"
        aria-label="Slide précédent"
      >
        <ArrowRight className="h-6 w-6 rotate-180" />
      </button>

      <button
        onClick={() => {
          onPauseAutoPlay();
          onNextSlide();
        }}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-chart-6 p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Slide suivant"
      >
        <ArrowRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              onPauseAutoPlay();
              onGoToSlide(index);
            }}
            className="touch-hitbox overflow-hidden"
            aria-label={`Aller au slide ${index + 1}`}
          >
            <span
              className={`block w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide
                ? "bg-chart-6 scale-110"
                : "bg-chart-6/50 hover:bg-chart-6/75 scale-95"
                }`}
            />
          </button>
        ))}
      </div>

      {/* Swipe Indicator */}
      <div className="absolute bottom-8 right-8 text-chart-6/70  text-sm hidden sm:block">
        <div className="flex items-center space-x-2">
          <span>Glissez pour naviguer</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-chart-6/50 rounded-full animate-pulse" />
            <div
              className="w-2 h-2 bg-chart-6/50 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 bg-chart-6/50 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-primary transition-all duration-100 ease-linear"
          style={{
            width: isAutoPlaying ? "100%" : "0%",
            animation: isAutoPlaying ? "progress 6s linear infinite" : "none",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
