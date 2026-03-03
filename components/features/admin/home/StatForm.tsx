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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    createHomeStatAction,
    updateHomeStatAction,
} from "@/lib/actions/home-stats-actions";
import {
    HomeStatFormSchema,
    type HomeStatFormValues,
} from "@/lib/schemas/home-content";
import type { HomeStatFormProps } from "./types";

export function StatForm({ open, onClose, onSuccess, item }: HomeStatFormProps) {
    const [isPending, setIsPending] = useState(false);

    const form = useForm<HomeStatFormValues>({
        resolver: zodResolver(HomeStatFormSchema),
        defaultValues: item
            ? { label: item.label, value: item.value, active: item.active }
            : { label: "", value: "", active: true },
    });

    // Reset form when item changes
    useEffect(() => {
        if (open) {
            form.reset(
                item
                    ? { label: item.label, value: item.value, active: item.active }
                    : { label: "", value: "", active: true }
            );
        }
    }, [open, item, form]);

    const onSubmit = async (data: HomeStatFormValues) => {
        setIsPending(true);
        try {
            const result = item
                ? await updateHomeStatAction(item.id, data)
                : await createHomeStatAction(data);

            if (!result.success) throw new Error(result.error);

            toast.success(item ? "Statistique mise à jour" : "Statistique créée");
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
                    <DialogTitle>
                        {item ? "Modifier la statistique" : "Ajouter une statistique"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valeur chiffrée *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex : 25, 100+, 3000€"
                                            maxLength={20}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Libellé *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex : Spectacles créés" {...field} />
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
                                            aria-label="Activer cette statistique"
                                        />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer">Actif</FormLabel>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isPending}
                            >
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
