import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { ToggleCardProps } from "./types";

const SECTION_NAMES: Record<string, string> = {
    "display_toggle_home_newsletter": "Newsletter",
    "display_toggle_home_partners": "Partenaires",
    "display_toggle_home_spectacles": "Spectacles à la une",
    "display_toggle_home_a_la_une": "Actualités",
    "display_toggle_home_hero": "Hero Banner",
    "display_toggle_home_about": "À propos",
    "display_toggle_media_kit": "Kit Média",
    "display_toggle_presse_articles": "Communiqués de Presse",
    "display_toggle_agenda_newsletter": "Newsletter Agenda",
    "display_toggle_contact_newsletter": "Newsletter Contact",
};

function getSectionName(key: string): string {
    return SECTION_NAMES[key] ?? key;
}

export function ToggleCard({ toggle, onToggle, isUpdating }: ToggleCardProps): React.JSX.Element {
    const sectionName = getSectionName(toggle.key);

    return (
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 bg-chart-7 hover:shadow-lg hover:bg-background/50 transition-colors duration-300">
            <div className="flex-1 space-y-0.5">
                <Label htmlFor={toggle.key} className="text-base font-medium">
                    {sectionName}
                </Label>
                {toggle.description && (
                    <p className="text-sm text-muted-foreground">
                        {toggle.description}
                    </p>
                )}
                {toggle.value.max_items && (
                    <div className="mt-2 flex gap-2">
                        <Badge variant="outline">Max: {toggle.value.max_items}</Badge>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {isUpdating && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                <Switch
                    id={toggle.key}
                    checked={toggle.value.enabled}
                    onCheckedChange={(checked) => onToggle(toggle.key, checked)}
                    disabled={isUpdating}
                    aria-label={`${toggle.value.enabled ? "Désactiver" : "Activer"} ${sectionName}`}
                />
            </div>
        </div>
    );
}
