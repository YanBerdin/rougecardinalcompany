"use client";

// Marque ce fichier comme client component pour utiliser useState et useEffect
import { PresseContainer } from "@/components/features/public-site/presse/PresseContainer";

/**
 * Page Presse - utilise le pattern Smart/Dumb Components
 * Cette page est maintenant un simple wrapper autour du container
 * qui gère la logique et l'état
 */
export default function PressePage() {
    return <PresseContainer />;
}
