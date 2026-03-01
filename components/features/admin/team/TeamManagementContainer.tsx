"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TeamMemberList } from "./TeamMemberList";
import type { TeamManagementContainerProps } from "./types";
import {
  setTeamMemberActiveAction,
  hardDeleteTeamMemberAction,
} from "@/app/(admin)/admin/team/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function TeamManagementContainer({ initialMembers }: TeamManagementContainerProps) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamManagementContainerProps["initialMembers"]>(initialMembers || []);
  const [showInactive, setShowInactive] = useState(false);

  // Dialogs state
  const [deactivateCandidate, setDeactivateCandidate] = useState<number | null>(
    null
  );
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [reactivateCandidate, setReactivateCandidate] = useState<number | null>(
    null
  );
  const [openReactivateDialog, setOpenReactivateDialog] = useState(false);
  const [hardDeleteCandidate, setHardDeleteCandidate] = useState<number | null>(
    null
  );
  const [openHardDeleteDialog, setOpenHardDeleteDialog] = useState(false);

  // ✅ CRITICAL: Sync local state when props change (after router.refresh())
  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  function requestDeactivateTeamMember(id: number) {
    setDeactivateCandidate(id);
    setIsDeactivateDialogOpen(true);
  }

  async function handleDeactivateTeamMember(id: number) {
    setIsDeactivateDialogOpen(false);
    const res = await setTeamMemberActiveAction(id, false);
    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, active: false } : m))
      );
      setShowInactive(true);
      toast.success("Membre désactivé");
    } else {
      toast.error("Erreur lors de la désactivation");
    }
    setDeactivateCandidate(null);
  }

  async function handleReactivateTeamMember(id: number) {
    const res = await setTeamMemberActiveAction(id, true);
    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, active: true } : m))
      );
      toast.success("Membre réactivé");
    } else {
      toast.error("Impossible de réactiver");
    }
  }

  async function handleHardDeleteMember(id: number) {
    const res = await hardDeleteTeamMemberAction(id);
    if (res.success) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Membre supprimé définitivement");
    } else {
      toast.error(res.error ?? "Impossible de supprimer définitivement");
    }
    setOpenHardDeleteDialog(false);
    setHardDeleteCandidate(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 justify-end">
        <Label htmlFor="show-inactive" className="text-sm cursor-pointer">
          Afficher inactifs
        </Label>
        <Switch
          id="show-inactive"
          checked={showInactive}
          onCheckedChange={setShowInactive}
        />
      </div>

      <div className="flex justify-end">
        <Button
        variant="default"
        asChild>
          <Link href="/admin/team/new">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un membre
          </Link>
        </Button>
      </div>

      <TeamMemberList
        members={showInactive ? members : members.filter((m) => m.active)}
        onEditMember={(id) => {
          router.push(`/admin/team/${id}/edit`);
        }}
        onDeactivateMember={requestDeactivateTeamMember}
        onReactivateMember={(id) => {
          setReactivateCandidate(id);
          setOpenReactivateDialog(true);
        }}
        onHardDeleteMember={(id) => {
          setHardDeleteCandidate(id);
          setOpenHardDeleteDialog(true);
        }}
      />

      {/* Deactivate Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la désactivation</DialogTitle>
            <DialogDescription>
              Voulez-vous désactiver ce membre ? Il sera masqué des listes
              publiques.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline-primary"
              onClick={() => setIsDeactivateDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deactivateCandidate && handleDeactivateTeamMember(deactivateCandidate)
              }
            >
              Désactiver
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>

      {/* Reactivate Dialog */}
      <Dialog
        open={openReactivateDialog}
        onOpenChange={setOpenReactivateDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la réactivation</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment réactiver ce membre ? Il redeviendra visible
              publiquement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenReactivateDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (reactivateCandidate) {
                  handleReactivateTeamMember(reactivateCandidate);
                  setOpenReactivateDialog(false);
                  setReactivateCandidate(null);
                }
              }}
            >
              Réactiver
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>

      {/* Hard Delete Dialog */}
      <Dialog
        open={openHardDeleteDialog}
        onOpenChange={setOpenHardDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression définitive</DialogTitle>
            <DialogDescription>
              Cette action supprimera définitivement le membre (RGPD).
              Voulez-vous continuer ? Cette opération est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline-primary"
              onClick={() => setOpenHardDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                hardDeleteCandidate && handleHardDeleteMember(hardDeleteCandidate)
              }
            >
              Supprimer
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
