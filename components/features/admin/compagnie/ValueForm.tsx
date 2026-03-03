"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    createCompagnieValueAction,
    updateCompagnieValueAction,
} from "@/app/(admin)/admin/compagnie/compagnie-values-actions";
import {
    CompagnieValueFormSchema,
    type CompagnieValueFormValues,
} from "@/lib/schemas/compagnie-admin";
import type { ValueFormProps } from "./types";

export function ValueForm({ open, onClose, onSuccess, item }: ValueFormProps) {
    const [isPending, setIsPending] = useState(false);

    const form = useForm<CompagnieValueFormValues>({
        resolver: zodResolver(CompagnieValueFormSchema),
        defaultValues: item
            ? {
                title: item.title,
                description: item.description ?? "",
                position: item.position,
                active: item.active,
            }
            : { title: "", description: "", position: 0, active: true },
    });

    // Reset form when item changes
    useEffect(() => {
        if (open) {
            form.reset(
                item
                    ? {
                        title: item.title,
                        description: item.description ?? "",
                        position: item.position,
                        active: item.active,
                    }
                    : { title: "", description: "", position: 0, active: true },
            );
        }
    }, [open, item, form]);

    const onSubmit = async (data: CompagnieValueFormValues) => {
        setIsPending(true);
        try {
            // Strip position — only modified via explicit reorder operations
            const { position: _position, ...contentData } = data;

            const result = item
                ? await updateCompagnieValueAction(item.id, contentData)
                : await createCompagnieValueAction(contentData);

            if (!result.success) throw new Error(result.error);

            toast.success(item ? "Valeur mise à jour" : "Valeur créée");
            form.reset();
            onSuccess();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{item ? "Modifier la valeur" : "Ajouter une valeur"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Titre *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex : Créativité" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Description de la valeur..."
                                            rows={3}
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            aria-label="Activer cette valeur"
                                        />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer">Actif</FormLabel>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Enregistrement..." : item ? "Mettre à jour" : "Créer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
