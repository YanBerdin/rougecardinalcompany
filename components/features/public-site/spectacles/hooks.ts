// [DEPRECATED MOCK]
// Ce hook était utilisé pour simuler les données des spectacles côté client.
// Il est remplacé par un DAL server-only (Supabase) et un container serveur avec Suspense/Skeleton.
// Conserver temporairement pour référence pendant la migration complète.

/*
import { useState, useEffect } from 'react';
import { CurrentShow, ArchivedShow } from './types';

// Mock des spectacles actuels
// 06_table_spectacles
// spectacles_medias → many-2-many
const currentShowsData = [
    {
        id: 1,
        title: "Les Murmures du Temps",
        description: "Un voyage poétique à travers les âges, où passé et présent se rencontrent dans un dialogue bouleversant. Cette création originale explore les liens invisibles qui nous unissent à travers le temps.",
        genre: "Drame contemporain",
        duration_minutes: "1h30",
        cast: 4,
        premiere: "2023-10-15",
        image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600", // (spectacles_medias)
        image_url: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600",
        status: "En tournée",
        awards: ["Nominé aux Molières 2024"]
    },
    {
        id: 2,
        title: "Fragments d'Éternité",
        description: "Une création originale qui explore les liens invisibles qui nous unissent, entre rire et larmes. Un spectacle touchant sur la condition humaine et nos quêtes de sens.",
        genre: "Création originale",
        duration_minutes: "1h45",
        cast: 6,
        premiere: "2024-01-12",
        image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600",
        status: "Nouvelle création",
        awards: []
    }
];

// Mock des spectacles archivés
// 06_table_spectacles
const archivedShowsData = [
    {
        id: 3,
        title: "La Danse des Ombres",
        description: "Adaptation moderne d'un classique, revisité avec audace et sensibilité par notre équipe artistique.",
        genre: "Classique revisité",
        premiere: "2023-05-10",
        image: "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: ["Prix du Public - Festival d'Avignon"]
    },
    {
        id: 4,
        title: "Échos de Liberté",
        description: "Un spectacle engagé sur les droits humains et la liberté d'expression dans le monde contemporain.",
        genre: "Théâtre documentaire",
        premiere: "2022-03-18",
        image: "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: ["Mention spéciale - Théâtre et Société"]
    },
    {
        id: 5,
        title: "Rêves d'Enfance",
        description: "Un spectacle familial poétique qui ravive la magie de l'enfance chez petits et grands.",
        genre: "Tout public",
        premiere: "2021-11-02",
        image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: []
    },
    {
        id: 6,
        title: "Solitudes Partagées",
        description: "Une réflexion intimiste sur la solitude moderne et les moyens de créer du lien dans notre société.",
        genre: "Drame psychologique",
        premiere: "2020-09-25",
        image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: ["Prix de la Critique"]
    }
];

// Hook personnalisé pour fetch les données des spectacles
//TODO refactor useFetchSpectaclesData
// https://supabase.com/docs/reference/javascript/db-abortsignal
export const useSpectaclesData = () => {
    const [currentShows, setCurrentShows] = useState<CurrentShow[]>([]);
    const [archivedShows, setArchivedShows] = useState<ArchivedShow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // https://supabase.com/docs/reference/javascript/db-abortsignal
        const fetchData = async () => {
            try {
                // Simulation d'un appel API avec un délai (skeleton testing)
                await new Promise(resolve => setTimeout(resolve, 1000)); //TODO: remove

                // Mise à jour des données (todo appel API)
                setCurrentShows(
                    currentShowsData.map(show => ({
                        ...show,
                        public: true,
                        created_at: show.premiere,
                        updated_at: show.premiere,
                        year: show.premiere ? new Date(show.premiere).getFullYear() : undefined,
                    }))
                );
                setArchivedShows(
                    archivedShowsData.map(show => ({
                        ...show,
                        year: show.premiere ? String(new Date(show.premiere).getFullYear()) : undefined
                    }))
                );
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
*/