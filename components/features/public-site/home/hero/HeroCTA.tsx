"use client";

import Link from "next/link";
import { View, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSlide } from "./types";

interface HeroCTAProps {
  slide: HeroSlide;
}

export function HeroCTA({ slide }: HeroCTAProps) {
  return (
    <div className="relative z-10 text-center text-chart-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 md:mt-48">
      <div className="animate-fade-in-up">

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#ad0000] font-semibold leading-[1.15] lg:leading-none tracking-tight [paint-order:stroke_fill] [-webkit-text-stroke:1.2px_hsl(var(--gold-light))] md:[-webkit-text-stroke:2px_hsl(var(--gold-light))] [filter:drop-shadow(0_4px_12px_rgba(0,0,0,0.8))_drop-shadow(0_0_16px_hsl(var(--gold-light)/0.35))]">
          {slide.title}
        </h1>

        <h2 className="text-gold-gradient text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] lg:leading-none tracking-tight py-4">
          {slide.subtitle}
        </h2>

        <p className="text-sm sm:text-base md:text-lg my-6 text-chart-6/80 max-w-2xl mx-auto leading-relaxed">
          {slide.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          {slide.ctaPrimaryEnabled && slide.ctaPrimaryLabel && (
            <Button
              variant="default"
              size="lg"
              className="max-sm:text-sm text-base max-w-[280px] w-64 justify-center" asChild>
              <Link href={slide.ctaPrimaryUrl ?? "/spectacles"}>
                <View className="size-5 shrink-0" aria-hidden="true" />
                {slide.ctaPrimaryLabel}
              </Link>
            </Button>
          )}

          {slide.ctaSecondaryEnabled && slide.ctaSecondaryLabel && (
            <Button
              variant="outline"
              size="lg"
              className="max-sm:text-sm text-base max-w-[280px] w-64 justify-center bg-white/30 border-white/50 text-chart-6 backdrop-blur-md hover:bg-white/90 hover:text-chart-2 transition-colors duration-300"
              asChild
            >
              <Link href={slide.ctaSecondaryUrl ?? "/agenda"}>
                <Play className="size-5 shrink-0" aria-hidden="true" />
                {slide.ctaSecondaryLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
