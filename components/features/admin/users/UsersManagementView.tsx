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
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [roleChangeData, setRoleChangeData] = useState<{
    userId: string;
    email: string;
    currentRole: string;
    newRole: "user" | "editor" | "admin";
  } | null>(null);
  const [sortState, setSortState] = useState<UserSortState | null>(null);

  const sortedUsers = useMemo(() => {
    if (!sortState) return users;
    return sortUsers(users, sortState);
  }, [users, sortState]);

  function handleSort(field: UserSortField) {
    setSortState(toggleUserSort(sortState, field));
  }

  function handleRoleChange(
    userId: string,
    email: string,
    currentRole: string,
    newRole: "user" | "editor" | "admin"
  ) {
    setRoleChangeData({ userId, email, currentRole, newRole });
    setRoleChangeDialogOpen(true);
  }

  async function handleConfirmRoleChange() {
    if (!roleChangeData) return;

    setLoading(roleChangeData.userId);
    try {
      const result = await updateUserRole({
        userId: roleChangeData.userId,
        role: roleChangeData.newRole,
      });

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
      setRoleChangeDialogOpen(false);
      setRoleChangeData(null);
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
            {users.length} administrateur{users.length > 1 ? "s" : ""} au total
          </p>
          <Button size="sm" onClick={() => router.push("/admin/users/invite")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter un administrateur
          </Button>
        </div>

        {users.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground border rounded-lg">
            <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucun administrateur trouvé</p>
            <p className="text-sm mt-2">
              Invitez votre premier administrateur pour commencer
            </p>
          </div>
        ) : (
          <div className="w-full space-y-4">
            {/* 
              MOBILE VIEW (Cards) 
              Visible only on small screens (< 640px)
            */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
              {sortedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-card rounded-lg border shadow-sm p-4 space-y-4"
                >
                  {/* Header: Email and Status */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-semibold text-base leading-tight text-foreground truncate">
                        {user.email}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user.profile?.display_name || (
                          <span className="italic">Non renseigné</span>
                        )}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
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
                    </div>
                  </div>

                  {/* Body: Role and Dates */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rôle</span>
                      <Select
                        value={user.profile?.role || "user"}
                        onValueChange={(value) =>
                          handleRoleChange(
                            user.id,
                            user.email,
                            user.profile?.role || "user",
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
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Inscription</span>
                      <span className="text-foreground">
                        {format(new Date(user.created_at), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Dernière connexion
                      </span>
                      <span className="text-foreground">
                        {user.last_sign_in_at ? (
                          format(
                            new Date(user.last_sign_in_at),
                            "dd MMM yyyy",
                            {
                              locale: fr,
                            }
                          )
                        ) : (
                          <span className="italic">Jamais</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Footer: Actions */}
                  <div className="flex items-center justify-end pt-3 border-t mt-3">
                    <Button
                      variant="ghost-destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(user.id, user.email)}
                      disabled={loading === user.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-100 h-10 min-w-[56px] px-3"
                      aria-label={`Supprimer ${user.email}`}
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* 
              DESKTOP VIEW (Table) 
              Visible only on larger screens (>= 640px)
            */}
            <div className="hidden sm:block rounded-md border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[22%]">
                      <SortableHeader<UserSortField>
                        field="email"
                        label="Email"
                        currentSort={sortState}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="hidden lg:table-cell w-[16%]">
                      <SortableHeader<UserSortField>
                        field="name"
                        label="Nom"
                        currentSort={sortState}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="w-[16%]">
                      <SortableHeader<UserSortField>
                        field="role"
                        label="Rôle"
                        currentSort={sortState}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[14%]">
                      <SortableHeader<UserSortField>
                        field="status"
                        label="Statut"
                        currentSort={sortState}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="hidden xl:table-cell w-[13%]">
                      <SortableHeader<UserSortField>
                        field="created_at"
                        label="Inscription"
                        currentSort={sortState}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="hidden xl:table-cell w-[13%]">
                      <SortableHeader<UserSortField>
                        field="last_sign_in_at"
                        label="Dernière connexion"
                        currentSort={sortState}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right w-[12%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="truncate max-w-[250px]" title={user.email}>
                            {user.email}
                          </span>
                          {/* Mobile-ish fallback for smaller screens */}
                          <span className="md:hidden text-xs text-muted-foreground mt-1">
                            {user.email_confirmed_at ? (
                              <span className="text-green-600">✓ Vérifié</span>
                            ) : user.invited_at ? (
                              <span className="text-blue-600">⏱ Invité</span>
                            ) : (
                              <span className="text-gray-600">✗ Non vérifié</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
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
                              user.email,
                              user.profile?.role || "user",
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
                      <TableCell className="hidden md:table-cell">
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
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                        {format(new Date(user.created_at), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
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
                          size="icon"
                          onClick={() => openDeleteDialog(user.id, user.email)}
                          disabled={loading === user.id}
                          title="Supprimer l'utilisateur"
                          className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-100 hover:text-red-700"
                          aria-label={`Supprimer ${user.email}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
        <AlertDialogContent className="max-w-md sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              Modifier le rôle de cet utilisateur ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm sm:text-base space-y-2">
                <p className="text-muted-foreground">
                  Vous êtes sur le point de modifier le rôle de{" "}
                  <strong className="text-foreground">{roleChangeData?.email}</strong>.
                </p>
                <div className="bg-card p-3 rounded-md space-y-1 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rôle actuel :</span>
                    <span className="font-medium text-foreground">
                      {roleChangeData?.currentRole && roleLabels[roleChangeData.currentRole as keyof typeof roleLabels]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Nouveau rôle :</span>
                    <span className="font-semibold text-foreground">
                      {roleChangeData?.newRole && roleLabels[roleChangeData.newRole]}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground pt-2">
                  Cette modification prendra effet immédiatement et changera les
                  permissions de l&apos;utilisateur.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRoleChange}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-card hover:text-destructive"
            >
              Confirmer la modification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              Supprimer cet utilisateur ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              Cette action est irréversible. L&apos;utilisateur{" "}
              <strong className="text-foreground">{userToDelete?.email}</strong> et toutes ses données
              seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-card hover:text-destructive"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
