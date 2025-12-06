"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { HeroSlideFormValues, HeroSlideDTO } from "@/lib/schemas/home-content";
import { DEFAULT_FORM_VALUES } from "./useHeroSlideForm";

function mapSlideToFormValues(slide: HeroSlideDTO): HeroSlideFormValues {
    return {
        title: slide.title,
        slug: slide.slug,
        subtitle: slide.subtitle ?? "",
        description: slide.description ?? "",
        image_url: slide.image_url ?? "",
        image_media_id: slide.image_media_id !== null ? Number(slide.image_media_id) : undefined,
        alt_text: slide.alt_text,
        cta_primary_enabled: slide.cta_primary_enabled,
        cta_primary_label: slide.cta_primary_label ?? "",
        cta_primary_url: slide.cta_primary_url ?? "",
        cta_secondary_enabled: slide.cta_secondary_enabled,
        cta_secondary_label: slide.cta_secondary_label ?? "",
        cta_secondary_url: slide.cta_secondary_url ?? "",
        active: slide.active,
        position: slide.position,
    };
}

export function useHeroSlideFormSync(
    isDialogOpen: boolean,
    slideToEdit: HeroSlideDTO | null | undefined,
    form: UseFormReturn<HeroSlideFormValues>
): void {
    useEffect(() => {
        if (!isDialogOpen) return;

        const formValues = slideToEdit
            ? mapSlideToFormValues(slideToEdit)
            : DEFAULT_FORM_VALUES;

        form.reset(formValues);
    }, [isDialogOpen, slideToEdit, form]);
}
