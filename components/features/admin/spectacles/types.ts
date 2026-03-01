import type { UseFormReturn } from "react-hook-form";
import type {
    SpectacleSummary,
    GalleryPhotoTransport,
    SpectaclePhotoTransport,
} from "@/lib/schemas/spectacles";
import type { SpectacleFormValues } from "@/lib/forms/spectacle-form-helpers";
import type {
    SortField,
    SpectacleSortState,
} from "@/lib/tables/spectacle-table-helpers";

// ============================================================================
// Container / Table
// ============================================================================

export interface SpectaclesManagementContainerProps {
    initialSpectacles: SpectacleSummary[];
}

export interface SpectaclesTableProps {
    spectacles: SpectacleSummary[];
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onGallery: (id: number) => void;
    sortState: SpectacleSortState | null;
    onSort: (field: SortField) => void;
}

// ============================================================================
// Gallery
// ============================================================================

export interface SpectacleGalleryManagerProps {
    spectacleId: number;
}

export interface SortableGalleryCardProps {
    photo: GalleryPhotoTransport;
    isPending: boolean;
    onDelete: (photo: GalleryPhotoTransport) => void;
}

// ============================================================================
// Photo Manager
// ============================================================================

export interface SpectaclePhotoManagerProps {
    spectacleId: number;
}

export interface PhotoSlot {
    ordre: number;
    /** Transport type — uses string IDs to avoid BigInt serialisation errors */
    photo: SpectaclePhotoTransport | null;
}

// ============================================================================
// Form
// ============================================================================

export interface SpectacleFormProps {
    defaultValues?: Partial<SpectacleFormValues>;
    spectacleId?: number;
    onSuccess?: () => void;
    existingGenres?: string[];
}

export interface SpectacleFormFieldsProps {
    form: UseFormReturn<SpectacleFormValues>;
    isPublic: boolean;
}

export interface SpectacleFormMetadataProps {
    form: UseFormReturn<SpectacleFormValues>;
    isPublic: boolean;
    existingGenres?: string[];
}

export interface SpectacleFormImageSectionProps {
    form: UseFormReturn<SpectacleFormValues>;
    isPublic: boolean;
    spectacleId?: number;
    onValidationChange: (isValid: boolean | null) => void;
}
