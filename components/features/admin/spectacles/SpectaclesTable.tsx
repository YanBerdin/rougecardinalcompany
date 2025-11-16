"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import type { SpectacleSummary } from "@/lib/schemas/spectacles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  spectacles: SpectacleSummary[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function SpectaclesTable({
  spectacles,
  onView,
  onEdit,
  onDelete,
}: Props) {
  function formatDate(dateString: string | null): string {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
      });
    } catch {
      return "—";
    }
  }

  function getStatusBadge(status: string | null) {
    if (!status) return null;

    const variants: Record<string, "default" | "secondary" | "outline"> = {
      en_cours: "default",
      termine: "secondary",
      projet: "outline",
    };

    const labels: Record<string, string> = {
      en_cours: "En cours",
      termine: "Terminé",
      projet: "Projet",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  }

  if (spectacles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Aucun spectacle trouvé.</p>
        <p className="text-sm mt-2">
          Cliquez sur &quot;Nouveau spectacle&quot; pour commencer.
        </p>
      </div>
    );
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
              <TableCell>{getStatusBadge(spectacle.status)}</TableCell>
              <TableCell>
                {spectacle.duration_minutes
                  ? `${spectacle.duration_minutes} min`
                  : "—"}
              </TableCell>
              <TableCell>{formatDate(spectacle.premiere)}</TableCell>
              <TableCell>
                <Badge variant={spectacle.public ? "default" : "secondary"}>
                  {spectacle.public ? "Public" : "Privé"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(spectacle.id)}
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(spectacle.id)}
                    title="Éditer"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(spectacle.id)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
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
