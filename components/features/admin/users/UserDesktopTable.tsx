"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2 } from "lucide-react";
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
import type {
    UserSortField,
    UserSortState,
} from "@/lib/tables/user-table-helpers";
import type { UserWithProfile } from "@/lib/dal/admin-users";
import { UserStatusBadge } from "./UserStatusBadge";
import { ROLE_LABELS, type UserRole } from "./types";

interface UserDesktopTableProps {
    readonly users: readonly UserWithProfile[];
    readonly sortState: UserSortState | null;
    readonly loadingId: string | null;
    readonly onSort: (field: UserSortField) => void;
    readonly onRoleChange: (
        userId: string,
        email: string,
        currentRole: string,
        newRole: UserRole
    ) => void;
    readonly onDelete: (userId: string, email: string) => void;
}

export function UserDesktopTable({
    users,
    sortState,
    loadingId,
    onSort,
    onRoleChange,
    onDelete,
}: UserDesktopTableProps): React.ReactNode {
    return (
        <div className="hidden sm:block rounded-md border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[22%]">
                            <SortableHeader<UserSortField>
                                field="email" label="Email"
                                currentSort={sortState} onSort={onSort}
                            />
                        </TableHead>
                        <TableHead className="hidden lg:table-cell w-[16%]">
                            <SortableHeader<UserSortField>
                                field="name" label="Nom"
                                currentSort={sortState} onSort={onSort}
                            />
                        </TableHead>
                        <TableHead className="w-[16%]">
                            <SortableHeader<UserSortField>
                                field="role" label="Rôle"
                                currentSort={sortState} onSort={onSort}
                            />
                        </TableHead>
                        <TableHead className="hidden md:table-cell w-[14%]">
                            <SortableHeader<UserSortField>
                                field="status" label="Statut"
                                currentSort={sortState} onSort={onSort}
                            />
                        </TableHead>
                        <TableHead className="hidden xl:table-cell w-[13%]">
                            <SortableHeader<UserSortField>
                                field="created_at" label="Inscription"
                                currentSort={sortState} onSort={onSort}
                            />
                        </TableHead>
                        <TableHead className="hidden xl:table-cell w-[13%]">
                            <SortableHeader<UserSortField>
                                field="last_sign_in_at" label="Dernière connexion"
                                currentSort={sortState} onSort={onSort}
                            />
                        </TableHead>
                        <TableHead className="text-right w-[12%]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span className="truncate max-w-[250px]" title={user.email}>
                                        {user.email}
                                    </span>
                                    <span className="md:hidden text-xs text-muted-foreground mt-1">
                                        <UserStatusBadge user={user} />
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
                                        onRoleChange(
                                            user.id,
                                            user.email,
                                            user.profile?.role || "user",
                                            value as UserRole
                                        )
                                    }
                                    disabled={loadingId === user.id}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <UserStatusBadge user={user} />
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
                                    onClick={() => onDelete(user.id, user.email)}
                                    disabled={loadingId === user.id}
                                    className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-100 hover:text-red-700"
                                    aria-label={`Supprimer ${user.email}`}
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
