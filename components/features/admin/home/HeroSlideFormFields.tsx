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
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            maxLength={HERO_SLIDE_LIMITS.TITLE_MAX_LENGTH}
                            placeholder="Main headline"
                        />
                    </FormControl>
                    <FormDescription>
                        {field.value.length}/{HERO_SLIDE_LIMITS.TITLE_MAX_LENGTH} characters
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
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            maxLength={HERO_SLIDE_LIMITS.SUBTITLE_MAX_LENGTH}
                            placeholder="Supporting text"
                        />
                    </FormControl>
                    <FormDescription>
                        {characterCount}/{HERO_SLIDE_LIMITS.SUBTITLE_MAX_LENGTH} characters
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea
                            {...field}
                            maxLength={HERO_SLIDE_LIMITS.DESCRIPTION_MAX_LENGTH}
                            rows={3}
                        />
                    </FormControl>
                    <FormDescription>
                        {characterCount}/{HERO_SLIDE_LIMITS.DESCRIPTION_MAX_LENGTH} characters
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
    );
}
