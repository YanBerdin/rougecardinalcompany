/**
 * [DEPRECATED MOCK]
 * Ce hook mock simulait les actualités. Il est désormais remplacé par
 * un Server Component + DAL Supabase dans `NewsContainer`.
 * Conservé à titre documentaire — NE PLUS UTILISER.
 */
// "use client";
// import { useState, useEffect } from 'react';
// import { NewsItem } from './types';
// const newsData: NewsItem[] = [ /* mock data retirée */ ];
// export function useNews() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [news, setNews] = useState<NewsItem[]>([]);
//   useEffect(() => { /* simulation retirée */ }, []);
//   return { news, isLoading };
// }

/*
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Users, Heart, Award } from 'lucide-react';
import { StatItem } from './types';

// Données statistiques pour la section À propos
// 07b_table_compagnie_content.sql
const aboutStats: StatItem[] = [
  { icon: Users, value: '15+', label: 'Années d\'expérience' },
  { icon: Heart, value: '50+', label: 'Spectacles créés' },
  { icon: Award, value: '8', label: 'Prix obtenus' },
];

export function useAbout() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    //https://supabase.com/docs/reference/javascript/db-abortsignal
    const fetchAboutData = async () => {
      try {
        // Simuler un appel API avec un délai
        await new Promise(resolve => setTimeout(resolve, 1200)); //TODO: remove

        // Récupérer ces données depuis Supabase
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
*/