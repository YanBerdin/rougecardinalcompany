"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { deleteHomeStatAction } from "@/lib/actions/home-stats-actions";
import { StatForm } from "./StatForm";
import type { HomeStatsViewProps } from "./types";
import type { HomeStatDTO } from "@/lib/schemas/home-content";

type StatItem = Omit<HomeStatDTO, "id"> & { id: string };

export function StatsView({ initialStats }: HomeStatsViewProps) {
    const router = useRouter();
    const [stats, setStats] = useState<StatItem[]>(initialStats);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StatItem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Sync local state when props change after router.refresh()
    useEffect(() => {
        setStats(initialStats);
    }, [initialStats]);

    const handleCreate = useCallback(() => {
        setEditingItem(null);
        setIsFormOpen(true);
    }, []);

    const handleEdit = useCallback((item: StatItem) => {
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
            const result = await deleteHomeStatAction(deletingId);
            if (!result.success) throw new Error(result.error);
            toast.success("Statistique supprimée");
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
        } finally {
            setDeletingId(null);
        }
    }, [deletingId, router]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {stats.length} statistique{stats.length !== 1 ? "s" : ""}
                </p>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Ajouter une statistique
                </Button>
            </div>

            {stats.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                    Aucune statistique. Créez-en une pour commencer.
                </p>
            ) : (
                <ul className="space-y-2" aria-label="Liste des statistiques">
                    {stats.map((stat) => (
                        <li
                            key={stat.id}
                            className="flex items-start justify-between gap-4 rounded-lg border p-4"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-2xl font-bold">{stat.value}</span>
                                    <span className="font-medium">{stat.label}</span>
                                    <Badge variant={stat.active ? "default" : "secondary"}>
                                        {stat.active ? "Actif" : "Inactif"}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(stat)}
                                    aria-label={`Modifier la statistique ${stat.label}`}
                                >
                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeletingId(stat.id)}
                                    aria-label={`Supprimer la statistique ${stat.label}`}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <StatForm
                open={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
                onSuccess={handleFormSuccess}
                item={editingItem}
            />

            <AlertDialog
                open={!!deletingId}
                onOpenChange={(open) => { if (!open) setDeletingId(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette statistique ?</AlertDialogTitle>
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
