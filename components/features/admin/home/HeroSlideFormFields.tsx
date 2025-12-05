"use client";

import { UseFormReturn } from "react-hook-form";
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

interface HeroSlideFormFieldsProps {
    form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideFormFields({ form }: HeroSlideFormFieldsProps) {
    const watchSubtitle = form.watch("subtitle") ?? "";
    const watchDescription = form.watch("description") ?? "";

    return (
        <>
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
        </>
    );
}

interface HeroSlideCtaFieldsProps {
    form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideCtaFields({ form }: HeroSlideCtaFieldsProps) {
    const ctaPrimaryEnabled = form.watch("cta_primary_enabled");
    const ctaSecondaryEnabled = form.watch("cta_secondary_enabled");

    return (
        <div className="space-y-4">
            {/* ===== CTA PRIMAIRE ===== */}
            <div className="rounded-lg border p-4 space-y-4">
                <FormField
                    control={form.control}
                    name="cta_primary_enabled"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">CTA Primaire</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                    Bouton principal (style plein)
                                </div>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {ctaPrimaryEnabled && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/30">
                        <FormField
                            control={form.control}
                            name="cta_primary_label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label *</FormLabel>
                                    <FormControl>
                                        <Input {...field} maxLength={50} placeholder="Voir la programmation" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cta_primary_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="/spectacles ou https://..." />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Relative (/page) ou absolue (https://...)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </div>

            {/* ===== CTA SECONDAIRE ===== */}
            <div className="rounded-lg border p-4 space-y-4">
                <FormField
                    control={form.control}
                    name="cta_secondary_enabled"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">CTA Secondaire</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                    Bouton secondaire (style outline)
                                </div>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {ctaSecondaryEnabled && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted-foreground/30">
                        <FormField
                            control={form.control}
                            name="cta_secondary_label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label *</FormLabel>
                                    <FormControl>
                                        <Input {...field} maxLength={50} placeholder="Réserver des billets" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cta_secondary_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="/agenda ou https://..." />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Relative (/page) ou absolue (https://...)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
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
