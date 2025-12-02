// Re-export schemas and types from centralized lib/schemas
export {
  CurrentShowSchema,
  ArchivedShowSchema,
  type CurrentShow,
  type ArchivedShow,
} from "@/lib/schemas/spectacles";

import type { CurrentShow, ArchivedShow } from "@/lib/schemas/spectacles";

// Props pour le composant SpectaclesView
export interface SpectaclesViewProps {
  currentShows: CurrentShow[];
  archivedShows: ArchivedShow[];
  loading?: boolean;
}
