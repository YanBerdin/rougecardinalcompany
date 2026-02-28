/**
 * Unified Media Picker System
 *
 * Three modes available:
 * 1. Upload - Upload new images to storage
 * 2. Library - Search and select from existing media library
 * 3. External URL - Enter an external image URL
 *
 * @example
 * ```tsx
 * //! Mode 1: Upload
 * import { MediaUploadDialog } from "@/components/features/admin/media";
 *
 * <MediaUploadDialog
 *   open={isUploadOpen}
 *   onClose={() => setIsUploadOpen(false)}
 *   onSelect={(result) => console.log(result.id, result.url)}
 * />
 *
 * //! Mode 2: Library
 * import { MediaLibraryPicker } from "@/components/features/admin/media";
 *
 * <MediaLibraryPicker
 *   open={isLibraryOpen}
 *   onClose={() => setIsLibraryOpen(false)}
 *   onSelect={(result) => console.log(result.id, result.url)}
 * />
 *
 * //! Mode 3: External URL
 * import { MediaExternalUrlInput } from "@/components/features/admin/media";
 *
 * <MediaExternalUrlInput
 *   value={imageUrl}
 *   onChange={setImageUrl}
 *   label="URL de l'image"
 * />
 * ```
 */

// Components
export { MediaUploadDialog } from "./MediaUploadDialog";
export { MediaLibraryPicker } from "./MediaLibraryPicker";
export { MediaExternalUrlInput } from "./MediaExternalUrlInput";
export { ImageFieldGroup } from "./ImageFieldGroup";
export { MediaFolderFormDialog } from "./MediaFolderFormDialog";
export { MediaTagFormDialog } from "./MediaTagFormDialog";

// Hooks
export { useMediaLibraryState } from "./hooks/useMediaLibraryState";

// Types (colocated in ./types.ts, schemas in lib/schemas/media.ts)
export type {
    MediaSelectResult,
    MediaItem,
    MediaSearchItem,
    MediaPickerMode,
    MediaUploadDialogProps,
    MediaLibraryPickerProps,
    MediaExternalUrlInputProps,
    AllowedImageMimeType,
} from "./types";

export {
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_UPLOAD_SIZE_BYTES,
    isAllowedImageMimeType,
} from "./types";
