"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    ExternalLink,
} from "lucide-react";
import { type PartnerDTO } from "@/lib/schemas/partners";
import {
    deletePartnerAction,
    reorderPartnersAction,
} from "@/app/(admin)/admin/partners/actions";

interface PartnersViewProps {
    initialPartners: PartnerDTO[];
}

interface SortablePartnerCardProps {
    partner: PartnerDTO;
    onEdit: (partner: PartnerDTO) => void;
    onDelete: (id: number) => void;
}

function SortablePartnerCard({
    partner,
    onEdit,
    onDelete,
}: SortablePartnerCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: partner.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card ref={setNodeRef} style={style} className="group hover:bg-card/50">
            {/* 
              MOBILE VIEW 
              Visible only on small screens (< 640px)
            */}
            <CardContent className="flex flex-col gap-4 p-4 sm:hidden">
                {/* Header: Drag handle + Logo + Name */}
                <div className="flex items-center gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab touch-none active:cursor-grabbing p-2 -m-2"
                        aria-label="Glisser pour réorganiser"
                    >
                        <GripVertical className="h-6 w-6 text-muted-foreground" />
                    </button>

                    {partner.logo_url ? (
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                            <Image
                                src={partner.logo_url}
                                alt={partner.name}
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                    ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                            No logo
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base truncate">
                                {partner.name}
                            </h3>
                            {!partner.active && (
                                <Badge variant="secondary" className="text-xs">
                                    Inactif
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body: Website URL */}
                {partner.website_url && (
                    <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-chart-3 flex items-center gap-1"
                    >
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{partner.website_url}</span>
                    </a>
                )}

                {/* Footer: Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(partner)}
                        className="h-10 min-w-[56px] px-3"
                        aria-label={`Modifier ${partner.name}`}
                    >
                        <Pencil className="h-5 w-5 mr-2" /> Modifier
                    </Button>
                    <Button
                        variant="ghost-destructive"
                        size="sm"
                        onClick={() => onDelete(partner.id)}
                        className="h-10 min-w-[56px] px-3"
                        aria-label={`Supprimer ${partner.name}`}
                    >
                        <Trash2 className="h-5 w-5 mr-2" /> Supprimer
                    </Button>
                </div>
            </CardContent>

            {/* 
              DESKTOP VIEW 
              Visible only on larger screens (>= 640px)
            */}
            <CardContent className="hidden sm:flex items-center gap-4 p-4">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab touch-none active:cursor-grabbing"
                    aria-label="Glisser pour réorganiser"
                >
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>

                {partner.logo_url ? (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                        <Image
                            src={partner.logo_url}
                            alt={partner.name}
                            fill
                            className="object-contain p-1"
                        />
                    </div>
                ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                        No logo
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{partner.name}</h3>
                        {!partner.active && (
                            <Badge variant="secondary" className="text-xs">
                                Inactif
                            </Badge>
                        )}
                    </div>
                    {partner.website_url && (
                        <a
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-chart-3 flex items-center gap-1 truncate"
                        >
                            <span className="truncate">{partner.website_url}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(partner)}
                        title="Éditer"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        aria-label={`Modifier ${partner.name}`}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost-destructive"
                        size="icon"
                        onClick={() => onDelete(partner.id)}
                        title="Supprimer"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        aria-label={`Supprimer ${partner.name}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

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
            setPartners(reordered); // Optimistic update

            // Update display_order
            const updates = reordered.map((partner, index) => ({
                id: partner.id,
                display_order: index,
            }));

            const result = await reorderPartnersAction({ partners: updates });

            if (!result.success) {
                toast.error("Erreur", {
                    description: result.error,
                });
                setPartners(partners); // Rollback
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
                toast.error(
                    "Erreur",
                    {
                        description:
                            error instanceof Error ? error.message : "Erreur inconnue",
                    }
                );
            } finally {
                setDeleteCandidate(null);
            }
        },
        [router, deleteCandidate]
    );

    const handleEdit = useCallback(
        (partner: PartnerDTO) => {
            router.push(`/admin/partners/${partner.id}/edit`);
        },
        [router]
    );

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-12">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Partenaires</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Gérez les logos et liens des partenaires affichés sur la page
                        d&apos;accueil
                    </p>
                </div>
                <Link href="/admin/partners/new">
                    <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau partenaire
                    </Button>
                </Link>
            </div>

            {partners.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">Aucun partenaire</p>
                        <Link href="/admin/partners/new">
                            <Button variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter le premier partenaire
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3 sm:space-y-2">
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                        <GripVertical className="h-4 w-4 inline-block" />
                        Glissez-déposez pour réorganiser l&apos;ordre d&apos;affichage
                    </p>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={partners.map((p) => p.id.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3 sm:space-y-2">
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
                            onClick={() => deleteCandidate && handleDelete(deleteCandidate)}
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
