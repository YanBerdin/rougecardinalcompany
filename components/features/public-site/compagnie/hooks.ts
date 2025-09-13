import { useState, useEffect } from 'react';
import { Users, Heart, Award, Target } from 'lucide-react';
import { Value, TeamMember } from './types';

// Mock des valeurs de la compagnie
const valuesData: Value[] = [
  {
    icon: Heart,
    title: 'Passion',
    description: 'L\'amour du théâtre guide chacune de nos créations et performances.'
  },
  {
    icon: Users,
    title: 'Collectif',
    description: 'La force du groupe et la richesse des échanges nourrissent notre travail.'
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'Nous nous attachons à la qualité artistique dans tous nos projets.'
  },
  {
    icon: Award,
    title: 'Innovation',
    description: 'Nous explorons de nouvelles formes théâtrales tout en respectant les classiques.'
  }
];

// Mock des membres de l'équipe
// 04_table_membres_equipe
const teamData: TeamMember[] = [
  {
    name: 'Marie Dubois',
    role: 'Directrice artistique',
    bio: 'Formée au Conservatoire National, Marie dirige la compagnie depuis sa création avec une vision moderne du théâtre classique.',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    name: 'Jean Martin',
    role: 'Metteur en scène',
    bio: 'Ancien élève de Peter Brook, Jean apporte son expérience internationale et sa passion pour le théâtre d\'auteur.',
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    name: 'Sophie Laurent',
    role: 'Comédienne & Dramaturge',
    bio: 'Diplômée de l\'École Nationale de Théâtre, Sophie développe nos créations originales avec sensibilité et rigueur.',
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    name: 'Thomas Roux',
    role: 'Régisseur & Scénographe',
    bio: 'Technicien passionné, Thomas conçoit nos décors et assure la régie technique de nos spectacles.',
    image: 'https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

// Hook personnalisé pour récupérer les données de la compagnie
//TODO useFetchCompagnieData
export const useCompagnieData = () => {
  const [values, setValues] = useState<Value[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation d'un appel API avec un délai
    const fetchData = async () => {
      try {
        // Temps de chargement simulé
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mise à jour des données (à terme, ce sera un appel API réel)
        setValues(valuesData);
        setTeam(teamData);
      } catch (error) {
        console.error("Erreur lors du chargement des données de la compagnie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    values,
    team,
    loading
  };
};
