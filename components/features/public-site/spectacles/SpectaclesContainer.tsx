"use client";

import { useSpectaclesData } from './hooks';
import { SpectaclesView } from './SpectaclesView';

export function SpectaclesContainer() {
    // Utilisation du hook personnalisé pour récupérer les données
    const { currentShows, archivedShows, loading } = useSpectaclesData();

    // Rendu du composant de présentation avec les données récupérées
    return (
        <SpectaclesView
            currentShows={currentShows}
            archivedShows={archivedShows}
            loading={loading}
        />
    );
}
