"use client";
import { useState } from "react";
import type {
  TeamMemberDb,
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
} from "@/lib/schemas/team";
import TeamMemberList from "./TeamMemberList";
import TeamMemberForm from "./TeamMemberForm";
import MediaPickerDialog from "./MediaPickerDialog";
import {
  createTeamMember,
  setTeamMemberActiveAction,
  updateTeamMember,
} from "@/app/admin/team/actions";
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

interface Props {
  initialMembers: TeamMemberDb[];
}

export function TeamManagementContainer({ initialMembers }: Props) {
  const [members, setMembers] = useState<TeamMemberDb[]>(initialMembers || []);
  const [showInactive, setShowInactiveTeamMember] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<TeamMemberDb | null>(null);
  const [openMedia, setOpenMedia] = useState(false);
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

  async function handleCreate(data: CreateTeamMemberInput) {
    const res = await createTeamMember(data);
    if (res.success && res.data) {
      const created = res.data as TeamMemberDb;
      setMembers((prev) => [created, ...prev]);
      setOpenForm(false);
    }
  }

  async function fetchMembers(includeInactive = false) {
    try {
      const res = await fetch(
        `/api/admin/team?includeInactive=${includeInactive}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("fetchMembers error:", err);
    }
  }

  function requestDeactivateTeamMember(id: number) {
    setDeactivateTeamMember(id);
    setOpenDeactivateDialog(true);
  }

  async function handleDeactivateTeamMember(id: number) {
    setOpenDeactivateDialog(false);
    const res = await setTeamMemberActiveAction(id, false);
    if (res.success) {
      // Instead of filtering out, mark as inactive in local state
      // This ensures the member stays visible if "show inactive" is checked
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
    try {
      const res = await fetch(`/api/admin/team/${id}/active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
      if (!res.ok) throw new Error("Failed");
      // update local list: set active to true for that member
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, active: true } : m))
      );
      toast.success("Membre réactivé");
    } catch (err) {
      console.error("reactivate error", err);
      toast.error("Impossible de réactiver");
    }
  }

  async function handleEditSubmit(id: number, data: UpdateTeamMemberInput) {
    const res = await updateTeamMember(id, data);
    if (res.success && res.data) {
      const updated = res.data as TeamMemberDb;
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setEditing(null);
      setOpenForm(false);
    }
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
            onChange={async (e) => {
              const val = e.currentTarget.checked;
              setShowInactiveTeamMember(val);
              await fetchMembers(val);
            }}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
        >
          Ajouter un membre
        </button>
      </div>

      <TeamMemberList
        members={showInactive ? members : members.filter((m) => m.active)}
        onEditMember={(id) => {
          const m = members.find((x) => x.id === id) || null;
          setEditing(m);
          setOpenForm(true);
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

      {openForm && (
        <div className="p-4 bg-card rounded">
          <TeamMemberForm
            member={editing}
            onSubmit={async (data) => {
              if (editing) await handleEditSubmit(editing.id, data);
              else await handleCreate(data as CreateTeamMemberInput);
            }}
            onCancel={() => setOpenForm(false)}
          />
        </div>
      )}

      <MediaPickerDialog
        open={openMedia}
        onClose={() => setOpenMedia(false)}
        onSelect={(id) => {
          console.log("selected media", id);
          setOpenMedia(false);
        }}
      />

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
              variant="outline"
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
              variant="secondary"
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

      <Dialog
        open={openHardDeleteDialog}
        onOpenChange={setOpenHardDeleteDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer définitivement</DialogTitle>
            <DialogDescription>
              Cette action supprimera définitivement le membre (RGPD).
              Voulez-vous continuer ? Cette opération est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenHardDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!hardDeleteCandidate) return;
                try {
                  const res = await fetch(
                    `/api/admin/team/${hardDeleteCandidate}/hard-delete`,
                    {
                      method: "POST",
                    }
                  );
                  if (!res.ok) throw new Error("Failed");
                  setMembers((prev) =>
                    prev.filter((m) => m.id !== hardDeleteCandidate)
                  );
                  toast.success("Membre supprimé définitivement");
                } catch (err) {
                  console.error("hard delete error", err);
                  toast.error("Impossible de supprimer définitivement");
                } finally {
                  setOpenHardDeleteDialog(false);
                  setHardDeleteCandidate(null);
                }
              }}
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
