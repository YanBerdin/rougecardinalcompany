"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSlide } from "./types";
import { CURRENT_SEASON_LABEL } from "./constants";

interface HeroCTAProps {
  slide: HeroSlide;
}

export function HeroCTA({ slide }: HeroCTAProps) {
  return (
    <div className="relative z-10 text-center text-chart-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-24 h-px bg-gold mx-auto mb-8" aria-hidden="true" />

      <p className="text-lg md:text-2xl tracking-[0.25em] uppercase text-gold mb-6">
        {CURRENT_SEASON_LABEL}
      </p>

      <div className="animate-fade-in-up">
        <h1 className="text-chart-6 text-5xl md:text-7xl lg:text-8xl font-bold mb-6 ">
          {slide.title}
        </h1>
        <h2 className="text-5xl md:text-7xl lg:text-8xl italic font-bold mb-4 text-gold-gradient">
          {slide.subtitle}
        </h2>
        <p className="text-lg mb-8 text-chart-6 max-w-2xl mx-auto">
          {slide.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {slide.ctaPrimaryEnabled && slide.ctaPrimaryLabel && (
            <Button variant="default" size="lg" asChild>
              <Link href={slide.ctaPrimaryUrl ?? "/spectacles"}>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
                {slide.ctaPrimaryLabel}
              </Link>
            </Button>
          )}

          {slide.ctaSecondaryEnabled && slide.ctaSecondaryLabel && (
            <Button
              variant="outline"
              size="lg"
              className="bg-white/30 border-white/50 text-chart-6 backdrop-blur-md hover:bg-chart-6 hover:text-black transition-colors duration-300 shadow-lg"
              asChild
            >
              <Link href={slide.ctaSecondaryUrl ?? "/agenda"}>
                <Play className="h-5 w-5" aria-hidden="true" />
                {slide.ctaSecondaryLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
