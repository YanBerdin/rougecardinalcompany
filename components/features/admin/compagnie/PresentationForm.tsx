"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    updatePresentationSectionAction,
} from "@/app/(admin)/admin/compagnie/compagnie-presentation-actions";
import {
    PresentationSectionFormSchema,
    type PresentationSectionFormValues,
    type SectionKind,
} from "@/lib/schemas/compagnie-admin";
import { PresentationFormFields } from "./PresentationFormFields";
import type { PresentationFormProps } from "./types";

const KIND_LABELS: Record<SectionKind, string> = {
    hero: "Héro",
    history: "Histoire",
    quote: "Citation",
    values: "Valeurs",
    team: "Équipe",
    mission: "Mission",
    founder: "Fondateur",
    custom: "Personnalisé",
};

function buildDefaultValues(
    item: PresentationFormProps["item"],
): PresentationSectionFormValues {
    if (item) {
        return {
            slug: item.slug,
            kind: item.kind as SectionKind,
            title: item.title ?? "",
            subtitle: item.subtitle ?? "",
            content: item.content ?? [],
            quote_text: item.quote_text ?? "",
            quote_author: item.quote_author ?? "",
            image_url: item.image_url ?? "",
            image_media_id: item.image_media_id ?? null,
            alt_text: item.alt_text ?? "",
            milestones: (item.milestones as { year: string; label: string }[] | null | undefined) ?? [],
            position: item.position,
            active: item.active,
        };
    }
    return {
        slug: "",
        kind: "custom",
        title: "",
        subtitle: "",
        content: [],
        quote_text: "",
        quote_author: "",
        image_url: "",
        image_media_id: null,
        alt_text: "",
        milestones: [],
        active: true,
    };
}

export function PresentationForm({ open, onClose, onSuccess, item }: PresentationFormProps) {
    const [isPending, setIsPending] = useState(false);

    const form = useForm<PresentationSectionFormValues>({
        resolver: zodResolver(PresentationSectionFormSchema),
        defaultValues: buildDefaultValues(item),
    });

    // Reset form when item changes
    useEffect(() => {
        if (open) {
            form.reset(buildDefaultValues(item));
        }
    }, [open, item, form]);

    const onSubmit = async (data: PresentationSectionFormValues) => {
        if (!item) return;
        setIsPending(true);
        try {
            // Strip position — only modified via explicit reorder operations
            const { position: _position, ...contentData } = data;

            const result = await updatePresentationSectionAction(item.id, contentData);

            if (!result.success) throw new Error(result.error);

            toast.success("Section mise à jour");
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
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {item ? "Modifier la section" : "Ajouter une section"}
                    </DialogTitle>
                </DialogHeader>

                <FormProvider {...form}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                            <input type="hidden" {...form.register("kind")} />
                            {item && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Type :</span>
                                    <Badge variant="outline">{KIND_LABELS[item.kind as SectionKind]}</Badge>
                                </div>
                            )}

                            <input type="hidden" {...form.register("slug")} />

                            {/* Conditional fields based on kind */}
                            <PresentationFormFields />

                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-3 space-y-0 self-end pb-1">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    aria-label="Activer cette section"
                                                />
                                            </FormControl>
                                            <FormLabel className="cursor-pointer">Actif</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>

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
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
