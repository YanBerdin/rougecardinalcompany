"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { MediaItemExtendedDTO, MediaFolderDTO, MediaTagDTO } from "@/lib/schemas/media";

export type MetadataFormValues = {
    alt_text?: string | null;
    folder_id?: number | null;
};

interface MediaEditFormProps {
    form: UseFormReturn<MetadataFormValues>;
    folders: MediaFolderDTO[];
    tags: MediaTagDTO[];
    media: MediaItemExtendedDTO;
    onSubmit: (
        data: MetadataFormValues,
        tagsToAdd: number[],
        tagsToRemove: number[],
    ) => Promise<void>;
    isUpdating: boolean;
    isDeleting: boolean;
}

export function MediaEditForm({
    form,
    folders,
    tags,
    media,
    onSubmit,
    isUpdating,
    isDeleting,
}: MediaEditFormProps) {
    const [lastMediaId, setLastMediaId] = useState(media.id);
    const [selectedTagsToAdd, setSelectedTagsToAdd] = useState<number[]>([]);
    const [selectedTagsToRemove, setSelectedTagsToRemove] = useState<number[]>([]);

    // Derived state reset: reset tag selections when media changes (avoids useEffect + setState pattern)
    if (lastMediaId !== media.id) {
        setLastMediaId(media.id);
        setSelectedTagsToAdd([]);
        setSelectedTagsToRemove([]);
    }

    const assignedTags = media.tags ?? [];
    const assignedTagIds = assignedTags.map(t => t.id);
    const availableTags = tags.filter(tag => !assignedTagIds.includes(tag.id));

    const handleFormSubmit = (data: MetadataFormValues) => {
        return onSubmit(data, selectedTagsToAdd, selectedTagsToRemove);
    };

    return (
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Alt Text */}
            <div className="space-y-2">
                <Label htmlFor="alt_text">Texte alternatif</Label>
                <Input
                    id="alt_text"
                    placeholder="Description pour accessibilité"
                    {...form.register("alt_text")}
                />
            </div>

            {/* Folder */}
            <div className="space-y-2">
                <Label htmlFor="folder">Dossier</Label>
                <Select
                    value={form.watch("folder_id")?.toString() ?? "none"}
                    onValueChange={(value) =>
                        form.setValue("folder_id", value === "none" ? null : Number(value))
                    }
                >
                    <SelectTrigger id="folder">
                        <SelectValue placeholder="Uploads génériques" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Uploads génériques</SelectItem>
                        {folders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id.toString()}>
                                {folder.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Tags */}
            <div className="space-y-3">
                <Label>Tags</Label>

                {assignedTags.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Tags attribués (cliquez pour retirer) :</p>
                        <div className="flex flex-wrap gap-2">
                            {assignedTags.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant={selectedTagsToRemove.includes(tag.id) ? "destructive" : "default"}
                                    className={cn(
                                        "cursor-pointer transition-all hover:scale-105",
                                        selectedTagsToRemove.includes(tag.id) && "opacity-50"
                                    )}
                                    onClick={() => setSelectedTagsToRemove((prev) =>
                                        prev.includes(tag.id)
                                            ? prev.filter(id => id !== tag.id)
                                            : [...prev, tag.id]
                                    )}
                                >
                                    {tag.name}
                                    {selectedTagsToRemove.includes(tag.id) && " ✕"}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {availableTags.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Tags disponibles (cliquez pour ajouter) :</p>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant={selectedTagsToAdd.includes(tag.id) ? "default" : "outline"}
                                    className={cn(
                                        "cursor-pointer transition-all hover:scale-95",
                                        selectedTagsToAdd.includes(tag.id) && "ring-2 ring-primary"
                                    )}
                                    onClick={() => setSelectedTagsToAdd((prev) =>
                                        prev.includes(tag.id)
                                            ? prev.filter(id => id !== tag.id)
                                            : [...prev, tag.id]
                                    )}
                                >
                                    {selectedTagsToAdd.includes(tag.id) && "✓ "}
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {assignedTags.length === 0 && availableTags.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Aucun tag disponible</p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={isUpdating || isDeleting}
            >
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Mise à jour..." : "Enregistrer"}
            </Button>
        </form>
    );
}
