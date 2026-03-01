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

interface UserDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    email: string | undefined;
    onConfirm: () => void;
}

export function UserDeleteDialog({
    open,
    onOpenChange,
    email,
    onConfirm,
}: UserDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md sm:max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg sm:text-xl">
                        Supprimer cet utilisateur ?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm sm:text-base">
                        Cette action est irréversible. L&apos;utilisateur{" "}
                        <strong className="text-foreground">{email}</strong> et toutes ses
                        données seront définitivement supprimées.
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
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
