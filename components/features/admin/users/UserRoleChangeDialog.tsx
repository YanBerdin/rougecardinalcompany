"use client";

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
import { ROLE_LABELS, type RoleChangeData } from "./types";

interface UserRoleChangeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: RoleChangeData | null;
    onConfirm: () => void;
}

export function UserRoleChangeDialog({
    open,
    onOpenChange,
    data,
    onConfirm,
}: UserRoleChangeDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md sm:max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg sm:text-xl">
                        Modifier le rôle de cet utilisateur ?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="text-sm sm:text-base space-y-2">
                            <p className="text-muted-foreground">
                                Vous êtes sur le point de modifier le rôle de{" "}
                                <strong className="text-foreground">{data?.email}</strong>.
                            </p>
                            <div className="bg-card p-3 rounded-md space-y-1 text-xs sm:text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Rôle actuel :</span>
                                    <span className="font-medium text-foreground">
                                        {data?.currentRole &&
                                            ROLE_LABELS[
                                            data.currentRole as keyof typeof ROLE_LABELS
                                            ]}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Nouveau rôle :</span>
                                    <span className="font-semibold text-foreground">
                                        {data?.newRole && ROLE_LABELS[data.newRole]}
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
                        onClick={onConfirm}
                        className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-card hover:text-destructive"
                    >
                        Confirmer la modification
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
