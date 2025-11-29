/**
 * @file Media Types
 * @description Types and props for media picker components
 *
 * Schemas and validation are in lib/schemas/media.ts
 * This file contains component props interfaces
 */

// Re-export schemas, types and constants from centralized location
export {
    // Schemas
    MediaItemSchema,
    MediaSelectResultSchema,
    MediaSearchItemSchema,
    MediaPickerModeSchema,
    MediaUploadInputSchema,
    ExternalUrlInputSchema,
    // Types
    type MediaItem,
    type MediaSelectResult,
    type MediaSearchItem,
    type MediaPickerMode,
    type MediaUploadInput,
    type ExternalUrlInput,
    // Constants
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_UPLOAD_SIZE_BYTES,
    type AllowedImageMimeType,
    // Type guards
    isAllowedImageMimeType,
} from "@/lib/schemas/media";

// =============================================================================
// COMPONENT PROPS
// =============================================================================

import type { MediaSelectResult } from "@/lib/schemas/media";

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
