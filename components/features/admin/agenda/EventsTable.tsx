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
import { Badge } from "@/components/ui/badge";
import type { EventDTO } from "@/lib/schemas/admin-agenda";

interface EventsTableProps {
    events: EventDTO[];
    onEdit: (id: bigint) => void;
    onDelete: (id: bigint) => void;
}

export function EventsTable({ events, onEdit, onDelete }: EventsTableProps) {
    const [sortField, setSortField] = useState<keyof EventDTO>("date_debut");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const sortedEvents = useMemo(() => {
        return [...events].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            if (aVal === null || bVal === null || aVal === undefined || bVal === undefined) return 0;

            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [events, sortField, sortOrder]);

    const handleSort = (field: keyof EventDTO) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const getStatusBadge = (status: EventDTO["status"]) => {
        const variants = {
            scheduled: "default",
            cancelled: "destructive",
            completed: "secondary",
        } as const;

        const labels = {
            scheduled: "Programmé",
            cancelled: "Annulé",
            completed: "Terminé",
        };

        return <Badge variant={variants[status]}>{labels[status]}</Badge>;
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead
                        onClick={() => handleSort("spectacle_titre")}
                        className="cursor-pointer"
                    >
                        Spectacle
                    </TableHead>
                    <TableHead
                        onClick={() => handleSort("date_debut")}
                        className="cursor-pointer"
                    >
                        Date
                    </TableHead>
                    <TableHead
                        onClick={() => handleSort("lieu_nom")}
                        className="cursor-pointer"
                    >
                        Lieu
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedEvents.map((event) => (
                    <TableRow key={String(event.id)}>
                        <TableCell className="font-medium">
                            {event.spectacle_titre}
                        </TableCell>
                        <TableCell>
                            {new Date(event.date_debut).toLocaleDateString("fr-FR")}
                            <br />
                            <span className="text-sm text-muted-foreground">
                                {event.start_time.slice(0, 5)}
                            </span>
                        </TableCell>
                        <TableCell>
                            {event.lieu_nom ?? "-"}
                            {event.lieu_ville && (
                                <span className="text-sm text-muted-foreground block">
                                    {event.lieu_ville}
                                </span>
                            )}
                        </TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(event.id)}
                            >
                                Modifier
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDelete(event.id)}
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
