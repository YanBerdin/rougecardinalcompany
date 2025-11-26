"use client";

import { useForm } from "react-hook-form";
import Image from "next/image";
import type { HeroSlideInput } from "@/lib/schemas/home-content";
// UI form uses number for media id to simplify JSON and avoid BigInt serialization issues
type HeroSlideFormValues = Omit<HeroSlideInput, "image_media_id" | "position"> & {
    image_media_id?: number | undefined;
    position?: number | undefined;
};
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import type { Resolver } from "react-hook-form";
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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MediaLibraryPicker, MediaExternalUrlInput, type MediaSelectResult } from "@/components/features/admin/media";
import { HeroSlideInputSchema, type HeroSlideDTO } from "@/lib/schemas/home-content";

interface HeroSlideFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    slide?: HeroSlideDTO | null;
}

export function HeroSlideForm({
    open,
    onClose,
    onSuccess,
    slide,
}: HeroSlideFormProps) {
    // router not used in this form - avoid unused import/variable
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const form = useForm<HeroSlideFormValues>({
        // cast resolver to local UI shape; server schema will coerce number -> bigint
        resolver: zodResolver(HeroSlideInputSchema) as unknown as Resolver<HeroSlideFormValues>,
        defaultValues: {
            title: "",
            slug: "",
            subtitle: "",
            description: "",
            image_url: "",
            image_media_id: undefined,
            cta_label: "",
            cta_url: "",
            alt_text: "",
            active: true,
            position: undefined,
        },
    });

    // Réinitialiser le formulaire quand le dialog s'ouvre ou quand slide change
    useEffect(() => {
        if (open && slide) {
            console.log('[HeroSlideForm] Resetting form with slide data:', slide);
            form.reset({
                title: slide.title,
                slug: slide.slug,
                subtitle: slide.subtitle ?? "",
                description: slide.description ?? "",
                image_url: slide.image_url ?? "",
                image_media_id: slide.image_media_id !== null ? Number(slide.image_media_id) : undefined,
                cta_label: slide.cta_label ?? "",
                cta_url: slide.cta_url ?? "",
                alt_text: slide.alt_text,
                active: slide.active,
                position: slide.position,
            });
        } else if (open && !slide) {
            console.log('[HeroSlideForm] Resetting form for new slide');
            form.reset({
                title: "",
                slug: "",
                subtitle: "",
                description: "",
                image_url: "",
                image_media_id: undefined,
                cta_label: "",
                cta_url: "",
                alt_text: "",
                active: true,
                position: undefined,
            });
        }
    }, [open, slide, form]);

    const onSubmit = async (data: HeroSlideFormValues) => {
        console.log("[HeroSlideForm] ===== FORM SUBMISSION STARTED =====");
        console.log("[HeroSlideForm] Editing slide ID:", slide?.id);
        console.log("[HeroSlideForm] Form submitted with data:", data);
        console.log("[HeroSlideForm] Form validation state:", {
            errors: form.formState.errors,
            isValid: form.formState.isValid,
            isDirty: form.formState.isDirty,
            isSubmitting: form.formState.isSubmitting,
        });
        setIsPending(true);

        try {
            const url = slide
                ? `/api/admin/home/hero/${slide.id}`
                : "/api/admin/home/hero";
            const method = slide ? "PATCH" : "POST";

            console.log(`[HeroSlideForm] Sending ${method} request to ${url}`);

            // ensure numeric id (UI stores number); server will coerce to bigint
            const payload = { ...data } as unknown;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[HeroSlideForm] Server error:', error);
                throw new Error(error.error || "Failed to save slide");
            }

            const result = await response.json();
            console.log('[HeroSlideForm] Server response:', result);

            toast.success(slide ? "Slide updated successfully" : "Slide created successfully");

            // Appeler onSuccess AVANT de reset le form
            await onSuccess();

            // Reset le formulaire seulement après le succès complet
            form.reset();

            console.log('[HeroSlideForm] ===== FORM SUBMISSION COMPLETED =====');
        } catch (error) {
            console.error('[HeroSlideForm] Submission error:', error);
            toast.error(error instanceof Error ? error.message : "Failed to save slide");
        } finally {
            setIsPending(false);
        }
    };

    const handleMediaSelect = (result: MediaSelectResult) => {
        // media picker returns numeric id; keep as number in UI
        form.setValue("image_media_id", Number(result.id));
        form.setValue("image_url", result.url);
        setIsMediaPickerOpen(false);
    };

    const watchSubtitle = form.watch("subtitle") ?? "";
    const watchDescription = form.watch("description") ?? "";
    const watchAltText = form.watch("alt_text") ?? "";

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{slide ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(
                                onSubmit,
                                (errors) => {
                                    console.error("[HeroSlideForm] Validation errors:", errors);
                                    console.error("[HeroSlideForm] Form values at validation:", form.getValues());

                                    // Afficher les erreurs spécifiques
                                    Object.entries(errors).forEach(([field, error]) => {
                                        console.error(`  - ${field}:`, error?.message);
                                    });

                                    toast.error("Please fix validation errors - check console");
                                }
                            )}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title *</FormLabel>
                                        <FormControl>
                                            <Input {...field} maxLength={80} placeholder="Main headline" />
                                        </FormControl>
                                        <FormDescription>
                                            {field.value.length}/80 characters
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subtitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subtitle</FormLabel>
                                        <FormControl>
                                            <Input {...field} maxLength={150} placeholder="Supporting text" />
                                        </FormControl>
                                        <FormDescription>
                                            {watchSubtitle.length}/150 characters
                                        </FormDescription>
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
                                            <Textarea {...field} maxLength={500} rows={3} />
                                        </FormControl>
                                        <FormDescription>
                                            {watchDescription.length}/500 characters
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>Image *</FormLabel>
                                <div className="flex gap-2 items-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsMediaPickerOpen(true)}
                                    >
                                        Sélectionner depuis la médiathèque
                                    </Button>
                                    {form.watch("image_url") ? (
                                        <Image
                                            src={String(form.watch("image_url"))}
                                            alt={String(form.watch("alt_text") ?? "Preview")}
                                            className="h-20 w-32 object-cover rounded"
                                            width={128}
                                            height={80}
                                        />
                                    ) : null}
                                </div>
                            </div>

                            {/* URL externe (fallback) */}
                            <MediaExternalUrlInput
                                value={String(form.watch("image_url") ?? "")}
                                onChange={(url) => form.setValue("image_url", url)}
                                label="URL externe (optionnel)"
                                description="Utilisé si aucune image n'est sélectionnée depuis la médiathèque"
                            />

                            <FormField
                                control={form.control}
                                name="alt_text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alt Text * (Accessibility)</FormLabel>
                                        <FormControl>
                                            <Input {...field} maxLength={125} placeholder="Describe the image" />
                                        </FormControl>
                                        <FormDescription>
                                            {watchAltText.length}/125 characters
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="cta_label"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>CTA Label</FormLabel>
                                            <FormControl>
                                                <Input {...field} maxLength={50} placeholder="Learn More" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cta_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>CTA URL</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="url" placeholder="https://..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Active</FormLabel>
                                            <div className="text-sm text-muted-foreground">
                                                Display this slide on the homepage
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "Saving..." : slide ? "Update" : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <MediaLibraryPicker
                open={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
            />
        </>
    );
}
