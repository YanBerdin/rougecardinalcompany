"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { SpectacleSummary } from "@/lib/schemas/spectacles";
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

interface Props {
  initialSpectacles: SpectacleSummary[];
}

export default function SpectaclesManagementContainer({
  initialSpectacles,
}: Props) {
  const router = useRouter();
  const [spectacles, setSpectacles] =
    useState<SpectacleSummary[]>(initialSpectacles);
  const [deleteCandidate, setDeleteCandidate] = useState<number | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleCreate() {
    router.push("/admin/spectacles/new");
  }

  function handleEdit(id: number) {
    router.push(`/admin/spectacles/${id}/edit`);
  }

  function handleView(id: number) {
    router.push(`/admin/spectacles/${id}`);
  }

  function requestDelete(id: number) {
    setDeleteCandidate(id);
    setOpenDeleteDialog(true);
  }

  async function handleDelete() {
    if (!deleteCandidate) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/spectacles/${deleteCandidate}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete spectacle");
      }

      // Remove from local state
      setSpectacles((prev) => prev.filter((s) => s.id !== deleteCandidate));

      toast.success("Spectacle supprimé", {
        description: "Le spectacle a été supprimé avec succès.",
      });

      setOpenDeleteDialog(false);
      setDeleteCandidate(null);
      
      // Refresh server data to ensure cache is updated
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Erreur", {
        description:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer le spectacle",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  function cancelDelete() {
    setOpenDeleteDialog(false);
    setDeleteCandidate(null);
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
