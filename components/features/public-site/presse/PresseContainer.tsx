"use client";

import { PresseSkeleton } from "@/components/skeletons/presse-skeleton";
import { usePresse } from "./hooks";
import { PresseView } from "./PresseView";

/**
 * Composant container (smart) pour la page Presse
 * Gère la logique métier, les appels API et l'état de chargement
 */
export function PresseContainer() {
    const { loading, pressReleases, mediaArticles, mediaKit } = usePresse();

    // Affichage du skeleton pendant le chargement
    if (loading) {
        return <PresseSkeleton />;
    }

    // Passe les données au composant de présentation
    return (
        <PresseView
            pressReleases={pressReleases}
            mediaArticles={mediaArticles}
            mediaKit={mediaKit}
        />
    );
}
