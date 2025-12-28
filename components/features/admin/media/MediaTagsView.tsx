/**
 * @file Media Tags View (Client Component)
 * @description Interactive list and CRUD UI for media tags
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Tag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import type { MediaTagDTO } from "@/lib/schemas/media";
import {
    createMediaTagAction,
    updateMediaTagAction,
    deleteMediaTagAction,
} from "@/lib/actions/media-tags-actions";

interface MediaTagsViewProps {
    initialTags: MediaTagDTO[];
}

export function MediaTagsView({ initialTags }: MediaTagsViewProps) {
    const router = useRouter();
    const [tags, setTags] = useState(initialTags);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<MediaTagDTO | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync local state with props changes
    useEffect(() => {
        setTags(initialTags);
    }, [initialTags]);

    const handleCreate = useCallback(() => {
        setEditingTag(null);
        setIsFormOpen(true);
    }, []);

    const handleEdit = useCallback((tag: MediaTagDTO) => {
        setEditingTag(tag);
        setIsFormOpen(true);
    }, []);

    const handleDelete = useCallback(
        async (tag: MediaTagDTO) => {
            if (!confirm(`Supprimer le tag "${tag.name}" ?`)) return;

            try {
                const result = await deleteMediaTagAction(tag.id);

                if (!result.success) {
                    throw new Error(result.error);
                }

                toast.success("Tag supprimé");
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Erreur lors de la suppression"
                );
            }
        },
        [router]
    );

    const handleFormSuccess = useCallback(() => {
        setIsFormOpen(false);
        setEditingTag(null);
        router.refresh();
    }, [router]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/admin/media")}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {tags.length} tag{tags.length !== 1 ? "s" : ""}
                </p>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un tag
                </Button>
            </div>

            {tags.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                    <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">Aucun tag</p>
                    <p className="text-sm text-muted-foreground">
                        Créez votre premier tag pour organiser vos médias
                    </p>
                </div>
            ) : (
                <div className="w-full space-y-4">
                    {/* MOBILE VIEW (Cards) - Visible only on small screens (< 640px) */}
                    <div className="grid grid-cols-1 gap-4 sm:hidden">
                        {tags.map((tag) => (
                            <div
                                key={tag.id}
                                className="bg-card rounded-lg border shadow-sm p-4 space-y-4"
                            >
                                {/* Header: Nom et Couleur */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <h3 className="font-semibold text-base leading-tight text-foreground">
                                            {tag.name}
                                        </h3>
                                        {tag.color && (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded border"
                                                    style={{ backgroundColor: tag.color }}
                                                />
                                                <span className="text-sm font-mono text-muted-foreground">
                                                    {tag.color}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Body: Description */}
                                {tag.description && (
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Description</span>
                                        <p className="text-sm text-foreground">
                                            {tag.description}
                                        </p>
                                    </div>
                                )}

                                {/* Footer: Actions */}
                                <div className="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(tag)}
                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-10 min-w-[56px] px-3"
                                        aria-label={`Éditer ${tag.name}`}
                                    >
                                        <Edit className="h-5 w-5 mr-2" /> Éditer
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(tag)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 min-w-[56px] px-3"
                                        aria-label={`Supprimer ${tag.name}`}
                                    >
                                        <Trash2 className="h-5 w-5 mr-2" /> Supprimer
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DESKTOP VIEW (Table) - Visible only on larger screens (>= 640px) */}
                    <div className="hidden sm:block rounded-md border bg-card shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[25%]">Nom</TableHead>
                                    <TableHead className="hidden md:table-cell w-[35%]">Description</TableHead>
                                    <TableHead className="w-[20%]">Couleur</TableHead>
                                    <TableHead className="text-right w-[20%]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tags.map((tag) => (
                                    <TableRow key={tag.id}>
                                        <TableCell className="font-medium">{tag.name}</TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">
                                            {tag.description || "—"}
                                        </TableCell>
                                        <TableCell>
                                            {tag.color ? (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-6 h-6 rounded border"
                                                        style={{ backgroundColor: tag.color }}
                                                    />
                                                    <span className="text-sm font-mono">
                                                        {tag.color}
                                                    </span>
                                                </div>
                                            ) : (
                                                "—"
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(tag)}
                                                    title="Modifier"
                                                    className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-amber-100 hover:text-amber-700"
                                                    aria-label={`Éditer ${tag.name}`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(tag)}
                                                    title="Supprimer"
                                                    className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-100 hover:text-red-700"
                                                    aria-label={`Supprimer ${tag.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <MediaTagFormDialog
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                tag={editingTag}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        </div>
    );
}

interface MediaTagFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tag: MediaTagDTO | null;
    isSubmitting: boolean;
    setIsSubmitting: (value: boolean) => void;
}

function MediaTagFormDialog({
    open,
    onClose,
    onSuccess,
    tag,
    isSubmitting,
    setIsSubmitting,
}: MediaTagFormDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("");

    useEffect(() => {
        if (tag) {
            setName(tag.name);
            setDescription(tag.description || "");
            setColor(tag.color || "");
        } else {
            setName("");
            setDescription("");
            setColor("");
        }
    }, [tag]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const input = {
                name,
                description: description || null,
                color: color || null,
            };

            const result = tag
                ? await updateMediaTagAction(tag.id, input)
                : await createMediaTagAction(input);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(tag ? "Tag mis à jour" : "Tag créé");
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{tag ? "Modifier le tag" : "Créer un tag"}</DialogTitle>
                        <DialogDescription>
                            Les tags permettent de catégoriser vos médias
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                maxLength={50}
                                placeholder="Ex: Spectacles, Presse"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={200}
                                placeholder="Description optionnelle"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="color">Couleur</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="color"
                                    type="color"
                                    value={color || "#000000"}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-20"
                                />
                                <Input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="#000000"
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    className="flex-1 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Enregistrement..." : tag ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
