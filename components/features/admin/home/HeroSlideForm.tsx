"use client";

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
import type { HeroSlideFormValues, HeroSlideDTO } from "@/lib/schemas/home-content";
import { createHeroSlideAction, updateHeroSlideAction } from "@/app/(admin)/admin/home/hero/home-hero-actions";
import { HeroSlideFormFields, HeroSlideActiveToggle } from "./HeroSlideFormFields";
import { HeroSlideImageSection, handleMediaSelection } from "./HeroSlideImageSection";
import { CtaFieldGroup } from "./CtaFieldGroup";
import { useHeroSlideForm } from "@/lib/hooks/useHeroSlideForm";
import { useHeroSlideFormSync } from "@/lib/hooks/useHeroSlideFormSync";

interface HeroSlideFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    slide?: HeroSlideDTO | null;
}

export function HeroSlideForm({ open, onClose, onSuccess, slide }: HeroSlideFormProps) {
    const {
        form,
        isMediaPickerOpen,
        isPending,
        setIsPending,
        openMediaPicker,
        closeMediaPicker,
    } = useHeroSlideForm();

    useHeroSlideFormSync(open, slide, form);

    const handleFormSubmit = async (formData: HeroSlideFormValues) => {
        setIsPending(true);

        try {
            const payload = { ...formData } as unknown;
            const result = slide
                ? await updateHeroSlideAction(String(slide.id), payload)
                : await createHeroSlideAction(payload);

            if (!result.success) {
                throw new Error(result.error ?? "Save failed");
            }

            toast.success(slide ? "Slide updated successfully" : "Slide created successfully");
            await onSuccess();
            form.reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save slide");
        } finally {
            setIsPending(false);
        }
    };

    const handleValidatedSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const isFormValid = await form.trigger();
        if (!isFormValid) {
            showFirstValidationError();
            return;
        }

        await handleFormSubmit(form.getValues());
    };

    const showFirstValidationError = () => {
        const errorEntries = Object.entries(form.formState.errors);
        if (errorEntries.length > 0) {
            const [fieldName, fieldError] = errorEntries[0];
            const errorMessage = (fieldError as { message?: string })?.message ?? "Validation failed";
            toast.error(`${fieldName}: ${errorMessage}`);
        } else {
            toast.error("Please fix validation errors");
        }
    };

    const handleMediaSelect = (result: MediaSelectResult) => {
        handleMediaSelection(form, result);
        closeMediaPicker();
    };

    const dialogTitle = slide ? "Edit Hero Slide" : "Add Hero Slide";
    const submitButtonLabel = isPending ? "Saving..." : slide ? "Update" : "Create";

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={handleValidatedSubmit} className="space-y-4">
                            <HeroSlideFormFields form={form} />
                            <HeroSlideImageSection form={form} onOpenMediaPicker={openMediaPicker} />
                            <CtaFieldGroup form={form} ctaType="primary" />
                            <CtaFieldGroup form={form} ctaType="secondary" />
                            <HeroSlideActiveToggle form={form} />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {submitButtonLabel}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <MediaLibraryPicker
                open={isMediaPickerOpen}
                onClose={closeMediaPicker}
                onSelect={handleMediaSelect}
            />
        </>
    );
}
