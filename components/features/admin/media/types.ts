/**
 * @file Media Component Types
 * @description Props interfaces for media picker components
 *
 * Zod schemas and validation are in lib/schemas/media.ts
 * This file contains component-specific props interfaces (colocation pattern)
 */

import type { MediaSelectResult } from "@/lib/schemas/media";

// Re-export commonly used types from schemas for convenience
export type {
    MediaItem,
    MediaSelectResult,
    MediaSearchItem,
    MediaPickerMode,
    MediaUploadInput,
    ExternalUrlInput,
    AllowedImageMimeType,
} from "@/lib/schemas/media";

// Re-export constants and type guards
export {
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_UPLOAD_SIZE_BYTES,
    isAllowedImageMimeType,
} from "@/lib/schemas/media";

// =============================================================================
// COMPONENT PROPS
// =============================================================================

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
