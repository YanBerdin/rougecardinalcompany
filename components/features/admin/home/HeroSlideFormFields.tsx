"use client";

import type { UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { HeroSlideFormValues } from "@/lib/schemas/home-content";
import { HERO_SLIDE_LIMITS } from "@/lib/constants/hero-slides";

interface HeroSlideFormFieldsProps {
    form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideFormFields({ form }: HeroSlideFormFieldsProps) {
    const subtitleValue = form.watch("subtitle") ?? "";
    const descriptionValue = form.watch("description") ?? "";

    return (
        <>
            <TitleField form={form} />
            <SubtitleField form={form} characterCount={subtitleValue.length} />
            <DescriptionField form={form} characterCount={descriptionValue.length} />
        </>
    );
}

function TitleField({ form }: HeroSlideFormFieldsProps) {
    return (
        <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm sm:text-base">Titre *</FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            maxLength={HERO_SLIDE_LIMITS.TITLE_MAX_LENGTH}
                            placeholder="Titre principal"
                            className="h-10 sm:h-11 text-base"
                        />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                        {field.value.length}/{HERO_SLIDE_LIMITS.TITLE_MAX_LENGTH} caractères
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

interface FieldWithCountProps extends HeroSlideFormFieldsProps {
    characterCount: number;
}

function SubtitleField({ form, characterCount }: FieldWithCountProps) {
    return (
        <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm sm:text-base">Sous titre</FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            maxLength={HERO_SLIDE_LIMITS.SUBTITLE_MAX_LENGTH}
                            placeholder="Texte de soutien"
                            className="h-10 sm:h-11 text-base"
                        />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                        {characterCount}/{HERO_SLIDE_LIMITS.SUBTITLE_MAX_LENGTH} caractères
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

function DescriptionField({ form, characterCount }: FieldWithCountProps) {
    return (
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm sm:text-base">Description</FormLabel>
                    <FormControl>
                        <Textarea
                            {...field}
                            maxLength={HERO_SLIDE_LIMITS.DESCRIPTION_MAX_LENGTH}
                            rows={3}
                            className="text-base min-h-[80px] sm:min-h-[90px]"
                        />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                        {characterCount}/{HERO_SLIDE_LIMITS.DESCRIPTION_MAX_LENGTH} caractères
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

interface HeroSlideActiveToggleProps {
    form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideActiveToggle({ form }: HeroSlideActiveToggleProps) {
    return (
        <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-sm sm:text-base">Activer</FormLabel>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                            Afficher ce slide sur la page d&lsquo;accueil
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
