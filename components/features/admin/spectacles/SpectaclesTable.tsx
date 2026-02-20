"use client";

import { Eye, Images, Pencil, Trash2, Calendar, Clock, Tag } from "lucide-react";
import type { SpectacleSummary } from "@/lib/schemas/spectacles";
import {
  formatSpectacleDate,
  formatSpectacleDuration,
  getStatusBadge,
  getVisibilityBadge,
  type SpectacleSortState,
  type SortField,
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
import { SortableHeader } from "./SortableHeader";

interface SpectaclesTableProps {
  spectacles: SpectacleSummary[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onGallery: (id: number) => void;
  sortState: SpectacleSortState | null;
  onSort: (field: SortField) => void;
}

export default function SpectaclesTable({
  spectacles,
  onView,
  onEdit,
  onDelete,
  onGallery,
  sortState,
  onSort,
}: SpectaclesTableProps) {
  if (spectacles.length === 0) {
    return <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-card text-muted-foreground">Aucun spectacle trouvé.</div>;
  }

  return (
    <div className="w-full mx-auto space-y-4">
      {/* 
        MOBILE VIEW (Cards) 
        Visible only on small screens (< 640px)
      */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {spectacles.map((spectacle) => (
          <div
            key={spectacle.id}
            className="bg-card rounded-lg border shadow-sm p-4 space-y-4"
          >
            {/* Header: Title and Status */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg leading-tight text-foreground">
                  {spectacle.title}
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge(spectacle.status)}
                  {getVisibilityBadge(spectacle.public)}
                </div>
              </div>
            </div>

            {/* Body: Meta data */}
            <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{spectacle.genre || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatSpectacleDuration(spectacle.duration_minutes)}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Calendar className="h-4 w-4" />
                <span>Première le {formatSpectacleDate(spectacle.premiere)}</span>
              </div>
            </div>

            {/* Footer: Actions */}
            <div className="flex flex-col items-stretch gap-2 pt-2 border-t mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(spectacle.id)}
                className="h-10 w-full px-3"
                aria-label={`Voir ${spectacle.title}`}
              >
                <Eye className="h-5 w-5 mr-2" /> Détails
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGallery(spectacle.id)}
                className="h-10 w-full px-3"
                aria-label={`Gérer la galerie de ${spectacle.title}`}
              >
                <Images className="h-5 w-5 mr-2" /> Galerie
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(spectacle.id)}
                className="h-10 w-full px-3"
                aria-label={`Éditer ${spectacle.title}`}
              >
                <Pencil className="h-5 w-5 mr-2" /> Éditer
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(spectacle.id)}
                className="h-10 w-full px-3"
                aria-label={`Supprimer ${spectacle.title}`}
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
      <div className="hidden sm:block rounded-md bg-card border ">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-[20%]">
                <SortableHeader
                  field="title"
                  label="Titre"
                  currentSort={sortState}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className="hidden lg:table-cell w-[14%]">
                <SortableHeader
                  field="genre"
                  label="Genre"
                  currentSort={sortState}
                  onSort={onSort}
                />
              </TableHead>
              {/* Show Status on tablet+ */}
              <TableHead className="hidden md:table-cell w-[18%]">
                <SortableHeader
                  field="status"
                  label="Statut"
                  currentSort={sortState}
                  onSort={onSort}
                />
              </TableHead>
              {/* Hide Duration on smaller tablets, show on lg+ */}
              <TableHead className="hidden xl:table-cell w-[15%]">
                <SortableHeader
                  field="duration_minutes"
                  label="Durée"
                  currentSort={sortState}
                  onSort={onSort}
                />
              </TableHead>
              {/* Hide Premiere on smaller tablets, show on lg+ */}
              <TableHead className="hidden xl:table-cell w-[16%]">
                <SortableHeader
                  field="premiere"
                  label="Première"
                  currentSort={sortState}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className="w-[18%]">
                <SortableHeader
                  field="public"
                  label="Visibilité"
                  currentSort={sortState}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead className="text-right w-[15%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spectacles.map((spectacle) => (
              <TableRow key={spectacle.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="truncate max-w-[300px] xl:max-w-none" title={spectacle.title}>
                      {spectacle.title}
                    </span>
                    {/* Mobile-ish fallback for table view on smaller screens */}
                    <span className="xl:hidden text-xs text-muted-foreground">
                      {formatSpectacleDate(spectacle.premiere)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{spectacle.genre || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {getStatusBadge(spectacle.status)}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {formatSpectacleDuration(spectacle.duration_minutes)}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {formatSpectacleDate(spectacle.premiere)}
                </TableCell>
                <TableCell>
                  {getVisibilityBadge(spectacle.public)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 sm:gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(spectacle.id)}
                      title="Voir le détail"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      aria-label={`Voir ${spectacle.title}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onGallery(spectacle.id)}
                      title="Gérer la galerie"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      aria-label={`Gérer la galerie de ${spectacle.title}`}
                    >
                      <Images className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(spectacle.id)}
                      title="Modifier"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      aria-label={`Éditer ${spectacle.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost-destructive"
                      size="icon"
                      onClick={() => onDelete(spectacle.id)}
                      title="Supprimer"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      aria-label={`Supprimer ${spectacle.title}`}
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
