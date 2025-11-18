"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { SpectacleSummary } from "@/lib/schemas/spectacles";
import {
  deleteSpectacleFromApi,
  removeSpectacleFromList,
} from "@/lib/tables/spectacle-table-helpers";
import { handleSpectacleApiError } from "@/lib/api/spectacles-helpers";
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
      await deleteSpectacleFromApi(deleteCandidate);
      setSpectacles((prev) => removeSpectacleFromList(prev, deleteCandidate));

      toast.success("Spectacle supprimé", {
        description: "Le spectacle a été supprimé avec succès.",
      });

      setOpenDeleteDialog(false);
      setDeleteCandidate(null);
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Erreur", { description: handleSpectacleApiError(error) });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Toaster />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {spectacles.length} spectacle{spectacles.length > 1 ? "s" : ""}
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau spectacle
        </Button>
      </div>

      <SpectaclesTable
        spectacles={spectacles}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={requestDelete}
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
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
