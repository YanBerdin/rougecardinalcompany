/**
 * Media types for unified media picker system
 * Supports 3 modes: upload, library search, external URL
 */

/**
 * Result from selecting a media from the library or uploading
 */
export interface MediaSelectResult {
    id: number;
    url: string;
}

/**
 * Media item from database (table: medias)
 * @see lib/database.types.ts - Tables["medias"]["Row"]
 */
export interface MediaItem {
    id: number;
    storage_path: string;
    filename: string | null;
    mime: string | null;
    size_bytes: number | null;
    alt_text: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Search result item for media library search API
 */
export interface MediaSearchItem {
    id: number;
    url: string;
    name: string;
    mime: string | null;
    alt_text: string | null;
}

/**
 * Available modes for the unified media picker
 */
export type MediaPickerMode = "upload" | "library" | "external-url";

/**
 * Props for the MediaUploadDialog component
 */
export interface MediaUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (result: MediaSelectResult) => void;
}

/**
 * Props for the MediaLibraryPicker component
 */
export interface MediaLibraryPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (result: MediaSelectResult) => void;
}

/**
 * Props for the MediaExternalUrlInput component
 */
export interface MediaExternalUrlInputProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
    label?: string;
    description?: string;
}

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

/**
 * Type guard for allowed MIME types
 */
export function isAllowedImageMimeType(
    mime: string
): mime is AllowedImageMimeType {
    return ALLOWED_IMAGE_MIME_TYPES.includes(mime as AllowedImageMimeType);
}
