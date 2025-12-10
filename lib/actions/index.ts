/**
 * @file Actions Barrel Export
 * @description Central export for all reusable Server Actions
 * @module lib/actions
 * 
 * ORGANIZATION:
 * - Types: ActionResult, MediaUploadResult, etc.
 * - Media actions: uploadMediaImage, deleteMediaImage
 * 
 * USAGE:
 * ```typescript
 * import { uploadMediaImage, type ActionResult } from "@/lib/actions";
 * 
 * const result = await uploadMediaImage(formData, "spectacles");
 * if (result.success) {
 *   console.log(result.data.publicUrl);
 * }
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export type {
  ActionResult,
  MediaUploadData,
  MediaUploadResult,
} from "./types";

export { isActionSuccess, isActionError } from "./types";

// =============================================================================
// MEDIA ACTIONS
// =============================================================================

export { uploadMediaImage, deleteMediaImage } from "./media-actions";
