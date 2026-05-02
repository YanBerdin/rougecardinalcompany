"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteCompagnieValueAction } from "@/app/(admin)/admin/compagnie/compagnie-values-actions";
import { ValueForm } from "./ValueForm";
import type { ValuesViewProps } from "./types";
import type { CompagnieValueDTO } from "@/lib/schemas/compagnie-admin";

type ValueItem = Omit<CompagnieValueDTO, "id"> & { id: string };

export function ValuesView({ initialValues }: ValuesViewProps) {
    const router = useRouter();
    const [values, setValues] = useState<ValueItem[]>(initialValues);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ValueItem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Sync local state when props change after router.refresh()
    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const handleCreate = useCallback(() => {
        setEditingItem(null);
        setIsFormOpen(true);
    }, []);

    const handleEdit = useCallback((item: ValueItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    }, []);

    const handleFormSuccess = useCallback(() => {
        setIsFormOpen(false);
        setEditingItem(null);
        router.refresh();
    }, [router]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deletingId) return;
        try {
            const result = await deleteCompagnieValueAction(deletingId);
            if (!result.success) throw new Error(result.error);
            toast.success("Valeur supprimée");
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
        } finally {
            setDeletingId(null);
        }
    }, [deletingId, router]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    {values.length} valeur{values.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                    <Link href="/admin/compagnie/valeurs">
                        <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Visualiser</span>
                        </Button>
                    </Link>
                    <Button onClick={handleCreate} size="sm" className="gap-1">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Ajouter
                    </Button>
                </div>
            </div>

            {values.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                    Aucune valeur. Créez-en une pour commencer.
                </p>
            ) : (
                <ul className="space-y-2" aria-label="Liste des valeurs">
                    {values.map((value) => (
                        <li
                            key={value.id}
                            className="bg-card hover:bg-card/50 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{value.title}</span>
                                    <Badge variant={value.active ? "default" : "secondary"}>
                                        {value.active ? "Actif" : "Inactif"}
                                    </Badge>
                                </div>
                                {value.description && (
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                        {value.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex shrink-0 gap-2 max-sm:self-stretch">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    title="Modifier"
                                    onClick={() => handleEdit(value)}
                                    aria-label={`Modifier la valeur ${value.title}`}
                                    className="max-sm:h-10 max-sm:flex-1"
                                >
                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                    <span className="sm:hidden">Modifier</span>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    title="Supprimer"
                                    onClick={() => setDeletingId(value.id)}
                                    aria-label={`Supprimer la valeur ${value.title}`}
                                    className="max-sm:h-10 max-sm:flex-1"
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    <span className="sm:hidden">Supprimer</span>
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ValueForm
                open={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
                onSuccess={handleFormSuccess}
                item={editingItem}
            />
            {/*TODO: Confirmation de suppression */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette valeur ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
