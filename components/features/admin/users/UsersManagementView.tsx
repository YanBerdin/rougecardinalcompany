"use client";

import { useState, useMemo, useCallback } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateUserRole, deleteUser } from "@/app/(admin)/admin/users/actions";
import {
  sortUsers,
  toggleUserSort,
  type UserSortField,
  type UserSortState,
} from "@/lib/tables/user-table-helpers";
import { UserMobileCard } from "./UserMobileCard";
import { UserDesktopTable } from "./UserDesktopTable";
import { UserDeleteDialog } from "./UserDeleteDialog";
import { UserRoleChangeDialog } from "./UserRoleChangeDialog";
import {
  type UserRole,
  type RoleChangeData,
  type UserToDelete,
  type UsersManagementViewProps,
} from "./types";

export function UsersManagementView({ users }: UsersManagementViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserToDelete | null>(null);
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [roleChangeData, setRoleChangeData] = useState<RoleChangeData | null>(
    null
  );
  const [sortState, setSortState] = useState<UserSortState | null>(null);

  const sortedUsers = useMemo(() => {
    if (!sortState) return users;
    return sortUsers(users, sortState);
  }, [users, sortState]);

  const handleSort = useCallback(
    (field: UserSortField) => {
      setSortState(toggleUserSort(sortState, field));
    },
    [sortState]
  );

  const handleRoleChange = useCallback(
    (
      userId: string,
      email: string,
      currentRole: string,
      newRole: UserRole
    ) => {
      setRoleChangeData({ userId, email, currentRole, newRole });
      setRoleChangeDialogOpen(true);
    },
    []
  );

  const handleConfirmRoleChange = useCallback(async () => {
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
    } catch (error: unknown) {
      toast.error("Erreur inattendue", {
        description:
          error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setLoading(null);
      setRoleChangeDialogOpen(false);
      setRoleChangeData(null);
    }
  }, [roleChangeData, router]);

  const openDeleteDialog = useCallback(
    (userId: string, email: string) => {
      setUserToDelete({ id: userId, email });
      setDeleteDialogOpen(true);
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
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
    } catch (error: unknown) {
      toast.error("Erreur inattendue", {
        description:
          error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setLoading(null);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, router]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {users.length} administrateur{users.length > 1 ? "s" : ""} au total
          </p>
          <Button size="sm" onClick={() => router.push("/admin/users/invite")}>
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Inviter un administrateur
          </Button>
        </div>

        {users.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground border rounded-lg">
            <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" aria-hidden="true" />
            <p className="text-lg font-medium">Aucun administrateur trouvé</p>
            <p className="text-sm mt-2">
              Invitez votre premier administrateur pour commencer
            </p>
          </div>
        ) : (
          <div className="w-full space-y-4">
            {/* MOBILE VIEW (Cards) — < 640px */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
              {sortedUsers.map((user) => (
                <UserMobileCard
                  key={user.id}
                  user={user}
                  loading={loading === user.id}
                  onRoleChange={handleRoleChange}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>

            {/* DESKTOP VIEW (Table) — >= 640px */}
            <UserDesktopTable
              users={sortedUsers}
              sortState={sortState}
              loadingId={loading}
              onSort={handleSort}
              onRoleChange={handleRoleChange}
              onDelete={openDeleteDialog}
            />
          </div>
        )}
      </div>

      <UserRoleChangeDialog
        open={roleChangeDialogOpen}
        onOpenChange={setRoleChangeDialogOpen}
        data={roleChangeData}
        onConfirm={handleConfirmRoleChange}
      />

      <UserDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        email={userToDelete?.email}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
