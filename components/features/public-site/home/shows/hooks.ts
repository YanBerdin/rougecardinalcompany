"use client";

import { useState, useEffect } from 'react';
import { Show } from './types';

// Données mockées pour les spectacles
// 06_table_spectacles
const showsData: Show[] = [
  {
    id: 1,
    title: "Les Murmures du Temps",
    short_description: "Un voyage poétique à travers les âges, où passé et présent se rencontrent dans un dialogue bouleversant.",
    image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: "les-murmures-du-temps",
    dates: ["2025-08-15", "2025-08-16", "2025-08-17"]
  },
  {
    id: 2,
    title: "Fragments d'Éternité",
    short_description: "Une création originale qui explore les liens invisibles qui nous unissent, entre rire et larmes.",
    image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: "fragments-eternite",
    dates: ["2025-09-28", "2025-09-29", "2025-09-30"]
  },
  {
    id: 3,
    title: "La Danse des Ombres",
    short_description: "Adaptation moderne d'un classique, revisité avec audace et sensibilité par notre équipe artistique.",
    image: "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: "la-danse-des-ombres",
    dates: ["2025-08-12", "2025-08-13", "2025-08-14"]
  }
];

export function useShows() {
  const [isLoading, setIsLoading] = useState(true);
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        // Simuler un appel API avec un délai
        await new Promise(resolve => setTimeout(resolve, 800)); //TODO: remove
        
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
