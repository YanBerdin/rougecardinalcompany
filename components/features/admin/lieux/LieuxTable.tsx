"use client";

import { MapPin, Building, Users, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SortableHeader } from "@/components/ui/sortable-header";
import type { SortState } from "@/components/ui/sortable-header";
import type { LieuClientDTO } from "@/lib/schemas/admin-lieux";

// Sortable fields
export type LieuSortField = "nom" | "ville" | "capacite";
export type LieuSortState = SortState<LieuSortField>;

interface LieuxTableProps {
    lieux: LieuClientDTO[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    sortState: LieuSortState | null;
    onSort: (field: LieuSortField) => void;
}

export function LieuxTable({ lieux, onEdit, onDelete, sortState, onSort }: LieuxTableProps) {
    if (lieux.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-card text-muted-foreground">
                Aucun lieu trouvé.
            </div>
        );
    }

    return (
        <div className="w-full mx-auto space-y-4">
            {/* 
              MOBILE VIEW (Cards) 
              Visible only on small screens (< 640px)
            */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
                {lieux.map((lieu) => (
                    <div
                        key={String(lieu.id)}
                        className="bg-card rounded-lg border shadow-sm p-4 space-y-4"
                    >
                        {/* Header: Title */}
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg leading-tight text-foreground">
                                    {lieu.nom}
                                </h3>
                            </div>
                        </div>

                        {/* Body: Meta data */}
                        <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 col-span-2">
                                <Building className="h-4 w-4" />
                                <span>
                                    {lieu.ville ?? "-"}
                                    {lieu.code_postal && ` (${lieu.code_postal})`}
                                </span>
                            </div>
                            {lieu.adresse && (
                                <div className="flex items-center gap-2 col-span-2">
                                    <MapPin className="h-4 w-4" />
                                    <span className="truncate">{lieu.adresse}</span>
                                </div>
                            )}
                            {lieu.capacite && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{lieu.capacite} pers.</span>
                                </div>
                            )}
                        </div>

                        {/* Footer: Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t mt-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onEdit(lieu.id)}
                                className="h-10 min-w-[56px] px-3"
                                aria-label={`Modifier ${lieu.nom}`}
                            >
                                <Pencil className="h-5 w-5 mr-2" /> Modifier
                            </Button>
                            <Button
                                variant="ghost-destructive"
                                size="sm"
                                onClick={() => onDelete(lieu.id)}
                                className="h-10 min-w-[56px] px-3"
                                aria-label={`Supprimer ${lieu.nom}`}
                            >
                                <Trash2 className="h-5 w-5 mr-2" /> Supprimer
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 
              DESKTOP VIEW (Table) 
              Visible only on larger screens (>= 640px)
            */}
            <div className="hidden sm:block rounded-md bg-card border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/80">
                            <TableHead>
                                <SortableHeader
                                    field="nom"
                                    label="Nom"
                                    currentSort={sortState}
                                    onSort={onSort}
                                />
                            </TableHead>
                            <TableHead>
                                <SortableHeader
                                    field="ville"
                                    label="Ville"
                                    currentSort={sortState}
                                    onSort={onSort}
                                />
                            </TableHead>
                            <TableHead>Adresse</TableHead>
                            <TableHead>
                                <SortableHeader
                                    field="capacite"
                                    label="Capacité"
                                    currentSort={sortState}
                                    onSort={onSort}
                                />
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lieux.map((lieu) => (
                            <TableRow key={String(lieu.id)}>
                                <TableCell className="font-medium">{lieu.nom}</TableCell>
                                <TableCell>
                                    {lieu.ville ?? "-"}
                                    {lieu.code_postal && (
                                        <span className="text-sm text-muted-foreground ml-2">
                                            ({lieu.code_postal})
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {lieu.adresse ?? "-"}
                                </TableCell>
                                <TableCell>
                                    {lieu.capacite ? `${lieu.capacite} pers.` : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2 sm:gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(lieu.id)}
                                            title="Modifier"
                                            className="h-8 w-8 sm:h-9 sm:w-9"
                                            aria-label={`Modifier ${lieu.nom}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost-destructive"
                                            size="icon"
                                            onClick={() => onDelete(lieu.id)}
                                            title="Supprimer"
                                            className="h-8 w-8 sm:h-9 sm:w-9"
                                            aria-label={`Supprimer ${lieu.nom}`}
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
    );
}
