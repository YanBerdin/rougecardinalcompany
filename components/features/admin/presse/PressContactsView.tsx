"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { deletePressContactAction, togglePressContactActiveAction } from "@/app/(admin)/admin/presse/press-contacts-actions";
import type { PressContactsViewProps } from "./types";

export function PressContactsView({ initialContacts }: PressContactsViewProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const requestDelete = useCallback((id: string) => {
    setDeleteCandidate(id);
    setOpenDeleteDialog(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setOpenDeleteDialog(false);

      try {
        const result = await deletePressContactAction(id);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Contact supprimé");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erreur");
      }
    },
    [router]
  );

  const handleToggleActive = useCallback(
    async (id: string, active: boolean) => {
      try {
        const result = await togglePressContactActiveAction(id, !active);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success(active ? "Contact désactivé" : "Contact activé");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erreur");
      }
    },
    [router]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground">
          {contacts.length} contact{contacts.length > 1 ? "s" : ""}
        </p>
        <Link href="/admin/presse/contacts/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouveau contact</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </Link>
      </div>

      {/* 
        MOBILE VIEW (Cards) 
        Visible only on small screens (< 640px)
      */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-card rounded-lg border shadow-sm p-4 space-y-3 hover:bg-card/60 transition-colors"
          >
            {/* Header: Name and Status */}
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight text-foreground">
                  {contact.prenom} {contact.nom}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {contact.fonction} - {contact.media}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!contact.actif && <Badge variant="secondary">Inactif</Badge>}
                <Switch
                  checked={contact.actif}
                  onCheckedChange={() => handleToggleActive(contact.id, contact.actif)}
                  aria-label={contact.actif ? "Désactiver le contact" : "Activer le contact"}
                />
              </div>
            </div>

            {/* Body: Contact info */}
            <div className="space-y-2">
              <a
                href={`mailto:${contact.email}`}
                className="text-sm text-muted-foreground flex items-center gap-2 hover:underline"
              >
                <Mail className="h-4 w-4" />
                <span className="truncate">{contact.email}</span>
              </a>
              {contact.telephone && (
                <a
                  href={`tel:${contact.telephone}`}
                  className="text-sm text-muted-foreground flex items-center gap-2 hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {contact.telephone}
                </a>
              )}
            </div>

            {/* Specialties */}
            {contact.specialites && contact.specialites.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {contact.specialites.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Footer: Actions */}
            <div className="flex items-center justify-end pt-3 border-t gap-2">
              <Link href={`/admin/presse/contacts/${contact.id}/edit`}>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Modifier"
                  aria-label="Modifier le contact"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                </Button>
              </Link>
              <Button
                variant="ghost-destructive"
                size="icon"
                onClick={() => requestDelete(contact.id)}
                title="Supprimer"
                aria-label="Supprimer le contact"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 
        DESKTOP VIEW (Cards) 
        Visible only on larger screens (>= 640px)
      */}
      <div className="hidden sm:block space-y-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="hover:bg-card/60 transition-colors">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {contact.prenom} {contact.nom}
                  </h3>
                  {!contact.actif && <Badge variant="secondary">Inactif</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {contact.fonction} - {contact.media}
                </p>
                <div className="flex gap-4 mt-1">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    {contact.email}
                  </a>
                  {contact.telephone && (
                    <a
                      href={`tel:${contact.telephone}`}
                      className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {contact.telephone}
                    </a>
                  )}
                </div>
                {contact.specialites && contact.specialites.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {contact.specialites.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <Switch
                  checked={contact.actif}
                  onCheckedChange={() => handleToggleActive(contact.id, contact.actif)}
                  aria-label={contact.actif ? "Désactiver le contact" : "Activer le contact"}
                />
                <Link href={`/admin/presse/contacts/${contact.id}/edit`}>
                  <Button variant="ghost" size="icon" title="Modifier" aria-label="Modifier le contact">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost-destructive"
                  size="icon"
                  onClick={() => requestDelete(contact.id)}
                  title="Supprimer"
                  aria-label="Supprimer le contact"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer ce contact presse ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
              title="Annuler la suppression"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteCandidate && handleDelete(deleteCandidate)}
              title="Confirmer la suppression du contact"
            >
              Supprimer
            </Button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </Dialog>
    </div>
  );
}
