"use client";

import Link from "next/link";
import { View, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSlide } from "./types";
import { CURRENT_SEASON_LABEL } from "./constants";

interface HeroCTAProps {
  slide: HeroSlide;
}

export function HeroCTA({ slide }: HeroCTAProps) {
  return (
    <div className="relative z-10 text-center text-chart-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 md:mt-52">
      <div className="hidden sm:block w-24 h-px bg-gold mx-auto mb-4 md:mb-8" aria-hidden="true" />

      <p className="text-xs md:text-sm tracking-[0.15em] sm:tracking-[0.25em] uppercase font-serif text-gold mb-2 lg:mb-6">
        {CURRENT_SEASON_LABEL}
      </p>

      <div className="animate-fade-in-up">
        <h1 className=" text-gold-gradient text-4xl md:text-6xl font-bold mb-2 sm:mb-4 lg:mb-6">
          {slide.title}
        </h1>
        <h2 className="text-4xl text-chart-6 md:text-6xl font-bold mb-2 sm:mb-4">
          {slide.subtitle}
        </h2>
        <p className="text-sm md:text-base mb-6 text-chart-6/70 max-w-2xl mx-auto">
          {slide.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          {slide.ctaPrimaryEnabled && slide.ctaPrimaryLabel && (
            <Button variant="default" size="lg" className="max-sm:text-xs max-w-[280px] w-52 justify-center" asChild>
              <Link href={slide.ctaPrimaryUrl ?? "/spectacles"}>
                <View className="h-5 w-5 shrink-0" aria-hidden="true" />
                {slide.ctaPrimaryLabel}
              </Link>
            </Button>
          )}

          {slide.ctaSecondaryEnabled && slide.ctaSecondaryLabel && (
            <Button
              variant="outline"
              size="lg"
              className="max-sm:text-xs max-w-[280px] w-52 justify-center bg-white/30 border-white/50 text-chart-6 backdrop-blur-md hover:bg-white/70 hover:text-primary transition-colors duration-300 shadow-lg"
              asChild
            >
              <Link href={slide.ctaSecondaryUrl ?? "/agenda"}>
                <Play className="h-5 w-5 shrink-0" aria-hidden="true" />
                {slide.ctaSecondaryLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
