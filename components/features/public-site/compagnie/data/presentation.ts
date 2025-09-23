// [DEPRECATED FALLBACK] Cette source locale est conservée uniquement comme fallback
// temporaire et comme référence du contenu initial. Les sections de présentation
// sont désormais chargées depuis la BDD via `public.compagnie_presentation_sections`
// et la DAL `lib/dal/compagnie-presentation.ts`. Ne plus importer directement ce fichier
// dans les vues. Préférez `fetchCompagniePresentationSections()`.

//import { z } from 'zod';
/*
export const PresentationSectionSchema = z.object({
  id: z.string(),
  kind: z.enum(['hero','history','quote','values','team','mission','custom']),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.array(z.string()).optional(), // Paragraphes
  image: z.string().optional(),
  quote: z.object({ text: z.string(), author: z.string().optional() }).optional(),
  // Pour values + team on réutilise les props externes existantes
});

export type PresentationSection = z.infer<typeof PresentationSectionSchema>;
*/

import { PresentationSection } from "../types";

export const compagniePresentationFallback: 
// 07c_table_compagnie_presentation > table public.compagnie_presentation_sections
PresentationSection[] = [
  {
    id: 'hero', // slug en bdd
    kind: 'hero',
    title: 'La Compagnie Rouge-Cardinal',
    subtitle: '15 ans de passion pour les arts de la scène'
  },
  {
    id: 'history',
    kind: 'history',
    title: 'Notre Histoire',
    content: [
      "Fondée en 2008 par un collectif de jeunes diplômés des grandes écoles théâtrales françaises, la compagnie Rouge-Cardinal est née d'une envie commune : créer un théâtre qui parle à notre époque tout en puisant dans la richesse du patrimoine dramatique.",
      'Le nom "Rouge-Cardinal" évoque à la fois la passion qui nous anime et la noblesse de notre art. Comme le cardinal, oiseau au plumage éclatant, nous cherchons à apporter couleur et vie sur scène.',
      "Depuis nos débuts, nous avons créé plus de 50 spectacles, tourné dans toute la France et à l'étranger, et remporté plusieurs prix prestigieux pour nos créations originales."
    ],
    image: 'https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'quote-history',
    kind: 'quote',
    quote: {
      text: "Le théâtre doit être un miroir de l'âme humaine, un lieu où l'émotion et la réflexion se rencontrent pour créer du sens et du lien entre les êtres.",
      author: 'Marie Dubois, Directrice artistique'
    }
  },
  { id: 'values', kind: 'values', title: 'Nos Valeurs', subtitle: 'Les principes qui guident notre travail artistique et notre vision du théâtre' },
  { id: 'team', kind: 'team', title: 'Notre Équipe', subtitle: 'Rencontrez les artistes et techniciens qui donnent vie à nos spectacles' },
  {
    id: 'mission',
    kind: 'mission',
    title: 'Notre Mission',
    content: [
      "Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l'art vivant. Nous nous attachons à rendre le théâtre accessible à tous, en développant des projets artistiques de qualité qui résonnent avec les enjeux de notre société.",
      "Notre engagement va au-delà de la simple représentation : nous menons des actions culturelles en milieu scolaire, participons à des festivals, et soutenons la création contemporaine par des résidences d'artistes et des collaborations avec de jeunes talents."
    ]
  }
];
