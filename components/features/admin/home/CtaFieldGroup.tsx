"use client";

import type { UseFormReturn } from "react-hook-form";
import type { HeroSlideFormValues } from "@/lib/schemas/home-content";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { HERO_SLIDE_LIMITS } from "@/lib/constants/hero-slides";

type CtaType = "primary" | "secondary";

interface CtaConfig {
    enabledFieldName: "cta_primary_enabled" | "cta_secondary_enabled";
    labelFieldName: "cta_primary_label" | "cta_secondary_label";
    urlFieldName: "cta_primary_url" | "cta_secondary_url";
    toggleTitle: string;
    toggleDescription: string;
    borderColorClass: string;
    labelPlaceholder: string;
    urlPlaceholder: string;
}

const CTA_CONFIGS: Record<CtaType, CtaConfig> = {
    primary: {
        enabledFieldName: "cta_primary_enabled",
        labelFieldName: "cta_primary_label",
        urlFieldName: "cta_primary_url",
        toggleTitle: "CTA Principal",
        toggleDescription: "Bouton principal (style plein)",
        borderColorClass: "border-primary/30",
        labelPlaceholder: "Voir la programmation",
        urlPlaceholder: "/spectacles ou https://...",
    },
    secondary: {
        enabledFieldName: "cta_secondary_enabled",
        labelFieldName: "cta_secondary_label",
        urlFieldName: "cta_secondary_url",
        toggleTitle: "CTA Secondaire",
        toggleDescription: "Bouton secondaire (style outline)",
        borderColorClass: "border-muted-foreground/30",
        labelPlaceholder: "Réserver des billets",
        urlPlaceholder: "/agenda ou https://...",
    },
};

interface CtaFieldGroupProps {
    form: UseFormReturn<HeroSlideFormValues>;
    ctaType: CtaType;
}

export function CtaFieldGroup({ form, ctaType }: CtaFieldGroupProps) {
    const config = CTA_CONFIGS[ctaType];
    const isCtaEnabled = form.watch(config.enabledFieldName);

    return (
        <div className="rounded-lg border p-4 space-y-4">
            <CtaToggleField form={form} config={config} />
            {isCtaEnabled && <CtaInputFields form={form} config={config} />}
        </div>
    );
}

interface CtaToggleFieldProps {
    form: UseFormReturn<HeroSlideFormValues>;
    config: CtaConfig;
}

function CtaToggleField({ form, config }: CtaToggleFieldProps) {
    return (
        <FormField
            control={form.control}
            name={config.enabledFieldName}
            render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">{config.toggleTitle}</FormLabel>
                        <div className="text-sm text-muted-foreground">
                            {config.toggleDescription}
                        </div>
                    </div>
                    <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                </FormItem>
            )}
        />
    );
}

interface CtaInputFieldsProps {
    form: UseFormReturn<HeroSlideFormValues>;
    config: CtaConfig;
}

function CtaInputFields({ form, config }: CtaInputFieldsProps) {
    return (
        <div className={`grid grid-cols-2 gap-4 pl-4 border-l-2 ${config.borderColorClass}`}>
            <FormField
                control={form.control}
                name={config.labelFieldName}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Label *</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                maxLength={HERO_SLIDE_LIMITS.CTA_LABEL_MAX_LENGTH}
                                placeholder={config.labelPlaceholder}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={config.urlFieldName}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>URL *</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder={config.urlPlaceholder} />
                        </FormControl>
                        <FormDescription className="text-xs">
                            Relative (/page) ou absolue (https://...)
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
