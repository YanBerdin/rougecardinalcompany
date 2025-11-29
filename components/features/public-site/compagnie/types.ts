/**
 * @file Compagnie Types
 * @description Types for compagnie feature components
 *
 * Schemas are centralized in lib/schemas/compagnie.ts
 * PresentationSection is owned by the DAL
 */

// Re-export schemas and types from centralized location
export {
  ValueSchema,
  TeamMemberSchema,
  type Value,
  type TeamMember,
} from "@/lib/schemas/compagnie";

// PresentationSection type is defined in DAL (owns DB mapping)
export type { PresentationSection } from "@/lib/dal/compagnie-presentation";

// =============================================================================
// VIEW PROPS
// =============================================================================

import type { Value, TeamMember } from "@/lib/schemas/compagnie";
import type { PresentationSection } from "@/lib/dal/compagnie-presentation";

/**
 * Props for the CompagnieView component
 */
export interface CompagnieViewProps {
  sections: PresentationSection[];
  values: Value[];
  team: TeamMember[];
  loading?: boolean;
}
