/**
 * @file Media Folders View (Client Component)
 * @description Interactive list and CRUD UI for media folders (with hierarchy support)
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Folder, ArrowLeft } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { MediaFolderDTO } from "@/lib/schemas/media";
import {
    createMediaFolderAction,
    updateMediaFolderAction,
    deleteMediaFolderAction,
} from "@/lib/actions/media-folders-actions";

interface MediaFoldersViewProps {
    initialFolders: MediaFolderDTO[];
}

export function MediaFoldersView({ initialFolders }: MediaFoldersViewProps) {
    const router = useRouter();
    const [folders, setFolders] = useState(initialFolders);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState<MediaFolderDTO | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState<MediaFolderDTO | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Sync local state with props changes
    useEffect(() => {
        setFolders(initialFolders);
    }, [initialFolders]);

    const handleCreate = useCallback(() => {
        setEditingFolder(null);
        setIsFormOpen(true);
    }, []);

    const handleEdit = useCallback((folder: MediaFolderDTO) => {
        setEditingFolder(folder);
        setIsFormOpen(true);
    }, []);

    const requestDelete = useCallback((folder: MediaFolderDTO) => {
        setDeleteCandidate(folder);
        setOpenDeleteDialog(true);
    }, []);

    const handleDelete = useCallback(
        async () => {
            if (!deleteCandidate) return;
            setOpenDeleteDialog(false);

            try {
                const result = await deleteMediaFolderAction(deleteCandidate.id);

                if (!result.success) {
                    throw new Error(result.error);
                }

                toast.success("Dossier supprimé");
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Erreur lors de la suppression"
                );
            } finally {
                setDeleteCandidate(null);
            }
        },
        [router, deleteCandidate]
    );

    const handleFormSuccess = useCallback(() => {
        setIsFormOpen(false);
        setEditingFolder(null);
        router.refresh();
    }, [router]);

    // Helper to find parent folder name
    const getParentName = (parentId: number | null): string => {
        if (!parentId) return "—";
        const parent = folders.find((f) => f.id === parentId);
        return parent?.name || "—";
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
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
                    {folders.length} dossier{folders.length !== 1 ? "s" : ""}
                </p>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un dossier
                </Button>
            </div>

            {folders.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                    <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">Aucun dossier</p>
                    <p className="text-sm text-muted-foreground">
                        Créez votre premier dossier pour organiser vos médias
                    </p>
                </div>
            ) : (
                <div className="w-full space-y-4">
                    {/* MOBILE VIEW (Cards) - Visible only on small screens (< 640px) */}
                    <div className="grid grid-cols-1 gap-4 sm:hidden">
                        {folders.map((folder) => (
                            <div
                                key={folder.id}
                                className="bg-card rounded-lg border shadow-sm p-4 space-y-4"
                            >
                                {/* Header: Nom et Parent */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <h3 className="font-semibold text-base leading-tight text-foreground">
                                            {folder.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Parent : {getParentName(folder.parent_id)}
                                        </p>
                                    </div>
                                </div>

                                {/* Body: Description */}
                                {folder.description && (
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Description</span>
                                        <p className="text-sm text-foreground">
                                            {folder.description}
                                        </p>
                                    </div>
                                )}

                                {/* Footer: Actions */}
                                <div className="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(folder)}
                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-10 min-w-[56px] px-3"
                                        aria-label={`Éditer ${folder.name}`}
                                    >
                                        <Edit className="h-5 w-5 mr-2" /> Éditer
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => requestDelete(folder)}
                                        className="hover:text-red-700 hover:bg-red-50 h-10 min-w-[56px] px-3"
                                        aria-label={`Supprimer ${folder.name}`}
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
                                    <TableHead className="w-[20%]">Parent</TableHead>
                                    <TableHead className="text-right w-[20%]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {folders.map((folder) => (
                                    <TableRow key={folder.id}>
                                        <TableCell className="font-medium">{folder.name}</TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">
                                            {folder.description || "—"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {getParentName(folder.parent_id)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(folder)}
                                                    title="Modifier"
                                                    className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-amber-100 hover:text-amber-700"
                                                    aria-label={`Éditer ${folder.name}`}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => requestDelete(folder)}
                                                    title="Supprimer"
                                                    className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-100 hover:text-red-700"
                                                    aria-label={`Supprimer ${folder.name}`}
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

            <MediaFolderFormDialog
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                folder={editingFolder}
                allFolders={folders}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        </div>
    );
}

interface MediaFolderFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    folder: MediaFolderDTO | null;
    allFolders: MediaFolderDTO[];
    isSubmitting: boolean;
    setIsSubmitting: (value: boolean) => void;
}

function MediaFolderFormDialog({
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

    // Filter out current folder and its descendants to prevent circular references
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
                            Les dossiers permettent d'organiser vos médias en hiérarchie
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
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                required
                                maxLength={100}
                                placeholder="Ex: Spectacles, Presse"
                            />
                        </div>

                        <div>
                            <Label htmlFor="slug">Slug (chemin Storage) *</Label>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                required
                                maxLength={100}
                                placeholder="ex: spectacles, press"
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Chemin dans Storage : <code>medias/{slug || "..."}/</code>
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={300}
                                placeholder="Description optionnelle"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="parent">Dossier parent</Label>
                            <Select value={parentId} onValueChange={setParentId}>
                                <SelectTrigger>
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
