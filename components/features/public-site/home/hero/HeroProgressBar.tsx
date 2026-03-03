"use client";

interface HeroProgressBarProps {
  isAutoPlaying: boolean;
}

export function HeroProgressBar({ isAutoPlaying }: HeroProgressBarProps) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"
      aria-hidden="true"
    >
      <div
        className="h-full bg-primary transition-all duration-100 ease-linear"
        style={{
          width: isAutoPlaying ? "100%" : "0%",
          animation: isAutoPlaying ? "progress 6s linear infinite" : "none",
        }}
      />
    </div>
  );
}
