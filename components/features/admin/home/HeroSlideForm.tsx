"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MediaLibraryPicker, type MediaSelectResult } from "@/components/features/admin/media";
import { HeroSlideFormSchema, type HeroSlideFormValues, type HeroSlideDTO } from "@/lib/schemas/home-content";
import { createHeroSlideAction, updateHeroSlideAction } from "@/app/(admin)/admin/home/hero/home-hero-actions";
import { HeroSlideFormFields, HeroSlideCtaFields, HeroSlideActiveToggle } from "./HeroSlideFormFields";
import { HeroSlideImageSection, handleMediaSelection } from "./HeroSlideImageSection";

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
        resolver: zodResolver(HeroSlideFormSchema),
        mode: "onTouched", // Validate touched fields + all fields on submit
        defaultValues: {
            title: "",
            slug: "",
            subtitle: "",
            description: "",
            image_url: "",
            image_media_id: undefined,
            alt_text: "",
            // CTA Primaire
            cta_primary_enabled: false,
            cta_primary_label: "",
            cta_primary_url: "",
            // CTA Secondaire
            cta_secondary_enabled: false,
            cta_secondary_label: "",
            cta_secondary_url: "",
            active: true,
            position: undefined,
        },
    });

    // Réinitialiser le formulaire quand le dialog s'ouvre ou quand slide change
    useEffect(() => {
        if (open && slide) {
            console.log('[HeroSlideForm] Resetting form with slide ID:', String(slide.id));
            form.reset({
                title: slide.title,
                slug: slide.slug,
                subtitle: slide.subtitle ?? "",
                description: slide.description ?? "",
                image_url: slide.image_url ?? "",
                image_media_id: slide.image_media_id !== null ? Number(slide.image_media_id) : undefined,
                alt_text: slide.alt_text,
                // CTA Primaire
                cta_primary_enabled: slide.cta_primary_enabled,
                cta_primary_label: slide.cta_primary_label ?? "",
                cta_primary_url: slide.cta_primary_url ?? "",
                // CTA Secondaire
                cta_secondary_enabled: slide.cta_secondary_enabled,
                cta_secondary_label: slide.cta_secondary_label ?? "",
                cta_secondary_url: slide.cta_secondary_url ?? "",
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
                alt_text: "",
                // CTA Primaire
                cta_primary_enabled: false,
                cta_primary_label: "",
                cta_primary_url: "",
                // CTA Secondaire
                cta_secondary_enabled: false,
                cta_secondary_label: "",
                cta_secondary_url: "",
                active: true,
                position: undefined,
            });
        }
    }, [open, slide, form]);

    const onSubmit = async (data: HeroSlideFormValues) => {
        console.log("[HeroSlideForm] ===== FORM SUBMISSION STARTED =====");
        console.log("[HeroSlideForm] Editing slide ID:", slide?.id ? String(slide.id) : "new");
        console.log("[HeroSlideForm] Form submitted with data:", JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
        console.log("[HeroSlideForm] Form validation state:", {
            errors: form.formState.errors,
            isValid: form.formState.isValid,
            isDirty: form.formState.isDirty,
            isSubmitting: form.formState.isSubmitting,
        });
        setIsPending(true);

        try {
            // ensure numeric id (UI stores number); server will coerce to bigint
            const payload = { ...data } as unknown;

            if (slide) {
                // update - call server action directly
                const result = await updateHeroSlideAction(String(slide.id), payload);
                if (!result.success) {
                    throw new Error(result.error || "Update failed");
                }
                toast.success("Slide updated successfully");
            } else {
                // create - call server action directly
                const result = await createHeroSlideAction(payload);
                if (!result.success) {
                    throw new Error(result.error || "Create failed");
                }
                toast.success("Slide created successfully");
            }

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
        handleMediaSelection(form, result);
        setIsMediaPickerOpen(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{slide ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                // Trigger validation first
                                const isValid = await form.trigger();
                                const errors = form.formState.errors;

                                console.log("[HeroSlideForm] Manual validation result:", { isValid, errors });

                                if (!isValid) {
                                    // Extract first error message for user-friendly toast
                                    const errorEntries = Object.entries(errors);
                                    if (errorEntries.length > 0) {
                                        const [field, error] = errorEntries[0];
                                        const message = (error as { message?: string })?.message || "Validation failed";
                                        toast.error(`${field}: ${message}`);
                                    } else {
                                        toast.error("Please fix validation errors");
                                    }
                                    return;
                                }

                                // If valid, proceed with submission
                                const data = form.getValues();
                                await onSubmit(data);
                            }}
                            className="space-y-4"
                        >
                            <HeroSlideFormFields form={form} />

                            <HeroSlideImageSection
                                form={form}
                                onOpenMediaPicker={() => setIsMediaPickerOpen(true)}
                            />

                            <HeroSlideCtaFields form={form} />

                            <HeroSlideActiveToggle form={form} />

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
