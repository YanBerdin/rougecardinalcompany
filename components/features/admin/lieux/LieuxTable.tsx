"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { LieuClientDTO } from "@/lib/schemas/admin-lieux";

interface LieuxTableProps {
    lieux: LieuClientDTO[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

export function LieuxTable({ lieux, onEdit, onDelete }: LieuxTableProps) {
    const [sortField, setSortField] = useState<keyof LieuClientDTO>("nom");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const sortedLieux = useMemo(() => {
        return [...lieux].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            if (aVal === null || bVal === null) return 0;

            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [lieux, sortField, sortOrder]);

    const handleSort = (field: keyof LieuClientDTO) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead
                        onClick={() => handleSort("nom")}
                        className="cursor-pointer"
                    >
                        Nom
                    </TableHead>
                    <TableHead
                        onClick={() => handleSort("ville")}
                        className="cursor-pointer"
                    >
                        Ville
                    </TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead
                        onClick={() => handleSort("capacite")}
                        className="cursor-pointer"
                    >
                        Capacité
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedLieux.map((lieu) => (
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
                        <TableCell className="text-right space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(lieu.id)}
                            >
                                Modifier
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDelete(lieu.id)}
                            >
                                Supprimer
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
