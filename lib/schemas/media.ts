/**
 * @file Media Schemas
 * @description Zod schemas for media validation (upload, library, external URLs)
 * @module lib/schemas/media
 */
import { z } from "zod";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Allowed MIME types for image uploads
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/**
 * Maximum file size for uploads (5MB)
 */
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

// =============================================================================
// SCHEMAS
// =============================================================================

/**
 * Schema for media item from database (table: medias)
 */
export const MediaItemSchema = z.object({
    id: z.number().int().positive(),
    storage_path: z.string().min(1),
    filename: z.string().nullable(),
    mime: z.string().nullable(),
    size_bytes: z.number().int().nonnegative().nullable(),
    alt_text: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

/**
 * Schema for media selection result (from library or upload)
 * @property error - Optional error message if selection failed
 */
export const MediaSelectResultSchema = z.object({
    id: z.number().int().positive(),
    url: z.string().url(),
    error: z.string().optional(),
});

/**
 * Schema for media search result item
 */
export const MediaSearchItemSchema = z.object({
    id: z.number().int().positive(),
    url: z.string().url(),
    name: z.string(),
    mime: z.string().nullable(),
    alt_text: z.string().nullable(),
});

/**
 * Schema for media picker mode
 */
export const MediaPickerModeSchema = z.enum(["upload", "library", "external-url"]);

/**
 * Schema for media upload input validation
 */
export const MediaUploadInputSchema = z.object({
    filename: z.string().min(1).max(255),
    mime: z.enum(ALLOWED_IMAGE_MIME_TYPES),
    size_bytes: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
    alt_text: z.string().max(500).optional(),
});

/**
 * Schema for external URL input
 */
export const ExternalUrlInputSchema = z.object({
    url: z.string().url("URL invalide"),
    alt_text: z.string().max(500).optional(),
});

// =============================================================================
// TYPES
// =============================================================================

export type MediaItem = z.infer<typeof MediaItemSchema>;
export type MediaSelectResult = z.infer<typeof MediaSelectResultSchema>;
export type MediaSearchItem = z.infer<typeof MediaSearchItemSchema>;
export type MediaPickerMode = z.infer<typeof MediaPickerModeSchema>;
export type MediaUploadInput = z.infer<typeof MediaUploadInputSchema>;
export type ExternalUrlInput = z.infer<typeof ExternalUrlInputSchema>;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for allowed MIME types
 */
export function isAllowedImageMimeType(
    mime: string
): mime is AllowedImageMimeType {
    return ALLOWED_IMAGE_MIME_TYPES.includes(mime as AllowedImageMimeType);
}
