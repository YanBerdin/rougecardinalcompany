/**
 * @file MediaFolderFormDialog - Create/edit dialog for media folders
 * @description Separated from MediaFoldersView for SRP compliance
 */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { MediaFolderDTO } from "@/lib/schemas/media";
import {
    createMediaFolderAction,
    updateMediaFolderAction,
} from "@/lib/actions/media-folders-actions";

export interface MediaFolderFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    folder: MediaFolderDTO | null;
    allFolders: MediaFolderDTO[];
    isSubmitting: boolean;
    setIsSubmitting: (value: boolean) => void;
}

export function MediaFolderFormDialog({
    open,
    onClose,
    onSuccess,
    folder,
    allFolders,
    isSubmitting,
    setIsSubmitting,
}: MediaFolderFormDialogProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [parentId, setParentId] = useState<string>("root");

    useEffect(() => {
        if (folder) {
            setName(folder.name);
            setSlug(folder.slug);
            setDescription(folder.description || "");
            setParentId(folder.parent_id ? String(folder.parent_id) : "root");
        } else {
            setName("");
            setSlug("");
            setDescription("");
            setParentId("root");
        }
    }, [folder]);

    const generateSlug = (value: string): string => {
        return value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    };

    const handleNameChange = (value: string) => {
        setName(value);
        if (!folder) {
            setSlug(generateSlug(value));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const input = {
                name,
                slug: slug || generateSlug(name),
                description: description || null,
                parent_id: parentId && parentId !== "root" ? Number(parentId) : null,
            };

            const result = folder
                ? await updateMediaFolderAction(folder.id, input)
                : await createMediaFolderAction(input);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(folder ? "Dossier mis à jour" : "Dossier créé");
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter out current folder to prevent circular references
    const availableParents = allFolders.filter((f) => !folder || f.id !== folder.id);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {folder ? "Modifier le dossier" : "Créer un dossier"}
                        </DialogTitle>
                        <DialogDescription>
                            Les dossiers permettent d&lsquo;organiser vos médias en hiérarchie
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                                Le <strong>slug</strong> doit correspondre à un dossier existant dans Storage
                                (<code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">medias/{"{slug}"}/</code>).
                                Les médias sont automatiquement liés au dossier selon leur chemin.
                            </AlertDescription>
                        </Alert>

                        <div>
                            <Label htmlFor="folder-name">Nom *</Label>
                            <Input
                                id="folder-name"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                required
                                aria-required="true"
                                maxLength={100}
                                placeholder="Ex: Spectacles, Presse"
                            />
                        </div>

                        <div>
                            <Label htmlFor="folder-slug">Slug (chemin Storage) *</Label>
                            <Input
                                id="folder-slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                required
                                aria-required="true"
                                maxLength={100}
                                placeholder="ex: spectacles, press"
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Chemin dans Storage : <code>medias/{slug || "..."}/</code>
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="folder-description">Description</Label>
                            <Textarea
                                id="folder-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={300}
                                placeholder="Description optionnelle"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="folder-parent">Dossier parent</Label>
                            <Select value={parentId} onValueChange={setParentId}>
                                <SelectTrigger id="folder-parent">
                                    <SelectValue placeholder="Aucun parent (racine)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="root">Aucun parent (racine)</SelectItem>
                                    {availableParents.map((f) => (
                                        <SelectItem key={f.id} value={String(f.id)}>
                                            {f.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Enregistrement..."
                                : folder
                                    ? "Mettre à jour"
                                    : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
