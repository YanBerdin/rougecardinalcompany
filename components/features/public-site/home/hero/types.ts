export interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
}

export interface HeroProps {
  slides: HeroSlide[];
  currentSlide: number;
  isAutoPlaying: boolean;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
  onPauseAutoPlay: () => void;
  onTouchStart: (e: React.TouchEvent | React.MouseEvent) => void;
  onTouchMove: (e: React.TouchEvent | React.MouseEvent) => void;
  onTouchEnd: () => void;
}
