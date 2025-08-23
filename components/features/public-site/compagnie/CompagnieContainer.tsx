"use client";

import { useCompagnieData } from './hooks';
import { CompagnieView } from './CompagnieView';

export function CompagnieContainer() {
    // Utilisation du hook personnalisé pour récupérer les données
    const { values, team, loading } = useCompagnieData();

    // Rendu du composant de présentation avec les données récupérées
    return (
        <CompagnieView
            values={values}
            team={team}
            loading={loading}
        />
    );
}
