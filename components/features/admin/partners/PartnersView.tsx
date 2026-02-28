"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Plus, GripVertical } from "lucide-react";
import {
    deletePartnerAction,
    reorderPartnersAction,
} from "@/app/(admin)/admin/partners/actions";
import { SortablePartnerCard } from "./SortablePartnerCard";
import type { PartnersViewProps } from "./types";

export function PartnersView({ initialPartners }: PartnersViewProps) {
    const router = useRouter();
    const [partners, setPartners] = useState(initialPartners);
    const [deleteCandidate, setDeleteCandidate] = useState<number | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Sync local state with server props
    useEffect(() => {
        setPartners(initialPartners);
    }, [initialPartners]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over || active.id === over.id) {
                return;
            }

            const oldIndex = partners.findIndex(
                (p) => p.id.toString() === active.id
            );
            const newIndex = partners.findIndex((p) => p.id.toString() === over.id);

            const reordered = arrayMove(partners, oldIndex, newIndex);
            setPartners(reordered);

            const updates = reordered.map((partner, index) => ({
                id: partner.id,
                display_order: index,
            }));

            const result = await reorderPartnersAction({ partners: updates });

            if (!result.success) {
                toast.error("Erreur", { description: result.error });
                setPartners(partners);
                return;
            }

            toast.success("Ordre mis à jour");
            router.refresh();
        },
        [partners, router]
    );

    const requestDelete = useCallback((id: number) => {
        setDeleteCandidate(id);
        setOpenDeleteDialog(true);
    }, []);

    const handleDelete = useCallback(
        async (id: number) => {
            setOpenDeleteDialog(false);

            try {
                const result = await deletePartnerAction(String(id));

                if (!result.success) {
                    throw new Error(result.error);
                }

                toast.success("Partenaire supprimé");
                router.refresh();
            } catch (error) {
                toast.error("Erreur", {
                    description:
                        error instanceof Error ? error.message : "Erreur inconnue",
                });
            } finally {
                setDeleteCandidate(null);
            }
        },
        [router]
    );

    const handleEdit = useCallback(
        (partner: (typeof partners)[0]) => {
            router.push(`/admin/partners/${partner.id}/edit`);
        },
        [router]
    );

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Partenaires</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Gérez les logos et liens des partenaires affichés sur la page
                        d&apos;accueil
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/admin/partners/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau partenaire
                    </Link>
                </Button>
            </div>

            {partners.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">Aucun partenaire</p>
                        <Button asChild variant="outline" className="mt-4">
                            <Link href="/admin/partners/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter le premier partenaire
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3 sm:space-y-2">
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                        <GripVertical className="h-4 w-4 inline-block" />
                        Glissez-déposez pour réorganiser l&apos;ordre d&apos;affichage
                    </p>
                    <DndContext
                        id="partners-dnd-context"
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={partners.map((p) => p.id.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            <div
                                role="list"
                                aria-label="Liste des partenaires"
                                className="space-y-3 sm:space-y-2"
                            >
                                {partners.map((partner) => (
                                    <SortablePartnerCard
                                        key={partner.id.toString()}
                                        partner={partner}
                                        onEdit={handleEdit}
                                        onDelete={requestDelete}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Voulez-vous vraiment supprimer ce partenaire ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenDeleteDialog(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                deleteCandidate !== null && handleDelete(deleteCandidate)
                            }
                        >
                            Supprimer
                        </Button>
                    </DialogFooter>
                    <DialogClose />
                </DialogContent>
            </Dialog>
        </div>
    );
}

