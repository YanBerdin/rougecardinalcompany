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
import { ImageFieldGroup } from "@/components/features/admin/media";
import type { HeroSlideFormValues, HeroSlideDTO } from "@/lib/schemas/home-content";
import { createHeroSlideAction, updateHeroSlideAction } from "@/app/(admin)/admin/home/hero/home-hero-actions";
import { HeroSlideFormFields, HeroSlideActiveToggle } from "./HeroSlideFormFields";
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
        isPending,
        setIsPending,
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

            toast.success(slide ? "Slide mis à jour" : "Slide créé avec succès");
            await onSuccess();
            form.reset();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Échec de l'enregistrement du slide");
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

    const dialogTitle = slide ? "Modifier le slide" : "Nouveau slide";
    const submitButtonLabel = isPending ? "Enregistrement..." : slide ? "Mettre à jour" : "Créer";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">{dialogTitle}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleValidatedSubmit} className="space-y-4 overflow-x-hidden">
                        <HeroSlideFormFields form={form} />

                        <ImageFieldGroup
                            form={form}
                            imageUrlField="image_url"
                            imageMediaIdField="image_media_id"
                            altTextField="alt_text"
                            label="Image"
                            required
                            showUpload={true}
                            uploadFolder="home-hero"
                        />

                        <CtaFieldGroup form={form} ctaType="primary" />
                        <CtaFieldGroup form={form} ctaType="secondary" />
                        <HeroSlideActiveToggle form={form} />

                        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose} 
                                disabled={isPending}
                                className="w-full sm:w-auto h-10 sm:h-9"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isPending}
                                className="w-full sm:w-auto h-10 sm:h-9"
                            >
                                {submitButtonLabel}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
