"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TeamMemberDb } from "@/lib/schemas/team";
import TeamMemberList from "./TeamMemberList";
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
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface Props {
  initialMembers: TeamMemberDb[];
}

export function TeamManagementContainer({ initialMembers }: Props) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberDb[]>(initialMembers || []);
  const [showInactive, setShowInactiveTeamMember] = useState(false);

  // Dialogs state
  const [deleteCandidate, setDeactivateTeamMember] = useState<number | null>(
    null
  );
  const [openDeleteDialog, setOpenDeactivateDialog] = useState(false);
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
    setDeactivateTeamMember(id);
    setOpenDeactivateDialog(true);
  }

  async function handleDeactivateTeamMember(id: number) {
    setOpenDeactivateDialog(false);
    const res = await setTeamMemberActiveAction(id, false);
    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, active: false } : m))
      );
      setShowInactiveTeamMember(true);
      toast.success("Membre désactivé");
    } else {
      toast.error("Erreur lors de la désactivation");
    }
    setDeactivateTeamMember(null);
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
      <div className="flex items-center gap-4 justify-between">
        <div />
        <div className="flex items-center gap-2">
          <label className="text-sm">Afficher inactifs</label>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => {
              setShowInactiveTeamMember(e.currentTarget.checked);
            }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button asChild>
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
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeactivateDialog}>
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
              onClick={() => setOpenDeactivateDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteCandidate && handleDeactivateTeamMember(deleteCandidate)
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
              Supprimer définitivement
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

export default TeamManagementContainer;
