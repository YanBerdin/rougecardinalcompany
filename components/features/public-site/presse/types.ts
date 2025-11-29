/**
 * @file Presse Types
 * @description Types for presse feature components
 *
 * Schemas are centralized in lib/schemas/presse.ts
 * This file only contains ViewProps interfaces
 */

// Re-export schemas and types from centralized location
export {
  PressReleaseSchema,
  MediaArticleSchema,
  MediaKitItemSchema,
  MediaArticleTypeEnum,
  type PressRelease,
  type MediaArticle,
  type MediaKitItem,
  type IconComponent,
} from "@/lib/schemas/presse";

// =============================================================================
// VIEW PROPS
// =============================================================================

import type { PressRelease, MediaArticle, MediaKitItem } from "@/lib/schemas/presse";

/**
 * Props for the PresseView component
 */
export interface PresseViewProps {
  pressReleases: PressRelease[];
  mediaArticles: MediaArticle[];
  mediaKit: MediaKitItem[];
  loading?: boolean;
}
