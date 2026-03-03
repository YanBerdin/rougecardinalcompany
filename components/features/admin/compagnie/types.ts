import type {
    CompagnieValueDTO,
    PresentationSectionDTO,
} from "@/lib/schemas/compagnie-admin";

// ─── Valeurs ──────────────────────────────────────────────────────────────────

export interface ValuesViewProps {
    initialValues: Array<Omit<CompagnieValueDTO, "id"> & { id: string }>;
}

export interface ValueFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item?: (Omit<CompagnieValueDTO, "id"> & { id: string }) | null;
}

// ─── Présentation ─────────────────────────────────────────────────────────────

export interface PresentationViewProps {
    initialSections: Array<Omit<PresentationSectionDTO, "id"> & { id: string }>;
}

export interface PresentationFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item?: (Omit<PresentationSectionDTO, "id"> & { id: string }) | null;
}
