"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateMediaMetadataAction, deleteMediaImage } from "@/lib/actions/media-actions";
import { MediaItemSchema, type MediaItemExtendedDTO, type MediaFolderDTO, type MediaTagDTO } from "@/lib/schemas/media";
import { getMediaPublicUrl } from "@/lib/dal/media";
import { cn } from "@/lib/utils";

interface MediaDetailsPanelProps {
    media: MediaItemExtendedDTO | null;
    folders: MediaFolderDTO[];
    tags: MediaTagDTO[];
    onClose: () => void;
    onUpdate: () => void;
}

const MetadataFormSchema = MediaItemSchema.pick({
    alt_text: true,
    description: true,
    folder_id: true,
}).partial();

type MetadataFormValues = {
    alt_text?: string | null;
    description?: string | null;
    folder_id?: number | null;
};

export function MediaDetailsPanel({
    media,
    folders,
    tags,
    onClose,
    onUpdate,
}: MediaDetailsPanelProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [publicUrl, setPublicUrl] = useState<string>("");

    const form = useForm<MetadataFormValues>({
        resolver: zodResolver(MetadataFormSchema),
        defaultValues: {
            alt_text: media?.alt_text ?? "",
            folder_id: media?.folder_id ?? undefined,
        },
    });

    useEffect(() => {
        if (media) {
            form.reset({
                alt_text: media.alt_text ?? "",
                folder_id: media.folder_id ?? undefined,
            });
            setSelectedTags(media.tags?.map((t) => t.id) ?? []);

            const resolveUrl = async () => {
                const url = await getMediaPublicUrl(media.storage_path);
                setPublicUrl(url);
            };
            resolveUrl();
        } else {
            setPublicUrl("");
        }
    }, [media, form]);

    if (!media) {
        return null;
    }

    const handleUpdate = async (data: MetadataFormValues) => {
        setIsUpdating(true);
        try {
            const result = await updateMediaMetadataAction(media.id, {
                alt_text: data.alt_text,
                folder_id: data.folder_id,
                tag_ids: selectedTags,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Métadonnées mises à jour");
            onUpdate();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur mise à jour");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Supprimer définitivement ce média ?")) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteMediaImage(media.id);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Média supprimé");
            onClose();
            onUpdate();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleTag = (tagId: number) => {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    };

    const fileSize = media.size_bytes
        ? `${(media.size_bytes / 1024 / 1024).toFixed(2)} MB`
        : "N/A";

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] border-l bg-background shadow-lg">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Détails du média</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        {/* Preview */}
                        <div className="aspect-video rounded-md overflow-hidden bg-muted relative">
                            <Image
                                src={publicUrl}
                                alt={media.alt_text ?? media.filename ?? "Media preview"}
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* File Info */}
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm font-medium">Nom du fichier</p>
                                <p className="text-sm text-muted-foreground break-all">
                                    {media.filename}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm font-medium">Type</p>
                                    <p className="text-sm text-muted-foreground">{media.mime}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Taille</p>
                                    <p className="text-sm text-muted-foreground">{fileSize}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Edit Form */}
                        <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                            {/* Alt Text */}
                            <div className="space-y-2">
                                <Label htmlFor="alt_text">Texte alternatif</Label>
                                <Input
                                    id="alt_text"
                                    placeholder="Description pour accessibilité"
                                    {...form.register("alt_text")}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Description détaillée"
                                    rows={3}
                                    {...form.register("description")}
                                />
                            </div>

                            {/* Folder */}
                            <div className="space-y-2">
                                <Label htmlFor="folder">Dossier</Label>
                                <Select
                                    value={form.watch("folder_id")?.toString() ?? ""}
                                    onValueChange={(value) =>
                                        form.setValue("folder_id", value ? Number(value) : null)
                                    }
                                >
                                    <SelectTrigger id="folder">
                                        <SelectValue placeholder="Aucun dossier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Aucun dossier</SelectItem>
                                        {folders.map((folder) => (
                                            <SelectItem key={folder.id} value={folder.id.toString()}>
                                                {folder.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                                            className={cn(
                                                "cursor-pointer transition-colors",
                                                selectedTags.includes(tag.id) && tag.color
                                                    ? `bg-[${tag.color}] hover:bg-[${tag.color}]/80`
                                                    : ""
                                            )}
                                            onClick={() => toggleTag(tag.id)}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
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

                        <Separator />

                        {/* Delete */}
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleDelete}
                            disabled={isUpdating || isDeleting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? "Suppression..." : "Supprimer le média"}
                        </Button>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
