import type { PresentationSection } from "@/lib/dal/compagnie-presentation";
// TODO: ajouter un script de seed pour remplir la table `compagnie_presentation_sections` avec ces données de fallback, et supprimer ce fichier une fois que la table est correctement alimentée en production.
/**
 * Static fallback data for compagnie presentation sections.
 *
 * Used when the database is unavailable or the table is empty.
 * Source of truth is `public.compagnie_presentation_sections`.
 */
export const compagniePresentationFallback: PresentationSection[] = [
  {
    id: "hero",
    kind: "hero",
    title: "La Compagnie Rouge-Cardinal",
    subtitle: "15 ans de passion pour les arts de la scène",
  },
  {
    id: "history",
    kind: "history",
    title: "Notre Histoire",
    content: [
      "Fondée en 2024 par un collectif de jeunes acteurs, la compagnie Rouge-Cardinal est née d'une envie commune : créer des pièces de théâtre qui parlent à notre époque tout en puisant dans la richesse du patrimoine dramatique.",
      "Le nom 'Rouge-Cardinal' évoque à la fois la passion qui nous anime et le rouge profond qui colore les sièges et les rideaux des théâtres.",
      "Depuis nos débuts, nous avons créé deux spectacles à Paris et en région parisienne, et nous avons participé à plusieurs festivals de théâtre. La Compagnie a également porté le projet d'exposition photo 'Nouveaux Mondes' de Florian Chaillot présenté dans plusieurs lieux d'exposition à Paris.",
    ],
    image:
      "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "quote-history",
    kind: "quote",
    quote: {
      text: "Le théâtre doit être un miroir de l'âme humaine, un lieu où l'émotion et la réflexion se rencontrent pour créer du sens et du lien entre les êtres.",
      author: "Marie Dubois, Directrice artistique",
    },
  },
  {
    id: "values",
    kind: "values",
    title: "Nos Valeurs",
    subtitle:
      "Les principes qui guident notre travail artistique et notre vision du théâtre",
  },
  {
    id: "team",
    kind: "team",
    title: "Notre Équipe",
    subtitle:
      "Rencontrez les artistes et techniciens qui donnent vie à nos spectacles",
  },
  {
    id: "mission",
    kind: "mission",
    title: "Notre Mission",
    content: [
      "Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l'art vivant. Nous nous attachons à rendre le théâtre accessible à tous, en développant des projets artistiques de qualité qui résonnent avec les enjeux de notre société.",
    ],
  },
  {
    id: "founder",
    kind: "founder",
    title: "Florian Chaillot",
    subtitle: "Directeur artistique & Metteur en scène",
    image:
      "https://yvtrlvmbofklefxcxrzv.supabase.co/storage/v1/object/public/medias/team/1776350784063-IMG_3043---retouch-.jpg",
    milestones: [
      { year: "2023", label: "Sacontala - Calidasa" },
      { year: "2025", label: "Nouveaux Mondes - Exposition photo" },
      { year: "2026", label: "La Farce de Maître Pathelin - Anonyme" },
    ],
  },
];
