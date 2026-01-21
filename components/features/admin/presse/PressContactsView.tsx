"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { deletePressContactAction, togglePressContactActiveAction } from "@/app/(admin)/admin/presse/actions";
import type { PressContactsViewProps } from "./types";

export function PressContactsView({ initialContacts }: PressContactsViewProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Supprimer ce contact ?")) return;

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">{contacts.length} contact(s)</p>
        <Link href="/admin/presse/contacts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau contact
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <Card key={contact.id}>
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
                />
                <Link href={`/admin/presse/contacts/${contact.id}/edit`}>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(contact.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
