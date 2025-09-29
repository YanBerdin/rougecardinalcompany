// [DEPRECATED MOCK]
// Ce module n'est plus utilisé. La page Presse lit désormais via DAL côté serveur.
/*
"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, FileText, Video } from "lucide-react";
import { PressRelease, MediaArticle, MediaKitItem } from "./types";
import { PresseSkeleton } from "@/components/skeletons/presse-skeleton";

// Communiqués de presse pressReleasesData[]== newsData[]
// 08b_table__communiques_presse.sql
// communiques_medias → many-2-many
const pressReleasesData = [
  {
    id: 1,
    title: "Nomination aux Molières 2024",
    date: "2024-01-15",
    description:
      "La compagnie Rouge-Cardinal nominée dans la catégorie Meilleur Spectacle d'Auteur Contemporain.",
    fileUrl: "/docs/cp-molieres-2024.pdf", // storage_path (communiques_medias)
    fileSize: "245 KB", // size_bytes (communiques_medias)
  },
  {
    id: 2,
    title: "Tournée Nationale 2024",
    date: "2024-01-10",
    description:
      "Lancement de la tournée nationale avec 15 dates dans toute la France.",
    fileUrl: "/docs/cp-tournee-2024.pdf",
    fileSize: "312 KB",
  },
  {
    id: 3,
    title: "Nouvelle Création - Fragments d'Éternité",
    date: "2023-12-05",
    description:
      "Présentation de notre dernière création originale en première au Théâtre des Abbesses.",
    fileUrl: "/docs/cp-fragments-eternite.pdf",
    fileSize: "198 KB",
  },
];

// Revue de Presse (08b_table_articles_presse)
const mediaArticlesData = [
  {
    id: 1,
    title: "Une compagnie qui marie tradition et modernité",
    author: "Marie Lecomte",
    type: "Article" as const,
    source_publication: "Le Figaro",
    published_at: "2024-01-20",
    source_url: "https://lefigaro.fr/...",
    excerpt:
      "Rouge-Cardinal réussit le pari audacieux de rendre les classiques accessibles à un public contemporain...",
  },
  {
    id: 2,
    title: "Les Murmures du Temps : un spectacle bouleversant",
    author: "Jean-Michel Ribes",
    type: "Critique" as const,
    source_publication: "Télérama",
    published_at: "2024-01-18",
    source_url: "https://telerama.fr/...",
    excerpt:
      "Rarement une création aura su toucher avec autant de justesse les cordes sensibles du spectateur...",
  },
  {
    id: 3,
    title: "Interview vidéo - Marie Dubois",
    author: "Laure Adler",
    type: "Interview" as const,
    source_publication: "France Culture",
    published_at: "2024-01-12",
    source_url: "https://franceculture.fr/...",
    excerpt:
      "La directrice artistique de Rouge-Cardinal nous parle de sa vision du théâtre contemporain...",
  },
  {
    id: 4,
    title: "Portrait d'une compagnie engagée",
    author: "Sophie Grassin",
    type: "Portrait" as const,
    source_publication: "Les Inrockuptibles",
    published_at: "2024-01-08",
    source_url: "https://lesinrocks.com/...",
    excerpt:
      "Depuis 15 ans, Rouge-Cardinal développe un théâtre exigeant et accessible, miroir de notre époque...",
  },
];

// Kit média téléchargeable
// TODO: 08b_table_kit_media
//  kit_media → many-2-many kit_media_medias
const mediaKitData = [
  {
    type: "Photos haute définition",
    description: "Portraits de l'équipe et photos de spectacles",
    icon: ImageIcon,
    fileSize: "45 MB", //? size_bytes (kit_media_medias) => calc() ?
    fileUrl: "/media/photos-hd.zip", //? storage_path (kit_media_medias)
  },
  {
    type: "Dossier de presse complet",
    description: "Présentation de la compagnie et biographies",
    icon: FileText,
    fileSize: "2.3 MB",
    fileUrl: "/media/dossier-presse-2024.pdf",
  },
  {
    type: "Vidéos promotionnelles",
    description: "Bandes-annonces et extraits de spectacles",
    icon: Video,
    fileSize: "120 MB",
    fileUrl: "/media/videos-promo.zip",
  },
];

export function usePresse() {
  const [loading, setLoading] = useState(true);
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [mediaArticles, setMediaArticles] = useState<MediaArticle[]>([]);
  const [mediaKit, setMediaKit] = useState<MediaKitItem[]>([]);

  // https://supabase.com/docs/reference/javascript/db-abortsignal
  useEffect(() => {
    // Simulation d'un appel API (skeleton testing) //TODO: remove
    const fetchData = async () => {
      try {
        // Simule une latence réseau //TODO: remove
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setPressReleases(pressReleasesData);
        setMediaArticles(mediaArticlesData);
        setMediaKit(mediaKitData);
      } catch (error) {
        console.error("Erreur lors du chargement des données presse:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Nettoyage
    return () => {
      // Annulation des requêtes en cours si nécessaire
    };
  }, []);

  return {
    loading,
    pressReleases,
    mediaArticles,
    mediaKit,
  };
}
*/
