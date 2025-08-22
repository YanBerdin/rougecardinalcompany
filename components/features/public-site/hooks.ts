"use client";

import { useState, useEffect } from 'react';
import { Users, Heart, Award } from 'lucide-react';
import { NewsItem, StatItem, Show } from './types';

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
