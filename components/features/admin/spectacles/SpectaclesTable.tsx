"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import type { SpectacleSummary } from "@/lib/schemas/spectacles";
import {
  STATUS_VARIANTS,
  STATUS_LABELS,
  formatSpectacleDate,
  formatSpectacleDuration,
} from "@/lib/tables/spectacle-table-helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JSX } from "react/jsx-runtime";

interface SpectaclesTableProps {
  spectacles: SpectacleSummary[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function getStatusBadge(status: string | null): JSX.Element | null {
  if (!status) return null;
  const variant = STATUS_VARIANTS[status] || "outline";
  const label = STATUS_LABELS[status] || status;
  return <Badge variant={variant}>{label}</Badge>;
}

function getVisibilityBadge(isPublic: boolean): JSX.Element {
  return (
    <Badge variant={isPublic ? "default" : "secondary"}>
      {isPublic ? "Public" : "Privé"}
    </Badge>
  );
}

export default function SpectaclesTable({
  spectacles,
  onView,
  onEdit,
  onDelete,
}: SpectaclesTableProps) {
  if (spectacles.length === 0) {
    return <div>Aucun spectacle trouvé.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead>Première</TableHead>
            <TableHead>Visibilité</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spectacles.map((spectacle) => (
            <TableRow key={spectacle.id}>
              <TableCell className="font-medium">{spectacle.title}</TableCell>
              <TableCell>{spectacle.genre || "—"}</TableCell>
              <TableCell>
                {getStatusBadge(spectacle.status) || (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {formatSpectacleDuration(spectacle.duration_minutes)}
              </TableCell>
              <TableCell>{formatSpectacleDate(spectacle.premiere)}</TableCell>
              <TableCell>{getVisibilityBadge(spectacle.public)}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(spectacle.id)}
                    title="Voir le détail"
                    className="hover:brightness-150"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(spectacle.id)}
                    title="Modifier"
                    className="hover:brightness-150"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(spectacle.id)}
                    title="Supprimer"
                    className="text-destructive hover:text-destructive hover:brightness-150"
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
  );
}
