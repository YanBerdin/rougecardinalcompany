"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Mail,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SortableHeader } from "@/components/ui/sortable-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UserWithProfile } from "@/lib/dal/admin-users";
import { updateUserRole, deleteUser } from "@/app/(admin)/admin/users/actions";
import {
  sortUsers,
  toggleUserSort,
  type UserSortField,
  type UserSortState,
} from "@/lib/tables/user-table-helpers";

interface UsersManagementViewProps {
  users: UserWithProfile[];
}

const roleLabels = {
  user: "Utilisateur",
  editor: "Éditeur",
  admin: "Administrateur",
} as const;

export function UsersManagementView({ users }: UsersManagementViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [sortState, setSortState] = useState<UserSortState | null>(null);

  const sortedUsers = useMemo(() => {
    if (!sortState) return users;
    return sortUsers(users, sortState);
  }, [users, sortState]);

  function handleSort(field: UserSortField) {
    setSortState(toggleUserSort(sortState, field));
  }

  async function handleRoleChange(
    userId: string,
    newRole: "user" | "editor" | "admin"
  ) {
    setLoading(userId);
    try {
      const result = await updateUserRole({ userId, role: newRole });

      if (result.success) {
        toast.success("Rôle mis à jour avec succès");
        router.refresh();
      } else {
        toast.error("Erreur lors de la mise à jour", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Erreur inattendue", {
        description:
          error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setLoading(null);
    }
  }

  function openDeleteDialog(userId: string, email: string) {
    setUserToDelete({ id: userId, email });
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return;

    setLoading(userToDelete.id);
    try {
      const result = await deleteUser(userToDelete.id);

      if (result.success) {
        toast.success("Utilisateur supprimé avec succès");
        router.refresh();
      } else {
        toast.error("Erreur lors de la suppression", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Erreur inattendue", {
        description:
          error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setLoading(null);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {users.length} utilisateur{users.length > 1 ? "s" : ""} au total
          </p>
          <Button onClick={() => router.push("/admin/users/invite")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter un utilisateur
          </Button>
        </div>

        {users.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border rounded-lg">
            <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
            <p className="text-sm mt-2">
              Invitez votre premier utilisateur pour commencer
            </p>
          </div>
        ) : (
          <div className="rounded-md border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader<UserSortField>
                      field="email"
                      label="Email"
                      currentSort={sortState}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader<UserSortField>
                      field="name"
                      label="Nom"
                      currentSort={sortState}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader<UserSortField>
                      field="role"
                      label="Rôle"
                      currentSort={sortState}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader<UserSortField>
                      field="status"
                      label="Statut"
                      currentSort={sortState}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader<UserSortField>
                      field="created_at"
                      label="Inscription"
                      currentSort={sortState}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader<UserSortField>
                      field="last_sign_in_at"
                      label="Dernière connexion"
                      currentSort={sortState}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      {user.profile?.display_name || (
                        <span className="text-muted-foreground italic">
                          Non renseigné
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.profile?.role || "user"}
                        onValueChange={(value) =>
                          handleRoleChange(
                            user.id,
                            value as "user" | "editor" | "admin"
                          )
                        }
                        disabled={loading === user.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            {roleLabels.user}
                          </SelectItem>
                          <SelectItem value="editor">
                            {roleLabels.editor}
                          </SelectItem>
                          <SelectItem value="admin">
                            {roleLabels.admin}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.email_confirmed_at ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Vérifié
                        </Badge>
                      ) : user.invited_at ? (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Invité
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Non vérifié
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.last_sign_in_at ? (
                        format(new Date(user.last_sign_in_at), "dd MMM yyyy", {
                          locale: fr,
                        })
                      ) : (
                        <span className="italic">Jamais</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(user.id, user.email)}
                        disabled={loading === user.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;utilisateur{" "}
              <strong>{userToDelete?.email}</strong> et toutes ses données
              seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
