export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
}

export interface NewsListProps {
  news: NewsItem[];
}

export interface StatItem {
  icon: React.ElementType;
  value: string;
  label: string;
}

export interface AboutProps {
  stats: StatItem[];
}

export interface Show {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  image: string;
  status: string;
  genre: string;
}

export interface ShowsListProps {
  shows: Show[];
}

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

export interface NewsletterFormProps {
  email: string;
  isLoading: boolean;
  isSubscribed: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface NewsletterProps {
  isSubscribed: boolean;
  isInitialLoading: boolean;
  children?: React.ReactNode;
}
