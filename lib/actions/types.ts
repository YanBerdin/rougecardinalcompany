/**
 * @file Action Result Types
 * @description Standardized return types for Server Actions
 * @module lib/actions/types
 * 
 * RATIONALE:
 * - Consistent error handling across all actions
 * - Type-safe discriminated unions
 * - Better IDE autocomplete and type inference
 */

// =============================================================================
// GENERIC ACTION RESULT
// =============================================================================

/**
 * Standard result type for Server Actions
 * 
 * Uses discriminated unions for exhaustive type checking
 * 
 * @example
 * ```typescript
 * async function myAction(): Promise<ActionResult<User>> {
 *   try {
 *     const user = await db.getUser();
 *     return { success: true, data: user };
 *   } catch (error) {
 *     return { 
 *       success: false, 
 *       error: error instanceof Error ? error.message : "Unknown error" 
 *     };
 *   }
 * }
 * 
 * // Usage
 * const result = await myAction();
 * if (result.success) {
 *   console.log(result.data.name); // ✅ Type-safe access
 * } else {
 *   console.error(result.error); // ✅ Type-safe error
 * }
 * ```
 */
export type ActionResult<T = void> =
    | (T extends void ? { success: true } : { success: true; data: T })
    | { success: false; error: string };

// =============================================================================
// MEDIA UPLOAD TYPES
// =============================================================================

/**
 * Successful media upload result
 * 
 * @property mediaId - Database ID from medias table
 * @property publicUrl - Public URL for the uploaded file
 * @property storagePath - Internal storage path (for reference)
 * @property isDuplicate - True if file already existed (hash match)
 * @property warning - Optional warning message (e.g., thumbnail generation failed)
 */
export interface MediaUploadData {
    mediaId: number;
    publicUrl: string;
    storagePath: string;
    isDuplicate?: boolean;
    warning?: string;
}

/**
 * Media upload action result
 * 
 * Type alias for consistency with existing codebase
 * 
 * @example
 * ```typescript
 * const result: MediaUploadResult = await uploadMediaImage(formData);
 * if (result.success) {
 *   console.log(`Uploaded to: ${result.data.publicUrl}`);
 * }
 * ```
 */
export type MediaUploadResult = ActionResult<MediaUploadData>;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for successful action results
 * 
 * Narrows ActionResult<T> to success branch
 * 
 * @example
 * ```typescript
 * const result = await myAction();
 * if (isActionSuccess(result)) {
 *   // TypeScript knows result.data exists here
 *   return result.data;
 * }
 * ```
 */
export function isActionSuccess<T>(
    result: ActionResult<T>
): result is T extends void ? { success: true } : { success: true; data: T } {
    return result.success === true;
}

/**
 * Type guard for failed action results
 * 
 * Narrows ActionResult<T> to error branch
 */
export function isActionError<T>(
    result: ActionResult<T>
): result is { success: false; error: string } {
    return result.success === false;
}
