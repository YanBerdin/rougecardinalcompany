import { useState, useEffect } from 'react';
import { CurrentShow, ArchivedShow } from './types';

// Données des spectacles actuels (à terme, ces données seront issues d'une API)
const currentShowsData = [
    {
        id: 1,
        title: "Les Murmures du Temps",
        description: "Un voyage poétique à travers les âges, où passé et présent se rencontrent dans un dialogue bouleversant. Cette création originale explore les liens invisibles qui nous unissent à travers le temps.",
        genre: "Drame contemporain",
        duration: "1h30",
        cast: 4,
        premiere: "2023-10-15",
        image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600",
        status: "En tournée",
        awards: ["Nominé aux Molières 2024"]
    },
    {
        id: 2,
        title: "Fragments d'Éternité",
        description: "Une création originale qui explore les liens invisibles qui nous unissent, entre rire et larmes. Un spectacle touchant sur la condition humaine et nos quêtes de sens.",
        genre: "Création originale",
        duration: "1h45",
        cast: 6,
        premiere: "2024-01-12",
        image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600",
        status: "Nouvelle création",
        awards: []
    }
];

// Données des spectacles archivés (à terme, ces données seront issues d'une API)
const archivedShowsData = [
    {
        id: 3,
        title: "La Danse des Ombres",
        description: "Adaptation moderne d'un classique, revisité avec audace et sensibilité par notre équipe artistique.",
        genre: "Classique revisité",
        year: "2023",
        image: "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: ["Prix du Public - Festival d'Avignon"]
    },
    {
        id: 4,
        title: "Échos de Liberté",
        description: "Un spectacle engagé sur les droits humains et la liberté d'expression dans le monde contemporain.",
        genre: "Théâtre documentaire",
        year: "2022",
        image: "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: ["Mention spéciale - Théâtre et Société"]
    },
    {
        id: 5,
        title: "Rêves d'Enfance",
        description: "Un spectacle familial poétique qui ravive la magie de l'enfance chez petits et grands.",
        genre: "Tout public",
        year: "2021",
        image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: []
    },
    {
        id: 6,
        title: "Solitudes Partagées",
        description: "Une réflexion intimiste sur la solitude moderne et les moyens de créer du lien dans notre société.",
        genre: "Drame psychologique",
        year: "2020",
        image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: ["Prix de la Critique"]
    }
];

// Hook personnalisé pour récupérer les données des spectacles
export const useSpectaclesData = () => {
    const [currentShows, setCurrentShows] = useState<CurrentShow[]>([]);
    const [archivedShows, setArchivedShows] = useState<ArchivedShow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulation d'un appel API avec un délai
        const fetchData = async () => {
            try {
                // Temps de chargement simulé
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Mise à jour des données (à terme, ce sera un appel API réel)
                setCurrentShows(currentShowsData);
                setArchivedShows(archivedShowsData);
            } catch (error) {
                console.error("Erreur lors du chargement des spectacles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return {
        currentShows,
        archivedShows,
        loading
    };
};
