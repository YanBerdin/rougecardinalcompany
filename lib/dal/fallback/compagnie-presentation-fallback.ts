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
      "Fondée en 2008 par un collectif de jeunes diplômés des grandes écoles théâtrales françaises, la compagnie Rouge-Cardinal est née d'une envie commune : créer un théâtre qui parle à notre époque tout en puisant dans la richesse du patrimoine dramatique.",
      'Le nom "Rouge-Cardinal" évoque à la fois la passion qui nous anime et la noblesse de notre art. Comme le cardinal, oiseau au plumage éclatant, nous cherchons à apporter couleur et vie sur scène.',
      "Depuis nos débuts, nous avons créé plus de 50 spectacles, tourné dans toute la France et à l'étranger, et remporté plusieurs prix prestigieux pour nos créations originales.",
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
      "Notre engagement va au-delà de la simple représentation : nous menons des actions culturelles en milieu scolaire, participons à des festivals, et soutenons la création contemporaine par des résidences d'artistes et des collaborations avec de jeunes talents.",
    ],
  },
  {
    id: "founder",
    kind: "founder",
    title: "Florian Chaillot",
    subtitle: "Metteur en scène & Fondateur",
    image:
      "https://yvtrlvmbofklefxcxrzv.supabase.co/storage/v1/object/public/medias/team/1776350784063-IMG_3043---retouch-.jpg",
    milestones: [
      { year: "2022", label: "L'Avare - Comédie-Française" },
      { year: "2023", label: "Gala de l'Opéra de Lorraine" },
      { year: "2024", label: "Le Grand Meaulnes - scène" },
      { year: "2025", label: "Exposition photo - Paris" },
    ],
  },
];
