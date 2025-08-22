"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Heart, Award } from 'lucide-react';
import { NewsItem, StatItem, Show, HeroSlide } from './types';

// Données mockées (à remplacer par un appel API Supabase dans le futur)
const newsData: NewsItem[] = [
  {
    id: 1,
    title: "Nomination aux Molières 2024",
    excerpt: "Notre spectacle 'Les Murmures du Temps' a été nominé dans la catégorie Meilleur Spectacle d'Auteur Contemporain.",
    date: "2025-08-15",
    image: "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Prix"
  },
  {
    id: 2,
    title: "Tournée Nationale 2024",
    excerpt: "Retrouvez-nous dans 15 villes de France pour une tournée exceptionnelle de nos créations phares.",
    date: "2025-09-10",
    image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Tournée"
  },
  {
    id: 3,
    title: "Résidence de Création",
    excerpt: "La compagnie entame une résidence de trois mois au Théâtre de la Ville pour sa prochaine création.",
    date: "2025-12-05",
    image: "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Création"
  }
];

export function useNews() {
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Simuler un appel API avec un délai
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtrer les actualités des 30 derniers jours
        const featuredNews = newsData.filter(item => {
          const itemDate = new Date(item.date);
          const now = new Date();
          const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 30;
        });
        
        setNews(featuredNews);
      } catch (error) {
        console.error("Erreur lors de la récupération des actualités", error);
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return {
    news,
    isLoading
  };
}

// Données statistiques pour la section À propos
const aboutStats: StatItem[] = [
  { icon: Users, value: '15+', label: 'Années d\'expérience' },
  { icon: Heart, value: '50+', label: 'Spectacles créés' },
  { icon: Award, value: '8', label: 'Prix obtenus' },
];

export function useAbout() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        // Simuler un appel API avec un délai
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Dans un cas réel, on pourrait récupérer ces données depuis Supabase
        setStats(aboutStats);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
        setStats([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  return {
    stats,
    isLoading
  };
}

// Données mockées pour les spectacles
const showsData: Show[] = [
  {
    id: 1,
    title: "Les Murmures du Temps",
    description: "Un voyage poétique à travers les âges, où passé et présent se rencontrent dans un dialogue bouleversant.",
    date: "2025-08-15",
    time: "20h30",
    venue: "Théâtre de la Ville",
    location: "Paris",
    image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600",
    status: "Bientôt complet",
    genre: "Drame contemporain"
  },
  {
    id: 2,
    title: "Fragments d'Éternité",
    description: "Une création originale qui explore les liens invisibles qui nous unissent, entre rire et larmes.",
    date: "2025-09-28",
    time: "19h00",
    venue: "Théâtre des Abbesses",
    location: "Paris",
    image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600",
    status: "Première",
    genre: "Création originale"
  },
  {
    id: 3,
    title: "La Danse des Ombres",
    description: "Adaptation moderne d'un classique, revisité avec audace et sensibilité par notre équipe artistique.",
    date: "2025-08-12",
    time: "20h00",
    venue: "Centre Culturel",
    location: "Lyon",
    image: "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=600",
    status: "Tournée",
    genre: "Classique revisité"
  }
];

export function useShows() {
  const [isLoading, setIsLoading] = useState(true);
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        // Simuler un appel API avec un délai
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dans un cas réel, on pourrait récupérer ces données depuis Supabase
        // et appliquer des filtres (spectacles à venir, etc.)
        setShows(showsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des spectacles", error);
        setShows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShows();
  }, []);

  return {
    shows,
    isLoading
  };
}

// Données mockées pour le hero
const heroSlides: HeroSlide[] = [
  {
    title: "L'Art de Raconter",
    subtitle: "Des histoires qui résonnent",
    description: "Découvrez notre dernière création, une œuvre captivante qui explore les méandres de l'âme humaine.",
    image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cta: "Découvrir le spectacle"
  },
  {
    title: "Saison 2025-2026",
    subtitle: "Une programmation exceptionnelle",
    description: "Quatre créations inédites vous attendent cette saison, mêlant tradition et modernité.",
    image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cta: "Voir la programmation"
  }
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
    const fetchHeroData = async () => {
      try {
        // Simuler un appel API avec un délai
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Dans un cas réel, on pourrait récupérer ces données depuis Supabase
        setSlides(heroSlides);
      } catch (error) {
        console.error("Erreur lors de la récupération des données du hero", error);
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
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (isLoading) return;
    pauseAutoPlay();
    isDragging.current = true;
    
    if ('touches' in e) {
      touchStartX.current = e.touches[0].clientX;
    } else {
      touchStartX.current = e.clientX;
      e.preventDefault(); // Prevent text selection on mouse drag
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
      if (e.key === 'ArrowLeft') {
        pauseAutoPlay();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        pauseAutoPlay();
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    handleTouchEnd
  };
}

export function useNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simuler un appel API pour l'inscription à la newsletter
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans un cas réel, nous enverrions les données à Supabase ou une autre API
      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error("Erreur lors de l'inscription à la newsletter", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    isSubscribed,
    isLoading,
    isInitialLoading,
    handleEmailChange,
    handleSubmit
  };
}
