import type { DisplayToggleDTO } from "@/lib/schemas/site-config";

export interface DisplayTogglesViewProps {
    homeToggles: DisplayToggleDTO[];
    presseToggles: DisplayToggleDTO[];
    agendaToggles: DisplayToggleDTO[];
    contactToggles: DisplayToggleDTO[];
}

export interface ToggleCardProps {
    toggle: DisplayToggleDTO;
    onToggle: (key: string, enabled: boolean) => Promise<void>;
    isUpdating: boolean;
}
