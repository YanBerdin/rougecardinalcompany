"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { SpectacleSummary } from "@/lib/schemas/spectacles";
import {
  removeSpectacleFromList,
  sortSpectacles,
  getNextSortState,
  type SpectacleSortState,
  type SortField,
} from "@/lib/tables/spectacle-table-helpers";
import { deleteSpectacleAction } from "@/app/(admin)/admin/spectacles/actions";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import SpectaclesTable from "./SpectaclesTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SpectaclesManagementContainerProps {
  initialSpectacles: SpectacleSummary[];
}

export default function SpectaclesManagementContainer({
  initialSpectacles,
}: SpectaclesManagementContainerProps) {
  const router = useRouter();
  const [spectacles, setSpectacles] =
    useState<SpectacleSummary[]>(initialSpectacles);
  const [deleteCandidate, setDeleteCandidate] = useState<number | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortState, setSortState] = useState<SpectacleSortState | null>(null);

  // Sort spectacles based on current sort state
  const sortedSpectacles = useMemo(() => {
    if (!sortState) return spectacles;
    return sortSpectacles(spectacles, sortState);
  }, [spectacles, sortState]);

  function handleSort(field: SortField): void {
    setSortState((currentSort) => getNextSortState(currentSort, field));
  }
  /*
  const openDeleteDialog = deleteCandidate !== null;

  function setOpenDeleteDialog(open: boolean): void {
    if (!open) {
      setDeleteCandidate(null);
    }
  }
  */
  function handleCreate(): void {
    router.push("/admin/spectacles/new");
  }

  function handleView(id: number): void {
    router.push(`/admin/spectacles/${id}`);
  }

  function handleGallery(id: number): void {
    router.push(`/admin/spectacles/${id}#gallery`);
  }

  function handleEdit(id: number): void {
    router.push(`/admin/spectacles/${id}/edit`);
  }

  function requestDelete(id: number): void {
    setDeleteCandidate(id);
    setOpenDeleteDialog(true);
  }

  function cancelDelete(): void {
    setOpenDeleteDialog(false);
    setDeleteCandidate(null);
  }

  async function handleDelete(): Promise<void> {
    if (!deleteCandidate) return;

    setIsDeleting(true);

    try {
      const result = await deleteSpectacleAction(deleteCandidate);

      if (!result.success) {
        throw new Error(result.error);
      }

      setSpectacles((prev) => removeSpectacleFromList(prev, deleteCandidate));

      toast.success("Spectacle supprimé", {
        description: "Le spectacle a été supprimé avec succès.",
      });

      setOpenDeleteDialog(false);
      setDeleteCandidate(null);
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Impossible de supprimer le spectacle"
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {spectacles.length} spectacle{spectacles.length > 1 ? "s" : ""}
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nouveau spectacle</span>
          <span className="sm:hidden">Nouveau</span>
        </Button>
      </div>

      <SpectaclesTable
        spectacles={sortedSpectacles}
        onView={handleView}
        onGallery={handleGallery}
        onEdit={handleEdit}
        onDelete={requestDelete}
        sortState={sortState}
        onSort={handleSort}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le spectacle</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce spectacle ? Cette action est
              irréversible et supprimera également tous les événements associés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isDeleting}
              title="Annuler la suppression"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Confirmer la suppression du spectacle"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
