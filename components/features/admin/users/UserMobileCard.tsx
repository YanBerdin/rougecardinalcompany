"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { UserWithProfile } from "@/lib/dal/admin-users";
import { UserStatusBadge } from "./UserStatusBadge";
import { ROLE_LABELS, type UserRole } from "./types";

interface UserMobileCardProps {
    user: UserWithProfile;
    loading: boolean;
    onRoleChange: (
        userId: string,
        email: string,
        currentRole: string,
        newRole: UserRole
    ) => void;
    onDelete: (userId: string, email: string) => void;
}

export function UserMobileCard({
    user,
    loading,
    onRoleChange,
    onDelete,
}: UserMobileCardProps) {
    return (
        <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
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
                    <UserStatusBadge user={user} />
                </div>
            </div>

            {/* Body: Role and Dates */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rôle</span>
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
                        disabled={loading}
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
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Inscription</span>
                    <span className="text-foreground">
                        {format(new Date(user.created_at), "dd MMM yyyy", { locale: fr })}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dernière connexion</span>
                    <span className="text-foreground">
                        {user.last_sign_in_at ? (
                            format(new Date(user.last_sign_in_at), "dd MMM yyyy", {
                                locale: fr,
                            })
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
                    onClick={() => onDelete(user.id, user.email)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 h-10 min-w-[56px] px-3"
                    aria-label={`Supprimer ${user.email}`}
                >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Supprimer
                </Button>
            </div>
        </div>
    );
}
