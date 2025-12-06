"use client";

import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeroSlideFormSchema, type HeroSlideFormValues } from "@/lib/schemas/home-content";
import { HERO_SLIDE_DEFAULTS } from "@/lib/constants/hero-slides";

interface UseHeroSlideFormReturn {
    form: UseFormReturn<HeroSlideFormValues>;
    isMediaPickerOpen: boolean;
    isPending: boolean;
    setIsPending: (pending: boolean) => void;
    openMediaPicker: () => void;
    closeMediaPicker: () => void;
}

const DEFAULT_FORM_VALUES: HeroSlideFormValues = {
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    image_url: "",
    image_media_id: undefined,
    alt_text: "",
    cta_primary_enabled: HERO_SLIDE_DEFAULTS.CTA_PRIMARY_ENABLED,
    cta_primary_label: "",
    cta_primary_url: "",
    cta_secondary_enabled: HERO_SLIDE_DEFAULTS.CTA_SECONDARY_ENABLED,
    cta_secondary_label: "",
    cta_secondary_url: "",
    active: HERO_SLIDE_DEFAULTS.ACTIVE,
    position: undefined,
};

export function useHeroSlideForm(): UseHeroSlideFormReturn {
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const form = useForm<HeroSlideFormValues>({
        resolver: zodResolver(HeroSlideFormSchema),
        mode: "onTouched",
        defaultValues: DEFAULT_FORM_VALUES,
    });

    return {
        form,
        isMediaPickerOpen,
        isPending,
        setIsPending,
        openMediaPicker: () => setIsMediaPickerOpen(true),
        closeMediaPicker: () => setIsMediaPickerOpen(false),
    };
}

export { DEFAULT_FORM_VALUES };
