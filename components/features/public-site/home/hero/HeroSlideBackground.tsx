"use client";

import Image from "next/image";
import { HeroSlide } from "./types";

interface HeroSlideBackgroundProps {
  slides: HeroSlide[];
  currentSlide: number;
}

export function HeroSlideBackground({
  slides,
  currentSlide,
}: HeroSlideBackgroundProps) {
  return (
    <>
      {slides.map((slide, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {slide.image && (
            <Image
              src={slide.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover blur-[1px]"
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55),rgba(0,0,0,0.85))]" />
        </div>
      ))}
    </>
  );
}
