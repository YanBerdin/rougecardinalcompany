"use client";

import { useState, useEffect } from 'react';
import { NewsItem } from './types';

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
