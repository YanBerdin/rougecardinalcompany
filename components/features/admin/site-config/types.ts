import type { DisplayToggleDTO } from "@/lib/schemas/site-config";

export interface DisplayTogglesViewProps {
    homeToggles: DisplayToggleDTO[];
    presseToggles: DisplayToggleDTO[];
    agendaToggles: DisplayToggleDTO[];
    contactToggles: DisplayToggleDTO[];
}

export interface ToggleSectionConfig {
    id: string;
    title: string;
    description: string;
}

export interface ToggleSectionProps {
    config: ToggleSectionConfig;
    toggles: DisplayToggleDTO[];
    updatingKey: string | null;
    onToggle: (key: string, enabled: boolean) => Promise<void>;
}

export interface ToggleCardProps {
    toggle: DisplayToggleDTO;
    onToggle: (key: string, enabled: boolean) => Promise<void>;
    isUpdating: boolean;
}
