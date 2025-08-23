import { z } from "zod";

// Schema pour les spectacles actuels
export const CurrentShowSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  genre: z.string(),
  duration: z.string(),
  cast: z.number(),
  premiere: z.string(),
  image: z.string(),
  status: z.string(),
  awards: z.array(z.string()),
});

// Schema pour les spectacles archivés
export const ArchivedShowSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  genre: z.string(),
  year: z.string(),
  image: z.string(),
  awards: z.array(z.string()),
});

// Types inférés des schémas
export type CurrentShow = z.infer<typeof CurrentShowSchema>;
export type ArchivedShow = z.infer<typeof ArchivedShowSchema>;

// Props pour le composant SpectaclesView
export interface SpectaclesViewProps {
  currentShows: CurrentShow[];
  archivedShows: ArchivedShow[];
  loading?: boolean;
}
