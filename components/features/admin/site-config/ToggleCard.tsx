import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { ToggleCardProps } from "./types";

export function ToggleCard({ toggle, onToggle, isUpdating }: ToggleCardProps) {
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
                <div className="mt-2 flex gap-2">
                    {toggle.value.max_items && (
                        <Badge variant="outline">Max: {toggle.value.max_items}</Badge>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                <Switch
                    id={toggle.key}
                    checked={toggle.value.enabled}
                    onCheckedChange={(checked) => onToggle(toggle.key, checked)}
                    disabled={isUpdating}
                    aria-label={`Toggle ${sectionName}`}
                />
            </div>
        </div>
    );
}

function getSectionName(key: string): string {
    const names: Record<string, string> = {
        "public:home:newsletter": "Newsletter",
        "public:home:partners": "Partenaires",
        "public:home:spectacles": "Spectacles à la une",
        "public:home:news": "Actualités",
        "public:presse:media_kit": "Kit Média",
    };

    return names[key] || key;
}
