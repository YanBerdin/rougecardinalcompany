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
// MEDIA TAGS & FOLDERS - SERVER SCHEMAS (bigint)
// =============================================================================

/**
 * Schema for media tag (server-side, bigint IDs)
 */
export const MediaTagSchema = z.object({
    id: z.coerce.bigint(),
    name: z.string().min(1).max(50),
    slug: z.string().min(1).max(60),
    description: z.string().max(200).nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});

/**
 * Schema for media folder (server-side, bigint IDs)
 */
export const MediaFolderSchema = z.object({
    id: z.coerce.bigint(),
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(110),
    description: z.string().max(300).nullable(),
    parent_id: z.coerce.bigint().nullable(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});

/**
 * Schema for extended media item with tags and folder (server-side, bigint IDs)
 */
export const MediaItemExtendedSchema = z.object({
    id: z.coerce.bigint(),
    storage_path: z.string().min(1),
    filename: z.string().nullable(),
    mime: z.string().nullable(),
    size_bytes: z.number().int().nonnegative().nullable(),
    alt_text: z.string().nullable(),
    folder_id: z.coerce.bigint().nullable(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
    tags: z.array(MediaTagSchema).default([]),
    folder: MediaFolderSchema.nullable(),
});

// =============================================================================
// MEDIA TAGS & FOLDERS - UI/DTO SCHEMAS (number)
// =============================================================================

/**
 * Schema for media tag DTO (UI-safe, number IDs for JSON serialization)
 */
export const MediaTagDTOSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(50),
    slug: z.string().min(1).max(60),
    description: z.string().max(200).nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

/**
 * Schema for media folder DTO (UI-safe, number IDs)
 */
export const MediaFolderDTOSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(110),
    description: z.string().max(300).nullable(),
    parent_id: z.number().int().positive().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

/**
 * Schema for extended media item DTO (UI-safe, number IDs)
 */
export const MediaItemExtendedDTOSchema = z.object({
    id: z.number().int().positive(),
    storage_path: z.string().min(1),
    filename: z.string().nullable(),
    mime: z.string().nullable(),
    size_bytes: z.number().int().nonnegative().nullable(),
    alt_text: z.string().nullable(),
    folder_id: z.number().int().positive().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    tags: z.array(MediaTagDTOSchema).default([]),
    folder: MediaFolderDTOSchema.nullable(),
});

// =============================================================================
// INPUT SCHEMAS FOR CREATE/UPDATE
// =============================================================================

/**
 * Input schema for creating/updating media tags
 */
export const MediaTagInputSchema = z.object({
    name: z.string().min(1, "Le nom est requis").max(50),
    description: z.string().max(200).nullable().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide").nullable().optional(),
});

/**
 * Input schema for creating/updating media folders
 */
export const MediaFolderInputSchema = z.object({
    name: z.string().min(1, "Le nom est requis").max(100),
    description: z.string().max(300).nullable().optional(),
    parent_id: z.number().int().positive().nullable().optional(),
});

// =============================================================================
// BULK OPERATION SCHEMAS
// =============================================================================

/**
 * Base schema for bulk operations (max 50 items)
 */
export const BulkOperationSchema = z.object({
    media_ids: z.array(z.number().int().positive()).min(1, "Au moins un média requis").max(50, "Maximum 50 médias"),
});

/**
 * Schema for bulk move operation
 */
export const BulkMoveSchema = BulkOperationSchema.extend({
    folder_id: z.number().int().positive().nullable(),
});

/**
 * Schema for bulk tag operation
 */
export const BulkTagSchema = BulkOperationSchema.extend({
    tag_ids: z.array(z.number().int().positive()).min(1, "Au moins un tag requis").max(10, "Maximum 10 tags"),
});

/**
 * Schema for bulk delete operation
 */
export const BulkDeleteSchema = BulkOperationSchema;

// =============================================================================
// TYPES
// =============================================================================

export type MediaItem = z.infer<typeof MediaItemSchema>;
export type MediaSelectResult = z.infer<typeof MediaSelectResultSchema>;
export type MediaSearchItem = z.infer<typeof MediaSearchItemSchema>;
export type MediaPickerMode = z.infer<typeof MediaPickerModeSchema>;
export type MediaUploadInput = z.infer<typeof MediaUploadInputSchema>;
export type ExternalUrlInput = z.infer<typeof ExternalUrlInputSchema>;

// Server types (bigint)
export type MediaTag = z.infer<typeof MediaTagSchema>;
export type MediaFolder = z.infer<typeof MediaFolderSchema>;
export type MediaItemExtended = z.infer<typeof MediaItemExtendedSchema>;

// DTO types (number)
export type MediaTagDTO = z.infer<typeof MediaTagDTOSchema>;
export type MediaFolderDTO = z.infer<typeof MediaFolderDTOSchema>;
export type MediaItemExtendedDTO = z.infer<typeof MediaItemExtendedDTOSchema>;

// Input types
export type MediaTagInput = z.infer<typeof MediaTagInputSchema>;
export type MediaFolderInput = z.infer<typeof MediaFolderInputSchema>;

// Bulk operation types
export type BulkOperation = z.infer<typeof BulkOperationSchema>;
export type BulkMove = z.infer<typeof BulkMoveSchema>;
export type BulkTag = z.infer<typeof BulkTagSchema>;
export type BulkDelete = z.infer<typeof BulkDeleteSchema>;


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
