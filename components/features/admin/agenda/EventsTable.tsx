"use client";

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
import { SortableHeader } from "@/components/ui/sortable-header";
import type { SortState } from "@/components/ui/sortable-header";
import { getEventStatusBadge } from "@/lib/tables/event-table-helpers";

// Type Client (BigInt → Number pour sérialisation JSON)
type EventClientDTO = {
    id: number;
    spectacle_id: number;
    spectacle_titre?: string;
    lieu_id: number | null;
    lieu_nom?: string;
    lieu_ville?: string;
    date_debut: string;
    date_fin: string | null;
    start_time: string;
    end_time: string | null;
    status: "scheduled" | "cancelled" | "completed";
    ticket_url: string | null;
    capacity: number | null;
    price_cents: number | null;
    created_at: string;
    updated_at: string;
};

// Sortable fields
export type EventSortField = "spectacle_titre" | "date_debut" | "lieu_nom" | "status";
export type EventSortState = SortState<EventSortField>;

interface EventsTableProps {
    events: EventClientDTO[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    sortState: EventSortState | null;
    onSort: (field: EventSortField) => void;
}

export function EventsTable({ events, onEdit, onDelete, sortState, onSort }: EventsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>
                        <SortableHeader
                            field="spectacle_titre"
                            label="Spectacle"
                            currentSort={sortState}
                            onSort={onSort}
                        />
                    </TableHead>
                    <TableHead>
                        <SortableHeader
                            field="date_debut"
                            label="Date"
                            currentSort={sortState}
                            onSort={onSort}
                        />
                    </TableHead>
                    <TableHead>
                        <SortableHeader
                            field="lieu_nom"
                            label="Lieu"
                            currentSort={sortState}
                            onSort={onSort}
                        />
                    </TableHead>
                    <TableHead>
                        <SortableHeader
                            field="status"
                            label="Statut"
                            currentSort={sortState}
                            onSort={onSort}
                        />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {events.map((event) => (
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
                        <TableCell>{getEventStatusBadge(event.status)}</TableCell>
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
